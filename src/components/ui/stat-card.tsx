import { Card, CardContent, CardHeader, CardTitle } from './card'

interface StatCardProps {
  title: string
  value: string | number
  subtitle: string
  icon: string
  variant?: 'green' | 'emerald'
}

export const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'green',
}: StatCardProps) => {
  const variantStyles = {
    green: {
      card: 'bg-gradient-to-br from-white to-green-50',
      value: 'text-green-700',
    },
    emerald: {
      card: 'bg-gradient-to-br from-white to-emerald-50',
      value: 'text-emerald-700',
    },
  }

  const styles = variantStyles[variant]

  return (
    <Card className={`border-0 shadow-lg hover:shadow-xl transition-shadow ${styles.card}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className="text-2xl">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${styles.value}`}>{value}</div>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  )
}
