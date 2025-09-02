import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getDataFromToken } from '@/lib/utils';

const COINGECKO_API_KEY = process.env.CG_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.AV_API_KEY;

const fetchCoinGeckoData = async (coinId: string) => {
    try {
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?symbols=${coinId}&vs_currencies=brl&include_24hr_change=true`, {
            headers: { 'x-cg-demo-api-key': COINGECKO_API_KEY || '' }
        });
        const data = await res.json();

        if (Object.keys(data).length === 0) {
            return null;
        }

        const dataKey = Object.keys(data)[0];
        const coinData = data[dataKey];

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

const fetchAlphaVantageCryptoData = async (ticker: string) => {
    try {
        const res = await fetch(`https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY&symbol=${ticker}&market=BRL&apikey=${ALPHA_VANTAGE_API_KEY}`);
        const data = await res.json();

        if (data["Error Message"] || data["Note"] || !data["Time Series (Digital Currency Daily)"]) {
            return null;
        }

        const timeSeries = data["Time Series (Digital Currency Daily)"];
        const latestKey = Object.keys(timeSeries)[0];
        const latestData = timeSeries[latestKey];

        const relevantData = {
            symbol: data["Meta Data"]["2. Digital Currency Code"],
            price: parseFloat(latestData["4b. close (BRL)"]).toFixed(2),
            changePercent: 'N/A', lastUpdated: new Date().toISOString(),
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

        relevantData = await fetchCoinGeckoData(normalizedTicker);

        if (!relevantData) {
            relevantData = await fetchAlphaVantageCryptoData(ticker.toUpperCase());
        }

        if (relevantData) {
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