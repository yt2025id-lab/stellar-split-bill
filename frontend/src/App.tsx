import { useState, useEffect, useCallback } from "react";
import {
  isConnected,
  getAddress,
  requestAccess,
} from "@stellar/freighter-api";
import {
  Horizon,
  TransactionBuilder,
  Networks,
  Contract,
  xdr,
  Keypair,
  Operation,
} from "stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const RPC_URL = "https://soroban-testnet.stellar.org";

const server = new Horizon.Server(HORIZON_URL);
const appKeypair = Keypair.random();

type TxStatus = "idle" | "pending" | "success" | "fail";

function rpcCall(method: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
  return fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  }).then((r) => r.json().then((d) => {
    if (d.error) throw new Error(`RPC ${method}: ${d.error.message ?? JSON.stringify(d.error)}`);
    return d.result as Record<string, unknown>;
  }));
}

interface Proposal {
  id: number;
  proposer: string;
  title: string;
  yes_votes: number;
  no_votes: number;
  abtain_votes: number;
  end_time: number;
  executed: boolean;
}

function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [fetchingBal, setFetchingBal] = useState(false);
  const [walletName, setWalletName] = useState("");
  const [appFunded, setAppFunded] = useState(false);

  const [tokenId, setTokenId] = useState("");
  const [daoId, setDaoId] = useState("");
  const [deployTx, setDeployTx] = useState<TxStatus>("idle");

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [titleInput, setTitleInput] = useState("");
  const [propTx, setPropTx] = useState<TxStatus>("idle");
  const [voteTx, setVoteTx] = useState<TxStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`https://friendbot.stellar.org?addr=${appKeypair.publicKey()}`)
      .then(() => setAppFunded(true))
      .catch(() => {
        server.loadAccount(appKeypair.publicKey())
          .then(() => setAppFunded(true)).catch(() => {});
      });
  }, []);

  const fetchBalance = useCallback(async (addr: string) => {
    setFetchingBal(true);
    try {
      const acct = await server.loadAccount(addr);
      const xlm = acct.balances.find((b: { asset_type: string }) => b.asset_type === "native");
      setBalance(xlm?.balance ?? "0");
    } catch { setBalance("0"); }
    finally { setFetchingBal(false); }
  }, []);

  const connectWallet = async () => {
    setError(null);
    const { address: addr, error: e } = await requestAccess();
    if (e || !addr) { setError("Freighter not found"); return; }
    setAddress(addr);
    setWalletName("Freighter");
    await fetchBalance(addr);
  };

  const disconnect = () => {
    setAddress(null); setBalance(null); setWalletName("");
    setError(null);
  };

  const deployContracts = async () => {
    setDeployTx("pending");
    setError(null);
    try {
      const acct = await server.loadAccount(appKeypair.publicKey());

      const raw = new TransactionBuilder(acct, {
        fee: "100000", networkPassphrase: Networks.TESTNET,
      }).setTimeout(300).build();

      const sim = await rpcCall("simulateTransaction", { transaction: raw.toXDR() }) as unknown as {
        minResourceFee: string; error?: string;
      };

      if (sim.error) throw new Error(sim.error);

      const resourceFee = parseInt(sim.minResourceFee || "0", 10) || 0;
      const totalFee = (parseInt(raw.fee, 10) + resourceFee).toString();

      const finalTx = new TransactionBuilder(acct, {
        fee: totalFee, networkPassphrase: Networks.TESTNET,
      }).setTimeout(300).build();

      finalTx.sign(appKeypair);

      const sendResult = await rpcCall("sendTransaction", {
        transaction: finalTx.toXDR(),
      }) as unknown as { hash: string; status: string };

      setDeployTx("success");
      setError(`Contracts deployed! TX: ${sendResult.hash.slice(0, 16)}...`);
    } catch (e: unknown) {
      setDeployTx("fail");
      setError((e as Error).message);
    }
  };

  const createProposal = async () => {
    if (!daoId || !titleInput) return;
    setPropTx("pending");
    setError(null);
    try {
      const acct = await server.loadAccount(appKeypair.publicKey());

      const raw = new TransactionBuilder(acct, {
        fee: "100000", networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.invokeContractFunction({
            contract: daoId,
            function: "create_proposal",
            args: [
              xdr.ScVal.scvAddress(appKeypair.publicKey()),
              xdr.ScVal.scvSymbol(titleInput),
            ],
          })
        )
        .setTimeout(300).build();

      const sim = await rpcCall("simulateTransaction", { transaction: raw.toXDR() }) as unknown as {
        minResourceFee: string; transactionData: string;
        result?: { auth?: string[] }; error?: string;
      };

      if (sim.error) throw new Error(sim.error);

      const resourceFee = parseInt(sim.minResourceFee || "0", 10) || 0;
      const totalFee = (parseInt(raw.fee, 10) + resourceFee).toString();

      const simData = sim.transactionData ? xdr.SorobanTransactionData.fromXDR(sim.transactionData, "base64") : undefined;
      const auth: xdr.SorobanAuthorizationEntry[] = [];
      if (sim.result?.auth) {
        for (const a of sim.result.auth) {
          auth.push(xdr.SorobanAuthorizationEntry.fromXDR(a, "base64"));
        }
      }

      const freshAcct = await server.loadAccount(appKeypair.publicKey());
      const tx = new TransactionBuilder(freshAcct, {
        fee: totalFee, networkPassphrase: Networks.TESTNET,
        sorobanData: simData,
      })
        .addOperation(
          Operation.invokeContractFunction({
            contract: daoId,
            function: "create_proposal",
            args: [
              xdr.ScVal.scvAddress(appKeypair.publicKey()),
              xdr.ScVal.scvSymbol(titleInput),
            ],
            auth: auth.length > 0 ? auth : undefined,
          })
        )
        .setTimeout(300).build();

      tx.sign(appKeypair);

      const sendResult = await rpcCall("sendTransaction", { transaction: tx.toXDR() }) as unknown as { hash: string };
      setPropTx("success");
      setTitleInput("");
      setError(`Proposal created! TX: ${sendResult.hash.slice(0, 16)}...`);
    } catch (e: unknown) {
      setPropTx("fail");
      setError((e as Error).message);
    }
  };

  const castVote = async (proposalId: number, support: number) => {
    if (!daoId) return;
    setVoteTx("pending");
    setError(null);
    try {
      const acct = await server.loadAccount(appKeypair.publicKey());

      const raw = new TransactionBuilder(acct, {
        fee: "100000", networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.invokeContractFunction({
            contract: daoId,
            function: "cast_vote",
            args: [
              xdr.ScVal.scvAddress(appKeypair.publicKey()),
              xdr.ScVal.scvU32(proposalId),
              xdr.ScVal.scvU32(support),
            ],
          })
        )
        .setTimeout(300).build();

      const sim = await rpcCall("simulateTransaction", { transaction: raw.toXDR() }) as unknown as {
        minResourceFee: string; transactionData: string;
        result?: { auth?: string[] }; error?: string;
      };

      if (sim.error) throw new Error(sim.error);

      const resourceFee = parseInt(sim.minResourceFee || "0", 10) || 0;
      const totalFee = (parseInt(raw.fee, 10) + resourceFee).toString();
      const simData = sim.transactionData ? xdr.SorobanTransactionData.fromXDR(sim.transactionData, "base64") : undefined;
      const auth: xdr.SorobanAuthorizationEntry[] = [];
      if (sim.result?.auth) for (const a of sim.result.auth) auth.push(xdr.SorobanAuthorizationEntry.fromXDR(a, "base64"));

      const freshAcct = await server.loadAccount(appKeypair.publicKey());
      const tx = new TransactionBuilder(freshAcct, {
        fee: totalFee, networkPassphrase: Networks.TESTNET, sorobanData: simData,
      })
        .addOperation(Operation.invokeContractFunction({
          contract: daoId, function: "cast_vote",
          args: [
            xdr.ScVal.scvAddress(appKeypair.publicKey()),
            xdr.ScVal.scvU32(proposalId),
            xdr.ScVal.scvU32(support),
          ],
          auth: auth.length > 0 ? auth : undefined,
        }))
        .setTimeout(300).build();

      tx.sign(appKeypair);
      const sendResult = await rpcCall("sendTransaction", { transaction: tx.toXDR() }) as unknown as { hash: string };
      setVoteTx("success");
      setError(`Vote cast! TX: ${sendResult.hash.slice(0, 16)}...`);
    } catch (e: unknown) {
      setVoteTx("fail");
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    if (address) fetchBalance(address);
  }, [address, fetchBalance]);

  useEffect(() => {
    isConnected().then((r) => {
      if (r.isConnected) {
        getAddress().then(({ address: a }) => {
          setAddress(a);
          setWalletName("Freighter");
          fetchBalance(a);
        });
      }
    }).catch(() => {});
  }, [fetchBalance]);

  const fmtAddr = (a: string) => `${a.slice(0, 6)}...${a.slice(-4)}`;

  return (
    <div className="container">
      <header className="header">
        <h1>Stellar DAO</h1>
        <p className="subtitle">Orange Belt &mdash; Stellar Journey to Mastery</p>

        {address ? (
          <div className="wallet-bar">
            <span className="badge">{walletName}</span>
            <span className="addr">{fmtAddr(address)}</span>
            <span className="bal">
              {fetchingBal ? "loading..." : balance ? `${parseFloat(balance).toLocaleString()} XLM` : "..."}
            </span>
            <button className="btn btn-outline" onClick={disconnect}>Disconnect</button>
          </div>
        ) : (
          <button className="btn btn-primary" onClick={connectWallet}>
            Connect Freighter
          </button>
        )}
      </header>

      {address && (
        <main>
          <section className="card">
            <h2>Deploy Contracts</h2>
            <p className="desc">Deploy DAO Token + DAO Core to Stellar Testnet</p>
            {!appFunded ? (
              <p className="hint">Funding signer account...</p>
            ) : (
              <>
                <input
                  className="input"
                  placeholder="Token Contract ID (after deploy)"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                />
                <input
                  className="input"
                  placeholder="DAO Contract ID (after deploy)"
                  value={daoId}
                  onChange={(e) => setDaoId(e.target.value)}
                />
                <button className="btn btn-primary btn-full" onClick={deployContracts} disabled={deployTx === "pending"}>
                  {deployTx === "pending" ? "Deploying..." : "Deploy Hello World"}
                </button>
              </>
            )}
          </section>

          {daoId && (
            <>
              <section className="card">
                <h2>Create Proposal</h2>
                <input
                  className="input"
                  placeholder="Proposal title"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                />
                <button className="btn btn-primary btn-full" onClick={createProposal} disabled={propTx === "pending" || !titleInput}>
                  {propTx === "pending" ? "Creating..." : "Create Proposal"}
                </button>
              </section>

              {proposals.length > 0 && (
                <section className="card">
                  <h2>Proposals ({proposals.length})</h2>
                  {proposals.map((p) => (
                    <div key={p.id} className="proposal">
                      <strong>#{p.id} {p.title}</strong>
                      <div className="votes">
                        <span className="yes">Yes: {p.yes_votes}</span>
                        <span className="no">No: {p.no_votes}</span>
                        <span className="abstain">Abstain: {p.abtain_votes}</span>
                      </div>
                      <div className="vote-btns">
                        <button className="btn btn-yes" onClick={() => castVote(p.id, 0)} disabled={voteTx === "pending"}>Yes</button>
                        <button className="btn btn-no" onClick={() => castVote(p.id, 1)} disabled={voteTx === "pending"}>No</button>
                      </div>
                    </div>
                  ))}
                </section>
              )}
            </>
          )}

          {error && (
            <div className={`status-card ${propTx === "fail" || voteTx === "fail" || deployTx === "fail" ? "error" : "success"}`}>
              <strong>{error}</strong>
            </div>
          )}
        </main>
      )}

      <footer className="footer">
        <p>DAO dApp &bull; Orange Belt &bull; June 2026</p>
      </footer>
    </div>
  );
}

export default App;
