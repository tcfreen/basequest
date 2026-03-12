import React, { useState } from "react";
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
