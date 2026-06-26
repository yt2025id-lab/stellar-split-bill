#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, Address, Env, String, Symbol, Vec,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct BillInfo {
    pub vault_id: Address,
    pub creator: Address,
    pub title: String,
    pub total_xlm: i128,
    pub participant_count: u32,
    pub deadline: u64,
    pub settled: bool,
}

#[contract]
pub struct SplitBillFactory;

#[contractimpl]
impl SplitBillFactory {
    pub fn __constructor(env: Env) {
        env.storage().instance().set(&Symbol::new(&env, "bills"), &Vec::<BillInfo>::new(&env));
        env.storage().instance().set(&Symbol::new(&env, "count"), &0u32);
    }

    pub fn register_bill(
        env: Env,
        vault_id: Address,
        creator: Address,
        participants: Vec<Address>,
        shares: Vec<i128>,
        title: String,
    ) {
        creator.require_auth();

        let count: u32 = env.storage().instance().get(&Symbol::new(&env, "count")).unwrap_or(0);
        let mut total: i128 = 0;
        for i in 0..shares.len() {
            total += shares.get(i).unwrap();
        }

        let deadline = env.ledger().timestamp() + 7 * 24 * 60 * 60;
        let info = BillInfo {
            vault_id: vault_id.clone(),
            creator,
            title,
            total_xlm: total,
            participant_count: participants.len(),
            deadline,
            settled: false,
        };

        let mut bills: Vec<BillInfo> = env.storage().instance().get(&Symbol::new(&env, "bills")).unwrap_or(Vec::new(&env));
        bills.push_back(info);
        env.storage().instance().set(&Symbol::new(&env, "bills"), &bills);
        env.storage().instance().set(&Symbol::new(&env, "count"), &(count + 1));

        env.events().publish(
            (Symbol::new(&env, "bill_created"), Symbol::new(&env, "vault")),
            vault_id,
        );
    }

    pub fn settle_bill(env: Env, vault_addr: Address) {
        let mut bills: Vec<BillInfo> = env.storage().instance().get(&Symbol::new(&env, "bills")).unwrap_or(Vec::new(&env));
        for i in 0..bills.len() {
            let mut info = bills.get(i).unwrap();
            if info.vault_id == vault_addr {
                info.settled = true;
                bills.set(i, info);
                break;
            }
        }
        env.storage().instance().set(&Symbol::new(&env, "bills"), &bills);
        env.events().publish(
            (Symbol::new(&env, "bill_settled"), Symbol::new(&env, "vault")),
            vault_addr,
        );
    }

    pub fn get_bills(env: Env) -> Vec<BillInfo> {
        env.storage().instance().get(&Symbol::new(&env, "bills")).unwrap_or(Vec::new(&env))
    }

    pub fn get_bill_count(env: Env) -> u32 {
        env.storage().instance().get(&Symbol::new(&env, "count")).unwrap_or(0)
    }
}

mod test;
