"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line } from "react-chartjs-2"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

interface TrendChartProps {
  data: {
    labels: string[]
    income: number[]
    expenses: number[]
  }
}

export function TrendChart({ data }: TrendChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: "Receitas",
        data: data.income,
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.1)",
        tension: 0.4,
        fill: false,
      },
      {
        label: "Despesas",
        data: data.expenses,
        borderColor: "#dc2626",
        backgroundColor: "rgba(220, 38, 38, 0.1)",
        tension: 0.4,
        fill: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: R$ ${context.parsed.y.toLocaleString("pt-BR")}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `R$ ${value.toLocaleString("pt-BR")}`,
        },
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evolução Financeira - Últimos 6 Meses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <Line data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
