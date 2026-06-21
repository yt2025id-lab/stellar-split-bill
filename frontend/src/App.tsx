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
  xdr,
  Keypair,
  Operation,
} from "stellar-sdk";

const HORIZON_URL = import.meta.env.VITE_HORIZON_URL || "https://horizon-testnet.stellar.org";
const RPC_URL = import.meta.env.VITE_RPC_URL || "https://soroban-testnet.stellar.org";

const TOKEN_ID = import.meta.env.VITE_TOKEN_CONTRACT || "CCJ5MEBLFYVFOPN4EDO53IFQOCBWHO7SGIFEWXSKCTNHGTBZ6TTY53X5";
const CORE_ID = import.meta.env.VITE_CORE_CONTRACT || "CCRVTPOVHJZ7KLANM2AEPIQPLSDWIDK2M66GJQHFEHJVJPHGDCKQOGJ3";

const server = new Horizon.Server(HORIZON_URL);
const appKeypair = Keypair.random();

type TxState = "idle" | "pending" | "success" | "fail";

function rpcCall(method: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
  return fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  }).then((r) => r.json().then((d) => {
    if (d.error) throw new Error(d.error.message ?? JSON.stringify(d.error));
    return d.result as Record<string, unknown>;
  }));
}

interface Bill {
  id: number;
  creator: string;
  description: string;
  total_amount: number;
  share_per_person: number;
  payer_count: number;
  paid_count: number;
  completed: boolean;
}

