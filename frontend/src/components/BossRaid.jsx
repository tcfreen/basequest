import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { getBossRaidContract, shortAddr, timeAgo } from "../utils/contracts";

const Icon = ({ src, size = 22, style = {} }) => (
  <img src={src} alt="" width={size} height={size} style={{ display: "block", ...style }} />
);

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;600;700&display=swap');
  .dh { font-family: 'Syne', sans-serif; }
  .db { font-family: 'DM Sans', sans-serif; }
  @keyframes shake {
    0%  { transform: translateX(0); }
    15% { transform: translateX(-8px) rotate(-2deg); }
    30% { transform: translateX(8px) rotate(2deg); }
    45% { transform: translateX(-6px) rotate(-1deg); }
    60% { transform: translateX(6px) rotate(1deg); }
    75% { transform: translateX(-3px); }
    100%{ transform: translateX(0); }
  }
  @keyframes floatDmg {
    0%   { opacity: 1; transform: translateY(0) scale(1); }
    100% { opacity: 0; transform: translateY(-40px) scale(1.2); }
  }
`;

const gBase = { background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px" };
const gRed  = { background: "rgba(255,59,59,0.06)",   backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,59,59,0.22)",  borderRadius: "20px" };
const gBlue = { background: "rgba(0,82,255,0.06)",    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(0,82,255,0.2)",    borderRadius: "16px" };

const hpColor  = p => p > 60 ? "#00c853" : p > 30 ? "#f0b429" : "#ff3b3b";
const bossIcon = p => p > 66 ? "/boss-full.svg" : p > 33 ? "/boss-mid.svg" : "/boss-dead.svg";

export default function BossRaid({ wallet }) {
  const { address, signer, isConnected } = wallet;

  const [boss,          setBoss]          = useState(null);
  const [playerStats,   setPlayerStats]   = useState(null);
  const [recentAttacks, setRecentAttacks] = useState([]);
  const [attacking,     setAttacking]     = useState(false);
  const [lastDamage,    setLastDamage]    = useState(null);
  const [ethPrice,      setEthPrice]      = useState(2500);
  const [loading,       setLoading]       = useState(true);
  const [shake,         setShake]         = useState(false);
  const [flash,         setFlash]         = useState("");
  const [isMobile,      setIsMobile]      = useState(false);

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
      if (address) {
        const stats = await contract.getPlayerStats(address);
        setPlayerStats({
          damageThisRaid:     Number(stats.damageThisRaid),
          totalDamage:        Number(stats.totalDamage),
          raidsJoined:        Number(stats.raidsJoined),
          raidsWon:           Number(stats.raidsWon),
          hasAttackedThisRaid: stats.hasAttackedThisRaid,
        });
      }
    } catch (err) { console.warn("loadBossData error:", err.message); }
    finally { setLoading(false); }
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
    setAttacking(true); setLastDamage(null); setFlash("");
    try {
      const contract = getBossRaidContract(signer);
      const tx       = await contract.attack({ value: ethers.parseEther("0.00005") });
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
      if (!msg.includes("user rejected") && !msg.includes("User denied")) alert(msg.slice(0, 100));
    } finally { setAttacking(false); }
  };

  const prizeUsd = boss ? (parseFloat(ethers.formatEther(boss.prizePool)) * ethPrice).toFixed(2) : "0.00";

  if (!isConnected) return (
    <div className="db" style={{ padding: m ? "48px 0" : "72px 0", textAlign: "center" }}>
      <Icon src="/boss.svg" size={m ? 80 : 110} style={{ margin: "0 auto 20px", filter: "brightness(0) invert(1)" }} />
      <div className="dh" style={{ color: "white", fontSize: m ? "18px" : "22px", fontWeight: 800, marginBottom: 8 }}>Boss Raid</div>
      <div className="db" style={{ color: "#8892a4", fontSize: m ? "13px" : "14px" }}>Connect your wallet to join the raid!</div>
    </div>
  );

  if (loading) return (
    <div className="db" style={{ padding: m ? "48px 0" : "72px 0", textAlign: "center" }}>
      <Icon src="/sword.svg" size={m ? 36 : 48} style={{ margin: "0 auto 16px", opacity: 0.6 }} />
      <div style={{ color: "#8892a4", fontSize: m ? "13px" : "15px" }}>Loading raid...</div>
    </div>
  );

  return (
    <div className="db" style={{ padding: m ? "14px 0 8px" : "24px 0 8px" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: m ? 14 : 20 }}>
        <Icon src="/boss.svg" size={m ? 40 : 46} style={{ filter: "brightness(0) invert(1)", opacity: 0.85 }} />
        <div>
          <h2 className="dh" style={{ color: "white", fontSize: m ? "17px" : "22px", fontWeight: 900, margin: "0 0 2px" }}>Boss Raid</h2>
          <p style={{ color: "#5a6478", fontSize: m ? "10px" : "11px", margin: 0, fontWeight: 600, letterSpacing: "0.07em" }}>
            ATTACK · DEAL DAMAGE · WIN THE PRIZE POOL
          </p>
        </div>
      </div>

      {/* Boss card */}
      <div style={{ ...gRed, padding: m ? "20px 16px" : "28px", marginBottom: m ? 10 : 16, textAlign: "center", position: "relative", overflow: "hidden" }}>

        {/* Background glow */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,59,59,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Raid info */}
        <div style={{ color: "#5a6478", fontSize: m ? "10px" : "11px", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 12 }}>
          RAID #{boss?.raidNumber} — {boss?.playerCount} RAIDERS
        </div>

        {/* Boss icon */}
        <div style={{ display: "inline-block", marginBottom: 16, animation: shake ? "shake 0.5s ease" : "none", filter: flash === "kill" ? "drop-shadow(0 0 20px #f0b429)" : flash === "crit" ? "drop-shadow(0 0 16px #ff3b3b)" : flash === "hit" ? "drop-shadow(0 0 10px #00d4ff)" : "none", transition: "filter 0.2s" }}>
          <Icon src={boss ? bossIcon(boss.hpPercent) : "/bossraid.svg"} size={m ? 80 : 110} />
        </div>

        {/* Damage popup */}
        {lastDamage && (
          <div style={{ position: "absolute", top: 20, right: 20, background: lastDamage.killingBlow ? "rgba(240,180,41,0.2)" : "rgba(255,59,59,0.2)", border: `1px solid ${lastDamage.killingBlow ? "rgba(240,180,41,0.5)" : "rgba(255,59,59,0.4)"}`, borderRadius: 12, padding: "8px 14px", display: "flex", alignItems: "center", gap: 6, animation: "floatDmg 1.5s ease forwards" }}>
            <Icon src={lastDamage.killingBlow ? "/trophy.svg" : "/sword.svg"} size={16} style={{ opacity: 0.9 }} />
            <span style={{ color: lastDamage.killingBlow ? "#f0b429" : "#ff6b6b", fontWeight: 800, fontSize: m ? "14px" : "16px" }}>
              {lastDamage.killingBlow ? "KILLING BLOW!" : `-${lastDamage.damage} HP`}
            </span>
          </div>
        )}

        {/* HP */}
        <div className="dh" style={{ color: "white", fontSize: m ? "22px" : "28px", fontWeight: 900, marginBottom: 8 }}>
          {boss?.currentHP?.toLocaleString()} / {boss?.maxHP?.toLocaleString()} HP
        </div>

        {/* HP bar */}
        <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 12, height: m ? 10 : 14, margin: "0 0 20px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${boss?.hpPercent || 0}%`, background: `linear-gradient(90deg,${hpColor(boss?.hpPercent)},${hpColor(boss?.hpPercent)}aa)`, borderRadius: 12, transition: "width 0.5s ease", boxShadow: `0 0 12px ${hpColor(boss?.hpPercent)}88` }} />
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "center", gap: m ? 16 : 32, marginBottom: m ? 18 : 24, flexWrap: "wrap" }}>
          {[
            { icon: "/trophy.svg",   value: `${parseFloat(ethers.formatEther(boss?.prizePool || 0)).toFixed(5)} ETH`, sub: `Prize (~$${prizeUsd})`, color: "#f0b429" },
            { icon: "/sword.svg",    value: boss?.attackCount,  sub: "Total Attacks", color: "#00d4ff" },
            { icon: "/fire.svg",     value: boss?.playerCount,  sub: "Raiders",       color: "#00c853" },
            { icon: "/bossraid.svg", value: `${boss?.hpPercent}%`, sub: "HP Left",   color: "#a855f7" },
          ].map(({ icon, value, sub, color }) => (
            <div key={sub} style={{ textAlign: "center" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 2 }}>
                <Icon src={icon} size={m ? 13 : 15} style={{ opacity: 0.7 }} />
                <span className="dh" style={{ color, fontWeight: 800, fontSize: m ? "16px" : "20px" }}>{value}</span>
              </div>
              <div style={{ color: "#5a6478", fontSize: m ? "10px" : "11px", fontWeight: 600 }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Attack button */}
        <button
          onClick={handleAttack}
          disabled={attacking || !isConnected || boss?.defeated}
          style={{ background: attacking ? "rgba(255,59,59,0.3)" : boss?.defeated ? "rgba(100,100,100,0.2)" : "linear-gradient(135deg,#ff3b3b,#cc0000)", border: "none", borderRadius: 16, padding: m ? "13px 32px" : "16px 48px", color: "white", fontWeight: 900, fontSize: m ? "15px" : "18px", cursor: attacking || boss?.defeated ? "not-allowed" : "pointer", opacity: boss?.defeated ? 0.5 : 1, boxShadow: attacking || boss?.defeated ? "none" : "0 0 24px rgba(255,59,59,0.4)", transition: "all 0.2s", letterSpacing: 1, display: "inline-flex", alignItems: "center", gap: 10, fontFamily: "Syne, sans-serif" }}
        >
          <Icon src={attacking ? "/hourglass.svg" : boss?.defeated ? "/skull.svg" : "/sword.svg"} size={m ? 18 : 22} style={{ opacity: 0.9 }} />
          {attacking ? "Attacking..." : boss?.defeated ? "Boss Defeated" : "ATTACK! (0.00005 ETH)"}
        </button>

        {/* Attack info */}
        {!boss?.defeated && (
          <div style={{ color: "#5a6478", fontSize: m ? "11px" : "12px", marginTop: 12 }}>
            Each attack deals <strong style={{ color: "white" }}>10–100 random damage</strong> · Killing blow wins <strong style={{ color: "#f0b429" }}>80% of prize pool</strong>
          </div>
        )}

        {/* Defeated message */}
        {boss?.defeated && boss?.winner && (
          <div style={{ marginTop: 14, background: "rgba(240,180,41,0.1)", border: "1px solid rgba(240,180,41,0.3)", borderRadius: 12, padding: "11px 16px", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon src="/trophy.svg" size={16} style={{ opacity: 0.9 }} />
            <span style={{ color: "#f0b429", fontWeight: 700, fontSize: m ? "12px" : "13px" }}>
              {shortAddr(boss.winner)} landed the killing blow! Next boss is spawning...
            </span>
          </div>
        )}
      </div>

      {/* Player stats */}
      {playerStats && (
        <div style={{ ...gBlue, padding: m ? "14px" : "20px", marginBottom: m ? 10 : 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: m ? 12 : 16 }}>
            <Icon src="/sword.svg" size={m ? 16 : 18} style={{ opacity: 0.85 }} />
            <div className="dh" style={{ color: "white", fontSize: m ? "13px" : "15px", fontWeight: 800 }}>Your Raid Stats</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: m ? "1fr 1fr" : "repeat(4,1fr)", gap: m ? 7 : 10 }}>
            {[
              { label: "DMG THIS RAID", value: playerStats.damageThisRaid.toLocaleString(), color: "#ff6b6b" },
              { label: "TOTAL DAMAGE",  value: playerStats.totalDamage.toLocaleString(),    color: "#ff3b3b" },
              { label: "RAIDS JOINED",  value: playerStats.raidsJoined,                     color: "#00d4ff" },
              { label: "RAIDS WON",     value: playerStats.raidsWon,                        color: "#f0b429" },
            ].map(s => (
              <div key={s.label} style={{ ...gBase, padding: m ? "12px 10px" : "14px", textAlign: "center" }}>
                <div className="dh" style={{ color: s.color, fontWeight: 800, fontSize: m ? "17px" : "20px" }}>{s.value}</div>
                <div style={{ color: "#4a5568", fontSize: m ? "9px" : "10px", fontWeight: 700, marginTop: 4, letterSpacing: "0.07em" }}>{s.label}</div>
              </div>
            ))}
          </div>
          {playerStats.hasAttackedThisRaid && (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 7, justifyContent: "center" }}>
              <Icon src="/check.svg" size={14} style={{ opacity: 0.85 }} />
              <span style={{ color: "#00c853", fontSize: m ? "12px" : "13px", fontWeight: 600 }}>You have attacked this raid — keep attacking for more chances!</span>
            </div>
          )}
        </div>
      )}

      {/* Live attack feed */}
      <div style={{ ...gBase, padding: m ? "14px" : "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: m ? 12 : 16 }}>
          <Icon src="/fire.svg" size={m ? 16 : 18} style={{ opacity: 0.85 }} />
          <div className="dh" style={{ color: "white", fontSize: m ? "13px" : "15px", fontWeight: 800 }}>Live Attack Feed</div>
        </div>
        {recentAttacks.length === 0 ? (
          <div style={{ color: "#8892a4", fontSize: m ? "12px" : "14px", textAlign: "center", padding: m ? "16px 0" : "20px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            <Icon src="/sword.svg" size={16} style={{ opacity: 0.4 }} />
            No attacks yet. Be the first to strike!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: m ? 6 : 8 }}>
            {recentAttacks.map((atk, i) => (
              <div key={i} style={{ background: atk.killingBlow ? "rgba(240,180,41,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${atk.killingBlow ? "rgba(240,180,41,0.3)" : "rgba(255,255,255,0.05)"}`, borderRadius: 10, padding: m ? "9px 11px" : "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                  <Icon src={atk.killingBlow ? "/trophy.svg" : "/sword.svg"} size={m ? 15 : 17} style={{ flexShrink: 0, opacity: 0.85 }} />
                  <div style={{ minWidth: 0 }}>
                    <span className="dh" style={{ color: atk.killingBlow ? "#f0b429" : "white", fontWeight: 700, fontSize: m ? "12px" : "13px" }}>
                      {shortAddr(atk.attacker)}
                    </span>
                    <span className="db" style={{ color: "#8892a4", fontSize: m ? "11px" : "12px" }}>
                      {" "}dealt{" "}
                      <strong style={{ color: atk.killingBlow ? "#f0b429" : "#ff6b6b" }}>{atk.damage} dmg</strong>
                      {atk.killingBlow && <span style={{ color: "#f0b429", fontWeight: 700 }}> — KILLING BLOW!</span>}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ color: "#5a6478", fontSize: "10px" }}>{timeAgo(atk.timestamp)}</div>
                  <div style={{ color: "#5a6478", fontSize: "10px" }}>{atk.hpAfter.toLocaleString()} HP left</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
            }
