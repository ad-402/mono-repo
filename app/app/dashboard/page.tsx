'use client';

import { useState } from 'react';

// ─── Mock data grounded in master-research.md ─────────────────────────────────

const PUBLISHER = {
  name: 'mcp-weather-api',
  wallet: '0x3c11A511598fFD31fE4f6E3BdABcC31D99C1bD10',
  network: 'Base',
  sdkVersion: '@ad402/sdk v0.4.2',
  tier: 'Growth',
  slotsTotal: 12,
  slotsActive: 7,
};

const REVENUE = {
  total: 2_847.63,
  change: '+23.4%',
  pending: 412.50,
  settled: 2_435.13,
  avgCPM: 58.40, // ChatGPT launched ads at $60 CPM — agent CPMs are 3-5x legacy
  cpmChange: '+12.1%',
  takeRate: 15, // AD-402 take rate is 15-20%, deliberately below Koah's 30%
  x402Txns: 12_847,
  avgTxn: 0.22,
  avgGas: '<$0.01',
  stripeSettled: 318.20,
};

const TRAFFIC = {
  totalImpressions: 847_293,
  change: '+18.2%',
  agentPercent: 73,
  humanPercent: 27,
  mcpCalls: 612_480,
  webImpressions: 234_813,
  uniqueAgents: 4_218,
  // Agent framework breakdown (from research: LangGraph 38M, CrewAI 12M, OpenAI 10.3M)
  frameworks: [
    { name: 'LangGraph', share: 41, calls: 251_117 },
    { name: 'OpenAI Agents SDK', share: 24, calls: 146_995 },
    { name: 'CrewAI', share: 18, calls: 110_246 },
    { name: 'Claude Code', share: 11, calls: 67_373 },
    { name: 'Other', share: 6, calls: 36_749 },
  ],
  // Agent intent signals (from research: headphone research, flight booking, DeFi yield)
  intents: [
    { intent: 'headphone-research', impressions: 34_200, ctr: 6.2, rpm: 58.40, topBidder: 'Bose' },
    { intent: 'defi-yield-comparison', impressions: 28_100, ctr: 5.8, rpm: 52.10, topBidder: 'Aave' },
    { intent: 'flight-booking', impressions: 22_800, ctr: 4.9, rpm: 44.30, topBidder: 'Kayak' },
    { intent: 'crypto-trading', impressions: 19_400, ctr: 4.1, rpm: 38.80, topBidder: 'Coinbase Wallet' },
    { intent: 'code-assistance', impressions: 15_600, ctr: 3.2, rpm: 28.50, topBidder: 'Cursor' },
    { intent: 'shopping-comparison', impressions: 12_300, ctr: 5.1, rpm: 48.20, topBidder: 'Shopify' },
  ],
};

const SLOTS = [
  {
    id: 'get_market_data',
    type: 'MCP Tool',
    format: 'Sponsored Result',
    model: 'per-call',
    price: '$0.001',
    freeTier: '100/day',
    fallback: 'ads',
    status: 'active',
    impressions: 234_102,
    revenue: 892.40,
    agentShare: 89,
    protocol: 'x402',
  },
  {
    id: 'search_flights',
    type: 'MCP Tool',
    format: 'Promoted Listing',
    model: 'per-call',
    price: '$0.005',
    freeTier: '50/day',
    fallback: 'ads',
    status: 'active',
    impressions: 187_430,
    revenue: 724.15,
    agentShare: 94,
    protocol: 'x402',
  },
  {
    id: 'header-banner',
    type: 'Web Surface',
    format: 'Banner 728×90',
    model: 'CPM',
    price: '$58.00',
    freeTier: '—',
    fallback: '—',
    status: 'active',
    impressions: 156_200,
    revenue: 498.30,
    agentShare: 31,
    protocol: 'Stripe MPP',
  },
  {
    id: 'yield_comparison',
    type: 'MCP Tool',
    format: 'Sponsored Result',
    model: 'per-call',
    price: '$0.003',
    freeTier: '200/day',
    fallback: 'ads',
    status: 'active',
    impressions: 67_200,
    revenue: 201.60,
    agentShare: 97,
    protocol: 'x402',
  },
  {
    id: 'sidebar-square',
    type: 'Web Surface',
    format: 'Square 300×250',
    model: 'CPM',
    price: '$42.00',
    freeTier: '—',
    fallback: '—',
    status: 'paused',
    impressions: 98_440,
    revenue: 312.80,
    agentShare: 28,
    protocol: 'Stripe MPP',
  },
];

