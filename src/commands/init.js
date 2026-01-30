import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';

export async function initCommand(options) {
  console.log(chalk.magenta.bold('\n Initializing your project...\n'));

  // Questions interactives
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: path.basename(process.cwd()),
      validate: (input) => {
        if (input.length === 0) return 'Project name cannot be empty';
        return true;
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project description:',
      default: 'A new creative project'
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author name:',
      default: 'Your Name'
    },
    {
      type: 'list',
      name: 'license',
      message: 'License:',
      choices: ['MIT', 'Apache-2.0', 'GPL-3.0', 'ISC', 'BSD-3-Clause'],
      default: 'MIT'
    },
    {
        type: 'input',
        name: 'version',
        message: 'Version:',
        default: '1.0.0'
    }
  ]);
  console.log(chalk.blue('\n ♠Creating folders...\n'));

  const folders = ['src', 'public'];
  for (const folder of folders) {
    await fs.mkdir(folder, { recursive: true });
    console.log(chalk.green(`  ✓ Created ${folder}/`));
  }

  const pkg = {
    name: answers.projectName,
    version: '1.0.0',
    description: answers.description,
    main: 'src/index.js'
  };

  await fs.writeFile('package.json', JSON.stringify(pkg, null, 2));
  console.log(chalk.green('  ✓ Created package.json'));

  await fs.writeFile('README.md', `# ${answers.projectName}\n\n${answers.description}\n`);
  console.log(chalk.green('  ✓ Created README.md'));

  await fs.writeFile('src/index.js', `console.log('Hello from ${answers.projectName}!');\n`);
  console.log(chalk.green('  ✓ Created src/index.js'));

  console.log(chalk.green.bold('\n ♠ Project initialized!\n'));
}