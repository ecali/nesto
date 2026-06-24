import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'

function patchPocketbase(): Plugin {
  return {
    name: 'patch-pocketbase',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (
          req.url &&
          (req.url.includes('pocketbase') || req.url.includes('PocketBase'))
        ) {
          const origEnd = res.end.bind(res)
          res.end = function (chunk: any) {
            const code = chunk ? Buffer.from(chunk).toString('utf-8') : ''
            const fixed = code.replace(
              /__vite__injectQuery\(([^,]+), '[^']*'\)/g,
              '$1'
            )
            origEnd(fixed)
          }
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), patchPocketbase()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['pocketbase'],
  },
})
