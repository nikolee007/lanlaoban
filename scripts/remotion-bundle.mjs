/**
 * Standalone Remotion bundler script.
 * Runs as a child process (outside Next.js webpack) to avoid native dependency issues.
 * Outputs "BUNDLE:<path>" on stdout for the parent to parse.
 */

import { bundle } from '@remotion/bundler'
import { resolve } from 'path'

const entryPoint = resolve(process.cwd(), 'remotion', 'index.ts')

try {
  const bundleLocation = await bundle({
    entryPoint,
    webpackOverride: (config) => {
      // Ensure we handle ESM properly
      config.resolve = config.resolve || {}
      config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.json']
      config.module = config.module || {}
      config.module.rules = config.module.rules || []
      return config
    },
    // Cache bundles in .remotion-cache for reuse
    bundleDir: resolve(process.cwd(), '.remotion-cache'),
  })

  // Output in a way the parent process can parse
  process.stdout.write(`BUNDLE:${bundleLocation}\n`)
  process.exit(0)
} catch (err) {
  process.stderr.write(err instanceof Error ? err.message : String(err))
  process.exit(1)
}
