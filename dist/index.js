import { program } from 'commander';
import pkg from '../package.json' with { type: 'json' };
import { initCommand } from './commands/init.js';
import { buildCommand } from './commands/build.js';
import { deployCommand } from './commands/deploy.js';
import chalk from 'chalk';

const { version } = pkg;

console.log(chalk.magenta.bold(`
╔═══════════════════════════════════════╗
║        CLI NOJO - v${version}         ║
║   Donne ton projet à la lumière BG    ║
╚═══════════════════════════════════════╝
Bienvenue dans le CLI  de NOJO! 
Utilisez --help pour voir les commandes disponibles.
C'est que le début mon amis !!!
En dessous tu trouveras les commandes disponibles. Amuse toi !!!
`));
// Configuration de base    

program
  .name('cli-nojo')
  .description('A CLI tool for managing your creativity')
  .version(version);

program
  .command('init')
  .description('Initialize a new project')
  .action(initCommand);

program
  .command('build')
  .description('Build your project')
  .option('-w, --watch', 'Watch mode')
  .option('-p, --production', 'Production build')
  .action(buildCommand);

program
  .command('deploy')
  .description('Deploy your project')
  .option('-e, --env <environment>', 'Environment', 'production')
  .action(deployCommand);

program
  .command('help')
  .description('Display help information')
  .option('-h, --help', 'Show help','Need help')
  .version(version, '-v, --version', 'Show version number')

program
    .command('json_à_Pdf')
    .description('Convertir un fichier JSON en PDF')
    .option('-f, --file <path>', 'Chemin du fichier JSON')
    .action(() => {
      import('./commands/jsonToPdf.js').then((module) => {
        module.default();
      });
    });

program.parse();