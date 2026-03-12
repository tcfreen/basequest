import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { getCoreContract, getReadProvider, getLevelInfo, getEthPrice } from "../utils/contracts.js";

export function useQuests(address, signer) {
  const [profile,     setProfile]     = useState(null);
  const [dailyTasks,  setDailyTasks]  = useState(null);
  const [levelInfo,   setLevelInfo]   = useState(null);
  const [ethPrice,    setEthPrice]    = useState(2500);
  const [taskLoading, setTaskLoading] = useState({});

  const loadUserData = useCallback(async () => {
    if (!address) { setProfile(null); setDailyTasks(null); setLevelInfo(null); return; }
    try {
      const provider = getReadProvider();
      const core     = getCoreContract(provider);
      const [profileRaw, dailyRaw, price] = await Promise.all([core.getUserProfile(address), core.getDailyTasks(address), getEthPrice()]);
      setEthPrice(price);
      const p = { totalXP: Number(profileRaw.totalXP), username: profileRaw.username, usernameSet: profileRaw.usernameSet, tasksCompleted: Number(profileRaw.tasksCompleted), joinedAt: Number(profileRaw.joinedAt), streakCount: Number(profileRaw.streakCount), referralCount: Number(profileRaw.referralCount), referredBy: profileRaw.referredBy };
      setProfile(p); setLevelInfo(getLevelInfo(p.totalXP));
      setDailyTasks({ gmDone: dailyRaw.gmDone, deployDone: dailyRaw.deployDone, swapDone: dailyRaw.swapDone, bridgeDone: dailyRaw.bridgeDone, gameDone: dailyRaw.gameDone, referralDone: dailyRaw.referralDone, profileDone: dailyRaw.profileDone });
    } catch {
      setProfile({ totalXP: 0, username: "", usernameSet: false, tasksCompleted: 0, joinedAt: 0, streakCount: 0, referralCount: 0, referredBy: ethers.ZeroAddress });
      setLevelInfo(getLevelInfo(0));
      setDailyTasks({ gmDone: false, deployDone: false, swapDone: false, bridgeDone: false, gameDone: false, referralDone: false, profileDone: false });
    }
  }, [address]);

  useEffect(() => { loadUserData(); const i = setInterval(loadUserData, 30000); return () => clearInterval(i); }, [loadUserData]);

  const executeTask = useCallback(async (taskId, txFn, xpAmount, taskName) => {
    if (!signer || !address) { toast.error("Connect your wallet first."); return false; }
    if (taskLoading[taskId]) return false;
    setTaskLoading(prev => ({ ...prev, [taskId]: true }));
    const toastId = toast.loading("Completing " + taskName + "...");
    try {
      const tx      = await txFn();
      toast.loading("Transaction submitted...", { id: toastId });
      const receipt = await tx.wait();
      if (receipt.status === 0) throw new Error("Transaction reverted.");
      toast.success("✅ " + taskName + " complete! +" + xpAmount + " XP", { id: toastId, duration: 5000 });
      await loadUserData();
      return true;
    } catch (err) {
      const msg = err?.reason || err?.message || "";
      const friendly = msg.includes("already done today") ? "Already completed today!" : msg.includes("already set") ? "Profile already set!" : msg.includes("already referred") ? "Address already referred." : msg.includes("cannot refer yourself") ? "Cannot refer yourself!" : msg.includes("incorrect payment") ? "Incorrect ETH amount." : msg.includes("insufficient funds") ? "Insufficient ETH balance." : msg.includes("user rejected") || err.code === 4001 ? "Transaction rejected." : msg.slice(0, 100) || "Transaction failed.";
      toast.error(friendly, { id: toastId, duration: 6000 });
      return false;
    } finally { setTaskLoading(prev => ({ ...prev, [taskId]: false })); }
  }, [signer, address, taskLoading, loadUserData]);

  const completeGM       = useCallback(async ()    => executeTask("gm",       async () => getCoreContract(signer).completeGMTask({ value: ethers.parseEther("0.0001") }), 50,  "GM Base"), [signer, executeTask]);
  const completeDeploy   = useCallback(async (c)   => { if (!ethers.isAddress(c)) { toast.error("Invalid contract address."); return false; } return executeTask("deploy",   async () => getCoreContract(signer).completeDeployTask(c, { value: ethers.parseEther("0.0002") }), 100, "Deploy Contract"); }, [signer, executeTask]);
  const completeSwap     = useCallback(async ()    => executeTask("swap",     async () => getCoreContract(signer).completeSwapTask({ value: ethers.parseEther("0.0001") }), 75,  "Swap on Base"), [signer, executeTask]);
  const completeBridge   = useCallback(async ()    => executeTask("bridge",   async () => getCoreContract(signer).completeBridgeTask({ value: ethers.parseEther("0.0002") }), 100, "Bridge to Base"), [signer, executeTask]);
  const completeGame     = useCallback(async ()    => executeTask("game",     async () => getCoreContract(signer).completeGameTask({ value: ethers.parseEther("0.0001") }), 75,  "Play Mini-Game"), [signer, executeTask]);
  const completeReferral = useCallback(async (r)   => { if (!ethers.isAddress(r)) { toast.error("Invalid referral address."); return false; } if (r.toLowerCase() === address?.toLowerCase()) { toast.error("Cannot refer yourself."); return false; } return executeTask("referral", async () => getCoreContract(signer).completeReferralTask(r, { value: ethers.parseEther("0.0001") }), 150, "Refer a Friend"); }, [signer, address, executeTask]);
  const completeProfile  = useCallback(async (u)   => { if (!u?.trim()) { toast.error("Username cannot be empty."); return false; } if (u.trim().length > 32) { toast.error("Username max 32 characters."); return false; } return executeTask("profile", async () => getCoreContract(signer).completeProfileTask(u.trim(), { value: ethers.parseEther("0.0001") }), 50, "Set Profile"); }, [signer, executeTask]);

  return { profile, dailyTasks, levelInfo, ethPrice, taskLoading, loadUserData, completeGM, completeDeploy, completeSwap, completeBridge, completeGame, completeReferral, completeProfile };
}
