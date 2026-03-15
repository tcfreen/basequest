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
  { id: "dashboard", label: "Dashboard", icon: "/dashboard.svg" },
  { id: "quests", label: "Quests", icon: "/quests.svg" },
  { id: "bossraid", label: "Boss", icon: "/boss.svg" },
  { id: "analyzer", label: "Wallet", icon: "/wallet.svg" },
];

const ICON_BLUE = "#0082FF";

export default function App() {

  const [page, setPage] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [highlightPosition, setHighlightPosition] = useState(0);

  const wallet = useWallet();
  const quests = useQuests(wallet);

  const walletWithProfile = { ...wallet, userProfile: quests.userProfile };

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard quests={quests} wallet={wallet} setPage={setPage} />;
      case "quests":
        return <QuestBoard quests={quests} wallet={wallet} />;
      case "bossraid":
        return <BossRaid wallet={wallet} />;
      case "leaderboard":
        return <Leaderboard wallet={wallet} />;
      case "analyzer":
        return <WalletAnalyzer wallet={wallet} />;
      default:
        return <Dashboard quests={quests} wallet={wallet} setPage={setPage} />;
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0b0f",
      color: "white",
      fontFamily: "'Inter', sans-serif"
    }}>

      <Navbar wallet={walletWithProfile} />

      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "0 16px 100px"
      }}>
        {renderPage()}
      </div>

      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "24px 16px 100px",
        textAlign: "center",
        marginTop: "40px"
      }}>

        <div style={{
          display: "flex",
          justifyContent: "center",
          gap: "24px",
          marginBottom: "12px"
        }}>
          <a
            href="https://twitter.com/Jee_phoenix"
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#8892a4",
              fontSize: "13px",
              fontWeight: "600",
              textDecoration: "none"
            }}
          >
            𝕏 Contact Us
          </a>
        </div>

        <div style={{ color: "#4a5568", fontSize: "12px", marginBottom: "4px" }}>
          © 2026 BaseQuest
        </div>

        <div style={{ color: "#4a5568", fontSize: "11px" }}>
          Built with 💙 on Base
        </div>

      </div>


      <div style={{
        position: "fixed",
        bottom: "16px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: "480px",
        display: "flex",
        justifyContent: "space-between",
        background: "rgba(10,11,15,0.45)",
        borderRadius: "9999px",
        padding: "2px 0",
        backdropFilter: "blur(18px)",
        zIndex: 100
      }} className="mobile-nav">

        <div style={{
          position: "absolute",
          top: "2%",
          left: `${highlightPosition}%`,
          width: `${100 / TABS.length}%`,
          height: "96%",
          borderRadius: "9999px",
          background: "rgba(0,82,255,0.25)",
          backdropFilter: "blur(12px)",
          transition: "left 0.3s",
          zIndex: -1
        }}/>

        {TABS.map((tab, index) => (

          <div
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(tab.id);
              setHighlightPosition(index * (100 / TABS.length));
            }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              padding: "2px 0"
            }}
          >

            <img
              src={tab.icon}
              alt={tab.label}
              style={{
                width: "22px",
                height: "22px",
                marginBottom: "1px",
                filter: activeTab === tab.id
                  ? "invert(37%) sepia(98%) saturate(4869%) hue-rotate(199deg) brightness(101%) contrast(101%)"
                  : "invert(100%)"
              }}
            />

            <span style={{
              fontSize: "10px",
              fontWeight: 700,
              color: activeTab === tab.id ? ICON_BLUE : "white"
            }}>
              {tab.label}
            </span>

          </div>

        ))}

      </div>

      <style>{`

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body { background: #0a0b0f; }

        ::-webkit-scrollbar { width: 6px; height: 6px; }

        ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }

        ::-webkit-scrollbar-thumb {
          background: rgba(0,82,255,0.3);
          border-radius: 3px;
        }

        input::placeholder { color: #4a5568; }

        a { color: inherit; }

        @media (min-width: 768px) {
          .mobile-nav { display: none !important; }
        }

        @media (max-width: 767px) {
          .mobile-nav { display: flex !important; }
        }

      `}</style>

    </div>
  );
}
