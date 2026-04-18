import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        backendConsole: resolve(__dirname, 'backend-console.html'),
        biometricScan: resolve(__dirname, 'biometric-scan.html'),
        caseStudies: resolve(__dirname, 'case-studies.html'),
        registry: resolve(__dirname, 'contestant-registry.html'),
        tech: resolve(__dirname, 'technology.html')
      }
    }
  }
});
