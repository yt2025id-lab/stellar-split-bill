import { useNavigate } from "react-router-dom";
import StellarSplitBillLogo from "../StellarSplitBillLogo";

const HORIZON_URL = import.meta.env.VITE_HORIZON_URL || "https://horizon-testnet.stellar.org";
const RPC_URL = import.meta.env.VITE_RPC_URL || "https://soroban-testnet.stellar.org";
const FACTORY_ID = import.meta.env.VITE_FACTORY_CONTRACT || "CA7R7GECD23KFFLYSQRSAROZ52Y3UAEO6JAJBTO4WCK46PV3IJUY4L5M";
const NATIVE_XLM = import.meta.env.VITE_NATIVE_TOKEN || "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
const EXPLORER_BASE = "https://stellar.expert/explorer/testnet";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div>
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-actions">
            <a href="https://soroban.stellar.org" target="_blank" rel="noopener" className="btn btn-ghost btn-sm">Docs</a>
            <button onClick={() => navigate("/app")} className="btn btn-primary btn-sm">Launch dApp</button>
          </div>
          <div className="nav-brand">
            <StellarSplitBillLogo size={34} logoSize={92} />
          </div>
        </div>
      </nav>

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
        <div className="hero-actions">
          <button onClick={() => navigate("/app")} className="btn btn-primary btn-lg">
            Launch dApp &rarr;
          </button>
          <a href="#features" className="btn btn-secondary btn-lg">Learn More</a>
        </div>
      </section>

      <section id="features" className="section" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Why Split Bill</span>
            <h2 className="section-title">Built for trustless coordination</h2>
          </div>
          <div className="features-grid">
            {[
              { icon: "■■■", title: "Native XLM Settlement", desc: "Participants pay their share in native XLM directly to the vault contract. No custom tokens, no wrapping — just real Stellar lumens." },
              { icon: "◇◇◇", title: "Inter-Contract Auto-Settle", desc: "When fully funded, the vault atomically calls the factory via env.invoke_contract — both contracts emit events in a single transaction." },
              { icon: "●●●", title: "Creator Withdraw", desc: "Once settled, the bill creator claims the total XLM from the vault. Transparent, trustless, and verifiable on-chain." },
            ].map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Process</span>
            <h2 className="section-title">How it works</h2>
          </div>
          <div className="steps-track">
            {[
              { step: "01", title: "Create Bill", desc: "Enter the expense name, total XLM, and your friends' Stellar addresses. A vault contract is deployed for each bill." },
              { step: "02", title: "Share Link", desc: "Share the unique vault link with participants. Each one connects their wallet and contributes their XLM share." },
              { step: "03", title: "Auto-Settle", desc: "When everyone has paid, the vault calls the factory atomically via inter-contract communication — bill is settled on-chain." },
              { step: "04", title: "Creator Claims", desc: "The bill creator withdraws the total XLM from the vault. Trustless. Verifiable. No chasing people." },
            ].map((s, i) => (
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

      <section className="section" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Deployed Contracts</span>
            <h2 className="section-title">Stellar Soroban Testnet</h2>
          </div>
          <div className="contract-grid">
            <div className="contract-card">
              <span className="contract-label">SplitBillFactory</span>
              <code className="contract-id">{FACTORY_ID}</code>
              <a href={`${EXPLORER_BASE}/contract/${FACTORY_ID}`} target="_blank" rel="noopener" className="contract-link">View on Explorer &nearr;</a>
            </div>
            <div className="contract-card">
              <span className="contract-label">Native XLM (Testnet)</span>
              <code className="contract-id">{NATIVE_XLM}</code>
              <a href={`${EXPLORER_BASE}/contract/${NATIVE_XLM}`} target="_blank" rel="noopener" className="contract-link">View on Explorer &nearr;</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section text-center">
        <div className="container-xs">
          <span className="eyebrow">Ready to Split?</span>
          <h2 className="section-title" style={{ marginBottom: 24 }}>No more awkward money conversations</h2>
          <p className="section-subtitle" style={{ marginBottom: 32 }}>
            Connect your wallet (Freighter, Albedo, xBull, or Rabet) and start splitting bills on Stellar Soroban — fast, cheap, and trustlessly settled via inter-contract communication.
          </p>
          <button onClick={() => navigate("/app")} className="btn btn-primary btn-lg">
            Get Started &rarr;
          </button>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <StellarSplitBillLogo size={34} logoSize={92} />
            <span className="footer-tag">Orange Belt · Stellar Journey to Mastery · 2026</span>
            <div className="footer-links">
              <a href="https://github.com/yt2025id-lab/stellar-split-bill" target="_blank" rel="noopener" title="GitHub">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
