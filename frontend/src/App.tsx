import { useState, useEffect, useCallback } from "react";
import { isConnected, getAddress, requestAccess } from "@stellar/freighter-api";
import { Horizon, TransactionBuilder, Networks, xdr, Keypair, Operation } from "stellar-sdk";

const HORIZON_URL = import.meta.env.VITE_HORIZON_URL || "https://horizon-testnet.stellar.org";
const RPC_URL = import.meta.env.VITE_RPC_URL || "https://soroban-testnet.stellar.org";
const TOKEN_ID = import.meta.env.VITE_TOKEN_CONTRACT || "CCJ5MEBLFYVFOPN4EDO53IFQOCBWHO7SGIFEWXSKCTNHGTBZ6TTY53X5";
const CORE_ID = import.meta.env.VITE_CORE_CONTRACT || "CCRVTPOVHJZ7KLANM2AEPIQPLSDWIDK2M66GJQHFEHJVJPHGDCKQOGJ3";

const server = new Horizon.Server(HORIZON_URL);
const appKeypair = Keypair.random();

type TxState = "idle" | "pending" | "success" | "fail";

function rpcCall(method: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
  return fetch(RPC_URL, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  }).then((r) => r.json().then((d) => {
    if (d.error) throw new Error(d.error.message ?? JSON.stringify(d.error));
    return d.result as Record<string, unknown>;
  }));
}

