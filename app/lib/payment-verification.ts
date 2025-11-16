/**
 * Payment Verification Service
 * Verifies blockchain transactions to prevent fraud
 */

import { createPublicClient, http, type Address, type Hash } from 'viem';
import { polygon, polygonAmoy } from 'viem/chains';

// Network configurations
const NETWORKS = {
  polygon: {
    chain: polygon,
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
  },
  'polygon-amoy': {
    chain: polygonAmoy,
    rpcUrl: process.env.POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
  },
} as const;

// USDC contract addresses on different networks
const USDC_ADDRESSES = {
  polygon: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359' as Address, // Native USDC on Polygon
  'polygon-amoy': '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582' as Address, // USDC on Amoy testnet
} as const;

export interface PaymentVerificationParams {
  transactionHash: Hash;
  network: 'polygon' | 'polygon-amoy';
  expectedAmount: string; // Amount in USDC (e.g., "10.50")
  expectedRecipient: Address;
  expectedPayer: Address;
}

export interface PaymentVerificationResult {
  verified: boolean;
  amount?: string;
  from?: Address;
  to?: Address;
  blockNumber?: bigint;
  timestamp?: number;
  error?: string;
}

/**
 * Verify a USDC payment transaction on the blockchain
 */
export async function verifyPayment(
  params: PaymentVerificationParams
): Promise<PaymentVerificationResult> {
  try {
    const { transactionHash, network, expectedAmount, expectedRecipient, expectedPayer } = params;

    // Get network configuration
    const networkConfig = NETWORKS[network];
    if (!networkConfig) {
      return {
        verified: false,
        error: `Unsupported network: ${network}`,
      };
    }

    // Create public client for blockchain queries
    const client = createPublicClient({
      chain: networkConfig.chain,
      transport: http(networkConfig.rpcUrl),
    });

    // Get transaction receipt
    const receipt = await client.getTransactionReceipt({
      hash: transactionHash,
    });

    // Check if transaction was successful
    if (receipt.status !== 'success') {
      return {
        verified: false,
        error: 'Transaction failed on blockchain',
      };
    }

    // Get full transaction details
    const transaction = await client.getTransaction({
      hash: transactionHash,
    });

    // Get block for timestamp
    const block = await client.getBlock({
      blockNumber: receipt.blockNumber,
    });

    // Verify the transaction is a USDC transfer
    const usdcAddress = USDC_ADDRESSES[network];

    // Check if transaction is to the USDC contract
    if (transaction.to?.toLowerCase() !== usdcAddress.toLowerCase()) {
      return {
        verified: false,
        error: 'Transaction is not a USDC transfer',
      };
    }

    // Decode the transfer event from logs
    // USDC Transfer event: Transfer(address indexed from, address indexed to, uint256 value)
    const transferEvent = receipt.logs.find(
      (log) =>
        log.address.toLowerCase() === usdcAddress.toLowerCase() &&
        log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // Transfer event signature
    );

    if (!transferEvent || !transferEvent.topics[1] || !transferEvent.topics[2]) {
      return {
        verified: false,
        error: 'No valid USDC transfer event found',
      };
    }

    // Decode transfer parameters from event
    const from = `0x${transferEvent.topics[1].slice(26)}` as Address; // Remove padding
    const to = `0x${transferEvent.topics[2].slice(26)}` as Address; // Remove padding
    const amount = BigInt(transferEvent.data);

    // USDC has 6 decimals
    const amountInUsdc = Number(amount) / 1_000_000;
    const expectedAmountInUsdc = parseFloat(expectedAmount);

    // Verify payer
    if (from.toLowerCase() !== expectedPayer.toLowerCase()) {
      return {
        verified: false,
        error: `Payer mismatch. Expected: ${expectedPayer}, Got: ${from}`,
        from,
        to,
        amount: amountInUsdc.toString(),
      };
    }

    // Verify recipient
    if (to.toLowerCase() !== expectedRecipient.toLowerCase()) {
      return {
        verified: false,
        error: `Recipient mismatch. Expected: ${expectedRecipient}, Got: ${to}`,
        from,
        to,
        amount: amountInUsdc.toString(),
      };
    }

    // Verify amount (with small tolerance for floating point errors)
    const tolerance = 0.000001; // 1 millionth of a USDC
    if (Math.abs(amountInUsdc - expectedAmountInUsdc) > tolerance) {
      return {
        verified: false,
        error: `Amount mismatch. Expected: ${expectedAmountInUsdc}, Got: ${amountInUsdc}`,
        from,
        to,
        amount: amountInUsdc.toString(),
      };
    }

    // All checks passed
    return {
      verified: true,
      amount: amountInUsdc.toString(),
      from,
      to,
      blockNumber: receipt.blockNumber,
      timestamp: Number(block.timestamp),
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      verified: false,
      error: error instanceof Error ? error.message : 'Unknown verification error',
    };
  }
}

/**
 * Check if a transaction has been confirmed with a minimum number of blocks
 */
export async function isTransactionConfirmed(
  transactionHash: Hash,
  network: 'polygon' | 'polygon-amoy',
  minConfirmations: number = 3
): Promise<boolean> {
  try {
    const networkConfig = NETWORKS[network];
    if (!networkConfig) {
      return false;
    }

    const client = createPublicClient({
      chain: networkConfig.chain,
      transport: http(networkConfig.rpcUrl),
    });

    const receipt = await client.getTransactionReceipt({
      hash: transactionHash,
    });

    const currentBlock = await client.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber;

    return confirmations >= BigInt(minConfirmations);
  } catch (error) {
    console.error('Error checking transaction confirmations:', error);
    return false;
  }
}

/**
 * Get transaction details for debugging
 */
export async function getTransactionDetails(
  transactionHash: Hash,
  network: 'polygon' | 'polygon-amoy'
): Promise<{
  success: boolean;
  transaction?: any;
  receipt?: any;
  error?: string;
}> {
  try {
    const networkConfig = NETWORKS[network];
    if (!networkConfig) {
      return {
        success: false,
        error: `Unsupported network: ${network}`,
      };
    }

    const client = createPublicClient({
      chain: networkConfig.chain,
      transport: http(networkConfig.rpcUrl),
    });

    const [transaction, receipt] = await Promise.all([
      client.getTransaction({ hash: transactionHash }),
      client.getTransactionReceipt({ hash: transactionHash }),
    ]);

    return {
      success: true,
      transaction,
      receipt,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
