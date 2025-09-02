import { PriceOverlay } from '@/components/camera/PriceOverlay';
import { ThemedText } from '@/components/ThemedText';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, Image, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchBitcoinPrices } from '../components/camera/bitcoinApi';
import { detectPrices } from '../components/camera/priceDetection';
import { PriceList } from '../components/camera/PriceList';
import { BitcoinPrices, OCRData, PriceItem } from '../components/camera/types';

// Conditional imports for development build vs Expo Go
let Camera: any = null;
let useCameraDevice: any = null;
let useCameraPermission: any = null;

try {
  const visionCamera = require('react-native-vision-camera');
  useCameraDevice = visionCamera.useCameraDevice;
  useCameraPermission = visionCamera.useCameraPermission;

  const textRecognition = require('@solutionsmedias360/react-native-vision-camera-text-recognition');
  Camera = textRecognition.Camera;
} catch (error) {
  console.log('Vision camera not available - running in demo mode');
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function App() {
  const [detectedPrices, setDetectedPrices] = useState<PriceItem[]>([]);
  const [bitcoinPrices, setBitcoinPrices] = useState<BitcoinPrices>({ BRL: 0, USD: 0 });
  const [bitcoinPriceLoaded, setBitcoinPriceLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [showInSatoshis, setShowInSatoshis] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Ref para controlar frequência de atualização (throttle 1s)
  const lastDetectionUpdateRef = useRef<number>(0);
  const [photoMode, setPhotoMode] = useState(false);
  const [capturedPhotoPath, setCapturedPhotoPath] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  const insets = useSafeAreaInsets();

  // Check if camera is available
  const isCameraAvailable = Camera && useCameraDevice && useCameraPermission;
  const device = isCameraAvailable ? useCameraDevice('back') : null;
  const { hasPermission, requestPermission } = isCameraAvailable ? useCameraPermission() : { hasPermission: false, requestPermission: () => Promise.resolve(false) };

  useEffect(() => {
    // Fetch Bitcoin price when component mounts
    fetchBitcoinPrices().then((prices) => {
      if (prices) {
        setBitcoinPrices(prices);
        setBitcoinPriceLoaded(true);
      }
    });

    // Update Bitcoin prices every 30 seconds
    const interval = setInterval(async () => {
      const prices = await fetchBitcoinPrices();
      if (prices) {
        setBitcoinPrices(prices);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isCameraAvailable && !hasPermission) {
      requestPermission().then((granted: boolean) => {
        if (!granted) {
          Alert.alert('Permission Denied', 'Camera permission is required to use this feature.');
        }
      });
    }
  }, [isCameraAvailable, hasPermission, requestPermission]);

  const handleTextRecognition = (data: OCRData) => {
    if (!data || photoMode) return; // não atualiza quando congelado
    const now = Date.now();
    // Só atualiza no máximo 1x por segundo para evitar flicker
    if (now - lastDetectionUpdateRef.current < 1000) {
      return;
    }
    lastDetectionUpdateRef.current = now;

    // Use preços padrão se ainda não carregaram
    const currentPrices = bitcoinPrices.BRL > 0 ? bitcoinPrices : { BRL: 587000, USD: 108000 };
    const prices = detectPrices(data, currentPrices);
    setDetectedPrices(prices);
  };

  const togglePhotoMode = async () => {
    if (photoMode) {
      setPhotoMode(false);
      setCapturedPhotoPath(null);
      lastDetectionUpdateRef.current = 0;
      return;
    }
    // tentar takePhoto do componente Camera (VisionCamera) preservando tela
    try {
      if (cameraRef.current?.takePhoto) {
        const photo = await cameraRef.current.takePhoto({ flash: 'off' });
        const raw = photo?.path || '';
        const uri = raw.startsWith('file://') ? raw : `file://${raw}`;
        if (uri) {
          setCapturedPhotoPath(uri);
        }
      } else {
        // fallback: sem suporte a takePhoto, apenas congela deteção sem imagem estática
        Alert.alert('Captura não suportada', 'Congelando apenas os preços (imagem continuará ao vivo).');
      }
      setPhotoMode(true);
    } catch (e) {
      console.warn('Falha takePhoto', e);
      Alert.alert('Erro', 'Não foi possível capturar a foto.');
    }
  };

  const refreshBitcoinPrices = async () => {
    setIsRefreshing(true);
    try {
      const prices = await fetchBitcoinPrices();
      if (prices) {
        setBitcoinPrices(prices);
        setBitcoinPriceLoaded(true);
      }
    } catch (error) {
      console.error('Erro ao atualizar preços do Bitcoin:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const toggleCamera = () => {
    if (!isCameraAvailable) {
      Alert.alert('Camera não disponível', 'Execute o app em um dispositivo físico com development build.');
      return;
    }

    if (!hasPermission) {
      requestPermission().then((granted: boolean) => {
        if (granted) {
          setIsCameraActive(true);
        } else {
          Alert.alert('Permission Denied', 'Camera permission is required to use this feature.');
        }
      });
      return;
    }

    if (!device) {
      Alert.alert('Camera não encontrada', 'Nenhuma câmera foi encontrada neste dispositivo.');
      return;
    }

    setIsCameraActive(!isCameraActive);
    if (!isCameraActive) {
      setDetectedPrices([]);
    }
  };

  // Main screen with camera toggle
  if (!isCameraActive) {
    return (
      <SafeAreaView style={styles.container} edges={['top','left','right']}> 
        <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.9)" translucent />

        {/* Header */}
        <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 32 : 32 }]}> 
          <View style={{flexDirection: 'row', alignItems: 'center', paddingBottom: 10}}>
            <Ionicons name="logo-bitcoin" size={32} color="#f7931a" 
              style={{ marginRight: 5, marginTop: Platform.OS === 'ios' ? -6 : 0}} />
            <ThemedText style={{...styles.appTitle, marginTop: Platform.OS === 'ios' ? 0 : -10}}>Bitcoin Lens</ThemedText>
            <Entypo name="magnifying-glass" size={32} color="#f7931a" 
              style={{ marginLeft: 5, marginTop: Platform.OS === 'ios' ? -6 : 0}} />
          </View>
          <ThemedText style={styles.subtitle}>
            Detecte preços e converta{'\n'}para Bitcoin em tempo real
          </ThemedText>
        </View>

        {/* Bitcoin Price Display */}
        <View style={styles.bitcoinPriceContainer}>
          <ThemedText style={styles.bitcoinPriceTitle}>Preço do Bitcoin</ThemedText>
          {bitcoinPriceLoaded ? (
            <View style={styles.priceRow}>
              <ThemedText style={styles.bitcoinPrice}>
                R$ {bitcoinPrices.BRL.toLocaleString('pt-BR')}
              </ThemedText>
              <ThemedText style={styles.bitcoinPrice}>
                $ {bitcoinPrices.USD.toLocaleString('en-US')}
              </ThemedText>
            </View>
          ) : (
            <ThemedText style={styles.loadingText}>Carregando...</ThemedText>
          )}
        </View>

        {/* Main Camera Button */}
        <View style={styles.centerContainer}>
          <TouchableOpacity
            style={styles.cameraButton}
            onPress={toggleCamera}
            activeOpacity={0.8}
          >
            <View style={styles.cameraButtonInner}>
              <MaterialIcons name="camera-enhance" size={56} color="#fff" />
              {/* <Ionicons name="camera" size={52} color="#fff" /> */}
            </View>
          </TouchableOpacity>
          <ThemedText style={styles.buttonLabel}>
            Toque para ativar a câmera
          </ThemedText>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <ThemedText style={styles.instructionsTitle}>Como usar:</ThemedText>
          <ThemedText style={styles.instructionText}>
            • Toque no botão para ativar a câmera
          </ThemedText>
          <ThemedText style={styles.instructionText}>
            • Aponte para preços em R$ ou US$
          </ThemedText>
          <ThemedText style={styles.instructionText}>
            • Veja a conversão para Bitcoin em tempo real
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  // Camera view
  return (
    <View style={styles.cameraContainer}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0, 0, 0, 0.7)" translucent />

      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isCameraActive && !photoMode}
        options={{ language: 'latin' }}
        mode={'recognize'}
        frameProcessorFps={1}
        photo={true}
        callback={handleTextRecognition}
      />
      {photoMode && capturedPhotoPath && (
        <Image source={{ uri: capturedPhotoPath }} style={StyleSheet.absoluteFill} resizeMode='cover' />
      )}

      {/* Camera overlay */}
      {/* SafeAreaView without top edge so header background goes behind notch */}
      <SafeAreaView style={styles.cameraOverlay} edges={['left','right']}>
        {/* Top header (adds insets.top manually for content safety while background covers notch) */}
        <View style={[styles.cameraHeader, { paddingTop: insets.top + 8 }]}> 
          <TouchableOpacity
            style={styles.closeButton}
            onPress={toggleCamera}
          >
            <ThemedText style={styles.closeButtonText}>
              <Ionicons name="close" size={24} color="#fff" />
            </ThemedText>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            {bitcoinPriceLoaded ?
              <ThemedText style={styles.headerText}>
                ${bitcoinPrices.USD.toLocaleString('en-US')} USD{'\n'}
                ${bitcoinPrices.BRL.toLocaleString('pt-BR')} BRL 
              </ThemedText>
              :
              <ThemedText style={styles.headerText}>
                Atualizando preços do Bitcoin...
              </ThemedText>
            }
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={refreshBitcoinPrices}
            disabled={isRefreshing}
          >
            <ThemedText style={[styles.refreshButtonText, { opacity: isRefreshing ? 0.5 : 1 }]}>
              {isRefreshing ?
                <ActivityIndicator size="small" color="#fff" /> :
                <Ionicons name="refresh" size={24} color="#fff" />
              }
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Price overlays positioned over detected prices */}
        {detectedPrices.map((priceItem, index) => (
          <PriceOverlay
            key={index}
            item={priceItem}
            screenWidth={screenWidth}
            screenHeight={screenHeight}
            showInSatoshis={showInSatoshis}
          />
        ))}

        {/* Price list sidebar */}
        <PriceList
          detectedPrices={detectedPrices}
          showInSatoshis={showInSatoshis}
          onToggleUnit={() => setShowInSatoshis(!showInSatoshis)}
        />
      </SafeAreaView>
      {/* Botão flutuante alterna Foto / Tempo Real */}
      <TouchableOpacity
        style={[styles.floatingModeButton, { bottom: detectedPrices.length ? 320 : 120 }]}
        onPress={togglePhotoMode}
        activeOpacity={0.85}
      >
        <Ionicons name={photoMode ? 'play-circle' : 'camera'} size={22} color='#fff' />
        <ThemedText style={styles.floatingModeButtonText}>
          {photoMode ? 'Tempo Real' : 'Modo Foto'}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    paddingBottom: 30,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  bitcoinPriceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  bitcoinPriceTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f7931a',
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  bitcoinPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#ccc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    //backgroundColor: '#f7931a',
    backgroundColor: '#f7931abb',
    //backgroundColor: '#ff6b35bb',
    justifyContent: 'center',
    alignItems: 'center',
    //elevation: 8,
    // shadowColor: '#f7931a',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.3,
    // shadowRadius: 8,
  },
  cameraButtonInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f7931a',
    //backgroundColor: '#ff6b35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButtonText: {
    // fontSize: 40,
  },
  buttonLabel: {
    fontSize: 16,
    color: '#fff',
    marginTop: 20,
    textAlign: 'center',
  },
  instructionsContainer: {
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 8,
    lineHeight: 20,
  },
  cameraContainer: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(247, 147, 26, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    textAlign: 'center',
    marginLeft: 0, // Compensate for close button width
  },
  headerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  bottomControls: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    alignSelf: 'center',
    position: 'absolute',
    right: -20,
    top: 40,
  },
  toggleButton: {
    backgroundColor: '#f7931a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructionsText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  floatingModeButton: {
    position: 'absolute',
    right: 16,
    backgroundColor: 'rgba(247,147,26,0.92)',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 60,
  },
  floatingModeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
