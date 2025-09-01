import { BitcoinPrices } from './types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl,usd';

export const fetchBitcoinPrices = async (): Promise<BitcoinPrices | null> => {
  try {
    const response = await fetch(COINGECKO_API);
    const data = await response.json();
    
    if (data.bitcoin && data.bitcoin.brl && data.bitcoin.usd) {
      const prices = {
        BRL: data.bitcoin.brl,
        USD: data.bitcoin.usd,
      };
      console.log('Bitcoin price updated:', prices);
      return prices;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Bitcoin prices:', error);
    return null;
  }
};
