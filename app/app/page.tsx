import { Ad402Provider, Ad402Slot } from "../components/Ad402";
import Link from "next/link";

const Home = () => {
  return (
    <Ad402Provider publisherWallet="0x6d63C3DD44983CddEeA8cB2e730b82daE2E91E32">
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-mono font-bold text-foreground mb-6">
              Ad-402 Platform
            </h1>
            <p className="text-xl font-mono text-muted-foreground mb-8 max-w-3xl mx-auto">
              The future of decentralized advertising. Publishers get paid instantly, 
              advertisers place ads directly without intermediaries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/blog" 
                className="bg-primary text-primary-foreground px-8 py-3 hover:bg-primary/90 transition-colors font-mono"
              >
                View Demo Blog
              </Link>
              <Link 
                href="/example-ads" 
                className="bg-background text-foreground px-8 py-3 border border-border hover:bg-secondary transition-colors font-mono"
              >
                See Ad Examples
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-background text-foreground px-8 py-3 border border-border hover:bg-secondary transition-colors font-mono"
              >
                Publisher Dashboard
              </Link>
            </div>
          </div>

          {/* Demo Ad Slots */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-card p-6 border border-border shadow-sm">
              <h3 className="text-lg font-mono font-semibold mb-4 text-card-foreground">Header Banner</h3>
              <Ad402Slot
                slotId="demo-header"
                size="banner"
                price="0.25"
                durations={['1h', '6h', '24h']}
                category="demo"
              />
            </div>
            
            <div className="bg-card p-6 border border-border shadow-sm">
              <h3 className="text-lg font-mono font-semibold mb-4 text-card-foreground">Square Ad</h3>
              <Ad402Slot
                slotId="demo-square"
                size="square"
                price="0.15"
                durations={['30m', '1h', '2h']}
                category="demo"
              />
            </div>
            
            <div className="bg-card p-6 border border-border shadow-sm">
              <h3 className="text-lg font-mono font-semibold mb-4 text-card-foreground">Mobile Banner</h3>
              <Ad402Slot
                slotId="demo-mobile"
                size="mobile"
                price="0.10"
                durations={['1h', '6h', '12h']}
                category="demo"
              />
            </div>
          </div>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-secondary w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-border">
                <svg className="w-8 h-8 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-mono font-semibold mb-2 text-foreground">Instant Payments</h3>
              <p className="text-muted-foreground font-mono">
                Publishers receive payments instantly using x402 protocol. No waiting periods or complex withdrawal processes.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-secondary w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-border">
                <svg className="w-8 h-8 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-mono font-semibold mb-2 text-foreground">No Intermediaries</h3>
              <p className="text-muted-foreground font-mono">
                Direct connection between publishers and advertisers. Lower fees, more transparency, better relationships.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-secondary w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-border">
                <svg className="w-8 h-8 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-mono font-semibold mb-2 text-foreground">Real-time Analytics</h3>
              <p className="text-muted-foreground font-mono">
                Track views, clicks, and conversions in real-time. Get insights into your ad performance instantly.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-card border border-border shadow-sm p-8 mb-16">
            <h2 className="text-3xl font-mono font-bold text-center mb-8 text-card-foreground">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-primary text-primary-foreground w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-mono font-bold">
                  1
                </div>
                <h3 className="font-mono font-semibold mb-2 text-foreground">Register Slots</h3>
                <p className="text-muted-foreground text-sm font-mono">
                  Publishers register ad slots on their websites with pricing and availability.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary text-primary-foreground w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-mono font-bold">
                  2
                </div>
                <h3 className="font-mono font-semibold mb-2 text-foreground">Browse & Select</h3>
                <p className="text-muted-foreground text-sm font-mono">
                  Advertisers browse available slots and select the ones that fit their needs.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary text-primary-foreground w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-mono font-bold">
                  3
                </div>
                <h3 className="font-mono font-semibold mb-2 text-foreground">Pay & Place</h3>
                <p className="text-muted-foreground text-sm font-mono">
                  Advertisers pay instantly using x402 and upload their ad content.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-primary text-primary-foreground w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-mono font-bold">
                  4
                </div>
                <h3 className="font-mono font-semibold mb-2 text-foreground">Go Live</h3>
                <p className="text-muted-foreground text-sm font-mono">
                  Ads go live immediately and publishers start earning revenue.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-primary text-primary-foreground p-12 border border-border">
            <h2 className="text-3xl font-mono font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 font-mono opacity-90">
              Join the decentralized advertising revolution today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/blog" 
                className="bg-background text-foreground px-8 py-3 hover:bg-secondary transition-colors font-mono border border-border"
              >
                Try Demo
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-secondary text-secondary-foreground px-8 py-3 hover:bg-secondary/80 transition-colors font-mono border border-border"
              >
                Start Publishing
              </Link>
            </div>
          </div>
        </div>
      </main>
    </Ad402Provider>
  );
};

export default Home;
