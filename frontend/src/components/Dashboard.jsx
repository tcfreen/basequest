import { useState, useEffect } from "react";
import { getLevelInfo, shortAddr } from "../utils/contracts";

const Icon = ({ src, size = 24, style = {} }) => (
  <img src={src} alt="" width={size} height={size} style={{ display: "block", ...style }} />
);

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;600;700&display=swap');
  .dh { font-family: 'Syne', sans-serif; }
  .db { font-family: 'DM Sans', sans-serif; }
  .sc:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
`;

const gBase = { background: "rgba(255,255,255,0.06)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "24px" };
const gBlue = { background: "linear-gradient(135deg,rgba(0,82,255,0.18),rgba(0,180,255,0.10))", backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)", border: "1px solid rgba(0,140,255,0.28)", borderRadius: "24px" };
const gGold = { background: "linear-gradient(135deg,rgba(240,180,41,0.16),rgba(255,140,0,0.08))", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(240,180,41,0.30)", borderRadius: "20px" };

// Precise filters generated for each exact hex color
// #03E778 — check (bright green)
// #EDB32D — fire/streak (amber)
// #4FA7FF — quests (sky blue)
// #C186FC — calendar (soft purple)
// #F0B52D — trophy/leaderboard (gold)
const ICON_FILTERS = {
  check:    "invert(1) sepia(1) saturate(10) hue-rotate(100deg) brightness(0.95) contrast(1.1)",
  fire:     "invert(1) sepia(1) saturate(5)  hue-rotate(15deg)  brightness(0.95) contrast(1.05)",
  quests:   "invert(1) sepia(1) saturate(5)  hue-rotate(185deg) brightness(1.05) contrast(1.0)",
  calendar: "invert(1) sepia(1) saturate(8)  hue-rotate(245deg) brightness(1.0)  contrast(1.05)",
  trophy:   "invert(1) sepia(1) saturate(5)  hue-rotate(12deg)  brightness(0.95) contrast(1.05)",
};

export default function Dashboard({ quests, wallet, setPage }) {
  const { address, isConnected } = wallet;
  const { userProfile, completedCount, totalDaily, loading } = quests;
  const levelInfo = getLevelInfo(userProfile?.totalXP ?? 0);

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

  if (!isConnected) return (
    <div className="db" style={{ padding: m ? "48px 0" : "72px 0", textAlign: "center" }}>
      <Icon src="/base.svg" size={m ? 120 : 160} style={{ margin: "0 auto 24px", filter: "invert(8%) sepia(99%) saturate(7000%) hue-rotate(240deg) brightness(110%) contrast(110%)" }} />
      <h1 className="dh" style={{ color: "white", fontSize: m ? "18px" : "22px", fontWeight: 900, margin: "0 0 10px", lineHeight: 1.3 }}>
        Skill issue if you're not on chain yet.
      </h1>
      <p style={{ color: "#8892a4", fontSize: m ? "13px" : "15px", margin: 0, lineHeight: 1.6 }}>
        Stack XP. Build legacy. Eat the airdrop.
      </p>
    </div>
  );

  if (loading && !userProfile) return (
    <div className="db" style={{ padding: m ? "48px 0" : "72px 0", textAlign: "center" }}>
      <Icon src="/hourglass.svg" size={36} style={{ margin: "0 auto 14px", opacity: 0.7 }} />
      <div style={{ color: "#8892a4", fontSize: m ? "13px" : "15px" }}>Loading your profile...</div>
    </div>
  );

  const stats = [
    { src: "/check.svg",    value: userProfile?.tasksCompleted?.toLocaleString() ?? "0", color: "#03E778", label: "TASKS DONE",    filterKey: "check"    },
    { src: "/fire.svg",     value: userProfile?.streakCount ?? "0",                       color: "#EDB32D", label: "DAY STREAK",   filterKey: "fire"     },
    { src: "/quests.svg",   value: `${completedCount}/${totalDaily}`,                     color: "#4FA7FF", label: "DAILY QUESTS", filterKey: "quests"   },
    { src: "/calendar.svg", value: userProfile?.joinedAt
        ? new Date(userProfile.joinedAt * 1000).toLocaleDateString("en-US", { month: "short", year: "numeric" })
        : "—",                                                                             color: "#C186FC", label: "MEMBER SINCE", filterKey: "calendar" },
  ];

  return (
    <div className="db" style={{ padding: m ? "14px 0 8px" : "24px 0 8px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: m ? 14 : 20 }}>
        <div>
          <h2 className="dh" style={{ color: "white", fontSize: m ? "17px" : "22px", fontWeight: 900, margin: "0 0 2px", letterSpacing: "-0.3px" }}>
            Welcome back, <span style={{ color: "#4da6ff" }}>{userProfile?.usernameSet ? userProfile.username : shortAddr(address)}</span>
          </h2>
          <p style={{ color: "#5a6478", fontSize: m ? "10px" : "11px", margin: 0, fontWeight: 600, letterSpacing: "0.07em" }}>BASEQUEST OVERVIEW</p>
        </div>
      </div>

      {/* Level Card */}
      <div style={{ ...gBlue, padding: m ? "14px" : "20px", marginBottom: m ? 10 : 14 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>

          {/* Badge + info */}
          <div style={{ display: "flex", alignItems: "center", gap: m ? 9 : 12, minWidth: 0 }}>
            <div style={{ width: m ? 42 : 52, height: m ? 42 : 52, borderRadius: m ? 12 : 16, flexShrink: 0, background: `${levelInfo.current.color}22`, border: `2px solid ${levelInfo.current.color}55`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon src={levelInfo.current.icon} size={m ? 24 : 30} style={{ filter: `drop-shadow(0 0 5px ${levelInfo.current.color})` }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ color: "#7a8799", fontSize: m ? "9px" : "10px", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 2 }}>CURRENT LEVEL</div>
              <div className="dh" style={{ color: levelInfo.current.color, fontSize: m ? "17px" : "21px", fontWeight: 900, lineHeight: 1, textShadow: `0 0 16px ${levelInfo.current.color}66` }}>
                {levelInfo.current.level} — {levelInfo.current.name}
              </div>
            </div>
          </div>

          {/* XP pill */}
          <div style={{ background: "rgba(240,180,41,0.12)", border: "1px solid rgba(240,180,41,0.28)", borderRadius: 12, padding: m ? "7px 10px" : "9px 14px", textAlign: "right", flexShrink: 0 }}>
            <div className="dh" style={{ color: "#f0b429", fontSize: m ? "20px" : "26px", fontWeight: 900, lineHeight: 1, textShadow: "0 0 14px rgba(240,180,41,0.4)" }}>
              {levelInfo.xp.toLocaleString()}
            </div>
            <div style={{ color: "#9a7a30", fontSize: m ? "9px" : "10px", fontWeight: 700, letterSpacing: "0.06em" }}>TOTAL XP</div>
          </div>
        </div>

        {/* Progress bar */}
        {levelInfo.next && (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ color: "#5a6478", fontSize: m ? "9px" : "10px", fontWeight: 600 }}>
                {(levelInfo.xp - levelInfo.current.minXP).toLocaleString()} XP earned
              </span>
              <span style={{ color: "#5a6478", fontSize: m ? "9px" : "10px", fontWeight: 600 }}>
                {(levelInfo.next.minXP - levelInfo.xp).toLocaleString()} to Lv {levelInfo.next.level}
              </span>
            </div>
            <div style={{ height: m ? 5 : 7, background: "rgba(255,255,255,0.07)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", borderRadius: 99, transition: "width 0.6s ease", width: `${levelInfo.progress}%`, background: `linear-gradient(90deg,${levelInfo.current.color},#4da6ff)`, boxShadow: `0 0 10px ${levelInfo.current.color}88` }} />
            </div>
          </>
        )}
      </div>

      {/* Stat Cards */}
      <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4,1fr)", gap: m ? 7 : 10, marginBottom: m ? 10 : 14 }}>
        {stats.map(({ src, value, color, label, filterKey }) => (
          <div key={label} className="sc" style={{ ...gBase, padding: m ? "13px 10px" : "16px 12px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: m ? 4 : 6, transition: "transform 0.18s, box-shadow 0.18s" }}>
            {/* Wrap icon in a colored div and use mix-blend-mode to force exact color */}
            <div style={{ position: "relative", width: m ? 26 : 30, height: m ? 26 : 30 }}>
              <Icon src={src} size={m ? 26 : 30} style={{ filter: "brightness(0) invert(1)", opacity: 0 }} />
              <div style={{
                position: "absolute", inset: 0,
                backgroundColor: color,
                WebkitMaskImage: `url(${src})`,
                WebkitMaskSize: "contain",
                WebkitMaskRepeat: "no-repeat",
                WebkitMaskPosition: "center",
                maskImage: `url(${src})`,
                maskSize: "contain",
                maskRepeat: "no-repeat",
                maskPosition: "center",
              }} />
            </div>
            <div className="dh" style={{ color, fontWeight: 900, fontSize: m ? "15px" : "18px", lineHeight: 1 }}>{value}</div>
            <div style={{ color, fontSize: m ? "8px" : "9px", fontWeight: 700, letterSpacing: "0.07em", opacity: 0.5 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Leaderboard Button */}
      <button
        className="db"
        onClick={() => setPage("leaderboard")}
        style={{ width: "100%", ...gGold, padding: m ? "13px 14px" : "15px 20px", color: "#F0B52D", fontWeight: 800, fontSize: m ? "13px" : "14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 9, transition: "transform 0.15s, box-shadow 0.15s", boxShadow: "0 4px 20px rgba(240,180,41,0.10)", WebkitTapHighlightColor: "transparent", userSelect: "none" }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(240,180,41,0.22)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = "0 4px 20px rgba(240,180,41,0.10)"; }}
        onTouchStart={e => e.currentTarget.style.transform = "scale(0.98)"}
        onTouchEnd={e =>   e.currentTarget.style.transform = "scale(1)"}
      >
        {/* Trophy icon using CSS mask for exact #F0B52D color */}
        <div style={{
          position: "relative", width: m ? 22 : 26, height: m ? 22 : 26, flexShrink: 0,
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundColor: "#F0B52D",
            WebkitMaskImage: "url(/trophy.svg)",
            WebkitMaskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskImage: "url(/trophy.svg)",
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }} />
        </div>
        View Leaderboard
        <span style={{ marginLeft: "auto", opacity: 0.35, fontSize: 16 }}>›</span>
      </button>

    </div>
  );
}
