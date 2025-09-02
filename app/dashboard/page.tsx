"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { PlusIcon, CreditCardIcon, HomeIcon, Settings } from "lucide-react"
import { useTransactionsStore } from "../stores/transactionStore"
import { ICreateTransactionBody } from "@/types/transactions"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"


export default function DashboardPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)

  const { transactions, hasExpense, fetchTransactions, addTransaction } = useTransactionsStore()

  useEffect(() => {
    fetchTransactions().then(() => setIsLoading(false))
  }, [fetchTransactions])

  const handleTransactionSubmit = async (transaction: ICreateTransactionBody) => {
    try {
      await addTransaction(transaction)
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error submitting transaction:", error)
    }
  }

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsModalOpen(true)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100)
  }

  const recentTransactions = transactions.slice(0, 7).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const hasTransactions = transactions.length > 0

  if (isLoading) {
    return <LoadingPage message="Carregando dashboard..." />
  }

  return (
    <PageLayout onOpenWhatsApp={() => setIsWhatsAppModalOpen(true)} onOpenSettings={() => setIsSettingsModalOpen(true)}>
      <main className="p-6 space-y-6">
        <SummaryCards />

        <div className="flex flex-col md:flex-row md:justify-between items-center gap-3">
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" onClick={() => router.push("/")} className="gap-2 w-full md:w-auto">
              <HomeIcon className="h-4 w-4" />
              Página Inicial
            </Button>
            <Button variant="outline" onClick={() => setIsSettingsModalOpen(true)} className="gap-2 hidden md:flex">
              <Settings className="h-4 w-4" />
              Configurações
            </Button>
          </div>

          <div className="flex w-full md:w-auto">
            <Button onClick={handleOpenModal} className="gap-2 w-full md:w-auto">
              <PlusIcon className="h-4 w-4" />
              Nova Transação
            </Button>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {hasExpense ? (
            <ExpenseChart />
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
          <TrendChart />
        </div>

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
                    <p className="font-medium">{transaction.title}</p>
                    <p className="text-sm text-muted-foreground flex md:gap-2 flex-col md:flex-row">
                      <span>{transaction.category}</span> <span className="hidden md:block">•</span> <span> {format(transaction.date, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
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