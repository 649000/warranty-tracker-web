import type { Icon } from '@mui/icons-material';
import {
  Dashboard as DashboardIcon,
  Shield as ShieldIcon,
  Inventory as InventoryIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

export const navIcons = {
  dashboard: DashboardIcon,
  shield: ShieldIcon,
  inventory: InventoryIcon,
  description: DescriptionIcon,
  person: PersonIcon,
  settings: SettingsIcon,
} as Record<string, Icon>;
