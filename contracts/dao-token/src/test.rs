#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env, String};

fn deploy_token(env: &Env) -> (Address, Address) {
    let admin = Address::generate(env);
    let contract_id = env.register(DaoToken, ());
    let token = DaoTokenClient::new(env, &contract_id);
    token.initialize(
        &admin,
        &String::from_str(env, "DAO Governance Token"),
        &String::from_str(env, "DAO"),
        &1_000_000i128,
    );
    (admin, contract_id)
}

#[test]
fn test_initialize() {
    let env = Env::default();
    env.mock_all_auths();
    let (admin, contract_id) = deploy_token(&env);
    let token = DaoTokenClient::new(&env, &contract_id);

    assert_eq!(token.admin(), admin);
    assert_eq!(token.name(), String::from_str(&env, "DAO Governance Token"));
    assert_eq!(token.symbol(), String::from_str(&env, "DAO"));
    assert_eq!(token.decimals(), 7u32);
    assert_eq!(token.total_supply(), 1_000_000i128 * 10i128.pow(7));
    assert_eq!(token.balance(&admin), 1_000_000i128 * 10i128.pow(7));
}

#[test]
fn test_transfer() {
    let env = Env::default();
    env.mock_all_auths();
    let (admin, contract_id) = deploy_token(&env);
    let token = DaoTokenClient::new(&env, &contract_id);

    let alice = Address::generate(&env);
    let amount: i128 = 5000 * 10i128.pow(7);

    token.transfer(&admin, &alice, &amount);

    let expected = 1_000_000i128 * 10i128.pow(7) - amount;
    assert_eq!(token.balance(&admin), expected);
    assert_eq!(token.balance(&alice), amount);
}

#[test]
fn test_transfer_insufficient_balance() {
    let env = Env::default();
    env.mock_all_auths();
    let (admin, contract_id) = deploy_token(&env);
    let token = DaoTokenClient::new(&env, &contract_id);

    let alice = Address::generate(&env);
    let amount: i128 = 2_000_000 * 10i128.pow(7);

    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        token.transfer(&admin, &alice, &amount);
    }));
    assert!(result.is_err());
}

#[test]
fn test_mint() {
    let env = Env::default();
    env.mock_all_auths();
    let (admin, contract_id) = deploy_token(&env);
    let token = DaoTokenClient::new(&env, &contract_id);

    let bob = Address::generate(&env);
    let mint_amount: i128 = 100_000 * 10i128.pow(7);

    token.mint(&admin, &bob, &mint_amount);

    assert_eq!(
        token.total_supply(),
        1_000_000i128 * 10i128.pow(7) + mint_amount
    );
    assert_eq!(token.balance(&bob), mint_amount);
}

#[test]
fn test_burn() {
    let env = Env::default();
    env.mock_all_auths();
    let (admin, contract_id) = deploy_token(&env);
    let token = DaoTokenClient::new(&env, &contract_id);

    let burn_amount: i128 = 50_000 * 10i128.pow(7);
    token.burn(&admin, &burn_amount);

    assert_eq!(
        token.total_supply(),
        1_000_000i128 * 10i128.pow(7) - burn_amount
    );
    assert_eq!(
        token.balance(&admin),
        1_000_000i128 * 10i128.pow(7) - burn_amount
    );
}
