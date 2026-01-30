import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

export async function buildCommand(options) {
  console.log(chalk.cyan.bold('\n🔨 Building your project...\n'));

  const startTime = Date.now();

  try {
    // 1. Nettoyer le dossier de build précédent
    console.log(chalk.yellow('🧹 Cleaning previous build...'));
    const distPath = path.join(process.cwd(), 'dist');
    
    try {
      await fs.rm(distPath, { recursive: true, force: true });
      console.log(chalk.green('  ✓ Cleaned dist/ folder'));
    } catch (error) {
      console.log(chalk.gray('  ⊘ No previous build found'));
    }

    // 2. Créer le dossier dist
    await fs.mkdir(distPath, { recursive: true });
    console.log(chalk.green('  ✓ Created dist/ folder'));

    // 3. Vérifier si package.json existe
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    let packageJson;
    
    try {
      const packageContent = await fs.readFile(packageJsonPath, 'utf-8');
      packageJson = JSON.parse(packageContent);
    } catch (error) {
      console.log(chalk.red('❌ package.json not found'));
      process.exit(1);
    }

    // 4. Détecter le type de projet et build
    console.log(chalk.yellow('\n📦 Building project...'));

    if (packageJson.dependencies?.react || packageJson.devDependencies?.react) {
      await buildReact(options);
    } else if (packageJson.dependencies?.vue || packageJson.devDependencies?.vue) {
      await buildVue(options);
    } else if (packageJson.dependencies?.express) {
      await buildNode(options);
    } else {
      await buildVanilla(options);
    }

    // 5. Copier les fichiers statiques
    console.log(chalk.yellow('\n📋 Copying static files...'));
    await copyStaticFiles();

    // 6. Mode watch (optionnel)
    if (options.watch) {
      console.log(chalk.cyan('\n👀 Watch mode enabled - Watching for changes...\n'));
      watchFiles();
    } else {
      // Afficher le résumé
      const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
      
      console.log(chalk.green.bold('\n✨ Build completed successfully!\n'));
      console.log(chalk.cyan('Build summary:'));
      console.log(chalk.white(`  Time: ${buildTime}s`));
      console.log(chalk.white(`  Output: dist/`));
      
      if (options.production) {
        console.log(chalk.white('  Mode: Production (minified)'));
      } else {
        console.log(chalk.white('  Mode: Development'));
      }
      
      console.log(chalk.gray('\n──────────────────────────────────\n'));
    }

  } catch (error) {
    console.log(chalk.red(`\n❌ Build failed: ${error.message}`));
    process.exit(1);
  }
}

// Fonctions de build spécifiques
async function buildReact(options) {
  console.log(chalk.blue('  ⚛️  Building React app...'));
  
  try {
    const buildCmd = options.production 
      ? 'npm run build' 
      : 'vite build';
    
    execSync(buildCmd, { stdio: 'inherit' });
    console.log(chalk.green('  ✓ React build complete'));
  } catch (error) {
    throw new Error('React build failed');
  }
}

async function buildVue(options) {
  console.log(chalk.blue('  💚 Building Vue app...'));
  
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log(chalk.green('  ✓ Vue build complete'));
  } catch (error) {
    throw new Error('Vue build failed');
  }
}

async function buildNode(options) {
  console.log(chalk.blue('  🟢 Building Node.js app...'));
  
  const srcPath = path.join(process.cwd(), 'src');
  const distPath = path.join(process.cwd(), 'dist');
  
  // Copier tous les fichiers JS de src vers dist
  await copyDirectory(srcPath, distPath);
  console.log(chalk.green('  ✓ Node.js files copied'));
}

async function buildVanilla(options) {
  console.log(chalk.blue('  ⚡ Building vanilla JS app...'));
  
  const srcPath = path.join(process.cwd(), 'src');
  const distPath = path.join(process.cwd(), 'dist');
  
  // Copier les fichiers source
  await copyDirectory(srcPath, distPath);
  
  // Copier index.html s'il existe
  const indexPath = path.join(process.cwd(), 'index.html');
  if (await fileExists(indexPath)) {
    await fs.copyFile(indexPath, path.join(distPath, 'index.html'));
  }
  
  console.log(chalk.green('  ✓ Files bundled'));
}

async function copyStaticFiles() {
  const publicPath = path.join(process.cwd(), 'public');
  const distPath = path.join(process.cwd(), 'dist');
  
  if (await fileExists(publicPath)) {
    await copyDirectory(publicPath, distPath);
    console.log(chalk.green('  ✓ Static files copied'));
  } else {
    console.log(chalk.gray('  ⊘ No public folder found'));
  }
}

async function copyDirectory(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function watchFiles() {
  const chokidar = require('chokidar');
  
  const watcher = chokidar.watch('src/**/*', {
    persistent: true,
    ignoreInitial: true
  });
  
  watcher.on('change', async (filePath) => {
    console.log(chalk.yellow(`\n📝 File changed: ${filePath}`));
    console.log(chalk.cyan('🔄 Rebuilding...\n'));
    
    // Rebuild sans les logs complets
    await buildCommand({ watch: false });
  });
  
  console.log(chalk.gray('Press Ctrl+C to stop watching\n'));
}