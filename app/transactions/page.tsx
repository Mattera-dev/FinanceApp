"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthCookie } from "@/lib/auth"
import { PageLayout } from "@/components/page-layout"
import { LoadingPage } from "@/components/loading-spinner"
import { TransactionList } from "@/components/transaction-list"
import { EmptyState } from "@/components/empty-state"
import { TransactionModal } from "@/components/transaction-modal"
import { WhatsAppModal } from "@/components/whatsapp-modal"
import { SettingsModal } from "@/components/settings-modal"
import { Button } from "@/components/ui/button"
import { PlusIcon, CreditCardIcon } from "lucide-react"
import { getTransactions, addTransaction, updateTransaction } from "@/lib/data-manager"
import type { Transaction } from "@/lib/sample-data"

export default function TransactionsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const loadTransactions = () => {
    const allTransactions = getTransactions()
    setTransactions(allTransactions)
    console.log("[v0] Loaded transactions:", allTransactions.length)
  }

  const handleTransactionSubmit = (transaction: Omit<Transaction, "id">) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transaction)
      setEditingTransaction(null)
    } else {
      addTransaction(transaction)
    }
    loadTransactions() // Refresh transactions list
    setIsModalOpen(false)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
  }

  useEffect(() => {
    const handleFocus = () => {
      loadTransactions()
    }

    window.addEventListener("focus", handleFocus)
    return () => window.removeEventListener("focus", handleFocus)
  }, [])

  if (isLoading) {
    return <LoadingPage message="Carregando transações..." />
  }

  return (
    <PageLayout onOpenWhatsApp={() => setIsWhatsAppModalOpen(true)} onOpenSettings={() => setIsSettingsModalOpen(true)}>
      <main className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Transações</h1>
              <p className="text-muted-foreground">Gerencie todas as suas receitas e despesas</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Nova Transação
            </Button>
          </div>

          {transactions.length > 0 ? (
            <TransactionList transactions={transactions} onEditTransaction={handleEditTransaction} />
          ) : (
            <EmptyState
              icon={CreditCardIcon}
              title="Nenhuma transação encontrada"
              description="Comece adicionando suas primeiras receitas e despesas para acompanhar suas finanças."
              action={{
                label: "Adicionar Primeira Transação",
                onClick: () => setIsModalOpen(true),
              }}
            />
          )}
        </div>
      </main>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleTransactionSubmit}
        editingTransaction={editingTransaction}
      />
      <WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </PageLayout>
  )
}
