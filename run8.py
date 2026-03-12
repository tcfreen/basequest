import os

files = {
"frontend/src/hooks/useQuests.js": """import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { getCoreContract, getReadProvider, getLevelInfo, getEthPrice } from "../utils/contracts.js";

export function useQuests(address, signer) {
  const [profile,     setProfile]     = useState(null);
  const [dailyTasks,  setDailyTasks]  = useState(null);
  const [levelInfo,   setLevelInfo]   = useState(null);
  const [ethPrice,    setEthPrice]    = useState(2500);
  const [taskLoading, setTaskLoading] = useState({});

  const loadUserData = useCallback(async () => {
    if (!address) { setProfile(null); setDailyTasks(null); setLevelInfo(null); return; }
    try {
      const provider = getReadProvider();
      const core     = getCoreContract(provider);
      const [profileRaw, dailyRaw, price] = await Promise.all([core.getUserProfile(address), core.getDailyTasks(address), getEthPrice()]);
      setEthPrice(price);
      const p = { totalXP: Number(profileRaw.totalXP), username: profileRaw.username, usernameSet: profileRaw.usernameSet, tasksCompleted: Number(profileRaw.tasksCompleted), joinedAt: Number(profileRaw.joinedAt), streakCount: Number(profileRaw.streakCount), referralCount: Number(profileRaw.referralCount), referredBy: profileRaw.referredBy };
      setProfile(p); setLevelInfo(getLevelInfo(p.totalXP));
      setDailyTasks({ gmDone: dailyRaw.gmDone, deployDone: dailyRaw.deployDone, swapDone: dailyRaw.swapDone, bridgeDone: dailyRaw.bridgeDone, gameDone: dailyRaw.gameDone, referralDone: dailyRaw.referralDone, profileDone: dailyRaw.profileDone });
    } catch {
      setProfile({ totalXP: 0, username: "", usernameSet: false, tasksCompleted: 0, joinedAt: 0, streakCount: 0, referralCount: 0, referredBy: ethers.ZeroAddress });
      setLevelInfo(getLevelInfo(0));
      setDailyTasks({ gmDone: false, deployDone: false, swapDone: false, bridgeDone: false, gameDone: false, referralDone: false, profileDone: false });
    }
  }, [address]);

  useEffect(() => { loadUserData(); const i = setInterval(loadUserData, 30000); return () => clearInterval(i); }, [loadUserData]);

  const executeTask = useCallback(async (taskId, txFn, xpAmount, taskName) => {
    if (!signer || !address) { toast.error("Connect your wallet first."); return false; }
    if (taskLoading[taskId]) return false;
    setTaskLoading(prev => ({ ...prev, [taskId]: true }));
    const toastId = toast.loading("Completing " + taskName + "...");
    try {
      const tx      = await txFn();
      toast.loading("Transaction submitted...", { id: toastId });
      const receipt = await tx.wait();
      if (receipt.status === 0) throw new Error("Transaction reverted.");
      toast.success("✅ " + taskName + " complete! +" + xpAmount + " XP", { id: toastId, duration: 5000 });
      await loadUserData();
      return true;
    } catch (err) {
      const msg = err?.reason || err?.message || "";
      const friendly = msg.includes("already done today") ? "Already completed today!" : msg.includes("already set") ? "Profile already set!" : msg.includes("already referred") ? "Address already referred." : msg.includes("cannot refer yourself") ? "Cannot refer yourself!" : msg.includes("incorrect payment") ? "Incorrect ETH amount." : msg.includes("insufficient funds") ? "Insufficient ETH balance." : msg.includes("user rejected") || err.code === 4001 ? "Transaction rejected." : msg.slice(0, 100) || "Transaction failed.";
      toast.error(friendly, { id: toastId, duration: 6000 });
      return false;
    } finally { setTaskLoading(prev => ({ ...prev, [taskId]: false })); }
  }, [signer, address, taskLoading, loadUserData]);

  const completeGM       = useCallback(async ()    => executeTask("gm",       async () => getCoreContract(signer).completeGMTask({ value: ethers.parseEther("0.0001") }), 50,  "GM Base"), [signer, executeTask]);
  const completeDeploy   = useCallback(async (c)   => { if (!ethers.isAddress(c)) { toast.error("Invalid contract address."); return false; } return executeTask("deploy",   async () => getCoreContract(signer).completeDeployTask(c, { value: ethers.parseEther("0.0002") }), 100, "Deploy Contract"); }, [signer, executeTask]);
  const completeSwap     = useCallback(async ()    => executeTask("swap",     async () => getCoreContract(signer).completeSwapTask({ value: ethers.parseEther("0.0001") }), 75,  "Swap on Base"), [signer, executeTask]);
  const completeBridge   = useCallback(async ()    => executeTask("bridge",   async () => getCoreContract(signer).completeBridgeTask({ value: ethers.parseEther("0.0002") }), 100, "Bridge to Base"), [signer, executeTask]);
  const completeGame     = useCallback(async ()    => executeTask("game",     async () => getCoreContract(signer).completeGameTask({ value: ethers.parseEther("0.0001") }), 75,  "Play Mini-Game"), [signer, executeTask]);
  const completeReferral = useCallback(async (r)   => { if (!ethers.isAddress(r)) { toast.error("Invalid referral address."); return false; } if (r.toLowerCase() === address?.toLowerCase()) { toast.error("Cannot refer yourself."); return false; } return executeTask("referral", async () => getCoreContract(signer).completeReferralTask(r, { value: ethers.parseEther("0.0001") }), 150, "Refer a Friend"); }, [signer, address, executeTask]);
  const completeProfile  = useCallback(async (u)   => { if (!u?.trim()) { toast.error("Username cannot be empty."); return false; } if (u.trim().length > 32) { toast.error("Username max 32 characters."); return false; } return executeTask("profile", async () => getCoreContract(signer).completeProfileTask(u.trim(), { value: ethers.parseEther("0.0001") }), 50, "Set Profile"); }, [signer, executeTask]);

  return { profile, dailyTasks, levelInfo, ethPrice, taskLoading, loadUserData, completeGM, completeDeploy, completeSwap, completeBridge, completeGame, completeReferral, completeProfile };
}
""",

"frontend/src/components/Navbar.jsx": """import React, { useState } from "react";
import { shortAddr } from "../utils/contracts.js";

const WALLETS = [
  { id: "metamask", label: "MetaMask",       icon: "🦊" },
  { id: "coinbase", label: "Coinbase Wallet", icon: "🔵" },
  { id: "injected", label: "Rabby / Other",   icon: "🔑" },
];

const TABS = [
  { id: "dashboard",   label: "Dashboard" },
  { id: "quests",      label: "Quests" },
  { id: "game",        label: "Mini-Game", dot: true },
  { id: "leaderboard", label: "Leaderboard" },
  { id: "analyzer",    label: "Wallet Analyzer" },
];

export default function Navbar({ address, isConnecting, isCorrectNetwork, profile, levelInfo, onConnect, onDisconnect, onSwitchNetwork, activeTab, setActiveTab }) {
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showUserMenu,   setShowUserMenu]   = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5" style={{ background: "rgba(10,11,15,0.92)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab("dashboard")}>
            <div className="w-8 h-8 rounded-lg bg-[#0052ff]/20 border border-[#0052ff]/30 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="BaseQuest" className="w-full h-full object-cover" onError={e => { e.target.style.display="none"; e.target.parentNode.innerHTML='<span style="color:#00d4ff;font-weight:bold;font-size:11px;font-family:Syne,sans-serif">BQ</span>'; }} />
            </div>
            <span className="font-display font-bold text-white text-lg tracking-tight hidden sm:block">Base<span className="text-[#00d4ff]">Quest</span></span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={"px-4 py-2 rounded-lg text-sm font-mono transition-all duration-200 relative " + (activeTab === tab.id ? "text-white tab-active" : "text-[#8892a4] hover:text-white hover:bg-white/5")}>
                {tab.label}
                {tab.dot && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-[#00c853] animate-pulse" />}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {address && profile && levelInfo && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#12141a] border border-white/10">
                <span className="text-lg">{levelInfo.current.emoji}</span>
                <div className="flex flex-col leading-none">
                  <span className="font-[Orbitron] text-[#00d4ff] text-xs font-bold">{profile.totalXP.toLocaleString()} XP</span>
                  <span className="font-mono text-[#8892a4] text-[10px]">Lvl {levelInfo.current.level} · {levelInfo.current.name}</span>
                </div>
              </div>
            )}
            {address && !isCorrectNetwork && (
              <button onClick={onSwitchNetwork} className="badge badge-red animate-pulse cursor-pointer">⚠ Wrong Network</button>
            )}
            {!address ? (
              <div className="relative">
                <button onClick={() => setShowWalletMenu(v => !v)} disabled={isConnecting} className="btn-primary text-sm">
                  {isConnecting ? <><span className="spinner spinner-sm" /> Connecting...</> : "Connect Wallet"}
                </button>
                {showWalletMenu && (
                  <div className="absolute right-0 top-full mt-2 w-52 glass-card border border-white/10 rounded-xl p-2 animate-in">
                    {WALLETS.map(w => (
                      <button key={w.id} onClick={() => { onConnect(w.id); setShowWalletMenu(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-left">
                        <span className="text-xl">{w.icon}</span>
                        <span className="font-mono text-sm text-white">{w.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative">
                <button onClick={() => setShowUserMenu(v => !v)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#12141a] border border-[#0052ff]/30 hover:border-[#0052ff]/60 transition-all">
                  <div className="w-2 h-2 rounded-full bg-[#00c853] animate-pulse" />
                  <span className="font-mono text-sm text-white">{shortAddr(address)}</span>
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 glass-card border border-white/10 rounded-xl p-2 animate-in">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="font-mono text-xs text-[#8892a4]">Connected</p>
                      <p className="font-mono text-sm text-white truncate">{shortAddr(address)}</p>
                    </div>
                    <a href={"https://basescan.org/address/" + address} target="_blank" rel="noopener noreferrer" onClick={() => setShowUserMenu(false)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left">
                      <span>🔍</span><span className="font-mono text-sm text-[#8892a4]">View on Basescan</span>
                    </a>
                    <button onClick={() => { onDisconnect(); setShowUserMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[#ff3b3b]/10 transition-colors text-left">
                      <span>🚪</span><span className="font-mono text-sm text-[#ff3b3b]">Disconnect</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={"flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono transition-all " + (activeTab === tab.id ? "bg-[#0052ff]/20 text-[#00d4ff] border border-[#0052ff]/30" : "text-[#8892a4] hover:text-white")}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {(showWalletMenu || showUserMenu) && <div className="fixed inset-0 z-[-1]" onClick={() => { setShowWalletMenu(false); setShowUserMenu(false); }} />}
    </nav>
  );
}
""",
}

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"Created: {path}")

print("Batch 8 done!")
