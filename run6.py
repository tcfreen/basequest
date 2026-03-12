import os

files = {
"frontend/src/index.css": """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: #0a0b0f;
    color: #e2e8f0;
    font-family: "JetBrains Mono", monospace;
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    overflow-x: hidden;
  }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: #12141a; }
  ::-webkit-scrollbar-thumb { background: rgba(0,82,255,0.4); border-radius: 3px; }
  ::selection { background: rgba(0,82,255,0.3); color: white; }
}

@layer components {
  .glass-card {
    @apply bg-surface rounded-2xl border border-white/5 backdrop-blur-sm;
    box-shadow: 0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04);
  }
  .glass-card-hover {
    @apply glass-card transition-all duration-300;
  }
  .glass-card-hover:hover {
    border-color: rgba(0,82,255,0.3);
    box-shadow: 0 4px 24px rgba(0,0,0,0.4), 0 0 20px rgba(0,82,255,0.15);
    transform: translateY(-1px);
  }
  .btn-primary {
    @apply inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-display font-semibold text-white text-sm transition-all duration-200 select-none cursor-pointer;
    background: linear-gradient(135deg, #0052ff, #0066ff);
    box-shadow: 0 0 20px rgba(0,82,255,0.3);
  }
  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #0066ff, #0080ff);
    box-shadow: 0 0 30px rgba(0,82,255,0.5);
    transform: translateY(-1px);
  }
  .btn-primary:disabled { @apply opacity-40 cursor-not-allowed; }
  .btn-gold {
    @apply inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-display font-semibold text-bg text-sm transition-all duration-200 select-none cursor-pointer;
    background: linear-gradient(135deg, #f0b429, #d4940a);
    box-shadow: 0 0 20px rgba(240,180,41,0.3);
  }
  .btn-gold:hover:not(:disabled) { box-shadow: 0 0 30px rgba(240,180,41,0.5); transform: translateY(-1px); }
  .btn-gold:disabled { @apply opacity-40 cursor-not-allowed; }
  .btn-ghost {
    @apply inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-mono text-sm text-[#8892a4] border border-white/10 transition-all duration-200 cursor-pointer;
  }
  .btn-ghost:hover { @apply text-white border-[#0052ff]/40; }
  .badge { @apply inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium; }
  .badge-blue  { @apply badge bg-[#0052ff]/20 text-[#00d4ff] border border-[#0052ff]/30; }
  .badge-gold  { @apply badge bg-[#f0b429]/20 text-[#f0b429] border border-[#f0b429]/30; }
  .badge-green { @apply badge bg-[#00c853]/20 text-[#00c853] border border-[#00c853]/30; }
  .badge-red   { @apply badge bg-[#ff3b3b]/20 text-[#ff3b3b] border border-[#ff3b3b]/30; }
  .badge-gray  { @apply badge bg-white/10 text-[#8892a4] border border-white/10; }
  .xp-bar-track { @apply relative h-2 w-full rounded-full overflow-hidden; background: rgba(255,255,255,0.05); }
  .xp-bar-fill  { @apply h-full rounded-full transition-all duration-700; background: linear-gradient(90deg, #0052ff, #00d4ff); box-shadow: 0 0 8px rgba(0,212,255,0.5); }
  .section-title { @apply font-display font-bold text-2xl tracking-tight text-white; }
  .input-field {
    @apply w-full bg-[#1a1d27] border border-white/10 rounded-xl px-4 py-3 text-sm font-mono text-white placeholder-[#8892a4] outline-none transition-all duration-200;
  }
  .input-field:focus { border-color: rgba(0,82,255,0.5); box-shadow: 0 0 0 2px rgba(0,82,255,0.15); }
  .spinner { @apply inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin; }
  .spinner-sm { @apply w-4 h-4; }
  .spinner-lg { @apply w-8 h-8; }
  .status-dot { @apply inline-block w-2 h-2 rounded-full; }
  .status-dot-green { @apply status-dot bg-[#00c853] animate-pulse; }
  .status-dot-blue  { @apply status-dot bg-[#0052ff] animate-pulse; }
}

.grid-bg {
  background-image: linear-gradient(rgba(0,82,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,82,255,0.04) 1px, transparent 1px);
  background-size: 40px 40px;
}
.tab-active { position: relative; }
.tab-active::after { content: ""; position: absolute; bottom: -2px; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, #0052ff, #00d4ff); border-radius: 1px; box-shadow: 0 0 8px rgba(0,212,255,0.5); }
.podium-1 { background: linear-gradient(135deg, rgba(240,180,41,0.15), rgba(240,180,41,0.05)); border-color: rgba(240,180,41,0.4) !important; }
.podium-2 { background: linear-gradient(135deg, rgba(192,192,192,0.1), rgba(192,192,192,0.04)); border-color: rgba(192,192,192,0.3) !important; }
.podium-3 { background: linear-gradient(135deg, rgba(205,127,50,0.12), rgba(205,127,50,0.04)); border-color: rgba(205,127,50,0.3) !important; }
.my-row { background: linear-gradient(90deg, rgba(0,82,255,0.1), rgba(0,212,255,0.05)) !important; border-left: 3px solid #0052ff !important; }
.timer-digit { font-family: "Orbitron", monospace; font-weight: 700; font-variant-numeric: tabular-nums; }
.animate-in { animation: slideUp 0.4s ease-out both; }
.stagger > *:nth-child(1) { animation-delay: 0.05s; }
.stagger > *:nth-child(2) { animation-delay: 0.10s; }
.stagger > *:nth-child(3) { animation-delay: 0.15s; }
.stagger > *:nth-child(4) { animation-delay: 0.20s; }
.stagger > *:nth-child(5) { animation-delay: 0.25s; }
.stagger > *:nth-child(6) { animation-delay: 0.30s; }
.stagger > *:nth-child(7) { animation-delay: 0.35s; }
.stagger > *:nth-child(8) { animation-delay: 0.40s; }
@keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
""",

"frontend/src/utils/basescan.js": """const API_KEY = import.meta.env.VITE_BASESCAN_API_KEY || "";
const BASE_URL = "https://api.basescan.org/api";

async function basescanFetch(params) {
  const url = new URL(BASE_URL);
  Object.entries({ ...params, apikey: API_KEY }).forEach(([k, v]) => url.searchParams.set(k, String(v)));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Basescan HTTP error: " + res.status);
  const data = await res.json();
  if (data.status === "0" && data.message !== "No transactions found") throw new Error(data.result || data.message || "Basescan API error");
  return data.result;
}

export async function fetchTransactions(address) {
  try {
    const result = await basescanFetch({ module: "account", action: "txlist", address, startblock: 0, endblock: 99999999, sort: "asc", offset: 10000, page: 1 });
    return Array.isArray(result) ? result : [];
  } catch (err) {
    if (err.message?.includes("No transactions")) return [];
    throw err;
  }
}

export function analyzeTransactions(address, txs) {
  if (!txs || txs.length === 0) return emptyAnalytics(address);
  const addr   = address.toLowerCase();
  const now    = Math.floor(Date.now() / 1000);
  const sorted = [...txs].sort((a, b) => Number(a.timeStamp) - Number(b.timeStamp));
  const first  = sorted[0];
  const last   = sorted[sorted.length - 1];
  const walletAgeDays = Math.floor((now - Number(first.timeStamp)) / 86400);
  const sentTxs     = txs.filter(tx => tx.from.toLowerCase() === addr && tx.isError === "0");
  const receivedTxs = txs.filter(tx => tx.to?.toLowerCase() === addr  && tx.isError === "0");
  const totalSentWei = sentTxs.reduce((acc, tx) => acc + BigInt(tx.value || "0"), 0n);
  const totalRecvWei = receivedTxs.reduce((acc, tx) => acc + BigInt(tx.value || "0"), 0n);
  const nonZeroTxs = txs.filter(tx => BigInt(tx.value || "0") > 0n && tx.isError === "0");
  const largestTx  = nonZeroTxs.length ? nonZeroTxs.reduce((a, b) => BigInt(b.value) > BigInt(a.value) ? b : a) : null;
  const smallestTx = nonZeroTxs.length ? nonZeroTxs.reduce((a, b) => BigInt(b.value) < BigInt(a.value) ? b : a) : null;
  const successTxs   = txs.filter(tx => tx.isError === "0");
  const totalGasUsed = successTxs.reduce((acc, tx) => acc + Number(tx.gasUsed || 0), 0);
  const avgGasUsed   = successTxs.length ? Math.round(totalGasUsed / successTxs.length) : 0;
  const failedCount  = txs.filter(tx => tx.isError === "1").length;
  const contractCounts = {};
  txs.forEach(tx => { if (tx.to && tx.to !== "" && tx.to.toLowerCase() !== addr) { const to = tx.to.toLowerCase(); contractCounts[to] = (contractCounts[to] || 0) + 1; } });
  const uniqueContracts = Object.keys(contractCounts).length;
  const topContracts = Object.entries(contractCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([contract, count]) => ({ contract, count }));
  const heatmap   = buildHeatmap(txs, 90);
  const baseScore = computeBaseScore({ totalTxs: txs.length, walletAgeDays, uniqueContracts, totalSentEth: Number(totalSentWei) / 1e18, totalRecvEth: Number(totalRecvWei) / 1e18, failedCount, streakDays: heatmap.longestStreak });
  return { address, walletAgeDays, totalTxs: txs.length, successTxs: successTxs.length, failedCount, firstTx: first ? formatTx(first) : null, lastTx: last ? formatTx(last) : null, largestTx: largestTx ? formatTx(largestTx) : null, smallestTx: smallestTx ? formatTx(smallestTx) : null, totalSentEth: (Number(totalSentWei) / 1e18).toFixed(6), totalRecvEth: (Number(totalRecvWei) / 1e18).toFixed(6), avgGasUsed, uniqueContracts, topContracts, heatmap, baseScore };
}

function formatTx(tx) {
  return { hash: tx.hash, timestamp: Number(tx.timeStamp), date: new Date(Number(tx.timeStamp) * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }), valueEth: (Number(BigInt(tx.value || "0")) / 1e18).toFixed(6), from: tx.from, to: tx.to, gasUsed: tx.gasUsed, isError: tx.isError === "1" };
}

function buildHeatmap(txs, days) {
  const now      = Math.floor(Date.now() / 1000);
  const startDay = now - days * 86400;
  const cells    = new Array(days).fill(0);
  txs.forEach(tx => { const ts = Number(tx.timeStamp); if (ts >= startDay) { const dayIdx = Math.floor((ts - startDay) / 86400); if (dayIdx >= 0 && dayIdx < days) cells[dayIdx]++; } });
  let longestStreak = 0, currentStreak = 0;
  for (const count of cells) { if (count > 0) { currentStreak++; longestStreak = Math.max(longestStreak, currentStreak); } else currentStreak = 0; }
  return { cells, maxCount: Math.max(...cells, 1), longestStreak, days };
}

function computeBaseScore({ totalTxs, walletAgeDays, uniqueContracts, totalSentEth, totalRecvEth, failedCount, streakDays }) {
  let score = 0;
  score += Math.min(300, totalTxs * 2);
  score += Math.min(200, walletAgeDays * 2);
  score += Math.min(200, uniqueContracts * 5);
  score += Math.min(150, (totalSentEth + totalRecvEth) * 10);
  score += Math.min(100, streakDays * 10);
  score -= failedCount * 2;
  return Math.max(0, Math.min(1000, Math.round(score)));
}

function emptyAnalytics(address) {
  return { address, walletAgeDays: 0, totalTxs: 0, successTxs: 0, failedCount: 0, firstTx: null, lastTx: null, largestTx: null, smallestTx: null, totalSentEth: "0.000000", totalRecvEth: "0.000000", avgGasUsed: 0, uniqueContracts: 0, topContracts: [], heatmap: { cells: new Array(90).fill(0), maxCount: 1, longestStreak: 0, days: 90 }, baseScore: 0 };
}

export async function getWalletAnalysis(address) {
  const txs = await fetchTransactions(address);
  return analyzeTransactions(address, txs);
}
""",
}

for path, content in files.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content)
    print(f"Created: {path}")

print("Batch 6 done!")
