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
    let b = bills.get(0).unwrap();
    assert_eq!(b.total_xlm, 300);
    assert_eq!(b.settled, false);
    assert_eq!(b.participants.len(), 2);
    assert_eq!(b.participants.get(0).unwrap(), alice);
    assert_eq!(b.shares.get(1).unwrap(), 200);
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

#[test]
fn test_get_bills_for_user() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SplitBillFactory, ());
    let client = SplitBillFactoryClient::new(&env, &contract_id);

    let creator_a = Address::generate(&env);
    let creator_b = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let stranger = Address::generate(&env);

    // Bill 1: creator_a + alice
    let vault_1 = Address::generate(&env);
    let parts_1 = Vec::from_array(&env, [alice.clone()]);
    let shares_1 = Vec::from_array(&env, [100i128]);
    client.register_bill(&vault_1, &creator_a, &parts_1, &shares_1, &String::from_str(&env, "Bill A"));

    // Bill 2: creator_b + bob + alice
    let vault_2 = Address::generate(&env);
    let parts_2 = Vec::from_array(&env, [bob.clone(), alice.clone()]);
    let shares_2 = Vec::from_array(&env, [50i128, 50i128]);
    client.register_bill(&vault_2, &creator_b, &parts_2, &shares_2, &String::from_str(&env, "Bill B"));

    // alice is creator of none, participant in both → should see 2 bills
    let alice_bills = client.get_bills_for_user(&alice);
    assert_eq!(alice_bills.len(), 2);

    // creator_a should only see Bill A
    let creator_a_bills = client.get_bills_for_user(&creator_a);
    assert_eq!(creator_a_bills.len(), 1);
    assert_eq!(creator_a_bills.get(0).unwrap().title, String::from_str(&env, "Bill A"));

    // stranger should see nothing
    let stranger_bills = client.get_bills_for_user(&stranger);
    assert_eq!(stranger_bills.len(), 0);
}

#[test]
fn test_get_bill_by_index() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SplitBillFactory, ());
    let client = SplitBillFactoryClient::new(&env, &contract_id);

    let creator = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);

    let vault_1 = Address::generate(&env);
    let parts_1 = Vec::from_array(&env, [alice.clone()]);
    let shares_1 = Vec::from_array(&env, [100i128]);
    client.register_bill(&vault_1, &creator, &parts_1, &shares_1, &String::from_str(&env, "First"));

    let vault_2 = Address::generate(&env);
    let parts_2 = Vec::from_array(&env, [bob.clone()]);
    let shares_2 = Vec::from_array(&env, [200i128]);
    client.register_bill(&vault_2, &creator, &parts_2, &shares_2, &String::from_str(&env, "Second"));

    let b0 = client.get_bill_by_index(&0);
    assert_eq!(b0.title, String::from_str(&env, "First"));

    let b1 = client.get_bill_by_index(&1);
    assert_eq!(b1.title, String::from_str(&env, "Second"));
}

#[test]
#[should_panic(expected = "Bill not found")]
fn test_get_bill_by_index_out_of_range() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(SplitBillFactory, ());
    let client = SplitBillFactoryClient::new(&env, &contract_id);

    client.get_bill_by_index(&5);
}
