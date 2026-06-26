#![cfg(test)]
use super::*;
use crate::SplitBillFactoryClient;
use soroban_sdk::{testutils::Address as _, Address, Env, String, Vec};

#[test]
fn test_create_and_list_bills() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SplitBillFactory, ());
    let client = SplitBillFactoryClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let participants = Vec::from_array(&env, [alice.clone(), bob.clone()]);
    let shares = Vec::from_array(&env, [100i128, 200i128]);
    let vault_id = Address::generate(&env);

    client.register_bill(
        &vault_id,
        &creator,
        &participants,
        &shares,
        &String::from_str(&env, "Dinner split"),
    );

    let count = client.get_bill_count();
    assert_eq!(count, 1);

    let bills = client.get_bills();
    assert_eq!(bills.len(), 1);
    assert_eq!(bills.get(0).unwrap().total_xlm, 300);
    assert_eq!(bills.get(0).unwrap().settled, false);
}

#[test]
fn test_settle_bill() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SplitBillFactory, ());
    let client = SplitBillFactoryClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let alice = Address::generate(&env);
    let participants = Vec::from_array(&env, [alice.clone()]);
    let shares = Vec::from_array(&env, [100i128]);
    let vault_id = Address::generate(&env);

    client.register_bill(&vault_id, &creator, &participants, &shares, &String::from_str(&env, "Test"));

    client.settle_bill(&vault_id);

    let bills = client.get_bills();
    assert_eq!(bills.get(0).unwrap().settled, true);
}