export default function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [walletName, setWalletName] = useState("");
  const [appFunded, setAppFunded] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [bills, setBills] = useState<Bill[]>([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [payers, setPayers] = useState("");
  const [payersList, setPayersList] = useState<string[]>([]);
  const [billTx, setBillTx] = useState<TxState>("idle");
  const [payTx, setPayTx] = useState<TxState>("idle");
  const [status, setStatus] = useState<{ type: string; msg: string } | null>(null);

  useEffect(() => {
    fetch(`https://friendbot.stellar.org?addr=${appKeypair.publicKey()}`)
      .then(() => setAppFunded(true))
      .catch(() => {
        server.loadAccount(appKeypair.publicKey())
          .then(() => setAppFunded(true)).catch(() => {});
      });
  }, []);

  useEffect(() => {
    isConnected().then((r) => {
      if (r.isConnected) getAddress().then(({ address: a }) => {
        setAddress(a); setWalletName("Freighter");
        fetchBal(a);
      });
    }).catch(() => {});
  }, []);

  const fetchBal = useCallback(async (addr: string) => {
    setFetching(true);
    try {
      const acct = await server.loadAccount(addr);
      const xlm = acct.balances.find((b: { asset_type: string }) => b.asset_type === "native");
      setBalance(xlm?.balance ?? "0");
    } catch { setBalance("0"); }
    finally { setFetching(false); }
  }, []);

  useEffect(() => { if (address) fetchBal(address); }, [address, fetchBal]);

  const connect = async () => {
    const { address: addr, error: e } = await requestAccess();
    if (e || !addr) return setStatus({ type: "error", msg: "Freighter not found" });
    setAddress(addr); setWalletName("Freighter");
    await fetchBal(addr);
  };

  const disconnect = () => {
    setAddress(null); setBalance(null); setWalletName("");
    setStatus(null);
  };

  const fmt = (a: string) => `${a.slice(0, 5)}…${a.slice(-4)}`;

  // Simulate + sign + send helper
  async function simSignSend(op: (auth?: xdr.SorobanAuthorizationEntry[]) => xdr.Operation): Promise<string> {
    const acct = await server.loadAccount(appKeypair.publicKey());
    const raw = new TransactionBuilder(acct, {
      fee: "100000", networkPassphrase: Networks.TESTNET,
    }).addOperation(op()).setTimeout(300).build();

    const sim = await rpcCall("simulateTransaction", { transaction: raw.toXDR() }) as unknown as {
      minResourceFee: string; transactionData: string; result?: { auth?: string[] }; error?: string;
    };
    if (sim.error) throw new Error(sim.error);

    const rf = parseInt(sim.minResourceFee || "0", 10) || 0;
    const fee = (parseInt(raw.fee, 10) + rf).toString();
    const sd = sim.transactionData ? xdr.SorobanTransactionData.fromXDR(sim.transactionData, "base64") : undefined;
    const auth: xdr.SorobanAuthorizationEntry[] = [];
    if (sim.result?.auth) for (const a of sim.result.auth) auth.push(xdr.SorobanAuthorizationEntry.fromXDR(a, "base64"));

    const fresh = await server.loadAccount(appKeypair.publicKey());
    const tx = new TransactionBuilder(fresh, {
      fee, networkPassphrase: Networks.TESTNET, sorobanData: sd,
    }).addOperation(op(auth.length > 0 ? auth : undefined)).setTimeout(300).build();

    tx.sign(appKeypair);
    const r = await rpcCall("sendTransaction", { transaction: tx.toXDR() }) as unknown as { hash: string };
    return r.hash;
  }

  const createBill = async () => {
    if (!desc || !amount || !payers) return;
    const payerAddrs = payersList.filter(p => p.length > 0);
    if (payerAddrs.length === 0) return;

    setBillTx("pending"); setStatus(null);
    try {
      const hash = await simSignSend((auth) => {
        const args: xdr.ScVal[] = [
          xdr.ScVal.scvAddress(appKeypair.publicKey()),
          xdr.ScVal.scvString(desc),
          xdr.ScVal.scvI128(BigInt(amount)),
          xdr.ScVal.scvU32(payerAddrs.length),
        ];

        const payerScVec = xdr.ScVec.scvVec(
          payerAddrs.map((addr): xdr.ScVal => xdr.ScVal.scvAddress(addr))
        );
        args.push(payerScVec);

        return Operation.invokeContractFunction({
          contract: CORE_ID, function: "create_bill",
          args,
          auth,
        });
      });
      setStatus({ type: "success", msg: `Bill created! TX: ${hash.slice(0, 12)}…` });
      setDesc(""); setAmount(""); setPayers(""); setPayersList([]);
      setBillTx("success");
      setTimeout(() => setBillTx("idle"), 2000);
    } catch (e: unknown) {
      setBillTx("fail");
      setStatus({ type: "error", msg: (e as Error).message });
    }
  };

  const markPaid = async (billId: number) => {
    setPayTx("pending"); setStatus(null);
    try {
      const hash = await simSignSend((auth) =>
        Operation.invokeContractFunction({
          contract: CORE_ID, function: "mark_paid",
          args: [
            xdr.ScVal.scvAddress(appKeypair.publicKey()),
            xdr.ScVal.scvU32(billId),
          ],
          auth,
        })
      );
      setStatus({ type: "success", msg: `Paid! TX: ${hash.slice(0, 12)}…` });
      setPayTx("success");
      setTimeout(() => setPayTx("idle"), 2000);
    } catch (e: unknown) {
      setPayTx("fail");
      setStatus({ type: "error", msg: (e as Error).message });
    }
  };

  const loadBills = async () => {
    try {
      setPayTx("pending");
      const acct = await server.loadAccount(appKeypair.publicKey());
      const raw = new TransactionBuilder(acct, {
        fee: "100000", networkPassphrase: Networks.TESTNET,
      }).addOperation(
        Operation.invokeContractFunction({
          contract: CORE_ID, function: "get_all_bills", args: [],
        })
      ).setTimeout(300).build();

      const sim = await rpcCall("simulateTransaction", { transaction: raw.toXDR() }) as unknown as {
        error?: string; result?: { retval?: string };
      };

      if (!sim.error && sim.result?.retval) {
        const val = xdr.ScVal.fromXDR(sim.result.retval, "base64");
        const vec = val.vec();
        if (vec) {
          const parsed: Bill[] = [];
          for (const item of vec) {
            const m = item.map();
            if (m) {
              const get = (k: string) => m.find((e: { key: { sym: () => string }; val: { u32: () => number; i128: () => { toBigInt: () => bigint }; str: () => string; bool: () => boolean; address: () => { toString: () => string } } }) => e.key.sym().toString() === k)?.val;
              parsed.push({
                id: get("id")?.u32() ?? 0,
                creator: get("creator")?.address()?.toString() ?? "",
                description: get("description")?.str()?.toString() ?? "",
                total_amount: Number(get("total_amount")?.i128()?.toBigInt() ?? 0n),
                share_per_person: Number(get("share_per_person")?.i128()?.toBigInt() ?? 0n),
                payer_count: get("payer_count")?.u32() ?? 0,
                paid_count: get("paid_count")?.u32() ?? 0,
                completed: get("completed")?.bool() ?? false,
              });
            }
          }
          setBills(parsed);
        }
      }
      setPayTx("idle");
    } catch (e: unknown) {
      setPayTx("fail");
      setStatus({ type: "error", msg: (e as Error).message });
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="emoji">💸</span>
          <h1>Split Bill</h1>
        </div>
        <p className="subtitle">Stellar Orange Belt</p>

        {address ? (
          <div className="wallet-bar">
            <span className="wallet-badge">{walletName}</span>
            <span className="wallet-addr">{fmt(address)}</span>
            <span className="balance">
              {fetching ? "…" : balance ? `${Number(balance).toFixed(1)} XLM` : "…"}
            </span>
            <button className="btn btn-xs btn-pink" onClick={disconnect}>X</button>
          </div>
        ) : (
          <button className="btn btn-primary btn-full" onClick={connect} style={{marginTop:12}}>
            ⚡ Connect Freighter
          </button>
        )}
      </header>

      <main>
        {status && (
          <div className={`status ${status.type}`}>{status.msg}</div>
        )}

        {address && appFunded && (
          <>
            <div className="card">
              <h2 className="card-title">Create Bill</h2>
              <p className="card-desc">Split expenses with friends. Each pays their share.</p>

              <input className="input" placeholder="What's this for? (Pizza, Rent…)" value={desc} onChange={e => setDesc(e.target.value)} />
              <div className="form-row">
                <input className="input" type="number" placeholder="Total (stroops)" value={amount} onChange={e => setAmount(e.target.value)} />
                <input className="input" type="number" placeholder="# Payers" value={payers} onChange={e => {
                  const n = Number(e.target.value) || 0;
                  setPayers(e.target.value);
                  const arr = [...payersList];
                  while (arr.length < n) arr.push("");
                  setPayersList(arr.slice(0, n));
                }} style={{maxWidth:100}} />
              </div>

              {payersList.map((p, i) => (
                <input
                  key={i}
                  className="input"
                  placeholder={`Payer ${i+1} address (G…)`}
                  value={p}
                  onChange={e => {
                    const arr = [...payersList];
                    arr[i] = e.target.value;
                    setPayersList(arr);
                  }}
                />
              ))}

              <button className="btn btn-yellow btn-full" onClick={createBill} disabled={billTx === "pending" || !desc || !amount || payersList.filter(p=>p).length === 0}>
                {billTx === "pending" ? "CREATING…" : "➕ CREATE BILL"}
              </button>
            </div>

            <div className="card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <h2 className="card-title" style={{margin:0}}>Active Bills</h2>
                <button className="btn btn-xs btn-cyan" onClick={loadBills}>REFRESH</button>
              </div>

              {bills.length === 0 ? (
                <p style={{fontFamily:"JetBrains Mono, monospace",fontSize:12,color:"#999",textAlign:"center",padding:"24px 0"}}>
                  No bills yet. Create one!
                </p>
              ) : (
                bills.map((b) => (
                  <div key={b.id} className="bill">
                    <div className="bill-header">
                      <span className="bill-id">#{b.id}</span>
                      <span className={`bill-status ${b.completed ? "done" : "active"}`}>
                        {b.completed ? "DONE" : "ACTIVE"}
                      </span>
                    </div>
                    <div className="bill-desc">{b.description}</div>
                    <div className="bill-meta">
                      <span>💰 {b.total_amount / 1e7} XLM</span>
                      <span>👤 {b.share_per_person / 1e7} each</span>
                      <span>✅ {b.paid_count}/{b.payer_count}</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{
                        width: `${b.payer_count > 0 ? (b.paid_count / b.payer_count) * 100 : 0}%`
                      }} />
                    </div>
                    {!b.completed && (
                      <button
                        className="btn btn-lime btn-full btn-sm"
                        onClick={() => markPaid(b.id)}
                        disabled={payTx === "pending"}
                      >
                        {payTx === "pending" ? "PAYING…" : `💳 MARK AS PAID — ${b.share_per_person / 1e7} XLM`}
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {address && !appFunded && (
          <div className="status pending" style={{textAlign:"center"}}>
            Funding signer account via Friendbot…
          </div>
        )}
      </main>

      <footer className="footer">
        Split Bill dApp · Neo-Brutalism · June 2026
      </footer>
    </div>
  );
}
