import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    root: 'src',
    base: './',
    plugins: [
      {
        name: 'html-transform',
        transformIndexHtml(html, context) {
          let baseUrl: string;
          
          if (mode === 'production') {
            baseUrl = 'https://michaelmov.github.io/ascii-tetris';
          } else {
            // In development, use the actual server configuration
            const server = context.server;
            const port = server?.config.server.port || 5173;
            const host = server?.config.server.host || 'localhost';
            baseUrl = `http://${host === true ? 'localhost' : host}:${port}`;
          }
          
          return html
            .replace(/%BASE_URL%/g, baseUrl + '/')
            .replace(/%IMAGE_URL%/g, `${baseUrl}/images/ascii-tetris-min.png`);
        },
      },
    ],
    build: {
      outDir: '../dist',
      assetsDir: '',
      emptyOutDir: true,
      sourcemap: true,
    },
    resolve: {
      extensions: ['.ts', '.js', '.css'],
    },
    css: {
      devSourcemap: true,
    },
    server: {
      port: 5173, // Default port, but Vite will find next available if occupied
      strictPort: false, // Allow Vite to use different port if 5173 is busy
    },
  };
});
