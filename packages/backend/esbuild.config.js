import esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Build configuration
const config = {
  entryPoints: [join(__dirname, 'src/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: join(__dirname, 'dist/index.js'),
  sourcemap: true,
  minify: false, // Keep readable for debugging

  // External dependencies that should not be bundled
  external: [
    '@prisma/client',
    '.prisma/client',
    '@aizu/shared',
    // Native modules
    'bcrypt',
    // Large dependencies better kept external
    'express',
    'cors',
    'helmet',
    'dotenv',
    'jsonwebtoken',
    'zod',
  ],

  // Handle path aliases from tsconfig.json
  alias: {
    '@': './src',
  },

  // Log build details
  logLevel: 'info',
};

// Run the build
esbuild.build(config).catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
