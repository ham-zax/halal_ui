// api/tokenApi.ts
import { TokenInfo, ApiV3Token } from '@raydium-io/raydium-sdk-v2'

export async function fetchJupiterTokens(): Promise<TokenInfo[]> {
  const response = await fetch('https://tokens.jup.ag/tokens?tags=lst,community')
  const data = await response.json()
  
  const tokenList =  data.map((token: any): TokenInfo => ({
    chainId: 101, 
    address: token.address,
    programId: '', 
    logoURI: token.logoURI,
    symbol: token.symbol,
    name: token.name,
    decimals: token.decimals,
    tags: token.tags,
    extensions: {}, 
    priority: 0, 
    userAdded: false,
    type: 'jupiter', 
  }))
  console.log(tokenList)
  return tokenList
}