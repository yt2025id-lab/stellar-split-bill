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
    pub participants: Vec<Address>,
    pub shares: Vec<i128>,
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
            participants: participants.clone(),
            shares: shares.clone(),
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
            let old = bills.get(i).unwrap();
            if old.vault_id == vault_addr && !old.settled {
                let updated = BillInfo {
                    vault_id: old.vault_id,
                    creator: old.creator,
                    title: old.title,
                    total_xlm: old.total_xlm,
                    participant_count: old.participant_count,
                    deadline: old.deadline,
                    settled: true,
                    participants: old.participants,
                    shares: old.shares,
                };
                bills.set(i, updated);
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

    pub fn get_bills_for_user(env: Env, user: Address) -> Vec<BillInfo> {
        let all_bills: Vec<BillInfo> = env.storage().instance().get(&Symbol::new(&env, "bills")).unwrap_or(Vec::new(&env));
        let mut result = Vec::<BillInfo>::new(&env);
        for i in 0..all_bills.len() {
            let bill = all_bills.get(i).unwrap();
            let mut found = false;
            if bill.creator == user {
                found = true;
            } else {
                for j in 0..bill.participants.len() {
                    if bill.participants.get(j).unwrap() == user {
                        found = true;
                        break;
                    }
                }
            }
            if found {
                result.push_back(bill);
            }
        }
        result
    }

    pub fn get_bill_by_index(env: Env, index: u32) -> BillInfo {
        let bills: Vec<BillInfo> = env.storage().instance().get(&Symbol::new(&env, "bills")).unwrap_or(Vec::new(&env));
        if index >= bills.len() {
            panic!("Bill not found");
        }
        bills.get(index).unwrap()
    }

    pub fn get_bill_count(env: Env) -> u32 {
        env.storage().instance().get(&Symbol::new(&env, "count")).unwrap_or(0)
    }
}

mod test;
