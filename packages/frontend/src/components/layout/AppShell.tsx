import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';

export function AppShell() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-muted/40 pt-4 gap-4">
      <TopBar />
      <div className="flex flex-1 overflow-hidden gap-4">
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <motion.main
          layout
          transition={{ layout: { duration: 0.3, ease: 'easeInOut' } }}
          className="flex-1 overflow-y-auto bg-background border-l border-t rounded-tl-lg"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}

