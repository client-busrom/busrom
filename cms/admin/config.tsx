/**
 * Admin UI Components Configuration
 *
 * This file exports custom admin components to override the default Keystone UI
 */

import { Logo } from '@keystone-6/core/admin-ui/components'
import { CustomNavigation } from './components/Navigation'
import { BusromLogo } from './components/BusromLogo'

export const components = {
  Logo: BusromLogo,
  Navigation: CustomNavigation,
}
