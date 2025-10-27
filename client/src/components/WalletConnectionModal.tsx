export function WalletConnectionModal() {
  console.warn(
    'WalletConnectionModal is deprecated. The app now uses Web3Modal for wallet connections. ' +
    'Use the useWeb3 hook and call connect() instead.'
  );
  
  return null;
}
