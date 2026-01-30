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
    <header className="sticky top-4 z-50 mx-4 sm:mx-8 lg:mx-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-6 py-3 rounded-2xl bg-card/60 backdrop-blur-xl border border-border/30 shadow-lg"
      >
        <Link to="/" className="flex items-center gap-2">
          <motion.img
            src={fitchLogo}
            alt="Fitch"
            className="h-9 w-auto"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          />
        </Link>

        <nav className="flex items-center gap-1 bg-secondary/40 rounded-xl p-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-primary/20 text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
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
      </motion.div>
    </header>
  );
}
