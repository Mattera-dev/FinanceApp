import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { getDataFromToken } from '@/lib/utils';

const ALPHA_VANTAGE_API_KEY = process.env.AV_API_KEY;
const BRAPI_API_KEY = process.env.BAPI_API_KEY;

const fetchBrapiData = async (ticker: string) => {
    try {
        const res = await fetch(`https://brapi.dev/api/quote/${ticker}?token=${BRAPI_API_KEY}`);
        const data = await res.json();
        if (data.error || !data.results || data.results.length === 0) {
            return null;
        }
        const quote = data.results[0];
        const relevantData = {
            symbol: quote.symbol,
            price: quote.regularMarketPrice ? parseFloat(quote.regularMarketPrice).toFixed(2) : 'N/A',
            changePercent: quote.regularMarketChangePercent ? (quote.regularMarketChangePercent * 100).toFixed(2) + '%' : 'N/A',
            lastUpdated: new Date().toISOString(),
            source: 'brapi'
        };
        return relevantData;
    } catch (err) {
        console.error("Erro na Brapi:", err);
        return null;
    }
};

const fetchAlphaVantageData = async (ticker: string) => {
    try {
        const quoteRes = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`);
        const quoteData = await quoteRes.json();
        if (quoteData["Error Message"]) {
            return null;
        }
        const quote = quoteData["Global Quote"];
        const relevantData = {
            symbol: quote["01. symbol"],
            price: parseFloat(quote["05. price"]).toFixed(2),
            changePercent: quote["10. change percent"],
            lastUpdated: new Date().toISOString(),
            source: 'alphavantage'
        };
        return relevantData;
    } catch (err) {
        console.error("Erro no Alpha Vantage:", err);
        return null;
    }
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get('ticker');
    const token = getDataFromToken(req)
    if (!token) {
        return NextResponse.json({ error: "acesso nao permitido." }, { status: 401 });
    }
    if (!ticker) {
        return NextResponse.json({ error: "Ticker não fornecido." }, { status: 400 });
    }
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    try {
        const cachedData = await prisma.stockData.findUnique({
            where: { symbol: ticker.toUpperCase() }
        });
        if (cachedData && new Date(cachedData.lastUpdated) > yesterday) {
            console.log(`Dados de ${ticker} retornados do cache.`);
            return NextResponse.json(cachedData, { status: 200 });
        }
        let relevantData = null;
        relevantData = await fetchBrapiData(ticker);
        if (!relevantData) {
            console.log(`Falha com Brapi. Tentando Alpha Vantage para ${ticker}...`);
            relevantData = await fetchAlphaVantageData(ticker);
        }
        if (relevantData) {
            await prisma.stockData.upsert({
                where: { symbol: relevantData.symbol },
                update: { ...relevantData, lastUpdated: new Date() },
                create: { ...relevantData, lastUpdated: new Date() }
            });
            console.log(`Dados de ${ticker} salvos/atualizados no banco de dados.`);
            return NextResponse.json(relevantData, { status: 200 });
        } else {
            console.log("nao achou nada!")
            return NextResponse.json({ error: `Dados para o ticker ${ticker} não disponíveis em nenhuma API.` }, { status: 404 });
        }
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
    }
}
