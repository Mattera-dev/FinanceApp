"use client"
import { useTransactionsStore } from "@/app/stores/transactionStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ITransaction } from "@/types/transactions"
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js"
import { Doughnut } from "react-chartjs-2"

ChartJS.register(ArcElement, Tooltip, Legend)

// Mapeamento de cores para as categorias
const categoryColors: Record<string, string> = {
  Moradia: "#3b82f6", // blue-500
  Alimentação: "#ef4444", // red-500
  Transporte: "#8b5cf6", // violet-500
  Lazer: "#f97316", // orange-500
  Saúde: "#10b981", // emerald-500
  Outros: "#64748b", // slate-500
}

// Função para processar os dados da store para o gráfico
const processChartData = (transactions: ITransaction[]) => {
  // Filtra apenas as despesas
  const expenses = transactions.filter(t => t.type === 'expense');

  // Agrupa as despesas por categoria e soma os valores
  const groupedExpenses = expenses.reduce((acc, current) => {
    // Nota: Supondo que sua transação tenha um campo 'category'
    const category = current.category || 'Outros';

    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += current.amount;
    return acc;
  }, {} as Record<string, number>);

  // Extrai rótulos, valores e cores para o gráfico
  const labels = Object.keys(groupedExpenses);
  const dataPoints = labels.map(label => groupedExpenses[label]);
  const colors = labels.map(label => categoryColors[label] || categoryColors.Outros);

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

  // Processa os dados da store para o gráfico
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
            const value = context.parsed / 100;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${percentage}%)`;
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