import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { isConnected, getAddress, requestAccess, signTransaction } from "@stellar/freighter-api";
import { Horizon, TransactionBuilder, Networks, xdr, Keypair, Operation, Address } from "stellar-sdk";

const HORIZON_URL = import.meta.env.VITE_HORIZON_URL || "https://horizon-testnet.stellar.org";
const RPC_URL = import.meta.env.VITE_RPC_URL || "https://soroban-testnet.stellar.org";
const FACTORY_ID = import.meta.env.VITE_FACTORY_CONTRACT || "CDJKY6Q5ZZDOTENXZTA7YBJGDSKGMIDCJG4ZSTBSNUX3F5EBWJ57C2KO";
const VAULT_WASM = import.meta.env.VITE_VAULT_WASM_HASH || "c7634a97b809c02d5fddb61da2745890891d63e89b9d16b8f527e8c91686c5af";
const NATIVE_TOKEN = import.meta.env.VITE_NATIVE_TOKEN || "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const EXPLORER_BASE = "https://stellar.expert/explorer/testnet";

const server = new Horizon.Server(HORIZON_URL);

function getOrCreateKeypair(): Keypair {
  const stored = localStorage.getItem("sb_app_sk");
  if (stored) { try { return Keypair.fromSecret(stored); } catch {} }
  const kp = Keypair.random(); localStorage.setItem("sb_app_sk", kp.secret()); return kp;
}
const appKP = getOrCreateKeypair();

function scvAddr(a: string): xdr.ScVal { return new Address(a).toScVal(); }
function scvStr(s: string): xdr.ScVal { return xdr.ScVal.scvString(s); }
function scvI128(n: bigint): xdr.ScVal {
  return xdr.ScVal.scvI128(new xdr.Int128Parts({
    hi: new xdr.Int64(BigInt.asIntN(64, n >> 64n)),
    lo: new xdr.Uint64(BigInt.asUintN(64, n))
  }));
}
function scvU32(n: number): xdr.ScVal { return xdr.ScVal.scvU32(n); }
function scvVec(items: xdr.ScVal[]): xdr.ScVal { return xdr.ScVal.scvVec(items); }

type TxState = "idle" | "pending" | "success" | "fail";

interface Contribution { participant: string; amount: number; }

interface BillInfo {
  id: number; vault_id: string; creator: string; title: string;
  total_xlm: number; participant_count: number; deadline: number; settled: boolean;
  participants: string[]; shares: number[];
  contributions: Contribution[];
  status: string; withdrawn: boolean;
  isCreator: boolean; isParticipant: boolean; userShare: number; userPaid: boolean;
}

function parseBillFromMap(mapEntries: any[]): Record<string, xdr.ScVal> {
  const fields: Record<string, xdr.ScVal> = {};
  for (let i = 0; i < mapEntries.length; i++) {
    try {
      const entry = mapEntries[i];
      let keyStr = "";
      try { keyStr = entry.key().sym()?.toString() ?? ""; } catch {}
      if (!keyStr) continue;
      let val: xdr.ScVal | undefined;
      try { val = entry.val(); } catch { try { val = entry.value(); } catch {} }
      if (!val) continue;
      fields[keyStr] = val;
    } catch {}
  }
  return fields;
}

function parseBillInfo(mapEntries: any[], id: number): BillInfo | null {
  try {
    const f = parseBillFromMap(mapEntries);
    const addr = (scv: xdr.ScVal | undefined) => { try { return scv ? Address.fromScVal(scv).toString() : ""; } catch { return ""; } };
    const vaultId = addr(f.vault_id);
    const creator = addr(f.creator);
    const title = f.title?.str()?.toString() ?? "";
    const totalXlm = Number(f.total_xlm?.i128()?.lo ?? 0n);
    const pCount = Number(f.participant_count?.u32());
    const deadline = Number(f.deadline?.u64()?.toString() ?? "0");
    let settled = false;
    if (f.settled) { try { settled = f.settled.bool(); } catch { try { settled = (f.settled.u32() ?? 0) !== 0; } catch {} } }

    const participants: string[] = [];
    if (f.participants) { let v; try { v = f.participants.vec(); } catch {} if (v) for (const p of v) { try { participants.push(Address.fromScVal(p).toString()); } catch {} } }
    const shares: number[] = [];
    if (f.shares) { let v; try { v = f.shares.vec(); } catch {} if (v) for (const s of v) { try { shares.push(Number(s.i128()?.lo ?? 0n)); } catch {} } }

    return {
      id, vault_id: vaultId, creator, title,
      total_xlm: totalXlm, participant_count: pCount, deadline, settled,
      participants, shares,
      contributions: [], status: settled ? "Settled" : "Pending", withdrawn: false,
      isCreator: false, isParticipant: false, userShare: 0, userPaid: false,
    };
  } catch { return null; }
}

async function rpcCall(method: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
  const r = await fetch(RPC_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) });
  const d = await r.json(); if (d.error) throw new Error(d.error.message ?? JSON.stringify(d.error));
  return d.result as Record<string, unknown>;
}

