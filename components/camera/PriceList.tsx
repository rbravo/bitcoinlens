import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PriceItem } from './types';

interface PriceListProps {
    detectedPrices: PriceItem[];
    showInSatoshis?: boolean;
    onToggleUnit?: () => void;
}

export const PriceList: React.FC<PriceListProps> = ({ detectedPrices, showInSatoshis = false, onToggleUnit }) => {
    const insets = useSafeAreaInsets();

    // Remove preços duplicados baseado no valor e moeda
    const uniquePrices = detectedPrices.filter((item, index, self) =>
        index === self.findIndex(p => p.value === item.value && p.currency === item.currency)
    );

    if (uniquePrices.length === 0) {
        return (
            <View style={[styles.container, { paddingBottom: insets.bottom + 16 }]}>
                <Text style={styles.noDataText}>Aponte a câmera para preços em R$ ou US$</Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { paddingBottom: insets.bottom + 16 }]} showsVerticalScrollIndicator={false}>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Preços Detectados</Text>
                {/* Botão de trocar de Bitcoin para Satoshis */}
                {onToggleUnit && (
                    <TouchableOpacity
                        style={styles.toggleButton}
                        onPress={onToggleUnit}
                    >
                        {showInSatoshis ?
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name='logo-bitcoin' size={18} color='#fff' />
                                <Text style={styles.toggleButtonText}>
                                    Bitcoin
                                </Text>
                            </View>
                            :
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Ionicons name='flash' size={16} color='#fff' />
                                <Text style={styles.toggleButtonText}>
                                    Satoshis
                                </Text>
                            </View>
                        }
                    </TouchableOpacity>
                )}
            </View>
            {uniquePrices.map((item, index) => {
                const satoshiValue = item.bitcoinValue * 100000000; // 1 BTC = 100,000,000 satoshis
                return (
                    <View key={index} style={styles.priceItem}>
                        <Text style={styles.originalPrice}>{item.text}</Text>
                        <Text style={styles.bitcoinPrice}>
                            {showInSatoshis
                                ? `⚡ ${Math.round(satoshiValue).toLocaleString()} sats`
                                : `₿ ${item.bitcoinValue.toFixed(8)}`
                            }
                        </Text>
                    </View>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        maxHeight: 300,
        //width: 200,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderTopRightRadius: 12,
        borderTopLeftRadius: 12,
        padding: 16,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'left',
    },
    toggleButton: {
        backgroundColor: '#f7931a',
        //width: 32,
        paddingHorizontal: 12,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    toggleButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
    },
    priceItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        padding: 8,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    originalPrice: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    bitcoinPrice: {
        color: '#f7931a',
        fontSize: 14,
        marginTop: 4,
    },
    noDataText: {
        color: '#ccc',
        fontSize: 14,
        textAlign: 'center',
        fontStyle: 'italic',
    },
});
