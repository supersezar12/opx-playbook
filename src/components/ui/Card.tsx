import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div
    className={cn(
      'rounded-2xl border border-white/8 bg-gray-900/80 shadow-glass backdrop-blur-sm',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('px-6 py-5 border-b border-white/6', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardProps> = ({ className, children, ...props }) => (
  <h2 className={cn('text-base font-semibold text-slate-100 tracking-tight', className)} {...props}>
    {children}
  </h2>
);

export const CardDescription: React.FC<CardProps> = ({ className, children, ...props }) => (
  <p className={cn('text-sm text-slate-400 mt-1 leading-relaxed', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('px-6 py-5', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div
    className={cn('px-6 py-4 border-t border-white/6 bg-white/2 rounded-b-2xl', className)}
    {...props}
  >
    {children}
  </div>
);
