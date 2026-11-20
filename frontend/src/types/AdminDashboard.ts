import type { CardGame } from '@/types/AdminCatalog'
import type { UserRole } from '@/types/User'
import type { UserStatus } from '@/types/AdminUser'

export interface AdminDashboardMetric {
  value: number | null
  monthlyChangePercent: number | null
}

export interface AdminDashboardOverview {
  registeredUsers: AdminDashboardMetric
  catalogCards: AdminDashboardMetric
  activeAds: AdminDashboardMetric | null
  completedSales: AdminDashboardMetric | null
  distribution: { game: CardGame; totalCards: number }[]
}

export interface AdminDashboardDailyActivity {
  date: string // YYYY-MM-DD na zona de relatório America/Sao_Paulo
  newUsers: number
  createdAds: number | null
  completedSales: number | null
}

export interface AdminDashboardActivity {
  days: 7 | 30 | 90
  hasAdSeries: boolean
  hasSaleSeries: boolean
  daily: AdminDashboardDailyActivity[]
}

export interface AdminDashboardRecentUser {
  id: string
  name: string
  username: string | null
  role: UserRole
  status: UserStatus
  registrationDate: string
}

export interface AdminDashboardRecentAd {
  id: string
  cardName: string
  game: CardGame | null
  unitPrice: number | null
  tradeOnly: boolean
  status: 'ACTIVE' | 'CANCELLED' | 'SOLD_OUT'
  createdAt: string
}
