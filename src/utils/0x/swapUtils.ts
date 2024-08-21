// utils/swapUtils.ts
import { sepolia } from "thirdweb/chains";
import { prepareTransaction } from "thirdweb";
import { client } from "../thirdweb/client";

function qs(obj: any) {
    return Object.keys(obj)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
        .join('&');
}

async function getQuote(fm: string, to: string, from_amount: bigint) {
    const params = {
        sellToken: fm,
        buyToken: to,
        sellAmount: from_amount.toString()
    };
    
    const headers = {'0x-api-key': '615cde0f-2cc2-4ffd-8c6e-d376603e0a1b'};
    const response = await fetch(`https://sepolia.api.0x.org/swap/v1/quote?${qs(params)}`, { headers });
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const swapQuoteJSON = await response.json();
    return swapQuoteJSON;
}

export async function trySwap(account: string, fm: string, to: string, from_amount: bigint) {
    const swapQuoteJSON = await getQuote(fm, to, from_amount);
    swapQuoteJSON.chain = sepolia;
    swapQuoteJSON.client = client;
    const transaction = prepareTransaction(swapQuoteJSON);
    return transaction;
}