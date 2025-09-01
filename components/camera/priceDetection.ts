import { BitcoinPrices, OCRData, PriceItem } from './types';

const PRICE_PATTERNS = [
  /R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/g,
  /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g,
];

export const detectPrices = (data: OCRData, bitcoinPrices: BitcoinPrices): PriceItem[] => {
  if (!data.blocks || !bitcoinPrices.BRL || !bitcoinPrices.USD) {
    return [];
  }

  const items: PriceItem[] = [];

  data.blocks.forEach((block) => {
    const text = block.blockText;
    
    // Debug log para ver o texto sendo analisado
    //console.log('Analyzing text:', text);
    //console.log('Block frame structure:', JSON.stringify(block.blockFrame, null, 2));
    //console.log('Block corner points:', JSON.stringify(block.blockCornerPoints, null, 2));

    // Detecta preços baseado no símbolo de moeda encontrado
    
    // Verifica se tem R$ (Real brasileiro)
    const realPattern = /R\$\s*[\d.,]+/gi;
    const realMatches = text.match(realPattern);
    
    if (realMatches) {
      realMatches.forEach((match) => {
        //console.log('Real match found:', match);
        
        // Extrai apenas os números, vírgulas e pontos
        const numberPart = match.replace(/R\$\s*/i, '').trim();
        //console.log('Number part:', numberPart);
        
        // Se tem vírgula, trata como decimal brasileiro (4,50)
        let value;
        if (numberPart.includes(',')) {
          // Formato brasileiro: 1.234,56
          const cleanMatch = numberPart.replace(/\./g, '').replace(',', '.');
          value = parseFloat(cleanMatch);
        } else {
          // Formato sem decimais ou americano: 1234 ou 1234.56
          value = parseFloat(numberPart.replace(/,/g, ''));
        }
        
        //console.log('Parsed value:', value);
        
        if (!isNaN(value) && value > 0) {
          const bitcoinValue = value / bitcoinPrices.BRL;
          
          // Extrai coordenadas do blockFrame
          let coordinates;
          if (block.blockFrame) {
            coordinates = {
              x: block.blockFrame.x || 0,
              y: block.blockFrame.y || 0,
              width: block.blockFrame.width || 100,
              height: block.blockFrame.height || 30,
            };
            //console.log('Extracted coordinates for price:', match, coordinates);
          }

          items.push({
            text: match,
            value,
            currency: 'BRL',
            bitcoinValue,
            coordinates,
          });
        }
      });
    }

    // Detecta preços em Dólares (apenas $ sem R$ na frente)
    // Procura por $ que não tenha R antes dele
    const dollarPattern = /\$\s*[\d.,]+/gi;
    const allDollarMatches = text.match(dollarPattern);
    
    if (allDollarMatches) {
      // Filtra apenas os $ que não fazem parte de R$
      const dollarMatches = allDollarMatches.filter(match => {
        const indexInText = text.indexOf(match);
        const charBefore = text.charAt(indexInText - 1);
        return charBefore !== 'R';
      });
      
      if (dollarMatches.length > 0) {
      dollarMatches.forEach((match) => {
        //console.log('Dollar match found:', match);
        
        // Extrai apenas os números, vírgulas e pontos
        const numberPart = match.replace(/\$\s*/i, '').trim();
        //console.log('Number part:', numberPart);
        
        // Para dólares, usa formato americano (vírgula para milhares, ponto para decimais)
        let value;
        
        // Analisa o padrão do número para determinar o formato
        if (numberPart.includes(',') && numberPart.includes('.')) {
          // Formato americano completo: 1,234.56 (vírgula = milhares, ponto = decimais)
          const cleanMatch = numberPart.replace(/,/g, '');
          value = parseFloat(cleanMatch);
        } else if (numberPart.includes(',') && !numberPart.includes('.')) {
          // Só vírgula: pode ser milhares (4,970) ou decimais brasileiros (4,50)
          const parts = numberPart.split(',');
          if (parts[1] && parts[1].length === 3) {
            // Provavelmente milhares: 4,970 = 4970
            value = parseFloat(numberPart.replace(/,/g, ''));
          } else {
            // Provavelmente decimais brasileiros: 4,50 = 4.50
            value = parseFloat(numberPart.replace(',', '.'));
          }
        } else if (numberPart.includes('.') && !numberPart.includes(',')) {
          // Só ponto: formato americano com decimais (399.20) ou brasileiro com milhares (4.970)
          const parts = numberPart.split('.');
          if (parts[1] && parts[1].length <= 2) {
            // Provavelmente decimais americanos: 399.20 = 399.20
            value = parseFloat(numberPart);
          } else {
            // Provavelmente milhares brasileiros: 4.970 = 4970
            value = parseFloat(numberPart.replace(/\./g, ''));
          }
        } else {
          // Formato sem separadores: 1234
          value = parseFloat(numberPart);
        }
        
        //console.log('Parsed value:', value);
        
        if (!isNaN(value) && value > 0) {
          const bitcoinValue = value / bitcoinPrices.USD;
          
          // Extrai coordenadas do blockFrame
          let coordinates;
          if (block.blockFrame) {
            coordinates = {
              x: block.blockFrame.x || 0,
              y: block.blockFrame.y || 0,
              width: block.blockFrame.width || 100,
              height: block.blockFrame.height || 30,
            };
            //console.log('Extracted coordinates for price:', match, coordinates);
          }

          items.push({
            text: match,
            value,
            currency: 'USD',
            bitcoinValue,
            coordinates,
          });
        }
        });
      }
    }
  });

  return items;
};