const BIDS = [
  {
    id: 'bid-1',
    advertiser: '0xBose...7a3F',
    brand: 'Bose',
    targetSlot: 'search_flights',
    bidAmount: '0.008',
    context: 'headphone-research, audio-gear',
    duration: '7 days',
    submittedAt: '2 hours ago',
    disclosure: 'Sponsored recommendation by Bose',
  },
  {
    id: 'bid-2',
    advertiser: '0xAave...1b2C',
    brand: 'Aave Protocol',
    targetSlot: 'yield_comparison',
    bidAmount: '0.005',
    context: 'defi-yield, lending-protocol',
    duration: '14 days',
    submittedAt: '5 hours ago',
    disclosure: 'Sponsored by Aave — DeFi lending',
  },
  {
    id: 'bid-3',
    advertiser: '0xCoinb...9d4E',
    brand: 'Coinbase Wallet',
    targetSlot: 'get_market_data',
    bidAmount: '0.002',
    context: 'crypto-trading, market-data',
    duration: '30 days',
    submittedAt: '1 day ago',
    disclosure: 'Sponsored by Coinbase Wallet',
  },
];

const SETTLEMENTS = [
  { hash: '0x8f2a...c4d1', from: 'Bose', amount: '12.50', slot: 'search_flights', rail: 'x402', chain: 'Base', gas: '$0.003', time: '12 min ago', confirmations: 847 },
  { hash: '0x3b7e...a9f2', from: 'Aave', amount: '8.40', slot: 'yield_comparison', rail: 'x402', chain: 'Base', gas: '$0.002', time: '28 min ago', confirmations: 612 },
  { hash: 'pi_3Qx...7kL2', from: 'Kayak', amount: '42.00', slot: 'header-banner', rail: 'Stripe MPP', chain: '—', gas: '—', time: '1 hr ago', confirmations: 0 },
  { hash: '0xd1c4...6e8b', from: 'Coinbase Wallet', amount: '3.20', slot: 'get_market_data', rail: 'x402', chain: 'Base', gas: '$0.001', time: '2 hrs ago', confirmations: 1_204 },
  { hash: '0xa5f9...2d7c', from: 'Uniswap V4', amount: '18.90', slot: 'yield_comparison', rail: 'x402', chain: 'Base', gas: '$0.003', time: '4 hrs ago', confirmations: 2_108 },
  { hash: 'pi_8Rn...4mQ9', from: 'Shopify', amount: '28.00', slot: 'header-banner', rail: 'Stripe MPP', chain: '—', gas: '—', time: '6 hrs ago', confirmations: 0 },
];

// ─── Page Component ───────────────────────────────────────────────────────────

