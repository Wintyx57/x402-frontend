// Tracks wallet connect / disconnect events to PostHog.
// Mounted once inside <Providers> so it has access to wagmi's useAccount.
// Renders nothing — pure side effect.
import { useEffect, useRef } from "react";
import { useAccount } from "wagmi";
import { track, identifyWallet, reset } from "../analytics";

export default function WalletTracker() {
  const { address, isConnected } = useAccount();
  const previousAddressRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    const previous = previousAddressRef.current;
    if (isConnected && address && address !== previous) {
      identifyWallet(address);
      track("wallet_connected", {
        wallet: address.toLowerCase(),
      });
      previousAddressRef.current = address;
    } else if (!isConnected && previous) {
      reset();
      previousAddressRef.current = undefined;
    }
  }, [address, isConnected]);

  return null;
}
