import fs from 'node:fs';
import path from 'node:path';

export const requiredFiles = [
  'app.config.ts',
  '.env.example',
  'supabase/migrations/travel_launch_schema.sql',
  'supabase/migrations/travel_launch_seed.sql',
  'supabase/migrations/travel_launch_cutover.sql',
  'supabase/migrations/travel_launch_push_support.sql',
  'supabase/functions/notification-dispatch/index.ts',
  'docs/release-readiness.md',
  'docs/manual-qa-runbook.md',
  'eas.json',
];

export function evaluateLaunchReadiness({
  existingFiles = [],
  envContents = '',
  packageJson = {},
  hasEnvFile = true,
}) {
  const errors = [];
  const warnings = [];

  for (const relativePath of requiredFiles) {
    if (!existingFiles.includes(relativePath)) {
      errors.push(`Missing required file: ${relativePath}`);
    }
  }

  if (hasEnvFile) {
    if (!/EXPO_PUBLIC_SUPABASE_URL=.+/m.test(envContents)) {
      warnings.push('Missing EXPO_PUBLIC_SUPABASE_URL in .env');
    }

    if (!/EXPO_PUBLIC_SUPABASE_ANON_KEY=.+/m.test(envContents)) {
      warnings.push('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY in .env');
    }
  } else {
    warnings.push('No .env file found');
  }

  const scripts = packageJson.scripts ?? {};
  for (const scriptName of ['typecheck', 'doctor', 'check', 'launch:check', 'test', 'test:launch']) {
    if (!scripts[scriptName]) {
      errors.push(`Missing npm script: ${scriptName}`);
    }
  }

  return { errors, warnings };
}

export function collectLaunchInputs(projectRoot) {
  const existingFiles = requiredFiles.filter((relativePath) =>
    fs.existsSync(path.join(projectRoot, relativePath))
  );

  const envPath = path.join(projectRoot, '.env');
  const hasEnvFile = fs.existsSync(envPath);
  const envContents = hasEnvFile ? fs.readFileSync(envPath, 'utf8') : '';

  const packageJsonPath = path.join(projectRoot, 'package.json');
  const packageJson = fs.existsSync(packageJsonPath)
    ? JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    : {};

  return {
    existingFiles,
    envContents,
    packageJson,
    hasEnvFile,
  };
}
