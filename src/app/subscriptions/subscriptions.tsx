'use client';

import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { cn } from "@/lib/utils";

const SubscriptionsPage = () => {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const subscriptionTiers = [
    {
      name: 'LITE',
      bgColor: 'bg-white dark:bg-background',
      titleColor: 'text-[#70c7ba]',
      icon: theme === 'dark' ? '/logodarkmode.png' : '/logo.png',
      price: 'Free',
      benefits: [
        'NFT information (buys, sells, mints, rarity)',
        'Two token arbitrage (NACHO and ARB)',
        'Top 2 token delayed sniper',
        'KasAI access (with Telegram signup)',
        'Access to social channels',
        'Basic website features with ads'
      ]
    },
    {
      name: 'PRO',
      bgColor: 'bg-[#FFC400]',
      titleColor: 'text-black dark:text-white',
      icon: theme === 'dark' ? '/logodarkmode.png' : '/logo.png',
      price: '25',
      yearlyPrice: '22.50',
      benefits: [
        'Top 6 token arbitrage monitoring',
        'Top 6 live token sniper',
        'Regular whale tracking',
        'Wallet profiler access',
        'NFT snipes alerts',
        'Velocity 1.0 features',
        'Reduced website ads'
      ]
    },
    {
      name: 'VIP',
      bgColor: 'bg-[#70c7ba]',
      titleColor: 'text-black dark:text-white',
      icon: theme === 'dark' ? '/logodarkmode.png' : '/logo.png',
      price: '50',
      yearlyPrice: '45',
      benefits: [
        'Full access arbitrage with custom alerts',
        'Complete sniper access with custom alerts',
        'Advanced whale tracking with CG wallet',
        'Custom alerts configuration',
        'Discounts on custom bots',
        'Velocity 2.0 features',
        'Ad-free experience'
      ]
    }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">SUBSCRIPTIONS</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptionTiers.map((tier) => (
            <Card 
              key={tier.name}
              className={cn(
                "overflow-hidden border-2 transition-transform hover:scale-105 relative h-[550px]",
                tier.bgColor,
                tier.name === 'LITE' && theme === 'dark' ? 'bg-background' : ''
              )}
            >
              <CardHeader className="text-center pb-4 pt-4">
                <div className="w-20 h-20 mx-auto mb-2 relative">
                  <Image
                    src={tier.icon}
                    alt={`${tier.name} icon`}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                <div className={`text-2xl font-bold ${tier.titleColor}`}>
                  KAS.TOOLS {tier.name}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tier.benefits.map((benefit, index) => (
                    <li 
                      key={index}
                      className={cn(
                        "flex items-center gap-2",
                        "text-black dark:text-white text-sm"
                      )}
                    >
                      <svg
                        className={cn(
                          "h-4 w-4 flex-shrink-0",
                          "text-black dark:text-white"
                        )}
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      {benefit}
                    </li>
                  ))}
                </ul>
                <div className="absolute bottom-6 left-4 right-4 space-y-4">
                  {tier.price !== 'Free' ? (
                    <div className={`flex flex-col items-center ${tier.titleColor}`}>
                      <div className="text-2xl font-bold">
                        ${tier.yearlyPrice}
                      </div>
                      <div className="text-sm text-muted-foreground text-center">
                        Per month with annual subscription discount; ${Number(tier.yearlyPrice) * 12} billed up front. ${tier.price} if billed monthly.
                      </div>
                    </div>
                  ) : (
                    <div className={`text-center ${tier.titleColor}`}>
                      <div className="text-2xl font-bold">Free</div>
                      <div className="text-sm text-muted-foreground">
                        No credit card required
                      </div>
                    </div>
                  )}
                  <button
                    className={cn(
                      "w-full py-3 px-4 rounded-lg font-semibold transition-opacity hover:opacity-90",
                      "bg-black text-white dark:bg-white dark:text-black"
                    )}
                  >
                    {tier.name === 'LITE' ? 'Get Started' : 'Upgrade Now'}
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;