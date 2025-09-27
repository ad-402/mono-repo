# Lighthouse Storage Setup Guide

This guide explains how to set up Lighthouse storage for file uploads in the Ad402 platform.

## Prerequisites

1. **Lighthouse Account**: Sign up at [lighthouse.storage](https://lighthouse.storage)
2. **API Key**: Get your API key from the Lighthouse dashboard

## Environment Variables

Create a `.env.local` file in the app directory with the following variables:

```bash
# Lighthouse Storage Configuration
LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here

# Network Configuration
NEXT_PUBLIC_NETWORK=polygon-amoy
NEXT_PUBLIC_CURRENCY=USDC

# Publisher Configuration
NEXT_PUBLIC_PUBLISHER_WALLET=0x3c11A511598fFD31fE4f6E3BdABcC31D99C1bD10
```

## Getting Your Lighthouse API Key

1. Go to [lighthouse.storage](https://lighthouse.storage)
2. Sign up or log in to your account
3. Navigate to the API Keys section
4. Generate a new API key
5. Copy the key and add it to your `.env.local` file

## Features

### File Upload
- **Supported Formats**: Images (JPEG, PNG, GIF, WebP), Videos (MP4, WebM, MOV), Text files
- **File Size Limit**: Up to 100MB per file
- **Storage**: Files are stored on IPFS with Filecoin deals for redundancy
- **Metadata**: File metadata is stored alongside the file for easy retrieval

### Upload Process
1. User selects a file in the ad submission form
2. File is validated (size, type)
3. File is uploaded to Lighthouse/IPFS
4. File hash and URL are returned
5. Metadata is stored for future reference

### File Retrieval
Files can be accessed via:
- **IPFS Gateway**: `https://gateway.lighthouse.storage/ipfs/{hash}`
- **Direct IPFS**: Using any IPFS gateway
- **Lighthouse API**: For metadata and additional features

## Configuration Options

### Deal Parameters
The system is configured with the following deal parameters:
- **Number of Copies**: 2 (for redundancy)
- **Repair Threshold**: 28800 (8 hours)
- **Renew Threshold**: 240 (4 minutes)
- **Network**: Calibration (testnet) or Mainnet

### File Encryption
Currently set to `false` for easier access, but can be enabled for sensitive content.

## API Endpoints

### Upload File
```typescript
POST /api/ad-submissions
Content-Type: multipart/form-data

// Form data:
- slotId: string
- advertiserWallet: string
- contentType: 'image' | 'video' | 'text'
- clickUrl: string
- description: string
- duration: string
- price: string
- paymentHash: string
- adFile: File (optional)
```

### Response
```json
{
  "success": true,
  "submission": {
    "id": "sub_1234567890_abc123",
    "slotId": "slot-123",
    "advertiserWallet": "0x...",
    "fileUpload": {
      "hash": "QmHash...",
      "url": "https://gateway.lighthouse.storage/ipfs/QmHash...",
      "fileName": "ad-image.jpg",
      "fileSize": 1024000,
      "mimeType": "image/jpeg"
    },
    "status": "pending",
    "submittedAt": "2024-01-01T00:00:00.000Z",
    "expiresAt": "2024-01-01T01:00:00.000Z"
  },
  "message": "Ad submission received successfully"
}
```

## Error Handling

The system handles various error scenarios:
- **File Size Exceeded**: Returns error if file > 100MB
- **Invalid File Type**: Returns error for unsupported formats
- **Upload Failure**: Returns error if Lighthouse upload fails
- **Network Issues**: Handles network timeouts and retries

## Testing

To test the file upload functionality:

1. Start the development server: `npm run dev`
2. Navigate to `/test-ads`
3. Create a test ad slot
4. Click on the slot to submit an ad
5. Upload a test file and submit the form
6. Check the console for upload progress and results

## Production Considerations

### Security
- Store API keys securely in environment variables
- Validate all file uploads on the server side
- Implement rate limiting for uploads
- Consider file scanning for malware

### Performance
- Implement file compression for large files
- Add CDN caching for frequently accessed files
- Monitor upload success rates
- Implement retry logic for failed uploads

### Cost Management
- Monitor storage costs on Lighthouse
- Implement file cleanup for expired ads
- Consider file compression to reduce storage costs
- Set up alerts for unusual usage patterns

## Troubleshooting

### Common Issues

1. **API Key Not Working**
   - Verify the API key is correct
   - Check if the key has sufficient permissions
   - Ensure the key is not expired

2. **Upload Failures**
   - Check file size and type
   - Verify network connectivity
   - Check Lighthouse service status

3. **File Not Accessible**
   - Verify the IPFS hash is correct
   - Check if the file is still pinned
   - Try different IPFS gateways

### Support
- Lighthouse Documentation: [docs.lighthouse.storage](https://docs.lighthouse.storage)
- IPFS Documentation: [docs.ipfs.tech](https://docs.ipfs.tech)
- Filecoin Documentation: [docs.filecoin.io](https://docs.filecoin.io)
