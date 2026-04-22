/**
 * InfoCard Component
 *
 * A reusable card component with a title header and content area.
 *
 * DRY Principle: Use this component instead of repeating
 * Card + CardHeader + CardTitle + CardContent pattern.
 *
 * @example
 * <InfoCard title="Basic Information">
 *   <p className="text-gray-600">Your content here</p>
 * </InfoCard>
 *
 * See: src/components/ui/README.md for more information
 */

import { Card, CardContent, CardHeader, CardTitle } from './card'
import type { ReactNode } from 'react'

interface InfoCardProps {
  title: string
  children: ReactNode
  className?: string
}

export const InfoCard = ({ title, children, className = '' }: InfoCardProps) => {
  return (
    <Card className={`border-0 shadow-lg bg-white ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
