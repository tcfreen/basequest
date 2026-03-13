import { getLevelInfo, shortAddr } from "../utils/contracts";

export default function Dashboard({ quests, wallet, setActiveTab }) {
  const { address, isConnected } = wallet;
  const { userProfile, dailyTasks, completedCount, totalDaily, loading } = quests;

  const levelInfo = userProfile ? getLevelInfo(userProfile.totalXP) : null;

  if (!isConnected) return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "80px", marginBottom: "20px" }}>🔵</div>
      <h1 style={{ color: "white", fontSize: "28px", fontWeight: "900", margin: "0 0 12px" }}>
        Farm Base. Earn XP. Dominate the Chain.
      </h1>
      <p style={{ color: "#8892a4", fontSize: "16px", maxWidth: "400px", margin: "0 auto 32px" }}>
        Complete on-chain quests, attack the boss, and climb the leaderboard on Base Mainnet.
      </p>
      <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
        {[
          { icon: "☀️", label: "Daily Quests" },
          { icon: "🐉", label: "Boss Raids" },
          { icon: "🏆", label: "Leaderboard" },
          { icon: "🔍", label: "Wallet Analyzer" },
        ].map(f => (
          <div key={f.label} style={{
            background: "rgba(0,82,255,0.08)", border: "1px solid rgba(0,82,255,0.2)",
            borderRadius: "14px", padding: "16px 20px", textAlign: "center", minWidth: "100px",
          }}>
            <div style={{ fontSize: "28px", marginBottom: "6px" }}>{f.icon}</div>
            <div style={{ color: "#8892a4", fontSize: "12px", fontWeight: "600" }}>{f.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading && !userProfile) return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "40px", marginBottom: "16px" }}>⏳</div>
      <div style={{ color: "#8892a4" }}>Loading your profile...</div>
    </div>
  );

  return (
    <div style={{ padding: "24px 0" }}>

      {/* Welcome */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ color: "white", fontSize: "22px", fontWeight: "800", margin: "0 0 4px" }}>
          👋 Welcome back, {userProfile?.usernameSet ? userProfile.username : shortAddr(address)}
        </h2>
        <p style={{ color: "#8892a4", fontSize: "14px", margin: 0 }}>
          Here's your BaseQuest overview.
        </p>
      </div>

      {/* XP + Level card */}
      {levelInfo && (
        <div style={{
          background:   "linear-gradient(135deg, rgba(0,82,255,0.15), rgba(0,82,255,0.05))",
          border:       "1px solid rgba(0,82,255,0.3)",
          borderRadius: "20px",
          padding:      "24px",
          marginBottom: "16px",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ color: "#8892a4", fontSize: "12px", fontWeight: "700", letterSpacing: "1px", marginBottom: "4px" }}>
                CURRENT LEVEL
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "36px" }}>{levelInfo.current.emoji}</span>
                <div>
                  <div style={{ color: levelInfo.current.color, fontWeight: "900", fontSize: "22px" }}>
                    Level {levelInfo.current.level} — {levelInfo.current.name}
                  </div>
                  {levelInfo.next && (
                    <div style={{ color: "#8892a4", fontSize: "13px" }}>
                      Next: {levelInfo.next.name} at {levelInfo.next.minXP.toLocaleString()} XP
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#f0b429", fontWeight: "900", fontSize: "32px" }}>
                {levelInfo.xp.toLocaleString()}
              </div>
              <div style={{ color: "#8892a4", fontSize: "13px" }}>Total XP</div>
            </div>
          </div>

          {/* XP progress bar */}
          {levelInfo.next && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#8892a4", fontSize: "12px" }}>
                  {levelInfo.xp.toLocaleString()} XP
                </span>
                <span style={{ color: "#8892a4", fontSize: "12px" }}>
                  {levelInfo.next.minXP.toLocaleString()} XP
                </span>
              </div>
              <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "8px", height: "10px", overflow: "hidden" }}>
                <div style={{
                  height:     "100%",
                  width:      `${levelInfo.progress}%`,
                  background: `linear-gradient(90deg, ${levelInfo.current.color}, ${levelInfo.current.color}99)`,
                  borderRadius: "8px",
                  boxShadow:  `0 0 10px ${levelInfo.current.color}66`,
                  transition: "width 0.5s ease",
                }}/>
              </div>
              <div style={{ color: "#8892a4", fontSize: "12px", marginTop: "6px", textAlign: "center" }}>
                {levelInfo.progress.toFixed(1)}% to {levelInfo.next.name}
              </div>
            </div>
          )}
          {!levelInfo.next && (
            <div style={{ textAlign: "center", color: "#f0b429", fontWeight: "700", fontSize: "14px", marginTop: "8px" }}>
              🏆 Max Level Reached!
            </div>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px,1fr))", gap: "12px", marginBottom: "16px" }}>
        {[
          { label: "Tasks Completed", value: userProfile?.tasksCompleted?.toLocaleString() || "0", icon: "✅", color: "#00c853" },
          { label: "Day Streak",      value: userProfile?.streakCount || "0",                      icon: "🔥", color: "#f0b429" },
          { label: "Daily Progress",  value: `${completedCount}/${totalDaily}`,                    icon: "🗺️", color: "#0052ff" },
          { label: "Member Since",    value: userProfile?.joinedAt
              ? new Date(userProfile.joinedAt * 1000).toLocaleDateString("en-US", { month: "short", year: "numeric" })
              : "—",                                                                                icon: "📅", color: "#a855f7" },
        ].map(stat => (
          <div key={stat.label} style={{
            background:   "rgba(255,255,255,0.03)",
            border:       "1px solid rgba(255,255,255,0.07)",
            borderRadius: "16px",
            padding:      "16px",
            textAlign:    "center",
          }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>{stat.icon}</div>
            <div style={{ color: stat.color, fontWeight: "800", fontSize: "20px" }}>{stat.value}</div>
            <div style={{ color: "#8892a4", fontSize: "11px", marginTop: "4px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick action buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <button
          onClick={() => setActiveTab("quests")}
          style={{
            background:   "linear-gradient(135deg, #0052ff, #0041cc)",
            border:       "none",
            borderRadius: "14px",
            padding:      "16px",
            color:        "white",
            fontWeight:   "800",
            fontSize:     "14px",
            cursor:       "pointer",
            boxShadow:    "0 4px 20px rgba(0,82,255,0.3)",
          }}
        >
          🗺️ Daily Quests
        </button>
        <button
          onClick={() => setActiveTab("bossraid")}
          style={{
            background:   "linear-gradient(135deg, #ff3b3b, #cc0000)",
            border:       "none",
            borderRadius: "14px",
            padding:      "16px",
            color:        "white",
            fontWeight:   "800",
            fontSize:     "14px",
            cursor:       "pointer",
            boxShadow:    "0 4px 20px rgba(255,59,59,0.3)",
          }}
        >
          🐉 Boss Raid
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          style={{
            background:   "rgba(240,180,41,0.1)",
            border:       "1px solid rgba(240,180,41,0.3)",
            borderRadius: "14px",
            padding:      "16px",
            color:        "#f0b429",
            fontWeight:   "800",
            fontSize:     "14px",
            cursor:       "pointer",
          }}
        >
          🏆 Leaderboard
        </button>
        <button
          onClick={() => setActiveTab("analyzer")}
          style={{
            background:   "rgba(168,85,247,0.1)",
            border:       "1px solid rgba(168,85,247,0.3)",
            borderRadius: "14px",
            padding:      "16px",
            color:        "#a855f7",
            fontWeight:   "800",
            fontSize:     "14px",
            cursor:       "pointer",
          }}
        >
          🔍 Wallet Analyzer
        </button>
      </div>
    </div>
  );
        }
