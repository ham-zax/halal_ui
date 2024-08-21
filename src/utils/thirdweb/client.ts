import { createThirdwebClient } from "thirdweb";
import { createWallet, inAppWallet, walletConnect } from 'thirdweb/wallets'

const clientId = '29f19124888f01d6e964aee5a0d211f1';

const client = createThirdwebClient({ clientId: '29f19124888f01d6e964aee5a0d211f1' });

if (!clientId) {
  throw new Error("No client ID provided");
}

export { client };
const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  walletConnect(),
  inAppWallet({
    auth: {
      options: [
        "email",
        "google",
        "apple",
        "facebook",
        "phone",
      ],
    },
  }),
];

export { wallets };