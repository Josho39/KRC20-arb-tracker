'use client';

import React from 'react';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from "@/lib/utils";
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { LineChart, Wrench, Calculator, Microscope, Menu, X, Home } from 'lucide-react';
import TelegramLogin from '@/components/telegram-login';

const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Arb Calculator', href: '/arbcalc', icon: Calculator },
    { name: 'Tool 2', href: '/tool2', icon: LineChart },
    { name: 'Tool 3', href: '/tool3', icon: Microscope },
    { name: 'Tool 4', href: '/tool4', icon: Wrench },
];

const NavLayout = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center mr-8">
                            <div className="relative h-12 w-12">
                                <Image
                                    src="/logo.png"
                                    alt="KAS.tools Logo"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </Link>

                        <nav className="hidden md:flex items-center">
                            <div className="flex space-x-6">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center space-x-2 px-3 py-2 rounded-md transition-colors hover:text-primary hover:bg-primary/10",
                                                isActive ? "text-primary bg-primary/10" : "text-muted-foreground"
                                            )}
                                        >
                                            <item.icon className="h-4 w-4" />
                                            <span className="font-medium">{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        <TelegramLogin />
                        <ThemeToggle />
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden"
                        >
                            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </header>

            {mobileMenuOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                    <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-background p-6 shadow-lg">
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Menu</h2>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                            {navigation.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center space-x-2 rounded-md p-3 text-sm font-medium transition-colors",
                                            isActive 
                                                ? "bg-primary text-primary-foreground" 
                                                : "hover:bg-primary/10 text-muted-foreground hover:text-primary"
                                        )}
                                    >
                                        <item.icon className="h-5 w-5" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            <main className="container py-8">
                {children}
            </main>
        </div>
    );
};

export default NavLayout;