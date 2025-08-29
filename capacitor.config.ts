import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.3988b8accb314fe89fe2f9d2f9e001e1',
  appName: 'little-linguist-studio',
  webDir: 'dist',
  server: {
    url: "https://3988b8ac-cb31-4fe8-9fe2-f9d2f9e001e1.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#ffffff",
      showSpinner: false
    }
  }
};

export default config;