import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

const requiredFiles = [
  'supabase/migrations/travel_launch_schema.sql',
  'supabase/migrations/travel_launch_seed.sql',
  'supabase/migrations/travel_launch_cutover.sql',
  'supabase/migrations/travel_launch_push_support.sql',
  'supabase/functions/notification-dispatch/index.ts',
  'docs/release-readiness.md',
  'eas.json',
];

const errors = [];
const warnings = [];

for (const relativePath of requiredFiles) {
  const absolutePath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(absolutePath)) {
    errors.push(`Missing required file: ${relativePath}`);
  }
}

const envPath = path.join(projectRoot, '.env');
if (fs.existsSync(envPath)) {
  const envContents = fs.readFileSync(envPath, 'utf8');

  if (!/EXPO_PUBLIC_SUPABASE_URL=.+/m.test(envContents)) {
    warnings.push('Missing EXPO_PUBLIC_SUPABASE_URL in .env');
  }

  if (!/EXPO_PUBLIC_SUPABASE_ANON_KEY=.+/m.test(envContents)) {
    warnings.push('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
  }
} else {
  warnings.push('No .env file found');
}

const appJsonPath = path.join(projectRoot, 'app.json');
if (fs.existsSync(appJsonPath)) {
  const appJsonContents = fs.readFileSync(appJsonPath, 'utf8');
  if (appJsonContents.includes('YOUR_ANDROID_GOOGLE_MAPS_API_KEY')) {
    warnings.push('Replace YOUR_ANDROID_GOOGLE_MAPS_API_KEY in app.json');
  }
}

const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const scripts = packageJson.scripts ?? {};
  for (const scriptName of ['typecheck', 'doctor', 'check', 'launch:check']) {
    if (!scripts[scriptName]) {
      errors.push(`Missing npm script: ${scriptName}`);
    }
  }
}

if (errors.length > 0) {
  console.error('Launch check failed:');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Launch check passed for repo assets.');

if (warnings.length > 0) {
  console.log('Warnings:');
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
} else {
  console.log('No launch warnings detected.');
}
