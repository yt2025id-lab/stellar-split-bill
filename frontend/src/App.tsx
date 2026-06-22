import { useState, useEffect, useCallback } from "react";
import { isConnected, getAddress, requestAccess } from "@stellar/freighter-api";
import { Horizon, TransactionBuilder, Networks, xdr, Keypair, Operation, Address } from "stellar-sdk";
import StellarSplitBillLogo from "./StellarSplitBillLogo";

const HORIZON_URL = import.meta.env.VITE_HORIZON_URL || "https://horizon-testnet.stellar.org";
const RPC_URL = import.meta.env.VITE_RPC_URL || "https://soroban-testnet.stellar.org";
const TOKEN_ID = import.meta.env.VITE_TOKEN_CONTRACT || "CCJ5MEBLFYVFOPN4EDO53IFQOCBWHO7SGIFEWXSKCTNHGTBZ6TTY53X5";
const CORE_ID = import.meta.env.VITE_CORE_CONTRACT || "CCRVTPOVHJZ7KLANM2AEPIQPLSDWIDK2M66GJQHFEHJVJPHGDCKQOGJ3";

const EXPLORER_BASE = "https://stellar.expert/explorer/testnet";

const server = new Horizon.Server(HORIZON_URL);

const STORAGE_KEY = "sb_app_sk";

function getOrCreateKeypair(): Keypair {
  const stored = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  if (stored) {
    try { return Keypair.fromSecret(stored); } catch { /* corrupted, regenerate */ }
  }
  const kp = Keypair.random();
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, kp.secret());
  return kp;
}

const appKeypair = getOrCreateKeypair();

function scvAddress(addr: string): xdr.ScVal {
  return new Address(addr).toScVal();
}

function scvString(s: string): xdr.ScVal {
  return xdr.ScVal.scvString(s);
}

function scvI128(n: bigint): xdr.ScVal {
  return xdr.ScVal.scvI128(n);
}

function scvU32(n: number): xdr.ScVal {
  return xdr.ScVal.scvU32(n);
}

function scvVec(items: xdr.ScVal[]): xdr.ScVal {
  return xdr.ScVal.scvVec(items);
}

type TxState = "idle" | "pending" | "success" | "fail";

