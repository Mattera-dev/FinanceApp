"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchIcon, FilterIcon, ArrowUpIcon, ArrowDownIcon, EditIcon, DollarSign } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { ITransaction } from "@/types/transactions"
import { useTransactionsStore } from "@/app/stores/transactionStore"

interface TransactionListProps {
  onEditTransaction?: (transaction: ITransaction) => void
}

export function TransactionList({ onEditTransaction }: TransactionListProps) {
  const { transactions, summaryData: { totalBalance } } = useTransactionsStore();

  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = useState("all")

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100)
  }

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || transaction.type === filterType

    const matchesCategory = filterCategory === "all" || transaction.category === filterCategory

    return matchesSearch && matchesType && matchesCategory
  })

  // Group transactions by month and year
  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    const monthYear = format(date, "MMMM 'de' yyyy", { locale: ptBR });
    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(transaction);
    return acc;
  }, {} as Record<string, ITransaction[]>);

  const categories = Array.from(new Set(transactions.map((t) => t.category)))

  // Define a type for the month names
  type MonthName = "janeiro" | "fevereiro" | "março" | "abril" | "maio" | "junho" | "julho" | "agosto" | "setembro" | "outubro" | "novembro" | "dezembro";

  // Use the new type for the monthMap
  const monthMap: Record<MonthName, number> = {
    "janeiro": 0, "fevereiro": 1, "março": 2, "abril": 3,
    "maio": 4, "junho": 5, "julho": 6, "agosto": 7,
    "setembro": 8, "outubro": 9, "novembro": 10, "dezembro": 11
  };

  // Your sorting function remains the same, but now it's type-safe
  const sortedMonths = Object.keys(groupedTransactions).sort((a, b) => {
    const [monthNameA, yearA] = a.toLowerCase().split(" de ") as [MonthName, string];
    const [monthNameB, yearB] = b.toLowerCase().split(" de ") as [MonthName, string];

    const dateA = new Date(Number(yearA), monthMap[monthNameA], 1);
    const dateB = new Date(Number(yearB), monthMap[monthNameB], 1);

    return dateB.getTime() - dateA.getTime();
  });

  const { totalIncome, totalExpense }: {
    totalIncome: number,
    totalExpense: number
  } = transactions.reduce((acc, t) => {

    if (t.type == "expense") {
      acc.totalExpense += t.amount
    } else {
      acc.totalIncome += t.amount
    }

    return acc
  }, { totalIncome: 0, totalExpense: 0 })

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowUpIcon className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Receitas</p>
                <p className="text-lg font-bold text-green-600">{formatCurrency(totalIncome)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ArrowDownIcon className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Despesas</p>
                <p className="text-lg font-bold text-red-600">{formatCurrency(totalExpense)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <div>
                <p className="text-sm text-muted-foreground">Saldo</p>
                <p
                  className={`text-lg font-bold ${totalBalance >= 0 ? "text-green-700" : "text-red-600"}`}
                >
                  {formatCurrency(totalBalance)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por descrição ou categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={filterType} onValueChange={(value: "all" | "income" | "expense") => setFilterType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Receitas</SelectItem>
                  <SelectItem value="expense">Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Transações ({filteredTransactions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma transação encontrada</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedMonths.map((monthYear) => (
                <div key={monthYear} className="space-y-4">
                  <h2 className="text-lg font-semibold text-muted-foreground capitalize">{monthYear}</h2>
                  <div className="space-y-4">
                    {groupedTransactions[monthYear]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((transaction) => (
                        <div
                          key={transaction.id}
                          className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className={`p-2 rounded-full ${transaction.type === "income"
                                ? "bg-green-100 dark:bg-green-900/20"
                                : "bg-red-100 dark:bg-red-900/20"
                                }`}
                            >
                              {transaction.type === "income" ? (
                                <ArrowUpIcon className="h-4 w-4 text-green-600" />
                              ) : (
                                <ArrowDownIcon className="h-4 w-4 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{transaction.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs">
                                  {transaction.category}
                                </Badge>
                                <span className="text-sm text-muted-foreground">{(transaction.date.toString())}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p
                                className={`text-lg font-bold ${transaction.type === "income" ? "text-green-600" : "text-red-600"
                                  }`}
                              >
                                {transaction.type === "income" ? "+" : "-"}
                                {formatCurrency(transaction.amount)}
                              </p>
                            </div>
                            {onEditTransaction && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditTransaction(transaction)}
                                className="h-8 w-8 p-0"
                              >
                                <EditIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}