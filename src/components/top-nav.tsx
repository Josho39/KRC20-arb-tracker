import React from 'react';
import Image from 'next/image';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TelegramLogin from '@/components/telegram-login';
import { ThemeToggle } from '@/components/theme-toggle';
import { useTheme } from 'next-themes';

interface TopNavProps {
  onMenuClick: () => void;
}

const TopNav: React.FC<TopNavProps> = ({ onMenuClick }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b z-50">
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <ThemeToggle />
        </div>

        <div className="lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
          <div className="relative h-10 w-28 lg:h-12 lg:w-32">
            <Image
              src={theme === 'dark' ? '/logodarkmode.png' : '/logo.png'}
              alt="KAS.tools Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>

        <div className="flex-shrink-0">
          <TelegramLogin />
        </div>
      </div>
    </header>
  );
};

export default TopNav;