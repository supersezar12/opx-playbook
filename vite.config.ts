import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// NOTE: child_process / execSync removed — not supported in Lovable's build sandbox.
// The commit SHA is injected as 'dev' during Lovable preview builds.
// In a real CI/CD pipeline, set VITE_COMMIT_SHA env var and it will be used instead.
const DEPLOY_COMMIT =
  process.env.VITE_COMMIT_SHA ||
  process.env.COMMIT_REF ||       // Netlify
  process.env.VERCEL_GIT_COMMIT_SHA || // Vercel
  'dev';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    __DEPLOY_COMMIT__: JSON.stringify(DEPLOY_COMMIT),
  },
  server: {
    host: '::',
    port: 8080,
  },
})
