/**
 * Storage Configuration Manager
 * Handles persistent storage of configuration values in the database
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const STORAGE_KEYS = {
  LIGHTHOUSE_HASH: 'lighthouse_storage_hash',
} as const;

/**
 * Get a configuration value from the database
 */
export async function getStorageConfig(key: string): Promise<string | null> {
  try {
    const config = await prisma.storageConfig.findUnique({
      where: { key },
    });
    return config?.value || null;
  } catch (error) {
    console.error(`Error fetching storage config for key ${key}:`, error);
    return null;
  }
}

/**
 * Set a configuration value in the database
 */
export async function setStorageConfig(
  key: string,
  value: string,
  description?: string
): Promise<void> {
  try {
    await prisma.storageConfig.upsert({
      where: { key },
      update: {
        value,
        description: description || undefined,
      },
      create: {
        key,
        value,
        description: description || undefined,
      },
    });
  } catch (error) {
    console.error(`Error setting storage config for key ${key}:`, error);
    throw error;
  }
}

/**
 * Get the current Lighthouse storage hash
 */
export async function getLighthouseHash(): Promise<string> {
  const hash = await getStorageConfig(STORAGE_KEYS.LIGHTHOUSE_HASH);

  // Fallback to environment variable or default
  if (!hash) {
    const envHash = process.env.LIGHTHOUSE_STORAGE_HASH;
    const defaultHash = 'QmPq7ugnMazhVVVko9ZU7LxFgM7U1Zs3Ly5tat7hMJ8aYA';
    const initialHash = envHash || defaultHash;

    // Save the initial hash to database
    await setStorageConfig(
      STORAGE_KEYS.LIGHTHOUSE_HASH,
      initialHash,
      'IPFS hash for Lighthouse persistent storage'
    );

    return initialHash;
  }

  return hash;
}

/**
 * Update the Lighthouse storage hash
 */
export async function updateLighthouseHash(newHash: string): Promise<void> {
  await setStorageConfig(
    STORAGE_KEYS.LIGHTHOUSE_HASH,
    newHash,
    'IPFS hash for Lighthouse persistent storage'
  );
}
