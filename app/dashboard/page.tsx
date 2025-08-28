"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthCookie } from "@/lib/auth"
import { PageLayout } from "@/components/page-layout"
import { LoadingPage } from "@/components/loading-spinner"
import { SummaryCards } from "@/components/summary-cards"
import { ExpenseChart } from "@/components/expense-chart"
import { TrendChart } from "@/components/trend-chart"
import { EmptyState } from "@/components/empty-state"
import { TransactionModal } from "@/components/transaction-modal"
import { WhatsAppModal } from "@/components/whatsapp-modal"
import { SettingsModal } from "@/components/settings-modal"
import { Button } from "@/components/ui/button"
import { PlusIcon, CreditCardIcon, HomeIcon, MessageCircle, Settings } from "lucide-react"
import {
  calculateSummary,
  getExpensesByCategory,
  getTrendData,
  getRecentTransactions,
  addTransaction,
} from "@/lib/data-manager"
import type { Transaction } from "@/lib/sample-data"

export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [summaryData, setSummaryData] = useState({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    savings: 0,
  })
  const [expenseData, setExpenseData] = useState<Array<{ category: string; amount: number; color: string }>>([])
  const [trendData, setTrendData] = useState({
    labels: [] as string[],
    income: [] as number[],
    expenses: [] as number[],
  })
  const [recentTransactions, setRecentTransactions] = useState<any[]>([])


  const loadDashboardData = () => {
    try {
      const summary = calculateSummary()
      const expenses = getExpensesByCategory()
      const trends = getTrendData()
      const recent = getRecentTransactions(3)

      setSummaryData(summary)
      setExpenseData(expenses)
      setTrendData(trends)
      setRecentTransactions(recent)

      console.log("[v0] Dashboard data loaded:", { summary, expenses: expenses.length, trends, recent: recent.length })
    } catch (error) {
      console.error("[v0] Error loading dashboard data:", error)
    }
  }

  const handleTransactionSubmit = (transaction: Omit<Transaction, "id">) => {
    addTransaction(transaction)
    loadDashboardData() // Refresh dashboard data
    setIsModalOpen(false)
  }

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  useEffect(() => {
    const handleFocus = () => {
      loadDashboardData()
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  if (isLoading) {
    return <LoadingPage message="Carregando dashboard..." />
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "short",
    })
  }

  const hasTransactions = recentTransactions.length > 0

  return (
    <PageLayout onOpenWhatsApp={() => setIsWhatsAppModalOpen(true)} onOpenSettings={() => setIsSettingsModalOpen(true)}>
      <main className="p-6 space-y-6">
        {/* Summary Cards */}
        <SummaryCards data={summaryData} />

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/")} className="gap-2">
              <HomeIcon className="h-4 w-4" />
              Página Inicial
            </Button>
            <Button variant="outline" onClick={() => setIsSettingsModalOpen(true)} className="gap-2">
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
            >
              <MessageCircle className="h-4 w-4" />
              Adicionar ao WhatsApp
            </Button>
            <Button onClick={handleOpenModal} className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {expenseData.length > 0 ? (
            <ExpenseChart data={expenseData} />
          ) : (
            <EmptyState
              icon={CreditCardIcon}
              title="Nenhuma despesa registrada"
              description="Comece adicionando suas primeiras transações para ver os gráficos de gastos por categoria."
              action={{
                label: "Adicionar Transação",
                onClick: () => handleOpenModal,
              }}
            />
          )}
          <TrendChart data={trendData} />
        </div>

        {/* Recent Transactions Preview */}
        <div className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Transações Recentes</h2>
            <Button variant="outline" onClick={() => router.push("/transactions")}>
              Ver Todas
            </Button>
          </div>
          <div className="space-y-3">
            {hasTransactions ? (
              recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 px-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.category} • {formatDate(transaction.date)}
                    </p>
                  </div>
                  <span className={`font-medium ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CreditCardIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">Nenhuma transação registrada ainda</p>
                <Button onClick={handleOpenModal}>Adicionar Primeira Transação</Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleTransactionSubmit} />
      <WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </PageLayout>
  )
}
