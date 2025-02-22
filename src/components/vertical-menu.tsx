import React, { Dispatch, SetStateAction } from 'react';
import { Home, Calculator, Target, Rocket, Brain, CreditCard, Wallet } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";

interface VerticalMenuProps {
  isOpen: boolean;
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const VerticalMenu: React.FC<VerticalMenuProps> = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Arb Calculator', href: '/arbcalc', icon: Calculator },
    { name: 'Sniper', href: '/sniper', icon: Target },
    { name: 'Wallet Watcher', href: '/watcher', icon: Wallet },
    { name: 'NFTs', href: '/nfts', icon: Rocket },
    { name: 'KAS AI', href: '/kasai', icon: Brain },
    { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  ];

  return (
    <div className={cn(
      "fixed top-0 left-0 h-full bg-background border-r shadow-lg transition-transform duration-300 ease-in-out z-40",
      "w-64",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="flex flex-col h-full pt-16">
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="text-sm text-muted-foreground">
            © 2025 KAS.TOOLS
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerticalMenu;