import { ConnectButton as ThirdwebConnectButton } from "thirdweb/react";
import { thirdwebClient, wallets } from "../lib/thirdweb";

export default function ConnectButton() {
  return (
    <ThirdwebConnectButton
      client={thirdwebClient}
      wallets={wallets}
      connectButton={{
        label: "Sign In",
        className:
          "!text-xs !font-medium !px-3 !py-1.5 !rounded-lg !bg-[#FF9900] !text-white hover:!bg-[#FF9900]/90 !transition-colors !cursor-pointer !border-none",
      }}
      theme="dark"
      connectModal={{
        size: "compact",
        title: "Sign in to x402 Bazaar",
        showThirdwebBranding: false,
      }}
    />
  );
}
