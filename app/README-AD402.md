# Ad-402: Decentralized Advertising Platform

A complete full-stack decentralized advertising platform where publishers can monetize their websites instantly using x402 payments, and advertisers can place ads directly without intermediaries.

## 🚀 Features

- **Instant Payments**: Publishers receive payments instantly using x402 protocol
- **No Intermediaries**: Direct connection between publishers and advertisers
- **Real-time Analytics**: Track views, clicks, and conversions in real-time
- **Multiple Ad Formats**: Support for banner, square, sidebar, mobile, and card ads
- **Flexible Pricing**: Publishers set their own pricing and duration options
- **Global Reach**: Cryptocurrency payments enable global advertising
- **Transparent Revenue**: Clear revenue sharing with minimal platform fees

## 🏗️ Architecture

### Frontend
- **Next.js 15** with TypeScript and Tailwind CSS
- **React Components** for Ad402Provider and Ad402Slot
- **Client-side SDK** for seamless integration

### Backend
- **Next.js API Routes** for RESTful endpoints
- **Prisma ORM** with PostgreSQL database
- **File Upload** support for ad content
- **Payment Verification** using ethers.js

### Database Schema
- **Publishers**: Website owners who register ad slots
- **Ad Slots**: Available advertising spaces with pricing
- **Ad Placements**: Active advertisements with content
- **Payments**: Transaction records and revenue tracking
- **Analytics**: View and click tracking data

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd web3-ui-starter-pack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with the following variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/ad402_db"
X402_FACILITATOR_URL="https://facilitator.cdp.coinbase.com"
PLATFORM_FEE_PERCENTAGE="5"
UPLOAD_DIR="./public/uploads/ads"
MAX_FILE_SIZE="10485760"
ANALYTICS_ENABLED="true"
JWT_SECRET="your-jwt-secret-here"
ENCRYPTION_KEY="your-encryption-key-here"
NEXT_PUBLIC_API_BASE_URL="/api"
```

### Database Setup

1. **Install PostgreSQL** and create a database
2. **Update DATABASE_URL** in `.env.local`
3. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

## 🎯 Usage

### For Publishers

1. **Register Ad Slots**
   ```typescript
   import { Ad402Provider, Ad402Slot } from './components/Ad402';
   
   <Ad402Provider publisherWallet="0x...">
     <Ad402Slot
       slotId="header-banner"
       size="banner"
       price="0.25"
       durations={['1h', '6h', '24h']}
       category="technology"
     />
   </Ad402Provider>
   ```

2. **Monitor Performance**
   - Visit `/dashboard` to view analytics
   - Track revenue and ad performance
   - Manage active placements

### For Advertisers

1. **Browse Available Slots**
   - Visit publisher websites with Ad402 slots
   - Click on available ad slots to place ads

2. **Place Ads**
   - Select content type (image, video, text)
   - Upload ad content
   - Choose duration and pay instantly
   - Ads go live immediately

### For Developers

1. **Integrate Ad402 SDK**
   ```html
   <script src="/js/ad402-sdk.js"></script>
   <script>
     Ad402.init({
       publisherWallet: '0x...',
       network: 'base',
       currency: 'USDC'
     });
   </script>
   ```

2. **API Endpoints**
   - `POST /api/ad-slots` - Create ad slots
   - `GET /api/ad-slots` - Fetch available slots
   - `POST /api/ad-placements` - Place ads
   - `POST /api/ad-placements/verify-payment` - Verify payments
   - `POST /api/analytics` - Track events

## 📊 API Reference

### Ad Slots API

#### Create Ad Slot
```typescript
POST /api/ad-slots
{
  "publisherWallet": "0x...",
  "slotIdentifier": "header-banner",
  "size": "banner",
  "basePrice": "0.25",
  "durationOptions": ["1h", "6h", "24h"],
  "category": "technology",
  "websiteUrl": "https://example.com"
}
```

#### Get Ad Slots
```typescript
GET /api/ad-slots?publisherWallet=0x...&websiteUrl=https://example.com
```

### Ad Placements API

#### Create Ad Placement
```typescript
POST /api/ad-placements
FormData {
  slotId: string,
  advertiserWallet: string,
  contentType: string,
  clickUrl?: string,
  description?: string,
  duration: string,
  price: string,
  paymentHash: string,
  adFile?: File
}
```

#### Verify Payment
```typescript
POST /api/ad-placements/verify-payment
{
  "placementId": "string",
  "paymentHash": "string",
  "signature": "string",
  "advertiserWallet": "string"
}
```

### Analytics API

#### Track Event
```typescript
POST /api/analytics
{
  "placementId": "string",
  "eventType": "view" | "click" | "conversion",
  "metadata": {}
}
```

## 🎨 Components

### Ad402Provider
Wrapper component that initializes the Ad402 SDK and provides context.

```typescript
<Ad402Provider
  publisherWallet="0x..."
  network="base"
  currency="USDC"
  apiBaseUrl="/api"
>
  {children}
</Ad402Provider>
```

### Ad402Slot
Displays ad slots and handles ad placement interactions.

```typescript
<Ad402Slot
  slotId="header-banner"
  size="banner"
  price="0.25"
  durations={['1h', '6h', '24h']}
  category="technology"
  autoRegister={true}
/>
```

## 🔒 Security

- **Payment Verification**: All payments are cryptographically verified
- **File Upload Security**: Validated file types and sizes
- **Rate Limiting**: API endpoints are rate-limited
- **Input Validation**: All inputs are validated using Zod schemas
- **CORS Protection**: Proper CORS configuration

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy** automatically on push

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the production server**
   ```bash
   npm start
   ```

## 📈 Analytics

The platform includes comprehensive analytics:

- **View Tracking**: Automatic view counting
- **Click Tracking**: Click-through rate monitoring
- **Revenue Analytics**: Real-time revenue tracking
- **Performance Metrics**: Ad performance insights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- **Documentation**: Check this README and inline code comments
- **Issues**: Open an issue on GitHub
- **Discord**: Join our community Discord server

## 🔮 Roadmap

- [ ] Multi-chain support (Ethereum, Polygon, etc.)
- [ ] Advanced targeting options
- [ ] A/B testing for ads
- [ ] Mobile app SDK
- [ ] White-label solutions
- [ ] Advanced analytics dashboard
- [ ] Automated ad optimization
- [ ] Integration with popular CMS platforms

---

Built with ❤️ by the Ad-402 team

