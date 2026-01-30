import chalk from 'chalk';
import inquirer from 'inquirer';
import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

export async function deployCommand(options) {
  console.log(chalk.cyan.bold('\n🚀 Deploying your project...\n'));

  try {
    // 1. Vérifier que le build existe
    const distExists = await checkDistFolder();
    if (!distExists) {
      console.log(chalk.yellow('⚠️  No build found. Building first...\n'));
      execSync('npm run build', { stdio: 'inherit' });
    }

    // 2. Choisir la plateforme de déploiement
    let platform = options.platform;
    
    if (!platform) {
      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'platform',
          message: '📦 Choose deployment platform:',
          choices: [
            { name: '🔷 Vercel (Recommended)', value: 'vercel' },
            { name: '🟢 Netlify', value: 'netlify' },
            { name: '📘 GitHub Pages', value: 'github-pages' },
            { name: '🔴 Firebase Hosting', value: 'firebase' },
            { name: '⚙️  Custom Server (FTP)', value: 'ftp' },
          ]
        }
      ]);
      platform = answer.platform;
    }

    // 3. Déployer selon la plateforme
    switch (platform) {
      case 'vercel':
        await deployToVercel(options);
        break;
      case 'netlify':
        await deployToNetlify(options);
        break;
      case 'github-pages':
        await deployToGitHubPages(options);
        break;
      case 'firebase':
        await deployToFirebase(options);
        break;
      case 'ftp':
        await deployToFTP(options);
        break;
      default:
        console.log(chalk.red('❌ Unknown platform'));
    }

  } catch (error) {
    console.log(chalk.red(`\n❌ Deployment failed: ${error.message}\n`));
    process.exit(1);
  }
}

// Fonctions de déploiement spécifiques

async function deployToVercel(options) {
  console.log(chalk.blue('\n🔷 Deploying to Vercel...\n'));

  try {
    // Vérifier si Vercel CLI est installé
    try {
      execSync('vercel --version', { stdio: 'ignore' });
    } catch {
      console.log(chalk.yellow('📦 Vercel CLI not found. Installing...'));
      execSync('npm install -g vercel', { stdio: 'inherit' });
    }

    // Déployer
    const env = options.env === 'production' ? '--prod' : '';
    console.log(chalk.cyan(`Deploying to ${options.env || 'preview'}...\n`));
    
    execSync(`vercel ${env}`, { stdio: 'inherit' });

    console.log(chalk.green.bold('\n✨ Deployed to Vercel successfully!\n'));
    console.log(chalk.cyan('Your app is now live! 🎉\n'));

  } catch (error) {
    throw new Error('Vercel deployment failed');
  }
}

async function deployToNetlify(options) {
  console.log(chalk.blue('\n🟢 Deploying to Netlify...\n'));

  try {
    // Vérifier si Netlify CLI est installé
    try {
      execSync('netlify --version', { stdio: 'ignore' });
    } catch {
      console.log(chalk.yellow('📦 Netlify CLI not found. Installing...'));
      execSync('npm install -g netlify-cli', { stdio: 'inherit' });
    }

    // Déployer
    const prod = options.env === 'production' ? '--prod' : '';
    console.log(chalk.cyan('Deploying...\n'));
    
    execSync(`netlify deploy --dir=dist ${prod}`, { stdio: 'inherit' });

    console.log(chalk.green.bold('\n✨ Deployed to Netlify successfully!\n'));

  } catch (error) {
    throw new Error('Netlify deployment failed');
  }
}

