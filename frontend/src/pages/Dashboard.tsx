import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { isConnected, getAddress, requestAccess, signTransaction } from "@stellar/freighter-api";
import { Horizon, TransactionBuilder, Networks, xdr, Keypair, Operation, Address, authorizeEntry } from "stellar-sdk";

const HORIZON_URL = import.meta.env.VITE_HORIZON_URL || "https://horizon-testnet.stellar.org";
const RPC_URL = import.meta.env.VITE_RPC_URL || "https://soroban-testnet.stellar.org";
const FACTORY_ID = import.meta.env.VITE_FACTORY_CONTRACT || "CA7R7GECD23KFFLYSQRSAROZ52Y3UAEO6JAJBTO4WCK46PV3IJUY4L5M";
const VAULT_WASM = import.meta.env.VITE_VAULT_WASM_HASH || "cb2a043f5a07224c24e1a90df9498a48b7ccd36fac745800e3ce66163288d22f";
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
function scvBool(v: xdr.ScVal | undefined): boolean {
  if (!v) return false;
  try { return v.bool(); } catch {}
  try { return v.u32() !== 0; } catch {}
  try { return v.i32() !== 0; } catch {}
  return false;
}
type TxState = "idle" | "pending" | "success" | "fail";

function billFromMap(m: any) {
  const fields: Record<string, xdr.ScVal> = {};
  const dec = new TextDecoder();
  for (let i = 0; i < m.length; i++) {
    const entry: any = m[i];
    try {
      const key = entry.key();
      const keyStr = typeof key?._value !== "undefined"
        ? dec.decode(key._value)
        : key?.str?.()?.toString() ?? "";
      if (!keyStr) continue;
      const val = typeof entry.value === "function" ? entry.value() : entry.value;
      if (!val) continue;
      fields[keyStr] = val;
    } catch {}
  }
  const addr = (scv: xdr.ScVal | undefined) => { try { return scv ? Address.fromScVal(scv).toString() : ""; } catch { return ""; } };
  return {
    vaultId: addr(fields.vault_id),
    creator: addr(fields.creator),
    title: fields.title?.str()?.toString() ?? "",
    totalX: Number(fields.total_xlm?.i128()?.lo ?? 0n),
    pCount: Number(fields.participant_count?.u32() ?? 0),
    deadline: Number(fields.deadline?.u64()?.toString() ?? "0"),
    settled: scvBool(fields.settled),
  };
}

function contribFromMap(m: any) {
  const fields: Record<string, xdr.ScVal> = {};
  const dec = new TextDecoder();
  for (let i = 0; i < m.length; i++) {
    const entry: any = m[i];
    try {
      const key = entry.key();
      const keyStr = typeof key?._value !== "undefined"
        ? dec.decode(key._value)
        : key?.str?.()?.toString() ?? "";
      if (!keyStr) continue;
      const val = typeof entry.value === "function" ? entry.value() : entry.value;
      if (!val) continue;
      fields[keyStr] = val;
    } catch {}
  }
  const addr = (scv: xdr.ScVal | undefined) => { try { return scv ? Address.fromScVal(scv).toString() : ""; } catch { return ""; } };
  return {
    participant: addr(fields.participant),
    amount: Number(fields.amount?.i128()?.lo ?? 0n),
  };
}

async function rpcCall(method: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
  const r = await fetch(RPC_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }) });
  const d = await r.json(); if (d.error) throw new Error(d.error.message ?? JSON.stringify(d.error));
  return d.result as Record<string, unknown>;
}

interface Contribution { participant: string; amount: number; }

interface BillInfo {
  id: number; vault_id: string; creator: string; title: string;
  total_xlm: number; participant_count: number; deadline: number; settled: boolean;
  participants: string[]; shares: number[]; contributions: Contribution[];
  status: string; isParticipant: boolean; userShare: number; userPaid: boolean;
  withdrawn: boolean;
}

async function ensureFunded() {
  try { await server.loadAccount(appKP.publicKey()); return; } catch {}
  await fetch(`https://friendbot.stellar.org?addr=${appKP.publicKey()}`);
  await new Promise((r) => setTimeout(r, 2000));
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
      const entry = xdr.SorobanAuthorizationEntry.fromXDR(a, "base64");
      deployAuth.push(await authorizeEntry(entry, appKP, Networks.TESTNET));
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
    if (st.status === "FAILED") throw new Error("Vault deploy failed: " + JSON.stringify((st as Record<string, unknown>).result ?? st));
  }
  throw new Error("Vault deploy timed out");
}

