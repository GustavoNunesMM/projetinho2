import { existsSync } from 'fs';
import { execSync } from 'child_process';

// Verifica se o dist/index.html já existe
if (!existsSync('dist/index.html')) {
  console.log('dist/index.html não encontrado, executando build...');
  execSync('pnpm run build', { stdio: 'inherit' });
} else {
  console.log('dist/index.html já existe, pulando build.');
}
