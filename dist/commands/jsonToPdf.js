import chalk from 'chalk';
import fs from 'fs/promises';

export default async function jsonToPdf(options) {
  console.log(chalk.blue('\n📄 Conversion JSON vers PDF...\n'));

  if (!options.file) {
    console.error(chalk.red('❌ Le fichier JSON est requis (-f, --file)'));
    return;
  }

  try {
    const jsonContent = await fs.readFile(options.file, 'utf-8');
    const data = JSON.parse(jsonContent);
    
    console.log(chalk.green('✓ Fichier JSON lu avec succès'));
  } catch (error) {
    console.error(chalk.red('❌ Erreur:'), error.message);
  }
}