// Sample data for demonstration purposes
export const sampleSummaryData = {
  totalBalance: 15750.5,
  monthlyIncome: 8500.0,
  monthlyExpenses: 6200.0,
  savings: 2300.5,
}

export const sampleExpenseData = [
  { category: "Alimentação", amount: 1800, color: "hsl(var(--chart-1))" },
  { category: "Transporte", amount: 950, color: "hsl(var(--chart-2))" },
  { category: "Moradia", amount: 2200, color: "hsl(var(--chart-3))" },
  { category: "Lazer", amount: 650, color: "hsl(var(--chart-4))" },
  { category: "Saúde", amount: 400, color: "hsl(var(--chart-5))" },
  { category: "Outros", amount: 200, color: "hsl(var(--muted-foreground))" },
]

export const sampleTrendData = {
  labels: ["Jul", "Ago", "Set", "Out", "Nov", "Dez"],
  income: [7200, 7800, 8100, 7900, 8300, 8500],
  expenses: [5800, 6100, 5900, 6300, 6500, 6200],
}

export interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
}

export const sampleTransactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    amount: 8500,
    category: "Salário",
    description: "Salário mensal",
    date: "2024-12-01",
  },
  {
    id: "2",
    type: "expense",
    amount: 2200,
    category: "Moradia",
    description: "Aluguel",
    date: "2024-12-05",
  },
  {
    id: "3",
    type: "expense",
    amount: 450,
    category: "Alimentação",
    description: "Supermercado",
    date: "2024-12-08",
  },
  {
    id: "4",
    type: "expense",
    amount: 120,
    category: "Transporte",
    description: "Combustível",
    date: "2024-12-10",
  },
]

// Categories for transaction form
export const expenseCategories = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Educação",
  "Roupas",
  "Outros",
]

export const incomeCategories = ["Salário", "Freelance", "Investimentos", "Vendas", "Outros"]
