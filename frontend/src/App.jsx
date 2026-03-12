import React, { useState } from "react";
import Navbar       from "./components/Navbar.jsx";
import Dashboard    from "./components/Dashboard.jsx";
import QuestBoard   from "./components/QuestBoard.jsx";
import MiniGame     from "./components/MiniGame.jsx";
import Leaderboard  from "./components/Leaderboard.jsx";
import WalletAnalyzer from "./components/WalletAnalyzer.jsx";
import ActivityFeed from "./components/ActivityFeed.jsx";
import { useWallet }      from "./hooks/useWallet.js";
import { useQuests }      from "./hooks/useQuests.js";
import { useLeaderboard } from "./hooks/useLeaderboard.js";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const wallet      = useWallet();
  const quests      = useQuests(wallet.address, wallet.signer);
  const leaderboard = useLeaderboard(wallet.address);

  const navProps = {
    address: wallet.address, isConnecting: wallet.isConnecting,
    isCorrectNetwork: wallet.isCorrectNetwork,
    profile: quests.profile, levelInfo: quests.levelInfo,
    onConnect: wallet.connect, onDisconnect: wallet.disconnect,
    onSwitchNetwork: wallet.switchToBase,
    activeTab, setActiveTab,
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0b0f" }}>
      <Navbar {...navProps} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === "dashboard"   && <Dashboard   wallet={wallet} quests={quests} leaderboard={leaderboard} setActiveTab={setActiveTab} />}
        {activeTab === "quests"      && <QuestBoard  wallet={wallet} quests={quests} />}
        {activeTab === "game"        && <MiniGame    wallet={wallet} quests={quests} />}
        {activeTab === "leaderboard" && <Leaderboard wallet={wallet} leaderboard={leaderboard} />}
        {activeTab === "analyzer"    && <WalletAnalyzer wallet={wallet} />}
      </main>
    </div>
  );
}
