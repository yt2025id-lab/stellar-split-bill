#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, token, Address, Env, IntoVal, String, Symbol, Vec, Val,
};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Contribution {
    pub participant: Address,
    pub amount: i128,
}

#[derive(Clone, Debug, Eq, PartialEq)]
#[contracttype]
pub enum VaultStatus {
    Pending,
    Settled,
    Expired,
}

#[contract]
pub struct BillVault;

#[contractimpl]
impl BillVault {
    pub fn __constructor(env: Env) {
        env.storage().instance().set(&Symbol::new(&env, "contributions"), &Vec::<Contribution>::new(&env));
    }

    pub fn init(
        env: Env,
        factory: Address,
        creator: Address,
        participants: Vec<Address>,
        shares: Vec<i128>,
        title: String,
        total_xlm: i128,
        native_token: Address,
    ) {
        let inited: bool = env.storage().instance().get(&Symbol::new(&env, "__inited")).unwrap_or(false);
        if inited { panic!("Vault already initialized"); }
        env.storage().instance().set(&Symbol::new(&env, "__inited"), &true);

        env.storage().instance().set(&Symbol::new(&env, "factory"), &factory);
        env.storage().instance().set(&Symbol::new(&env, "creator"), &creator);
        env.storage().instance().set(&Symbol::new(&env, "title"), &title);
        env.storage().instance().set(&Symbol::new(&env, "total_xlm"), &total_xlm);
        env.storage().instance().set(&Symbol::new(&env, "settled"), &false);
        env.storage().instance().set(&Symbol::new(&env, "participants"), &participants);
        env.storage().instance().set(&Symbol::new(&env, "shares"), &shares);
        env.storage().instance().set(&Symbol::new(&env, "contributions"), &Vec::<Contribution>::new(&env));
        env.storage().instance().set(&Symbol::new(&env, "deadline"), &(env.ledger().timestamp() + 7 * 24 * 60 * 60));
        env.storage().instance().set(&Symbol::new(&env, "withdrawn"), &false);
        env.storage().instance().set(&Symbol::new(&env, "native_token"), &native_token);
    }

    pub fn contribute(env: Env, participant: Address) {
        participant.require_auth();

        let settled: bool = env.storage().instance().get(&Symbol::new(&env, "settled")).unwrap_or(false);
        if settled { panic!("Bill already settled"); }

        let deadline: u64 = env.storage().instance().get(&Symbol::new(&env, "deadline")).unwrap_or(0);
        if env.ledger().timestamp() > deadline { panic!("Deadline passed"); }

        let participants: Vec<Address> = env.storage().instance().get(&Symbol::new(&env, "participants")).unwrap_or(Vec::new(&env));
        let shares: Vec<i128> = env.storage().instance().get(&Symbol::new(&env, "shares")).unwrap_or(Vec::new(&env));
        let mut contributions: Vec<Contribution> = env.storage().instance().get(&Symbol::new(&env, "contributions")).unwrap_or(Vec::new(&env));

        let mut idx: u32 = participants.len();
        for i in 0..participants.len() {
            if participants.get(i).unwrap() == participant { idx = i; break; }
        }
        if idx >= participants.len() { panic!("Not a participant"); }

        for i in 0..contributions.len() {
            if contributions.get(i).unwrap().participant == participant { panic!("Already contributed"); }
        }

        let amount = shares.get(idx).unwrap();

        // Transfer native XLM from participant to vault contract
        let native: Address = env.storage().instance().get(&Symbol::new(&env, "native_token")).unwrap();
        let token_client = token::Client::new(&env, &native);
        token_client.transfer(&participant, &env.current_contract_address(), &amount);

        contributions.push_back(Contribution { participant: participant.clone(), amount });
        env.storage().instance().set(&Symbol::new(&env, "contributions"), &contributions);

        env.events().publish(
            (Symbol::new(&env, "contribution"), Symbol::new(&env, "received")),
            (participant.clone(), amount),
        );

        let total: i128 = env.storage().instance().get(&Symbol::new(&env, "total_xlm")).unwrap_or(0);
        let mut collected: i128 = 0;
        for i in 0..contributions.len() {
            collected += contributions.get(i).unwrap().amount;
        }

        if collected >= total && collected > 0 {
            let creator: Address = env.storage().instance().get(&Symbol::new(&env, "creator")).unwrap();
            let factory = env.storage().instance().get::<Symbol, Address>(&Symbol::new(&env, "factory")).unwrap();
            env.storage().instance().set(&Symbol::new(&env, "settled"), &true);

            // Cross-contract call: vault → factory
            let args: Vec<Val> = (env.current_contract_address(),).into_val(&env);
            env.invoke_contract::<Val>(
                &factory,
                &Symbol::new(&env, "settle_bill"),
                args,
            );

            env.events().publish(
                (Symbol::new(&env, "bill_settled"), Symbol::new(&env, "done")),
                (creator, total),
            );
        }
    }

