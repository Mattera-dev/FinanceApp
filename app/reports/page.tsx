"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getAuthCookie } from "@/lib/auth"
import { PageLayout } from "@/components/page-layout"
import { LoadingPage } from "@/components/loading-spinner"
import { EmptyState } from "@/components/empty-state"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3Icon } from "lucide-react"
import { getTransactions } from "@/lib/data-manager"

export default function ReportsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    const authData = getAuthCookie()
    if (!authData) {
      router.push("/auth")
    } else {
      const transactions = getTransactions()
      setHasData(transactions.length > 0)
      setIsLoading(false)
    }
  }, [router])

  if (isLoading) {
    return <LoadingPage message="Carregando relatórios..." />
  }

  if (!hasData) {
    return (
      <PageLayout>
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-primary">Relatórios</h1>
              <p className="text-muted-foreground">Análises detalhadas das suas finanças</p>
            </div>

            <EmptyState
              icon={BarChart3Icon}
              title="Relatórios em breve"
              description="Adicione algumas transações primeiro para ver relatórios detalhados das suas finanças."
              action={{
                label: "Adicionar Transação",
                onClick: () => router.push("/transactions/new"),
              }}
            />
          </div>
        </main>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-primary">Relatórios</h1>
            <p className="text-muted-foreground">Análises detalhadas das suas finanças</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Relatórios Avançados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Funcionalidade em desenvolvimento. Em breve você terá acesso a relatórios detalhados com:
              </p>
              <ul className="list-disc list-inside mt-4 space-y-2 text-muted-foreground">
                <li>Análise de gastos por período</li>
                <li>Comparativo mensal e anual</li>
                <li>Projeções financeiras</li>
                <li>Relatórios de economia</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </PageLayout>
  )
}
