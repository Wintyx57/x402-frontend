import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit';

export default function ConnectButton() {
  return (
    <RainbowConnectButton
      chainStatus="icon"
      showBalance={false}
      accountStatus="avatar"
    />
  );
}
