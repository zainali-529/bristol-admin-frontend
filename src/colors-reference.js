// Bristol Utilities Color Scheme Reference
// Import this file if you need to use colors in JavaScript

export const colors = {
  // Light Mode
  light: {
    background: '#ffffff',
    primary: '#AE613A',
    textPrimary: '#333333',
    textSecondary: '#7C7C7C',
    card: '#ffffff',
    
    // Primary variations with opacity
    primary100: '#AE613A',
    primary80: 'rgba(174, 97, 58, 0.8)',
    primary60: 'rgba(174, 97, 58, 0.6)',
    primary40: 'rgba(174, 97, 58, 0.4)',
    primary30: 'rgba(174, 97, 58, 0.3)',
    primary20: 'rgba(174, 97, 58, 0.2)',
    primary10: 'rgba(174, 97, 58, 0.1)',
    primary5: 'rgba(174, 97, 58, 0.05)',
  },
  
  // Dark Mode
  dark: {
    background: '#121212',
    primary: '#AE613A',
    textPrimary: '#F5EDEB',
    textSecondary: '#BBAAA4',
    card: '#1E1B1A',
    
    // Primary variations with opacity (same as light mode)
    primary100: '#AE613A',
    primary80: 'rgba(174, 97, 58, 0.8)',
    primary60: 'rgba(174, 97, 58, 0.6)',
    primary40: 'rgba(174, 97, 58, 0.4)',
    primary30: 'rgba(174, 97, 58, 0.3)',
    primary20: 'rgba(174, 97, 58, 0.2)',
    primary10: 'rgba(174, 97, 58, 0.1)',
    primary5: 'rgba(174, 97, 58, 0.05)',
  },
};

// Helper function to get color based on current theme
export const getColor = (colorKey, isDark = false) => {
  return isDark ? colors.dark[colorKey] : colors.light[colorKey];
};
