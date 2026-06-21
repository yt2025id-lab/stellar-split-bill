#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env, String};

fn deploy(env: &Env) -> (Address, Address) {
    let admin = Address::generate(env);
    let contract_id = env.register(SplitToken, ());
    let token = SplitTokenClient::new(env, &contract_id);
    token.initialize(&admin, &String::from_str(env, "Split Token"), &String::from_str(env, "SPLIT"), &1_000_000i128);
    (admin, contract_id)
}

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();
    let (admin, cid) = deploy(&env);
    let token = SplitTokenClient::new(&env, &cid);
    assert_eq!(token.admin(), admin);
    assert_eq!(token.symbol(), String::from_str(&env, "SPLIT"));
    assert!(token.total_supply() > 0);
}

#[test]
fn test_transfer() {
    let env = Env::default();
    env.mock_all_auths();
    let (admin, cid) = deploy(&env);
    let token = SplitTokenClient::new(&env, &cid);
    let alice = Address::generate(&env);
    let amt: i128 = 100 * 10i128.pow(7);
    token.transfer(&admin, &alice, &amt);
    assert!(token.balance(&alice) > 0);
}

#[test]
fn test_mint() {
    let env = Env::default();
    env.mock_all_auths();
    let (admin, cid) = deploy(&env);
    let token = SplitTokenClient::new(&env, &cid);
    let bob = Address::generate(&env);
    token.mint(&admin, &bob, &(50 * 10i128.pow(7)));
    assert!(token.balance(&bob) > 0);
}

#[test]
fn test_burn() {
    let env = Env::default();
    env.mock_all_auths();
    let (admin, cid) = deploy(&env);
    let token = SplitTokenClient::new(&env, &cid);
    let before = token.balance(&admin);
    token.burn(&admin, &(100 * 10i128.pow(7)));
    assert!(token.balance(&admin) < before);
}

#[test]
fn test_transfer_zero_rejected() {
    let env = Env::default();
    env.mock_all_auths();
    let (admin, cid) = deploy(&env);
    let token = SplitTokenClient::new(&env, &cid);
    let alice = Address::generate(&env);
    let r = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        token.transfer(&admin, &alice, &0i128);
    }));
    assert!(r.is_err());
}
