#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env, String, Vec};

fn deploy_token(env: &Env, admin: &Address) -> Address {
    let contract_id = env.register(split_token::SplitToken, ());
    let token = split_token::SplitTokenClient::new(env, &contract_id);
    token.initialize(admin, &String::from_str(env, "Split"), &String::from_str(env, "SPLIT"), &1_000_000i128);
    contract_id
}

fn deploy_core(env: &Env, admin: &Address, token: &Address) -> Address {
    let contract_id = env.register(SplitCore, ());
    let core = SplitCoreClient::new(env, &contract_id);
    core.initialize(admin, token);
    contract_id
}

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let token = deploy_token(&env, &admin);
    let core_id = deploy_core(&env, &admin, &token);
    let core = SplitCoreClient::new(&env, &core_id);
    assert_eq!(core.admin(), admin);
    assert_eq!(core.bill_count(), 0u32);
}

#[test]
fn test_create_bill() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let token = deploy_token(&env, &admin);
    let core_id = deploy_core(&env, &admin, &token);
    let core = SplitCoreClient::new(&env, &core_id);

    let mut payers = Vec::new(&env);
    payers.push_back(alice.clone());
    payers.push_back(bob.clone());

    let bill_id = core.create_bill(
        &admin,
        &String::from_str(&env, "Pizza Party"),
        &1000i128,
        &2u32,
        &payers,
    );
    assert_eq!(bill_id, 0u32);

    let bill = core.get_bill(&0u32);
    assert_eq!(bill.share_per_person, 500i128);
    assert_eq!(bill.payer_count, 2u32);
    assert!(!bill.completed);
}

#[test]
fn test_uneven_split_rejected() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let token = deploy_token(&env, &admin);
    let core_id = deploy_core(&env, &admin, &token);
    let core = SplitCoreClient::new(&env, &core_id);

    let mut payers = Vec::new(&env);
    payers.push_back(alice.clone());

    let r = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        core.create_bill(&admin, &String::from_str(&env, "Bad"), &100i128, &3u32, &payers);
    }));
    // Should fail because payer list length (1) != payer_count (3)
    assert!(r.is_err());
}

#[test]
fn test_mark_paid_and_complete() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let token = deploy_token(&env, &admin);
    let core_id = deploy_core(&env, &admin, &token);
    let core = SplitCoreClient::new(&env, &core_id);
    let token_client = split_token::SplitTokenClient::new(&env, &token);

    let mut payers = Vec::new(&env);
    payers.push_back(alice.clone());

    core.create_bill(&admin, &String::from_str(&env, "Coffee"), &500i128, &1u32, &payers);

    // Mint tokens to alice (share = 500)
    token_client.mint(&admin, &alice, &500i128);
    assert_eq!(token_client.balance(&alice), 500i128);

    // Alice marks paid → burns her 500 tokens
    env.cost_estimate().budget().reset_unlimited();
    core.mark_paid(&alice, &0u32);
    assert_eq!(token_client.balance(&alice), 0i128);

    let bill = core.get_bill(&0u32);
    assert_eq!(bill.paid_count, 1u32);
    assert!(bill.completed); // Only 1 payer, so it's done
}

#[test]
fn test_inter_contract_burn() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let bob = Address::generate(&env);
    let token = deploy_token(&env, &admin);
    let core_id = deploy_core(&env, &admin, &token);
    let core = SplitCoreClient::new(&env, &core_id);
    let token_client = split_token::SplitTokenClient::new(&env, &token);

    let mut payers = Vec::new(&env);
    payers.push_back(bob.clone());
    payers.push_back(admin.clone());

    core.create_bill(&admin, &String::from_str(&env, "Lunch"), &600i128, &2u32, &payers);
    token_client.mint(&admin, &bob, &600i128);

    env.cost_estimate().budget().reset_unlimited();
    core.mark_paid(&bob, &0u32);

    // After marking paid, bob's tokens decreased by share (300)
    assert_eq!(token_client.balance(&bob), 300i128);
}

#[test]
fn test_unauthorized_payer_rejected() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let charlie = Address::generate(&env);
    let token = deploy_token(&env, &admin);
    let core_id = deploy_core(&env, &admin, &token);
    let core = SplitCoreClient::new(&env, &core_id);
    let token_client = split_token::SplitTokenClient::new(&env, &token);

    let mut payers = Vec::new(&env);
    payers.push_back(alice.clone());

    core.create_bill(&admin, &String::from_str(&env, "Private"), &400i128, &1u32, &payers);

    // Charlie has tokens but is NOT in the payer list
    token_client.mint(&admin, &charlie, &400i128);

    env.cost_estimate().budget().reset_unlimited();
    let r = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        core.mark_paid(&charlie, &0u32);
    }));
    assert!(r.is_err());
}

#[test]
fn test_double_payment_rejected() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let token = deploy_token(&env, &admin);
    let core_id = deploy_core(&env, &admin, &token);
    let core = SplitCoreClient::new(&env, &core_id);
    let token_client = split_token::SplitTokenClient::new(&env, &token);

    let mut payers = Vec::new(&env);
    payers.push_back(alice.clone());

    core.create_bill(&admin, &String::from_str(&env, "Double"), &500i128, &1u32, &payers);
    token_client.mint(&admin, &alice, &1000i128);

    env.cost_estimate().budget().reset_unlimited();
    core.mark_paid(&alice, &0u32); // First: OK

    // Second attempt should fail (bill already completed)
    let r = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        core.mark_paid(&alice, &0u32);
    }));
    assert!(r.is_err());
}
