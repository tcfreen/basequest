import { useState, useEffect } from "react";
import { getWalletAnalysis } from "../utils/basescan";

const Icon = ({ src, size = 22, style = {} }) => (
  <img src={src} alt="" width={size} height={size} style={{ display: "block", ...style }} />
);

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;600;700&display=swap');
  .dh { font-family: 'Syne', sans-serif; }
  .db { font-family: 'DM Sans', sans-serif; }
`;

const gBase = { background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" };

const SCORE_LEVELS = [
  { min: 0,  max: 20,  label: "Ghost",       color: "#4a5568" },
  { min: 21, max: 40,  label: "Newcomer",    color: "#8892a4" },
  { min: 41, max: 60,  label: "Active User", color: "#00c853" },
  { min: 61, max: 80,  label: "OG Farmer",   color: "#0052ff" },
  { min: 81, max: 100, label: "Base Chad",   color: "#f0b429" },
];

const getScoreLevel = s => SCORE_LEVELS.find(l => s >= l.min && s <= l.max) || SCORE_LEVELS[0];
const shortHash     = h => h ? h.slice(0, 8) + "..." + h.slice(-6) : "—";

const TX_ROWS = [
  { key: "firstTxOnBase",    icon: "/seedling.svg", label: "First Transaction",    valueColor: "#f0b429" },
  { key: "latestTxOnBase",   icon: "/clock.svg",    label: "Latest Transaction",   valueColor: "#f0b429" },
  { key: "largestTxOnBase",  icon: "/trophy.svg",   label: "Largest Transaction",  valueColor: "#00c853" },
  { key: "smallestTxOnBase", icon: "/micro.svg",    label: "Smallest Transaction", valueColor: "#ff6b6b" },
];

export default function WalletAnalyzer({ wallet }) {
  const [inputAddress, setInputAddress] = useState("");
  const [analysis,     setAnalysis]     = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);
  const [isMobile,     setIsMobile]     = useState(false);

  useEffect(() => {
    if (!document.getElementById("dash-fonts")) {
      const s = document.createElement("style");
      s.id = "dash-fonts"; s.textContent = FONTS;
      document.head.appendChild(s);
    }
    const upd = () => setIsMobile(window.innerWidth < 640);
    upd(); window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  const m = isMobile;

  const handleAnalyze = async () => {
    const addr = inputAddress.trim();
    if (!addr || addr.length < 10) return setError("Enter a valid wallet address");
    setLoading(true); setError(null); setAnalysis(null);
    try {
      setAnalysis(await getWalletAnalysis(addr));
    } catch (err) {
      setError("Failed to analyze wallet: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const scoreLevel = analysis ? getScoreLevel(analysis.baseScore) : null;

  return (
    <div className="db" style={{ padding: m ? "14px 0 8px" : "24px 0 8px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: m ? 14 : 20 }}>
        <Icon src="/search.svg" size={m ? 18 : 22} style={{ opacity: 0.85 }} />
        <div>
          <h2 className="dh" style={{ color: "white", fontSize: m ? "17px" : "22px", fontWeight: 900, margin: "0 0 2px" }}>
            Wallet Analyzer
          </h2>
          <p style={{ color: "#5a6478", fontSize: m ? "10px" : "11px", margin: 0, fontWeight: 600, letterSpacing: "0.07em" }}>
            ANALYZE ANY BASE WALLET
          </p>
        </div>
      </div>

      {/* Input card */}
      <div style={{ ...gBase, padding: m ? "14px" : "20px", marginBottom: m ? 12 : 16 }}>
        <label style={{ color: "#8892a4", fontSize: "11px", fontWeight: 600, display: "block", marginBottom: 7, letterSpacing: "0.07em" }}>
          WALLET ADDRESS
        </label>

        {/* Pill search bar */}
        <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 999, padding: "4px 4px 4px 14px", gap: 8 }}>
          <Icon src="/search.svg" size={m ? 14 : 15} style={{ opacity: 0.35, flexShrink: 0 }} />
          <input
            type="text"
            placeholder="0x..."
            value={inputAddress}
            onChange={e => setInputAddress(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAnalyze()}
            style={{ flex: 1, background: "transparent", border: "none", color: "white", fontSize: m ? "13px" : "14px", outline: "none", fontFamily: "DM Sans, sans-serif", minWidth: 0, padding: "6px 0" }}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{ background: loading ? "rgba(0,82,255,0.4)" : "linear-gradient(135deg,#0052ff,#0041cc)", border: "none", borderRadius: 999, padding: m ? "8px 14px" : "9px 18px", color: "white", fontWeight: 800, fontSize: m ? "12px" : "13px", cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap", fontFamily: "Syne, sans-serif", display: "flex", alignItems: "center", gap: 6, flexShrink: 0, boxShadow: "0 2px 12px rgba(0,82,255,0.3)" }}
          >
            {loading
              ? <><Icon src="/hourglass.svg" size={13} style={{ opacity: 0.8 }} /> Analyzing</>
              : <><Icon src="/search.svg"    size={13} style={{ opacity: 0.9 }} /> Analyze</>
            }
          </button>
        </div>

        {/* Use connected wallet */}
        {wallet?.address && (
          <div
            onClick={() => setInputAddress(wallet.address)}
            style={{ color: "#4da6ff", fontSize: "12px", fontWeight: 600, marginTop: 10, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}
          >
            <Icon src="/wallet.svg" size={13} style={{ filter: "invert(58%) sepia(98%) saturate(500%) hue-rotate(185deg) brightness(105%)" }} />
            Use connected wallet
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "rgba(255,59,59,0.1)", border: "1px solid rgba(255,59,59,0.3)", borderRadius: 12, padding: "11px 14px", marginBottom: 12, color: "#ff6b6b", fontWeight: 600, fontSize: m ? "12px" : "13px", display: "flex", alignItems: "center", gap: 8 }}>
          <Icon src="/warning.svg" size={16} />
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: m ? "32px 0" : "48px 0", color: "#8892a4" }}>
          <Icon src="/search.svg" size={m ? 28 : 36} style={{ margin: "0 auto 12px", opacity: 0.4 }} />
          <div style={{ fontSize: m ? "13px" : "14px" }}>Fetching on-chain data...</div>
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: m ? 10 : 14 }}>

          {/* Base Score */}
          <div style={{ ...gBase, border: `1px solid ${scoreLevel.color}33`, padding: m ? "20px 16px" : "28px 20px", textAlign: "center" }}>
            <div style={{ color: "#8892a4", fontSize: m ? "10px" : "12px", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8 }}>BASE SCORE</div>
            <div className="dh" style={{ color: scoreLevel.color, fontSize: m ? "52px" : "64px", fontWeight: 900, lineHeight: 1, textShadow: `0 0 32px ${scoreLevel.color}55` }}>
              {analysis.baseScore}
            </div>
            <div className="dh" style={{ color: "white", fontSize: m ? "16px" : "18px", fontWeight: 800, marginTop: 8 }}>{scoreLevel.label}</div>
            <div style={{ color: "#5a6478", fontSize: "12px", marginTop: 4 }}>out of 100</div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden", margin: "16px auto 0", maxWidth: 200 }}>
              <div style={{ height: "100%", width: `${analysis.baseScore}%`, background: `linear-gradient(90deg,${scoreLevel.color},#4da6ff)`, borderRadius: 99, transition: "width 0.8s ease" }} />
            </div>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: m ? 7 : 10 }}>
            {[
              { icon: "/swap.svg",     label: "TOTAL TXS",  value: analysis.totalTxs.toLocaleString(), color: "#4da6ff" },
              { icon: "/calendar.svg", label: "WALLET AGE", value: analysis.walletAgeDays + "d",        color: "#c084fc" },
              { icon: "/deploy.svg",   label: "CONTRACTS",  value: analysis.uniqueContracts,            color: "#00e676" },
              { icon: "/warning.svg",  label: "FAILED TXS", value: analysis.failedCount,                color: "#ff6b6b" },
            ].map(({ icon, label, value, color }) => (
              <div key={label} style={{ ...gBase, padding: m ? "13px 10px" : "16px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: m ? 4 : 6 }}>
                <Icon src={icon} size={m ? 18 : 22} style={{ opacity: 0.8 }} />
                <div className="dh" style={{ color, fontWeight: 900, fontSize: m ? "17px" : "20px", lineHeight: 1 }}>{value}</div>
                <div style={{ color: "#4a5568", fontSize: m ? "9px" : "10px", fontWeight: 700, letterSpacing: "0.07em" }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Transaction Milestones */}
          <div style={{ ...gBase, padding: m ? "14px" : "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: m ? 12 : 16 }}>
              <Icon src="/milestone.svg" size={m ? 16 : 18} style={{ opacity: 0.85 }} />
              <div className="dh" style={{ color: "white", fontSize: m ? "13px" : "15px", fontWeight: 800 }}>Transaction Milestones</div>
            </div>
            {TX_ROWS.map(({ key, icon, label, valueColor }, idx) => {
              const tx     = analysis[key];
              const isLast = idx === TX_ROWS.length - 1;
              return (
                <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: isLast ? 0 : 12, marginBottom: isLast ? 0 : 12, borderBottom: isLast ? "none" : "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                    <Icon src={icon} size={m ? 15 : 17} style={{ opacity: 0.75, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: "#8892a4", fontSize: m ? "10px" : "11px", fontWeight: 600, marginBottom: 2 }}>{label}</div>
                      <div className="dh" style={{ color: "white", fontSize: m ? "12px" : "13px", fontWeight: 700 }}>{tx?.date || "—"}</div>
                      <a href={`https://basescan.org/tx/${tx?.hash}`} target="_blank" rel="noreferrer"
                        style={{ color: "#4da6ff", fontSize: "11px", textDecoration: "none" }}>
                        {shortHash(tx?.hash)}
                      </a>
                    </div>
                  </div>
                  <div className="dh" style={{ color: valueColor, fontSize: m ? "13px" : "14px", fontWeight: 800, flexShrink: 0, marginLeft: 8 }}>
                    {tx?.valueEth} ETH
                  </div>
                </div>
              );
            })}
          </div>

          {/* Activity Heatmap */}
          <div style={{ ...gBase, padding: m ? "14px" : "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: m ? 12 : 16 }}>
              <Icon src="/heatmap.svg" size={m ? 16 : 18} style={{ opacity: 0.85 }} />
              <div className="dh" style={{ color: "white", fontSize: m ? "13px" : "15px", fontWeight: 800 }}>Activity Heatmap (90 days)</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: m ? "2px" : "3px", marginBottom: 10 }}>
              {analysis.heatmap.cells.map((count, i) => {
                const intensity = count === 0 ? 0 : Math.min(1, count / analysis.heatmap.maxCount);
                return (
                  <div key={i} title={`${count} tx`} style={{ width: m ? 8 : 10, height: m ? 8 : 10, borderRadius: 2, background: count === 0 ? "rgba(255,255,255,0.04)" : `rgba(0,82,255,${0.2 + intensity * 0.8})` }} />
                );
              })}
            </div>
            <div style={{ color: "#5a6478", fontSize: m ? "10px" : "12px", fontWeight: 600 }}>
              Longest streak: <span style={{ color: "#4da6ff" }}>{analysis.heatmap.longestStreak} days</span>
            </div>
          </div>

          {/* Volume */}
          <div style={{ ...gBase, padding: m ? "14px" : "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: m ? 12 : 16 }}>
              <Icon src="/volume.svg" size={m ? 16 : 18} style={{ opacity: 0.85 }} />
              <div className="dh" style={{ color: "white", fontSize: m ? "13px" : "15px", fontWeight: 800 }}>Volume</div>
            </div>
            {[
              { label: "Sent",     value: analysis.totalSentEth + " ETH", color: "#ff6b6b" },
              { label: "Received", value: analysis.totalRecvEth + " ETH", color: "#00e676" },
              { label: "Avg Gas",  value: analysis.avgGasUsed.toLocaleString(), color: "#f0b429" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={{ color: "#8892a4", fontSize: m ? "12px" : "13px" }}>{label}</span>
                <span className="dh" style={{ color, fontSize: m ? "13px" : "14px", fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Top Contracts */}
          {analysis.topContracts.length > 0 && (
            <div style={{ ...gBase, padding: m ? "14px" : "20px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: m ? 12 : 16 }}>
                <Icon src="/deploy.svg" size={m ? 16 : 18} style={{ opacity: 0.85 }} />
                <div className="dh" style={{ color: "white", fontSize: m ? "13px" : "15px", fontWeight: 800 }}>Top Contracts</div>
              </div>
              {analysis.topContracts.map(({ contract, count }) => (
                <div key={contract} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <a href={`https://basescan.org/address/${contract}`} target="_blank" rel="noreferrer"
                    style={{ color: "#4da6ff", fontSize: m ? "12px" : "13px", textDecoration: "none", fontWeight: 600 }}>
                    {contract.slice(0, 8) + "..." + contract.slice(-4)}
                  </a>
                  <span style={{ background: "rgba(0,82,255,0.15)", border: "1px solid rgba(0,82,255,0.3)", borderRadius: 20, padding: "2px 10px", color: "#4da6ff", fontSize: "11px", fontWeight: 700 }}>
                    {count} txs
                  </span>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
