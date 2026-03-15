import { useState, useEffect } from "react";
import { shortAddr, getLevelInfo } from "../utils/contracts";

const Icon = ({ src, size = 18, style = {} }) => (
  <img src={src} alt="" width={size} height={size} style={{ display: "block", ...style }} />
);

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;600;700&display=swap');
  .dh { font-family: 'Syne', sans-serif; }
  .db { font-family: 'DM Sans', sans-serif; }
`;

const WALLETS = [
  { id: "metamask", label: "MetaMask",       icon: "/metamask.svg"  },
  { id: "coinbase", label: "Coinbase Wallet", icon: "/coinbase.svg"  },
  { id: "injected", label: "Rabby / Other",   icon: "/rabby.svg"     },
];

export default function Navbar({ wallet }) {
  const { address, isConnected, isConnecting, isCorrectNetwork,
          connect, disconnect, switchNetwork, userProfile } = wallet;

  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showUserMenu,   setShowUserMenu]   = useState(false);
  const [isMobile,       setIsMobile]       = useState(false);

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
  const levelInfo = userProfile ? getLevelInfo(userProfile.totalXP) : null;

  const menuStyle = {
    position: "absolute", right: 0, top: "calc(100% + 8px)",
    width: "210px",
    background: "rgba(14,16,22,0.96)",
    backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 16, padding: 6, zIndex: 200,
    boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
  };

  const menuItemBase = {
    width: "100%", display: "flex", alignItems: "center", gap: 10,
    padding: "9px 12px", background: "none", border: "none",
    borderRadius: 10, color: "white", fontSize: "13px",
    fontWeight: 600, cursor: "pointer", textAlign: "left",
    fontFamily: "DM Sans, sans-serif", textDecoration: "none",
    transition: "background 0.15s",
  };

  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      background: "rgba(10,11,15,0.92)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
      height: 64, display: "flex", alignItems: "center",
    }}>
      <div style={{
        maxWidth: "1100px", margin: "0 auto",
        padding: "0 16px", width: "100%",
        display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: 12,
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(0,82,255,0.15)", border: "1px solid rgba(0,82,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            <img src="/logo.png" alt="BQ" style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={e => { e.target.style.display = "none"; e.target.parentNode.innerHTML = '<span style="color:#00d4ff;font-weight:900;font-size:12px">BQ</span>'; }} />
          </div>
          <span className="dh" style={{ color: "white", fontWeight: 900, fontSize: m ? "16px" : "18px", letterSpacing: "-0.5px" }}>
            Base<span style={{ color: "#00d4ff" }}>Quest</span>
          </span>
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: m ? 7 : 10 }}>

          {/* XP badge */}
          {isConnected && levelInfo && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: m ? "5px 9px" : "6px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10 }}>
              <Icon src={levelInfo.current.icon} size={m ? 16 : 20} style={{ filter: `drop-shadow(0 0 4px ${levelInfo.current.color})` }} />
              <div style={{ lineHeight: 1.2 }}>
                <div className="dh" style={{ color: "#00d4ff", fontWeight: 800, fontSize: m ? "11px" : "12px" }}>
                  {userProfile.totalXP.toLocaleString()} XP
                </div>
                <div className="db" style={{ color: "#8892a4", fontSize: "10px" }}>
                  Lvl {levelInfo.current.level} · {levelInfo.current.name}
                </div>
              </div>
            </div>
          )}

          {/* Wrong network */}
          {isConnected && !isCorrectNetwork && (
            <button onClick={switchNetwork} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,59,59,0.12)", border: "1px solid rgba(255,59,59,0.35)", borderRadius: 8, padding: m ? "5px 9px" : "6px 12px", color: "#ff6b6b", fontWeight: 700, fontSize: m ? "11px" : "12px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}>
              <Icon src="/warning.svg" size={13} style={{ filter: "invert(50%) sepia(90%) saturate(500%) hue-rotate(320deg)" }} />
              {m ? "Wrong Net" : "Wrong Network"}
            </button>
          )}

          {/* Connect / User menu */}
          {!isConnected ? (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowWalletMenu(v => !v)}
                disabled={isConnecting}
                style={{ display: "flex", alignItems: "center", gap: 7, background: isConnecting ? "rgba(0,82,255,0.4)" : "linear-gradient(135deg,#0052ff,#0041cc)", border: "none", borderRadius: 10, padding: m ? "8px 13px" : "9px 18px", color: "white", fontWeight: 700, fontSize: m ? "12px" : "13px", cursor: isConnecting ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(0,82,255,0.3)", fontFamily: "Syne, sans-serif" }}
              >
                {isConnecting
                  ? <><Icon src="/hourglass.svg" size={14} style={{ opacity: 0.8 }} /> Connecting...</>
                  : <><Icon src="/wallet.svg"    size={14} style={{ opacity: 0.9 }} /> {m ? "Connect" : "Connect Wallet"}</>
                }
              </button>

              {showWalletMenu && (
                <div style={menuStyle}>
                  <div className="db" style={{ padding: "7px 12px 9px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 5, color: "#5a6478", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em" }}>
                    SELECT WALLET
                  </div>
                  {WALLETS.map(w => (
                    <button key={w.id} onClick={() => { connect(w.id); setShowWalletMenu(false); }}
                      style={menuItemBase}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = "none"}
                    >
                      <Icon src={w.icon} size={18} />
                      {w.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

          ) : (
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowUserMenu(v => !v)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: m ? "7px 11px" : "8px 14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,82,255,0.28)", borderRadius: 10, color: "white", fontWeight: 600, fontSize: m ? "12px" : "13px", cursor: "pointer", fontFamily: "DM Sans, sans-serif" }}
              >
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#00c853", flexShrink: 0 }} />
                {userProfile?.usernameSet ? userProfile.username : shortAddr(address)}
              </button>

              {showUserMenu && (
                <div style={menuStyle}>
                  <div style={{ padding: "8px 12px 10px", borderBottom: "1px solid rgba(255,255,255,0.07)", marginBottom: 5 }}>
                    <div className="db" style={{ color: "#5a6478", fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em", marginBottom: 2 }}>CONNECTED</div>
                    <div className="dh" style={{ color: "white", fontSize: "13px", fontWeight: 700 }}>{shortAddr(address)}</div>
                  </div>
                  <a
                    href={`https://basescan.org/address/${address}`}
                    target="_blank" rel="noreferrer"
                    onClick={() => setShowUserMenu(false)}
                    style={{ ...menuItemBase, color: "#8892a4" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    <Icon src="/basescan.svg" size={16} style={{ opacity: 0.75 }} />
                    View on Basescan
                  </a>
                  <button
                    onClick={() => { disconnect(); setShowUserMenu(false); }}
                    style={{ ...menuItemBase, color: "#ff6b6b" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,59,59,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    <Icon src="/disconnect.svg" size={16} style={{ filter: "invert(50%) sepia(90%) saturate(500%) hue-rotate(320deg)", opacity: 0.85 }} />
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Outside click overlay */}
      {(showWalletMenu || showUserMenu) && (
        <div style={{ position: "fixed", inset: 0, zIndex: 99 }}
          onClick={() => { setShowWalletMenu(false); setShowUserMenu(false); }} />
      )}
    </nav>
  );
}
