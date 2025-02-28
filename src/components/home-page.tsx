'use client'

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Calculator, Target, Rocket, Wallet, Brain, Check, ChevronRight, Zap } from 'lucide-react';
import Link from 'next/link';

const tools = [
  {
    name: 'Arbitrage Tools',
    description: 'Track and analyze arbitrage opportunities across KRC20 markets.',
    href: '/arbcalc',
    icon: Calculator,
    bgColor: 'bg-[#FFC400]/10',
    iconColor: 'text-[#FFC400]',
    details: 'Real-time arbitrage monitoring across multiple exchanges. Track price differences, calculate profit opportunities, and execute trades efficiently.'
  },
  {
    name: 'Wallet Watcher',
    description: 'Track wallet balances and transaction history.',
    href: '/watcher',
    icon: Wallet,
    bgColor: 'bg-[#6366f1]/10',
    iconColor: 'text-[#6366f1]',
    details: 'Monitor Kaspa wallet activity, track balance changes, and analyze transaction patterns in real-time with detailed visualizations.'
  },
  {
    name: 'NFT Tools',
    description: 'Advanced NFT price analysis and tracking tools.',
    href: '/nfts',
    icon: Rocket,
    bgColor: 'bg-[#70c7ba]/10',
    iconColor: 'text-[#70c7ba]',
    details: 'Comprehensive NFT market analysis tools. Track floor prices, monitor rare traits, and identify profitable trading opportunities.'
  },
  {
    name: 'Token Sniper',
    description: 'Real-time token price monitoring and alerts.',
    href: '/sniper',
    icon: Target,
    bgColor: 'bg-red-500/10',
    iconColor: 'text-red-500',
    details: 'Advanced sniping tools with real-time price alerts, technical analysis indicators, and automated trading features.'
  },
  {
    name: 'KAS AI',
    description: 'AI-powered assistant for Kaspa ecosystem.',
    href: '/kasai',
    icon: Brain,
    bgColor: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
    details: 'Get instant answers about Kaspa, KRC20 tokens, wallets, and the ecosystem from our AI assistant.'
  },
  {
    name: 'Velocity',
    description: 'High-speed trading and market analysis platform.',
    href: '/velocity',
    icon: Zap,
    bgColor: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    details: 'Advanced trading automation with custom strategies, real-time market analysis, and high-frequency trading capabilities.'
  }
];

const premiumPlans = [
  {
    name: 'KAS.TOOLS PRO',
    description: 'Professional trading suite',
    color: 'bg-[#FFC400]',
    textColor: 'text-[#FFC400]',
    features: [
      'All VIP features included',
      'API access for automated trading',
      'Real-time market data feeds',
      'Unlimited sniper configurations'
    ]
  },
  {
    name: 'KAS.TOOLS VIP',
    description: 'Enhanced features for serious traders',
    color: 'bg-[#70c7ba]',
    textColor: 'text-[#70c7ba]',
    features: [
      'Priority access to new features',
      'Advanced trading indicators',
      'Custom alert configurations',
      'Premium support channel'
    ]
  }
];

const HomePage = () => {
  const [flippedCards, setFlippedCards] = useState<{[key: string]: boolean}>({});

  const toggleCard = (toolName: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [toolName]: !prev[toolName]
    }));
  };

  return (
    <div className="min-h-screen bg-background p-4 pt-10">
      <div className="max-w-7xl mx-auto space-y-3">
        <div className="text-center space-y-4">
          <p className="text-xl text-muted-foreground max-w-7xl mx-auto">
            Comprehensive tools for KRC analysis, trading, and portfolio management
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div 
              key={tool.name} 
              className="group relative h-[200px] w-full [perspective:1000px]"
              onClick={() => toggleCard(tool.name)}
            >
              <div className={`absolute inset-0 transition-all duration-500 [transform-style:preserve-3d] md:group-hover:[transform:rotateY(180deg)] ${
                flippedCards[tool.name] ? '[transform:rotateY(180deg)]' : ''
              } md:[transform:rotateY(0deg)]`}>
                <Card className="absolute inset-0 h-full w-full [backface-visibility:hidden]">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${tool.bgColor}`}>
                        <tool.icon className={`h-6 w-6 ${tool.iconColor}`} />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">
                          {tool.name}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {tool.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span className="md:block hidden">Hover to learn more →</span>
                      <span className="md:hidden block">Tap to flip card →</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="absolute inset-0 h-full w-full [transform:rotateY(180deg)] [backface-visibility:hidden] bg-primary text-primary-foreground">
                  <CardHeader>
                    <CardTitle>{tool.name}</CardTitle>
                    <CardDescription className="text-primary-foreground/80">
                      {tool.details}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="absolute bottom-4 left-4">
                    <Link 
                      href={tool.href}
                      className="inline-flex items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium text-primary hover:bg-secondary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Get Started →
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {premiumPlans.map((plan) => (
              <Card 
                key={plan.name}
                className={`relative overflow-hidden border-2 hover:border-${plan.color} transition-all duration-300`}
              >
                <div className={`absolute top-0 right-0 w-32 h-32 ${plan.color} opacity-10 rounded-full -translate-y-16 translate-x-16`} />
                <CardHeader>
                  <CardTitle className={plan.textColor}>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className={`h-4 w-4 ${plan.textColor}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link 
                    href="/subscriptions"
                    className={`mt-6 w-full py-2 px-4 rounded-lg ${plan.color} text-white font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2`}
                  >
                    Upgrade Now
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;