
// Simplified theme hook - light mode only
export function useTheme() {
  return {
    theme: 'light' as const,
    setTheme: () => {}, // No-op function for compatibility
  };
}
