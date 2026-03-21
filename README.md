# 🚀 Ad402 - Decentralized Advertising Platform

> **A revolutionary Web3 advertising ecosystem that combines blockchain payments, IPFS storage, and competitive bidding for transparent, decentralized ad slot management.**


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.2-blue)](https://www.typescriptlang.org/)
[![IPFS](https://img.shields.io/badge/IPFS-Lighthouse-green)](https://lighthouse.storage/)
[![USDC](https://img.shields.io/badge/Payment-USDC-orange)](https://www.centre.io/)


## 🎯 **What is Ad402?**

Ad402 is a complete **decentralized advertising ecosystem** that revolutionizes how publishers monetize their websites and how advertisers purchase ad space. Built for the modern Web3 era, it combines:

- **🔗 Blockchain Payments**: Secure USDC transactions via EIP-3009 standard
- **🌐 IPFS Storage**: Decentralized, persistent ad storage via Lighthouse
- **⚡ Competitive Bidding**: Real-time bidding system for ad slots
- **📱 Modern UI**: Beautiful, responsive interface with Web3 integration
- **🛠️ Developer SDK**: Easy integration for any website

## 🏆 **Hackathon Achievement**

This project was built as a **complete Web3 advertising solution** demonstrating:
- **Full-stack development** with Next.js and TypeScript
- **Blockchain integration** with USDC payments and wallet connectivity
- **Decentralized storage** using IPFS and Lighthouse
- **Production-ready deployment** on Vercel
- **Developer-friendly SDK** for easy integration

## 🏗️ **Architecture Overview**

## 🏆 **Hackathon Achievement**

This project was built as a **complete Web3 advertising solution** demonstrating:
- **Full-stack development** with Next.js and TypeScript
- **Blockchain integration** with USDC payments and wallet connectivity
- **Decentralized storage** using IPFS and Lighthouse
- **Production-ready deployment** on Vercel
- **Developer-friendly SDK** for easy integration

## 🏗️ **Architecture Overview**

<img width="639" height="384" alt="SS 2025-09-28 at 09 02 25" src="https://github.com/user-attachments/assets/b8a9e991-52d9-40cd-a9f7-d59bdc2efb5e" />


```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Payment       │    │   Storage       │
│   (Next.js)     │◄──►│   (X402/USDC)   │◄──►│   (IPFS/LH)     │
│   React App     │    │   Blockchain    │    │   Decentralized │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Ad402 SDK     │    │   API Routes    │    │   Queue System  │
│   Integration   │    │   Serverless    │    │   Bidding       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📁 **Project Structure**

```
mono-repo/
├── 🎨 app/                          # Main Next.js Application
│   ├── app/                         # App Router Pages
│   │   ├── api/                     # Serverless API Routes
│   │   │   ├── ads/[slotId]/        # Ad retrieval & display
│   │   │   ├── upload-ad/           # Ad upload & storage
│   │   │   ├── queue-info/[slotId]/ # Bidding queue management
│   │   │   ├── analytics/           # Ad performance tracking
│   │   │   └── test-expiration/     # Testing utilities
│   │   ├── checkout/                # Payment & bidding interface
│   │   ├── upload/                  # Ad content upload page
│   │   ├── dashboard/               # Publisher analytics
│   │   └── example-ads/             # Demo ad slots
│   ├── components/                  # React Components
│   │   ├── Ad402Slot.tsx            # Main ad slot component
│   │   ├── AdSlot.tsx               # Alternative ad slot
│   │   ├── WalletConnectModal.tsx   # Web3 wallet integration
│   │   └── ui/                      # UI component library
│   ├── lib/                         # Core Libraries
│   │   ├── lighthouse.ts            # IPFS storage system
│   │   ├── adService.ts             # Ad management services
│   │   ├── usdc.ts                  # USDC payment utilities
│   │   └── walletConnect.ts         # Wallet integration
│   └── types/                       # TypeScript definitions
├── 📦 ad402-sdk/                    # Developer SDK Package
│   ├── src/                         # SDK Source Code
│   │   ├── components/              # React components
│   │   │   ├── Ad402Provider.tsx    # Context provider
│   │   │   └── Ad402Slot.tsx        # Ad slot component
│   │   ├── types/                   # TypeScript types
│   │   └── utils/                   # Utility functions
│   ├── examples/                    # Integration examples
│   │   ├── basic-usage.tsx          # Basic integration
│   │   └── nextjs-example.tsx       # Next.js example
│   └── dist/                        # Built SDK package
├── ⚡ mainnet-facilitator/          # Blockchain Facilitator
│   └── index.ts                     # Payment processing service
└── 🔧 service/                      # Microservices
    ├── src/                         # Service source code
    └── routes/                      # API routes
```
### 🔗 **Links**
- **Website**: [https://ad402.io](https://ad402.vercel.app)
- **SDK Package**: [npmjs.com/package/ad402-sdk](https://www.npmjs.com/package/ad402-sdk)
## 🚀 **Key Features**

## 🚀 **Key Features**

### 💰 **Payment System**
- **USDC Payments**: EIP-3009 standard for secure transactions
- **X402 Protocol**: Micropayment processing
- **Multi-wallet Support**: MetaMask, WalletConnect, and more
- **Polygon Network**: Fast, low-cost transactions

### 💰 **Payment System**
- **USDC Payments**: EIP-3009 standard for secure transactions
- **X402 Protocol**: Micropayment processing
- **Multi-wallet Support**: MetaMask, WalletConnect, and more
- **Polygon Network**: Fast, low-cost transactions

### 🎯 **Ad Slot Management**
- **Predefined Sizes**: Banner (728x90), Square (300x250), Mobile (320x60), Sidebar (160x600)
- **Categories**: Technology, General, Demo slots
- **Real-time Status**: Live ad availability and expiration
- **Automatic Expiration**: Time-based ad lifecycle management

### ⚡ **Bidding System**
- **Available Slots**: Immediate purchase at base price
- **Occupied Slots**: Competitive bidding for next available slot
- **Queue Management**: Higher bids get priority
- **Automatic Activation**: Ads activate when current ad expires

### 🌐 **Decentralized Storage**
- **IPFS Integration**: All ads stored on IPFS via Lighthouse
- **Persistent Storage**: Data survives server restarts and deployments
- **Global Distribution**: Content delivered from IPFS network
- **30-second Cache**: Optimized performance with caching

## 📦 **Ad402 SDK**

The Ad402 SDK makes it incredibly easy to integrate decentralized advertising into any website:

### 🎯 **Quick Integration**

```tsx
// 1. Install the SDK
npm install ad402-sdk

// 2. Wrap your app with Ad402Provider
import { Ad402Provider } from 'ad402-sdk';

export default function RootLayout({ children }) {
  return (
    <Ad402Provider
      config={{
        websiteId: 'your-website-id',
        walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
        apiBaseUrl: 'https://ad402.io',
      }}
    >
      {children}
    </Ad402Provider>
  );
}

// 3. Add ad slots to your pages
import { Ad402Slot } from 'ad402-sdk';

export default function HomePage() {
  return (
    <div>
      <h1>Welcome to My Website</h1>
      
      {/* Header banner ad */}
      <Ad402Slot
        slotId="header-banner"
        size="banner"
        price="0.25"
        category="technology"
      />
      
      <main>
        <p>Your content here...</p>
      </main>
      
      {/* Sidebar ad */}
      <Ad402Slot
        slotId="sidebar-ad"
        size="sidebar"
        price="0.15"
        category="general"
      />
    </div>
  );
}
```

### 🎨 **Advanced Configuration**

```tsx
const advancedConfig = {
  websiteId: 'your-website-id',
  walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  apiBaseUrl: 'https://ad402.io',
  theme: {
    primaryColor: '#1a1a1a',
    backgroundColor: '#f8f9fa',
    textColor: '#333333',
    borderColor: '#dee2e6',
    fontFamily: 'Inter, sans-serif',
    borderRadius: 8
  },
  payment: {
    networks: ['polygon', 'ethereum'],
    defaultNetwork: 'polygon',
    recipientAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'
  },
  defaultSlotConfig: {
    durations: ['1h', '6h', '24h', '7d'],
    clickable: true
  }
};
```

### 🔧 **Available Ad Slot Sizes**

| Size | Dimensions | Best For |
|------|------------|----------|
| **banner** | 728x90px | Headers, footers |
| **square** | 300x250px | Sidebars, mid-content |
| **mobile** | 320x60px | Mobile devices |
| **sidebar** | 160x600px | Vertical sidebars |

## 🛠️ **Technical Implementation**

### 🔗 **Blockchain Integration**
- **EIP-3009 Standard**: Secure USDC token transfers
- **X402 Protocol**: Micropayment processing for small transactions
- **Polygon Network**: Fast, low-cost transactions
- **Wallet Integration**: MetaMask, WalletConnect, and other Web3 wallets

### 🌐 **Storage Architecture**
- **Lighthouse/IPFS**: Decentralized storage for all ad content
- **HTTP-based Storage**: Eliminates native module dependencies
- **Persistent Data**: Survives serverless function invocations
- **Global CDN**: Content delivered from IPFS network

### ⚡ **API Endpoints**
- `GET /api/ads/[slotId]` - Retrieve active ad for slot
- `POST /api/upload-ad` - Upload new ad placement
- `GET /api/queue-info/[slotId]` - Get bidding queue information
- `POST /api/analytics/ad-view` - Track ad views
- `POST /api/analytics/ad-click` - Track ad clicks
- `GET /api/health` - System health monitoring

## 🚀 **Getting Started**

### 📋 **Prerequisites**
- Node.js 18+
- Lighthouse.storage API key
- Web3 wallet (MetaMask, etc.)
- USDC on Polygon network

### 🔧 **Local Development**

```bash
# Clone the repository
git clone https://github.com/ad402/mono-repo.git
cd mono-repo

# Install dependencies for the main app
cd app
npm install

# Set up environment variables
cp .env.example .env.local
# Add your LIGHTHOUSE_API_KEY

# Start development server
npm run dev
```

### 📦 **SDK Development**

```bash
# Navigate to SDK directory
cd ad402-sdk

# Install dependencies
npm install

# Build the SDK
npm run build

# Watch for changes during development
npm run dev
```

### 🌐 **Production Deployment**

#### **Vercel Deployment (Recommended)**

1. **Connect Repository**: Link your GitHub repo to Vercel
2. **Set Environment Variables**:
   ```bash
   LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
   ```
3. **Deploy**: Vercel auto-detects Next.js and deploys
4. **Verify**: Test ad creation and persistence

#### **Environment Variables**

```bash
# Required for production
LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here

# Optional - for existing data
LIGHTHOUSE_STORAGE_HASH=your_existing_ipfs_hash
```

## 🎨 **UI/UX Design**

### 🎯 **Design Philosophy**
- **Modern & Minimalistic**: Clean, professional appearance
- **Monospaced Typography**: JetBrains Mono for digital aesthetic
- **Sharp Edges**: No border-radius for crisp, technical look
- **Black/White/Gray Palette**: High contrast, accessible design
- **Responsive**: Optimized for all device sizes

### 🧩 **Key Components**
- **Ad402Slot**: Main ad slot component with bidding integration
- **Checkout Page**: Streamlined payment and bidding interface
- **Upload Page**: Simple ad content upload with progress tracking
- **Dashboard**: Publisher analytics and slot management

## 🔒 **Security Features**

- **Blockchain Payments**: Immutable payment records on-chain
- **IPFS Storage**: Decentralized, tamper-proof ad storage
- **Wallet Integration**: Secure Web3 authentication
- **Rate Limiting**: API protection against abuse
- **Input Validation**: Comprehensive data sanitization
- **CORS Protection**: Proper cross-origin resource sharing

## 📊 **Analytics & Monitoring**

- **Ad Performance**: Click tracking and view analytics
- **Revenue Tracking**: Payment and bidding analytics
- **Queue Management**: Bidding system performance metrics
- **Storage Monitoring**: IPFS storage health and performance
- **Real-time Updates**: Live ad status and queue information

## 🧪 **Testing**

### 🎯 **Test Endpoints**
- `/api/test-expiration` - Create test ads with custom expiration
- `/example-ads` - Demo page with all slot types
- `/test-ads` - Development testing interface

### 🔍 **Test Scenarios**
1. **Ad Creation**: Upload and display ads
2. **Bidding System**: Test queue management and priority
3. **Expiration**: Verify automatic ad expiration
4. **Persistence**: Confirm data survives server restarts
5. **Payment Flow**: Test USDC transactions

## 🌟 **Production Features**

### ⚡ **Scalability**
- **Serverless Architecture**: Auto-scaling with Vercel
- **IPFS Distribution**: Global content delivery
- **Caching Strategy**: Optimized performance with 30s cache
- **Queue Management**: Efficient bidding system

### 🛡️ **Reliability**
- **Decentralized Storage**: No single point of failure
- **Automatic Failover**: Graceful error handling
- **Data Persistence**: Survives deployments and restarts
- **Real-time Updates**: Live queue and ad status

## 📈 **Future Enhancements**

- **Multi-chain Support**: Ethereum, Arbitrum, Optimism
- **Advanced Analytics**: Detailed performance metrics
- **A/B Testing**: Ad content optimization
- **Mobile App**: Native mobile applications
- **API Marketplace**: Third-party integrations
- **AI-powered Targeting**: Smart ad placement
- **NFT Integration**: Unique ad experiences

## 🤝 **Contributing**

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow our coding standards
4. **Test thoroughly**: Ensure all tests pass
5. **Submit a pull request**: Describe your changes clearly

### 🎯 **Development Guidelines**
- Use TypeScript for all new code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure mobile responsiveness

## 📄 **License**

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support & Resources**

### 📖 **Documentation**
- [SDK Documentation](ad402-sdk/README.md) - Complete SDK integration guide
- [Deployment Guide](app/PRODUCTION-DEPLOYMENT-GUIDE.md) - Production deployment instructions
- [API Documentation](app/README-AD402.md) - API endpoints and usage

### 🐛 **Issues & Support**
- [GitHub Issues](https://github.com/ad402/mono-repo/issues) - Report bugs and request features
- [Discord Community](https://discord.gg/ad402) - Join our developer community
- [Email Support](mailto:support@ad402.io) - Direct support contact

### 🔗 **Links**
- **Website**: [https://ad402.io](https://ad402.vercel.app)
- **SDK Package**: [npmjs.com/package/ad402-sdk](https://www.npmjs.com/package/ad402-sdk)


## 🎉 **Ready to Get Started?**

**For Publishers**: Integrate the Ad402 SDK into your website and start earning from ad slots in minutes.

**For Advertisers**: Purchase ad space with USDC and reach your target audience through our decentralized platform.

**For Developers**: Build on top of our open-source platform and contribute to the future of decentralized advertising.

---

**Ad402** - *Revolutionizing digital advertising through decentralization and blockchain technology.* 🚀

*Built with ❤️ for the Web3 community*

