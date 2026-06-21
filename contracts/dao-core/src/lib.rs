#![cfg_attr(not(test), no_std)]
use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, Symbol, Vec, symbol_short};

#[contracttype]
#[derive(Clone)]
pub struct Proposal {
    pub id: u32,
    pub proposer: Address,
    pub title: Symbol,
    pub yes_votes: i128,
    pub no_votes: i128,
    pub abtain_votes: i128,
    pub end_time: u64,
    pub executed: bool,
}

const VOTING_PERIOD: u64 = 3600;
const QUORUM_PCT: i128 = 10;
const MAJORITY_PCT: i128 = 51;

#[contract]
pub struct DaoCore;

fn key(env: &Env, name: &str) -> Symbol { Symbol::new(env, name) }

#[contractimpl]
impl DaoCore {
    pub fn initialize(env: Env, admin: Address, token_address: Address) {
        admin.require_auth();
        if env.storage().instance().has(&key(&env, "admin")) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&key(&env, "admin"), &admin);
        env.storage().instance().set(&key(&env, "token"), &token_address);
        env.storage().instance().set(&key(&env, "count"), &0u32);
    }

    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&key(&env, "admin")).unwrap()
    }

    pub fn token_addr(env: Env) -> Address {
        env.storage().instance().get(&key(&env, "token")).unwrap()
    }

    pub fn proposal_count(env: Env) -> u32 {
        env.storage().instance().get(&key(&env, "count")).unwrap_or(0)
    }

    pub fn voting_period(_env: Env) -> u64 { VOTING_PERIOD }

    pub fn create_proposal(
        env: Env,
        proposer: Address,
        title: Symbol,
    ) -> u32 {
        proposer.require_auth();
        let token_addr: Address = env.storage().instance().get(&key(&env, "token")).unwrap();
        let balance = Self::vp_of(&env, &token_addr, &proposer);
        if balance <= 0 { panic!("Must hold tokens"); }

        let count: u32 = env.storage().instance().get(&key(&env, "count")).unwrap_or(0);
        let id = count;

        let proposal = Proposal {
            id, proposer: proposer.clone(), title,
            yes_votes: 0, no_votes: 0, abtain_votes: 0,
            end_time: env.ledger().timestamp().saturating_add(VOTING_PERIOD),
            executed: false,
        };

        env.storage().instance().set(&id, &proposal);
        env.storage().instance().set(&key(&env, "count"), &(count + 1));
        id
    }

    pub fn cast_vote(env: Env, voter: Address, proposal_id: u32, support: u32) -> i128 {
        voter.require_auth();

        let mut proposal: Proposal = env.storage().instance()
            .get(&proposal_id).unwrap_or_else(|| panic!("Not found"));

        if proposal.executed { panic!("Executed"); }
        if env.ledger().timestamp() > proposal.end_time { panic!("Ended"); }

        let token_addr: Address = env.storage().instance().get(&key(&env, "token")).unwrap();
        let vp = Self::vp_of(&env, &token_addr, &voter);
        if vp <= 0 { panic!("No voting power"); }

        match support {
            0 => proposal.yes_votes += vp,
            1 => proposal.no_votes += vp,
            2 => proposal.abtain_votes += vp,
            _ => panic!("Invalid vote"),
        }

        env.storage().instance().set(&proposal_id, &proposal);
        vp
    }

    pub fn execute_proposal(env: Env, executor: Address, proposal_id: u32) {
        executor.require_auth();

        let mut proposal: Proposal = env.storage().instance()
            .get(&proposal_id).unwrap_or_else(|| panic!("Not found"));

        if proposal.executed { panic!("Executed"); }
        if env.ledger().timestamp() <= proposal.end_time { panic!("Still active"); }

        let total = proposal.yes_votes + proposal.no_votes + proposal.abtain_votes;
        let token_addr: Address = env.storage().instance().get(&key(&env, "token")).unwrap();
        let supply = Self::total_supply_of(&env, &token_addr);

        if total <= 0 || total * 100 < supply * QUORUM_PCT { panic!("No quorum"); }
        if proposal.yes_votes * 100 < total * MAJORITY_PCT { panic!("Did not pass"); }

        proposal.executed = true;
        env.storage().instance().set(&proposal_id, &proposal);
    }

    pub fn get_proposal(env: Env, proposal_id: u32) -> Proposal {
        env.storage().instance().get(&proposal_id).unwrap_or_else(|| panic!("Not found"))
    }

    pub fn get_all(env: Env) -> Vec<Proposal> {
        let count: u32 = env.storage().instance().get(&key(&env, "count")).unwrap_or(0);
        let mut out = Vec::new(&env);
        for i in 0..count {
            if let Some(p) = env.storage().instance().get(&i) { out.push_back(p); }
        }
        out
    }

    pub fn vp_of(env: &Env, token: &Address, voter: &Address) -> i128 {
        let v = voter.to_val();
        env.invoke_contract::<i128>(token, &symbol_short!("balance"), soroban_sdk::vec![env, v])
    }

    pub fn total_supply_of(env: &Env, token: &Address) -> i128 {
        env.invoke_contract::<i128>(token, &symbol_short!("total_spl"), soroban_sdk::vec![env])
    }
}

#[cfg(test)]
mod test;
