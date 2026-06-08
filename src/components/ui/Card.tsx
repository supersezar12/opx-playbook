import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div
    className={cn('bg-white rounded-2xl border border-gray-200 shadow-sm', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('px-6 py-5 border-b border-gray-100', className)} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardProps> = ({ className, children, ...props }) => (
  <h2 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
    {children}
  </h2>
);

export const CardDescription: React.FC<CardProps> = ({ className, children, ...props }) => (
  <p className={cn('text-sm text-gray-500 mt-0.5', className)} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('px-6 py-5', className)} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<CardProps> = ({ className, children, ...props }) => (
  <div className={cn('px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl', className)} {...props}>
    {children}
  </div>
);
