import { Ad402Provider, Ad402Slot } from "../components/Ad402";
import Link from "next/link";

const Home = () => {
  return (
    <Ad402Provider publisherWallet="0x742d35cc6634c0532925a3b8d000b42d8e6c2f8">
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Ad-402 Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              The future of decentralized advertising. Publishers get paid instantly, 
              advertisers place ads directly without intermediaries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/blog" 
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                View Demo Blog
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-white text-blue-600 px-8 py-3 rounded-lg border border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Publisher Dashboard
              </Link>
            </div>
          </div>

          {/* Demo Ad Slots */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Header Banner</h3>
              <Ad402Slot
                slotId="demo-header"
                size="banner"
                price="0.25"
                durations={['1h', '6h', '24h']}
                category="demo"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Square Ad</h3>
              <Ad402Slot
                slotId="demo-square"
                size="square"
                price="0.15"
                durations={['30m', '1h', '2h']}
                category="demo"
              />
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Mobile Banner</h3>
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
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Payments</h3>
              <p className="text-gray-600">
                Publishers receive payments instantly using x402 protocol. No waiting periods or complex withdrawal processes.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Intermediaries</h3>
              <p className="text-gray-600">
                Direct connection between publishers and advertisers. Lower fees, more transparency, better relationships.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-gray-600">
                Track views, clicks, and conversions in real-time. Get insights into your ad performance instantly.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Register Slots</h3>
                <p className="text-gray-600 text-sm">
                  Publishers register ad slots on their websites with pricing and availability.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">Browse & Select</h3>
                <p className="text-gray-600 text-sm">
                  Advertisers browse available slots and select the ones that fit their needs.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Pay & Place</h3>
                <p className="text-gray-600 text-sm">
                  Advertisers pay instantly using x402 and upload their ad content.
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  4
                </div>
                <h3 className="font-semibold mb-2">Go Live</h3>
                <p className="text-gray-600 text-sm">
                  Ads go live immediately and publishers start earning revenue.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center bg-blue-600 text-white rounded-lg p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join the decentralized advertising revolution today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/blog" 
                className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Try Demo
              </Link>
              <Link 
                href="/dashboard" 
                className="bg-blue-700 text-white px-8 py-3 rounded-lg hover:bg-blue-800 transition-colors"
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
