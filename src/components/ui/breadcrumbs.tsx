import { Link, useLocation } from 'react-router-dom'
import { Fragment } from 'react'

interface BreadcrumbItem {
  label: string
  href?: string
}

export const Breadcrumbs = () => {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const breadcrumbs: BreadcrumbItem[] = []

    // Build breadcrumbs from path segments
    pathnames.forEach((segment, index) => {
      const href = `/${pathnames.slice(0, index + 1).join('/')}`

      // Map route segments to readable names
      const routeNames: Record<string, string> = {
        dashboard: 'Dashboard',
        inventory: 'Inventory',
        orders: 'Orders',
        zones: 'Zones',
        team: 'Team',
      }

      // If it's a known route, add it
      if (routeNames[segment]) {
        breadcrumbs.push({
          label: routeNames[segment],
          href: index < pathnames.length - 1 ? href : undefined,
        })
      } else {
        // For dynamic segments (like IDs), show as "Detail"
        breadcrumbs.push({
          label: 'Detail',
          href: undefined,
        })
      }
    })

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  if (breadcrumbs.length === 0) {
    return <span className="text-lg font-semibold text-gray-800">Dashboard</span>
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {breadcrumbs.map((breadcrumb, index) => (
        <Fragment key={index}>
          {breadcrumb.href ? (
            <Link
              to={breadcrumb.href}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              {breadcrumb.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-semibold">{breadcrumb.label}</span>
          )}
          {index < breadcrumbs.length - 1 && (
            <span className="text-gray-400">/</span>
          )}
        </Fragment>
      ))}
    </div>
  )
}
