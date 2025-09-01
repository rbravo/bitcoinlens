import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PriceItem } from './types';

interface PriceOverlayProps {
  item: PriceItem;
  screenWidth: number;
  screenHeight: number;
  showInSatoshis?: boolean;
}

export const PriceOverlay: React.FC<PriceOverlayProps> = ({ item, screenWidth, screenHeight, showInSatoshis = false }) => {
  if (!item.coordinates) {
    return null;
  }

  const { x, y, width, height } = item.coordinates;

  return;
  
  // Validação de coordenadas
  if (x < 0 || y < 0 || width <= 0 || height <= 0) {
    return null;
  }

  const myX = x-50;
  const myY = y+50;

  const satoshiValue = item.bitcoinValue * 100000000; // 1 BTC = 100,000,000 satoshis
  const displayText = showInSatoshis 
    ? `⚡ ${Math.round(satoshiValue).toLocaleString()} sats`
    : `₿ ${item.bitcoinValue.toFixed(8)}`;

  return (
    <>
      {/* Borda simples ao redor do preço detectado */}
      <View
        style={[
          styles.priceBox,
          {
            left: myX - 4,
            top: myY - 4,
            width: width + 22,
            height: height + 22,
          },
        ]}
      />
      
      {/* Valor em Bitcoin posicionado acima do preço */}
      <View
        style={[
          styles.bitcoinOverlay,
          {
            left: myX,
            top: myY - 30, // Reduzido de 25 para 10 para ficar ainda mais próximo
            minWidth: width,
          },
        ]}
      >
        <View style={styles.bitcoinBox}>
          <Text style={styles.bitcoinText}>{displayText}</Text>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  priceBox: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#ff6b35',
    borderRadius: 4,
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
  },
  bitcoinOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bitcoinBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    borderColor: '#f7931a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  bitcoinText: {
    color: '#f7931a',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
