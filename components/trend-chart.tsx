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
import { useTransactionsStore } from "@/app/stores/transactionStore"
import { useEffect } from "react"
import { ITransaction } from "@/types/transactions"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Função para processar os dados para o formato do gráfico
const processChartData = (transactions: ITransaction[]) => {
  const now = new Date();
  const months = ['jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.', 'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.'];

  // Cria os rótulos dinâmicos dos últimos 6 meses, contando com o mês atual
  const labels: string[] = [];
  const monthlyData: Record<string, { income: number, expenses: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = `${months[d.getMonth()]}`;
    labels.push(label);
    monthlyData[label] = { income: 0, expenses: 0 };
  }

  // Mapeia as transações para os meses corretos
  transactions.forEach(t => {
    const transactionDate = new Date(t.date);
    const monthLabel = `${months[transactionDate.getMonth()]}`;

    // Certifique-se de que estamos atualizando apenas os meses que fazem parte do gráfico
    if (monthlyData[monthLabel]) {
      if (t.type === 'income') {
        monthlyData[monthLabel].income += (t.amount / 100);
      } else if (t.type === 'expense') {
        monthlyData[monthLabel].expenses += (t.amount / 100);
      }
    }
  });

  return {
    labels: labels,
    income: labels.map(label => monthlyData[label].income),
    expenses: labels.map(label => monthlyData[label].expenses),
  };
};

export function TrendChart() {
  const { transactions, loading, fetchLastSixMonthsTransactions } = useTransactionsStore();

  useEffect(() => {
    // Busca as transações dos últimos 6 meses
    fetchLastSixMonthsTransactions();
  }, [fetchLastSixMonthsTransactions]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evolução Financeira</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex justify-center items-center">
            <p>Carregando dados do gráfico...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const processedData = processChartData(transactions);

  const chartData = {
    labels: processedData.labels,
    datasets: [
      {
        label: "Receitas",
        data: processedData.income,
        borderColor: "#16a34a",
        backgroundColor: "rgba(22, 163, 74, 0.1)",
        tension: 0.4,
        fill: false,
      },
      {
        label: "Despesas",
        data: processedData.expenses,
        borderColor: "#dc2626",
        backgroundColor: "rgba(220, 38, 38, 0.1)",
        tension: 0.4,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.dataset.label}: R$ ${(context.parsed.y).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
        },
      },
    },
  };

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
  );
}