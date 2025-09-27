'use client';

import { useEffect, useState } from 'react';

interface Stats {
  totalRevenue: number;
  activeAds: number;
  totalViews: number;
  totalClicks: number;
}

interface AdPlacement {
  id: string;
  slotId: string;
  advertiserWallet: string;
  contentType: string;
  description: string;
  price: string;
  status: string;
  viewCount: number;
  clickCount: number;
  expiresAt: string;
}

export default function PublisherDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch publisher stats and placements
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // This would fetch real data from your API
      // For demo purposes, we'll use mock data
      setStats({
        totalRevenue: 45.67,
        activeAds: 3,
        totalViews: 1234,
        totalClicks: 89
      });

      setPlacements([
        {
          id: '1',
          slotId: 'header-banner',
          advertiserWallet: '0x1234...5678',
          contentType: 'image',
          description: 'Tech Product Launch',
          price: '0.25',
          status: 'active',
          viewCount: 456,
          clickCount: 23,
          expiresAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          slotId: 'mid-article',
          advertiserWallet: '0x9876...5432',
          contentType: 'video',
          description: 'Crypto Exchange Ad',
          price: '0.15',
          status: 'active',
          viewCount: 234,
          clickCount: 12,
          expiresAt: '2024-01-14T18:45:00Z'
        },
        {
          id: '3',
          slotId: 'sidebar',
          advertiserWallet: '0xabcd...efgh',
          contentType: 'text',
          description: 'DeFi Protocol',
          price: '0.20',
          status: 'active',
          viewCount: 544,
          clickCount: 54,
          expiresAt: '2024-01-16T12:00:00Z'
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-secondary text-secondary-foreground border border-border';
      case 'pending':
        return 'bg-muted text-muted-foreground border border-border';
      case 'expired':
        return 'bg-muted text-muted-foreground border border-border';
      default:
        return 'bg-muted text-muted-foreground border border-border';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-mono">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-mono font-bold text-foreground">Ad-402 Publisher Dashboard</h1>
          <p className="text-muted-foreground mt-2 font-mono">Manage your ad slots and track performance</p>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-card p-6 border border-border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-secondary border border-border">
                <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-mono font-semibold text-card-foreground">Total Revenue</h3>
                <p className="text-3xl font-mono font-bold text-foreground">
                  ${stats?.totalRevenue?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-card p-6 border border-border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-secondary border border-border">
                <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-mono font-semibold text-card-foreground">Active Ads</h3>
                <p className="text-3xl font-mono font-bold text-foreground">
                  {stats?.activeAds || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-card p-6 border border-border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-secondary border border-border">
                <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-mono font-semibold text-card-foreground">Total Views</h3>
                <p className="text-3xl font-mono font-bold text-foreground">
                  {stats?.totalViews?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-card p-6 border border-border shadow-sm">
            <div className="flex items-center">
              <div className="p-2 bg-secondary border border-border">
                <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-mono font-semibold text-card-foreground">Click Rate</h3>
                <p className="text-3xl font-mono font-bold text-foreground">
                  {stats?.totalViews ? ((stats.totalClicks / stats.totalViews) * 100).toFixed(2) : '0'}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Ad Placements */}
        <div className="bg-card border border-border shadow-sm">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-2xl font-mono font-bold text-card-foreground">Recent Ad Placements</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
                    Ad Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
                    Advertiser
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
                    Expires
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {placements.map((placement) => (
                  <tr key={placement.id} className="hover:bg-secondary">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-mono font-medium text-card-foreground">
                          {placement.slotId}
                        </div>
                        <div className="text-sm font-mono text-muted-foreground">
                          {placement.description}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground">
                          {placement.contentType}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-card-foreground">
                        {placement.advertiserWallet}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-medium text-card-foreground">
                        ${placement.price} USDC
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-card-foreground">
                        {placement.viewCount} views
                      </div>
                      <div className="text-sm font-mono text-muted-foreground">
                        {placement.clickCount} clicks
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-mono font-semibold ${getStatusColor(placement.status)}`}>
                        {placement.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-muted-foreground">
                      {formatTimeRemaining(placement.expiresAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card p-6 border border-border shadow-sm">
            <h3 className="text-lg font-mono font-semibold text-card-foreground mb-4">Create New Ad Slot</h3>
            <p className="text-muted-foreground mb-4 font-mono">Add a new ad slot to your website to start earning revenue.</p>
            <button className="w-full bg-primary text-primary-foreground py-2 px-4 hover:bg-primary/90 transition-colors font-mono">
              Create Slot
            </button>
          </div>
          
          <div className="bg-card p-6 border border-border shadow-sm">
            <h3 className="text-lg font-mono font-semibold text-card-foreground mb-4">View Analytics</h3>
            <p className="text-muted-foreground mb-4 font-mono">Get detailed insights into your ad performance and revenue.</p>
            <button className="w-full bg-secondary text-secondary-foreground py-2 px-4 hover:bg-secondary/80 transition-colors font-mono">
              View Analytics
            </button>
          </div>
          
          <div className="bg-card p-6 border border-border shadow-sm">
            <h3 className="text-lg font-mono font-semibold text-card-foreground mb-4">Withdraw Earnings</h3>
            <p className="text-muted-foreground mb-4 font-mono">Withdraw your accumulated earnings to your wallet.</p>
            <button className="w-full bg-secondary text-secondary-foreground py-2 px-4 hover:bg-secondary/80 transition-colors font-mono">
              Withdraw
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}