#![cfg(test)]
use super::*;
use crate::BillVaultClient;
use soroban_sdk::{testutils::Address as _, Address, Env, String, Vec};

fn setup_vault(env: &Env) -> (Address, BillVaultClient<'_>, Address, Address, Address) {
    env.mock_all_auths();

    // Create a token contract for XLM transfers in test
    let admin = Address::generate(env);
    let native_token = env.register_stellar_asset_contract_v2(admin).address();

    let factory_id = env.register(splitbill_factory::SplitBillFactory, ());
    let vault_id = env.register(BillVault, ());
    let client = BillVaultClient::new(env, &vault_id);
    let creator = Address::generate(env);

    (vault_id, client, factory_id, creator, native_token)
}

fn mint_xlm(env: &Env, token: &Address, to: &Address, amount: i128) {
    let sac = token::StellarAssetClient::new(env, token);
    sac.mint(to, &amount);
}

fn register_in_factory(env: &Env, factory_id: &Address, vault_id: &Address, creator: &Address, participants: &Vec<Address>, shares: &Vec<i128>, title: &str) {
    let factory_client = splitbill_factory::SplitBillFactoryClient::new(env, factory_id);
    factory_client.register_bill(vault_id, creator, participants, shares, &String::from_str(env, title));
}

#[test]
fn test_contribute_and_settle() {
    let env = Env::default();
    let (vault_id, client, factory, creator, native_token) = setup_vault(&env);
    let alice = Address::generate(&env);
    let participants = Vec::from_array(&env, [alice.clone()]);
    let shares = Vec::from_array(&env, [100i128]);

    register_in_factory(&env, &factory, &vault_id, &creator, &participants, &shares, "Test bill");
    client.init(&factory, &creator, &participants, &shares, &String::from_str(&env, "Test bill"), &100, &native_token);

    mint_xlm(&env, &native_token, &alice, 100);

    assert_eq!(client.get_status(), VaultStatus::Pending);
    client.contribute(&alice);
    assert_eq!(client.get_status(), VaultStatus::Settled);

    let c = client.get_contributions();
    assert_eq!(c.len(), 1);
    assert_eq!(c.get(0).unwrap().amount, 100);
}

#[test]
#[should_panic(expected = "Already contributed")]
fn test_double_contribute_fails() {
    let env = Env::default();
    let (vault_id, client, factory, creator, native_token) = setup_vault(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let participants = Vec::from_array(&env, [alice.clone(), bob.clone()]);
    let shares = Vec::from_array(&env, [50i128, 50i128]);

    register_in_factory(&env, &factory, &vault_id, &creator, &participants, &shares, "Test");
    client.init(&factory, &creator, &participants, &shares, &String::from_str(&env, "Test"), &100, &native_token);
    mint_xlm(&env, &native_token, &alice, 100);
    client.contribute(&alice.clone());
    client.contribute(&alice);
}

#[test]
#[should_panic(expected = "Not a participant")]
fn test_non_participant_fails() {
    let env = Env::default();
    let (vault_id, client, factory, creator, native_token) = setup_vault(&env);
    let alice = Address::generate(&env);
    let stranger = Address::generate(&env);
    let participants = Vec::from_array(&env, [alice.clone()]);
    let shares = Vec::from_array(&env, [100i128]);

    register_in_factory(&env, &factory, &vault_id, &creator, &participants, &shares, "Test");
    client.init(&factory, &creator, &participants, &shares, &String::from_str(&env, "Test"), &100, &native_token);
    client.contribute(&stranger);
}

#[test]
fn test_partial_contribution() {
    let env = Env::default();
    let (vault_id, client, factory, creator, native_token) = setup_vault(&env);
    let alice = Address::generate(&env);
    let bob = Address::generate(&env);
    let participants = Vec::from_array(&env, [alice.clone(), bob.clone()]);
    let shares = Vec::from_array(&env, [100i128, 200i128]);

    register_in_factory(&env, &factory, &vault_id, &creator, &participants, &shares, "Group bill");
    client.init(&factory, &creator, &participants, &shares, &String::from_str(&env, "Group bill"), &300, &native_token);

    mint_xlm(&env, &native_token, &alice, 100);
    client.contribute(&alice);
    assert_eq!(client.get_status(), VaultStatus::Pending);

    mint_xlm(&env, &native_token, &bob, 200);
    client.contribute(&bob);
    assert_eq!(client.get_status(), VaultStatus::Settled);
}

#[test]
fn test_withdraw_after_settle() {
    let env = Env::default();
    let (vault_id, client, factory, creator, native_token) = setup_vault(&env);
    let alice = Address::generate(&env);
    let participants = Vec::from_array(&env, [alice.clone()]);
    let shares = Vec::from_array(&env, [100i128]);

    register_in_factory(&env, &factory, &vault_id, &creator, &participants, &shares, "Test");
    client.init(&factory, &creator, &participants, &shares, &String::from_str(&env, "Test"), &100, &native_token);

    mint_xlm(&env, &native_token, &alice, 100);
    client.contribute(&alice);
    assert_eq!(client.get_status(), VaultStatus::Settled);

    // Creator withdraws
    client.withdraw(&creator);
    let (_, _, _, _, _, _, _, withdrawn) = client.get_details();
    assert_eq!(withdrawn, true);
}
