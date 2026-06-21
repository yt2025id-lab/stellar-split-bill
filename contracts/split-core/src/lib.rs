#![cfg_attr(not(test), no_std)]
use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, Symbol, Vec, String, Map, symbol_short};

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

const MAX_BILLS: u32 = 100;

fn k(env: &Env, s: &str) -> Symbol { Symbol::new(env, s) }

fn payers_storage_key(bill_id: u32) -> u32 { bill_id }
fn paid_storage_key(bill_id: u32) -> u32 { bill_id + MAX_BILLS }

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
        payers: Vec<Address>,
    ) -> u32 {
        creator.require_auth();
        if payer_count == 0 { panic!("Need at least 1 payer"); }
        if total_amount <= 0 { panic!("Amount must be positive"); }

        if total_amount % (payer_count as i128) != 0 {
            panic!("Amount must be evenly divisible by payer count");
        }

        if payers.len() != payer_count {
            panic!("Payer list length must match payer_count");
        }

        let mut bills: Vec<Bill> = env.storage().instance()
            .get(&k(&env, "bills")).unwrap_or(Vec::new(&env));

        if bills.len() as u32 >= MAX_BILLS {
            panic!("Maximum bills reached");
        }

        let id = bills.len() as u32;
        let share = total_amount / (payer_count as i128);

        // Store payer whitelist: Vec<Address>
        env.storage().instance().set(&payers_storage_key(id), &payers);

        // Initialize paid tracking: Vec<bool>
        let mut paid_tracker: Vec<bool> = Vec::new(&env);
        for _ in 0..payer_count {
            paid_tracker.push_back(false);
        }
        env.storage().instance().set(&paid_storage_key(id), &paid_tracker);

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

        env.events().publish(
            (symbol_short!("bill"), symbol_short!("created")),
            (id, creator, total_amount, payer_count),
        );

        id
    }

    pub fn mark_paid(env: Env, payer: Address, bill_id: u32) {
        payer.require_auth();

        let mut bills: Vec<Bill> = env.storage().instance()
            .get(&k(&env, "bills")).unwrap_or(Vec::new(&env));

        if bill_id >= bills.len() as u32 { panic!("Bill not found"); }

        let mut bill = bills.get(bill_id).unwrap();
        if bill.completed { panic!("Bill already completed"); }

        // Find payer index in whitelist
        let payers: Vec<Address> = env.storage().instance()
            .get(&payers_storage_key(bill_id))
            .unwrap_or(Vec::new(&env));

        let mut payer_index: Option<u32> = None;
        for i in 0..payers.len() as u32 {
            if payers.get(i).unwrap() == payer {
                payer_index = Some(i);
                break;
            }
        }
        if payer_index.is_none() {
            panic!("Payer not authorized for this bill");
        }

        // Check not already paid
        let mut paid_tracker: Vec<bool> = env.storage().instance()
            .get(&paid_storage_key(bill_id))
            .unwrap_or(Vec::new(&env));

        let idx = payer_index.unwrap() as u32;
        if paid_tracker.get(idx).unwrap_or(false) {
            panic!("Already marked as paid");
        }

        // INTER-CONTRACT: burn payer's share tokens
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

        // State update after external call
        paid_tracker.set(idx, true);
        env.storage().instance().set(&paid_storage_key(bill_id), &paid_tracker);

        bill.paid_count += 1;
        let done = bill.paid_count >= bill.payer_count;
        bill.completed = done;
        bills.set(bill_id, bill);
        env.storage().instance().set(&k(&env, "bills"), &bills);

        let ev = if done { symbol_short!("completed") } else { symbol_short!("paid") };
        env.events().publish((symbol_short!("bill"), ev), (bill_id, payer));
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

    pub fn has_paid(env: Env, bill_id: u32, payer: Address) -> bool {
        let payers: Vec<Address> = env.storage().instance()
            .get(&payers_storage_key(bill_id))
            .unwrap_or(Vec::new(&env));
        let paid_tracker: Vec<bool> = env.storage().instance()
            .get(&paid_storage_key(bill_id))
            .unwrap_or(Vec::new(&env));

        for i in 0..payers.len() as u32 {
            if payers.get(i).unwrap() == payer {
                return paid_tracker.get(i).unwrap_or(false);
            }
        }
        false
    }
}

#[cfg(test)]
mod test;
