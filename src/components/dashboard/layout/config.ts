import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'dashboard' },
  { key: 'warranties', title: 'Warranties', href: '/warranties', icon: 'shield' },
  { key: 'products', title: 'Products', href: '/products', icon: 'inventory' },
  { key: 'claims', title: 'Claims', href: '/claims', icon: 'description' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'person' },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'settings' },
] satisfies NavItemConfig[];
