import React from "react";
import { formatNumber } from "../utils/contracts.js";

export default function Leaderboard({ wallet, leaderboard }) {
  const { address } = wallet;
  const { entries, loading, error, totalUsers, myRank, lastUpdated, refresh } = leaderboard;

  return (
    <div className="max-w-3xl mx-auto animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">🏆 Leaderboard</h2>
          <p className="font-mono text-sm text-[#8892a4] mt-1">
            Top {entries.length} of {totalUsers} farmers
            {lastUpdated && <span className="ml-2 text-[#8892a4]">· Updated {lastUpdated.toLocaleTimeString()}</span>}
          </p>
        </div>
        <button onClick={refresh} disabled={loading} className="btn-ghost text-sm">
          {loading ? <span className="spinner spinner-sm" /> : "↻ Refresh"}
        </button>
      </div>

      {myRank && (
        <div className="glass-card p-4 mb-4 flex items-center gap-4" style={{ border: "1px solid rgba(0,82,255,0.3)", background: "rgba(0,82,255,0.05)" }}>
          <span className="font-[Orbitron] text-2xl font-bold text-[#00d4ff]">#{myRank}</span>
          <div><p className="font-mono text-sm text-white">Your Rank</p><p className="font-mono text-xs text-[#8892a4]">Keep farming to climb!</p></div>
        </div>
      )}

      {error && <div className="glass-card p-6 text-center"><p className="font-mono text-sm text-[#8892a4]">Contract not deployed yet — leaderboard will populate once live.</p></div>}

      {loading ? (
        <div className="space-y-2">{[...Array(10)].map((_,i) => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      ) : entries.length === 0 && !error ? (
        <div className="glass-card p-12 text-center"><div className="text-5xl mb-4">🌱</div><h3 className="font-display font-bold text-xl text-white mb-2">Be the First!</h3><p className="font-mono text-sm text-[#8892a4]">No farmers yet. Complete quests to claim rank #1.</p></div>
      ) : (
        <div className="space-y-2 stagger">
          {entries.map(e => (
            <div key={e.address}
              className={"glass-card p-4 flex items-center gap-4 transition-all duration-200 animate-in " + (e.rank <= 3 ? (e.rank === 1 ? "podium-1" : e.rank === 2 ? "podium-2" : "podium-3") : "") + (e.isCurrentUser ? " my-row" : "")}>
              <div className="w-10 text-center flex-shrink-0">
                {e.rank === 1 ? <span className="text-2xl">🥇</span> : e.rank === 2 ? <span className="text-2xl">🥈</span> : e.rank === 3 ? <span className="text-2xl">🥉</span> : <span className="font-[Orbitron] text-sm text-[#8892a4]">#{e.rank}</span>}
              </div>
              <span className="text-2xl flex-shrink-0">{e.level.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-white truncate flex items-center gap-2">
                  {e.display}
                  {e.isCurrentUser && <span className="badge badge-blue text-[10px]">you</span>}
                </p>
                <p className="font-mono text-xs text-[#8892a4]">{e.level.name} · {e.tasksCompleted} tasks{e.streakCount > 0 ? " · 🔥 " + e.streakCount + "d" : ""}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-[Orbitron] text-sm font-bold text-[#00d4ff]">{formatNumber(e.xp)}</p>
                <p className="font-mono text-[10px] text-[#8892a4]">XP</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