interface Bill { id: number; creator: string; description: string; total_amount: number; share_per_person: number; payer_count: number; paid_count: number; completed: boolean; }

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
      .catch(() => { server.loadAccount(appKeypair.publicKey()).then(() => setAppFunded(true)).catch(() => {}); });
  }, []);

  useEffect(() => {
    isConnected().then((r) => { if (r.isConnected) getAddress().then(({ address: a }) => { setAddress(a); setWalletName("Freighter"); fetchBal(a); }); }).catch(() => {});
  }, []);

  const fetchBal = useCallback(async (addr: string) => {
    setFetching(true);
    try { const acct = await server.loadAccount(addr); setBalance(acct.balances.find((b:{asset_type:string})=>b.asset_type==="native")?.balance??"0"); }
    catch { setBalance("0"); }
    finally { setFetching(false); }
  }, []);
  useEffect(() => { if (address) fetchBal(address); }, [address, fetchBal]);

  const connect = async () => {
    const { address: addr, error: e } = await requestAccess();
    if (e || !addr) return setStatus({ type: "error", msg: "Freighter not found" });
    setAddress(addr); setWalletName("Freighter"); await fetchBal(addr);
  };

  const disconnect = () => { setAddress(null); setBalance(null); setWalletName(""); setStatus(null); };

  async function simSignSend(op: (auth?: xdr.SorobanAuthorizationEntry[]) => xdr.Operation): Promise<string> {
    const acct = await server.loadAccount(appKeypair.publicKey());
    const raw = new TransactionBuilder(acct, { fee: "100000", networkPassphrase: Networks.TESTNET }).addOperation(op()).setTimeout(300).build();
    const sim = await rpcCall("simulateTransaction",{transaction:raw.toXDR()}) as unknown as {minResourceFee:string;transactionData:string;result?:{auth?:string[]};error?:string};
    if (sim.error) throw new Error(sim.error);
    const rf=parseInt(sim.minResourceFee||"0",10)||0; const fee=(parseInt(raw.fee,10)+rf).toString();
    const sd=sim.transactionData?xdr.SorobanTransactionData.fromXDR(sim.transactionData,"base64"):undefined;
    const auth:xdr.SorobanAuthorizationEntry[]=[]; if(sim.result?.auth)for(const a of sim.result.auth)auth.push(xdr.SorobanAuthorizationEntry.fromXDR(a,"base64"));
    const fresh=await server.loadAccount(appKeypair.publicKey());
    const tx=new TransactionBuilder(fresh,{fee,networkPassphrase:Networks.TESTNET,sorobanData:sd}).addOperation(op(auth.length>0?auth:undefined)).setTimeout(300).build();
    tx.sign(appKeypair);
    return ((await rpcCall("sendTransaction",{transaction:tx.toXDR()})) as unknown as {hash:string}).hash;
  }

  const createBill = async () => {
    const pa = payersList.filter(p=>p.length>0); if(!desc||!amount||pa.length===0)return;
    setBillTx("pending"); setStatus(null);
    try {
      const args: xdr.ScVal[] = [xdr.ScVal.scvAddress(appKeypair.publicKey()),xdr.ScVal.scvString(desc),xdr.ScVal.scvI128(BigInt(amount)),xdr.ScVal.scvU32(pa.length)];
      args.push(xdr.ScVal.scvVec(pa.map((a):xdr.ScVal=>xdr.ScVal.scvAddress(a))));
      const hash=await simSignSend((auth)=>Operation.invokeContractFunction({contract:CORE_ID,function:"create_bill",args,auth}));
      setStatus({type:"success",msg:`Bill created! TX: ${hash.slice(0,12)}…`}); setDesc("");setAmount("");setPayers("");setPayersList([]);
      setBillTx("success"); setTimeout(()=>setBillTx("idle"),2000);
    }catch(e:unknown){setBillTx("fail");setStatus({type:"error",msg:(e as Error).message});}
  };

  const markPaid = async (billId: number) => {
    setPayTx("pending"); setStatus(null);
    try {
      const hash=await simSignSend((auth)=>Operation.invokeContractFunction({contract:CORE_ID,function:"mark_paid",args:[xdr.ScVal.scvAddress(appKeypair.publicKey()),xdr.ScVal.scvU32(billId)],auth}));
      setStatus({type:"success",msg:`Paid! TX: ${hash.slice(0,12)}…`}); setPayTx("success"); setTimeout(()=>setPayTx("idle"),2000);
    }catch(e:unknown){setPayTx("fail");setStatus({type:"error",msg:(e as Error).message});}
  };

  const loadBills = async () => {
    try{setPayTx("pending");const h=await simSignSend(()=>Operation.invokeContractFunction({contract:CORE_ID,function:"get_all_bills",args:[]}));setStatus({type:"success",msg:`Refreshed — TX: ${h.slice(0,12)}…`});setPayTx("idle");}catch(e:unknown){setPayTx("fail");setStatus({type:"error",msg:(e as Error).message});}
  };

  const fmt = (a: string) => `${a.slice(0, 5)}…${a.slice(-4)}`;

  return (
    <div className="bg-paper text-inherit font-sans overflow-x-hidden min-h-screen" style={{background:"var(--paper)", color:"var(--ink)"}}>
      {/* ═══════ NAV ═══════ */}
      <nav className="navbar" style={{background:"rgba(251,247,237,0.9)"}}>
        <div className="navbar-inner">
          <span className="font-display text-2xl tracking-tight">💸 SPLIT BILL</span>
          <div className="flex items-center gap-3">
            {address ? (
              <>
                <span className="hidden sm:inline font-mono text-xs px-3 py-1.5 border-3 bg-lime font-bold">{fmt(address)}</span>
                <span className="font-mono text-xs font-bold px-3 py-1.5 border-3 bg-yellow">{fetching?"…":balance?Number(balance).toFixed(1)+" XLM":"…"}</span>
                <button onClick={disconnect} className="brutal-btn px-4 py-1.5 text-xs bg-white hover:bg-pink hover:text-white font-display">DISCONNECT</button>
              </>
            ) : (
              <button onClick={connect} className="brutal-btn px-6 py-2 text-sm bg-yellow font-display tracking-wider">
                CONNECT WALLET
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ═══════ HERO ═══════ */}
      <section className="hero">
        <div className="animate-fade-up stagger-1">
          <span className="inline-block font-mono text-xs font-bold uppercase tracking-wider px-4 py-1.5 border-3 bg-yellow shadow-brutal-sm mb-6">🟠 Orange Belt · Stellar Journey to Mastery</span>
        </div>
        <h1 className="animate-fade-up stagger-2 font-display text-6xl md:text-8xl leading-tight uppercase tracking-tighter mb-6">
          <span className="gradient-text">Split any bill.</span><br/>
          <span>Zero drama.</span>
        </h1>
        <p className="animate-fade-up stagger-3 max-w-2xl mx-auto font-mono text-sm md:text-base text-muted leading-relaxed mb-10">
          A decentralized expense-sharing protocol on Stellar Soroban. Create a bill, invite friends with their wallet addresses, and track payments in real-time via smart contracts.
        </p>
        <div className="animate-fade-up stagger-4 flex flex-wrap justify-center gap-4">
          <a href="#dapp" className="brutal-btn inline-block px-10 py-4 text-lg bg-ink text-yellow font-display tracking-wider">LAUNCH DAPP ↓</a>
          <a href="https://github.com/yt2025id-lab/stellar-split-bill" target="_blank" rel="noopener" className="brutal-btn inline-block px-10 py-4 text-lg bg-white font-display tracking-wider">GITHUB ↗</a>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section className="features-section section">
        <div className="container">
          <div className="text-center mb-16">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted">Why Split Bill</span>
            <h2 className="font-display text-4xl md:text-5xl uppercase mb-2 mt-3">Built Different</h2>
          </div>
          <div className="features-grid">
            {[
              { icon: "🔒", title: "On-Chain Settlement", desc: "Every payment tracked immutably on Stellar Soroban. No disputes, no 'I already paid' arguments." },
              { icon: "⚡", title: "Inter-Contract Magic", desc: "Split Core calls Split Token to burn obligation tokens automatically. True composability." },
              { icon: "🎯", title: "Even Splits, Always", desc: "Smart contract enforces exact division. No remainder, no rounding errors, no awkward math." },
            ].map((f,i) => (
              <div key={i} className="brutal-card p-8 flex flex-col items-start gap-4">
                <span className="text-4xl">{f.icon}</span>
                <h3 className="font-display text-xl uppercase">{f.title}</h3>
                <p className="font-mono text-xs leading-relaxed text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-muted">Simple Process</span>
            <h2 className="font-display text-4xl md:text-5xl uppercase mb-2 mt-3">How It Works</h2>
          </div>
          <div className="steps-grid">
            {[
              { step: "01", title: "Create Bill", desc: "Enter the expense, total amount, and your friends' Stellar addresses." },
              { step: "02", title: "Mint Tokens", desc: "Each payer gets obligation tokens equal to their share of the bill." },
              { step: "03", title: "Mark Paid", desc: "Pay your share. The contract burns your tokens — proof you've settled." },
              { step: "04", title: "Auto Complete", desc: "When everyone pays, the bill auto-completes. No chasing required." },
            ].map((s,i) => (
              <div key={i} className="brutal-card relative p-6 pt-12">
                <span className="absolute -top-3 -right-3 w-10 h-10 flex items-center justify-center font-display text-lg bg-yellow border-3 shadow-brutal-sm">{s.step}</span>
                <h3 className="font-display text-lg uppercase mb-2">{s.title}</h3>
                <p className="font-mono text-xs leading-relaxed text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ DAPP ═══════ */}
      <section id="dapp" className="dapp-section section">
        <div className="container-sm">
          <div className="text-center mb-12">
            <span className="font-mono text-xs font-bold uppercase tracking-wider" style={{color:"var(--yellow)"}}>Try It Now</span>
            <h2 className="font-display text-4xl md:text-5xl uppercase mb-2 mt-3">Launch dApp</h2>
            <p className="font-mono text-xs text-muted mt-3">Connect Freighter wallet to start splitting bills</p>
          </div>

          {status && (
            <div className={`status-bar ${status.type==="success"?"status-success":status.type==="error"?"status-error":"status-pending"}`}>
              {status.msg}
            </div>
          )}

          {!address ? (
            <div className="text-center py-16">
              <span className="text-6xl block mb-6">🔌</span>
              <p className="font-mono text-sm text-muted mb-6">Connect your Freighter wallet to get started</p>
              <button onClick={connect} className="brutal-btn px-10 py-4 text-lg bg-yellow font-display tracking-wider" style={{borderColor:"var(--yellow)"}}>CONNECT FREIGHTER</button>
            </div>
          ) : !appFunded ? (
            <div className="text-center py-16">
              <span className="text-6xl block mb-6 animate-float">⏳</span>
              <p className="font-mono text-sm text-muted">Funding signer account via Friendbot…</p>
            </div>
          ) : (
            <>
              <div className="brutal-card bg-white p-6 mb-8" style={{color:"var(--ink)"}}>
                <h3 className="font-display text-xl uppercase mb-4">Create New Bill</h3>
                <input className="brutal-input mb-3" placeholder="What's this for? (Pizza Party, Rent…)" value={desc} onChange={e=>setDesc(e.target.value)} />
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <input className="brutal-input" type="number" placeholder="Total (stroops)" value={amount} onChange={e=>setAmount(e.target.value)} />
                  <input className="brutal-input" type="number" placeholder="# Payers" value={payers} onChange={e=>{const n=Number(e.target.value)||0;setPayers(e.target.value);const a=[...payersList];while(a.length<n)a.push("");setPayersList(a.slice(0,n));}} />
                </div>
                {payersList.map((p,i)=>(
                  <input key={i} className="brutal-input mb-2" placeholder={`Payer ${i+1} Stellar address (G…)`} value={p} onChange={e=>{const a=[...payersList];a[i]=e.target.value;setPayersList(a);}} style={{fontSize:"0.7rem"}} />
                ))}
                <button onClick={createBill} disabled={billTx==="pending"||!desc||!amount||payersList.filter(p=>p).length===0} className="brutal-btn w-full py-4 text-base bg-yellow font-display tracking-wider mt-2">
                  {billTx==="pending"?"CREATING…":"➕ CREATE BILL"}
                </button>
              </div>

              <div className="brutal-card bg-white p-6" style={{color:"var(--ink)"}}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl uppercase">Active Bills</h3>
                  <button onClick={loadBills} className="brutal-btn px-4 py-1.5 text-xs bg-cyan font-display tracking-wider">REFRESH</button>
                </div>
                {bills.length===0 ? (
                  <p className="font-mono text-xs text-muted text-center py-12">No bills yet. Create your first one above!</p>
                ) : bills.map(b=>(
                  <div key={b.id} className="bill-card">
                    <div className="flex items-start justify-between mb-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 border-2 bg-cyan">#{b.id}</span>
                      <span className={`font-mono text-xs font-bold uppercase px-2 py-0.5 border-2 ${b.completed?"bg-lime":"bg-yellow"}`}>{b.completed?"DONE":"ACTIVE"}</span>
                    </div>
                    <h4 className="font-display text-lg uppercase mb-2">{b.description}</h4>
                    <div className="flex flex-wrap gap-4 font-mono text-xs text-muted mb-3">
                      <span>💰 {b.total_amount/1e7} XLM</span>
                      <span>👤 {b.share_per_person/1e7} each</span>
                      <span>✅ {b.paid_count}/{b.payer_count} paid</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{width:`${b.payer_count>0?(b.paid_count/b.payer_count)*100:0}%`}} />
                    </div>
                    {!b.completed && (
                      <button onClick={()=>markPaid(b.id)} disabled={payTx==="pending"} className="brutal-btn w-full py-2.5 text-sm bg-lime font-display tracking-wider">
                        {payTx==="pending"?"PAYING…":`💳 MARK AS PAID — ${b.share_per_person/1e7} XLM`}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="footer">
        <div className="container text-center">
          <p className="font-display text-2xl uppercase mb-2">💸 Stellar Split Bill</p>
          <p className="font-mono text-xs text-muted mb-4">Orange Belt · Stellar Journey to Mastery · June 2026</p>
          <div className="flex justify-center gap-4">
            <a href="https://github.com/yt2025id-lab/stellar-split-bill" target="_blank" rel="noopener" className="font-mono text-xs font-bold uppercase border-3 bg-white hover:bg-yellow transition-colors px-4 py-2">GitHub</a>
            <a href="https://stellar.expert/explorer/testnet/contract/CCRVTPOVHJZ7KLANM2AEPIQPLSDWIDK2M66GJQHFEHJVJPHGDCKQOGJ3" target="_blank" rel="noopener" className="font-mono text-xs font-bold uppercase border-3 bg-white hover:bg-cyan transition-colors px-4 py-2">Contract</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
