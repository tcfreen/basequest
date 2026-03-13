import { useState } from "react";
import { TASKS, SWAP_PLATFORMS, BRIDGE_PLATFORMS } from "../utils/contracts";

export default function QuestBoard({ quests, wallet }) {
  const { isConnected } = wallet;
  const {
    completeTask, getTaskStatus, getSubTaskStatus,
    txPending, lastTx, error, userProfile,
    completedCount, totalDaily,
  } = quests;

  const [fieldValues,   setFieldValues]   = useState({});
  const [expandedTask,  setExpandedTask]  = useState(null);
  const [expandedSubs,  setExpandedSubs]  = useState({});

  const handleField = (taskId, field, value) => {
    setFieldValues(prev => ({ ...prev, [taskId]: { ...prev[taskId], [field]: value } }));
  };

  const handleComplete = async (taskId) => {
    await completeTask(taskId, fieldValues[taskId] || {});
  };

  const toggleSubs = (taskId) => {
    setExpandedSubs(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  if (!isConnected) return (
    <div style={{ padding: "60px 20px", textAlign: "center" }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🗺️</div>
      <div style={{ color: "white", fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>Quest Board</div>
      <div style={{ color: "#8892a4", fontSize: "14px" }}>Connect your wallet to start earning XP!</div>
    </div>
  );

  return (
    <div style={{ padding: "24px 0" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ color: "white", fontSize: "22px", fontWeight: "800", margin: "0 0 6px" }}>
          🗺️ Quest Board
        </h2>
        <p style={{ color: "#8892a4", fontSize: "14px", margin: 0 }}>
          Complete quests to earn XP and level up on Base!
          {" "}<strong style={{ color: "white" }}>{completedCount}/{totalDaily}</strong> daily quests done.
        </p>
      </div>

      {/* Status messages */}
      {lastTx?.status === "success" && (
        <div style={{
          background: "rgba(0,200,83,0.1)", border: "1px solid rgba(0,200,83,0.3)",
          borderRadius: "12px", padding: "12px 16px", marginBottom: "16px",
          color: "#00c853", fontWeight: "600", fontSize: "14px",
        }}>
          ✅ {lastTx.msg}{" "}
          <a href={`https://basescan.org/tx/${lastTx.hash}`} target="_blank" rel="noreferrer"
            style={{ color: "#00c853", fontSize: "12px" }}>View tx ↗</a>
        </div>
      )}
      {error && (
        <div style={{
          background: "rgba(255,59,59,0.1)", border: "1px solid rgba(255,59,59,0.3)",
          borderRadius: "12px", padding: "12px 16px", marginBottom: "16px",
          color: "#ff6b6b", fontWeight: "600", fontSize: "14px",
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Quest list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {TASKS.map(task => {
          const status   = getTaskStatus(task.id);
          const isDone   = status.done;
          const isAuto   = task.auto;
          const expanded = expandedTask === task.id;

          return (
            <div key={task.id} style={{
              background:   isDone ? "rgba(0,200,83,0.05)" : "rgba(255,255,255,0.03)",
              border:       `1px solid ${isDone ? "rgba(0,200,83,0.2)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: "16px",
              overflow:     "hidden",
              transition:   "all 0.2s",
            }}>

              {/* Task header row */}
              <div
                onClick={() => !isAuto && !isDone && setExpandedTask(expanded ? null : task.id)}
                style={{
                  padding:    "16px 20px",
                  display:    "flex",
                  alignItems: "center",
                  gap:        "14px",
                  cursor:     isAuto || isDone ? "default" : "pointer",
                }}
              >
                {/* Icon */}
                <div style={{
                  fontSize:     "28px",
                  width:        "44px",
                  height:       "44px",
                  display:      "flex",
                  alignItems:   "center",
                  justifyContent: "center",
                  background:   isDone ? "rgba(0,200,83,0.15)" : "rgba(255,255,255,0.05)",
                  borderRadius: "12px",
                  flexShrink:   0,
                }}>
                  {task.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{ color: "white", fontWeight: "700", fontSize: "15px" }}>{task.name}</span>
                    {isDone  && <span style={{ background: "rgba(0,200,83,0.2)",  color: "#00c853", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" }}>DONE</span>}
                    {isAuto  && <span style={{ background: "rgba(240,180,41,0.2)", color: "#f0b429", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" }}>AUTO</span>}
                    {task.oneTime && !isDone && <span style={{ background: "rgba(168,85,247,0.2)", color: "#a855f7", fontSize: "11px", fontWeight: "700", padding: "2px 8px", borderRadius: "20px" }}>ONE-TIME</span>}
                  </div>
                  <div style={{ color: "#8892a4", fontSize: "13px", marginTop: "2px" }}>{task.description}</div>
                </div>

                {/* XP + cost */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ color: "#f0b429", fontWeight: "800", fontSize: "16px" }}>+{task.xp} XP</div>
                  {task.ethCost !== "0" && (
                    <div style={{ color: "#8892a4", fontSize: "11px" }}>{task.ethCost} ETH</div>
                  )}
                </div>

                {/* Chevron */}
                {!isAuto && !isDone && (
                  <div style={{ color: "#8892a4", fontSize: "18px", flexShrink: 0 }}>
                    {expanded ? "▲" : "▼"}
                  </div>
                )}
              </div>

              {/* Expanded area */}
              {expanded && !isDone && !isAuto && (
                <div style={{ padding: "0 20px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>

                  {/* Input field if needed */}
                  {task.field && (
                    <div style={{ marginTop: "14px", marginBottom: "14px" }}>
                      <label style={{ color: "#8892a4", fontSize: "12px", fontWeight: "600", display: "block", marginBottom: "6px" }}>
                        {task.fieldLabel}
                      </label>
                      <input
                        type="text"
                        placeholder={task.fieldPlaceholder}
                        value={fieldValues[task.id]?.[task.field] || ""}
                        onChange={e => handleField(task.id, task.field, e.target.value)}
                        style={{
                          width:        "100%",
                          background:   "rgba(255,255,255,0.05)",
                          border:       "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "10px",
                          padding:      "10px 14px",
                          color:        "white",
                          fontSize:     "14px",
                          outline:      "none",
                        }}
                      />
                    </div>
                  )}

                  {/* Sub-tasks for swap */}
                  {task.id === "swap" && (
                    <div style={{ marginTop: "14px" }}>
                      <div
                        onClick={() => toggleSubs("swap")}
                        style={{ color: "#0052ff", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginBottom: "10px" }}
                      >
                        {expandedSubs.swap ? "▲" : "▼"} Platform sub-tasks (+50 XP each)
                      </div>
                      {expandedSubs.swap && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                          {SWAP_PLATFORMS.map(p => {
                            const subDone = getSubTaskStatus(p.id).done;
                            return (
                              <div key={p.id} style={{
                                display:      "flex",
                                alignItems:   "center",
                                gap:          "10px",
                                background:   subDone ? "rgba(0,200,83,0.08)" : "rgba(255,255,255,0.03)",
                                border:       `1px solid ${subDone ? "rgba(0,200,83,0.2)" : "rgba(255,255,255,0.06)"}`,
                                borderRadius: "10px",
                                padding:      "10px 14px",
                              }}>
                                <span style={{ fontSize: "20px" }}>{p.icon}</span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>{p.name}</div>
                                </div>
                                <a href={p.url} target="_blank" rel="noreferrer"
                                  style={{ color: p.color, fontSize: "12px", fontWeight: "600", textDecoration: "none" }}>
                                  Go ↗
                                </a>
                                <button
                                  onClick={() => completeTask(p.id)}
                                  disabled={subDone || txPending}
                                  style={{
                                    background:   subDone ? "rgba(0,200,83,0.2)" : `${p.color}22`,
                                    border:       `1px solid ${subDone ? "rgba(0,200,83,0.4)" : p.color + "44"}`,
                                    borderRadius: "8px",
                                    padding:      "5px 12px",
                                    color:        subDone ? "#00c853" : p.color,
                                    fontSize:     "12px",
                                    fontWeight:   "700",
                                    cursor:       subDone || txPending ? "not-allowed" : "pointer",
                                  }}
                                >
                                  {subDone ? "✓ Done" : "+50 XP"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-tasks for bridge */}
                  {task.id === "bridge" && (
                    <div style={{ marginTop: "14px" }}>
                      <div
                        onClick={() => toggleSubs("bridge")}
                        style={{ color: "#0052ff", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginBottom: "10px" }}
                      >
                        {expandedSubs.bridge ? "▲" : "▼"} Platform sub-tasks (+50 XP each)
                      </div>
                      {expandedSubs.bridge && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "14px" }}>
                          {BRIDGE_PLATFORMS.map(p => {
                            const subDone = getSubTaskStatus(p.id).done;
                            return (
                              <div key={p.id} style={{
                                display:      "flex",
                                alignItems:   "center",
                                gap:          "10px",
                                background:   subDone ? "rgba(0,200,83,0.08)" : "rgba(255,255,255,0.03)",
                                border:       `1px solid ${subDone ? "rgba(0,200,83,0.2)" : "rgba(255,255,255,0.06)"}`,
                                borderRadius: "10px",
                                padding:      "10px 14px",
                              }}>
                                <span style={{ fontSize: "20px" }}>{p.icon}</span>
                                <div style={{ flex: 1 }}>
                                  <div style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>{p.name}</div>
                                </div>
                                <a href={p.url} target="_blank" rel="noreferrer"
                                  style={{ color: p.color, fontSize: "12px", fontWeight: "600", textDecoration: "none" }}>
                                  Go ↗
                                </a>
                                <button
                                  onClick={() => completeTask(p.id)}
                                  disabled={subDone || txPending}
                                  style={{
                                    background:   subDone ? "rgba(0,200,83,0.2)" : `${p.color}22`,
                                    border:       `1px solid ${subDone ? "rgba(0,200,83,0.4)" : p.color + "44"}`,
                                    borderRadius: "8px",
                                    padding:      "5px 12px",
                                    color:        subDone ? "#00c853" : p.color,
                                    fontSize:     "12px",
                                    fontWeight:   "700",
                                    cursor:       subDone || txPending ? "not-allowed" : "pointer",
                                  }}
                                >
                                  {subDone ? "✓ Done" : "+50 XP"}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Complete button */}
                  <button
                    onClick={() => handleComplete(task.id)}
                    disabled={txPending}
                    style={{
                      width:        "100%",
                      marginTop:    "14px",
                      background:   txPending ? "rgba(0,82,255,0.3)" : "linear-gradient(135deg, #0052ff, #0041cc)",
                      border:       "none",
                      borderRadius: "12px",
                      padding:      "13px",
                      color:        "white",
                      fontWeight:   "800",
                      fontSize:     "15px",
                      cursor:       txPending ? "not-allowed" : "pointer",
                      boxShadow:    txPending ? "none" : "0 4px 20px rgba(0,82,255,0.3)",
                    }}
                  >
                    {txPending ? "⏳ Confirming..." : `Complete — ${task.ethCost} ETH`}
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