async function rpcCall(method: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
  const r = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const d = await r.json();
  if (d.error) throw new Error(d.error.message ?? JSON.stringify(d.error));
  return d.result as Record<string, unknown>;
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

function decodeBill(scv: xdr.ScVal): Bill {
  const fields = scv.vec()!;
  return {
    id: Number(fields[0].u32()),
    creator: fields[1].address()?.toString() ?? "",
    description: fields[2].str()?.toString() ?? "",
    total_amount: Number(fields[3].i128()?.lo ?? 0n),
    share_per_person: Number(fields[4].i128()?.lo ?? 0n),
    payer_count: Number(fields[5].u32()),
    paid_count: Number(fields[6].u32()),
    completed: fields[7].bool() ?? false,
  };
}

async function ensureFunded(): Promise<void> {
  try {
    await server.loadAccount(appKeypair.publicKey());
    console.log("[SplitBill] Signer already funded:", appKeypair.publicKey());
    return;
  } catch {}
  console.log("[SplitBill] Funding signer via Friendbot:", appKeypair.publicKey());
  try {
    await fetch(`https://friendbot.stellar.org?addr=${appKeypair.publicKey()}`);
    await new Promise((r) => setTimeout(r, 2000));
    await server.loadAccount(appKeypair.publicKey());
  } catch (e) {
    throw new Error(`Failed to fund signer account. Try again later.\n\nSigner: ${appKeypair.publicKey().slice(0, 10)}…`);
  }
}

async function simSignSend(
  func: string,
  args: xdr.ScVal[],
  onTxHash?: (hash: string) => void,
): Promise<{ hash: string; retval?: xdr.ScVal }> {
  console.log("[SplitBill] simSignSend:", func);
  await ensureFunded();

  const acct = await server.loadAccount(appKeypair.publicKey());
  const raw = new TransactionBuilder(acct, {
    fee: "100000",
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(Operation.invokeContractFunction({ contract: CORE_ID, function: func, args }))
    .setTimeout(300)
    .build();

  const simResult = (await rpcCall("simulateTransaction", { transaction: raw.toXDR() })) as unknown as {
    minResourceFee: string;
    transactionData: string;
    result?: { auth?: string[]; retval?: string };
    error?: string;
  };

  if (simResult.error) throw new Error(`Simulation failed: ${simResult.error}`);

  const resourceFee = parseInt(simResult.minResourceFee || "0", 10) || 0;
  const totalFee = (parseInt(raw.fee, 10) + resourceFee).toString();

  const sorobanData = simResult.transactionData
    ? xdr.SorobanTransactionData.fromXDR(simResult.transactionData, "base64")
    : undefined;

  const auth: xdr.SorobanAuthorizationEntry[] = [];
  if (simResult.result?.auth) {
    for (const a of simResult.result.auth) {
      auth.push(xdr.SorobanAuthorizationEntry.fromXDR(a, "base64"));
    }
  }

  const fresh = await server.loadAccount(appKeypair.publicKey());
  const tx = new TransactionBuilder(fresh, {
    fee: totalFee,
    networkPassphrase: Networks.TESTNET,
    sorobanData,
  })
    .addOperation(Operation.invokeContractFunction({ contract: CORE_ID, function: func, args, auth: auth.length > 0 ? auth : undefined }))
    .setTimeout(300)
    .build();

  tx.sign(appKeypair);

  const sendResult = (await rpcCall("sendTransaction", { transaction: tx.toXDR() })) as unknown as {
    hash: string;
    status?: string;
    errorResult?: string;
  };

  if (sendResult.errorResult) throw new Error(`Transaction failed: ${sendResult.errorResult}`);

  onTxHash?.(sendResult.hash);

  let retval: xdr.ScVal | undefined;
  if (simResult.result?.retval) {
    try { retval = xdr.ScVal.fromXDR(simResult.result.retval, "base64"); } catch {}
  }

  return { hash: sendResult.hash, retval };
}

export default function App() {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [walletName] = useState("");
  const [fetching, setFetching] = useState(false);
  const [appFunded, setAppFunded] = useState(false);

  const [bills, setBills] = useState<Bill[]>([]);
  const [desc, setDesc] = useState("");
  const [amount, setAmount] = useState("");
  const [payers, setPayers] = useState("");
  const [payersList, setPayersList] = useState<string[]>([]);
  const [billTx, setBillTx] = useState<TxState>("idle");
  const [payTx, setPayTx] = useState<TxState>("idle");
  const [status, setStatus] = useState<{ type: string; msg: string; txHash?: string } | null>(null);

  useEffect(() => {
    ensureFunded()
      .then(() => setAppFunded(true))
      .catch(() => setAppFunded(false));
  }, []);

  useEffect(() => {
    isConnected()
      .then((r) => {
        if (r.isConnected) {
          getAddress().then(({ address: a }) => {
            setAddress(a);
            fetchBal(a);
          });
        }
      })
      .catch(() => {});
  }, []);

  const fetchBal = useCallback(async (addr: string) => {
    setFetching(true);
    try {
      const acct = await server.loadAccount(addr);
      setBalance(
        acct.balances.find((b: { asset_type: string }) => b.asset_type === "native")?.balance ?? "0",
      );
    } catch {
      setBalance("0");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (address) fetchBal(address);
  }, [address, fetchBal]);

  const connect = async () => {
    try {
      const connected = await isConnected();
      if (!connected.isConnected) {
        return setStatus({ type: "error", msg: "Freighter is not connected to this site. Please open Freighter extension and enable Testnet connection." });
      }
      const { address: addr, error: e } = await requestAccess();
      if (e) return setStatus({ type: "error", msg: `Freighter error: ${e}` });
      if (!addr) return setStatus({ type: "error", msg: "Freighter returned no address. Check if wallet is unlocked." });
      setAddress(addr);
      await fetchBal(addr);
      setStatus({ type: "success", msg: `Connected: ${addr.slice(0, 6)}…${addr.slice(-4)}` });
      setTimeout(() => setStatus(null), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setStatus({ type: "error", msg: `Cannot connect: ${msg}` });
    }
  };

  const disconnect = () => {
    setAddress(null);
    setBalance(null);
    setStatus(null);
  };

  const loadBills = async () => {
    setPayTx("pending");
    setStatus(null);
    try {
      await ensureFunded();
      const acct = await server.loadAccount(appKeypair.publicKey());
      const raw = new TransactionBuilder(acct, {
        fee: "1000",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.invokeContractFunction({ contract: CORE_ID, function: "get_all_bills", args: [] }))
        .setTimeout(300)
        .build();

      const simResult = (await rpcCall("simulateTransaction", { transaction: raw.toXDR() })) as unknown as {
        result?: { retval?: string };
        error?: string;
      };

      if (simResult.error) throw new Error(`Simulation failed: ${simResult.error}`);

      if (simResult.result?.retval) {
        const retval = xdr.ScVal.fromXDR(simResult.result.retval, "base64");
        const vec = retval.vec();
        if (vec && vec.length > 0) {
          const parsed: Bill[] = [];
          for (let i = 0; i < vec.length; i++) {
            try { parsed.push(decodeBill(vec[i])); } catch {}
          }
          setBills(parsed);
          setStatus({ type: "success", msg: `Loaded ${parsed.length} bill${parsed.length !== 1 ? "s" : ""}` });
        } else {
          setBills([]);
          setStatus({ type: "success", msg: "No bills yet" });
        }
      } else {
        setBills([]);
        setStatus({ type: "success", msg: "No bills found (empty state)" });
      }
      setPayTx("idle");
    } catch (e: unknown) {
      setPayTx("fail");
      setStatus({ type: "error", msg: (e as Error).message });
    }
  };

  const createBill = async () => {
    const pa = payersList.filter((p) => p.length > 0);
    if (!desc || !amount || pa.length === 0) return;

    setBillTx("pending");
    setStatus(null);

    try {
      console.log("[SplitBill] Creating bill:", { desc, amount, payers: pa.length, addrs: pa });

      const amountNum = BigInt(amount);
      if (amountNum <= 0) throw new Error("Amount must be positive");

      if (amountNum % BigInt(pa.length) !== 0n) {
        const per = Number(amountNum) / pa.length;
        throw new Error(`Amount must be evenly divisible by ${pa.length} payers. Each share would be ${per} stroops — try a round number like ${pa.length * Math.ceil(per)} stroops.`);
      }

      if (pa.length !== Number(payers)) {
        throw new Error(`Expected ${payers} payer addresses, but only ${pa.length} filled in. Please complete all payer fields.`);
      }

      const invalidAddr = pa.find((addr) => !addr.startsWith("G") || addr.length !== 56);
      if (invalidAddr) {
        throw new Error(`Invalid Stellar address: "${invalidAddr.slice(0, 12)}…". Must be 56 characters starting with 'G'.`);
      }

      const args: xdr.ScVal[] = [
        scvAddress(appKeypair.publicKey()),
        xdr.ScVal.scvString(desc),
        xdr.ScVal.scvI128(amountNum),
        xdr.ScVal.scvU32(pa.length),
      ];
      args.push(xdr.ScVal.scvVec(pa.map((a): xdr.ScVal => scvAddress(a))));

      const { hash } = await simSignSend("create_bill", args);

      setStatus({
        type: "success",
        msg: `Bill created! `,
        txHash: hash,
      });
      setDesc("");
      setAmount("");
      setPayers("");
      setPayersList([]);
      setBillTx("success");
      setTimeout(() => setBillTx("idle"), 2000);
      loadBills();
    } catch (e: unknown) {
      setBillTx("fail");
      const msg = e instanceof Error ? e.message : String(e);
      setStatus({ type: "error", msg });
      setTimeout(() => setBillTx("idle"), 2000);
    }
  };

  const markPaid = async (billId: number) => {
    setPayTx("pending");
    setStatus(null);
    try {
      const { hash } = await simSignSend("mark_paid", [
        scvAddress(appKeypair.publicKey()),
        xdr.ScVal.scvU32(billId),
      ]);

      setStatus({
        type: "success",
        msg: `Payment marked! `,
        txHash: hash,
      });
      setPayTx("success");
      setTimeout(() => setPayTx("idle"), 2000);
      loadBills();
    } catch (e: unknown) {
      setPayTx("fail");
      setStatus({ type: "error", msg: (e as Error).message });
    }
  };

  const fmt = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  return (
    <div className="app-root">
      {/* ═══════════ NAV ═══════════ */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-actions">
            {address ? (
              <>
                <div className="nav-pill nav-pill-address">
                  <div className="nav-dot" />
                  {fmt(address)}
                </div>
                <div className="nav-pill nav-pill-balance">
                  {fetching ? "…" : balance ? Number(balance).toFixed(1) + " XLM" : "…"}
                </div>
                <button onClick={disconnect} className="btn btn-sm btn-outline">Disconnect</button>
              </>
            ) : (
              <a href="#dapp" className="btn btn-primary btn-sm">Launch dApp</a>
            )}
          </div>
          <div className="nav-brand">
            <StellarSplitBillLogo size={34} logoSize={92} />
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          Stellar Orange Belt · Journey to Mastery
        </div>
        <div className="sphere-container">
          <div className="sphere-loader">
            {Array.from({ length: 8 }, (_, si) => (
              <div key={si} className={`sphere s${si}`} style={{ '--rot': si } as React.CSSProperties}>
                {Array.from({ length: 8 }, (_, ii) => (
                  <div key={ii} className="item" style={{ '--rot-y': ii } as React.CSSProperties} />
                ))}
              </div>
            ))}
          </div>
        </div>
        <h1 className="hero-title">
          Decentralized<br />
          <span className="hero-title-accent">Bill Splitting</span>
        </h1>
        <p className="hero-desc">
          A trustless expense-sharing protocol on Stellar Soroban. Create a bill, invite friends
          with their wallet addresses, and track payments in real time — settled on-chain.
        </p>
        <div className="hero-glow" />
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="section" style={{background: "var(--surface-elevated)"}}>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Why Split Bill</span>
            <h2 className="section-title">Built for trustless coordination</h2>
          </div>
          <div className="features-grid">
            {[
              { icon: "■■■", title: "On-Chain Settlement", desc: "Every payment tracked immutably on Stellar Soroban. No disputes, no 'I already paid' arguments — just cryptographic certainty." },
              { icon: "◇◇◇", title: "Inter-Contract Composition", desc: "Split Core calls Split Token to burn obligation tokens automatically. True composability between Soroban contracts." },
              { icon: "●●●", title: "Exact Splits, Always", desc: "The smart contract enforces exact even division with no remainders. No rounding errors, no awkward math, no drama." },
            ].map((f,i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Process</span>
            <h2 className="section-title">How it works</h2>
          </div>
          <div className="steps-track">
            {[
              { step: "01", title: "Create Bill", desc: "Enter the expense name, total amount, and your friends' Stellar wallet addresses." },
              { step: "02", title: "Mint Obligation Tokens", desc: "Each payer receives obligation tokens equal to their share. Recorded on-chain, immutable." },
              { step: "03", title: "Mark Paid", desc: "Pay your share. The contract burns your tokens — cryptographic proof that you've settled." },
              { step: "04", title: "Auto-Complete", desc: "When everyone has paid, the bill auto-closes. No chasing, no reminders, no friction." },
            ].map((s,i) => (
              <div key={i} className="step-card">
                <span className="step-number">{s.step}</span>
                <div className="step-connector" />
                <h3 className="step-title">{s.title}</h3>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CONTRACT INFO ═══════════ */}
      <section className="section" style={{background: "var(--surface-elevated)"}}>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Deployed Contracts</span>
            <h2 className="section-title">Stellar Soroban Testnet</h2>
          </div>
          <div className="contract-grid">
            <div className="contract-card">
              <span className="contract-label">Split Token</span>
              <code className="contract-id">{TOKEN_ID}</code>
              <a href={`${EXPLORER_BASE}/contract/${TOKEN_ID}`} target="_blank" rel="noopener" className="contract-link">View on Explorer &nearr;</a>
            </div>
            <div className="contract-card">
              <span className="contract-label">Split Core</span>
              <code className="contract-id">{CORE_ID}</code>
              <a href={`${EXPLORER_BASE}/contract/${CORE_ID}`} target="_blank" rel="noopener" className="contract-link">View on Explorer &nearr;</a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ DAPP ═══════════ */}
      <section id="dapp" className="section dapp-section">
        <div className="container-sm">
          <div className="section-header">
            <span className="eyebrow eyebrow-light">Try It Now</span>
            <h2 className="section-title" style={{color:"var(--text-primary)"}}>Launch dApp</h2>
            <p className="section-sub">Connect your Freighter wallet to start splitting bills on Stellar Soroban</p>
          </div>

          {!address ? (
            <>
              <div className="honeycomb-loader" style={{margin: "0 auto 24px", display: "block"}}>
                <div /><div /><div /><div /><div /><div /><div />
              </div>
              <div className="connect-prompt" style={{padding: "0 24px 48px"}}>
                <button onClick={connect} className="btn btn-primary btn-lg">Connect Freighter</button>
              </div>
            </>
          ) : !appFunded ? (
            <div className="connect-prompt">
              <div className="spinner" />
              <p className="connect-text">Funding signer account via Friendbot…</p>
              <p className="status-note">Signer: {fmt(appKeypair.publicKey())}</p>
            </div>
          ) : (
            <>
              {/* Create Bill Form */}
              <div className="dapp-card">
                <h3 className="dapp-card-title">Create New Bill</h3>
                <div className="form-group">
                  <input className="input" placeholder="What's this for? (e.g. Pizza Party, Rent…)" value={desc} onChange={e=>setDesc(e.target.value)} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <input className="input" type="number" placeholder="Total (stroops)" value={amount} onChange={e=>setAmount(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <input className="input" type="number" placeholder="Number of payers" value={payers} onChange={e=>{const n=Number(e.target.value)||0;setPayers(e.target.value);const a=[...payersList];while(a.length<n)a.push("");setPayersList(a.slice(0,n));}} />
                  </div>
                </div>
                {amount && payers && Number(payers) > 0 && BigInt(amount) > 0 && BigInt(amount) % BigInt(Number(payers)) !== 0n && (
                  <div className="form-hint">
                    ⚠ Amount {amount} stroops is not evenly divisible by {Number(payers)} payers. 
                    Try {Number(payers) * Math.ceil(Number(amount) / Number(payers))} stroops instead.
                  </div>
                )}
                {payersList.map((p,i)=>(
                  <div className="form-group" key={i}>
                    <input
                      className="input input-sm"
                      placeholder={`Payer ${i+1} Stellar address (G…) — add ${fmt(appKeypair.publicKey())} to mark paid`}
                      value={p}
                      onChange={e=>{const a=[...payersList];a[i]=e.target.value;setPayersList(a);}}
                    />
                  </div>
                ))}
                <button
                  onClick={createBill}
                  disabled={billTx==="pending"||!desc||!amount||!payers||payersList.filter(p=>p).length!==Number(payers)}
                  className="btn btn-primary btn-lg btn-full"
                >
                  {billTx==="pending" ? "Creating…" : "Create Bill"}
                </button>
              </div>

              {/* Bill List */}
              <div className="dapp-card">
                <div className="dapp-card-header">
                  <h3 className="dapp-card-title">Active Bills</h3>
                  <button onClick={loadBills} className="btn btn-secondary btn-sm">Refresh</button>
                </div>
                {bills.length===0 ? (
                  <div className="empty-state">
                    <p>No bills yet. Click Refresh to load from the contract.</p>
                  </div>
                ) : bills.map(b=>(
                  <div key={b.id} className="bill-card">
                    <div className="bill-card-head">
                      <div className="bill-badge bill-badge-id">#{b.id}</div>
                      <div className={`bill-badge ${b.completed ? "bill-badge-done" : "bill-badge-active"}`}>
                        {b.completed ? "Completed" : "Active"}
                      </div>
                    </div>
                    <h4 className="bill-title">{b.description}</h4>
                    <div className="bill-meta">
                      <span>{(b.total_amount/1e7).toFixed(4)} XLM total</span>
                      <span>{(b.share_per_person/1e7).toFixed(4)} each</span>
                      <span>{b.paid_count}/{b.payer_count} paid</span>
                    </div>
                    <div className="progress-track">
                      <div className="progress-fill" style={{width:`${b.payer_count>0?(b.paid_count/b.payer_count)*100:0}%`}} />
                    </div>
                    {!b.completed && (
                      <button onClick={()=>markPaid(b.id)} disabled={payTx==="pending"} className="btn btn-accent btn-full btn-sm">
                        {payTx==="pending" ? "Processing…" : `Mark as Paid — ${(b.share_per_person/1e7).toFixed(4)} XLM`}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {status && (
            <div className={`status-bar ${status.type}`} style={{marginTop: 20}}>
              <span className="status-indicator" />
              <span>{status.msg}</span>
              {status.txHash && (
                <a
                  href={`${EXPLORER_BASE}/tx/${status.txHash}`}
                  target="_blank"
                  rel="noopener"
                  className="status-tx-link"
                >
                  View TX &nearr;
                </a>
              )}
            </div>
          )}

          {address && appFunded && (
            <div className="dapp-info-bar" style={{marginTop: 16}}>
              <span className="dapp-info-label">Signer Address (full):</span>
              <code className="dapp-info-addr">{appKeypair.publicKey()}</code>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => {
                  navigator.clipboard.writeText(appKeypair.publicKey());
                  setStatus({ type: "success", msg: "Signer address copied!" });
                  setTimeout(() => setStatus(null), 2000);
                }}
              >
                Copy
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <StellarSplitBillLogo size={34} logoSize={92} />
            <span className="footer-tag">Orange Belt · Stellar Journey to Mastery · 2026</span>
            <div className="footer-links">
              <a href="https://github.com/yt2025id-lab/stellar-split-bill" target="_blank" rel="noopener" title="GitHub">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
              </a>
              <a href={`${EXPLORER_BASE}/contract/${CORE_ID}`} target="_blank" rel="noopener" title="Stellar Expert">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
                  <path d="M2 12h20"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
