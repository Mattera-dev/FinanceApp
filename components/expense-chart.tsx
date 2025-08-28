"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

interface ExpenseChartProps {
  data: Array<{
    category: string
    amount: number
    color: string
  }>
}

export function ExpenseChart({ data }: ExpenseChartProps) {
  const chartData = {
    labels: data.map((item) => item.category),
    datasets: [
      {
        data: data.map((item) => item.amount),
        backgroundColor: data.map((item) => item.color),
        borderWidth: 0,
        cutout: "60%",
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.parsed
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${context.label}: R$ ${value.toLocaleString("pt-BR")} (${percentage}%)`
          },
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Doughnut data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