async function ensureFunded() {
  for (let i = 0; i < 3; i++) {
    try { await server.loadAccount(appKP.publicKey()); return; } catch { if (i === 2) break; }
    try { await fetch(`https://friendbot.stellar.org?addr=${appKP.publicKey()}`); } catch {}
    await new Promise((r) => setTimeout(r, 2000));
  }
  await server.loadAccount(appKP.publicKey());
}

async function deployVault(salt: Buffer): Promise<string> {
  const wasmHash = Buffer.from(VAULT_WASM, "hex");
  const deployerAddr = new Address(appKP.publicKey());
  const enc = new TextEncoder();
  const passBytes = enc.encode(Networks.TESTNET);
  const hashBuf = await crypto.subtle.digest("SHA-256", passBytes);
  const netId = xdr.Hash.fromXDR(Buffer.from(hashBuf).toString("hex"), "hex");
  const preimage = xdr.HashIdPreimage.envelopeTypeContractId(
    new xdr.HashIdPreimageContractId({
      networkId: netId,
      contractIdPreimage: xdr.ContractIdPreimage.contractIdPreimageFromAddress(
        new xdr.ContractIdPreimageFromAddress({ address: deployerAddr.toScAddress(), salt })
      ),
    })
  );
  const preimageHash = await crypto.subtle.digest("SHA-256", Buffer.from(preimage.toXDR(), "base64"));
  const hash = xdr.Hash.fromXDR(Buffer.from(preimageHash).toString("hex"), "hex");
  const vaultId = Address.fromScAddress(xdr.ScAddress.scAddressTypeContract(hash));

  const acct = await server.loadAccount(appKP.publicKey());
  const raw = new TransactionBuilder(acct, { fee: "100000", networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.createCustomContract({ address: deployerAddr, wasmHash, salt }))
    .setTimeout(300).build();

  const sim = await rpcCall("simulateTransaction", { transaction: raw.toXDR() }) as unknown as { minResourceFee: string; transactionData: string; results?: Array<{ auth?: string[] }>; error?: string };
  if (sim.error) throw new Error(`Vault deploy sim failed: ${sim.error}`);

  const deployAuth: xdr.SorobanAuthorizationEntry[] = [];
  if (sim.results?.[0]?.auth) {
    for (const a of sim.results[0].auth) {
      deployAuth.push(xdr.SorobanAuthorizationEntry.fromXDR(a, "base64"));
    }
  }

  const fee = (parseInt(raw.fee, 10) + parseInt(sim.minResourceFee || "0", 10)).toString();
  const sd = xdr.SorobanTransactionData.fromXDR(sim.transactionData, "base64");
  const fresh = await server.loadAccount(appKP.publicKey());
  const tx = new TransactionBuilder(fresh, { fee, networkPassphrase: Networks.TESTNET, sorobanData: sd })
    .addOperation(Operation.createCustomContract({ address: deployerAddr, wasmHash, salt, auth: deployAuth.length > 0 ? deployAuth : undefined }))
    .setTimeout(300).build();
  tx.sign(appKP);

  const send = await rpcCall("sendTransaction", { transaction: tx.toXDR() }) as unknown as { hash: string; errorResult?: string };
  if (send.errorResult) throw new Error(`Vault deploy failed: ${send.errorResult}`);
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const st = await rpcCall("getTransaction", { hash: send.hash }) as { status: string };
    if (st.status === "SUCCESS") return vaultId.toString();
    if (st.status === "FAILED") throw new Error("Vault deploy failed");
  }
  throw new Error("Vault deploy timed out");
}

async function simSignSend(contractId: string, func: string, args: xdr.ScVal[]): Promise<{ hash: string }> {
  await ensureFunded();
  const acct = await server.loadAccount(appKP.publicKey());
  const raw = new TransactionBuilder(acct, { fee: "100000", networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.invokeContractFunction({ contract: contractId, function: func, args }))
    .setTimeout(300).build();

  const sim = await rpcCall("simulateTransaction", { transaction: raw.toXDR() }) as unknown as { minResourceFee: string; transactionData: string; results?: Array<{ auth?: string[] }>; error?: string };
  if (sim.error) throw new Error(`Sim failed: ${sim.error}`);

  const fee = (parseInt(raw.fee, 10) + parseInt(sim.minResourceFee || "0", 10)).toString();
  const sd = xdr.SorobanTransactionData.fromXDR(sim.transactionData, "base64");
  
  const auth: xdr.SorobanAuthorizationEntry[] = [];
  if (sim.results?.[0]?.auth) {
    for (const a of sim.results[0].auth) {
      auth.push(xdr.SorobanAuthorizationEntry.fromXDR(a, "base64"));
    }
  }

  const fresh = await server.loadAccount(appKP.publicKey());
  const tx = new TransactionBuilder(fresh, { fee, networkPassphrase: Networks.TESTNET, sorobanData: sd })
    .addOperation(Operation.invokeContractFunction({ contract: contractId, function: func, args, auth: auth.length > 0 ? auth : undefined }))
    .setTimeout(300).build();
  tx.sign(appKP);

  const send = await rpcCall("sendTransaction", { transaction: tx.toXDR() }) as unknown as { hash?: string; errorResult?: string };
  if (!send.hash) throw new Error(`TX send failed: ${JSON.stringify(send)}`);
  if (send.errorResult) throw new Error(`TX failed: ${send.errorResult}`);
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const st = await rpcCall("getTransaction", { hash: send.hash }) as { status: string };
    if (st.status === "SUCCESS") return { hash: send.hash };
    if (st.status === "FAILED") throw new Error(`${func} failed: ${JSON.stringify((st as Record<string, unknown>).result ?? st)}`);
  }
  throw new Error(`${func} timed out`);
}

