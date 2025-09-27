# Ad402 - Decentralized Ad Platform

A modern, decentralized advertising platform that combines blockchain payments, IPFS storage, and a sophisticated bidding system for ad slot management.

## 🚀 Overview

Ad402 is a complete advertising ecosystem that allows publishers to monetize their websites through ad slots while providing advertisers with a transparent, decentralized platform for purchasing and managing ad placements.

### Key Features

- **🎯 Ad Slot Management**: Predefined ad slots with different sizes and categories
- **💰 Crypto Payments**: USDC payments via EIP-3009 standard for secure transactions
- **🔥 Bidding System**: Competitive bidding for occupied ad slots with queue management
- **⏰ Automatic Expiration**: Time-based ad expiration with automatic queue activation
- **🌐 Decentralized Storage**: All ad data stored on IPFS via Lighthouse for persistence
- **📱 Responsive Design**: Modern, minimalistic UI that works across all devices
- **🔒 Secure**: Blockchain-based payments with wallet integration

## 🏗️ Architecture

```
Frontend (Next.js) → Payment Gateway (X402) → API Routes → Lighthouse/IPFS → Ad Serving
```

### Component Breakdown

1. **Frontend Application** (`/app`) - Next.js React application with modern UI
2. **Payment Integration** - EIP-3009 USDC payments with wallet connectivity
3. **API Layer** - Serverless functions for ad management and bidding
4. **Storage Layer** - Lighthouse/IPFS for decentralized, persistent storage
5. **Ad Serving** - Dynamic ad display with expiration and queue management

## 📁 Project Structure

```
mono-repo/
├── app/                          # Main Next.js application
│   ├── app/                      # App router pages
│   │   ├── api/                  # API routes
│   │   │   ├── ads/[slotId]/     # Ad retrieval endpoints
│   │   │   ├── upload-ad/        # Ad upload and storage
│   │   │   ├── queue-info/[slotId]/ # Bidding queue information
│   │   │   └── test-expiration/  # Testing utilities
│   │   ├── checkout/             # Payment and bidding page
│   │   ├── upload/               # Ad content upload page
│   │   ├── dashboard/            # Publisher dashboard
│   │   └── example-ads/          # Demo ad slots
│   ├── components/               # React components
│   │   ├── Ad402Slot.tsx         # Main ad slot component
│   │   ├── AdSlot.tsx            # Alternative ad slot
│   │   └── ui/                   # UI component library
│   ├── lib/                      # Utility libraries
│   │   ├── lighthouse-persistent-storage.ts # IPFS storage system
│   │   ├── adService.ts          # Ad management services
│   │   └── usdc.ts              # USDC payment utilities
│   └── types/                    # TypeScript definitions
├── mainnet-facilitator/          # Blockchain facilitator service
└── service/                      # Additional microservices
```

## 🎯 Ad Slot System

### Available Slot Types

- **Banner**: 728x90px - Header/footer placements
- **Square**: 300x250px - Sidebar/mid-content placements  
- **Mobile**: 320x60px - Mobile-optimized placements
- **Sidebar**: 160x600px - Vertical sidebar placements

### Slot Categories

- **Technology**: Tech-focused websites
- **General**: Broad audience websites
- **Demo**: Development and testing slots

## 💰 Payment & Bidding System

### Payment Flow

1. **Slot Selection**: User clicks on available ad slot
2. **Wallet Connection**: Connect Web3 wallet (MetaMask, etc.)
3. **Payment Processing**: EIP-3009 USDC payment via X402 protocol
4. **Ad Upload**: Upload ad content (images, videos)
5. **Activation**: Ad goes live immediately or joins queue

### Bidding System

- **Available Slots**: Immediate purchase at base price
- **Occupied Slots**: Bid for next available slot
- **Queue Management**: Higher bids get priority in queue
- **Automatic Activation**: Ads activate when current ad expires

## 🔧 Technical Implementation

### Storage Architecture

