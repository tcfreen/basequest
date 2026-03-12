import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { getBossRaidContract, shortAddr, timeAgo, formatEth } from "../utils/contracts";

export default function BossRaid({ wallet }) {
  const { address, signer, isConnected } = wallet;

  const [boss,        setBoss]        = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [recentAttacks, setRecentAttacks] = useState([]);
  const [attacking,   setAttacking]   = useState(false);
  const [lastDamage,  setLastDamage]  = useState(null);
  const [ethPrice,    setEthPrice]    = useState(2500);
  const [loading,     setLoading]     = useState(true);
  const [shake,       setShake]       = useState(false);
  const [flash,       setFlash]       = useState("");

  const loadBossData = useCallback(async () => {
    if (!signer) return;
    try {
      const contract = getBossRaidContract(signer);
      const [status, attacks] = await Promise.all([
        contract.getBossStatus(),
        contract.getRecentAttacks(10),
      ]);

      setBoss({
        raidNumber:  Number(status.raidNumber),
        maxHP:       Number(status.maxHP),
        currentHP:   Number(status.currentHP),
        hpPercent:   Number(status.hpPercent),
        defeated:    status.defeated,
        winner:      status.winner,
        prizePool:   status.prizePool,
        startedAt:   Number(status.startedAt),
        attackCount: Number(status.attackCount),
        playerCount: Number(status.playerCount),
      });

      // Recent attacks
      const atks = [];
      for (let i = 0; i < attacks.attackers.length; i++) {
        atks.push({
          attacker:    attacks.attackers[i],
          damage:      Number(attacks.damages[i]),
          hpAfter:     Number(attacks.hpAfters[i]),
          killingBlow: attacks.killingBlows[i],
          timestamp:   Number(attacks.timestamps[i]),
        });
      }
      setRecentAttacks(atks.reverse());

      // Player stats
      if (address) {
        const stats = await contract.getPlayerStats(address);
        setPlayerStats({
          damageThisRaid:    Number(stats.damageThisRaid),
          totalDamage:       Number(stats.totalDamage),
          raidsJoined:       Number(stats.raidsJoined),
          raidsWon:          Number(stats.raidsWon),
          hasAttackedThisRaid: stats.hasAttackedThisRaid,
        });
      }
    } catch (err) {
      console.warn("loadBossData error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [signer, address]);

  useEffect(() => {
    if (signer) loadBossData();
    const iv = setInterval(() => { if (signer) loadBossData(); }, 5000);
    return () => clearInterval(iv);
  }, [signer, loadBossData]);

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd")
      .then(r => r.json()).then(d => setEthPrice(d.ethereum?.usd || 2500)).catch(() => {});
  }, []);

  const handleAttack = async () => {
    if (!isConnected || !signer) return;
    setAttacking(true);
    setLastDamage(null);
    setFlash("");
    try {
      const contract = getBossRaidContract(signer);
      const tx       = await contract.attack({ value: ethers.parseEther("0.00005") });

      // Listen for AttackLanded event
      contract.once("AttackLanded", (attacker, damage, hpRemaining, killingBlow) => {
        if (attacker.toLowerCase() === address.toLowerCase()) {
          const dmg = Number(damage);
          setLastDamage({ damage: dmg, killingBlow });
          setShake(true);
          setFlash(killingBlow ? "kill" : dmg >= 80 ? "crit" : "hit");
          setTimeout(() => setShake(false), 600);
          setTimeout(() => setFlash(""), 1500);
        }
      });

      await tx.wait();
      await loadBossData();
    } catch (err) {
      const msg = err?.reason || err?.message || "";
      if (msg.includes("user rejected") || msg.includes("User denied")) {
        console.log("Cancelled");
      } else {
        alert(msg.slice(0, 100));
      }
    } finally {
      setAttacking(false);
    }
  };

  // ── HP bar color ──────────────────────────────────────────────────────────
  const hpColor = (pct) => {
    if (pct > 60) return "#00c853";
    if (pct > 30) return "#f0b429";
    return "#ff3b3b";
  };

  // ── Boss emoji based on HP ────────────────────────────────────────────────
  const bossEmoji = (pct) => {
    if (pct > 66) return "🐲";
    if (pct > 33) return "🐉";
    return "💀";
  };

  const prizeUsd = boss ? (parseFloat(ethers.formatEther(boss.prizePool)) * ethPrice).toFixed(2) : "0.00";

  if (!isConnected) return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <div style={{ fontSize: "64px", marginBottom: "16px" }}>🐉</div>
      <div style={{ color: "white", fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>Boss Raid</div>
      <div style={{ color: "#8892a4", fontSize: "14px" }}>Connect your wallet to join the raid!</div>
    </div>
  );

  if (loading) return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚔️</div>
      <div style={{ color: "#8892a4", fontSize: "16px" }}>Loading raid...</div>
    </div>
  );

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ color: "white", fontSize: "22px", fontWeight: "800", margin: "0 0 6px" }}>
          🐉 Boss Raid
        </h2>
        <p style={{ color: "#8892a4", fontSize: "14px", margin: 0 }}>
          Attack the boss, deal damage, land the killing blow and win the prize pool!
        </p>
      </div>

      {/* Boss card */}
      <div style={{
        background:   "rgba(255,59,59,0.06)",
        border:       "1px solid rgba(255,59,59,0.25)",
        borderRadius: "20px",
        padding:      "28px",
        marginBottom: "20px",
        textAlign:    "center",
        position:     "relative",
        overflow:     "hidden",
      }}>

        {/* Background glow */}
        <div style={{
          position:   "absolute", top: "50%", left: "50%",
          transform:  "translate(-50%,-50%)",
          width:      "300px", height: "300px",
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,59,59,0.08) 0%, transparent 70%)`,
          pointerEvents: "none",
        }}/>

        {/* Raid number */}
        <div style={{ color: "#8892a4", fontSize: "12px", fontWeight: "700", letterSpacing: "2px", marginBottom: "12px" }}>
          RAID #{boss?.raidNumber} — {boss?.playerCount} RAIDERS
        </div>

        {/* Boss emoji — shakes on hit */}
        <div style={{
          fontSize:   "96px",
          lineHeight: "1",
          marginBottom: "16px",
          display:    "inline-block",
          animation:  shake ? "shake 0.5s ease" : "none",
          filter:     flash === "kill" ? "drop-shadow(0 0 20px #f0b429)"
                    : flash === "crit" ? "drop-shadow(0 0 16px #ff3b3b)"
                    : flash === "hit"  ? "drop-shadow(0 0 10px #00d4ff)"
                    : "none",
          transition: "filter 0.2s",
        }}>
          {boss ? bossEmoji(boss.hpPercent) : "🐉"}
        </div>

        {/* Last damage popup */}
        {lastDamage && (
          <div style={{
            position:   "absolute",
            top:        "20px",
            right:      "20px",
            background: lastDamage.killingBlow ? "rgba(240,180,41,0.2)" : "rgba(255,59,59,0.2)",
            border:     `1px solid ${lastDamage.killingBlow ? "rgba(240,180,41,0.5)" : "rgba(255,59,59,0.4)"}`,
            borderRadius: "12px",
            padding:    "8px 14px",
            color:      lastDamage.killingBlow ? "#f0b429" : "#ff6b6b",
            fontWeight: "800",
            fontSize:   "18px",
          }}>
            {lastDamage.killingBlow ? "💀 KILLING BLOW!" : `⚔️ -${lastDamage.damage} HP`}
          </div>
        )}

        {/* HP display */}
        <div style={{ color: "white", fontSize: "28px", fontWeight: "900", marginBottom: "8px" }}>
          {boss?.currentHP?.toLocaleString()} / {boss?.maxHP?.toLocaleString()} HP
        </div>

        {/* HP bar */}
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: "12px", height: "16px", margin: "0 0 20px", overflow: "hidden" }}>
          <div style={{
            height:       "100%",
            width:        `${boss?.hpPercent || 0}%`,
            background:   `linear-gradient(90deg, ${hpColor(boss?.hpPercent)}, ${hpColor(boss?.hpPercent)}aa)`,
            borderRadius: "12px",
            transition:   "width 0.5s ease, background 0.5s ease",
            boxShadow:    `0 0 12px ${hpColor(boss?.hpPercent)}88`,
          }}/>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "center", gap: "32px", marginBottom: "24px", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#f0b429", fontWeight: "800", fontSize: "20px" }}>
              {parseFloat(ethers.formatEther(boss?.prizePool || 0)).toFixed(5)} ETH
            </div>
            <div style={{ color: "#8892a4", fontSize: "12px" }}>Prize Pool (~${prizeUsd})</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#00d4ff", fontWeight: "800", fontSize: "20px" }}>{boss?.attackCount}</div>
            <div style={{ color: "#8892a4", fontSize: "12px" }}>Total Attacks</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#00c853", fontWeight: "800", fontSize: "20px" }}>{boss?.playerCount}</div>
            <div style={{ color: "#8892a4", fontSize: "12px" }}>Raiders</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ color: "#a855f7", fontWeight: "800", fontSize: "20px" }}>
              {boss?.hpPercent}%
            </div>
            <div style={{ color: "#8892a4", fontSize: "12px" }}>HP Remaining</div>
          </div>
        </div>

        {/* Attack button */}
        <button
          onClick={handleAttack}
          disabled={attacking || !isConnected || boss?.defeated}
          style={{
            background:   attacking ? "rgba(255,59,59,0.3)"
                        : boss?.defeated ? "rgba(100,100,100,0.2)"
                        : "linear-gradient(135deg, #ff3b3b, #cc0000)",
            border:       "none",
            borderRadius: "16px",
            padding:      "16px 48px",
            color:        "white",
            fontWeight:   "900",
            fontSize:     "18px",
            cursor:       attacking || boss?.defeated ? "not-allowed" : "pointer",
            opacity:      boss?.defeated ? 0.5 : 1,
            boxShadow:    attacking || boss?.defeated ? "none" : "0 0 24px rgba(255,59,59,0.4)",
            transition:   "all 0.2s",
            letterSpacing: "1px",
          }}
        >
          {attacking      ? "⚔️ Attacking..."
          : boss?.defeated ? "💀 Boss Defeated"
          : "⚔️ ATTACK! (0.00005 ETH)"}
        </button>

        {/* Attack info */}
        {!boss?.defeated && (
          <div style={{ color: "#8892a4", fontSize: "12px", marginTop: "12px" }}>
            Each attack deals <strong style={{ color: "white" }}>10–100 random damage</strong> •
            Killing blow wins <strong style={{ color: "#f0b429" }}>80% of prize pool</strong>
          </div>
        )}

        {/* Defeated message */}
        {boss?.defeated && boss?.winner && (
          <div style={{
            marginTop:    "16px",
            background:   "rgba(240,180,41,0.1)",
            border:       "1px solid rgba(240,180,41,0.3)",
            borderRadius: "12px",
            padding:      "12px 20px",
            color:        "#f0b429",
            fontWeight:   "700",
            fontSize:     "14px",
          }}>
            🏆 Winner: {shortAddr(boss.winner)} landed the killing blow! Next boss is spawning...
          </div>
        )}
      </div>

      {/* Player stats */}
      {playerStats && (
        <div style={{
          background:   "rgba(0,82,255,0.06)",
          border:       "1px solid rgba(0,82,255,0.2)",
          borderRadius: "16px",
          padding:      "20px",
          marginBottom: "20px",
        }}>
          <div style={{ color: "white", fontWeight: "800", fontSize: "16px", marginBottom: "16px" }}>
            ⚔️ Your Raid Stats
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: "12px" }}>
            {[
              { label: "Damage This Raid", value: playerStats.damageThisRaid.toLocaleString(), color: "#ff6b6b" },
              { label: "Total Damage",     value: playerStats.totalDamage.toLocaleString(),    color: "#ff3b3b" },
              { label: "Raids Joined",     value: playerStats.raidsJoined,                     color: "#00d4ff" },
              { label: "Raids Won",        value: playerStats.raidsWon,                        color: "#f0b429" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "14px", textAlign: "center" }}>
                <div style={{ color: s.color, fontWeight: "800", fontSize: "22px" }}>{s.value}</div>
                <div style={{ color: "#8892a4", fontSize: "11px", marginTop: "4px" }}>{s.label}</div>
              </div>
            ))}
          </div>
          {playerStats.hasAttackedThisRaid && (
            <div style={{ marginTop: "12px", color: "#00c853", fontSize: "13px", fontWeight: "600", textAlign: "center" }}>
              ✅ You have attacked this raid — keep attacking for more chances!
            </div>
          )}
        </div>
      )}

      {/* Recent attacks feed */}
      <div style={{
        background:   "rgba(255,255,255,0.02)",
        border:       "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px",
        padding:      "20px",
      }}>
        <div style={{ color: "white", fontWeight: "800", fontSize: "16px", marginBottom: "16px" }}>
          ⚡ Live Attack Feed
        </div>
        {recentAttacks.length === 0 ? (
          <div style={{ color: "#8892a4", fontSize: "14px", textAlign: "center", padding: "20px 0" }}>
            No attacks yet. Be the first to strike! ⚔️
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {recentAttacks.map((atk, i) => (
              <div key={i} style={{
                background:   atk.killingBlow ? "rgba(240,180,41,0.08)" : "rgba(255,255,255,0.02)",
                border:       `1px solid ${atk.killingBlow ? "rgba(240,180,41,0.3)" : "rgba(255,255,255,0.05)"}`,
                borderRadius: "10px",
                padding:      "10px 14px",
                display:      "flex",
                alignItems:   "center",
                justifyContent: "space-between",
                gap:          "12px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "18px" }}>{atk.killingBlow ? "💀" : "⚔️"}</span>
                  <div>
                    <span style={{ color: atk.killingBlow ? "#f0b429" : "white", fontWeight: "700", fontSize: "13px" }}>
                      {shortAddr(atk.attacker)}
                    </span>
                    <span style={{ color: "#8892a4", fontSize: "12px" }}>
                      {" "}dealt{" "}
                      <strong style={{ color: atk.killingBlow ? "#f0b429" : "#ff6b6b" }}>
                        {atk.damage} dmg
                      </strong>
                      {atk.killingBlow && <span style={{ color: "#f0b429", fontWeight: "700" }}> — KILLING BLOW! 🏆</span>}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#8892a4", fontSize: "11px" }}>{timeAgo(atk.timestamp)}</div>
                  <div style={{ color: "#8892a4", fontSize: "11px" }}>{atk.hpAfter.toLocaleString()} HP left</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CSS animation */}
      <style>{`
        @keyframes shake {
          0%  { transform: translateX(0); }
          15% { transform: translateX(-8px) rotate(-2deg); }
          30% { transform: translateX(8px) rotate(2deg); }
          45% { transform: translateX(-6px) rotate(-1deg); }
          60% { transform: translateX(6px) rotate(1deg); }
          75% { transform: translateX(-3px); }
          100%{ transform: translateX(0); }
        }
      `}</style>
    </div>
  );
  }
