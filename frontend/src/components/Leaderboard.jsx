import { useState, useEffect } from "react";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { formatNumber } from "../utils/contracts";

const Icon = ({ src, size = 18, style = {} }) => (
  <img src={src} alt="" width={size} height={size} style={{ display: "block", ...style }} />
);

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;600;700&display=swap');
  .dh { font-family: 'Syne', sans-serif; }
  .db { font-family: 'DM Sans', sans-serif; }
  @keyframes pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }
`;

const gBase = { background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" };
const gBlue = { background: "rgba(0,82,255,0.08)",    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(0,82,255,0.28)",   borderRadius: "16px" };

const RANK_STYLES = {
  1: { border: "rgba(240,180,41,0.3)",  bg: "rgba(240,180,41,0.06)",  icon: "/gold.svg"   },
  2: { border: "rgba(180,180,180,0.3)", bg: "rgba(180,180,180,0.04)", icon: "/silver.svg" },
  3: { border: "rgba(205,127,50,0.3)",  bg: "rgba(205,127,50,0.04)",  icon: "/bronze.svg" },
};

export default function Leaderboard({ wallet }) {
  const { address } = wallet;
  const { entries, loading, error, totalUsers, myRank, lastUpdated, refresh } = useLeaderboard(address);
  const [isMobile, setIsMobile] = useState(false);

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

  return (
    <div className="db" style={{ padding: m ? "14px 0 8px" : "24px 0 8px", maxWidth: "700px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: m ? 14 : 20, gap: 12, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Icon src="/trophy.svg" size={m ? 18 : 22} style={{ opacity: 0.85 }} />
          <div>
            <h2 className="dh" style={{ color: "white", fontSize: m ? "17px" : "22px", fontWeight: 900, margin: "0 0 2px" }}>Leaderboard</h2>
            <p className="db" style={{ color: "#5a6478", fontSize: m ? "10px" : "11px", margin: 0, fontWeight: 600, letterSpacing: "0.07em" }}>
              TOP {entries.length} OF {totalUsers} USERS
              {lastUpdated && <span> · {lastUpdated.toLocaleTimeString()}</span>}
            </p>
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          style={{ ...gBase, padding: m ? "7px 12px" : "8px 16px", color: loading ? "#5a6478" : "white", fontWeight: 700, fontSize: m ? "12px" : "13px", cursor: loading ? "not-allowed" : "pointer", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 6, fontFamily: "DM Sans, sans-serif" }}
        >
          <Icon src="/refresh.svg" size={13} style={{ opacity: loading ? 0.4 : 0.8, transition: "opacity 0.2s" }} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Your rank */}
      {myRank && (
        <div style={{ ...gBlue, padding: m ? "13px 14px" : "16px 20px", marginBottom: m ? 10 : 14, display: "flex", alignItems: "center", gap: 14 }}>
          <div className="dh" style={{ color: "#00d4ff", fontWeight: 900, fontSize: m ? "24px" : "28px", flexShrink: 0 }}>#{myRank}</div>
          <div>
            <div className="dh" style={{ color: "white", fontWeight: 700, fontSize: m ? "13px" : "14px" }}>Your Rank</div>
            <div className="db" style={{ color: "#8892a4", fontSize: m ? "11px" : "12px" }}>Keep farming to climb!</div>
          </div>
          <Icon src="/fire.svg" size={m ? 20 : 24} style={{ marginLeft: "auto", opacity: 0.7 }} />
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ ...gBase, padding: m ? "20px" : "24px", textAlign: "center", marginBottom: m ? 10 : 14 }}>
          <Icon src="/warning.svg" size={32} style={{ margin: "0 auto 10px", opacity: 0.5 }} />
          <div className="db" style={{ color: "#8892a4", fontSize: m ? "13px" : "14px" }}>
            Unable to load leaderboard — tap Refresh to try again.
          </div>
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: m ? 6 : 8 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ height: m ? 58 : 68, background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)", animation: "pulse 1.5s infinite", animationDelay: `${i * 0.07}s` }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && entries.length === 0 && (
        <div style={{ ...gBase, padding: m ? "36px 20px" : "48px 24px", textAlign: "center" }}>
          <Icon src="/seedling.svg" size={m ? 40 : 52} style={{ margin: "0 auto 14px", opacity: 0.6 }} />
          <div className="dh" style={{ color: "white", fontWeight: 800, fontSize: m ? "16px" : "18px", marginBottom: 6 }}>Be the First!</div>
          <div className="db" style={{ color: "#8892a4", fontSize: m ? "13px" : "14px" }}>No farmers yet. Complete quests to claim rank #1.</div>
        </div>
      )}

      {/* Entries */}
      {!loading && entries.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: m ? 6 : 8 }}>
          {entries.map(e => {
            const rs = RANK_STYLES[e.rank];
            const border = rs ? rs.border : e.isCurrentUser ? "rgba(0,82,255,0.3)" : "rgba(255,255,255,0.06)";
            const bg     = rs ? rs.bg     : e.isCurrentUser ? "rgba(0,82,255,0.05)" : "rgba(255,255,255,0.02)";

            return (
              <div key={e.address} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: m ? "11px 13px" : "14px 18px", display: "flex", alignItems: "center", gap: m ? 10 : 14, backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}>

                {/* Rank */}
                <div style={{ width: m ? 28 : 36, textAlign: "center", flexShrink: 0 }}>
                  {rs
                    ? <Icon src={rs.icon} size={m ? 22 : 26} style={{ margin: "0 auto" }} />
                    : <span className="dh" style={{ color: "#5a6478", fontWeight: 700, fontSize: m ? "13px" : "14px" }}>#{e.rank}</span>
                  }
                </div>

                {/* Level icon */}
                <Icon src={e.level.icon} size={m ? 22 : 26} style={{ flexShrink: 0, filter: `drop-shadow(0 0 4px ${e.level.color})` }} />

                {/* Name + stats */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span className="dh" style={{ color: "white", fontWeight: 700, fontSize: m ? "13px" : "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {e.display}
                    </span>
                    {e.isCurrentUser && (
                      <span style={{ background: "rgba(0,82,255,0.2)", border: "1px solid rgba(0,82,255,0.4)", borderRadius: 20, padding: "1px 7px", color: "#00d4ff", fontSize: "10px", fontWeight: 700, flexShrink: 0 }}>you</span>
                    )}
                  </div>
                  <div className="db" style={{ color: "#5a6478", fontSize: m ? "10px" : "11px", display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ color: e.level.color, fontWeight: 600 }}>{e.level.name}</span>
                    <span>·</span>
                    <span>{e.tasksCompleted} tasks</span>
                    {e.streakCount > 0 && (
                      <>
                        <span>·</span>
                        <Icon src="/fire.svg" size={11} style={{ opacity: 0.8 }} />
                        <span>{e.streakCount}d</span>
                      </>
                    )}
                  </div>
                </div>

                {/* XP */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="dh" style={{ color: "#00d4ff", fontWeight: 800, fontSize: m ? "15px" : "16px" }}>
                    {formatNumber(e.xp)}
                  </div>
                  <div className="db" style={{ color: "#5a6478", fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em" }}>XP</div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
                }
