import { useState } from "react";
import { getWalletAnalysis } from "../utils/basescan";

const SCORE_LEVELS = [
  { min: 0,  max: 20,  label: "Ghost",       color: "#4a5568" },
  { min: 21, max: 40,  label: "Newcomer",    color: "#8892a4" },
  { min: 41, max: 60,  label: "Active User", color: "#00c853" },
  { min: 61, max: 80,  label: "OG Farmer",   color: "#0052ff" },
  { min: 81, max: 100, label: "Base Chad",   color: "#f0b429" },
];

function getScoreLevel(score) {
  return SCORE_LEVELS.find(l => score >= l.min && score <= l.max) || SCORE_LEVELS[0];
}

function shortHash(hash) {
  if (!hash) return "—";
  return hash.slice(0, 8) + "..." + hash.slice(-6);
}

export default function WalletAnalyzer({ wallet }) {
  const [inputAddress, setInputAddress] = useState("");
  const [analysis,     setAnalysis]     = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState(null);

  const handleAnalyze = async () => {
    const addr = inputAddress.trim();
    if (!addr || addr.length < 10) return setError("Enter a valid wallet address");
    setLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await getWalletAnalysis(addr);
      setAnalysis(result);
    } catch (err) {
      setError("Failed to analyze wallet: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const useConnected = () => {
    if (wallet?.address) setInputAddress(wallet.address);
  };

  const scoreLevel = analysis ? getScoreLevel(analysis.baseScore) : null;

  return (
    <div style={{ padding: "24px 0" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ color: "white", fontSize: "22px", fontWeight: "800", margin: "0 0 6px" }}>
          🔍 Wallet Analyzer
        </h2>
        <p style={{ color: "#8892a4", fontSize: "14px", margin: 0 }}>
          Analyze any Base wallet's on-chain activity and get a Base Score.
        </p>
      </div>

      {/* Input */}
      <div style={{
        background:   "rgba(255,255,255,0.03)",
        border:       "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding:      "20px",
        marginBottom: "20px",
      }}>
        <label style={{ color: "#8892a4", fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "8px" }}>
          Wallet Address
        </label>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="0x..."
            value={inputAddress}
            onChange={e => setInputAddress(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAnalyze()}
            style={{
              flex:         1,
              background:   "rgba(255,255,255,0.05)",
              border:       "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              padding:      "11px 14px",
              color:        "white",
              fontSize:     "14px",
              outline:      "none",
            }}
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            style={{
              background:   loading ? "rgba(0,82,255,0.3)" : "linear-gradient(135deg, #0052ff, #0041cc)",
              border:       "none",
              borderRadius: "10px",
              padding:      "11px 20px",
              color:        "white",
              fontWeight:   "800",
              fontSize:     "14px",
              cursor:       loading ? "not-allowed" : "pointer",
              whiteSpace:   "nowrap",
            }}
          >
            {loading ? "..." : "Analyze"}
          </button>
        </div>
        {wallet?.address && (
          <div
            onClick={useConnected}
            style={{ color: "#0052ff", fontSize: "13px", fontWeight: "600", marginTop: "10px", cursor: "pointer" }}
          >
            Use connected wallet →
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background:   "rgba(255,59,59,0.1)",
          border:       "1px solid rgba(255,59,59,0.3)",
          borderRadius: "12px",
          padding:      "12px 16px",
          marginBottom: "16px",
          color:        "#ff6b6b",
          fontWeight:   "600",
          fontSize:     "14px",
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#8892a4" }}>
          <div style={{ fontSize: "32px", marginBottom: "12px" }}>🔍</div>
          <div style={{ fontSize: "14px" }}>Fetching on-chain data...</div>
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

          {/* Base Score */}
          <div style={{
            background:   "rgba(255,255,255,0.03)",
            border:       `1px solid ${scoreLevel.color}33`,
            borderRadius: "16px",
            padding:      "28px 20px",
            textAlign:    "center",
          }}>
            <div style={{ color: "#8892a4", fontSize: "13px", fontWeight: "600", marginBottom: "8px" }}>
              Base Score
            </div>
            <div style={{ color: scoreLevel.color, fontSize: "64px", fontWeight: "900", lineHeight: 1 }}>
              {analysis.baseScore}
            </div>
            <div style={{ color: "white", fontSize: "18px", fontWeight: "800", marginTop: "8px" }}>
              {scoreLevel.label}
            </div>
            <div style={{ color: "#8892a4", fontSize: "13px", marginTop: "4px" }}>out of 100</div>
          </div>

          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[
              { label: "Total Txs",     value: analysis.totalTxs.toLocaleString() },
              { label: "Wallet Age",    value: analysis.walletAgeDays + "d"       },
              { label: "Contracts",     value: analysis.uniqueContracts           },
              { label: "Failed Txs",    value: analysis.failedCount               },
            ].map(stat => (
              <div key={stat.label} style={{
                background:   "rgba(255,255,255,0.03)",
                border:       "1px solid rgba(255,255,255,0.06)",
                borderRadius: "12px",
                padding:      "16px",
                textAlign:    "center",
              }}>
                <div style={{ color: "white", fontSize: "22px", fontWeight: "800" }}>{stat.value}</div>
                <div style={{ color: "#8892a4", fontSize: "12px", marginTop: "4px" }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ── New Transaction Metrics ── */}
          <div style={{
            background:   "rgba(255,255,255,0.03)",
            border:       "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding:      "20px",
          }}>
            <div style={{ color: "white", fontSize: "15px", fontWeight: "800", marginBottom: "16px" }}>
              📋 Transaction Milestones
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

              {/* First tx */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px" }}>
                <div>
                  <div style={{ color: "#8892a4", fontSize: "12px", fontWeight: "600", marginBottom: "3px" }}>🌱 First Transaction on Base</div>
                  <div style={{ color: "white", fontSize: "13px", fontWeight: "700" }}>{analysis.firstTxOnBase?.date || "—"}</div>
                  <a
                    href={`https://basescan.org/tx/${analysis.firstTxOnBase?.hash}`}
                    target="_blank" rel="noreferrer"
                    style={{ color: "#0052ff", fontSize: "11px", textDecoration: "none" }}
                  >
                    {shortHash(analysis.firstTxOnBase?.hash)}
                  </a>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#f0b429", fontSize: "13px", fontWeight: "800" }}>
                    {analysis.firstTxOnBase?.valueEth} ETH
                  </div>
                </div>
              </div>

              {/* Latest tx */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px" }}>
                <div>
                  <div style={{ color: "#8892a4", fontSize: "12px", fontWeight: "600", marginBottom: "3px" }}>🕐 Latest Transaction on Base</div>
                  <div style={{ color: "white", fontSize: "13px", fontWeight: "700" }}>{analysis.latestTxOnBase?.date || "—"}</div>
                  <a
                    href={`https://basescan.org/tx/${analysis.latestTxOnBase?.hash}`}
                    target="_blank" rel="noreferrer"
                    style={{ color: "#0052ff", fontSize: "11px", textDecoration: "none" }}
                  >
                    {shortHash(analysis.latestTxOnBase?.hash)}
                  </a>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#f0b429", fontSize: "13px", fontWeight: "800" }}>
                    {analysis.latestTxOnBase?.valueEth} ETH
                  </div>
                </div>
              </div>

              {/* Largest tx */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "12px" }}>
                <div>
                  <div style={{ color: "#8892a4", fontSize: "12px", fontWeight: "600", marginBottom: "3px" }}>🏆 Largest Transaction on Base</div>
                  <div style={{ color: "white", fontSize: "13px", fontWeight: "700" }}>{analysis.largestTxOnBase?.date || "—"}</div>
                  <a
                    href={`https://basescan.org/tx/${analysis.largestTxOnBase?.hash}`}
                    target="_blank" rel="noreferrer"
                    style={{ color: "#0052ff", fontSize: "11px", textDecoration: "none" }}
                  >
                    {shortHash(analysis.largestTxOnBase?.hash)}
                  </a>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#00c853", fontSize: "13px", fontWeight: "800" }}>
                    {analysis.largestTxOnBase?.valueEth} ETH
                  </div>
                </div>
              </div>

              {/* Smallest tx */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "#8892a4", fontSize: "12px", fontWeight: "600", marginBottom: "3px" }}>🔬 Smallest Transaction on Base</div>
                  <div style={{ color: "white", fontSize: "13px", fontWeight: "700" }}>{analysis.smallestTxOnBase?.date || "—"}</div>
                  <a
                    href={`https://basescan.org/tx/${analysis.smallestTxOnBase?.hash}`}
                    target="_blank" rel="noreferrer"
                    style={{ color: "#0052ff", fontSize: "11px", textDecoration: "none" }}
                  >
                    {shortHash(analysis.smallestTxOnBase?.hash)}
                  </a>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#ff6b6b", fontSize: "13px", fontWeight: "800" }}>
                    {analysis.smallestTxOnBase?.valueEth} ETH
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Activity Heatmap */}
          <div style={{
            background:   "rgba(255,255,255,0.03)",
            border:       "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding:      "20px",
          }}>
            <div style={{ color: "white", fontSize: "15px", fontWeight: "800", marginBottom: "16px" }}>
              Activity Heatmap (90 days)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "3px", marginBottom: "10px" }}>
              {analysis.heatmap.cells.map((count, i) => {
                const intensity = count === 0 ? 0 : Math.min(1, count / analysis.heatmap.maxCount);
                const bg = count === 0
                  ? "rgba(255,255,255,0.04)"
                  : `rgba(0,82,255,${0.2 + intensity * 0.8})`;
                return (
                  <div key={i} title={`${count} tx`} style={{
                    width: "10px", height: "10px", borderRadius: "2px", background: bg,
                  }} />
                );
              })}
            </div>
            <div style={{ color: "#8892a4", fontSize: "12px" }}>
              Longest streak: {analysis.heatmap.longestStreak} days
            </div>
          </div>

          {/* Volume */}
          <div style={{
            background:   "rgba(255,255,255,0.03)",
            border:       "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px",
            padding:      "20px",
          }}>
            <div style={{ color: "white", fontSize: "15px", fontWeight: "800", marginBottom: "16px" }}>Volume</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { label: "Sent",     value: analysis.totalSentEth + " ETH" },
                { label: "Received", value: analysis.totalRecvEth + " ETH" },
                { label: "Avg Gas",  value: analysis.avgGasUsed.toLocaleString() },
              ].map(item => (
                <div key={item.label} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#8892a4", fontSize: "13px" }}>{item.label}</span>
                  <span style={{ color: "white",   fontSize: "13px", fontWeight: "700" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Contracts */}
          {analysis.topContracts.length > 0 && (
            <div style={{
              background:   "rgba(255,255,255,0.03)",
              border:       "1px solid rgba(255,255,255,0.08)",
              borderRadius: "16px",
              padding:      "20px",
            }}>
              <div style={{ color: "white", fontSize: "15px", fontWeight: "800", marginBottom: "16px" }}>Top Contracts</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {analysis.topContracts.map(({ contract, count }) => (
                  <div key={contract} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <a
                      href={`https://basescan.org/address/${contract}`}
                      target="_blank" rel="noreferrer"
                      style={{ color: "#0052ff", fontSize: "13px", textDecoration: "none", fontWeight: "600" }}
                    >
                      {contract.slice(0, 8) + "..." + contract.slice(-4)}
                    </a>
                    <span style={{
                      background:   "rgba(0,82,255,0.15)",
                      border:       "1px solid rgba(0,82,255,0.3)",
                      borderRadius: "20px",
                      padding:      "2px 10px",
                      color:        "#0052ff",
                      fontSize:     "12px",
                      fontWeight:   "700",
                    }}>
                      {count} txs
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
                    }
