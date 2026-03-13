import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { getCoreContract, getReadProvider, shortAddr, timeAgo } from "../utils/contracts.js";

const TASK_META = {
  GM_BASE:          { emoji: "☀️",  label: "GM Base",          xp: 50  },
  DEPLOY_CONTRACT:  { emoji: "🚀",  label: "Deploy Contract",   xp: 100 },
  SWAP_BASE:        { emoji: "🔄",  label: "Swap on Base",      xp: 75  },
  BRIDGE_BASE:      { emoji: "🌉",  label: "Bridge to Base",    xp: 100 },
  MINI_GAME:        { emoji: "🐉",  label: "Boss Raid",         xp: 75  },
  SET_PROFILE:      { emoji: "🪪",  label: "Set Profile",       xp: 50  },
  SWAP_AERODROME:   { emoji: "✈️",  label: "Swap Aerodrome",    xp: 50  },
  SWAP_UNISWAP:     { emoji: "🦄",  label: "Swap Uniswap",      xp: 50  },
  SWAP_JUMPER:      { emoji: "🦗",  label: "Swap Jumper",       xp: 50  },
  SWAP_RELAY:       { emoji: "⚡",  label: "Swap Relay",        xp: 50  },
  BRIDGE_JUMPER:    { emoji: "🦗",  label: "Bridge Jumper",     xp: 50  },
  BRIDGE_RELAY:     { emoji: "⚡",  label: "Bridge Relay",      xp: 50  },
};

export default function ActivityFeed({ limit = 10 }) {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchEvents() {
      try {
        const provider = getReadProvider();
        const core     = getCoreContract(provider);
        const filter   = core.filters.TaskCompleted();
        const block    = await provider.getBlockNumber();
        const fromBlock = Math.max(0, block - 5000);
        const logs = await core.queryFilter(filter, fromBlock, block);
        if (cancelled) return;
        const parsed = logs.slice(-50).reverse().map((log, i) => ({
          id: log.transactionHash + i,
          address: log.args.user,
          taskType: log.args.taskType,
          xpEarned: Number(log.args.xpEarned),
          timestamp: Number(log.args.timestamp),
          txHash: log.transactionHash,
          meta: TASK_META[log.args.taskType] || { emoji: "⭐", label: log.args.taskType, xp: Number(log.args.xpEarned) },
        }));
        setEvents(parsed.slice(0, limit));
      } catch (err) { if (!cancelled) setError(err.message); }
      finally { if (!cancelled) setLoading(false); }
    }
    fetchEvents();
    return () => { cancelled = true; };
  }, [limit]);

  if (loading) return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-display font-bold text-lg text-white">Live Activity</h3>
        <div className="status-dot-green" />
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)" }}>
            <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 bg-white/5 rounded animate-pulse w-32" />
              <div className="h-2 bg-white/5 rounded animate-pulse w-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (error) return (
    <div className="glass-card p-6">
      <h3 className="font-display font-bold text-lg text-white mb-2">Live Activity</h3>
      <p className="font-mono text-sm text-[#8892a4]">Contract not deployed yet — activity will appear here once live.</p>
    </div>
  );

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display font-bold text-lg text-white">Live Activity</h3>
          <div className="status-dot-green" />
        </div>
        <span className="badge badge-blue">{events.length} recent</span>
      </div>
      {events.length === 0 ? (
        <p className="font-mono text-sm text-[#8892a4] text-center py-4">No recent activity. Be the first!</p>
      ) : (
        <div className="space-y-2 stagger">
          {events.map(ev => (
            <a key={ev.id} href={"https://basescan.org/tx/" + ev.txHash} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group animate-in"
              style={{ background: "rgba(255,255,255,0.02)" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,82,255,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: "rgba(0,82,255,0.1)", border: "1px solid rgba(0,82,255,0.2)" }}>
                {ev.meta.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm text-white truncate">
                  <span style={{ color: "#00d4ff" }}>{shortAddr(ev.address)}</span>
                  <span className="text-[#8892a4] mx-1">·</span>
                  {ev.meta.label}
                </p>
                <p className="font-mono text-xs text-[#8892a4]">{timeAgo(ev.timestamp)}</p>
              </div>
              <span className="badge badge-green flex-shrink-0">+{ev.meta.xp} XP</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
