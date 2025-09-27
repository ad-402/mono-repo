import lighthouse from '@lighthouse-web3/sdk';

// Lighthouse API key - you should set this in your environment variables
const LIGHTHOUSE_API_KEY = process.env.LIGHTHOUSE_API_KEY || 'your-lighthouse-api-key';

export interface UploadResult {
  success: boolean;
  hash?: string;
  url?: string;
  error?: string;
}

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  description?: string;
  slotId?: string;
  advertiserWallet?: string;
}

/**
 * Upload a file to Lighthouse storage
 */
export async function uploadToLighthouse(
  file: File,
  metadata: FileMetadata
): Promise<UploadResult> {
  try {
    // Convert File to Buffer for Lighthouse
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Lighthouse
    const uploadResponse = await lighthouse.uploadBuffer(
      buffer,
      LIGHTHOUSE_API_KEY
    );

    if (uploadResponse && uploadResponse.data && uploadResponse.data.Hash) {
      const fileHash = uploadResponse.data.Hash;
      const fileUrl = `https://gateway.lighthouse.storage/ipfs/${fileHash}`;

      // Store additional metadata on Lighthouse
      const metadataToStore = {
        name: metadata.name,
        size: metadata.size,
        type: metadata.type,
        description: metadata.description,
        slotId: metadata.slotId,
        advertiserWallet: metadata.advertiserWallet,
        uploadedAt: new Date().toISOString(),
        originalFileName: file.name,
      };

      const metadataBuffer = Buffer.from(JSON.stringify(metadataToStore, null, 2));
      const metadataResponse = await lighthouse.uploadBuffer(
        metadataBuffer,
        LIGHTHOUSE_API_KEY
      );

      return {
        success: true,
        hash: fileHash,
        url: fileUrl,
      };
    } else {
      return {
        success: false,
        error: 'Upload failed - no hash returned',
      };
    }
  } catch (error) {
    console.error('Lighthouse upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error',
    };
  }
}

/**
 * Get file metadata from Lighthouse
 */
export async function getFileMetadata(hash: string): Promise<any> {
  try {
    const response = await fetch(`https://gateway.lighthouse.storage/ipfs/${hash}`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching file metadata:', error);
    return null;
  }
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'text/plain',
  ];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 100MB',
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Allowed: JPEG, PNG, GIF, WebP, MP4, WebM, MOV, TXT',
    };
  }

  return { valid: true };
}
