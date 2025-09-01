"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { PageLayout } from "@/components/page-layout"
import { LoadingPage } from "@/components/loading-spinner"
import { TransactionList } from "@/components/transaction-list"
import { EmptyState } from "@/components/empty-state"
import { TransactionModal } from "@/components/transaction-modal"
import { WhatsAppModal } from "@/components/whatsapp-modal"
import { SettingsModal } from "@/components/settings-modal"
import { Button } from "@/components/ui/button"
import { PlusIcon, CreditCardIcon } from "lucide-react"
import { useTransactionsStore } from "@/app/stores/transactionStore"
import type { ITransaction, ICreateTransactionBody, IUpdateTransactionBody } from "@/types/transactions"

export default function TransactionsPage() {
  const router = useRouter()
  const { transactions, fetchTransactions, loading, addTransaction, updateTransaction } = useTransactionsStore();

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<ITransaction | null>(null)

  useEffect(() => {
    // Carrega as transações apenas uma vez ao montar o componente
    fetchTransactions()
  }, [fetchTransactions])

  const handleTransactionSubmit = async (
    transactionData: ICreateTransactionBody,
    id?: string
  ) => {
    if (id) {
      const newData: IUpdateTransactionBody = { ...transactionData, id }
      await updateTransaction(id, newData)
    } else {
      await addTransaction(transactionData)
    }
    handleModalClose()
  }

  const handleEditTransaction = (transaction: ITransaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setEditingTransaction(null)
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
            <TransactionList onEditTransaction={handleEditTransaction} />
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
        initialData={editingTransaction || undefined} // Pass the editing data here
      />
      <WhatsAppModal isOpen={isWhatsAppModalOpen} onClose={() => setIsWhatsAppModalOpen(false)} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </PageLayout>
  )
}