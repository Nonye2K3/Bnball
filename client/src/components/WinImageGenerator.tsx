import { useEffect, useRef } from 'react';
import { formatEther } from 'viem';
import logoImage from "@assets/file_00000000851061f48f85c204c1e60aa9_1761600862005.png";

export interface WinData {
  marketTitle: string;
  prediction: string;
  stakeAmount: string; // in wei
  winAmount: string; // in wei
  multiplier: number;
  username?: string;
}

interface WinImageGeneratorProps {
  data: WinData;
  format?: '1:1' | '9:16';
  onImageGenerated: (dataURL: string) => void;
}

export function WinImageGenerator({ data, format = '1:1', onImageGenerated }: WinImageGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    generateImage();
  }, [data, format]);
  
  const generateImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = format === '1:1' ? 1080 : 1080;
    const height = format === '1:1' ? 1080 : 1920;
    
    canvas.width = width;
    canvas.height = height;
    
    // BNBall brand colors
    const colors = {
      black: '#000000',
      yellow: '#FFD700',
      green: '#10B981',
      orange: '#FF6B35',
      white: '#FFFFFF',
      gray: '#666666'
    };
    
    // Background - Pure black
    ctx.fillStyle = colors.black;
    ctx.fillRect(0, 0, width, height);
    
    // Add subtle gradient overlay
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(255, 215, 0, 0.1)');
    gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 107, 53, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Load and draw logo watermark in top right corner
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    logo.onload = () => {
      const logoSize = format === '1:1' ? 120 : 150;
      const logoPadding = 40;
      ctx.globalAlpha = 0.9;
      ctx.drawImage(logo, width - logoSize - logoPadding, logoPadding, logoSize, logoSize);
      ctx.globalAlpha = 1.0;
      
      // Continue drawing rest of content
      drawContent(ctx, width, height, format, colors);
      
      // Convert to data URL and callback
      const dataURL = canvas.toDataURL('image/png');
      onImageGenerated(dataURL);
    };
    logo.src = logoImage;
  };
  
  const drawContent = (ctx: CanvasRenderingContext2D, width: number, height: number, format: '1:1' | '9:16', colors: any) => {
    const centerY = height / 2;
    const padding = 80;
    
    // "WINNER!" badge at top
    ctx.fillStyle = colors.green;
    ctx.shadowColor = colors.green;
    ctx.shadowBlur = 30;
    const badgeY = format === '1:1' ? 150 : 250;
    ctx.font = 'bold 60px Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('WINNER', width / 2, badgeY);
    ctx.shadowBlur = 0;
    
    // Market title
    ctx.fillStyle = colors.white;
    ctx.font = 'bold 48px Arial, sans-serif';
    const titleY = badgeY + 100;
    const maxTitleWidth = width - (padding * 2);
    const titleLines = wrapText(ctx, data.marketTitle, maxTitleWidth);
    titleLines.forEach((line, index) => {
      ctx.fillText(line, width / 2, titleY + (index * 60));
    });
    
    // Prediction box
    const predictionY = titleY + (titleLines.length * 60) + 80;
    ctx.fillStyle = colors.yellow;
    ctx.font = 'bold 56px Arial, sans-serif';
    ctx.fillText(`Bet: ${data.prediction}`, width / 2, predictionY);
    
    // Stats container
    const statsY = predictionY + 100;
    const statBoxWidth = (width - (padding * 3)) / 2;
    const statBoxHeight = 180;
    const statBoxX1 = padding;
    const statBoxX2 = width - padding - statBoxWidth;
    
    // Stake box (left)
    drawStatBox(ctx, statBoxX1, statsY, statBoxWidth, statBoxHeight, 'STAKED', formatEther(BigInt(data.stakeAmount)) + ' BNB', colors.orange, colors.black);
    
    // Win box (right)
    drawStatBox(ctx, statBoxX2, statsY, statBoxWidth, statBoxHeight, 'WON', formatEther(BigInt(data.winAmount)) + ' BNB', colors.green, colors.black);
    
    // Multiplier
    const multiplierY = statsY + statBoxHeight + 60;
    ctx.fillStyle = colors.yellow;
    ctx.font = 'bold 64px Arial, sans-serif';
    ctx.fillText(`${data.multiplier.toFixed(2)}x Return`, width / 2, multiplierY);
    
    // BNBall branding at bottom
    const bottomY = height - 100;
    ctx.fillStyle = colors.gray;
    ctx.font = '32px Arial, sans-serif';
    ctx.fillText('BNBall.app - Decentralized Sports Prediction Market', width / 2, bottomY);
  };
  
  return (
    <canvas 
      ref={canvasRef} 
      className="hidden"
      data-testid="canvas-win-image"
    />
  );
}

function drawStatBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
  color: string,
  bgColor: string
) {
  // Border with glow
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.shadowColor = color;
  ctx.shadowBlur = 20;
  ctx.strokeRect(x, y, width, height);
  ctx.shadowBlur = 0;
  
  // Background
  ctx.fillStyle = bgColor;
  ctx.fillRect(x + 3, y + 3, width - 6, height - 6);
  
  // Label
  ctx.fillStyle = '#999999';
  ctx.font = 'bold 24px Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(label, x + width / 2, y + 45);
  
  // Value
  ctx.fillStyle = color;
  ctx.font = 'bold 48px Arial, sans-serif';
  ctx.fillText(value, x + width / 2, y + 110);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0];
  
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + ' ' + word).width;
    if (width < maxWidth) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}
