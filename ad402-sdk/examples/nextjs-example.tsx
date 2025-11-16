// Example: Next.js App Router Integration
// This example shows how to integrate Ad402 SDK with Next.js App Router

// app/layout.tsx
import { Ad402Provider } from '@ad402-sdk';
import './globals.css';

export const metadata = {
  title: 'My Website with Ad402',
  description: 'A website with decentralized ad slots',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Ad402Provider
          config={{
            websiteId: process.env.NEXT_PUBLIC_AD402_WEBSITE_ID || 'demo-website',
            walletAddress: process.env.NEXT_PUBLIC_AD402_WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
            apiBaseUrl: process.env.NEXT_PUBLIC_AD402_API_BASE_URL || 'https://ad402.io',
            theme: {
              primaryColor: '#000000',
              backgroundColor: '#ffffff',
              textColor: '#000000',
              borderColor: '#e5e5e5',
              fontFamily: 'JetBrains Mono, monospace',
              borderRadius: 0
            }
          }}
        >
          {children}
        </Ad402Provider>
      </body>
    </html>
  );
}

// app/page.tsx
import { Ad402Slot } from '@ad402/sdk';

export default function HomePage() {
  return (
    <div className="container">
      <header>
        <h1>Welcome to My Website</h1>
        
        {/* Header banner ad */}
        <Ad402Slot
          slotId="header-banner"
          size="banner"
          price="0.25"
          category="technology"
          className="header-ad"
        />
      </header>

      <main className="main-content">
        <article>
          <h2>Latest News</h2>
          <p>Your content here...</p>
          
          {/* Mid-content ad */}
          <Ad402Slot
            slotId="mid-content-ad"
            size="square"
            price="0.15"
            category="general"
            className="mid-content-ad"
          />
          
          <p>More content...</p>
        </article>

        <aside className="sidebar">
          <h3>Sidebar</h3>
          
          {/* Sidebar ad */}
          <Ad402Slot
            slotId="sidebar-ad"
            size="sidebar"
            price="0.12"
            category="general"
            className="sidebar-ad"
          />
        </aside>
      </main>

      <footer>
        {/* Footer banner ad */}
        <Ad402Slot
          slotId="footer-banner"
          size="banner"
          price="0.20"
          category="general"
          className="footer-ad"
        />
      </footer>
    </div>
  );
}

// app/blog/page.tsx
import { Ad402Slot } from '@ad402/sdk';

export default function BlogPage() {
  return (
    <div className="blog-container">
      <h1>Blog</h1>
      
      {/* Blog header ad */}
      <Ad402Slot
        slotId="blog-header"
        size="banner"
        price="0.25"
        category="general"
      />
      
      <div className="blog-posts">
        <article className="blog-post">
          <h2>Blog Post Title</h2>
          <p>Blog post content...</p>
          
          {/* Mid-article ad */}
          <Ad402Slot
            slotId="mid-article-ad"
            size="square"
            price="0.18"
            category="general"
          />
          
          <p>More blog content...</p>
        </article>
      </div>
    </div>
  );
}

// app/globals.css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.main-content {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.main-content article {
  flex: 1;
}

.sidebar {
  width: 200px;
}

.header-ad,
.footer-ad {
  margin: 20px 0;
}

.mid-content-ad {
  margin: 20px 0;
  text-align: center;
}

.sidebar-ad {
  margin-top: 20px;
}

.blog-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.blog-posts {
  margin-top: 20px;
}

.blog-post {
  margin-bottom: 40px;
}

/* Responsive design */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
  }
}

// .env.local
// NEXT_PUBLIC_AD402_WEBSITE_ID=your-website-id
// NEXT_PUBLIC_AD402_WALLET_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
// NEXT_PUBLIC_AD402_API_BASE_URL=https://ad402.io