async function simSignSend(contractId: string, func: string, args: xdr.ScVal[], needAuth: boolean): Promise<{ hash: string; retval?: xdr.ScVal }> {
  await ensureFunded();
  const acct = await server.loadAccount(appKP.publicKey());
  const raw = new TransactionBuilder(acct, { fee: "100000", networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.invokeContractFunction({ contract: contractId, function: func, args }))
    .setTimeout(300).build();

  const sim = await rpcCall("simulateTransaction", { transaction: raw.toXDR() }) as unknown as { minResourceFee: string; transactionData: string; results?: Array<{ auth?: string[]; xdr?: string }>; error?: string };
  if (sim.error) throw new Error(`Sim failed: ${sim.error}`);

  const auth: xdr.SorobanAuthorizationEntry[] = [];
  if (sim.results?.[0]?.auth) {
    for (const a of sim.results[0].auth) {
      const entry = xdr.SorobanAuthorizationEntry.fromXDR(a, "base64");
      auth.push(await authorizeEntry(entry, appKP, Networks.TESTNET));
    }
  }

  const fee = (parseInt(raw.fee, 10) + parseInt(sim.minResourceFee || "0", 10)).toString();
  const sd = xdr.SorobanTransactionData.fromXDR(sim.transactionData, "base64");
  const fresh = await server.loadAccount(appKP.publicKey());
  const tx = new TransactionBuilder(fresh, { fee, networkPassphrase: Networks.TESTNET, sorobanData: sd })
    .addOperation(Operation.invokeContractFunction({ contract: contractId, function: func, args, auth: auth.length > 0 ? auth : undefined }))
    .setTimeout(300).build();
  tx.sign(appKP);

  const send = await rpcCall("sendTransaction", { transaction: tx.toXDR() }) as unknown as { hash?: string; status?: string; errorResult?: string };
  if (!send.hash) throw new Error(`TX send failed: ${JSON.stringify(send)}`);
  if (send.errorResult) throw new Error(`TX failed: ${send.errorResult}`);
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const st = await rpcCall("getTransaction", { hash: send.hash }) as { status: string; resultXdr?: string };
    if (st.status === "SUCCESS") {
      let retval: xdr.ScVal | undefined;
      if (sim.results?.[0]?.xdr) { try { retval = xdr.ScVal.fromXDR(sim.results[0].xdr, "base64"); } catch {} }
      return { hash: send.hash, retval };
    }
    if (st.status === "FAILED") throw new Error(`${func} failed: ` + JSON.stringify((st as Record<string, unknown>).result ?? st));
  }
  throw new Error(`${func} timed out (last status: ${send.status || "unknown"})`);
}

async function simSignSendFreighter(contractId: string, func: string, args: xdr.ScVal[], addr: string): Promise<{ hash: string }> {
  await ensureFunded();
  const acct = await server.loadAccount(appKP.publicKey());
  const raw = new TransactionBuilder(acct, { fee: "100000", networkPassphrase: Networks.TESTNET })
    .addOperation(Operation.invokeContractFunction({ contract: contractId, function: func, args }))
    .setTimeout(300).build();

  const sim = await rpcCall("simulateTransaction", { transaction: raw.toXDR() }) as unknown as { minResourceFee: string; transactionData: string; results?: Array<{ auth?: string[] }>; error?: string };
  if (sim.error) throw new Error(`Sim failed: ${sim.error}`);

  const auth: xdr.SorobanAuthorizationEntry[] = [];
  if (sim.results?.[0]?.auth) {
    for (const a of sim.results[0].auth) {
      const entry = xdr.SorobanAuthorizationEntry.fromXDR(a, "base64");
      auth.push(await authorizeEntry(entry, appKP, Networks.TESTNET));
    }
  }

  const fee = (parseInt(raw.fee, 10) + parseInt(sim.minResourceFee || "0", 10)).toString();
  const sd = xdr.SorobanTransactionData.fromXDR(sim.transactionData, "base64");
  const fresh = await server.loadAccount(appKP.publicKey());
  const tx = new TransactionBuilder(fresh, { fee, networkPassphrase: Networks.TESTNET, sorobanData: sd })
    .addOperation(Operation.invokeContractFunction({ contract: contractId, function: func, args, auth: auth.length > 0 ? auth : undefined }))
    .setTimeout(300).build();

  const signedXdr = await signTransaction(tx.toXDR(), { networkPassphrase: Networks.TESTNET, accountToSign: addr });
  const send = await rpcCall("sendTransaction", { transaction: signedXdr }) as unknown as { hash?: string; status?: string; errorResult?: string };
  if (!send.hash) throw new Error(`TX send failed: ${JSON.stringify(send)}`);
  if (send.errorResult) throw new Error(`TX failed: ${send.errorResult}`);
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const st = await rpcCall("getTransaction", { hash: send.hash }) as { status: string };
    if (st.status === "SUCCESS") return { hash: send.hash };
    if (st.status === "FAILED") throw new Error(`${func} failed: ` + JSON.stringify(st));
  }
  throw new Error(`${func} timed out`);
}

