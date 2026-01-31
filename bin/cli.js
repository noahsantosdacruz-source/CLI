import { program } from 'commander';
import pkg from '../package.json' with { type: 'json' };
import { initCommand } from '../src/commands/init.js';
import { buildCommand } from '../src/commands/build.js';
import { deployCommand } from '../src/commands/deploy.js';
import chalk from 'chalk';

const { version } = pkg;

// Bannière de bienvenue
console.log(chalk.cyan.bold(`
╔═══════════════════════════════════════╗
║       CLI NOJO♠ - v${version}  ║
║   Gérez vos projets avec style        ║
╚═══════════════════════════════════════╝

Bienvenue dans CLI NOJO! 
Utilisez --help pour découvrir toutes les commandes.
Prêt à commencer ? C'est parti !
C'est que le début mon amis !!!
En dessous tu trouveras les commandes disponibles. Amuse toi !!!

`));

// Configuration du programme
program
  .name('cli-manager')
  .description('Un outil CLI pour gérer vos projets efficacement')
  .version(version);

// Commande init
program
  .command('init')
  .description('Initialiser un nouveau projet')
  .action(initCommand);

// Commande build
program
  .command('build')
  .description('Compiler votre projet')
  .option('-w, --watch', 'Mode surveillance des fichiers')
  .option('-p, --production', 'Build de production')
  .action(buildCommand);

// Commande deploy
program
  .command('deploy')
  .description('Déployer votre projet')
  .option('-e, --env <environment>', 'Environnement cible', 'production')
  .action(deployCommand);

// Commande help
program
  .command('help')
  .description('Afficher les informations d\'aide')
  .action(() => {
    program.help();
  });

// Commande de conversion JSON vers PDF
program
  .command('json-to-pdf')
  .description('Convertir un fichier JSON en document PDF')
  .option('-f, --file <path>', 'Chemin du fichier JSON à convertir')
  .option('-o, --output <path>', 'Chemin du fichier PDF de sortie')
  .action((options) => {
    import('./commands/jsonToPdf.js').then((module) => {
      module.default(options);
    });
  });

// Parse des arguments
program.parse(process.argv);

// Afficher l'aide si aucune commande n'est fournie
if (!process.argv.slice(2).length) {
  program.outputHelp();
}