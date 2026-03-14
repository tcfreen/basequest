import { useState } from "react";
import { useWallet } from "./hooks/useWallet";
import { useQuests } from "./hooks/useQuests";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import QuestBoard from "./components/QuestBoard";
import BossRaid from "./components/BossRaid";
import Leaderboard from "./components/Leaderboard";
import WalletAnalyzer from "./components/WalletAnalyzer";

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "quests", label: "Quests", icon: "🗺️" },
  { id: "bossraid", label: "Boss Raid", icon: "🐉" },
  { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
  { id: "analyzer", label: "Wallet Analyzer", icon: "🔍" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const wallet = useWallet();
  const quests = useQuests(wallet);

  const walletWithProfile = { ...wallet, userProfile: quests.userProfile };

  const renderTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard quests={quests} wallet={wallet} setActiveTab={setActiveTab} />;
      case "quests":
        return <QuestBoard quests={quests} wallet={wallet} />;
      case "bossraid":
        return <BossRaid wallet={wallet} />;
      case "leaderboard":
        return <Leaderboard wallet={wallet} />;
      case "analyzer":
        return <WalletAnalyzer wallet={wallet} />;
      default:
        return <Dashboard quests={quests} wallet={wallet} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0a0b0f",
        color: "white",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Navbar */}
      <Navbar wallet={walletWithProfile} />

      {/* Page content */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 16px 80px" }}>
        {renderTab()}
      </div>

      {/* Footer */}
      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "24px 16px 100px",
          textAlign: "center",
          marginTop: "40px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "12px" }}>
          <a
            href="https://twitter.com/Jee_phoenix"
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#8892a4",
              fontSize: "13px",
              fontWeight: "600",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8892a4")}
          >
            𝕏 Contact Us
          </a>
        </div>
        <div style={{ color: "#4a5568", fontSize: "12px", marginBottom: "4px" }}>
          © 2026 BaseQuest™ — All rights reserved.
        </div>
        <div style={{ color: "#4a5568", fontSize: "11px" }}>Built with 💙 on Base 🟦</div>
      </div>

      {/* Floating bottom nav */}
      <div
        style={{
          position: "fixed",
          bottom: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "rgba(10,11,15,0.95)",
          borderRadius: "40px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
          display: "flex",
          padding: "10px 20px",
          zIndex: 100,
          backdropFilter: "blur(20px)",
          maxWidth: "400px",
          width: "90%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        className="mobile-nav-floating"
      >
        {TABS.map((tab) => (
          <div
            key={tab.id}
            style={{
              position: "relative",
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {/* Overlay box showing current tab */}
            {activeTab === tab.id && (
              <div
                style={{
                  position: "absolute",
                  top: "-32px",
                  background: "#0052ff",
                  color: "white",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "700",
                  whiteSpace: "nowrap",
                }}
              >
                {tab.label}
              </div>
            )}

            <button
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? "#0052ff" : "transparent",
                width: "48px",
                height: "48px",
                borderRadius: "24px",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.3s",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  fontSize: "22px",
                  color: activeTab === tab.id ? "white" : "#8892a4",
                  transition: "color 0.3s",
                }}
              >
                {tab.icon}
              </span>
            </button>

            {/* Label under icon */}
            <span
              style={{
                marginTop: "4px",
                fontSize: "10px",
                color: activeTab === tab.id ? "#0052ff" : "#8892a4",
                fontWeight: activeTab === tab.id ? "700" : "400",
              }}
            >
              {tab.label.split(" ")[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Global styles */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0b0f; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
        ::-webkit-scrollbar-thumb { background: rgba(0,82,255,0.3); border-radius: 3px; }
        input::placeholder { color: #4a5568; }
        a { color: inherit; }
      `}</style>
    </div>
  );
}
