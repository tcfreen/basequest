import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import toast from "react-hot-toast";
import { BASE_CHAIN_ID, BASE_RPC_URL } from "../utils/contracts.js";

const STORAGE_KEY = "basequest_wallet_type";

export function useWallet() {
  const [address,      setAddress]      = useState(null);
  const [provider,     setProvider]     = useState(null);
  const [signer,       setSigner]       = useState(null);
  const [chainId,      setChainId]      = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error,        setError]        = useState(null);

  const isCorrectNetwork = chainId === BASE_CHAIN_ID;

  const connect = useCallback(async (walletType = "injected") => {
    setIsConnecting(true); setError(null);
    try {
      let ethereumProvider = null;
      if (walletType === "coinbase" && window.coinbaseWalletExtension) {
        ethereumProvider = window.coinbaseWalletExtension;
      } else if (window.ethereum?.providers) {
        const providers = window.ethereum.providers;
        ethereumProvider = walletType === "metamask" ? (providers.find(p => p.isMetaMask) || providers[0]) : providers[0];
      } else {
        ethereumProvider = window.ethereum;
      }
      if (!ethereumProvider) throw new Error("No wallet detected. Install MetaMask or Coinbase Wallet.");
      const accounts = await ethereumProvider.request({ method: "eth_requestAccounts" });
      if (!accounts || accounts.length === 0) throw new Error("No accounts returned.");
      const web3Provider = new ethers.BrowserProvider(ethereumProvider);
      const web3Signer   = await web3Provider.getSigner();
      const network      = await web3Provider.getNetwork();
      const cId          = Number(network.chainId);
      setAddress(accounts[0]); setProvider(web3Provider); setSigner(web3Signer); setChainId(cId);
      localStorage.setItem(STORAGE_KEY, walletType);
      if (cId !== BASE_CHAIN_ID) { toast.error("Please switch to Base Mainnet.", { duration: 6000 }); }
      else { toast.success("Connected: " + accounts[0].slice(0,6) + "..." + accounts[0].slice(-4)); }
      ethereumProvider.on("accountsChanged", (newAccounts) => {
        if (newAccounts.length === 0) { disconnect(); } else { setAddress(newAccounts[0]); }
      });
      ethereumProvider.on("chainChanged", (hexChainId) => {
        const newCid = parseInt(hexChainId, 16);
        setChainId(newCid);
        if (newCid !== BASE_CHAIN_ID) toast.error("Wrong network. Switch to Base Mainnet.");
        else toast.success("Switched to Base Mainnet");
        new ethers.BrowserProvider(ethereumProvider).getSigner().then(s => setSigner(s)).catch(() => {});
      });
    } catch (err) {
      const msg = err?.message || "Failed to connect wallet";
      setError(msg); toast.error(msg.length > 80 ? msg.slice(0, 80) + "..." : msg);
    } finally { setIsConnecting(false); }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null); setProvider(null); setSigner(null); setChainId(null);
    localStorage.removeItem(STORAGE_KEY);
    toast("Wallet disconnected", { icon: "👋" });
  }, []);

  const switchToBase = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({ method: "wallet_switchEthereumChain", params: [{ chainId: "0x" + BASE_CHAIN_ID.toString(16) }] });
    } catch (err) {
      if (err.code === 4902) {
        try {
          await window.ethereum.request({ method: "wallet_addEthereumChain", params: [{ chainId: "0x" + BASE_CHAIN_ID.toString(16), chainName: "Base Mainnet", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: [BASE_RPC_URL], blockExplorerUrls: ["https://basescan.org"] }] });
        } catch { toast.error("Failed to add Base Mainnet."); }
      } else { toast.error("Failed to switch network."); }
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && window.ethereum) {
      window.ethereum.request({ method: "eth_accounts" })
        .then(accounts => { if (accounts?.length > 0) connect(saved); })
        .catch(() => {});
    }
  }, []);

  return { address, provider, signer, chainId, isConnecting, isCorrectNetwork, error, connect, disconnect, switchToBase };
}
