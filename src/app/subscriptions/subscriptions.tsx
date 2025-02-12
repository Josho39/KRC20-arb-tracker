import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const subscriptionTiers = [
  {
    name: 'LITE',
    bgColor: 'bg-white',
    titleColor: 'text-[#70c7ba]',
    icon: '/logo.png',
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
    titleColor: 'text-black',
    icon: '/logo.png',
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
    titleColor: 'text-white',
    icon: '/logo.png',
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

export default function SubscriptionsPage() {
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
              className={`overflow-hidden border-2 transition-transform hover:scale-105 ${tier.bgColor} relative h-[600px]`}
            >
              <CardHeader className="text-center pb-8">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <Image
                    src={tier.icon}
                    alt={`${tier.name} icon`}
                    fill
                    className="object-contain"
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
                      className={`flex items-center gap-2 ${tier.name === 'VIP' ? 'text-white' : ''}`}
                    >
                      <svg
                        className={`h-5 w-5 ${tier.name === 'VIP' ? 'text-white' : 'text-primary'}`}
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
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-opacity hover:opacity-90
                      ${tier.name === 'LITE' ? 'bg-[#70c7ba] text-white' :
                      tier.name === 'PRO' ? 'bg-black text-white' :
                      'bg-white text-[#70c7ba]'}`}
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
}