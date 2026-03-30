import { createThirdwebClient } from "thirdweb";
import { inAppWallet, createWallet } from "thirdweb/wallets";

export const thirdwebClient = createThirdwebClient({
  clientId:
    import.meta.env.VITE_THIRDWEB_CLIENT_ID ||
    "321a89162ee71061dd7a32e6304a8aef",
});

export const wallets = [
  inAppWallet({
    auth: { options: ["email", "google", "github", "passkey"] },
  }),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("io.rabby"),
];
