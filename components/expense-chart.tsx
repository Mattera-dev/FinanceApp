"use client"
import { useTransactionsStore } from "@/app/stores/transactionStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ITransaction } from "@/types/transactions"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

// Array fixo de cores para as categorias
const fixedColors = [
  "#3b82f6", // blue-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#f97316", // orange-500
  "#10b981", // emerald-500
  "#64748b", // slate-500
  "#eab308", // yellow-500
  "#d946ef", // fuchsia-500
  "#14b8a6", // teal-500
  "#f43f5e", // rose-500
]

const processChartData = (transactions: ITransaction[]) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const currentMonthExpenses = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear && t.type === 'expense';
  });

  const groupedExpenses = currentMonthExpenses.reduce((acc, current) => {
    const category = current.category || 'Outros';

    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += current.amount;
    return acc;
  }, {} as Record<string, number>);

  const labels = Object.keys(groupedExpenses);
  const dataPoints = labels.map(label => groupedExpenses[label]);
  const colors = labels.map((_, index) => fixedColors[index % fixedColors.length]);

  return {
    labels,
    data: dataPoints,
    backgroundColor: colors,
  };
};

export function ExpenseChart() {
  const { transactions, loading } = useTransactionsStore();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gastos por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex justify-center items-center">
            <p>Carregando dados do gráfico...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { labels, data, backgroundColor } = processChartData(transactions);

  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data,
        backgroundColor: backgroundColor,
        borderWidth: 0,
        cutout: "60%",
      },
    ],
  };

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
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: R$ ${(value / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${percentage}%)`;
          },
        },
      },
    },
  };

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
  );
}