async function readVault(vaultId: string): Promise<{
  creator: string; title: string; total_xlm: number; deadline: number;
  participants: string[]; shares: number[]; contributions: Contribution[];
  status: string; withdrawn: boolean;
} | null> {
  try {
    const acct = await server.loadAccount(appKP.publicKey());

    // get_details returns (factory, creator, title, total, deadline, participants, shares, withdrawn)
    const raw = new TransactionBuilder(acct, { fee: "100", networkPassphrase: Networks.TESTNET })
      .addOperation(Operation.invokeContractFunction({ contract: vaultId, function: "get_details", args: [] }))
      .setTimeout(300).build();
    const sim = await rpcCall("simulateTransaction", { transaction: raw.toXDR() }) as unknown as { results?: Array<{ xdr?: string }>; error?: string };
    if (sim.error || !sim.results?.[0]?.xdr) return null;
    const rv = xdr.ScVal.fromXDR(sim.results[0].xdr, "base64");
    let fields: xdr.ScVal[];
    try { fields = rv.vec(); } catch {}
    if (!fields) return null;
    const creator = Address.fromScVal(fields[1]).toString();
    const title = fields[2]?.str()?.toString() ?? "";
    const total = Number(fields[3]?.i128()?.lo ?? 0n);
    const deadline = Number(fields[4]?.u64()?.toString() ?? "0");
    const withdrawn = scvBool(fields[7]);

    const participants: string[] = [];
    if (fields[5]) { let vec; try { vec = fields[5].vec(); } catch {} if (vec) for (const v of vec) { try { participants.push(Address.fromScVal(v).toString()); } catch {} } }
    const shares: number[] = [];
    if (fields[6]) { let vec; try { vec = fields[6].vec(); } catch {} if (vec) for (const v of vec) { shares.push(Number(v.i128()?.lo ?? 0n)); } }

    // get_status
    const raw2 = new TransactionBuilder(acct, { fee: "100", networkPassphrase: Networks.TESTNET })
      .addOperation(Operation.invokeContractFunction({ contract: vaultId, function: "get_status", args: [] }))
      .setTimeout(300).build();
    const sim2 = await rpcCall("simulateTransaction", { transaction: raw2.toXDR() }) as unknown as { results?: Array<{ xdr?: string }>; error?: string };
    let status = "Unknown";
    if (sim2.results?.[0]?.xdr) {
      const sv = xdr.ScVal.fromXDR(sim2.results[0].xdr, "base64");
      const raw = sv.str()?.toString() ?? sv.u32()?.toString() ?? String(sv.vec()?.[0]?.str()?.toString() ?? "");
      status = raw === "0" || raw === "Pending" ? "Pending" : raw === "1" || raw === "Settled" ? "Settled" : raw === "2" || raw === "Expired" ? "Expired" : raw;
    }

    // get_contributions
    const raw3 = new TransactionBuilder(acct, { fee: "100", networkPassphrase: Networks.TESTNET })
      .addOperation(Operation.invokeContractFunction({ contract: vaultId, function: "get_contributions", args: [] }))
      .setTimeout(300).build();
    const sim3 = await rpcCall("simulateTransaction", { transaction: raw3.toXDR() }) as unknown as { results?: Array<{ xdr?: string }>; error?: string };
    const contribs: Contribution[] = [];
    if (sim3.results?.[0]?.xdr) {
      const cv = xdr.ScVal.fromXDR(sim3.results[0].xdr, "base64");
      const vec = cv.vec();
      if (vec) for (const v of vec) {
        let fv; try { fv = v.vec(); } catch {}
        if (fv) {
          let pa = ""; try { pa = Address.fromScVal(fv[0]).toString(); } catch {} contribs.push({ participant: pa, amount: Number(fv[1]?.i128()?.lo ?? 0n) });
        } else {
          let mv; try { mv = v.map(); } catch {}
          if (mv) {
            const cm = contribFromMap(mv);
            contribs.push({ participant: cm.participant, amount: cm.amount });
          }
        }
      }
    }

    return { creator, title, total_xlm: total, deadline, participants, shares, contributions: contribs, status, withdrawn };
  } catch { return null; }
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
  const [showSuccess, setShowSuccess] = useState<{ vaultId: string; title: string; txHash: string } | null>(null);
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

  // Load bills: ?vault=VAULT_ID → load single vault directly, else load all from factory
  const vaultParam = sp.get("vault");
  useEffect(() => {
    if (vaultParam) {
      loadVaultBill(vaultParam);
    } else if (addr) {
      loadBills();
    }
  }, [addr, vaultParam]);

  const loadVaultBill = async (vaultId: string) => {
    setPayTx("pending"); setStatus(null);
    try {
      await ensureFunded();
      const data = await readVault(vaultId);
      if (!data) throw new Error("Failed to load bill from vault");
      const isP = addr ? data.participants.includes(addr) : false;
      const idx = isP ? data.participants.indexOf(addr!) : -1;
      const userS = idx >= 0 ? (data.shares[idx] ?? data.total_xlm / data.participants.length) : data.total_xlm / data.participants.length;
      const userPd = data.contributions.some(c => c.participant === addr);
      const bill: BillInfo = {
        id: 0, vault_id: vaultId, creator: data.creator, title: data.title,
        total_xlm: data.total_xlm, participant_count: data.participants.length,
        deadline: data.deadline, settled: data.status === "Settled",
        participants: data.participants, shares: data.shares,
        contributions: data.contributions, status: data.status,
        isParticipant: isP, userShare: userS, userPaid: userPd,
        withdrawn: data.withdrawn,
      };
      setBills([bill]);
      setPayTx("idle");
      setStatus({ type: "success", msg: "Bill loaded from share link!" });
    } catch (e: unknown) { setPayTx("fail"); setStatus({ type: "error", msg: (e as Error).message }); }
  };

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

  const disconnect = () => { setAddr(null); setBal(null); setWalletName(""); setStatus(null); };

  const loadBills = async () => {
    setPayTx("pending"); setStatus(null);
    try {
      await ensureFunded();
      const acct = await server.loadAccount(appKP.publicKey());
      const raw = new TransactionBuilder(acct, { fee: "100", networkPassphrase: Networks.TESTNET })
        .addOperation(Operation.invokeContractFunction({ contract: FACTORY_ID, function: "get_bills", args: [] }))
        .setTimeout(300).build();
      const sim = await rpcCall("simulateTransaction", { transaction: raw.toXDR() }) as unknown as { results?: Array<{ xdr?: string }>; error?: string };
      if (sim.error) throw new Error(`Load failed: ${sim.error}`);

      const enriched: BillInfo[] = [];
      if (sim.results?.[0]?.xdr) {
        const rv = xdr.ScVal.fromXDR(sim.results[0].xdr, "base64"); const vec = rv.vec();
        if (vec) {
          for (let i = 0; i < vec.length; i++) {
            let f, m; try { f = vec[i].vec(); } catch {}
            if (!f) try { m = vec[i].map(); } catch {}
            if (!f && !m) continue;
            let vaultId: string, creator: string, title: string, totalX: number, pCount: number, deadline: number, settled: boolean;
            if (f) {
              try { vaultId = Address.fromScVal(f[0]).toString(); } catch { vaultId = ""; }
              try { creator = Address.fromScVal(f[1]).toString(); } catch { creator = ""; }
              title = f[2]?.str()?.toString() ?? "";
              totalX = Number(f[3]?.i128()?.lo ?? 0n);
              pCount = Number(f[4]?.u32());
              deadline = Number(f[5]?.u64()?.toString() ?? "0");
              settled = scvBool(f[6]);
            } else {
              const bm = billFromMap(m);
              vaultId = bm.vaultId; creator = bm.creator; title = bm.title;
              totalX = bm.totalX; pCount = bm.pCount; deadline = bm.deadline; settled = bm.settled;
            }

            const vaultData = await readVault(vaultId);
            const parts = vaultData?.participants ?? [];
            const shares = vaultData?.shares ?? [];
            const contribs = vaultData?.contributions ?? [];
            const vStatus = vaultData?.status ?? (settled ? "Settled" : "Pending");
            const withdrawn = vaultData?.withdrawn ?? false;
            const isP = addr ? parts.includes(addr) : false;
            const idx = isP ? parts.indexOf(addr!) : -1;
            const userS = idx >= 0 ? (shares[idx] ?? totalX / pCount) : totalX / pCount;
            const userPd = contribs.some(c => c.participant === addr);

            enriched.push({
              id: i, vault_id: vaultId, creator, title, total_xlm: totalX,
              participant_count: pCount, deadline, settled: settled || vStatus === "Settled",
              participants: parts, shares, contributions: contribs,
              status: vStatus, isParticipant: isP, userShare: userS, userPaid: userPd,
              withdrawn,
            });
          }
        }
      }
      setBills(enriched);
      const billParam = sp.get("bill");
      if (billParam) setTimeout(() => document.getElementById(`bill-${billParam}`)?.scrollIntoView({ behavior: "smooth" }), 300);
      setStatus({ type: "success", msg: `Loaded ${enriched.length} bill${enriched.length !== 1 ? "s" : ""}` });
      setPayTx("idle");
    } catch (e: unknown) { setPayTx("fail"); setStatus({ type: "error", msg: (e as Error).message }); }
  };

  const createBill = async () => {
    const addrs = payerAddrs.filter((p) => p.length > 0);
    const sharesRaw = payerShares.filter((s) => s.length > 0);
    if (!desc || !totalXlm || addrs.length === 0 || sharesRaw.length === 0) return;
    if (addrs.length !== Number(numPayers) || sharesRaw.length !== Number(numPayers))
      return setStatus({ type: "error", msg: `Need ${numPayers} addresses and shares.` });

    const shares: bigint[] = []; let total = 0n;
    for (let i = 0; i < sharesRaw.length; i++) {
      const v = BigInt(sharesRaw[i]);
      if (v <= 0) return setStatus({ type: "error", msg: `Payer ${i + 1} share is 0 or negative. All shares must be > 0.` });
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
      ], false);

      setStatus({ type: "pending", msg: "Registering in factory..." });
      const { hash } = await simSignSend(FACTORY_ID, "register_bill", [
        scvAddr(vaultId), scvAddr(appKP.publicKey()),
        scvVec(addrs.map((a) => scvAddr(a))), scvVec(shares.map((s) => scvI128(s))),
        scvStr(desc),
      ], false);

      setStatus({ type: "success", msg: "Bill created! ", txHash: hash });
      setDesc(""); setTotalXlm(""); setNumPayers(""); setPayerAddrs([]); setPayerShares([]);
      setCreateTx("success"); setTimeout(() => setCreateTx("idle"), 2000);
      setTimeout(() => setShowSuccess({ vaultId, title: desc, txHash: hash }), 500);
      loadBills();
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
      const { hash } = await simSignSendFreighter(b.vault_id, "contribute", [scvAddr(addr)], addr);
      setStatus({ type: "success", msg: `Contributed ${(b.userShare / 1e7).toFixed(4)} XLM! `, txHash: hash });
      setPayTx("success"); setTimeout(() => setPayTx("idle"), 2000);
      loadBills();
    } catch (e: unknown) { setPayTx("fail"); setStatus({ type: "error", msg: (e as Error).message }); }
  };

  const claimBill = async (b: BillInfo) => {
    if (!addr) return setStatus({ type: "error", msg: "Connect wallet to claim." });
    setPayTx("pending"); setStatus(null);
    try {
      const { hash } = await simSignSendFreighter(b.vault_id, "withdraw", [scvAddr(addr)], addr);
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

      {/* Success Wizard Modal */}
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
                Share this link with participants so they can connect their wallet and contribute:
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="input input-sm" readOnly value={`${window.location.origin}/app?vault=${showSuccess.vaultId}`} style={{ flex: 1 }} />
                <button className="btn btn-primary btn-sm" onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/app?vault=${showSuccess.vaultId}`);
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
                  { n: "1", t: "Creator: Create a Bill", d: "Enter expense, total stroops, and ALL friends' wallet addresses + shares. A vault is deployed on-chain." },
                  { n: "2", t: "Friends: Contribute", d: "Each friend connects their own wallet, finds the bill, and sends their share of XLM to the vault." },
                  { n: "3", t: "Auto-Settle", d: "When all shares are paid, the vault auto-sends the total to the creator via cross-contract call." },
                  { n: "4", t: "Refund (if expired)", d: "If deadline passes before full payment, each contributor can withdraw their share back." },
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
            {addr
              ? "You are the creator. Enter ALL participant addresses and their share amounts. Friends will connect their own wallets to contribute."
              : "Connect wallet first to create a bill as the creator."}
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
                    <input className="input input-sm" placeholder={`Payer ${i + 1} address (G…) ${i === 0 && addr ? '(you)' : ''}`} value={payerAddrs[i]} onChange={(e) => { const a = [...payerAddrs]; a[i] = e.target.value; setPayerAddrs(a); }} />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <input className="input input-sm" type="number" placeholder={`Share (stroops)${i === 0 && addr ? ' — your portion' : ''}`} value={payerShares[i]} onChange={(e) => { const a = [...payerShares]; a[i] = e.target.value; setPayerShares(a); }} />
                  </div>
                </div>
              ))}
              {totalXlm && numPayers && Number(numPayers) > 0 && BigInt(totalXlm) % BigInt(Number(numPayers)) === 0n && payerShares.filter((s) => s).length === 0 && (
                <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: 12 }}>
                  Even split: {BigInt(totalXlm) / BigInt(Number(numPayers))} stroops each. Fill shares above or leave for equal split.
                </div>
              )}
              <button onClick={createBill} disabled={creating || !desc || !totalXlm || !numPayers || payerAddrs.filter((p) => p).length !== Number(numPayers) || payerShares.filter((s) => s).length !== Number(numPayers)} className="btn btn-primary btn-lg btn-full">
                {creating ? "Deploying…" : "+ Create Bill"}
              </button>
              {!addr && (
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}>Creator auth via wallet needed for register_bill. Connect Freighter.</p>
              )}
            </>
          ) : (
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", padding: "20px 0" }}>Connect wallet to create a bill.</p>
          )}
        </div>

        {(addr || vaultParam) && (
          <div className="card card-full">
            <div className="dapp-card-header">
              <h3 className="guide-title" style={{ marginBottom: 0 }}>Bills</h3>
              <button onClick={loadBills} className="btn btn-secondary btn-sm">Refresh</button>
            </div>
            {bills.length === 0 ? (
              <div className="empty-state"><p>No bills yet. Click Refresh to load from chain.</p></div>
            ) : bills.map((b) => {
              const collected = b.contributions.reduce((s, c) => s + c.amount, 0);
              const pct = b.participant_count > 0 ? (b.contributions.length / b.participant_count) * 100 : 0;
              return (
              <div key={b.id} className="bill-card" id={`bill-${b.id}`}>
                <div className="bill-card-head">
                  <div className="bill-badge bill-badge-id">#{b.id} · {f(b.vault_id)}</div>
                  <div className={`bill-badge ${b.settled || b.status === "Settled" ? "bill-badge-done" : b.status === "Expired" ? "bill-badge-active" : "bill-badge-active"}`}>
                    {b.status === "Settled" || b.settled ? "Settled" : b.status === "Expired" ? "Expired" : "Pending"}
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
                  {b.isParticipant && !b.userPaid && !b.settled && b.status !== "Expired" && (
                    <button onClick={() => contribute(b)} disabled={payTx === "pending"} className="btn btn-accent btn-sm" style={{ flex: 1 }}>
                      {payTx === "pending" ? "Sending…" : `Contribute ${(b.userShare / 1e7).toFixed(4)} XLM`}
                    </button>
                  )}
                  {b.isParticipant && b.userPaid && (
                    <span style={{ flex: 1, fontSize: "0.75rem", color: "var(--success)", fontWeight: 600, padding: "6px 0" }}>✓ Contributed</span>
                  )}
                  {!b.isParticipant && !b.withdrawn && (
                    <span style={{ flex: 1, fontSize: "0.7rem", color: "var(--text-muted)", padding: "6px 0" }}>Not a participant</span>
                  )}
                  {addr === b.creator && b.settled && !b.withdrawn && (
                    <button onClick={() => claimBill(b)} disabled={payTx === "pending"} className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                      {payTx === "pending" ? "Claiming…" : `Claim ${(b.total_xlm / 1e7).toFixed(4)} XLM`}
                    </button>
                  )}
                  {b.withdrawn && (
                    <span style={{ flex: 1, fontSize: "0.75rem", color: "var(--accent-teal)", fontWeight: 600, padding: "6px 0" }}>✓ Claimed</span>
                  )}
                  <button className="btn btn-ghost btn-xs" onClick={() => {
                    const url = `${window.location.origin}/app?vault=${b.vault_id}`;
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
