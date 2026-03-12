import React, { useState } from "react";
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
