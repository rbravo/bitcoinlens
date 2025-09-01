export interface PriceItem {
  text: string;
  value: number;
  currency: 'BRL' | 'USD';
  bitcoinValue: number;
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface BitcoinPrices {
  BRL: number;
  USD: number;
}

export interface OCRBlock {
  blockText: string;
  blockFrame: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  blockCornerPoints: Array<{x: number; y: number}>;
  lines: any[];
}

export interface OCRData {
  blocks: OCRBlock[];
  resultText: string;
}
