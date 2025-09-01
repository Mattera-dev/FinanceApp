"use client"

import { authStore } from "@/app/stores/authStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon, DollarSignIcon, TrendingUpIcon } from "lucide-react"
import { LoadingSpinner } from "./loading-spinner"
import { useTransactionsStore } from "@/app/stores/transactionStore"
import { useEffect, useState } from "react"

interface SummaryCardsProps {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savings: number
}

export function SummaryCards() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100)
  }

  const { summaryData, loading } = useTransactionsStore()


  const { goal } = authStore()



  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
          <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <LoadingSpinner className={`${loading ? "" : "hidden"}`} /> <>
            <div className={`text-2xl font-bold text-green-700 transition-all duration-300  ${loading ? "opacity-0" : "opacity-100"} `}>{formatCurrency(summaryData?.totalBalance ?? 0)}</div>
            <p className={`text-xs text-muted-foreground transition-all duration-[400ms] ${loading ? "opacity-0" : "opacity-100"}`}>Saldo atual da conta</p></>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
          <ArrowUpIcon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <LoadingSpinner className={`${loading ? "" : "hidden"}`} /> <>
            <div className={`text-2xl font-bold text-green-600 transition-all duration-300  ${loading ? "opacity-0" : "opacity-100"} `}>{formatCurrency(summaryData?.monthlyIncome ?? 0)}</div>
            <p className={`text-xs text-muted-foreground transition-all duration-[400ms] ${loading ? "opacity-0" : "opacity-100"}`}>+12% em relação ao mês anterior</p></>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
          <ArrowDownIcon className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <LoadingSpinner className={`${loading ? "" : "hidden"}`} /> <>
            <div className={`text-2xl font-bold text-red-600 transition-all duration-300  ${loading ? "opacity-0" : "opacity-100"} `}>{formatCurrency(summaryData?.monthlyExpenses ?? 0)}</div>
            <p className={`text-xs text-muted-foreground transition-all duration-[400ms] ${loading ? "opacity-0" : "opacity-100"}`}>-5% em relação ao mês anterior</p></>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Economia</CardTitle>
          <TrendingUpIcon className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <LoadingSpinner className={`${loading ? "" : "hidden"}`} /> <>
            <div className={`text-2xl font-bold ${(summaryData?.savings as number < 0) ? "text-red-600" : "text-green-700"} transition-all duration-300  ${loading ? "opacity-0" : "opacity-100"} `}>{formatCurrency(summaryData?.savings ?? 0)}</div>
            <p className={`text-xs text-muted-foreground transition-all duration-[400ms] ${loading ? "opacity-0" : "opacity-100"}`}>Meta: {formatCurrency(goal)}</p></>
        </CardContent>
      </Card>
    </div>
  )
}
