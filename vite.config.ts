import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process'

// Stamp current git commit SHA into the bundle at build time
function getGitSha(): string {
  try {
    return execSync('git rev-parse HEAD', { stdio: ['pipe', 'pipe', 'pipe'] })
      .toString().trim();
  } catch {
    return 'dev';
  }
}

const DEPLOY_COMMIT = getGitSha();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Replaced verbatim in compiled output — makes current commit available
    // to the browser bundle without any backend
    __DEPLOY_COMMIT__: JSON.stringify(DEPLOY_COMMIT),
  },
  server: {
    host: '::',
    port: 8080,
  },
})