async function simSignUser(contractId: string, func: string, args: xdr.ScVal[], userAddr: string): Promise<{ hash: string }> {
  await ensureFunded();
  const acct = await server.loadAccount(appKP.publicKey());
  const raw = new TransactionBuilder(acct, { fee: "100000", networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.invokeContractFunction({ contract: contractId, function: func, args }))
    .setTimeout(300).build();

  const sim = await rpcCall("simulateTransaction", { transaction: raw.toXDR() }) as unknown as { minResourceFee: string; transactionData: string; results?: Array<{ auth?: string[] }>; error?: string };
  if (sim.error) throw new Error(`Sim failed: ${sim.error}`);

  const fee = (parseInt(raw.fee, 10) + parseInt(sim.minResourceFee || "0", 10)).toString();
  const sd = xdr.SorobanTransactionData.fromXDR(sim.transactionData, "base64");

  const auth: xdr.SorobanAuthorizationEntry[] = [];
  if (sim.results?.[0]?.auth) {
    for (const a of sim.results[0].auth) {
      auth.push(xdr.SorobanAuthorizationEntry.fromXDR(a, "base64"));
    }
  }

  const fresh = await server.loadAccount(appKP.publicKey());
  const tx = new TransactionBuilder(fresh, { fee, networkPassphrase: Networks.TESTNET, sorobanData: sd })
    .addOperation(Operation.invokeContractFunction({ contract: contractId, function: func, args, auth: auth.length > 0 ? auth : undefined }))
    .setTimeout(300).build();

  tx.sign(appKP);

  const signedXdr = await signTransaction(tx.toXDR(), { networkPassphrase: Networks.TESTNET, accountToSign: userAddr });
  const send = await rpcCall("sendTransaction", { transaction: signedXdr }) as unknown as { hash?: string; errorResult?: string };
  if (!send.hash) throw new Error(`TX send failed: ${JSON.stringify(send)}`);
  if (send.errorResult) throw new Error(`TX failed: ${send.errorResult}`);
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const st = await rpcCall("getTransaction", { hash: send.hash }) as { status: string };
    if (st.status === "SUCCESS") return { hash: send.hash };
    if (st.status === "FAILED") throw new Error(`${func} failed: ${JSON.stringify((st as Record<string, unknown>).result ?? st)}`);
  }
  throw new Error(`${func} timed out`);
}

async function queryContributions(vaultId: string): Promise<{ contributions: Contribution[]; withdrawn: boolean }> {
  try {
    const acct = await server.loadAccount(appKP.publicKey());
    const raw = new TransactionBuilder(acct, { fee: "100", networkPassphrase: Networks.TESTNET })
      .addOperation(Operation.invokeContractFunction({ contract: vaultId, function: "get_details", args: [] }))
      .setTimeout(300).build();
    const sim = await rpcCall("simulateTransaction", { transaction: raw.toXDR() }) as unknown as { results?: Array<{ xdr?: string }>; error?: string };
    if (sim.error || !sim.results?.[0]?.xdr) return { contributions: [], withdrawn: false };
    
    const rv = xdr.ScVal.fromXDR(sim.results[0].xdr, "base64");
    const fields = rv.vec();
    if (!fields || fields.length < 8) return { contributions: [], withdrawn: false };
    
    let withdrawn = false;
    if (fields[7]) { try { withdrawn = fields[7].bool(); } catch {} }

    const raw2 = new TransactionBuilder(acct, { fee: "100", networkPassphrase: Networks.TESTNET })
      .addOperation(Operation.invokeContractFunction({ contract: vaultId, function: "get_contributions", args: [] }))
      .setTimeout(300).build();
    const sim2 = await rpcCall("simulateTransaction", { transaction: raw2.toXDR() }) as unknown as { results?: Array<{ xdr?: string }>; error?: string };
    
    const contributions: Contribution[] = [];
    if (sim2.results?.[0]?.xdr) {
      const cv = xdr.ScVal.fromXDR(sim2.results[0].xdr, "base64");
      const vec = cv.vec();
      if (vec) {
        for (const v of vec) {
          let mv; try { mv = v.map(); } catch {}
          if (mv) {
            const f = parseBillFromMap(mv);
            const addr = (scv: xdr.ScVal | undefined) => { try { return scv ? Address.fromScVal(scv).toString() : ""; } catch { return ""; } };
            contributions.push({
              participant: addr(f.participant),
              amount: Number(f.amount?.i128()?.lo ?? 0n),
            });
          }
        }
      }
    }
    return { contributions, withdrawn };
  } catch {
    return { contributions: [], withdrawn: false };
  }
}

