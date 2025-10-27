import { createPublicClient, http, type Address, type Hash } from 'viem';
import { bsc, bscTestnet } from 'viem/chains';

// Create clients for BSC mainnet and testnet
const bscClient = createPublicClient({
  chain: bsc,
  transport: http('https://bsc-dataseed.binance.org/')
});

const bscTestnetClient = createPublicClient({
  chain: bscTestnet,
  transport: http('https://data-seed-prebsc-1-s1.binance.org:8545/')
});

// Get the appropriate client based on chainId
function getClient(chainId: number) {
  if (chainId === bsc.id) {
    return bscClient;
  } else if (chainId === bscTestnet.id) {
    return bscTestnetClient;
  }
  throw new Error(`Unsupported chain ID: ${chainId}`);
}

// Security logging utility
export function logSecurityEvent(event: string, details: any) {
  console.log(`[SECURITY] [${new Date().toISOString()}] ${event}`, JSON.stringify(details));
}

// Verify a transaction exists on-chain
export async function verifyTransactionExists(
  transactionHash: Hash,
  chainId: number
): Promise<{ exists: boolean; receipt?: any }> {
  try {
    const client = getClient(chainId);
    
    // Get transaction receipt
    const receipt = await client.getTransactionReceipt({
      hash: transactionHash
    });
    
    if (!receipt) {
      return { exists: false };
    }
    
    // Check if transaction was successful
    if (receipt.status !== 'success') {
      logSecurityEvent('FAILED_TRANSACTION', {
        transactionHash,
        chainId,
        status: receipt.status
      });
      return { exists: false };
    }
    
    return { exists: true, receipt };
  } catch (error) {
    logSecurityEvent('TRANSACTION_VERIFICATION_ERROR', {
      transactionHash,
      chainId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return { exists: false };
  }
}

// Verify transaction value matches expected amount
export async function verifyTransactionValue(
  transactionHash: Hash,
  chainId: number,
  expectedValue: string
): Promise<{ valid: boolean; actualValue?: string }> {
  try {
    const client = getClient(chainId);
    
    // Get transaction details
    const transaction = await client.getTransaction({
      hash: transactionHash
    });
    
    if (!transaction) {
      return { valid: false };
    }
    
    const actualValue = transaction.value.toString();
    
    // Compare values (both should be in wei)
    if (actualValue !== expectedValue) {
      logSecurityEvent('VALUE_MISMATCH', {
        transactionHash,
        chainId,
        expectedValue,
        actualValue
      });
      return { valid: false, actualValue };
    }
    
    return { valid: true, actualValue };
  } catch (error) {
    logSecurityEvent('VALUE_VERIFICATION_ERROR', {
      transactionHash,
      chainId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return { valid: false };
  }
}

// Verify a wallet address is valid
export function isValidAddress(address: string): boolean {
  // Check if it's a valid Ethereum address format
  const addressRegex = /^0x[a-fA-F0-9]{40}$/;
  return addressRegex.test(address);
}

// Verify transaction sender matches expected address
export async function verifyTransactionSender(
  transactionHash: Hash,
  chainId: number,
  expectedSender: Address
): Promise<{ valid: boolean; actualSender?: Address }> {
  try {
    const client = getClient(chainId);
    
    // Get transaction details
    const transaction = await client.getTransaction({
      hash: transactionHash
    });
    
    if (!transaction) {
      return { valid: false };
    }
    
    const actualSender = transaction.from.toLowerCase();
    const expectedLower = expectedSender.toLowerCase();
    
    if (actualSender !== expectedLower) {
      logSecurityEvent('SENDER_MISMATCH', {
        transactionHash,
        chainId,
        expectedSender: expectedLower,
        actualSender
      });
      return { valid: false, actualSender: transaction.from };
    }
    
    return { valid: true, actualSender: transaction.from };
  } catch (error) {
    logSecurityEvent('SENDER_VERIFICATION_ERROR', {
      transactionHash,
      chainId,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return { valid: false };
  }
}
