import { useState, useEffect } from "react";
import { TASKS, SWAP_PLATFORMS, BRIDGE_PLATFORMS, DEPLOY_PLATFORMS } from "../utils/contracts";

const Icon = ({ src, size = 22, style = {} }) => (
  <img src={src} alt="" width={size} height={size} style={{ display: "block", ...style }} />
);

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;600;700&display=swap');
  .dh { font-family: 'Syne', sans-serif; }
  .db { font-family: 'DM Sans', sans-serif; }
`;

const gBase  = { background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" };
const gGreen = { background: "rgba(0,200,83,0.06)",    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(0,200,83,0.18)",    borderRadius: "16px" };

const TASK_COLORS = {
  gm:      "#38BDF8", // sky blue
  deploy:  "#A78BFA", // soft violet
  swap:    "#34D399", // emerald green
  bridge:  "#FB923C", // warm orange
  game:    "#F472B6", // rose pink
  profile: "#60A5FA", // calm blue
  streak:  "#FBBF24", // amber gold
};

// Converts a hex color to a CSS filter that colorizes a white/black SVG icon
function hexToFilter(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Approximate filter using sepia + saturate + hue-rotate
  const hue = Math.round(Math.atan2(
    Math.sqrt(3) * (g - b),
    2 * r - g - b
  ) * (180 / Math.PI));
  return `brightness(0) saturate(100%) invert(1) sepia(1) saturate(5) hue-rotate(${hue}deg) brightness(0.95)`;
}

const TASK_FILTERS = Object.fromEntries(
  Object.entries(TASK_COLORS).map(([id, hex]) => [id, hexToFilter(hex)])
);

const REMIX_GUIDE = [
  { step: "1",  title: "Open Remix IDE",          desc: "Go to remix.ethereum.org in your browser." },
  { step: "2",  title: "Create a new file",        desc: 'Click the file icon. Name it e.g. "MyContract.sol".' },
  { step: "3",  title: "Paste a simple contract",  desc: '// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\ncontract MyContract {\n    string public message = "GM Base!";\n}' },
  { step: "4",  title: "Compile",                  desc: 'Click the Solidity Compiler tab, then "Compile MyContract.sol".' },
  { step: "5",  title: "Open Deploy tab",          desc: 'Click the "Deploy & Run Transactions" tab.' },
  { step: "6",  title: "Select Injected Provider", desc: 'Set ENVIRONMENT to "Injected Provider - MetaMask" and approve.' },
  { step: "7",  title: "Switch to Base Mainnet",   desc: "Ensure your wallet is on Base Mainnet (Chain ID: 8453)." },
  { step: "8",  title: "Deploy",                   desc: 'Click the orange "Deploy" button and confirm in your wallet.' },
  { step: "9",  title: "Copy contract address",    desc: 'Under "Deployed Contracts", copy the address.' },
  { step: "10", title: "Paste into BaseQuest",     desc: 'Paste the address in the field above and click Complete!' },
];

const Badge = ({ label, color, bg }) => (
  <span style={{ background: bg, color, fontSize: "10px", fontWeight: 700, padding: "2px 7px", borderRadius: 20 }}>{label}</span>
);

const Chevron = ({ open, size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function QuestBoard({ quests, wallet }) {
  const { isConnected, isCorrectNetwork, switchNetwork } = wallet;
  const {
    completeTask, getTaskStatus, getSubTaskStatus,
    txPending, lastTx, error, completedCount, totalDaily,
  } = quests;

  const [fieldValues,  setFieldValues]  = useState({});
  const [expandedTask, setExpandedTask] = useState(null);
  const [expandedSubs, setExpandedSubs] = useState({});
  const [showGuide,    setShowGuide]    = useState(false);
  const [isMobile,     setIsMobile]     = useState(false);

  useEffect(() => {
    if (!document.getElementById("dash-fonts")) {
      const s = document.createElement("style");
      s.id = "dash-fonts"; s.textContent = FONTS;
      document.head.appendChild(s);
    }
    const upd = () => setIsMobile(window.innerWidth < 640);
    upd(); window.addEventListener("resize", upd);
    return () => window.removeEventListener("resize", upd);
  }, []);

  const m = isMobile;
  const handleField = (id, field, val) =>
    setFieldValues(p => ({ ...p, [id]: { ...p[id], [field]: val } }));

  const renderSubTasks = (platforms, groupId) => (
    <div style={{ marginTop: 12 }}>
      <div
        onClick={() => setExpandedSubs(p => ({ ...p, [groupId]: !p[groupId] }))}
        style={{ color: "#4da6ff", fontSize: "12px", fontWeight: 700, cursor: "pointer", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}
      >
        <Chevron open={!!expandedSubs[groupId]} size={13} />
        Platform sub-tasks (+50 XP each)
      </div>

      {expandedSubs[groupId] && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {platforms.map(p => {
            const done = getSubTaskStatus(p.id).done;
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, ...(done ? gGreen : gBase), padding: "10px 12px" }}>
                <Icon src={p.icon} size={20} />
                <div style={{ flex: 1, color: "white", fontSize: "13px", fontWeight: 600 }}>{p.name}</div>
                <a href={p.url} target="_blank" rel="noreferrer"
                  style={{ color: p.color, fontSize: "12px", fontWeight: 700, textDecoration: "none" }}>
                  Go ↗
                </a>
                <button
                  onClick={() => completeTask(p.id, {})}
                  disabled={done || txPending}
                  style={{ background: done ? "rgba(0,200,83,0.2)" : `${p.color}22`, border: `1px solid ${done ? "rgba(0,200,83,0.4)" : p.color + "44"}`, borderRadius: 8, padding: "4px 10px", color: done ? "#00c853" : p.color, fontSize: "11px", fontWeight: 700, cursor: done || txPending ? "not-allowed" : "pointer" }}
                >
                  {done ? "✓" : "+50 XP"}
                </button>
              </div>
            );
          })}

          {groupId === "deploy" && (
            <div style={{ marginTop: 4 }}>
              <div
                onClick={() => setShowGuide(v => !v)}
                style={{ color: "#f0b429", fontSize: "12px", fontWeight: 700, cursor: "pointer", padding: "7px 12px", background: "rgba(240,180,41,0.06)", border: "1px solid rgba(240,180,41,0.15)", borderRadius: 8, display: "flex", alignItems: "center", gap: 6 }}
              >
                <Icon src="/guide.svg" size={13} style={{ opacity: 0.8 }} />
                <span style={{ flex: 1 }}>{showGuide ? "Hide" : "Show"} step-by-step Remix guide</span>
                <Chevron open={showGuide} size={13} />
              </div>
              {showGuide && (
                <div style={{ ...gBase, padding: "14px", marginTop: 6, display: "flex", flexDirection: "column", gap: 12 }}>
                  <div className="dh" style={{ color: "white", fontSize: "13px", fontWeight: 800 }}>
                    How to deploy on Base using Remix IDE
                  </div>
                  {REMIX_GUIDE.map(g => (
                    <div key={g.step} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <div style={{ minWidth: 24, height: 24, background: "rgba(0,82,255,0.2)", border: "1px solid rgba(0,82,255,0.4)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#4da6ff", fontSize: "11px", fontWeight: 800, flexShrink: 0 }}>
                        {g.step}
                      </div>
                      <div>
                        <div className="dh" style={{ color: "white", fontSize: "12px", fontWeight: 700, marginBottom: 2 }}>{g.title}</div>
                        <div className="db" style={{ color: "#8892a4", fontSize: "12px", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{g.desc}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{ background: "rgba(0,200,83,0.08)", border: "1px solid rgba(0,200,83,0.2)", borderRadius: 8, padding: "9px 12px", color: "#00c853", fontSize: "12px", fontWeight: 600 }}>
                    Once deployed, paste your contract address above and click Complete to earn +100 XP!
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (!isConnected) return (
    <div className="db" style={{ padding: m ? "48px 0" : "72px 0", textAlign: "center" }}>
      <Icon src="/quests.svg" size={m ? 80 : 110} style={{ margin: "0 auto 20px", filter: WHITE }} />
      <div className="dh" style={{ color: "white", fontSize: m ? "18px" : "22px", fontWeight: 800, marginBottom: 8 }}>Quest Board</div>
      <div className="db" style={{ color: "#8892a4", fontSize: m ? "13px" : "14px" }}>Connect your wallet to start earning XP!</div>
    </div>
  );

  return (
    <div className="db" style={{ padding: m ? "14px 0 8px" : "24px 0 8px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: m ? 14 : 20 }}>
        <Icon src="/quests.svg" size={m ? 40 : 46} style={{ filter: WHITE, opacity: 0.6 }} />
        <div>
          <h2 className="dh" style={{ color: "white", fontSize: m ? "17px" : "22px", fontWeight: 900, margin: "0 0 2px" }}>Quest Board</h2>
          <p className="db" style={{ color: "#5a6478", fontSize: m ? "10px" : "11px", margin: 0, fontWeight: 600, letterSpacing: "0.07em" }}>
            {completedCount}/{totalDaily} DAILY QUESTS DONE
          </p>
        </div>
      </div>

      {/* Wrong network warning */}
      {!isCorrectNetwork && (
        <div style={{ background: "rgba(255,180,0,0.08)", border: "1px solid rgba(255,180,0,0.25)", borderRadius: 12, padding: "11px 14px", marginBottom: 12, display: "flex", alignItems: "center", gap: 10 }}>
          <Icon src="/warning.svg" size={16} style={{ opacity: 0.9 }} />
          <span className="db" style={{ color: "#f0b429", fontSize: "13px", fontWeight: 600, flex: 1 }}>
            Switch to Base Mainnet to complete quests
          </span>
          <button
            onClick={switchNetwork}
            style={{ background: "rgba(240,180,41,0.15)", border: "1px solid rgba(240,180,41,0.35)", borderRadius: 8, padding: "5px 12px", color: "#f0b429", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}
          >
            Switch
          </button>
        </div>
      )}

      {/* Status messages */}
      {lastTx?.status === "success" && (
        <div style={{ background: "rgba(0,200,83,0.1)", border: "1px solid rgba(0,200,83,0.3)", borderRadius: 12, padding: "11px 14px", marginBottom: 12, color: "#00c853", fontWeight: 600, fontSize: m ? "12px" : "13px", display: "flex", alignItems: "center", gap: 8 }}>
          <Icon src="/check.svg" size={16} />
          {lastTx.msg}
          <a href={`https://basescan.org/tx/${lastTx.hash}`} target="_blank" rel="noreferrer" style={{ color: "#00c853", fontSize: "11px", marginLeft: "auto" }}>View tx ↗</a>
        </div>
      )}
      {error && (
        <div style={{ background: "rgba(255,59,59,0.1)", border: "1px solid rgba(255,59,59,0.3)", borderRadius: 12, padding: "11px 14px", marginBottom: 12, color: "#ff6b6b", fontWeight: 600, fontSize: m ? "12px" : "13px", display: "flex", alignItems: "center", gap: 8 }}>
          <Icon src="/warning.svg" size={16} />
          {error}
        </div>
      )}

      {/* Quest list */}
      <div style={{ display: "flex", flexDirection: "column", gap: m ? 8 : 10 }}>
        {TASKS.map(task => {
          const isDone     = getTaskStatus(task.id).done;
          const expanded   = expandedTask === task.id;
          const iconColor  = TASK_COLORS[task.id]  || "#8892a4";
          const iconFilter = TASK_FILTERS[task.id] || "none";

          return (
            <div key={task.id} style={{ ...(isDone ? gGreen : gBase), overflow: "hidden", transition: "all 0.2s" }}>

              {/* Header row */}
              <div
                onClick={() => !task.auto && !isDone && setExpandedTask(expanded ? null : task.id)}
                style={{ padding: m ? "12px 14px" : "14px 18px", display: "flex", alignItems: "center", gap: m ? 10 : 14, cursor: task.auto || isDone ? "default" : "pointer" }}
              >
                <div style={{
                  width: m ? 38 : 44, height: m ? 38 : 44, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isDone ? "rgba(0,200,83,0.15)" : `${iconColor}18`,
                  border: `1px solid ${isDone ? "rgba(0,200,83,0.3)" : iconColor + "35"}`,
                  borderRadius: m ? 10 : 12,
                }}>
                  <Icon
                    src={task.icon}
                    size={m ? 20 : 24}
                    style={{
                      filter: isDone
                        ? "brightness(0) saturate(100%) invert(52%) sepia(98%) saturate(400%) hue-rotate(90deg)"
                        : iconFilter,
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 2 }}>
                    <span className="dh" style={{ color: "white", fontWeight: 800, fontSize: m ? "13px" : "14px" }}>{task.name}</span>
                    {isDone                  && <Badge label="DONE"      color="#00c853" bg="rgba(0,200,83,0.2)" />}
                    {task.auto               && <Badge label="AUTO"      color="#f0b429" bg="rgba(240,180,41,0.2)" />}
                    {task.oneTime && !isDone  && <Badge label="ONE-TIME"  color="#a855f7" bg="rgba(168,85,247,0.2)" />}
                    {task.hasSubs && !isDone  && <Badge label="+BONUS XP" color="#00d4ff" bg="rgba(0,82,255,0.2)" />}
                  </div>
                  <div className="db" style={{ color: "#8892a4", fontSize: m ? "11px" : "12px" }}>{task.description}</div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="dh" style={{ color: "#f0b429", fontWeight: 800, fontSize: m ? "14px" : "15px" }}>+{task.xp} XP</div>
                  {task.ethCost !== "0" && <div className="db" style={{ color: "#5a6478", fontSize: "10px" }}>{task.ethCost} ETH</div>}
                </div>

                {!task.auto && !isDone && (
                  <div style={{ color: "#5a6478", flexShrink: 0 }}>
                    <Chevron open={expanded} size={16} />
                  </div>
                )}
              </div>

              {/* Expanded body */}
              {expanded && !isDone && !task.auto && (
                <div style={{ padding: m ? "0 14px 14px" : "0 18px 18px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>

                  {task.field && (
                    <div style={{ marginTop: 12, marginBottom: 4 }}>
                      <label className="db" style={{ color: "#8892a4", fontSize: "11px", fontWeight: 600, display: "block", marginBottom: 5 }}>
                        {task.fieldLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={task.fieldPlaceholder}
                        value={fieldValues[task.id]?.[task.field] || ""}
                        onChange={e => handleField(task.id, task.field, e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "9px 12px", color: "white", fontSize: "13px", outline: "none", fontFamily: "DM Sans, sans-serif", boxSizing: "border-box" }}
                      />
                    </div>
                  )}

                  {task.id === "deploy" && renderSubTasks(DEPLOY_PLATFORMS, "deploy")}
                  {task.id === "swap"   && renderSubTasks(SWAP_PLATFORMS,   "swap")}
                  {task.id === "bridge" && renderSubTasks(BRIDGE_PLATFORMS, "bridge")}

                  <button
                    onClick={() => completeTask(task.id, fieldValues[task.id] || {})}
                    disabled={txPending || !isCorrectNetwork}
                    style={{ width: "100%", marginTop: 12, background: txPending || !isCorrectNetwork ? "rgba(0,82,255,0.3)" : "linear-gradient(135deg,#0052ff,#0041cc)", border: "none", borderRadius: 12, padding: m ? "11px" : "13px", color: "white", fontWeight: 800, fontSize: m ? "13px" : "14px", cursor: txPending || !isCorrectNetwork ? "not-allowed" : "pointer", boxShadow: txPending || !isCorrectNetwork ? "none" : "0 4px 20px rgba(0,82,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "Syne, sans-serif" }}
                  >
                    {txPending
                      ? <><Icon src="/hourglass.svg" size={15} style={{ opacity: 0.7 }} /> Confirming...</>
                      : !isCorrectNetwork
                        ? <><Icon src="/warning.svg" size={15} style={{ opacity: 0.8 }} /> Wrong Network</>
                        : <><Icon src="/check.svg"   size={15} style={{ opacity: 0.9 }} /> Complete — {task.ethCost} ETH</>
                    }
                  </button>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
                                                    }
