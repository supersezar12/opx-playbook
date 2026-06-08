import React, { createContext, useContext, useState } from 'react';
import { cn } from '../../lib/utils';

interface TabsContextValue { active: string; setActive: (v: string) => void; }
const TabsContext = createContext<TabsContextValue>({ active: '', setActive: () => {} });

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
  value?: string;
  onValueChange?: (v: string) => void;
}

export const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className, value, onValueChange }) => {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;
  const setActive = (v: string) => { setInternal(v); onValueChange?.(v); };
  return (
    <TabsContext.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('flex gap-1 p-1 bg-gray-900/80 border border-white/8 rounded-xl', className)}>
    {children}
  </div>
);

interface TabsTriggerProps { value: string; children: React.ReactNode; className?: string; }
export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className }) => {
  const { active, setActive } = useContext(TabsContext);
  const isActive = active === value;
  return (
    <button
      onClick={() => setActive(value)}
      className={cn(
        'flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
        isActive
          ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/10 text-amber-300 border border-amber-500/30 shadow-sm'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
        className
      )}
    >
      {children}
    </button>
  );
};

interface TabsContentProps { value: string; children: React.ReactNode; className?: string; }
export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className }) => {
  const { active } = useContext(TabsContext);
  if (active !== value) return null;
  return <div className={className}>{children}</div>;
};
