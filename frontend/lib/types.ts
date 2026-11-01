export interface Profile {
  monthly_income: number
  monthly_expenses: number
  existing_savings: number
  existing_debt: number
  monthly_investment_capacity: number
  risk_appetite: string
  investment_horizon_years: number
  primary_goal: string | null
  target_amount: number | null
  currency: string
}

export interface PortfolioSummary {
  total_invested: number
  total_current_value: number
  overall_gain_loss: number
  overall_gain_loss_pct: number
  allocation: Record<string, number>
}