import { Ad402Provider, Ad402Slot } from '../../components/Ad402';

export default function BlogDemo() {
  return (
    <Ad402Provider publisherWallet="0x742d35cc6634c0532925a3b8d000b42d8e6c2f8">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header Ad */}
        <div className="mb-8">
          <Ad402Slot
            slotId="header-banner"
            size="banner"
            price="0.25"
            durations={['1h', '6h', '24h']}
            category="technology"
          />
        </div>

        <article className="prose lg:prose-xl">
          <h1 className="text-4xl font-bold mb-6">The Future of Decentralized Advertising</h1>
          
          <p className="text-lg text-gray-700 mb-6">
            Welcome to the future of web advertising where publishers get paid instantly and advertisers can place ads without intermediaries. 
            The Ad-402 platform revolutionizes digital advertising by leveraging x402 payments for seamless, decentralized ad placements.
          </p>
          
          <p className="text-lg text-gray-700 mb-6">
            Traditional advertising networks take significant cuts and have complex approval processes. With Ad-402, publishers can monetize 
            their content instantly, and advertisers can place ads directly using cryptocurrency payments.
          </p>
          
          {/* Mid-article ad */}
          <div className="my-8 flex justify-center">
            <Ad402Slot
              slotId="mid-article"
              size="square"
              price="0.15"
              durations={['30m', '1h', '2h']}
              category="technology"
            />
          </div>

          <h2 className="text-2xl font-bold mt-8 mb-4">How It Works</h2>
          
          <p className="text-lg text-gray-700 mb-4">
            The Ad-402 platform uses a simple but powerful mechanism:
          </p>
          
          <ol className="list-decimal list-inside space-y-2 text-lg text-gray-700 mb-6">
            <li>Publishers register ad slots on their websites</li>
            <li>Advertisers browse available slots and place ads with instant payments</li>
            <li>Ads are displayed immediately after payment confirmation</li>
            <li>Publishers receive revenue instantly, minus a small platform fee</li>
          </ol>

          <h2 className="text-2xl font-bold mt-8 mb-4">Benefits for Publishers</h2>
          
          <ul className="list-disc list-inside space-y-2 text-lg text-gray-700 mb-6">
            <li>Instant monetization of website traffic</li>
            <li>No complex approval processes</li>
            <li>Transparent pricing and revenue sharing</li>
            <li>Direct relationship with advertisers</li>
            <li>Global reach with cryptocurrency payments</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">Benefits for Advertisers</h2>
          
          <ul className="list-disc list-inside space-y-2 text-lg text-gray-700 mb-6">
            <li>Direct ad placement without intermediaries</li>
            <li>Instant ad activation after payment</li>
            <li>Transparent pricing and placement</li>
            <li>Global reach and targeting options</li>
            <li>Real-time analytics and tracking</li>
          </ul>

          <p className="text-lg text-gray-700 mb-6">
            The Ad-402 platform represents a paradigm shift in digital advertising, moving away from centralized control 
            to a decentralized, transparent, and efficient system that benefits both publishers and advertisers.
          </p>
        </article>

        {/* Sidebar */}
        <aside className="fixed right-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
          <Ad402Slot
            slotId="sidebar"
            size="sidebar"
            price="0.20"
            durations={['1h', '6h', '24h']}
            category="technology"
          />
        </aside>

        {/* Footer Ad */}
        <div className="mt-12">
          <Ad402Slot
            slotId="footer-banner"
            size="banner"
            price="0.18"
            durations={['2h', '6h', '12h']}
            category="technology"
          />
        </div>
      </div>
    </Ad402Provider>
  );
}