export default function PublisherDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'agents' | 'slots' | 'bids' | 'settlements' | 'integrate'>('overview');

  const tabs = [
    { id: 'overview' as const, label: 'Overview' },
    { id: 'agents' as const, label: 'Agent Traffic' },
    { id: 'slots' as const, label: 'Ad Slots' },
    { id: 'bids' as const, label: `Bids (${BIDS.length})` },
    { id: 'settlements' as const, label: 'Settlements' },
    { id: 'integrate' as const, label: 'Integrate' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-sans font-bold text-foreground tracking-tight">Publisher Dashboard</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-sm text-muted-foreground font-mono">{PUBLISHER.wallet.slice(0, 6)}...{PUBLISHER.wallet.slice(-4)}</span>
              <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 border border-accent/30 font-mono">Base</span>
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 border border-border font-mono">{PUBLISHER.sdkVersion}</span>
              <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 border border-border font-mono">{REVENUE.takeRate}% take rate</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="bg-accent text-accent-foreground px-4 py-2 text-sm font-sans hover:bg-accent/90 transition-colors">
              Withdraw ${REVENUE.pending.toFixed(2)}
            </button>
            <button className="bg-secondary text-secondary-foreground px-4 py-2 text-sm font-sans border border-border hover:bg-secondary/80 transition-colors">
              Settings
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-sans whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'text-foreground border-b-2 border-accent font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'agents' && <AgentTrafficTab />}
        {activeTab === 'slots' && <SlotsTab />}
        {activeTab === 'bids' && <BidsTab />}
        {activeTab === 'settlements' && <SettlementsTab />}
        {activeTab === 'integrate' && <IntegrateTab />}
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Revenue" value={`$${REVENUE.total.toLocaleString()}`} sub={`${REVENUE.change} this month`} accent />
        <StatCard label="Avg CPM" value={`$${REVENUE.avgCPM}`} sub="3–5× legacy display rates" />
        <StatCard label="Agent Traffic" value={`${TRAFFIC.agentPercent}%`} sub={`${TRAFFIC.uniqueAgents.toLocaleString()} unique agents`} />
        <StatCard label="MCP Tool Calls" value={TRAFFIC.mcpCalls.toLocaleString()} sub={`${TRAFFIC.totalImpressions.toLocaleString()} total imp`} />
      </div>

      {/* The Agentic Web Story */}
      <div className="terminal-card p-6 border-accent/20">
        <div className="flex items-start gap-4">
          <div className="bg-accent/20 border border-accent/30 p-3 shrink-0">
            <span className="text-2xl">🤖</span>
          </div>
          <div>
            <h2 className="text-lg font-sans font-semibold text-foreground">Built for the Agentic Web</h2>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-mono text-foreground">73%</span> of your traffic comes from AI agents — LangGraph, OpenAI Agents SDK, CrewAI, Claude Code.
              These agents browse, research, and purchase on behalf of users. Legacy ad networks can&apos;t reach them.
              AD-402 gives you revenue from both worlds: <span className="font-mono text-foreground">x402</span> micropayments for agent calls,
              <span className="font-mono text-foreground">Stripe MPP</span> for human web surfaces.
            </p>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <MiniStat label="Agent CPM" value="$58.40" />
              <MiniStat label="Human CPM" value="$12.80" />
              <MiniStat label="Agent CTR" value="4.7% avg" />
            </div>
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Agent Intent Signals */}
        <div className="terminal-card">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-sans font-semibold text-foreground">Agent Intent Signals</h2>
            <p className="text-xs text-muted-foreground mt-1">Context-based targeting from agent task — no cookies, no tracking pixels, no surveillance</p>
          </div>
          <div className="p-6 space-y-3">
            {TRAFFIC.intents.slice(0, 5).map((i) => (
              <div key={i.intent} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="min-w-0">
                  <span className="text-sm font-mono text-foreground">{i.intent}</span>
                  <span className="text-xs text-muted-foreground ml-2">{i.topBidder}</span>
                </div>
                <div className="flex gap-4 text-right shrink-0">
                  <span className="text-xs text-muted-foreground">{i.ctr}% CTR</span>
                  <span className="text-sm font-mono text-foreground">${i.rpm}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settlement Rails */}
        <div className="terminal-card">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-sans font-semibold text-foreground">Settlement Rails</h2>
            <p className="text-xs text-muted-foreground mt-1">x402 for agent micropayments, Stripe MPP for human web surfaces</p>
          </div>
          <div className="p-6 space-y-5">
            {/* x402 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-sans font-semibold text-foreground">x402 (USDC on Base)</span>
                  <span className="text-xs bg-accent/20 text-accent-foreground px-1.5 py-0.5 border border-accent/30 font-mono">primary</span>
                </div>
                <span className="text-sm font-mono font-semibold text-foreground">${(REVENUE.settled - REVENUE.stripeSettled).toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <MiniStat label="Transactions" value={REVENUE.x402Txns.toLocaleString()} />
                <MiniStat label="Avg per txn" value={`$${REVENUE.avgTxn}`} />
                <MiniStat label="Avg gas" value={REVENUE.avgGas} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">EIP-3009 transferWithAuthorization. Settlement final. Sub-cent gas on Base L2.</p>
            </div>
            <div className="border-t border-border" />
            {/* Stripe MPP */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-sans font-semibold text-foreground">Stripe MPP</span>
                  <span className="text-xs bg-secondary text-muted-foreground px-1.5 py-0.5 border border-border font-mono">fallback</span>
                </div>
                <span className="text-sm font-mono font-semibold text-foreground">${REVENUE.stripeSettled.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Session-based streaming payments. Radar fraud detection. Refundable. Used for web surfaces where agents aren&apos;t paying directly.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top slots mini table */}
      <div className="terminal-card">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-sans font-semibold text-foreground">Top Slots</h2>
          <button onClick={() => {}} className="text-sm text-muted-foreground hover:text-foreground transition-colors font-sans">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-secondary/50">
              <tr>
                {['Slot', 'Type', 'Model', 'Impressions', 'Revenue', 'Agent %', 'Rail'].map((h) => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {SLOTS.filter(s => s.status === 'active').slice(0, 4).map((slot) => (
                <tr key={slot.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-3 text-sm font-mono text-foreground">{slot.id}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{slot.type}</td>
                  <td className="px-6 py-3"><span className="text-xs font-mono bg-secondary px-2 py-0.5 border border-border">{slot.model} @ {slot.price}</span></td>
                  <td className="px-6 py-3 text-sm font-mono text-foreground">{slot.impressions.toLocaleString()}</td>
                  <td className="px-6 py-3 text-sm font-mono font-semibold text-foreground">${slot.revenue.toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-secondary overflow-hidden"><div className="h-full bg-accent" style={{ width: `${slot.agentShare}%` }} /></div>
                      <span className="text-xs font-mono text-muted-foreground">{slot.agentShare}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-3"><span className={`text-xs font-mono px-1.5 py-0.5 border ${slot.protocol === 'x402' ? 'bg-accent/20 border-accent/30 text-accent-foreground' : 'bg-secondary border-border text-muted-foreground'}`}>{slot.protocol}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Agent Traffic Tab ────────────────────────────────────────────────────────

function AgentTrafficTab() {
  return (
    <div className="space-y-8">
      {/* Headline stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Agent Impressions" value={TRAFFIC.mcpCalls.toLocaleString()} sub={`${TRAFFIC.agentPercent}% of total traffic`} accent />
        <StatCard label="Human Impressions" value={TRAFFIC.webImpressions.toLocaleString()} sub={`${TRAFFIC.humanPercent}% of total traffic`} />
        <StatCard label="Unique Agents" value={TRAFFIC.uniqueAgents.toLocaleString()} sub="Distinct agent identities" />
        <StatCard label="Agent CTR" value="4.7%" sub="vs 0.35% legacy display avg" />
      </div>

      {/* The Why */}
      <div className="terminal-card p-6">
        <h2 className="text-lg font-sans font-semibold text-foreground mb-2">Why Agent Traffic Matters</h2>
        <p className="text-sm text-muted-foreground">
          AI agents now mediate a growing share of consumer decisions. ChatGPT serves <span className="font-mono text-foreground">600M+ weekly users</span>.
          Cursor hit <span className="font-mono text-foreground">$1B+ ARR</span> with zero marketing. Claude Code is at <span className="font-mono text-foreground">$2.5B annualized</span>.
          When a user asks an agent to &quot;find the best noise-cancelling headphones under $300,&quot; the agent&apos;s recommendation <em>is</em> the ad slot.
          Legacy ad networks have zero reach into these moments. AD-402 captures both sides.
        </p>
      </div>

      {/* Framework breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="terminal-card">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-sans font-semibold text-foreground">Agent Framework Breakdown</h2>
            <p className="text-xs text-muted-foreground mt-1">Which agent frameworks are calling your MCP tools</p>
          </div>
          <div className="p-6 space-y-3">
            {TRAFFIC.frameworks.map((f) => (
              <div key={f.name} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-sans text-foreground">{f.name}</span>
                  <span className="font-mono text-muted-foreground">{f.calls.toLocaleString()} calls ({f.share}%)</span>
                </div>
                <div className="w-full h-2 bg-secondary overflow-hidden">
                  <div className="h-full bg-accent transition-all" style={{ width: `${f.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Intent Signals - Full */}
        <div className="terminal-card">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-sans font-semibold text-foreground">Agent Intent Signals</h2>
            <p className="text-xs text-muted-foreground mt-1">What agents are researching when they call your tools</p>
          </div>
          <div className="p-6 space-y-3">
            {TRAFFIC.intents.map((i) => (
              <div key={i.intent} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div className="min-w-0">
                  <div className="text-sm font-mono text-foreground">{i.intent}</div>
                  <div className="text-xs text-muted-foreground">Top bidder: {i.topBidder} · {i.impressions.toLocaleString()} imp</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-mono font-semibold text-foreground">${i.rpm} RPM</div>
                  <div className="text-xs text-muted-foreground">{i.ctr}% CTR</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* The MCP ecosystem context */}
      <div className="terminal-card p-6">
        <h2 className="text-lg font-sans font-semibold text-foreground mb-3">The Agentic App Stack</h2>
        <p className="text-xs text-muted-foreground mb-4">MCP has 97M+ monthly SDK downloads, 16,000+ servers. AD-402 is Layer 9 — the missing monetization layer.</p>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { n: '1', l: 'Foundation Models', ex: 'Anthropic, OpenAI' },
            { n: '2', l: 'Agent Frameworks', ex: 'LangGraph, CrewAI' },
            { n: '3', l: 'Tool Connectivity', ex: 'MCP, A2A' },
            { n: '4', l: 'Memory', ex: 'Mem0, Hyperspell' },
            { n: '5', l: 'Execution', ex: 'Browserbase, E2B' },
            { n: '6', l: 'Identity & Auth', ex: 'Alter, 1Password' },
            { n: '7', l: 'Observability', ex: 'Langfuse, Braintrust' },
            { n: '8', l: 'Security', ex: 'Clam, AgentSeal' },
            { n: '9', l: 'Monetization', ex: 'AD-402 ← YOU', highlight: true },
            { n: '10', l: 'Deployment', ex: 'Vercel, Fly.io' },
            { n: '11', l: 'Governance', ex: 'Compliance, Policy' },
          ].map((layer) => (
            <div
              key={layer.n}
              className={`p-2 border text-center ${
                layer.highlight
                  ? 'bg-accent/20 border-accent/40'
                  : 'bg-secondary/30 border-border/50'
              }`}
            >
              <div className="text-xs font-mono text-muted-foreground">Layer {layer.n}</div>
              <div className={`text-xs font-sans font-semibold mt-0.5 ${layer.highlight ? 'text-foreground' : 'text-foreground'}`}>{layer.l}</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{layer.ex}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Slots Tab ────────────────────────────────────────────────────────────────

function SlotsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-sans font-semibold text-foreground">Ad Slots</h2>
          <p className="text-sm text-muted-foreground">{PUBLISHER.slotsActive} active / {PUBLISHER.slotsTotal} total — you control format, pricing, and targeting</p>
        </div>
        <button className="bg-accent text-accent-foreground px-4 py-2 text-sm font-sans hover:bg-accent/90 transition-colors">
          + Create Slot
        </button>
      </div>

      <div className="space-y-4">
        {SLOTS.map((slot) => (
          <div key={slot.id} className="terminal-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="text-lg font-mono font-semibold text-foreground">{slot.id}</h3>
                  <span className={`text-xs px-2 py-0.5 font-mono ${
                    slot.status === 'active' ? 'bg-accent/20 text-accent-foreground border border-accent/30' : 'bg-secondary text-muted-foreground border border-border'
                  }`}>{slot.status}</span>
                  <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 border border-border font-mono">{slot.type}</span>
                  <span className={`text-xs px-2 py-0.5 font-mono border ${slot.protocol === 'x402' ? 'bg-accent/20 border-accent/30 text-accent-foreground' : 'bg-secondary border-border text-muted-foreground'}`}>{slot.protocol}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div><span className="text-muted-foreground text-xs">Format</span><p className="font-mono text-foreground">{slot.format}</p></div>
                  <div><span className="text-muted-foreground text-xs">Model</span><p className="font-mono text-foreground">{slot.model} @ {slot.price}</p></div>
                  <div><span className="text-muted-foreground text-xs">Free Tier</span><p className="font-mono text-foreground">{slot.freeTier}</p></div>
                  <div><span className="text-muted-foreground text-xs">Fallback</span><p className="font-mono text-foreground">{slot.fallback}</p></div>
                  <div><span className="text-muted-foreground text-xs">Agent Share</span>
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-1.5 bg-secondary overflow-hidden"><div className="h-full bg-accent" style={{ width: `${slot.agentShare}%` }} /></div>
                      <span className="font-mono text-foreground text-xs">{slot.agentShare}%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-6 text-right shrink-0">
                <div><p className="text-xs text-muted-foreground">Impressions</p><p className="text-lg font-mono font-semibold text-foreground">{slot.impressions.toLocaleString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Revenue</p><p className="text-lg font-mono font-semibold text-foreground">${slot.revenue.toFixed(2)}</p></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Bids Tab ─────────────────────────────────────────────────────────────────

function BidsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-sans font-semibold text-foreground">Advertiser Bids</h2>
        <p className="text-sm text-muted-foreground">Crypto-native brands bidding for your ad slots. You approve — AD-402 never dictates placement.</p>
      </div>

      <div className="space-y-4">
        {BIDS.map((bid) => (
          <div key={bid.id} className="terminal-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-sans font-semibold text-foreground">{bid.brand}</h3>
                  <span className="text-xs font-mono text-muted-foreground">{bid.advertiser}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div><span className="text-muted-foreground text-xs">Target Slot</span><p className="font-mono text-foreground">{bid.targetSlot}</p></div>
                  <div><span className="text-muted-foreground text-xs">Bid</span><p className="font-mono text-foreground font-semibold">${bid.bidAmount} USDC/call</p></div>
                  <div><span className="text-muted-foreground text-xs">Duration</span><p className="font-mono text-foreground">{bid.duration}</p></div>
                  <div><span className="text-muted-foreground text-xs">Intent Context</span><p className="font-mono text-foreground text-xs">{bid.context}</p></div>
                </div>
                <div className="mt-3 p-2 bg-secondary/50 border border-border">
                  <span className="text-xs text-muted-foreground">AdDisclosure: </span>
                  <span className="text-xs font-mono text-foreground">&quot;{bid.disclosure}&quot;</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Submitted {bid.submittedAt}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button className="bg-accent text-accent-foreground px-4 py-2 text-sm font-sans hover:bg-accent/90 transition-colors">Approve</button>
                <button className="bg-secondary text-secondary-foreground px-4 py-2 text-sm font-sans border border-border hover:bg-secondary/80 transition-colors">Reject</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settlements Tab ──────────────────────────────────────────────────────────

function SettlementsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-sans font-semibold text-foreground">Settlement History</h2>
          <p className="text-sm text-muted-foreground">x402 on-chain + Stripe MPP off-chain settlements</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Settled</p>
          <p className="text-2xl font-mono font-bold text-foreground">${REVENUE.settled.toLocaleString()}</p>
        </div>
      </div>

      <div className="terminal-card overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-secondary/50">
            <tr>
              {['Tx / ID', 'Advertiser', 'Amount', 'Slot', 'Rail', 'Chain', 'Gas', 'Time'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-sans font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {SETTLEMENTS.map((tx) => (
              <tr key={tx.hash} className="hover:bg-secondary/30 transition-colors">
                <td className="px-4 py-3 text-sm font-mono text-accent">{tx.hash}</td>
                <td className="px-4 py-3 text-sm font-sans text-foreground">{tx.from}</td>
                <td className="px-4 py-3 text-sm font-mono font-semibold text-foreground">${tx.amount}</td>
                <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{tx.slot}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-mono px-1.5 py-0.5 border ${tx.rail === 'x402' ? 'bg-accent/20 border-accent/30 text-accent-foreground' : 'bg-secondary border-border text-muted-foreground'}`}>{tx.rail}</span>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{tx.chain}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{tx.gas}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{tx.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Integrate Tab ────────────────────────────────────────────────────────────

function IntegrateTab() {
  const mcpSnippet = `import { monetize } from '@ad402/sdk';

// Wrap any MCP tool — one function call
server.tool('get_market_data', monetize({
  model: 'per-call',
  price: 0.001,        // $0.001 USDC per call
  freeTier: 100,       // 100 free calls/day
  fallback: 'ads'      // no wallet → sponsored result
}), async (args) => {
  return getMarketData(args.symbol);
});

// The fallback: 'ads' pattern solves cold-start:
// - Agent has wallet? → pays $0.001 via x402, gets raw data
// - Agent has no wallet? → gets data + sponsored result
// - Publisher ALWAYS earns. Agent ALWAYS gets data.`;

  const webSnippet = `import { Ad402Provider, Ad402Slot } from '@ad402/sdk';

// Drop-in React components — you control the format
export default function App() {
  return (
    <Ad402Provider
      publisherWallet="${PUBLISHER.wallet}"
      network="base"
      settlement="x402"       // or "stripe-mpp" for web
    >
      <Ad402Slot
        slotId="header-banner"
        size="banner"
        price="0.25"
        category="technology"
        disclosure="Sponsored"  // AdDisclosure — mandatory
      />
    </Ad402Provider>
  );
}`;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-sans font-semibold text-foreground">Integrate AD-402</h2>
        <p className="text-sm text-muted-foreground">One npm install. Define your slots. Start earning USDC in minutes. You control everything.</p>
      </div>

      {/* Install */}
      <div className="terminal-card p-6">
        <h3 className="text-lg font-sans font-semibold text-foreground mb-3">1. Install</h3>
        <div className="bg-foreground/5 border border-border p-4">
          <code className="text-sm font-mono text-foreground">$ npm install @ad402/sdk</code>
        </div>
        <p className="text-xs text-muted-foreground mt-2">Works with Express, Next.js, any MCP server. Apache 2.0 licensed.</p>
      </div>

      {/* MCP */}
      <div className="terminal-card p-6">
        <div className="mb-4">
          <h3 className="text-lg font-sans font-semibold text-foreground">2a. MCP Server — The <span className="font-mono">monetize()</span> Pattern</h3>
          <p className="text-sm text-muted-foreground mt-1">
            16,000+ MCP servers exist. Fewer than 5% generate revenue. This is how you change that.
          </p>
        </div>
        <div className="bg-foreground/5 border border-border p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-foreground whitespace-pre">{mcpSnippet}</pre>
        </div>
      </div>

      {/* Web App */}
      <div className="terminal-card p-6">
        <div className="mb-4">
          <h3 className="text-lg font-sans font-semibold text-foreground">2b. Web App — React Components</h3>
          <p className="text-sm text-muted-foreground mt-1">
            For human-facing surfaces. AD-402 gives you building blocks — you decide format, frequency, and targeting model.
          </p>
        </div>
        <div className="bg-foreground/5 border border-border p-4 overflow-x-auto">
          <pre className="text-sm font-mono text-foreground whitespace-pre">{webSnippet}</pre>
        </div>
      </div>

      {/* Settlement Flow */}
      <div className="terminal-card p-6">
        <h3 className="text-lg font-sans font-semibold text-foreground mb-4">How x402 Settlement Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { step: '1', title: 'Agent Request', desc: 'Agent calls your MCP tool or loads your web page' },
            { step: '2', title: 'HTTP 402', desc: 'Server returns 402 with USDC payment terms on Base' },
            { step: '3', title: 'Agent Pays', desc: 'USDC settled via EIP-3009 — <$0.01 gas, ~200ms' },
            { step: '4', title: 'Content Served', desc: 'Tool executes or ad renders. You earn instantly.' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="bg-accent text-accent-foreground w-10 h-10 flex items-center justify-center mx-auto mb-3 text-lg font-mono font-bold">{item.step}</div>
              <h4 className="font-sans font-semibold text-foreground text-sm mb-1">{item.title}</h4>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Compare: Stripe minimum $0.30 + 2.9% per transaction. x402 cost for a $0.001 payment: ~$0.001. Orders of magnitude cheaper.
        </p>
      </div>
    </div>
  );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`terminal-card p-5 ${accent ? 'border-accent/30' : ''}`}>
      <p className="text-xs text-muted-foreground font-sans">{label}</p>
      <p className="text-2xl font-mono font-bold text-foreground mt-1">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-mono font-semibold text-foreground">{value}</p>
    </div>
  );
}
