#!/usr/bin/env node

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
CLI_NOJO - Mon outil en ligne de commande

Usage:
  cli-nojo [options]

Options:
  --help, -h     Affiche cette aide
  --version, -v  Affiche la version
  `);
  process.exit(0);
}

if (args.includes('--version') || args.includes('-v')) {
  console.log('CLI_NOJO version 1.0.0');
  process.exit(0);
}

console.log('Hello from CLI_NOJO!');
console.log('Arguments reçus:', args);