export default function Dashboard() {
  const [addr, setAddr] = useState<string | null>(null);
  const [bal, setBal] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);
  const [appFunded, setAppFunded] = useState(false);
  const [walletName, setWalletName] = useState("");

  const [bills, setBills] = useState<BillInfo[]>([]);
  const [desc, setDesc] = useState("");
  const [totalXlm, setTotalXlm] = useState("");
  const [numPayers, setNumPayers] = useState("");
  const [payerAddrs, setPayerAddrs] = useState<string[]>([]);
  const [payerShares, setPayerShares] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createTx, setCreateTx] = useState<TxState>("idle");
  const [payTx, setPayTx] = useState<TxState>("idle");
  const [status, setStatus] = useState<{ type: string; msg: string; txHash?: string } | null>(null);
  const [showWm, setShowWm] = useState(false);
  const [showSuccess, setShowSuccess] = useState<{ index: number; vaultId: string; title: string; txHash: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sp] = useSearchParams();

  useEffect(() => { ensureFunded().then(() => setAppFunded(true)).catch(() => setAppFunded(false)); }, []);

  useEffect(() => {
    isConnected().then((r) => { if (r.isConnected) getAddress().then(({ address: a }) => { setAddr(a); setWalletName("Freighter"); fetchBal(a); }); }).catch(() => {});
  }, []);

  const fetchBal = useCallback(async (a: string) => {
    setFetching(true);
    try { const acct = await server.loadAccount(a); setBal(acct.balances.find((b: { asset_type: string }) => b.asset_type === "native")?.balance ?? "0"); } catch { setBal("0"); }
    finally { setFetching(false); }
  }, []);

  useEffect(() => { if (addr) fetchBal(addr); }, [addr, fetchBal]);

  const connectWallet = async (walletId: string) => {
    try {
      if (walletId === "freighter") {
        const { address: a, error: e } = await requestAccess();
        if (e || !a) { setStatus({ type: "error", msg: "Install Freighter extension." }); return; }
        setAddr(a); setWalletName("Freighter"); await fetchBal(a);
      } else if (walletId === "albedo") {
        const albedo = (window as unknown as Record<string, unknown>).albedo as { publicKey: () => Promise<{ pubkey: string }> } | undefined;
        if (!albedo) { setStatus({ type: "error", msg: "Install Albedo extension." }); return; }
        try { const { pubkey } = await albedo.publicKey(); setAddr(pubkey); setWalletName("Albedo"); await fetchBal(pubkey); }
        catch { setStatus({ type: "error", msg: "Albedo rejected." }); return; }
      } else if (walletId === "xbull") {
        const xbull = (window as unknown as Record<string, unknown>).xBullSDK as { getPublicKey: () => Promise<string> } | undefined;
        if (!xbull) { setStatus({ type: "error", msg: "Install xBull from xbull.app" }); return; }
        try { const pk = await xbull.getPublicKey(); setAddr(pk); setWalletName("xBull"); await fetchBal(pk); }
        catch { setStatus({ type: "error", msg: "xBull rejected." }); return; }
      } else if (walletId === "rabet") {
        const rabet = (window as unknown as Record<string, unknown>).rabet as { connect: () => Promise<{ publicKey: string }> } | undefined;
        if (!rabet) { setStatus({ type: "error", msg: "Install Rabet from rabet.io" }); return; }
        try { const { publicKey: pk } = await rabet.connect(); setAddr(pk); setWalletName("Rabet"); await fetchBal(pk); }
        catch { setStatus({ type: "error", msg: "Rabet rejected." }); return; }
      }
      setShowWm(false);
    } catch { setStatus({ type: "error", msg: "Wallet not found." }); }
  };

  const disconnect = () => { setAddr(null); setBal(null); setWalletName(""); setBills([]); setStatus(null); };

  const loadBillByIndex = async (index: number) => {
    setLoading(true); setStatus(null);
    try {
      await ensureFunded();
      const acct = await server.loadAccount(appKP.publicKey());
      const raw = new TransactionBuilder(acct, { fee: "100", networkPassphrase: Networks.TESTNET })
        .addOperation(Operation.invokeContractFunction({ contract: FACTORY_ID, function: "get_bill_by_index", args: [scvU32(index)] }))
        .setTimeout(300).build();
      const sim = await rpcCall("simulateTransaction", { transaction: raw.toXDR() }) as unknown as { results?: Array<{ xdr?: string }>; error?: string };
      if (sim.error || !sim.results?.[0]?.xdr) throw new Error("Bill not found");

      const rv = xdr.ScVal.fromXDR(sim.results[0].xdr, "base64");
      const mapEntries = rv.map();
      if (!mapEntries) throw new Error("Invalid bill data");
      const bill = parseBillInfo(mapEntries, index);
      if (!bill) throw new Error("Failed to parse bill");
      bill.isCreator = !!addr && bill.creator === addr;
      bill.isParticipant = !!addr && bill.participants.includes(addr);
      if (bill.isParticipant) {
        const uIdx = bill.participants.indexOf(addr!);
        bill.userShare = uIdx >= 0 ? (bill.shares[uIdx] ?? bill.total_xlm / bill.participant_count) : bill.total_xlm / bill.participant_count;
      }
      const { contributions, withdrawn } = await queryContributions(bill.vault_id);
      bill.contributions = contributions;
      bill.withdrawn = withdrawn;
      bill.userPaid = !!addr && contributions.some(c => c.participant === addr);
      bill.status = bill.settled ? "Settled" : "Pending";
      setBills([bill]);
      setStatus({ type: "success", msg: "Bill loaded!" });
    } catch (e: unknown) { setStatus({ type: "error", msg: (e as Error).message }); }
    finally { setLoading(false); }
  };

  const loadBills = async () => {
    if (!addr) return;
    setLoading(true); setStatus(null);
    try {
      await ensureFunded();
      const acct = await server.loadAccount(appKP.publicKey());
      const raw = new TransactionBuilder(acct, { fee: "100", networkPassphrase: Networks.TESTNET })
        .addOperation(Operation.invokeContractFunction({ contract: FACTORY_ID, function: "get_bills_for_user", args: [scvAddr(addr)] }))
        .setTimeout(300).build();
      const sim = await rpcCall("simulateTransaction", { transaction: raw.toXDR() }) as unknown as { results?: Array<{ xdr?: string }>; error?: string };
      if (sim.error || !sim.results?.[0]?.xdr) throw new Error("No bills found");

      const rv = xdr.ScVal.fromXDR(sim.results[0].xdr, "base64");
      const vec = rv.vec();
      if (!vec) { setBills([]); setStatus({ type: "success", msg: "No bills yet" }); return; }

      const enriched: BillInfo[] = [];
      for (let i = 0; i < vec.length; i++) {
        const mapEntries = vec[i].map();
        if (!mapEntries) continue;
        const bill = parseBillInfo(mapEntries, i);
        if (!bill) continue;
        bill.isCreator = bill.creator === addr;
        bill.isParticipant = bill.participants.includes(addr);
        if (bill.isParticipant) {
          const uIdx = bill.participants.indexOf(addr);
          bill.userShare = uIdx >= 0 ? (bill.shares[uIdx] ?? bill.total_xlm / bill.participant_count) : bill.total_xlm / bill.participant_count;
        }
        const { contributions, withdrawn } = await queryContributions(bill.vault_id);
        bill.contributions = contributions;
        bill.withdrawn = withdrawn;
        bill.userPaid = contributions.some(c => c.participant === addr);
        bill.status = bill.settled || withdrawn ? "Settled" : "Pending";
        enriched.push(bill);
      }

      setBills(enriched);
      setStatus({ type: "success", msg: `${enriched.length} bill${enriched.length !== 1 ? "s" : ""} loaded` });
    } catch (e: unknown) { setStatus({ type: "error", msg: (e as Error).message }); }
    finally { setLoading(false); }
  };

  const billIndex = sp.get("bill");
  useEffect(() => {
    if (!appFunded) return;
    if (billIndex) {
      loadBillByIndex(Number(billIndex));
    } else if (addr) {
      loadBills();
    }
  }, [addr, billIndex, appFunded]);

  const createBill = async () => {
    const addrs = payerAddrs.filter((p) => p.length > 0);
    const sharesRaw = payerShares.filter((s) => s.length > 0);
    if (!desc || !totalXlm || addrs.length === 0 || sharesRaw.length === 0) return;
    if (addrs.length !== Number(numPayers) || sharesRaw.length !== Number(numPayers))
      return setStatus({ type: "error", msg: `Need ${numPayers} addresses and shares.` });

    const shares: bigint[] = []; let total = 0n;
    for (let i = 0; i < sharesRaw.length; i++) {
      const v = BigInt(sharesRaw[i]);
      if (v <= 0) return setStatus({ type: "error", msg: `Payer ${i + 1} share is 0 or negative.` });
      shares.push(v); total += v;
    }
    if (BigInt(totalXlm) !== total) return setStatus({ type: "error", msg: `Sum of shares (${total}) ≠ total (${totalXlm}).` });
    const invalid = addrs.find((a) => !a.startsWith("G") || a.length !== 56);
    if (invalid) return setStatus({ type: "error", msg: `Invalid address: "${invalid.slice(0, 12)}…"` });

    setCreating(true); setCreateTx("pending"); setStatus(null);
    try {
      setStatus({ type: "pending", msg: "Deploying vault..." });
      const salt = Keypair.random().rawPublicKey();
      const vaultId = await deployVault(salt);

      setStatus({ type: "pending", msg: "Initializing vault..." });
      await simSignSend(vaultId, "init", [
        scvAddr(FACTORY_ID), scvAddr(appKP.publicKey()),
        scvVec(addrs.map((a) => scvAddr(a))), scvVec(shares.map((s) => scvI128(s))),
        scvStr(desc), scvI128(BigInt(totalXlm)), scvAddr(NATIVE_TOKEN),
      ]);

      setStatus({ type: "pending", msg: "Registering in factory..." });
      const { hash } = await simSignSend(FACTORY_ID, "register_bill", [
        scvAddr(vaultId), scvAddr(appKP.publicKey()),
        scvVec(addrs.map((a) => scvAddr(a))), scvVec(shares.map((s) => scvI128(s))),
        scvStr(desc),
      ]);

      setStatus({ type: "success", msg: "Bill created! ", txHash: hash });
      setDesc(""); setTotalXlm(""); setNumPayers(""); setPayerAddrs([]); setPayerShares([]);
      setCreateTx("success"); setTimeout(() => setCreateTx("idle"), 2000);
      const newIndex = bills.length;
      setTimeout(() => setShowSuccess({ index: newIndex, vaultId, title: desc, txHash: hash }), 500);
      setTimeout(() => loadBills(), 1000);
    } catch (e: unknown) {
      setCreateTx("fail");
      setStatus({ type: "error", msg: e instanceof Error ? e.message : String(e) });
      setTimeout(() => setCreateTx("idle"), 2000);
    } finally { setCreating(false); }
  };

  const contribute = async (b: BillInfo) => {
    if (!addr) return setStatus({ type: "error", msg: "Connect wallet to contribute." });
    setPayTx("pending"); setStatus(null);
    try {
      const { hash } = await simSignUser(b.vault_id, "contribute", [scvAddr(addr)], addr);
      setStatus({ type: "success", msg: `Contributed ${(b.userShare / 1e7).toFixed(4)} XLM! `, txHash: hash });
      setPayTx("success"); setTimeout(() => setPayTx("idle"), 2000);
      loadBills();
    } catch (e: unknown) { setPayTx("fail"); setStatus({ type: "error", msg: (e as Error).message }); }
  };

  const claimBill = async (b: BillInfo) => {
    if (!addr) return setStatus({ type: "error", msg: "Connect wallet to claim." });
    setPayTx("pending"); setStatus(null);
    try {
      const { hash } = await simSignUser(b.vault_id, "withdraw", [scvAddr(addr)], addr);
      setStatus({ type: "success", msg: `Claimed ${(b.total_xlm / 1e7).toFixed(4)} XLM from vault! `, txHash: hash });
      setPayTx("success"); setTimeout(() => setPayTx("idle"), 2000);
      loadBills();
    } catch (e: unknown) { setPayTx("fail"); setStatus({ type: "error", msg: (e as Error).message }); }
  };

  const f = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

  return (
    <>
      {showWm && (
        <div className="wallet-modal-overlay" onClick={() => setShowWm(false)}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()}>
            <div className="wallet-modal-header">
              <h3>Connect Wallet</h3>
              <button className="wallet-modal-close" onClick={() => setShowWm(false)}>&times;</button>
            </div>
            <div className="wallet-modal-list">
              {[
                { id: "freighter", icon: <img src="/logoStellar.png" alt="" className="wallet-modal-logo" />, name: "Freighter" },
                { id: "albedo", icon: "A", name: "Albedo" },
                { id: "xbull", icon: "X", name: "xBull" },
                { id: "rabet", icon: "R", name: "Rabet" },
              ].map((w) => (
                <button key={w.id} className="wallet-modal-item" onClick={() => connectWallet(w.id)}>
                  <span className="wallet-modal-icon">{w.icon}</span>
                  <span className="wallet-modal-name">{w.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="wallet-modal-overlay" onClick={() => setShowSuccess(null)}>
          <div className="wallet-modal" onClick={(e) => e.stopPropagation()} style={{ padding: "24px", width: "420px" }}>
            <div className="wallet-modal-header">
              <h3>Bill Created!</h3>
              <button className="wallet-modal-close" onClick={() => setShowSuccess(null)}>&times;</button>
            </div>
            <div style={{ padding: "0 0 16px" }}>
              <p style={{ fontSize: "0.9rem", marginBottom: 12 }}><strong>{showSuccess.title}</strong> is now live on Stellar Testnet.</p>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 8 }}>
                <div>Vault: <code style={{ fontSize: "0.65rem" }}>{showSuccess.vaultId}</code></div>
                <div style={{ marginTop: 4 }}>TX: <a href={`${EXPLORER_BASE}/tx/${showSuccess.txHash}`} target="_blank" rel="noopener" style={{ color: "var(--accent-teal)" }}>{showSuccess.txHash.slice(0, 10)}…{showSuccess.txHash.slice(-6)}</a></div>
              </div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 16 }}>
                Share this link with participants so they can connect and contribute:
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input input-sm" readOnly value={`${window.location.origin}/app?bill=${showSuccess.index}`} style={{ flex: 1 }} />
                <button className="btn btn-primary btn-sm" onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/app?bill=${showSuccess.index}`);
                  setStatus({ type: "success", msg: "Link copied!" });
                }}>Copy</button>
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={() => setShowSuccess(null)}>OK, Got it</button>
          </div>
        </div>
      )}

      <div className="container" style={{ padding: "24px 20px 0" }}>
        <div className="dash-header">
          <Link to="/" className="btn btn-ghost btn-sm">&larr; Back</Link>
          <div className="dash-logo">
            <img src="/logoStellar.png" alt="" />
            <div className="dash-logo-text">
              <span className="dash-logo-name">Split Bill</span>
              <span className="dash-logo-tag">Decentralized Bill Splitting</span>
            </div>
          </div>
          <div className="dash-header-right">
            {addr ? (
              <button className="btn btn-ghost btn-sm" onClick={disconnect}>Disconnect</button>
            ) : (
              <button className="btn-connect" onClick={() => setShowWm(true)}>Connect Wallet</button>
            )}
          </div>
        </div>

        {addr && (
          <>
            <div className="wallet-info-card card card-full">
              <div className="wallet-info-row">
                <div className="wallet-info-item"><span className="wallet-info-label">Wallet</span><span className="wallet-info-value">{walletName}</span></div>
                <div className="wallet-info-item"><span className="wallet-info-label">Address</span><span className="wallet-info-value mono">{f(addr)}</span></div>
                <div className="wallet-info-item"><span className="wallet-info-label">Balance</span><span className="wallet-info-value highlight">{bal ? `${parseFloat(bal).toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM` : "..."}</span></div>
              </div>
            </div>
            <div className="guide-card card card-full">
              <h3 className="guide-title">How it works</h3>
              <div className="guide-steps">
                {[
                  { n: "1", t: "Creator: Create a Bill", d: "Enter expense, total XLM, and ALL friends' wallet addresses + shares. A vault is deployed on-chain." },
                  { n: "2", t: "Share the Link", d: "Copy & send the bill link to friends. Each opens it, connects their wallet, and contributes their share." },
                  { n: "3", t: "Auto-Settle", d: "When all shares are paid, the vault auto-sends the total to the creator via cross-contract call." },
                  { n: "4", t: "Creator Claims", d: "Creator withdraws collected XLM from the vault. Fully on-chain, no trust needed." },
                ].map((s, i) => (
                  <div key={i} className="guide-step"><span className="guide-num">{s.n}</span><div><strong>{s.t}</strong><p>{s.d}</p></div></div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="card card-full">
          <h2 className="guide-title" style={{ marginBottom: 14 }}>Create Bill</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 20 }}>
            {addr ? "Enter details below. Friends will receive a share link to contribute." : "Connect wallet first to create a bill as the creator."}
          </p>
          {addr || appFunded ? (
            <>
              <div className="form-group">
                <input className="input" placeholder="What's this for? (e.g. Dinner, Rent…)" value={desc} onChange={(e) => setDesc(e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <input className="input" type="number" placeholder="Total XLM (stroops)" value={totalXlm} onChange={(e) => setTotalXlm(e.target.value)} />
                </div>
                <div className="form-group">
                  <input className="input" type="number" placeholder="Number of payers" value={numPayers} onChange={(e) => {
                    const n = Number(e.target.value) || 0; setNumPayers(e.target.value);
                    const a = [...payerAddrs]; while (a.length < n) a.push(""); setPayerAddrs(a.slice(0, n));
                    const s = [...payerShares]; while (s.length < n) s.push(s[n - 1] ?? ""); setPayerShares(s.slice(0, n));
                  }} />
                </div>
              </div>
              {payerAddrs.map((_, i) => (
                <div key={i} className="form-row" style={{ marginBottom: 8 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input className="input input-sm" placeholder={`Payer ${i + 1} address (G…)${i === 0 && addr ? ' (you)' : ''}`} value={payerAddrs[i]} onChange={(e) => { const a = [...payerAddrs]; a[i] = e.target.value; setPayerAddrs(a); }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input className="input input-sm" type="number" placeholder={`Share (stroops)${i === 0 && addr ? ' — your portion' : ''}`} value={payerShares[i]} onChange={(e) => { const a = [...payerShares]; a[i] = e.target.value; setPayerShares(a); }} />
                  </div>
                </div>
              ))}
              <button onClick={createBill} disabled={creating || !desc || !totalXlm || !numPayers || payerAddrs.filter((p) => p).length !== Number(numPayers) || payerShares.filter((s) => s).length !== Number(numPayers)} className="btn btn-primary btn-lg btn-full">
                {creating ? "Deploying…" : "+ Create Bill"}
              </button>
            </>
          ) : (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>Connect wallet to create a bill.</p>
          )}
        </div>

        {(addr || billIndex) && (
          <div className="card card-full">
            <div className="dapp-card-header">
              <h3 className="guide-title" style={{ marginBottom: 0 }}>Bills</h3>
              {addr && <button onClick={loadBills} className="btn btn-secondary btn-sm">Refresh</button>}
            </div>
            {loading ? (
              <div className="empty-state"><p>Loading bills from chain…</p></div>
            ) : bills.length === 0 ? (
              <div className="empty-state"><p>No bills yet. {addr ? "Click Refresh to load your bills." : `Loading bill #${billIndex}…`}</p></div>
            ) : bills.map((b) => {
              const collected = b.contributions.reduce((s, c) => s + c.amount, 0);
              const pct = b.participant_count > 0 ? (b.contributions.length / b.participant_count) * 100 : 0;
              return (
              <div key={b.id} className="bill-card" id={`bill-${b.id}`}>
                <div className="bill-card-head">
                  <div className="bill-badge bill-badge-id">#{b.id} · {f(b.vault_id)}</div>
                  <div className={`bill-badge ${b.settled || b.withdrawn ? "bill-badge-done" : "bill-badge-active"}`}>
                    {b.settled || b.withdrawn ? "Settled" : b.status === "Pending" ? "Pending" : b.status}
                  </div>
                </div>
                <h4 className="bill-title">{b.title}</h4>
                <div className="bill-meta">
                  <span>{collected / 1e7}XLM / {(b.total_xlm / 1e7).toFixed(4)} XLM collected</span>
                  <span>{b.contributions.length}/{b.participant_count} paid</span>
                  <span>by {f(b.creator)}</span>
                </div>
                {b.participants.length > 0 && (
                  <div style={{ fontSize: "0.7rem", marginBottom: 8, display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
                    {b.participants.map((p, i) => {
                      const paid = b.contributions.some(c => c.participant === p);
                      const share = b.shares[i] ?? b.total_xlm / b.participant_count;
                      const isMe = p === addr;
                      return (
                        <span key={i} style={{ color: paid ? "var(--success)" : isMe ? "var(--accent-teal)" : "var(--text-muted)", fontWeight: isMe ? 600 : 400 }}>
                          {paid ? "✓" : "○"} {isMe ? "(you) " : ""}{f(p)}: {share / 1e7}XLM
                        </span>
                      );
                    })}
                  </div>
                )}
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  {b.isParticipant && !b.userPaid && !b.settled && !b.withdrawn && (
                    <button onClick={() => contribute(b)} disabled={payTx === "pending"} className="btn btn-accent btn-sm" style={{ flex: 1 }}>
                      {payTx === "pending" ? "Sending…" : `Contribute ${(b.userShare / 1e7).toFixed(4)} XLM`}
                    </button>
                  )}
                  {b.isParticipant && b.userPaid && (
                    <span style={{ flex: 1, fontSize: "0.75rem", color: "var(--success)", fontWeight: 600, padding: "6px 0" }}>✓ Contributed</span>
                  )}
                  {!b.isParticipant && !b.isCreator && (
                    <span style={{ flex: 1, fontSize: "0.7rem", color: "var(--text-muted)", padding: "6px 0" }}>Not a participant</span>
                  )}
                  {b.isCreator && b.settled && !b.withdrawn && (
                    <button onClick={() => claimBill(b)} disabled={payTx === "pending"} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                      {payTx === "pending" ? "Claiming…" : `Claim ${(b.total_xlm / 1e7).toFixed(4)} XLM`}
                    </button>
                  )}
                  {b.withdrawn && (
                    <span style={{ flex: 1, fontSize: "0.75rem", color: "var(--accent-teal)", fontWeight: 600, padding: "6px 0" }}>✓ Claimed</span>
                  )}
                  <button className="btn btn-ghost btn-xs" onClick={() => {
                    const url = `${window.location.origin}/app?bill=${b.id}`;
                    navigator.clipboard.writeText(url);
                    setStatus({ type: "success", msg: "Share link copied!" });
                    setTimeout(() => setStatus(null), 2000);
                  }} title="Copy share link">🔗 Share</button>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {status && (
          <div className={`status-bar ${status.type === "success" ? "status-success" : status.type === "error" ? "status-error" : "status-pending"}`}>
            <span className="status-indicator" />
            <span>{status.msg}</span>
            {status.txHash && <a href={`${EXPLORER_BASE}/tx/${status.txHash}`} target="_blank" rel="noopener" style={{ color: "inherit", marginLeft: 8 }}>View TX &nearr;</a>}
          </div>
        )}

        {addr && appFunded && (
          <div className="dapp-info-bar">
            <span className="dapp-info-label">Signer:</span>
            <code className="dapp-info-addr">{appKP.publicKey()}</code>
            <button className="btn btn-ghost btn-xs" onClick={() => { navigator.clipboard.writeText(appKP.publicKey()); setStatus({ type: "success", msg: "Copied!" }); setTimeout(() => setStatus(null), 2000); }}>Copy</button>
          </div>
        )}
      </div>

      <footer className="footer" style={{ marginTop: 40 }}>
        <div className="container"><div className="footer-inner">
          <img src="/logoStellar.png" alt="" style={{ width: 42, height: 42 }} />
          <span className="footer-tag">Orange Belt · Stellar Journey to Mastery · 2026</span>
        </div></div>
      </footer>
    </>
  );
}
