import type { Transaction } from "./sample-data"

export interface FinancialData {
  transactions: Transaction[]
  lastUpdated: string
}

// Storage keys
const TRANSACTIONS_KEY = "finance-transactions"
const DATA_VERSION_KEY = "finance-data-version"

// Data version for future migrations
const CURRENT_DATA_VERSION = "1.0.0"

// Initialize data structure
export function initializeData(): FinancialData {
  const data: FinancialData = {
    transactions: [],
    lastUpdated: new Date().toISOString(),
  }

  saveData(data)
  return data
}

// Load all financial data
export function loadData(): FinancialData {
  try {
    const transactions = JSON.parse(localStorage.getItem(TRANSACTIONS_KEY) || "[]")
    const version = localStorage.getItem(DATA_VERSION_KEY)

    // Initialize if no data exists
    if (!version) {
      return initializeData()
    }

    return {
      transactions,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error("[v0] Error loading data:", error)
    return initializeData()
  }
}

// Save all financial data
export function saveData(data: FinancialData): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(data.transactions))
    localStorage.setItem(DATA_VERSION_KEY, CURRENT_DATA_VERSION)
    console.log("[v0] Data saved successfully")
  } catch (error) {
    console.error("[v0] Error saving data:", error)
  }
}

// Transaction CRUD operations
export function addTransaction(transaction: Omit<Transaction, "id">): Transaction {
  const data = loadData()
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  }

  data.transactions.push(newTransaction)
  data.lastUpdated = new Date().toISOString()
  saveData(data)

  console.log("[v0] Transaction added:", newTransaction)
  return newTransaction
}

export function updateTransaction(id: string, updates: Partial<Omit<Transaction, "id">>): Transaction | null {
  const data = loadData()
  const index = data.transactions.findIndex((t) => t.id === id)

  if (index === -1) {
    console.error("[v0] Transaction not found:", id)
    return null
  }

  data.transactions[index] = { ...data.transactions[index], ...updates }
  data.lastUpdated = new Date().toISOString()
  saveData(data)

  console.log("[v0] Transaction updated:", data.transactions[index])
  return data.transactions[index]
}

export function deleteTransaction(id: string): boolean {
  const data = loadData()
  const index = data.transactions.findIndex((t) => t.id === id)

  if (index === -1) {
    console.error("[v0] Transaction not found:", id)
    return false
  }

  const deleted = data.transactions.splice(index, 1)[0]
  data.lastUpdated = new Date().toISOString()
  saveData(data)

  console.log("[v0] Transaction deleted:", deleted)
  return true
}

export function getTransactions(): Transaction[] {
  const data = loadData()
  return data.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Analytics and calculations
export function calculateSummary() {
  const transactions = getTransactions()
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  // Filter current month transactions
  const currentMonthTransactions = transactions.filter((t) => {
    const transactionDate = new Date(t.date)
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear
  })

  const monthlyIncome = currentMonthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0)

  const monthlyExpenses = currentMonthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const totalBalance = totalIncome - totalExpenses
  const savings = monthlyIncome - monthlyExpenses

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpenses,
    savings,
  }
}

export function getExpensesByCategory() {
  const transactions = getTransactions()
  const expenses = transactions.filter((t) => t.type === "expense")

  const categoryTotals: Record<string, number> = {}

  expenses.forEach((expense) => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
  })

  const colors = [
    "#3b82f6", // Blue
    "#ef4444", // Red
    "#10b981", // Green
    "#f59e0b", // Amber
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#f97316", // Orange
    "#84cc16", // Lime
  ]

  return Object.entries(categoryTotals)
    .map(([category, amount], index) => ({
      category,
      amount,
      color: colors[index % colors.length],
    }))
    .sort((a, b) => b.amount - a.amount)
}

export function getTrendData() {
  const transactions = getTransactions()
  const months = []
  const income = []
  const expenses = []

  // Get last 6 months
  for (let i = 5; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)

    const monthTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date)
      return transactionDate.getMonth() === date.getMonth() && transactionDate.getFullYear() === date.getFullYear()
    })

    const monthIncome = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const monthExpenses = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    months.push(date.toLocaleDateString("pt-BR", { month: "short" }))
    income.push(monthIncome)
    expenses.push(monthExpenses)
  }

  return {
    labels: months,
    income,
    expenses,
  }
}

export function getRecentTransactions(limit = 5): Transaction[] {
  const transactions = getTransactions()
  return transactions.slice(0, limit)
}

// Data export/import for backup
export function exportData(): string {
  const data = loadData()
  return JSON.stringify(data, null, 2)
}

export function importData(jsonData: string): boolean {
  try {
    const data = JSON.parse(jsonData) as FinancialData

    // Validate data structure
    if (!data.transactions || !Array.isArray(data.transactions)) {
      throw new Error("Invalid data format")
    }

    saveData(data)
    console.log("[v0] Data imported successfully")
    return true
  } catch (error) {
    console.error("[v0] Error importing data:", error)
    return false
  }
}
