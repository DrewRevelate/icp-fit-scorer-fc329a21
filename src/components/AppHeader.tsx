import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Target, Settings, Users } from 'lucide-react';
import fitchLogo from '@/assets/fitch-logo.png';

const navItems = [
  { path: '/', label: 'Score', icon: Target },
  { path: '/setup', label: 'Setup', icon: Settings },
  { path: '/prospects', label: 'Prospects', icon: Users },
];

export function AppHeader() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <motion.img
            src={fitchLogo}
            alt="Fitch"
            className="h-10 w-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          />
        </Link>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