**Lighthouse/IPFS Integration**:
- All ad placements stored on IPFS for decentralization
- Persistent storage across server restarts and deployments
- Automatic data synchronization and caching
- 30-second cache duration for optimal performance

### API Endpoints

- `GET /api/ads/[slotId]` - Retrieve active ad for slot
- `POST /api/upload-ad` - Upload new ad placement
- `GET /api/queue-info/[slotId]` - Get bidding queue information
- `POST /api/test-expiration` - Testing utilities

### Payment Integration

- **EIP-3009 Standard**: Secure USDC token transfers
- **X402 Protocol**: Micropayment processing
- **Multi-chain Support**: Polygon network integration
- **Wallet Integration**: MetaMask, WalletConnect support

## 🚀 Deployment

### Prerequisites

- Node.js 18+
- Lighthouse.storage API key
- Vercel account (for hosting)

### Environment Variables

```bash
# Required for production
LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here

# Optional - for existing data
LIGHTHOUSE_STORAGE_HASH=your_existing_ipfs_hash
```

### Vercel Deployment

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Set Environment Variables**: Add `LIGHTHOUSE_API_KEY` in Vercel dashboard
3. **Deploy**: Vercel auto-detects Next.js and deploys
4. **Verify**: Test ad creation and persistence

### Local Development

```bash
# Install dependencies
cd app
npm install

# Set environment variables
cp .env.example .env.local
# Add your LIGHTHOUSE_API_KEY

# Start development server
npm run dev
```

## 🎨 UI/UX Design

### Design Philosophy

- **Modern & Minimalistic**: Clean, professional appearance
- **Monospaced Typography**: JetBrains Mono for digital aesthetic
- **Sharp Edges**: No border-radius for crisp, technical look
- **Black/White/Gray Palette**: High contrast, accessible design
- **Responsive**: Optimized for all device sizes

### Key Components

- **Ad402Slot**: Main ad slot component with bidding integration
- **Checkout Page**: Streamlined payment and bidding interface
- **Upload Page**: Simple ad content upload with progress tracking
- **Dashboard**: Publisher analytics and slot management

## 🔒 Security Features

- **Blockchain Payments**: Immutable payment records
- **IPFS Storage**: Decentralized, tamper-proof ad storage
- **Wallet Integration**: Secure Web3 authentication
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive data sanitization

## 📊 Analytics & Monitoring

- **Ad Performance**: Click tracking and view analytics
- **Revenue Tracking**: Payment and bidding analytics
- **Queue Management**: Bidding system performance metrics
- **Storage Monitoring**: IPFS storage health and performance

## 🧪 Testing

### Test Endpoints

- `/api/test-expiration` - Create test ads with custom expiration
- `/example-ads` - Demo page with all slot types
- `/test-ads` - Development testing interface

### Test Scenarios

1. **Ad Creation**: Upload and display ads
2. **Bidding System**: Test queue management and priority
3. **Expiration**: Verify automatic ad expiration
4. **Persistence**: Confirm data survives server restarts

## 🌟 Production Features

### Scalability

- **Serverless Architecture**: Auto-scaling with Vercel
- **IPFS Distribution**: Global content delivery
- **Caching Strategy**: Optimized performance with 30s cache
- **Queue Management**: Efficient bidding system

### Reliability

- **Decentralized Storage**: No single point of failure
- **Automatic Failover**: Graceful error handling
- **Data Persistence**: Survives deployments and restarts
- **Real-time Updates**: Live queue and ad status

## 📈 Future Enhancements

- **Multi-chain Support**: Ethereum, Arbitrum, Optimism
- **Advanced Analytics**: Detailed performance metrics
- **A/B Testing**: Ad content optimization
- **Mobile App**: Native mobile applications
- **API Marketplace**: Third-party integrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in `/app/DEPLOYMENT.md`
- Review the API documentation in `/app/README-AD402.md`

---

**Ad402** - Revolutionizing digital advertising through decentralization and blockchain technology. 🚀