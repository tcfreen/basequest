import os

files = {
"frontend/src/components/QuestBoard.jsx": """import React, { useState } from "react";
import { TASKS, formatNumber } from "../utils/contracts.js";

export default function QuestBoard({ wallet, quests }) {
  const { address, isCorrectNetwork } = wallet;
  const { dailyTasks, taskLoading, ethPrice, completeGM, completeDeploy, completeSwap, completeBridge, completeGame, completeReferral, completeProfile } = quests;
  const [fields, setFields] = useState({});

  const isDone = (taskId) => {
    if (!dailyTasks) return false;
    const map = { gm: "gmDone", deploy: "deployDone", swap: "swapDone", bridge: "bridgeDone", game: "gameDone", referral: "referralDone", profile: "profileDone" };
    return !!dailyTasks[map[taskId]];
  };

  const handleTask = async (taskId) => {
    const field = fields[taskId] || "";
    if (taskId === "gm")       return completeGM();
    if (taskId === "deploy")   return completeDeploy(field);
    if (taskId === "swap")     return completeSwap();
    if (taskId === "bridge")   return completeBridge();
    if (taskId === "game")     return completeGame();
    if (taskId === "referral") return completeReferral(field);
    if (taskId === "profile")  return completeProfile(field);
  };

  if (!address) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">🔒</div>
      <h2 className="font-display font-bold text-2xl text-white mb-2">Connect Wallet</h2>
      <p className="font-mono text-[#8892a4]">Connect your wallet to start completing quests.</p>
    </div>
  );

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="section-title">Quest Board</h2>
          <p className="font-mono text-sm text-[#8892a4] mt-1">Complete tasks to earn XP. Daily tasks reset every 24h.</p>
        </div>
        {!isCorrectNetwork && (
          <button onClick={wallet.switchToBase} className="badge badge-red animate-pulse cursor-pointer">⚠ Switch to Base</button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
        {TASKS.filter(t => !t.auto).map(task => {
          const done    = isDone(task.id);
          const loading = !!taskLoading[task.id];
          const usdCost = task.ethCost !== "0" ? (parseFloat(task.ethCost) * ethPrice).toFixed(2) : null;
          return (
            <div key={task.id} className={"glass-card p-5 transition-all duration-300 animate-in " + (done ? "opacity-60" : "glass-card-hover")}
              style={done ? { borderColor: "rgba(0,200,83,0.2)" } : {}}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: done ? "rgba(0,200,83,0.1)" : "rgba(0,82,255,0.1)", border: "1px solid " + (done ? "rgba(0,200,83,0.3)" : "rgba(0,82,255,0.3)") }}>
                  {done ? "✅" : task.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-display font-semibold text-white">{task.name}</h3>
                    <span className="badge badge-blue">+{task.xp} XP</span>
                    {task.oneTime && <span className="badge badge-gray">one-time</span>}
                    {task.daily  && <span className="badge badge-gray">daily</span>}
                  </div>
                  <p className="font-mono text-sm text-[#8892a4]">{task.description}</p>
                  {task.ethCost !== "0" && (
                    <p className="font-mono text-xs mt-1" style={{ color: "#00d4ff" }}>
                      Cost: {task.ethCost} ETH {usdCost && <span className="text-[#8892a4]">(~${usdCost})</span>}
                    </p>
                  )}
                </div>
              </div>
              {task.field && !done && (
                <input className="input-field mt-3" placeholder={task.fieldPlaceholder}
                  value={fields[task.id] || ""} onChange={e => setFields(prev => ({ ...prev, [task.id]: e.target.value }))} />
              )}
              {!done && (
                <button onClick={() => handleTask(task.id)} disabled={loading || !isCorrectNetwork}
                  className="btn-primary w-full mt-3 text-sm">
                  {loading ? <><span className="spinner spinner-sm" /> Processing...</> : "Complete " + task.name}
                </button>
              )}
              {done && <div className="mt-3 text-center font-mono text-sm text-[#00c853]">✓ Completed</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
""",

"frontend/src/components/MiniGame.jsx": """import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { getGameContract, getReadProvider, shortAddr, formatEth, mmss, formatNumber } from "../utils/contracts.js";

export default function MiniGame({ wallet, quests }) {
  const { address, signer, isCorrectNetwork } = wallet;
  const { completeGame } = quests;
  const [round,       setRound]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [joining,     setJoining]     = useState(false);
  const [ending,      setEnding]      = useState(false);
  const [recentRounds,setRecentRounds]= useState([]);
  const [timeLeft,    setTimeLeft]    = useState(0);

  const fetchRound = useCallback(async () => {
    try {
      const provider = getReadProvider();
      const game     = getGameContract(provider);
      const [players, timeRem, roundNum, prizePool, hasJoined, startTime, isEnded, recent] = await Promise.all([
        game.getCurrentPlayers(), game.getRoundTimeRemaining(), game.getRoundNumber(),
        game.getCurrentPrizePool(), address ? game.hasJoinedCurrentRound(address) : Promise.resolve(false),
        game.getCurrentRoundStartTime(), game.isRoundEnded(),
        game.getRecentRounds(5),
      ]);
      setRound({ players: [...players], timeRemaining: Number(timeRem), roundNumber: Number(roundNum), prizePool, hasJoined, startTime: Number(startTime), isEnded });
      setTimeLeft(Number(timeRem));
      setRecentRounds([...recent].reverse());
    } catch { setRound(null); } finally { setLoading(false); }
  }, [address]);

  useEffect(() => { fetchRound(); const i = setInterval(fetchRound, 10000); return () => clearInterval(i); }, [fetchRound]);
  useEffect(() => {
    if (timeLeft <= 0) return;
    const i = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(i);
  }, [timeLeft]);

  const handleJoin = async () => {
    if (!signer || !address) { toast.error("Connect wallet first."); return; }
    if (!isCorrectNetwork) { toast.error("Switch to Base Mainnet."); return; }
    setJoining(true);
    const toastId = toast.loading("Joining game...");
    try {
      const game = getGameContract(signer);
      const tx   = await game.joinGame({ value: ethers.parseEther("0.0001") });
      toast.loading("Confirming...", { id: toastId });
      await tx.wait();
      toast.success("🎲 Joined! Good luck!", { id: toastId, duration: 4000 });
      await completeGame();
      await fetchRound();
    } catch (err) {
      const msg = err?.reason || err?.message || "";
      const friendly = msg.includes("already joined") ? "Already joined this round." : msg.includes("round time expired") ? "Round has expired." : msg.includes("user rejected") || err.code === 4001 ? "Transaction rejected." : "Failed to join. Try again.";
      toast.error(friendly, { id: toastId });
    } finally { setJoining(false); }
  };

  const handleEndRound = async () => {
    if (!signer) { toast.error("Connect wallet first."); return; }
    setEnding(true);
    const toastId = toast.loading("Ending round...");
    try {
      const game = getGameContract(signer);
      const tx   = await game.endRound();
      await tx.wait();
      toast.success("🏆 Round ended!", { id: toastId });
      await fetchRound();
    } catch (err) {
      toast.error(err?.reason || "Failed to end round.", { id: toastId });
    } finally { setEnding(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center"><div className="spinner spinner-lg mx-auto mb-4" /><p className="font-mono text-[#8892a4]">Loading game...</p></div>
    </div>
  );

  if (!round) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">🎲</div>
      <h2 className="font-display font-bold text-2xl text-white mb-2">Game Not Available</h2>
      <p className="font-mono text-[#8892a4]">Contract not deployed yet.</p>
    </div>
  );

  const prizeEth  = formatEth(round.prizePool);
  const winnerCut = (parseFloat(prizeEth) * 0.8).toFixed(4);
  const expired   = timeLeft === 0;

  return (
    <div className="max-w-2xl mx-auto animate-in">
      <div className="text-center mb-6">
        <h2 className="section-title">🎲 Mini-Game</h2>
        <p className="font-mono text-sm text-[#8892a4] mt-1">Join the prize pool. One random winner takes 80%.</p>
      </div>

      <div className="glass-card p-8 mb-4 text-center" style={{ border: "1px solid rgba(240,180,41,0.2)", background: "linear-gradient(135deg, #12141a, #1a1d27)" }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-4"
          style={{ background: "rgba(0,82,255,0.1)", border: "1px solid rgba(0,82,255,0.3)", color: "#00d4ff" }}>
          Round #{round.roundNumber}
        </div>
        <div className="timer-digit text-6xl sm:text-7xl font-bold mb-2"
          style={{ color: timeLeft < 60 ? "#ff3b3b" : timeLeft < 120 ? "#f0b429" : "#00d4ff" }}>
          {mmss(timeLeft)}
        </div>
        <p className="font-mono text-sm text-[#8892a4] mb-6">{expired ? "Round over — someone end it!" : "Time remaining"}</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div><p className="font-[Orbitron] text-xl font-bold text-white">{round.players.length}</p><p className="font-mono text-xs text-[#8892a4]">Players</p></div>
          <div><p className="font-[Orbitron] text-xl font-bold text-[#f0b429]">{prizeEth} ETH</p><p className="font-mono text-xs text-[#8892a4]">Prize Pool</p></div>
          <div><p className="font-[Orbitron] text-xl font-bold text-[#00c853]">{winnerCut} ETH</p><p className="font-mono text-xs text-[#8892a4]">Winner Gets</p></div>
        </div>

        {!expired && !round.hasJoined && address && (
          <button onClick={handleJoin} disabled={joining} className="btn-gold w-full text-base py-4">
            {joining ? <><span className="spinner spinner-sm" /> Joining...</> : "🎲 Join for 0.0001 ETH"}
          </button>
        )}
        {!expired && round.hasJoined && (
          <div className="py-4 font-mono text-[#00c853] text-sm">✓ You're in! Waiting for the round to end...</div>
        )}
        {expired && (
          <button onClick={handleEndRound} disabled={ending} className="btn-gold w-full text-base py-4">
            {ending ? <><span className="spinner spinner-sm" /> Ending...</> : "🏁 End Round & Pick Winner"}
          </button>
        )}
        {!address && (
          <p className="font-mono text-sm text-[#8892a4]">Connect wallet to play.</p>
        )}
      </div>

      {round.players.length > 0 && (
        <div className="glass-card p-5 mb-4">
          <h3 className="font-display font-semibold text-white mb-3">Players This Round</h3>
          <div className="flex flex-wrap gap-2">
            {round.players.map(p => (
              <span key={p} className={"badge " + (p.toLowerCase() === address?.toLowerCase() ? "badge-blue" : "badge-gray")}>
                {shortAddr(p)} {p.toLowerCase() === address?.toLowerCase() ? "· you" : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      {recentRounds.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-white mb-3">Recent Results</h3>
          <div className="space-y-2">
            {recentRounds.map(r => (
              <div key={Number(r.roundNumber)} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="font-mono text-xs text-[#8892a4] w-16">#{Number(r.roundNumber)}</span>
                <span className="flex-1 font-mono text-sm text-white truncate">{shortAddr(r.winner)}</span>
                <span className="badge badge-gold">{formatEth(r.prize)} ETH</span>
                <span className="font-mono text-xs text-[#8892a4]">{Number(r.playerCount)} players</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
""",

"frontend/src/components/Leaderboard.jsx": """import React from "react";
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
""",

"frontend/src/components/WalletAnalyzer.jsx": """import React, { useState } from "react";
import { getWalletAnalysis } from "../utils/basescan.js";
import { ethers } from "ethers";

export default function WalletAnalyzer({ wallet }) {
  const [input,    setInput]    = useState(wallet.address || "");
  const [analysis, setAnalysis] = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const analyze = async () => {
    const addr = input.trim();
    if (!ethers.isAddress(addr)) { setError("Invalid Ethereum address."); return; }
    setLoading(true); setError(null); setAnalysis(null);
    try { setAnalysis(await getWalletAnalysis(addr)); }
    catch (err) { setError(err.message || "Failed to analyze wallet."); }
    finally { setLoading(false); }
  };

  const scoreColor = (s) => s >= 700 ? "#00c853" : s >= 400 ? "#f0b429" : "#ff3b3b";
  const scoreLabel = (s) => s >= 700 ? "OG Farmer" : s >= 400 ? "Active User" : "Newbie";

  return (
    <div className="max-w-3xl mx-auto animate-in">
      <div className="mb-6">
        <h2 className="section-title">🔍 Wallet Analyzer</h2>
        <p className="font-mono text-sm text-[#8892a4] mt-1">Analyze any Base wallet's on-chain activity and compute a Base Score.</p>
      </div>

      <div className="glass-card p-6 mb-6">
        <label className="font-mono text-sm text-[#8892a4] block mb-2">Wallet Address</label>
        <div className="flex gap-3">
          <input className="input-field flex-1" placeholder="0x..." value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && analyze()} />
          <button onClick={analyze} disabled={loading} className="btn-primary px-6">
            {loading ? <span className="spinner spinner-sm" /> : "Analyze"}
          </button>
        </div>
        {wallet.address && wallet.address !== input && (
          <button onClick={() => setInput(wallet.address)} className="font-mono text-xs text-[#0052ff] hover:text-[#00d4ff] mt-2 transition-colors">
            Use connected wallet
          </button>
        )}
        {error && <p className="font-mono text-sm text-[#ff3b3b] mt-2">{error}</p>}
      </div>

      {loading && (
        <div className="text-center py-12"><div className="spinner spinner-lg mx-auto mb-4" /><p className="font-mono text-[#8892a4]">Fetching on-chain data...</p></div>
      )}

      {analysis && !loading && (
        <div className="space-y-4 animate-in">
          <div className="glass-card p-6 text-center" style={{ border: "1px solid " + scoreColor(analysis.baseScore) + "40" }}>
            <p className="font-mono text-sm text-[#8892a4] mb-1">Base Score</p>
            <p className="font-[Orbitron] text-6xl font-black mb-1" style={{ color: scoreColor(analysis.baseScore) }}>{analysis.baseScore}</p>
            <p className="font-display font-bold text-lg text-white">{scoreLabel(analysis.baseScore)}</p>
            <p className="font-mono text-xs text-[#8892a4] mt-1">out of 1000</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Txs",    value: analysis.totalTxs.toLocaleString() },
              { label: "Wallet Age",   value: analysis.walletAgeDays + "d" },
              { label: "Contracts",    value: analysis.uniqueContracts },
              { label: "Failed Txs",   value: analysis.failedCount },
            ].map(s => (
              <div key={s.label} className="glass-card p-4 text-center">
                <p className="font-[Orbitron] text-xl font-bold text-white">{s.value}</p>
                <p className="font-mono text-xs text-[#8892a4]">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display font-semibold text-white mb-3">Activity Heatmap (90 days)</h3>
            <div className="flex flex-wrap gap-1">
              {analysis.heatmap.cells.map((count, i) => (
                <div key={i} title={count + " txs"} className="w-3 h-3 rounded-sm transition-all"
                  style={{ background: count === 0 ? "rgba(255,255,255,0.05)" : "rgba(0,82,255," + Math.min(0.9, 0.2 + (count / analysis.heatmap.maxCount) * 0.7) + ")" }} />
              ))}
            </div>
            <p className="font-mono text-xs text-[#8892a4] mt-2">Longest streak: {analysis.heatmap.longestStreak} days</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-white mb-3">Volume</h3>
              <div className="space-y-2">
                <div className="flex justify-between"><span className="font-mono text-sm text-[#8892a4]">Sent</span><span className="font-mono text-sm text-white">{analysis.totalSentEth} ETH</span></div>
                <div className="flex justify-between"><span className="font-mono text-sm text-[#8892a4]">Received</span><span className="font-mono text-sm text-white">{analysis.totalRecvEth} ETH</span></div>
                <div className="flex justify-between"><span className="font-mono text-sm text-[#8892a4]">Avg Gas</span><span className="font-mono text-sm text-white">{analysis.avgGasUsed.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="glass-card p-5">
              <h3 className="font-display font-semibold text-white mb-3">Top Contracts</h3>
              {analysis.topContracts.length === 0 ? <p className="font-mono text-sm text-[#8892a4]">No contract interactions.</p> : (
                <div className="space-y-1">
                  {analysis.topContracts.map(c => (
                    <div key={c.contract} className="flex justify-between items-center">
                      <a href={"https://basescan.org/address/" + c.contract} target="_blank" rel="noopener noreferrer"
                        className="font-mono text-xs text-[#00d4ff] hover:text-white truncate max-w-[160px] transition-colors">
                        {c.contract.slice(0,6)}...{c.contract.slice(-4)}
                      </a>
                      <span className="badge badge-gray">{c.count} txs</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="text-center">
            <a href={"https://basescan.org/address/" + analysis.address} target="_blank" rel="noopener noreferrer" className="btn-ghost text-sm">
              View on Basescan ↗
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
""",

"DEPLOYMENT.md": """# BaseQuest Deployment Guide

## Prerequisites
- Node.js 18+
- ETH on Base Mainnet (for deployment gas)
- Basescan API key: https://basescan.org/myapikey
- CDP RPC URL: https://portal.cdp.coinbase.com

## Step 1 — Install Dependencies
```bash
npm install
cd frontend && npm install && cd ..
```

## Step 2 — Configure Environment
```bash
cp .env.example .env
# Edit .env with your values
```

## Step 3 — Deploy Contracts
```bash
npx hardhat run scripts/deploy.js --network base
```
Copy the printed addresses into your .env as VITE_* vars.

## Step 4 — Verify Contracts
```bash
npx hardhat run scripts/verify.js --network base
```

## Step 5 — Deploy Frontend
```bash
cd frontend && npm run build
```
Deploy the `frontend/dist` folder to Vercel.
Set all VITE_ environment variables in Vercel dashboard.

## Vercel Env Vars Required
- VITE_CORE_CONTRACT
- VITE_GAME_CONTRACT
- VITE_BRIDGE_CONTRACT
- VITE_CDP_RPC_URL
- VITE_BASESCAN_API_KEY
- VITE_WALLETCONNECT_PROJECT_ID
""",
}

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True) if os.path.dirname(path) else None
    with open(path, "w") as f:
        f.write(content)
    print(f"Created: {path}")

print("Batch 10 done! ALL FILES COMPLETE!")
