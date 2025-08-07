import { Outlet } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';
import { AttioLayout } from './AttioLayout';
import { MobileLayout } from './MobileLayout';

export function ResponsiveLayout() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileLayout />;
  }

  return <AttioLayout />;
}