#![cfg(test)]

use super::*;
use soroban_sdk::testutils::Address as _;
use soroban_sdk::{Address, Env, Symbol, String};

fn deploy_token(env: &Env, admin: &Address) -> Address {
    let contract_id = env.register(dao_token::DaoToken, ());
    let token = dao_token::DaoTokenClient::new(env, &contract_id);
    token.initialize(
        admin,
        &String::from_str(env, "DAO"),
        &String::from_str(env, "DAO"),
        &1_000_000i128,
    );
    contract_id
}

#[test]
fn test_initialize_dao() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let token = deploy_token(&env, &admin);
    let contract_id = env.register(DaoCore, ());
    let dao = DaoCoreClient::new(&env, &contract_id);
    dao.initialize(&admin, &token);

    assert_eq!(dao.admin(), admin);
    assert_eq!(dao.token_addr(), token);
    assert_eq!(dao.proposal_count(), 0u32);
}

#[test]
fn test_create_proposal_and_vote() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let token = deploy_token(&env, &admin);
    let contract_id = env.register(DaoCore, ());
    let dao = DaoCoreClient::new(&env, &contract_id);
    dao.initialize(&admin, &token);

    let pid = dao.create_proposal(&admin, &Symbol::new(&env, "BuyCoffee"));
    assert_eq!(pid, 0u32);

    let prop = dao.get_proposal(&0u32);
    assert_eq!(prop.yes_votes, 0i128);
    assert!(!prop.executed);

    env.cost_estimate().budget().reset_unlimited();
    let vp = dao.cast_vote(&admin, &0u32, &0u32);
    assert!(vp > 0);
}

#[test]
fn test_inter_contract_voting_power() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);

    let token_addr = deploy_token(&env, &admin);
    let token = dao_token::DaoTokenClient::new(&env, &token_addr);

    let amount: i128 = 100 * 10i128.pow(7);
    token.transfer(&admin, &alice, &amount);

    let contract_id = env.register(DaoCore, ());
    let dao = DaoCoreClient::new(&env, &contract_id);
    dao.initialize(&admin, &token_addr);

    let vp = dao.vp_of(&token_addr, &alice);
    assert_eq!(vp, amount);
}

#[test]
fn test_get_all_proposals() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let token = deploy_token(&env, &admin);
    let contract_id = env.register(DaoCore, ());
    let dao = DaoCoreClient::new(&env, &contract_id);
    dao.initialize(&admin, &token);

    for _ in 0..3 {
        dao.create_proposal(&admin, &Symbol::new(&env, "Test"));
    }

    let all = dao.get_all();
    assert_eq!(all.len(), 3);
}

#[test]
fn test_no_tokens_cant_create() {
    let env = Env::default();
    env.mock_all_auths();
    let admin = Address::generate(&env);
    let alice = Address::generate(&env);
    let token = deploy_token(&env, &admin);
    let contract_id = env.register(DaoCore, ());
    let dao = DaoCoreClient::new(&env, &contract_id);
    dao.initialize(&admin, &token);

    let result = std::panic::catch_unwind(std::panic::AssertUnwindSafe(|| {
        dao.create_proposal(&alice, &Symbol::new(&env, "Fail"));
    }));
    assert!(result.is_err());
}
