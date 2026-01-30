import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';

export async function initCommand(options) {
  console.log(chalk.cyan.bold('\n🚀 Initializing your project...\n'));

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
    }
  ]);

  // Créer la structure de dossiers
  const folders = ['src', 'public', 'tests', 'docs'];
  
  console.log(chalk.yellow('\n📁 Creating folder structure...'));
  
  folders.forEach(folder => {
    const folderPath = path.join(process.cwd(), folder);
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      console.log(chalk.green(`  ✓ Created ${folder}/`));
    } else {
      console.log(chalk.gray(`  ⊘ ${folder}/ already exists`));
    }
  });

  // Créer package.json
  const packageJson = {
    name: answers.projectName,
    version: '1.0.0',
    description: answers.description,
    main: 'src/index.js',
    scripts: {
      start: 'node src/index.js',
      test: 'echo "Error: no test specified" && exit 1'
    },
    keywords: [],
    author: answers.author,
    license: answers.license
  };

  fs.writeFileSync(
    path.join(process.cwd(), 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  console.log(chalk.green('\n  ✓ Created package.json'));

  // Créer README.md
  const readme = `# ${answers.projectName}

${answers.description}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`bash
npm start
\`\`\`

## Author

${answers.author}

## License

${answers.license}
`;

  fs.writeFileSync(path.join(process.cwd(), 'README.md'), readme);
  console.log(chalk.green('  ✓ Created README.md'));

  // Créer .gitignore
  const gitignore = `node_modules/
dist/
.env
.DS_Store
*.log
`;

  fs.writeFileSync(path.join(process.cwd(), '.gitignore'), gitignore);
  console.log(chalk.green('  ✓ Created .gitignore'));

  // Créer un fichier de démarrage
  const indexJs = `console.log('Welcome to ${answers.projectName}!');
`;

  fs.writeFileSync(path.join(process.cwd(), 'src', 'index.js'), indexJs);
  console.log(chalk.green('  ✓ Created src/index.js'));

  console.log(chalk.green.bold('\n✨ Project initialized successfully!\n'));
  console.log(chalk.cyan('Next steps:'));
  console.log(chalk.white('  npm install'));
  console.log(chalk.white('  npm start\n'));
}