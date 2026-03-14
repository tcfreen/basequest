import { getLevelInfo, shortAddr } from "../utils/contracts";

export default function Dashboard({ quests, wallet, setActiveTab }) {

  const { address, isConnected } = wallet;
  const { userProfile, completedCount, totalDaily, loading } = quests;

  const levelInfo = userProfile ? getLevelInfo(userProfile.totalXP) : null;

  if (!isConnected) return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <img src="/base.svg" style={{ width: "84px", height: "84px", marginBottom: "20px" }} />
      <h1 style={{ color: "white", fontSize: "28px", fontWeight: "900", marginBottom: "12px" }}>
        Skill issue if you're not on-chain yet.
      </h1>
      <p style={{ color: "#8892a4", fontSize: "15px", maxWidth: "420px", margin: "0 auto 6px" }}>
        Stack XP. Build legacy. Eat the airdrop.
      </p>
      <p style={{ color: "#0052ff", fontSize: "14px", fontWeight: "700" }}>
        Based chads only. No paper hands allowed.
      </p>
    </div>
  );

  if (loading && !userProfile) return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <img src="/loading.svg" style={{ width: "36px", height: "36px" }} />
      <p style={{ color: "#8892a4", marginTop: "12px" }}>Loading profile...</p>
    </div>
  );

  return (
    <div style={{ padding: "24px 0", display: "flex", flexDirection: "column", gap: "18px" }}>

      {/* Header */}
      <div>
        <h2 style={{ color: "white", fontSize: "22px", fontWeight: "800", marginBottom: "4px" }}>
          Welcome back {userProfile?.usernameSet ? userProfile.username : shortAddr(address)}
        </h2>
        <p style={{ color: "#8892a4", fontSize: "13px" }}>BaseQuest dashboard</p>
      </div>

      {/* Level card */}
      {levelInfo && (
        <div style={{
          background: "linear-gradient(135deg, rgba(0,82,255,0.18), rgba(0,82,255,0.04))",
          border: "1px solid rgba(0,82,255,0.35)",
          borderRadius: "18px",
          padding: "22px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <img src="/level.svg" style={{ width: "36px", height: "36px" }} />
              <div>
                <div style={{ color: levelInfo.current.color, fontWeight: "800", fontSize: "18px" }}>
                  Level {levelInfo.current.level}
                </div>
                <div style={{ color: "#8892a4", fontSize: "12px" }}>
                  {levelInfo.current.name}
                </div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#f0b429", fontWeight: "900", fontSize: "28px" }}>
                {levelInfo.xp.toLocaleString()}
              </div>
              <div style={{ color: "#8892a4", fontSize: "12px" }}>XP</div>
            </div>
          </div>
          {levelInfo.next && (
            <div>
              <div style={{ height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ width: `${levelInfo.progress}%`, height: "100%", background: levelInfo.current.color }} />
              </div>
              <p style={{ color: "#8892a4", fontSize: "11px", marginTop: "6px", textAlign: "center" }}>
                {levelInfo.progress.toFixed(1)}% to {levelInfo.next.name}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: "10px"
      }}>
        {[
          { label: "Tasks", value: userProfile?.tasksCompleted?.toLocaleString() || "0", icon: "/check.svg" },
          { label: "Streak", value: userProfile?.streakCount || "0", icon: "/streak.svg" },
          { label: "Today", value: `${completedCount}/${totalDaily}`, icon: "/progress.svg" },
          { label: "Joined", value: userProfile?.joinedAt
              ? new Date(userProfile.joinedAt * 1000).toLocaleDateString("en-US",{month:"short",year:"numeric"})
              : "-", icon: "/calendar.svg" }
        ].map(stat => (
          <div key={stat.label} style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "14px",
            padding: "14px",
            textAlign: "center"
          }}>
            <img src={stat.icon} style={{ width: "22px", height: "22px", marginBottom: "6px" }} />
            <div style={{ color: "white", fontWeight: "700", fontSize: "16px" }}>{stat.value}</div>
            <div style={{ color: "#8892a4", fontSize: "11px" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Single Leaderboard Button */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => setActiveTab("leaderboard")}
          style={{
            background: "linear-gradient(135deg, #f0b429, #d69e2e)",
            border: "none",
            borderRadius: "16px",
            padding: "16px 28px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 6px 20px rgba(240,180,41,0.3)",
            fontWeight: "800",
            fontSize: "16px",
            color: "white"
          }}
        >
          <img src="/leaderboard.svg" style={{ width: "24px", height: "24px" }} />
          Leaderboard
        </button>
      </div>

    </div>
  );
}
