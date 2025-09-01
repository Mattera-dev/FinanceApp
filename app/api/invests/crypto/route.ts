import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getDataFromToken } from '@/lib/utils';

// Definir as chaves da API a partir das variáveis de ambiente
const COINGECKO_API_KEY = process.env.CG_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.AV_API_KEY;

// Função para buscar dados do CoinGecko (com chave de API)
const fetchCoinGeckoData = async (coinId: string) => {
    try {
        // Usando o endpoint que requer a chave de API
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?symbols=${coinId}&vs_currencies=brl&include_24hr_change=true`, {
            headers: { 'x-cg-demo-api-key': COINGECKO_API_KEY || '' }
        });
        const data = await res.json();

        // A API retorna um objeto com o ID da moeda como chave.
        if (Object.keys(data).length === 0) {
            return null;
        }

        // Obtém a primeira chave (que é o ID da moeda, por exemplo 'solana')
        const dataKey = Object.keys(data)[0];
        const coinData = data[dataKey];

        // Verificar se a moeda e a cotação em BRL existem na resposta
        if (!coinData || !coinData.brl) {
            return null;
        }

        const relevantData = {
            symbol: coinId.toUpperCase(),
            price: parseFloat(coinData.brl).toFixed(2),
            changePercent: coinData.brl_24h_change ? `${parseFloat(coinData.brl_24h_change).toFixed(2)}%` : 'N/A',
            lastUpdated: new Date().toISOString(),
            source: 'coingecko'
        };
        return relevantData;
    } catch (err) {
        console.error("Erro na CoinGecko:", err);
        return null;
    }
};

// Função para buscar dados da Alpha Vantage como fallback
const fetchAlphaVantageCryptoData = async (ticker: string) => {
    try {
        const res = await fetch(`https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${ticker}&market=BRL&apikey=${ALPHA_VANTAGE_API_KEY}`);
        const data = await res.json();

        if (data["Error Message"] || data["Note"] || !data["Time Series (Digital Currency Daily)"]) {
            return null;
        }

        // Encontrar a entrada mais recente nos dados da série temporal
        const timeSeries = data["Time Series (Digital Currency Daily)"];
        const latestKey = Object.keys(timeSeries)[0];
        const latestData = timeSeries[latestKey];

        const relevantData = {
            symbol: data["Meta Data"]["2. Digital Currency Code"],
            price: parseFloat(latestData["4b. close (BRL)"]).toFixed(2),
            changePercent: 'N/A', // A API de "daily" não fornece a mudança percentual de forma simples
            lastUpdated: new Date().toISOString(),
            source: 'alphavantage'
        };
        return relevantData;
    } catch (err) {
        console.error("Erro na Alpha Vantage:", err);
        return null;
    }
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get('ticker');
    const token = getDataFromToken(req);

    if (!token) {
        return NextResponse.json({ error: "acesso nao permitido." }, { status: 401 });
    }
    if (!ticker) {
        return NextResponse.json({ error: "Ticker não fornecido." }, { status: 400 });
    }

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const normalizedTicker = ticker.toLowerCase();

    try {
        const cachedData = await prisma.cryptoData.findUnique({
            where: { symbol: normalizedTicker }
        });

        if (cachedData && new Date(cachedData.lastUpdated) > hourAgo) {
            return NextResponse.json(cachedData, { status: 200 });
        }

        let relevantData = null;

        // Tentar CoinGecko primeiro
        relevantData = await fetchCoinGeckoData(normalizedTicker);

        // Se o CoinGecko falhar, tentar Alpha Vantage como fallback
        if (!relevantData) {
            relevantData = await fetchAlphaVantageCryptoData(ticker.toUpperCase());
        }

        if (relevantData) {
            // Upsert dos dados no banco de dados. O Prisma vai criar se não existir ou atualizar se já existir.
            await prisma.cryptoData.upsert({
                where: { symbol: relevantData.symbol },
                update: { ...relevantData, lastUpdated: new Date() },
                create: { ...relevantData, lastUpdated: new Date() }
            });
            return NextResponse.json(relevantData, { status: 200 });
        } else {
            return NextResponse.json({ error: `Dados para o ticker ${ticker} não disponíveis em nenhuma API.` }, { status: 404 });
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
    }
}