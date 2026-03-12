import React from "react";
import ActivityFeed from "./ActivityFeed.jsx";
import { getLevelInfo, shortAddr, formatNumber, mmss } from "../utils/contracts.js";

function StatCard({ icon, label, value, sub, color = "#0052ff" }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
          style={{ background: color + "1a", border: "1px solid " + color + "40" }}>
          {icon}
        </div>
      </div>
      <p className="font-[Orbitron] text-2xl font-bold text-white mb-0.5">{value}</p>
      <p className="font-mono text-xs text-[#8892a4]">{label}</p>
      {sub && <p className="font-mono text-xs mt-1" style={{ color }}>{sub}</p>}
    </div>
  );
}

function WelcomeHero({ onConnect, isConnecting }) {
  return (
    <div className="relative rounded-3xl overflow-hidden mb-8 p-8 sm:p-12 text-center grid-bg"
      style={{ background: "linear-gradient(135deg, #12141a, #1a1d27)", border: "1px solid rgba(0,82,255,0.15)" }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,82,255,0.12) 0%, transparent 70%)" }} />
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-6"
          style={{ background: "rgba(0,82,255,0.1)", border: "1px solid rgba(0,82,255,0.3)", color: "#00d4ff" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#00c853] animate-pulse inline-block" />
          Live on Base Mainnet
        </div>
        <h1 className="font-display font-extrabold text-4xl sm:text-6xl text-white mb-4 leading-tight">
          Farm Base.<br />
          <span style={{ background: "linear-gradient(135deg, #0052ff, #00d4ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Earn XP.</span><br />
          Dominate the Chain.
        </h1>
        <p className="font-mono text-[#8892a4] text-lg mb-8 max-w-xl mx-auto">
          Complete on-chain tasks, climb the leaderboard, and prove you are a true Base native.
        </p>
        <button onClick={() => onConnect("injected")} disabled={isConnecting}
          className="btn-primary text-base px-8 py-4">
          {isConnecting ? <><span className="spinner" /> Connecting...</> : "🚀 Start Farming XP"}
        </button>
        <div className="grid grid-cols-3 gap-4 mt-10 max-w-md mx-auto">
          {[["8", "Tasks Available"], ["6", "XP Levels"], ["∞", "Rewards"]].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="font-[Orbitron] text-2xl font-bold text-white">{v}</p>
              <p className="font-mono text-xs text-[#8892a4]">{l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ wallet, quests, leaderboard, setActiveTab }) {
  const { address, isConnecting, isCorrectNetwork } = wallet;
  const { profile, levelInfo, dailyTasks, ethPrice, taskLoading } = quests;

  if (!address) return (
    <div>
      <WelcomeHero onConnect={wallet.connect} isConnecting={isConnecting} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: "☀️", label: "Complete tasks",    desc: "Do on-chain actions daily to earn XP" },
          { icon: "🏆", label: "Climb the board",   desc: "Rise through 6 levels from Newbie to Phoenix" },
          { icon: "🎲", label: "Win the prize pool", desc: "Join the 5-min mini-game with real ETH prizes" },
        ].map(c => (
          <div key={c.label} className="glass-card p-6 text-center">
            <div className="text-4xl mb-3">{c.icon}</div>
            <h3 className="font-display font-semibold text-white mb-2">{c.label}</h3>
            <p className="font-mono text-sm text-[#8892a4]">{c.desc}</p>
          </div>
        ))}
      </div>
      <ActivityFeed limit={8} />
    </div>
  );

  const tasksToday    = dailyTasks ? [dailyTasks.gmDone, dailyTasks.deployDone, dailyTasks.swapDone, dailyTasks.bridgeDone, dailyTasks.gameDone, dailyTasks.referralDone].filter(Boolean).length : 0;
  const xpToday       = (dailyTasks?.gmDone ? 50 : 0) + (dailyTasks?.deployDone ? 100 : 0) + (dailyTasks?.swapDone ? 75 : 0) + (dailyTasks?.bridgeDone ? 100 : 0) + (dailyTasks?.gameDone ? 75 : 0) + (dailyTasks?.referralDone ? 150 : 0);
  const myRank        = leaderboard.myRank;
  const streak        = profile?.streakCount || 0;
  const nextStreakIn  = streak > 0 ? (7 - (streak % 7)) : 7;

  return (
    <div className="animate-in">
      <div className="relative rounded-3xl overflow-hidden mb-8 p-6 sm:p-8 grid-bg"
        style={{ background: "linear-gradient(135deg, #12141a, #1a1d27)", border: "1px solid rgba(0,82,255,0.2)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 0% 50%, rgba(0,82,255,0.08) 0%, transparent 60%)" }} />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
              style={{ background: levelInfo ? levelInfo.current.color + "1a" : "#0052ff1a", border: "1px solid " + (levelInfo?.current.color || "#0052ff") + "40" }}>
              {levelInfo?.current.emoji || "🌱"}
            </div>
            <div>
              <p className="font-mono text-sm text-[#8892a4] mb-1">
                {profile?.usernameSet ? profile.username : shortAddr(address)}
              </p>
              <h2 className="font-display font-bold text-2xl text-white">
                {levelInfo?.current.name || "Newbie"}
                <span className="font-mono text-sm font-normal text-[#8892a4] ml-2">Level {levelInfo?.current.level}</span>
              </h2>
            </div>
          </div>
          <div className="flex-1 sm:max-w-xs">
            <div className="flex justify-between mb-2">
              <span className="font-[Orbitron] text-[#00d4ff] font-bold">{formatNumber(profile?.totalXP || 0)} XP</span>
              {levelInfo?.next && <span className="font-mono text-xs text-[#8892a4]">{formatNumber(levelInfo.next.minXP)} XP</span>}
            </div>
            <div className="xp-bar-track">
              <div className="xp-bar-fill" style={{ width: (levelInfo?.progress || 0) + "%" }} />
            </div>
            {levelInfo?.next && <p className="font-mono text-xs text-[#8892a4] mt-1">{Math.round(levelInfo.progress)}% to {levelInfo.next.name}</p>}
          </div>
          <div className="flex flex-wrap gap-2 sm:ml-auto">
            {myRank && <span className="badge badge-gold">🏆 Rank #{myRank}</span>}
            {streak > 0 && <span className="badge badge-blue">🔥 {streak}-day streak</span>}
            {!isCorrectNetwork && <span className="badge badge-red cursor-pointer" onClick={wallet.switchToBase}>⚠ Wrong Network</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        <StatCard icon="⚡" label="Total XP"      value={formatNumber(profile?.totalXP || 0)} sub="All time" color="#0052ff" />
        <StatCard icon="✅" label="Tasks Today"   value={tasksToday + "/6"} sub={"+" + xpToday + " XP today"} color="#00c853" />
        <StatCard icon="🔥" label="Day Streak"    value={streak}           sub={"Next bonus in " + nextStreakIn + " days"} color="#f0b429" />
        <StatCard icon="👥" label="Referrals"     value={profile?.referralCount || 0} sub="Friends referred" color="#a855f7" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <h3 className="font-display font-bold text-lg text-white mb-4">Today's Progress</h3>
          <div className="space-y-2">
            {[
              { label: "GM Base",        done: dailyTasks?.gmDone,       xp: 50,  icon: "☀️" },
              { label: "Deploy",         done: dailyTasks?.deployDone,   xp: 100, icon: "🚀" },
              { label: "Swap",           done: dailyTasks?.swapDone,     xp: 75,  icon: "🔄" },
              { label: "Bridge",         done: dailyTasks?.bridgeDone,   xp: 100, icon: "🌉" },
              { label: "Mini-Game",      done: dailyTasks?.gameDone,     xp: 75,  icon: "🎲" },
              { label: "Referral",       done: dailyTasks?.referralDone, xp: 150, icon: "👥" },
              { label: "Set Profile",    done: dailyTasks?.profileDone,  xp: 50,  icon: "🪪", oneTime: true },
            ].map(task => (
              <div key={task.label} className="flex items-center gap-3 p-2.5 rounded-xl transition-all"
                style={{ background: task.done ? "rgba(0,200,83,0.05)" : "rgba(255,255,255,0.02)" }}>
                <span className="text-xl">{task.icon}</span>
                <span className={"flex-1 font-mono text-sm " + (task.done ? "text-[#8892a4] line-through" : "text-white")}>{task.label}</span>
                {task.done ? <span className="badge badge-green">+{task.xp} XP ✓</span> : <span className="badge badge-gray">{task.oneTime ? "one-time" : "+"+task.xp+" XP"}</span>}
              </div>
            ))}
          </div>
          <button onClick={() => setActiveTab("quests")} className="btn-primary w-full mt-4 text-sm">
            Complete Quests →
          </button>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-lg text-white">Leaderboard</h3>
              <button onClick={() => setActiveTab("leaderboard")} className="btn-ghost text-xs py-1.5 px-3">See all →</button>
            </div>
            {leaderboard.loading ? (
              <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}</div>
            ) : leaderboard.entries.slice(0, 5).map(e => (
              <div key={e.address} className={"flex items-center gap-3 p-2.5 rounded-xl mb-1 " + (e.isCurrentUser ? "my-row" : "")}
                style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className={"font-[Orbitron] text-sm w-6 text-center " + (e.rank === 1 ? "text-[#f0b429]" : e.rank === 2 ? "text-[#c0c0c0]" : e.rank === 3 ? "text-[#cd7f32]" : "text-[#8892a4]")}>{e.rank}</span>
                <span className="text-lg">{e.level.emoji}</span>
                <span className="flex-1 font-mono text-sm text-white truncate">{e.display}</span>
                <span className="font-[Orbitron] text-xs text-[#00d4ff]">{formatNumber(e.xp)}</span>
              </div>
            ))}
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display font-bold text-lg text-white mb-4">🎲 Mini-Game</h3>
            <p className="font-mono text-sm text-[#8892a4] mb-4">Join the 5-minute prize pool. Winner takes 80%.</p>
            <button onClick={() => setActiveTab("game")} className="btn-gold w-full text-sm">Play Now →</button>
          </div>
        </div>
      </div>

      <ActivityFeed limit={6} />
    </div>
  );
}
