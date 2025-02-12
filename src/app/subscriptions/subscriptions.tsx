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
        'Basic arbitrage monitoring',
        'Standard price alerts',
        'Public chat access',
        'Basic market data'
      ]
    },
    {
      name: 'PRO',
      bgColor: 'bg-[#FFC400]',
      titleColor: 'text-black dark:text-white',
      icon: theme === 'dark' ? '/logodarkmode.png' : '/logo.png',
      price: '$49/month',
      benefits: [
        'Advanced arbitrage features',
        'Priority alerts',
        'Premium chat access',
        'Advanced market data',
        'API access'
      ]
    },
    {
      name: 'VIP',
      bgColor: 'bg-[#70c7ba]',
      titleColor: 'text-black dark:text-white',
      icon: theme === 'dark' ? '/logodarkmode.png' : '/logo.png',
      price: '$99/month',
      benefits: [
        'All PRO features',
        'Instant alerts',
        'Private chat room',
        'Custom indicators',
        'Priority support',
        'Strategy automation'
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
                "overflow-hidden border-2 transition-transform hover:scale-105 relative h-[600px]",
                tier.bgColor,
                tier.name === 'LITE' && theme === 'dark' ? 'bg-background' : ''
              )}
            >
              <CardHeader className="text-center pb-8">
                <div className="w-24 h-24 mx-auto mb-4 relative">
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
                <div className={`text-xl font-semibold mt-2 ${tier.titleColor}`}>
                  {tier.price}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {tier.benefits.map((benefit, index) => (
                    <li 
                      key={index}
                      className={cn(
                        "flex items-center gap-2",
                        "text-black dark:text-white"
                      )}
                    >
                      <svg
                        className={cn(
                          "h-5 w-5",
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
                <div className="absolute bottom-8 left-4 right-4">
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