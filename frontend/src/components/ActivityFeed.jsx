import { useState, useEffect } from "react";
import { getCoreContract, getReadProvider, shortAddr, timeAgo } from "../utils/contracts.js";

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

const TASK_META = {
  GM_BASE:         { icon: "/gm.svg",       label: "GM Base",        xp: 50  },
  DEPLOY_CONTRACT: { icon: "/deploy.svg",   label: "Deploy Contract", xp: 100 },
  SWAP_BASE:       { icon: "/swap.svg",     label: "Swap on Base",   xp: 75  },
  BRIDGE_BASE:     { icon: "/bridge.svg",   label: "Bridge to Base", xp: 100 },
  MINI_GAME:       { icon: "/bossraid.svg", label: "Boss Raid",      xp: 75  },
  SET_PROFILE:     { icon: "/profile.svg",  label: "Set Profile",    xp: 50  },
  SWAP_AERODROME:  { icon: "/aerodrome.svg",label: "Swap Aerodrome", xp: 50  },
  SWAP_UNISWAP:    { icon: "/uniswap.svg",  label: "Swap Uniswap",   xp: 50  },
  SWAP_JUMPER:     { icon: "/jumper.svg",   label: "Swap Jumper",    xp: 50  },
  SWAP_RELAY:      { icon: "/relay.svg",    label: "Swap Relay",     xp: 50  },
  BRIDGE_JUMPER:   { icon: "/jumper.svg",   label: "Bridge Jumper",  xp: 50  },
  BRIDGE_RELAY:    { icon: "/relay.svg",    label: "Bridge Relay",   xp: 50  },
};

export default function ActivityFeed({ limit = 10 }) {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
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

  useEffect(() => {
    let cancelled = false;
    async function fetchEvents() {
      try {
        const provider  = getReadProvider();
        const core      = getCoreContract(provider);
        const filter    = core.filters.TaskCompleted();
        const block     = await provider.getBlockNumber();
        const fromBlock = Math.max(0, block - 5000);
        const logs      = await core.queryFilter(filter, fromBlock, block);
        if (cancelled) return;
        const parsed = logs.slice(-50).reverse().map((log, i) => ({
          id:        log.transactionHash + i,
          address:   log.args.user,
          taskType:  log.args.taskType,
          xpEarned:  Number(log.args.xpEarned),
          timestamp: Number(log.args.timestamp),
          txHash:    log.transactionHash,
          meta:      TASK_META[log.args.taskType] || { icon: "/check.svg", label: log.args.taskType, xp: Number(log.args.xpEarned) },
        }));
        setEvents(parsed.slice(0, limit));
      } catch (err) { if (!cancelled) setError(err.message); }
      finally       { if (!cancelled) setLoading(false); }
    }
    fetchEvents();
    return () => { cancelled = true; };
  }, [limit]);

  const m = isMobile;

  /* ── Loading ── */
  if (loading) return (
    <div className="db" style={{ ...gBase, padding: m ? "14px" : "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: m ? 12 : 16 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00c853", animation: "pulse 1.5s infinite" }} />
        <div className="dh" style={{ color: "white", fontSize: m ? "14px" : "16px", fontWeight: 800 }}>Live Activity</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.03)", borderRadius: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,0.05)", animation: "pulse 1.5s infinite", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ height: 10, background: "rgba(255,255,255,0.05)", borderRadius: 6, marginBottom: 6, width: "55%", animation: "pulse 1.5s infinite" }} />
              <div style={{ height: 8,  background: "rgba(255,255,255,0.04)", borderRadius: 6, width: "35%", animation: "pulse 1.5s infinite" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  /* ── Error ── */
  if (error) return (
    <div className="db" style={{ ...gBase, padding: m ? "14px" : "20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Icon src="/fire.svg" size={m ? 16 : 18} style={{ opacity: 0.8 }} />
        <div className="dh" style={{ color: "white", fontSize: m ? "14px" : "16px", fontWeight: 800 }}>Live Activity</div>
      </div>
      <p style={{ color: "#8892a4", fontSize: m ? "12px" : "13px", margin: 0 }}>
        Contract not deployed yet — activity will appear here once live.
      </p>
    </div>
  );

  /* ── Feed ── */
  return (
    <div className="db" style={{ ...gBase, padding: m ? "14px" : "20px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: m ? 12 : 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00c853", boxShadow: "0 0 6px #00c853" }} />
          <div className="dh" style={{ color: "white", fontSize: m ? "14px" : "16px", fontWeight: 800 }}>Live Activity</div>
        </div>
        <span style={{ background: "rgba(0,82,255,0.15)", border: "1px solid rgba(0,82,255,0.3)", borderRadius: 20, padding: "2px 10px", color: "#4da6ff", fontSize: "11px", fontWeight: 700 }}>
          {events.length} recent
        </span>
      </div>

      {/* Empty */}
      {events.length === 0 ? (
        <div style={{ color: "#8892a4", fontSize: m ? "12px" : "13px", textAlign: "center", padding: m ? "16px 0" : "20px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon src="/check.svg" size={16} style={{ opacity: 0.4 }} />
          No recent activity. Be the first!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: m ? 6 : 8 }}>
          {events.map(ev => (
            <a
              key={ev.id}
              href={`https://basescan.org/tx/${ev.txHash}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: m ? 9 : 12, padding: m ? "9px 11px" : "10px 14px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,82,255,0.06)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
            >
              {/* Task icon */}
              <div style={{ width: m ? 34 : 38, height: m ? 34 : 38, borderRadius: m ? 10 : 12, background: "rgba(0,82,255,0.1)", border: "1px solid rgba(0,82,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon src={ev.meta.icon} size={m ? 17 : 20} style={{ opacity: 0.9 }} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="dh" style={{ color: "white", fontSize: m ? "12px" : "13px", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  <span style={{ color: "#4da6ff" }}>{shortAddr(ev.address)}</span>
                  <span style={{ color: "#5a6478", margin: "0 5px" }}>·</span>
                  {ev.meta.label}
                </div>
                <div className="db" style={{ color: "#5a6478", fontSize: m ? "10px" : "11px", marginTop: 2 }}>{timeAgo(ev.timestamp)}</div>
              </div>

              {/* XP badge */}
              <span style={{ background: "rgba(0,200,83,0.12)", border: "1px solid rgba(0,200,83,0.25)", borderRadius: 20, padding: "2px 9px", color: "#00c853", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>
                +{ev.meta.xp} XP
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
                      }
