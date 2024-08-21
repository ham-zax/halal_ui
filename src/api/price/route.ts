// src/app/api/price/route.ts
import { TOKENS } from '@/features/Swap/tokens';
import { NextRequest, NextResponse } from 'next/server';

function qs(obj: any) {
    return Object.keys(obj)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
        .join('&');
}

export async function GET(request: NextRequest) {
    console.log('API route hit');
    const { searchParams } = new URL(request.url);
    const fromToken = searchParams.get('fromToken');
    const toToken = searchParams.get('toToken');
    const amount = searchParams.get('amount');

    console.log('Received params:', { fromToken, toToken, amount });

    if (!fromToken || !toToken || !amount) {
        console.log('Missing parameters');
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const fromTokenObj = TOKENS.find(token => token.address === fromToken);
    const toTokenObj = TOKENS.find(token => token.address === toToken);

    if (!fromTokenObj || !toTokenObj) {
        console.log('Invalid token');
        return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }

    const params = {
        sellToken: fromTokenObj.address,
        buyToken: toTokenObj.address,
        sellAmount: amount,
    };

    const headers = { '0x-api-key': process.env.OX_API_KEY || '' };
    
    try {
        console.log('Fetching from 0x API with params:', params);
        const response = await fetch(`https://sepolia.api.0x.org/swap/v1/price?${qs(params)}`, { headers });
        console.log('0x API response status:', response.status);
        const swapPriceJSON = await response.json();
        console.log('0x API response:', swapPriceJSON);
        return NextResponse.json(swapPriceJSON);
    } catch (error) {
        console.error('Error fetching price:', error);
        return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 });
    }
}