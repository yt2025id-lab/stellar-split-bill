#![cfg_attr(not(test), no_std)]
use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, Symbol, Vec, String, symbol_short};

#[contracttype]
#[derive(Clone)]
pub struct Bill {
    pub id: u32,
    pub creator: Address,
    pub description: String,
    pub total_amount: i128,
    pub share_per_person: i128,
    pub payer_count: u32,
    pub paid_count: u32,
    pub completed: bool,
}

fn k(env: &Env, s: &str) -> Symbol { Symbol::new(env, s) }

#[contract]
pub struct SplitCore;

#[contractimpl]
impl SplitCore {
    pub fn initialize(env: Env, admin: Address, token_address: Address) {
        admin.require_auth();
        if env.storage().instance().has(&k(&env, "admin")) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&k(&env, "admin"), &admin);
        env.storage().instance().set(&k(&env, "token"), &token_address);
        let empty: Vec<Bill> = Vec::new(&env);
        env.storage().instance().set(&k(&env, "bills"), &empty);
    }

    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&k(&env, "admin")).unwrap()
    }

    pub fn token_addr(env: Env) -> Address {
        env.storage().instance().get(&k(&env, "token")).unwrap()
    }

    pub fn bill_count(env: Env) -> u32 {
        let bills: Vec<Bill> = env.storage().instance().get(&k(&env, "bills")).unwrap_or(Vec::new(&env));
        bills.len() as u32
    }

    pub fn create_bill(
        env: Env,
        creator: Address,
        description: String,
        total_amount: i128,
        payer_count: u32,
    ) -> u32 {
        creator.require_auth();
        if payer_count == 0 { panic!("Need at least 1 payer"); }
        if total_amount <= 0 { panic!("Amount must be positive"); }

        let mut bills: Vec<Bill> = env.storage().instance()
            .get(&k(&env, "bills")).unwrap_or(Vec::new(&env));
        let id = bills.len() as u32;
        let share = total_amount / (payer_count as i128);

        let bill = Bill {
            id,
            creator: creator.clone(),
            description,
            total_amount,
            share_per_person: share,
            payer_count,
            paid_count: 0,
            completed: false,
        };

        bills.push_back(bill);
        env.storage().instance().set(&k(&env, "bills"), &bills);

        id
    }

    // INTER-CONTRACT COMMUNICATION: burns payer's share tokens
    pub fn mark_paid(env: Env, payer: Address, bill_id: u32) {
        payer.require_auth();

        let mut bills: Vec<Bill> = env.storage().instance()
            .get(&k(&env, "bills")).unwrap_or(Vec::new(&env));

        if bill_id >= bills.len() as u32 { panic!("Bill not found"); }

        let mut bill = bills.get(bill_id).unwrap();
        if bill.completed { panic!("Bill already completed"); }

        let token_addr: Address = env.storage().instance().get(&k(&env, "token")).unwrap();

        let amount = bill.share_per_person;
        let pv = payer.to_val();

        use soroban_sdk::IntoVal;
        let av: soroban_sdk::Val = amount.into_val(&env);

        env.invoke_contract::<()>(
            &token_addr,
            &symbol_short!("burn"),
            soroban_sdk::vec![&env, pv, av],
        );

        bill.paid_count += 1;
        if bill.paid_count >= bill.payer_count {
            bill.completed = true;
        }

        bills.set(bill_id, bill);
        env.storage().instance().set(&k(&env, "bills"), &bills);
    }

    pub fn get_bill(env: Env, bill_id: u32) -> Bill {
        let bills: Vec<Bill> = env.storage().instance()
            .get(&k(&env, "bills")).unwrap_or(Vec::new(&env));
        if bill_id >= bills.len() as u32 { panic!("Bill not found"); }
        bills.get(bill_id).unwrap()
    }

    pub fn get_all_bills(env: Env) -> Vec<Bill> {
        env.storage().instance().get(&k(&env, "bills")).unwrap_or(Vec::new(&env))
    }
}

#[cfg(test)]
mod test;
