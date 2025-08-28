"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthCookie } from "@/lib/auth"
import { TransactionForm } from "@/components/transaction-form"
import { LoadingPage } from "@/components/loading-spinner"
import { addTransaction } from "@/lib/data-manager"
import type { Transaction } from "@/lib/sample-data"

export default function NewTransactionPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const authData = getAuthCookie()
    if (!authData) {
      router.push("/auth")
    } else {
      setIsLoading(false)
    }
  }, [router])

  const handleSubmit = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = addTransaction(transaction)
    console.log("[v0] Transaction saved via data manager:", newTransaction)
  }

  if (isLoading) {
    return <LoadingPage message="Carregando formulário..." />
  }

  return <TransactionForm onSubmit={handleSubmit} />
}
