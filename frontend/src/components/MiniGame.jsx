import React, { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { getGameContract, getReadProvider, shortAddr, formatEth, mmss, formatNumber } from "../utils/contracts.js";

export default function MiniGame({ wallet, quests }) {
  const { address, signer, isCorrectNetwork } = wallet;
  const { completeGame } = quests;
  const [round,       setRound]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [joining,     setJoining]     = useState(false);
  const [ending,      setEnding]      = useState(false);
  const [recentRounds,setRecentRounds]= useState([]);
  const [timeLeft,    setTimeLeft]    = useState(0);

  const fetchRound = useCallback(async () => {
    try {
      const provider = getReadProvider();
      const game     = getGameContract(provider);
      const [players, timeRem, roundNum, prizePool, hasJoined, startTime, isEnded, recent] = await Promise.all([
        game.getCurrentPlayers(), game.getRoundTimeRemaining(), game.getRoundNumber(),
        game.getCurrentPrizePool(), address ? game.hasJoinedCurrentRound(address) : Promise.resolve(false),
        game.getCurrentRoundStartTime(), game.isRoundEnded(),
        game.getRecentRounds(5),
      ]);
      setRound({ players: [...players], timeRemaining: Number(timeRem), roundNumber: Number(roundNum), prizePool, hasJoined, startTime: Number(startTime), isEnded });
      setTimeLeft(Number(timeRem));
      setRecentRounds([...recent].reverse());
    } catch { setRound(null); } finally { setLoading(false); }
  }, [address]);

  useEffect(() => { fetchRound(); const i = setInterval(fetchRound, 10000); return () => clearInterval(i); }, [fetchRound]);
  useEffect(() => {
    if (timeLeft <= 0) return;
    const i = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(i);
  }, [timeLeft]);

  const handleJoin = async () => {
    if (!signer || !address) { toast.error("Connect wallet first."); return; }
    if (!isCorrectNetwork) { toast.error("Switch to Base Mainnet."); return; }
    setJoining(true);
    const toastId = toast.loading("Joining game...");
    try {
      const game = getGameContract(signer);
      const tx   = await game.joinGame({ value: ethers.parseEther("0.0001") });
      toast.loading("Confirming...", { id: toastId });
      await tx.wait();
      toast.success("🎲 Joined! Good luck!", { id: toastId, duration: 4000 });
      await completeGame();
      await fetchRound();
    } catch (err) {
      const msg = err?.reason || err?.message || "";
      const friendly = msg.includes("already joined") ? "Already joined this round." : msg.includes("round time expired") ? "Round has expired." : msg.includes("user rejected") || err.code === 4001 ? "Transaction rejected." : "Failed to join. Try again.";
      toast.error(friendly, { id: toastId });
    } finally { setJoining(false); }
  };

  const handleEndRound = async () => {
    if (!signer) { toast.error("Connect wallet first."); return; }
    setEnding(true);
    const toastId = toast.loading("Ending round...");
    try {
      const game = getGameContract(signer);
      const tx   = await game.endRound();
      await tx.wait();
      toast.success("🏆 Round ended!", { id: toastId });
      await fetchRound();
    } catch (err) {
      toast.error(err?.reason || "Failed to end round.", { id: toastId });
    } finally { setEnding(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center"><div className="spinner spinner-lg mx-auto mb-4" /><p className="font-mono text-[#8892a4]">Loading game...</p></div>
    </div>
  );

  if (!round) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">🎲</div>
      <h2 className="font-display font-bold text-2xl text-white mb-2">Game Not Available</h2>
      <p className="font-mono text-[#8892a4]">Contract not deployed yet.</p>
    </div>
  );

  const prizeEth  = formatEth(round.prizePool);
  const winnerCut = (parseFloat(prizeEth) * 0.8).toFixed(4);
  const expired   = timeLeft === 0;

  return (
    <div className="max-w-2xl mx-auto animate-in">
      <div className="text-center mb-6">
        <h2 className="section-title">🎲 Mini-Game</h2>
        <p className="font-mono text-sm text-[#8892a4] mt-1">Join the prize pool. One random winner takes 80%.</p>
      </div>

      <div className="glass-card p-8 mb-4 text-center" style={{ border: "1px solid rgba(240,180,41,0.2)", background: "linear-gradient(135deg, #12141a, #1a1d27)" }}>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-4"
          style={{ background: "rgba(0,82,255,0.1)", border: "1px solid rgba(0,82,255,0.3)", color: "#00d4ff" }}>
          Round #{round.roundNumber}
        </div>
        <div className="timer-digit text-6xl sm:text-7xl font-bold mb-2"
          style={{ color: timeLeft < 60 ? "#ff3b3b" : timeLeft < 120 ? "#f0b429" : "#00d4ff" }}>
          {mmss(timeLeft)}
        </div>
        <p className="font-mono text-sm text-[#8892a4] mb-6">{expired ? "Round over — someone end it!" : "Time remaining"}</p>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div><p className="font-[Orbitron] text-xl font-bold text-white">{round.players.length}</p><p className="font-mono text-xs text-[#8892a4]">Players</p></div>
          <div><p className="font-[Orbitron] text-xl font-bold text-[#f0b429]">{prizeEth} ETH</p><p className="font-mono text-xs text-[#8892a4]">Prize Pool</p></div>
          <div><p className="font-[Orbitron] text-xl font-bold text-[#00c853]">{winnerCut} ETH</p><p className="font-mono text-xs text-[#8892a4]">Winner Gets</p></div>
        </div>

        {!expired && !round.hasJoined && address && (
          <button onClick={handleJoin} disabled={joining} className="btn-gold w-full text-base py-4">
            {joining ? <><span className="spinner spinner-sm" /> Joining...</> : "🎲 Join for 0.0001 ETH"}
          </button>
        )}
        {!expired && round.hasJoined && (
          <div className="py-4 font-mono text-[#00c853] text-sm">✓ You're in! Waiting for the round to end...</div>
        )}
        {expired && (
          <button onClick={handleEndRound} disabled={ending} className="btn-gold w-full text-base py-4">
            {ending ? <><span className="spinner spinner-sm" /> Ending...</> : "🏁 End Round & Pick Winner"}
          </button>
        )}
        {!address && (
          <p className="font-mono text-sm text-[#8892a4]">Connect wallet to play.</p>
        )}
      </div>

      {round.players.length > 0 && (
        <div className="glass-card p-5 mb-4">
          <h3 className="font-display font-semibold text-white mb-3">Players This Round</h3>
          <div className="flex flex-wrap gap-2">
            {round.players.map(p => (
              <span key={p} className={"badge " + (p.toLowerCase() === address?.toLowerCase() ? "badge-blue" : "badge-gray")}>
                {shortAddr(p)} {p.toLowerCase() === address?.toLowerCase() ? "· you" : ""}
              </span>
            ))}
          </div>
        </div>
      )}

      {recentRounds.length > 0 && (
        <div className="glass-card p-5">
          <h3 className="font-display font-semibold text-white mb-3">Recent Results</h3>
          <div className="space-y-2">
            {recentRounds.map(r => (
              <div key={Number(r.roundNumber)} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)" }}>
                <span className="font-mono text-xs text-[#8892a4] w-16">#{Number(r.roundNumber)}</span>
                <span className="flex-1 font-mono text-sm text-white truncate">{shortAddr(r.winner)}</span>
                <span className="badge badge-gold">{formatEth(r.prize)} ETH</span>
                <span className="font-mono text-xs text-[#8892a4]">{Number(r.playerCount)} players</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
