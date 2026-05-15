import React from 'react'
import { Gutter } from '@payloadcms/ui'

import { QuickActionsWidget } from './widgets/QuickActionsWidget'
import { SeoIndexingWidget } from './widgets/SeoIndexingWidget'
import { FormSubmissionsWidget } from './widgets/FormSubmissionsWidget'

import './custom-dashboard.scss'

const CustomDashboard: React.FC<any> = ({ initPageResult, user }) => {
  // In Payload v3 Server Component views, user is available via props or initPageResult.req.user
  const currentUser = user || initPageResult?.req?.user

  return (
    <div className="custom-dashboard">
      <Gutter>
        <header className="dashboard-header">
          <h1>Welcome back, {currentUser?.name || currentUser?.email || 'Admin'}!</h1>
          <p>Here is an overview of your workspace today.</p>
        </header>

        <div className="dashboard-grid">
          {/* Quick Actions Widget (Top Full / Half Width) */}
          <QuickActionsWidget />
          
          {/* SEO Indexing Widget */}
          <SeoIndexingWidget />

          {/* Form Submissions Widget */}
          <FormSubmissionsWidget />
        </div>
      </Gutter>
    </div>
  )
}

export default CustomDashboard



