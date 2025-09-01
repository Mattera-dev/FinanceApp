"use client"

import { useState, useEffect, KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Coins, Building2, ArrowRight, ArrowLeft } from "lucide-react"
import { PageLayout } from "@/components/page-layout"
import { LucideIcon } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"

interface InvestmentOption {
  id: string
  title: string
  icon: LucideIcon
  description: string
  color: string
  bgColor: string
  risk: string
  rentabilidade: string
}

interface StockData {
  symbol: string
  price: string
  changePercent: string
  rentabilidadeAnual: string
  lastUpdated: string
  source: string
}

const investmentOptions: InvestmentOption[] = [
  { id: "acoes", title: "Ações", icon: Building2, description: "Invista em empresas listadas na bolsa", color: "text-green-600", bgColor: "bg-green-100", risk: "Alto", rentabilidade: "+12.5%" },
  { id: "criptomoedas", title: "Criptomoedas", icon: Coins, description: "Moedas digitais descentralizadas", color: "text-yellow-600", bgColor: "bg-yellow-100", risk: "Muito Alto", rentabilidade: "+24.7%" },
];

const predefinedTickers: Record<string, string[]> = {
  "acoes": ["PETR4", "VALE3", "ITUB4", "BBDC4", "BBAS3"],
  "criptomoedas": ["BTC", "ETH", "DOGE", "LTC", "XRP"]
};

const getRiskColor = (risk: string): string => {
  switch (risk) {
    case "Baixo": return "bg-green-600/20 text-green-800";
    case "Médio": return "bg-yellow-600/20 text-yellow-800";
    case "Alto": return "bg-red-600/20 text-red-800";
    case "Muito Alto": return "bg-red-600/30 text-red-800";
    default: return "bg-muted-foreground/20 text-muted-foreground";
  }
};

export default function InvestmentDashboard() {
  const [selectedInvestment, setSelectedInvestment] = useState<string | null>(null);
  const [searchTicker, setSearchTicker] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [tickerList, setTickerList] = useState<StockData[]>([]);

  const handleSearch = async () => {
    if (!searchTicker) return;

    // Lógica de validação melhorada para diferenciar tickers de ações e criptos.
    // Tickers de ações no Brasil geralmente terminam com um número.
    const isBrazilianStock = /[0-9]$/.test(searchTicker);
    // Tickers de criptomoedas são geralmente curtos e compostos apenas por letras.
    const isCrypto = searchTicker.length <= 5 && /^[A-Z]+$/.test(searchTicker);

    if (selectedInvestment === "acoes" && !isBrazilianStock) {
      toast.error("Por favor, insira um ticker de ação (ex: PETR4, VALE3).");
      return;
    }

    if (selectedInvestment === "criptomoedas" && !isCrypto) {
      toast.error("Por favor, insira um ticker de criptomoeda (ex: BTC, ETH).");
      return;
    }


    // Verificar se o ticker já está na lista
    const existingTickerIndex = tickerList.findIndex(item => item.symbol === searchTicker);
    if (existingTickerIndex !== -1) {
      // Se existir, reordenar a lista para colocar o ticker no topo
      const existingTicker = tickerList[existingTickerIndex];
      const newTickerList = [
        existingTicker,
        ...tickerList.slice(0, existingTickerIndex),
        ...tickerList.slice(existingTickerIndex + 1)
      ];
      setTickerList(newTickerList);
      toast.info(`O ticker ${searchTicker} já está na lista.`);
      return;
    }

    setLoading(true);
    const result = await fetchDataFromApi(searchTicker, selectedInvestment as string);
    if (result) {
      setTickerList(prev => [result, ...prev]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const fetchDataFromApi = async (ticker: string, type: string): Promise<StockData | null> => {
    try {
      const endpoint: string = type === 'acoes' ? `/api/invests/stock?ticker=${ticker}` : `/api/invests/crypto?ticker=${ticker}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      if (res.ok) {
        return data as StockData;
      } else {
        toast.error(data.error || `Ocorreu um erro ao buscar os dados para o ticker ${ticker}.`);
        return null;
      }
    } catch (err) {
      toast.error("Ocorreu um erro na requisição. Verifique a conexão com a API.");
      return null;
    }
  };

  const fetchPredefinedTickers = async (type: string): Promise<void> => {
    setLoading(true);
    setTickerList([]);
    const tickers = predefinedTickers[type];
    const dataPromises = tickers.map(ticker => fetchDataFromApi(ticker, type));
    const results = await Promise.all(dataPromises);
    setTickerList(results.filter((result): result is StockData => result !== null));
    setLoading(false);
  };

  useEffect(() => {
    if (selectedInvestment) {
      fetchPredefinedTickers(selectedInvestment);
    }
  }, [selectedInvestment]);

  const renderInvestmentSelection = () => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-6">Opções de Investimento</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investmentOptions.map((option: InvestmentOption) => {
          const Icon = option.icon;
          return (
            <Card
              key={option.id}
              className="group hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-muted/40 hover:border-primary/30"
              onClick={() => setSelectedInvestment(option.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${option.bgColor}`}>
                    <Icon className={`h-6 w-6 ${option.color}`} />
                  </div>
                  <Badge className={getRiskColor(option.risk)}>
                    {option.risk}
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {option.title}
                </CardTitle>
                <CardDescription>{option.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Rentabilidade</span>
                    <span className={`font-bold ${option.color}`}>
                      {option.rentabilidade}
                    </span>
                  </div>
                </div>
                <div className="flex justify-end mt-4">
                  <Button variant="ghost" className="gap-2">
                    Explorar <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const renderTickerList = () => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setSelectedInvestment(null)} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Opções
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Buscar Outro Ativo</CardTitle>
          <CardDescription>Não encontrou o que procurava? Busque por um ticker específico.</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input
            id="search-ticker"
            placeholder="Ex: AMZN, BTC"
            value={searchTicker}
            onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleSearch} disabled={loading}>
            Buscar
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedInvestment === "acoes" ? "Ações Populares" : "Criptomoedas Populares"}
          </CardTitle>
          <CardDescription>
            Aqui estão alguns exemplos para você começar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p>Carregando dados...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickerList.map((item: StockData) => (
                <Card key={item.symbol} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xl font-bold">{item.symbol}</h3>
                      <Badge variant="secondary" className={item.changePercent?.includes('-') ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}>
                        {selectedInvestment === "acoes" ? (Number(item.changePercent.split("%")[0]) / 100).toString().substring(0, 4) : Number(item.changePercent.split("%")[0])}%
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Preço:</span>
                        <span className="font-semibold">{formatCurrency(Number(item.price))}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Última atualização:</span>
                        <span>{format(item.lastUpdated, "Pp", { locale: ptBR })}</span>
                      </div>
                      <div className="flex justify-end items-center text-xs text-muted-foreground mt-2">
                        <span>Fonte: {item.source}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <PageLayout>
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Explore Oportunidades de Investimento
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Diversifique seu portfólio com as melhores opções do mercado.
          </p>
        </div>
        {selectedInvestment ? renderTickerList() : renderInvestmentSelection()}
      </main>
    </PageLayout>
  );
}