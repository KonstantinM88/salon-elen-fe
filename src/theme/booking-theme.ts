// 🎨 PREMIUM THEME - Salon Elen
// Золотая роскошь + Голубое сияние

export const premiumTheme = {
  colors: {
    // Основные цвета бренда
    gold: {
      50: '#FFFBEB',
      100: '#FFF3C4',
      200: '#FFE380',
      300: '#FFD54F',
      400: '#FFC107',
      500: '#FFB300',
      600: '#FFA000',
      700: '#FF8F00',
      800: '#FF6F00',
      900: '#E65100',
      primary: '#FFD700', // Золотой основной
      light: '#FFE55C',
      dark: '#C7A600',
      glow: 'rgba(255, 215, 0, 0.5)',
    },
    
    cyan: {
      50: '#E0F7FA',
      100: '#B2EBF2',
      200: '#80DEEA',
      300: '#4DD0E1',
      400: '#26C6DA',
      500: '#00D4FF', // Голубой основной
      600: '#00B8D4',
      700: '#0097A7',
      800: '#00838F',
      900: '#006064',
      glow: 'rgba(0, 212, 255, 0.5)',
    },
    
    purple: {
      500: '#9C27B0',
      600: '#7B1FA2',
      700: '#6A1B9A',
      glow: 'rgba(156, 39, 176, 0.5)',
    },
    
    // Нейтральные цвета
    dark: {
      bg: '#0A0A0A',
      card: '#1A1A1A',
      cardHover: '#252525',
      border: '#2A2A2A',
      text: '#FFFFFF',
      textMuted: '#A0A0A0',
    },
  },
  
  gradients: {
    goldToCyan: 'linear-gradient(135deg, #FFD700 0%, #00D4FF 100%)',
    goldToCyanToPurple: 'linear-gradient(135deg, #FFD700 0%, #00D4FF 50%, #9C27B0 100%)',
    cyanToGold: 'linear-gradient(135deg, #00D4FF 0%, #FFD700 100%)',
    darkGold: 'linear-gradient(180deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0) 100%)',
    darkCyan: 'linear-gradient(180deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 212, 255, 0) 100%)',
    glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
  },
  
  effects: {
    // Золотое свечение
    goldGlow: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)',
    goldGlowStrong: '0 0 30px rgba(255, 215, 0, 0.7), 0 0 60px rgba(255, 215, 0, 0.4)',
    
    // Голубое свечение
    cyanGlow: '0 0 20px rgba(0, 212, 255, 0.5), 0 0 40px rgba(0, 212, 255, 0.3)',
    cyanGlowStrong: '0 0 30px rgba(0, 212, 255, 0.7), 0 0 60px rgba(0, 212, 255, 0.4)',
    
    // Glassmorphism
    glass: 'backdrop-filter: blur(10px); background: rgba(255, 255, 255, 0.05);',
    glassStrong: 'backdrop-filter: blur(20px); background: rgba(255, 255, 255, 0.1);',
    
    // Тени
    cardShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
    cardShadowHover: '0 12px 48px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.3)',
    buttonShadow: '0 4px 16px rgba(255, 215, 0, 0.4)',
  },
  
  animation: {
    fadeIn: 'fadeIn 0.6s ease-out',
    slideUp: 'slideUp 0.6s ease-out',
    scaleIn: 'scaleIn 0.4s ease-out',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    shimmer: 'shimmer 2s linear infinite',
  },
  
  spacing: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-12 md:py-16 lg:py-20',
    card: 'p-6 md:p-8',
  },
  
  typography: {
    h1: 'text-4xl md:text-5xl lg:text-6xl font-bold',
    h2: 'text-3xl md:text-4xl lg:text-5xl font-bold',
    h3: 'text-2xl md:text-3xl lg:text-4xl font-semibold',
    h4: 'text-xl md:text-2xl lg:text-3xl font-semibold',
    body: 'text-base md:text-lg',
    bodyLarge: 'text-lg md:text-xl',
    caption: 'text-sm md:text-base text-gray-400',
  },
  
  borderRadius: {
    card: '20px',
    button: '12px',
    input: '12px',
  },
};

// CSS Keyframes для анимаций
export const keyframes = `
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes scaleIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }
`;

export default premiumTheme;
