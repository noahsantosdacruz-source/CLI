import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs/promises';

export async function helpCommand() {
  console.log(chalk.cyan.green('\n Help Information\n'));
  program.outputHelp();

    console.log(chalk.cyan.bold('\n For more information, visit our documentation at https://example.com/docs \n'));

}

