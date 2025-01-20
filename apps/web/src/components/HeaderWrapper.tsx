'use client';

import { usePathname } from 'next/navigation';
import { Header } from '@/components/ui/Header';

export function HeaderWrapper() {
  const pathname = usePathname();
  const isLoginPage = pathname === '/';

  if (isLoginPage) {
    return null;
  }

  return <Header />;
} 
