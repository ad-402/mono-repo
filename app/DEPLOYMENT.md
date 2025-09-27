# Deployment Guide for Ad402 Platform

## 🚀 Vercel Deployment Setup

### 1. Environment Variables

Set these environment variables in your Vercel dashboard:

```bash
# Required: Lighthouse API Key
LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here

# Optional: Initial storage hash (will be created automatically if not set)
LIGHTHOUSE_STORAGE_HASH=your_initial_storage_hash_here

# Optional: Public API key for client-side operations
NEXT_PUBLIC_LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
```

### 2. Lighthouse API Key Setup

1. Go to [Lighthouse Storage](https://lighthouse.storage/)
2. Create an account and get your API key
3. Add the API key to your Vercel environment variables

### 3. Storage System

The platform now uses **persistent storage** via Lighthouse/IPFS:

- ✅ **Persistent**: Data survives serverless function restarts
- ✅ **Decentralized**: Stored on IPFS network
- ✅ **Scalable**: No database required
- ✅ **Reliable**: Data is replicated across IPFS nodes

### 4. How It Works

1. **Ad Placements**: Stored as JSON on IPFS
2. **Queue System**: Bidding queues persisted on IPFS
3. **Expiration**: Automatic cleanup of expired ads
4. **Caching**: 30-second cache for performance

### 5. Data Structure

```typescript
interface StorageData {
  activePlacements: Record<string, StoredPlacement>;
  slotQueues: Record<string, SlotQueue>;
  lastUpdated: string;
}
```

### 6. Deployment Steps

1. **Push to GitHub**: Ensure all code is committed
2. **Connect to Vercel**: Link your GitHub repository
3. **Set Environment Variables**: Add Lighthouse API key
4. **Deploy**: Vercel will build and deploy automatically

### 7. Post-Deployment

After deployment, the system will:
- Initialize with empty storage if no `LIGHTHOUSE_STORAGE_HASH` is set
- Create test placements automatically
- Start accepting ad bookings and bids

### 8. Monitoring

- Check Vercel function logs for any errors
- Monitor Lighthouse storage usage
- Verify ad placements are persisting correctly

## 🔧 Development vs Production

### Development
- Uses in-memory storage for fast iteration
- Test data initializes automatically
- No external dependencies

### Production
- Uses Lighthouse/IPFS for persistence
- Requires Lighthouse API key
- Data survives deployments and restarts

## 🚨 Important Notes

1. **API Key Security**: Never commit API keys to git
2. **Storage Hash**: The system will create and manage storage hashes automatically
3. **Performance**: 30-second caching reduces IPFS calls
4. **Backup**: IPFS provides natural data redundancy

## 🆘 Troubleshooting

### Common Issues

1. **"Lighthouse API key not configured"**
   - Check environment variables in Vercel
   - Ensure `LIGHTHOUSE_API_KEY` is set

2. **"Failed to fetch storage data"**
   - Check network connectivity
   - Verify Lighthouse API key is valid

3. **Ads not persisting**
   - Check Vercel function logs
   - Verify storage hash is being created

### Support

For issues with:
- **Lighthouse**: Check [Lighthouse Documentation](https://docs.lighthouse.storage/)
- **Vercel**: Check [Vercel Documentation](https://vercel.com/docs)
- **This Platform**: Check the codebase and logs
