import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

interface PulseDotProps {
  x: number;
  y: number;
  color?: string;
}

export const PulseDot: React.FC<PulseDotProps> = ({
  x,
  y,
  color = '#f7931a'
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animationRef: Animated.CompositeAnimation | null = null;
    
    try {
      animationRef = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      
      animationRef.start();
    } catch (error) {
      console.warn('Animation error:', error);
    }
    
    return () => {
      if (animationRef) {
        animationRef.stop();
      }
    };
  }, [pulseAnim]);

  const animatedScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  const animatedOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 0.3],
  });

  // Verificar se as coordenadas são válidas
  if (!x || !y || isNaN(x) || isNaN(y)) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.pulseDot,
        {
          left: Math.max(0, x - 4),
          top: Math.max(0, y - 4),
          backgroundColor: color,
          transform: [{ scale: animatedScale }],
          opacity: animatedOpacity,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  pulseDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
