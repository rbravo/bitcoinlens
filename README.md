# Bitcoin Lens 📱₿

Camera-based OCR price scanner with live Bitcoin conversion using react-native-vision-camera and CoinGecko API.

## Features

- 📸 **Real-time OCR**: Detects prices in USD ($) and BRL (R$) using camera
- ₿ **Bitcoin Conversion**: Automatically converts detected prices to Bitcoin/Satoshis
- 🔄 **Live Updates**: Real-time Bitcoin prices from CoinGecko API
- 🎯 **Visual Overlays**: Shows Bitcoin equivalent directly over detected prices
- 🔄 **Toggle Units**: Switch between Bitcoin and Satoshis display
- 📱 **Minimalist UI**: Clean, single-screen design focused on functionality

## Tech Stack

- **React Native** with Expo SDK 53
- **react-native-vision-camera** - Camera functionality
- **react-native-vision-camera-text-recognition** - OCR with coordinates
- **TypeScript** - Type safety
- **CoinGecko API** - Real-time Bitcoin prices

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npx expo start
   ```

3. **Run on device**
   - Use Expo Development Build (recommended for camera features)
   - Android: `npx expo run:android`
   - iOS: `npx expo run:ios`

> **Note**: Camera functionality requires a physical device or development build. Expo Go has limited camera OCR support.

## How It Works

1. **Point your camera** at any price tag or menu with USD/BRL prices
2. **OCR detects** the currency values automatically
3. **Bitcoin conversion** appears as overlay on detected prices
4. **Toggle** between Bitcoin (₿) and Satoshis (sats) display
5. **Refresh** Bitcoin prices manually via the refresh button

## Project Structure

```
app/
├── index.tsx          # Main camera screen
└── _layout.tsx        # Navigation setup

components/camera/
├── types.ts           # TypeScript interfaces
├── priceDetection.ts  # OCR price parsing logic
├── bitcoinApi.ts      # CoinGecko API integration
├── PriceOverlay.tsx   # Visual price overlays
└── PriceList.tsx      # Detected prices sidebar

components/
├── ThemedText.tsx     # Themed text component
└── ThemedView.tsx     # Themed view component
```

## Currency Format Support

- **USD**: $1,234.56 (comma thousands, period decimal)
- **BRL**: R$ 1.234,56 (period thousands, comma decimal)

The app intelligently detects and parses both American and Brazilian number formats.

## API Integration

Uses [CoinGecko API](https://api.coingecko.com/) for real-time Bitcoin prices:
- No API key required
- Updates Bitcoin prices in BRL and USD
- Automatic conversion calculations

## Development

Built with modern React Native practices:
- TypeScript for type safety
- Modular component architecture
- Safe area handling for different devices
- Efficient OCR coordinate-based overlays
