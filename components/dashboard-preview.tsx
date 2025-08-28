"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"

const mockData = {
  totalIncome: 8500,
  totalExpenses: 3200,
  balance: 5300,
  transactions: 24,
  expensesByCategory: [
    { category: "Alimentação", amount: 1200, percentage: 37.5 },
    { category: "Transporte", amount: 800, percentage: 25 },
    { category: "Lazer", amount: 600, percentage: 18.8 },
    { category: "Outros", amount: 600, percentage: 18.7 },
  ],
}



export function DashboardPreview() {

  const totalBalance = useIntersectionObserver()
  const gainsBalance = useIntersectionObserver()
  const expensesBalance = useIntersectionObserver()
  const transactions = useIntersectionObserver()

  const transactionListObservers = mockData.expensesByCategory.map(() => useIntersectionObserver({ threshold: 0.3}))

  const classNames = "delay-[1200ms] delay-[1300ms] delay-[1400ms] delay-[1100ms]"

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 backdrop-blur-sm rounded-lg" />

      <div className="relative p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card ref={totalBalance.ref} className={`bg-background/80 backdrop-blur-sm border-primary/20 delay-[500ms] transition-all duration-200
                  ${totalBalance.isIntersecting ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">R$ {mockData.balance.toLocaleString("pt-BR")}</div>
              <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
            </CardContent>
          </Card>

          <Card ref={gainsBalance.ref} className={`bg-background/80 backdrop-blur-sm border-green-500/20 delay-[600ms] transition-all duration-200
                  ${gainsBalance.isIntersecting ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">R$ {mockData.totalIncome.toLocaleString("pt-BR")}</div>
              <p className="text-xs text-muted-foreground">+8% este mês</p>
            </CardContent>
          </Card>

          <Card ref={expensesBalance.ref} className={`bg-background/80 backdrop-blur-sm border-red-500/20 delay-[800ms] transition-all duration-200
                  ${expensesBalance.isIntersecting ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">R$ {mockData.totalExpenses.toLocaleString("pt-BR")}</div>
              <p className="text-xs text-muted-foreground">-5% este mês</p>
            </CardContent>
          </Card>

          <Card ref={transactions.ref} className={`bg-background/80 backdrop-blur-sm border-blue-500/20 delay-[900ms] transition-all duration-200
                  ${transactions.isIntersecting ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12 "}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transações</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{mockData.transactions}</div>
              <p className="text-xs text-muted-foreground">Este mês</p>
            </CardContent>
          </Card>
        </div>

        {/* Expense Categories */}
        <Card className="bg-background/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
            <CardDescription>Distribuição das suas despesas principais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockData.expensesByCategory.map((item, index) => {
                
                const {ref, isIntersecting} = transactionListObservers[index]

                return (
                <div ref={ref} key={index} className={`flex items-center justify-between transition-all duration-200 delay-[${1000 + ((index+1) * 100)}ms] ${isIntersecting ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full bg-primary"
                      style={{
                        backgroundColor: `hsl(${index * 90}, 70%, 50%)`,
                      }}
                    />
                    <span className="font-medium">{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.percentage}%</Badge>
                    <span className="font-semibold">R$ {item.amount.toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              )})}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
