import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permite acesso via rede local (mobile/tablet)
    port: 5173,
    proxy: {
      // Proxy para API DataJud (resolver CORS em desenvolvimento)
      '/api/datajud': {
        target: 'https://api-publica.datajud.cnj.jus.br',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/datajud/, ''),
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Proxying request:', req.method, req.url);
            // Force Origin to match target to satisfy CORS checks on the target server
            proxyReq.setHeader('Origin', 'https://api-publica.datajud.cnj.jus.br');
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received response:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
})
