import React from 'react';
import { Line } from 'react-native-svg';

interface TargetCornersProps {
  x: number;
  y: number;
  width: number;
  height: number;
  cornerSize?: number;
  strokeWidth?: number;
  color?: string;
}

export const TargetCorners: React.FC<TargetCornersProps> = ({
  x,
  y,
  width,
  height,
  cornerSize = 20,
  strokeWidth = 3,
  color = '#ff6b35'
}) => {
  // Verificar se as coordenadas são válidas
  if (!x || !y || !width || !height || isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height)) {
    return null;
  }

  // Garantir que os valores sejam positivos
  const safeX = Math.max(0, x);
  const safeY = Math.max(0, y);
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  const safeCornerSize = Math.max(1, cornerSize);

  return (
    <>
      {/* Canto superior esquerdo */}
      <Line
        x1={safeX - safeCornerSize / 2}
        y1={safeY - safeCornerSize / 2}
        x2={safeX + safeCornerSize / 2}
        y2={safeY - safeCornerSize / 2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1={safeX - safeCornerSize / 2}
        y1={safeY - safeCornerSize / 2}
        x2={safeX - safeCornerSize / 2}
        y2={safeY + safeCornerSize / 2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Canto superior direito */}
      <Line
        x1={safeX + safeWidth - safeCornerSize / 2}
        y1={safeY - safeCornerSize / 2}
        x2={safeX + safeWidth + safeCornerSize / 2}
        y2={safeY - safeCornerSize / 2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1={safeX + safeWidth + safeCornerSize / 2}
        y1={safeY - safeCornerSize / 2}
        x2={safeX + safeWidth + safeCornerSize / 2}
        y2={safeY + safeCornerSize / 2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Canto inferior esquerdo */}
      <Line
        x1={safeX - safeCornerSize / 2}
        y1={safeY + safeHeight - safeCornerSize / 2}
        x2={safeX - safeCornerSize / 2}
        y2={safeY + safeHeight + safeCornerSize / 2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1={safeX - safeCornerSize / 2}
        y1={safeY + safeHeight + safeCornerSize / 2}
        x2={safeX + safeCornerSize / 2}
        y2={safeY + safeHeight + safeCornerSize / 2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      
      {/* Canto inferior direito */}
      <Line
        x1={safeX + safeWidth - safeCornerSize / 2}
        y1={safeY + safeHeight + safeCornerSize / 2}
        x2={safeX + safeWidth + safeCornerSize / 2}
        y2={safeY + safeHeight + safeCornerSize / 2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Line
        x1={safeX + safeWidth + safeCornerSize / 2}
        y1={safeY + safeHeight - safeCornerSize / 2}
        x2={safeX + safeWidth + safeCornerSize / 2}
        y2={safeY + safeHeight + safeCornerSize / 2}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </>
  );
};