async function deployToGitHubPages(options) {
  console.log(chalk.blue('\n📘 Deploying to GitHub Pages...\n'));

  try {
    // Vérifier si gh-pages est installé
    const packageJson = JSON.parse(
      await fs.readFile('package.json', 'utf-8')
    );

    if (!packageJson.devDependencies?.['gh-pages']) {
      console.log(chalk.yellow('📦 Installing gh-pages...'));
      execSync('npm install --save-dev gh-pages', { stdio: 'inherit' });
    }

    // Ajouter script deploy si absent
    if (!packageJson.scripts?.deploy) {
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.deploy = 'gh-pages -d dist';
      
      await fs.writeFile(
        'package.json',
        JSON.stringify(packageJson, null, 2)
      );
      console.log(chalk.green('✓ Added deploy script to package.json'));
    }

    // Déployer
    console.log(chalk.cyan('Publishing to GitHub Pages...\n'));
    execSync('npm run deploy', { stdio: 'inherit' });

    console.log(chalk.green.bold('\n✨ Deployed to GitHub Pages!\n'));
    console.log(chalk.cyan('Your site will be available at:'));
    console.log(chalk.white('https://<username>.github.io/<repository>\n'));

  } catch (error) {
    throw new Error('GitHub Pages deployment failed');
  }
}

async function deployToFirebase(options) {
  console.log(chalk.blue('\n🔴 Deploying to Firebase Hosting...\n'));

  try {
    // Vérifier si Firebase CLI est installé
    try {
      execSync('firebase --version', { stdio: 'ignore' });
    } catch {
      console.log(chalk.yellow('📦 Firebase CLI not found. Installing...'));
      execSync('npm install -g firebase-tools', { stdio: 'inherit' });
    }

    // Vérifier si firebase.json existe
    const firebaseConfigExists = await fileExists('firebase.json');
    
    if (!firebaseConfigExists) {
      console.log(chalk.yellow('⚙️  Firebase not initialized. Setting up...\n'));
      
      const firebaseConfig = {
        hosting: {
          public: 'dist',
          ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
          rewrites: [
            {
              source: '**',
              destination: '/index.html'
            }
          ]
        }
      };
      
      await fs.writeFile(
        'firebase.json',
        JSON.stringify(firebaseConfig, null, 2)
      );
      console.log(chalk.green('✓ Created firebase.json'));
    }

    // Login si nécessaire
    console.log(chalk.cyan('Checking Firebase authentication...\n'));
    execSync('firebase login', { stdio: 'inherit' });

    // Déployer
    console.log(chalk.cyan('\nDeploying to Firebase...\n'));
    execSync('firebase deploy --only hosting', { stdio: 'inherit' });

    console.log(chalk.green.bold('\n✨ Deployed to Firebase successfully!\n'));

  } catch (error) {
    throw new Error('Firebase deployment failed');
  }
}

async function deployToFTP(options) {
  console.log(chalk.blue('\n⚙️  Deploying via FTP...\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'host',
      message: 'FTP Host:',
      validate: (input) => input.length > 0 || 'Host is required'
    },
    {
      type: 'input',
      name: 'user',
      message: 'FTP Username:',
      validate: (input) => input.length > 0 || 'Username is required'
    },
    {
      type: 'password',
      name: 'password',
      message: 'FTP Password:',
      mask: '*',
      validate: (input) => input.length > 0 || 'Password is required'
    },
    {
      type: 'input',
      name: 'remotePath',
      message: 'Remote path:',
      default: '/public_html'
    }
  ]);

  console.log(chalk.cyan('\n📤 Uploading files...\n'));

  // Utiliser un package FTP (nécessite installation)
  try {
    const ftp = require('basic-ftp');
    const client = new ftp.Client();
    
    await client.access({
      host: answers.host,
      user: answers.user,
      password: answers.password,
      secure: false
    });

    await client.ensureDir(answers.remotePath);
    await client.clearWorkingDir();
    await client.uploadFromDir('dist');
    
    client.close();

    console.log(chalk.green.bold('\n✨ Deployed via FTP successfully!\n'));

  } catch (error) {
    console.log(chalk.yellow('\n⚠️  FTP deployment requires "basic-ftp" package'));
    console.log(chalk.cyan('Install it with: npm install basic-ftp\n'));
    throw error;
  }
}

// Utilitaires
async function checkDistFolder() {
  try {
    await fs.access('dist');
    return true;
  } catch {
    return false;
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