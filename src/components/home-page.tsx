'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Calculator, LineChart, Microscope, Wrench } from 'lucide-react';

const tools = [
  {
    name: 'Arb Calculator',
    description: 'Calculate and analyze arbitrage opportunities across different KRC20 token markets in real-time.',
    href: '/arbcalc',
    icon: Calculator,
    color: 'text-blue-500',
    details: 'Track real-time price differences across exchanges and identify profitable trading opportunities with our advanced arbitrage calculator.'
  },
  {
    name: 'Tool 2',
    description: 'Advanced market analysis and visualization tools for KRC20 tokens.',
    href: '/tool2',
    icon: LineChart,
    color: 'text-green-500',
    details: 'Dive deep into market trends with comprehensive charting tools and technical analysis indicators.'
  },
  {
    name: 'Tool 3',
    description: 'Track and analyze your KRC20 token portfolio performance.',
    href: '/tool3',
    icon: Microscope,
    color: 'text-purple-500',
    details: 'Monitor your portfolio performance with detailed analytics and real-time tracking features.'
  },
  {
    name: 'Tool 4',
    description: 'Additional trading utilities and analysis tools.',
    href: '/tool4',
    icon: Wrench,
    color: 'text-orange-500',
    details: 'Access a suite of specialized trading tools designed to enhance your trading strategy.'
  }
];

const HomePage = () => {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-primary">KAS.TOOLS</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Comprehensive tools for token analysis, trading, and portfolio management
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <div key={tool.name} className="group relative h-[200px] w-full [perspective:1000px] cursor-pointer">
              <div className="absolute inset-0 transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                <Card className="absolute inset-0 h-full w-full [backface-visibility:hidden]">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-background border ${tool.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-primary">
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
                      <span>Hover to learn more →</span>
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
                    >
                      Get Started →
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 text-center">
        <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
          🚀 More tools coming soon
        </div>
      </div>
    </div>
  );
};

export default HomePage;