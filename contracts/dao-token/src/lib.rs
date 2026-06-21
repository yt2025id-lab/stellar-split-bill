#![cfg_attr(not(test), no_std)]
use soroban_sdk::{contract, contractimpl, Env, Address, Symbol, String};

#[contract]
pub struct DaoToken;

const DECIMAL: u32 = 7;

fn k(env: &Env, s: &str) -> Symbol { Symbol::new(env, s) }

#[contractimpl]
impl DaoToken {
    pub fn initialize(env: Env, admin: Address, name: String, symbol: String, initial_supply: i128) {
        admin.require_auth();
        if env.storage().instance().has(&k(&env, "admin")) {
            panic!("Already initialized");
        }
        let supply = initial_supply * 10i128.pow(DECIMAL);
        env.storage().instance().set(&k(&env, "admin"), &admin);
        env.storage().instance().set(&k(&env, "name"), &name);
        env.storage().instance().set(&k(&env, "symbol"), &symbol);
        env.storage().instance().set(&k(&env, "decs"), &DECIMAL);
        env.storage().instance().set(&k(&env, "supply"), &supply);
        env.storage().instance().set(&admin, &supply);
    }

    pub fn admin(env: Env) -> Address {
        env.storage().instance().get(&k(&env, "admin")).unwrap()
    }
    pub fn name(env: Env) -> String {
        env.storage().instance().get(&k(&env, "name")).unwrap()
    }
    pub fn symbol(env: Env) -> String {
        env.storage().instance().get(&k(&env, "symbol")).unwrap()
    }
    pub fn decimals(env: Env) -> u32 {
        env.storage().instance().get(&k(&env, "decs")).unwrap()
    }
    pub fn total_supply(env: Env) -> i128 {
        env.storage().instance().get(&k(&env, "supply")).unwrap()
    }
    pub fn balance(env: Env, owner: Address) -> i128 {
        env.storage().instance().get(&owner).unwrap_or(0)
    }

    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        let fb: i128 = env.storage().instance().get(&from).unwrap_or(0);
        let tb: i128 = env.storage().instance().get(&to).unwrap_or(0);
        if fb < amount { panic!("Insufficient balance"); }
        env.storage().instance().set(&from, &(fb - amount));
        env.storage().instance().set(&to, &(tb + amount));
    }

    pub fn mint(env: Env, admin: Address, to: Address, amount: i128) {
        admin.require_auth();
        let stored: Address = env.storage().instance().get(&k(&env, "admin")).unwrap();
        if admin != stored { panic!("Only admin"); }
        let sup: i128 = env.storage().instance().get(&k(&env, "supply")).unwrap();
        let tb: i128 = env.storage().instance().get(&to).unwrap_or(0);
        env.storage().instance().set(&k(&env, "supply"), &(sup + amount));
        env.storage().instance().set(&to, &(tb + amount));
    }

    pub fn burn(env: Env, from: Address, amount: i128) {
        from.require_auth();
        let fb: i128 = env.storage().instance().get(&from).unwrap_or(0);
        let sup: i128 = env.storage().instance().get(&k(&env, "supply")).unwrap();
        if fb < amount { panic!("Insufficient balance"); }
        env.storage().instance().set(&from, &(fb - amount));
        env.storage().instance().set(&k(&env, "supply"), &(sup - amount));
    }
}

#[cfg(test)]
mod test;