    pub fn refund(env: Env, participant: Address) {
        participant.require_auth();

        let deadline: u64 = env.storage().instance().get(&Symbol::new(&env, "deadline")).unwrap_or(0);
        if env.ledger().timestamp() <= deadline { panic!("Deadline not passed"); }

        let settled: bool = env.storage().instance().get(&Symbol::new(&env, "settled")).unwrap_or(false);
        if settled { panic!("Already settled"); }

        let contributions: Vec<Contribution> = env.storage().instance().get(&Symbol::new(&env, "contributions")).unwrap_or(Vec::new(&env));
        let mut refund_amount: i128 = 0;
        let mut remaining = Vec::<Contribution>::new(&env);

        for i in 0..contributions.len() {
            let c = contributions.get(i).unwrap();
            if c.participant == participant { refund_amount = c.amount; }
            else { remaining.push_back(c); }
        }

        if refund_amount == 0 { panic!("No contribution found"); }

        // Refund the XLM back to the participant
        let native: Address = env.storage().instance().get(&Symbol::new(&env, "native_token")).unwrap();
        let token_client = token::Client::new(&env, &native);
        token_client.transfer(&env.current_contract_address(), &participant, &refund_amount);

        env.storage().instance().set(&Symbol::new(&env, "contributions"), &remaining);

        env.events().publish(
            (Symbol::new(&env, "refund"), Symbol::new(&env, "issued")),
            (participant, refund_amount),
        );
    }

    pub fn withdraw(env: Env, creator: Address) {
        creator.require_auth();
        let stored_creator: Address = env.storage().instance().get(&Symbol::new(&env, "creator")).unwrap();
        if creator != stored_creator { panic!("Only creator can withdraw"); }
        let settled: bool = env.storage().instance().get(&Symbol::new(&env, "settled")).unwrap_or(false);
        if !settled { panic!("Bill not yet settled"); }
        let withdrawn: bool = env.storage().instance().get(&Symbol::new(&env, "withdrawn")).unwrap_or(false);
        if withdrawn { panic!("Already withdrawn"); }
        env.storage().instance().set(&Symbol::new(&env, "withdrawn"), &true);
        let total: i128 = env.storage().instance().get(&Symbol::new(&env, "total_xlm")).unwrap_or(0);

        // Transfer all XLM from vault to creator
        let native: Address = env.storage().instance().get(&Symbol::new(&env, "native_token")).unwrap();
        let token_client = token::Client::new(&env, &native);
        token_client.transfer(&env.current_contract_address(), &creator, &total);

        env.events().publish(
            (Symbol::new(&env, "withdrawal"), Symbol::new(&env, "claimed")),
            (creator, total),
        );
    }

    pub fn get_status(env: Env) -> VaultStatus {
        let settled: bool = env.storage().instance().get(&Symbol::new(&env, "settled")).unwrap_or(false);
        if settled { return VaultStatus::Settled; }
        let deadline: u64 = env.storage().instance().get(&Symbol::new(&env, "deadline")).unwrap_or(0);
        if env.ledger().timestamp() > deadline { return VaultStatus::Expired; }
        VaultStatus::Pending
    }

    pub fn get_contributions(env: Env) -> Vec<Contribution> {
        env.storage().instance().get(&Symbol::new(&env, "contributions")).unwrap_or(Vec::new(&env))
    }

    pub fn get_details(env: Env) -> (Address, Address, String, i128, u64, Vec<Address>, Vec<i128>, bool) {
        let factory: Address = env.storage().instance().get(&Symbol::new(&env, "factory")).unwrap();
        let creator: Address = env.storage().instance().get(&Symbol::new(&env, "creator")).unwrap();
        let title: String = env.storage().instance().get(&Symbol::new(&env, "title")).unwrap();
        let total: i128 = env.storage().instance().get(&Symbol::new(&env, "total_xlm")).unwrap_or(0);
        let deadline: u64 = env.storage().instance().get(&Symbol::new(&env, "deadline")).unwrap_or(0);
        let participants: Vec<Address> = env.storage().instance().get(&Symbol::new(&env, "participants")).unwrap_or(Vec::new(&env));
        let shares: Vec<i128> = env.storage().instance().get(&Symbol::new(&env, "shares")).unwrap_or(Vec::new(&env));
        let withdrawn: bool = env.storage().instance().get(&Symbol::new(&env, "withdrawn")).unwrap_or(false);
        (factory, creator, title, total, deadline, participants, shares, withdrawn)
    }
}

mod test;
