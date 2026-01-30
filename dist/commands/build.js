import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';

export async function buildCommand(options) {
  console.log(chalk.cyan.bold('\n🔨 Building your project...\n'));

  try {
    console.log(chalk.yellow('🧹 Cleaning dist...'));
    await fs.rm('dist', { recursive: true, force: true });
    await fs.mkdir('dist', { recursive: true });
    console.log(chalk.green('  ✓ Cleaned'));

    console.log(chalk.yellow('\n📦 Copying files...'));
    await copyDir('src', 'dist');
    console.log(chalk.green('  ✓ Files copied'));

    console.log(chalk.green.bold('\n✨ Build completed!\n'));

  } catch (error) {
    console.log(chalk.red(`\n❌ Build failed: ${error.message}\n`));
  }
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}