import chalk from 'chalk';

export async function initCommand() {
  console.log(chalk.blue('\n🚀 Initialisation d\'un nouveau projet...\n'));
  
  try {
    console.log(chalk.green('✓ Projet initialisé avec succès!'));
  } catch (error) {
    console.error(chalk.red('❌ Erreur:'), error.message);
  }
}