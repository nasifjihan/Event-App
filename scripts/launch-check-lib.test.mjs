import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateLaunchReadiness, requiredFiles } from './launch-check-lib.mjs';

test('evaluateLaunchReadiness passes when launch assets and scripts exist', () => {
  const result = evaluateLaunchReadiness({
    existingFiles: requiredFiles,
    hasEnvFile: true,
    envContents: [
      'EXPO_PUBLIC_SUPABASE_URL=https://example.supabase.co',
      'EXPO_PUBLIC_SUPABASE_ANON_KEY=test-anon-key',
    ].join('\n'),
    packageJson: {
      scripts: {
        typecheck: 'tsc --noEmit',
        doctor: 'expo-doctor',
        check: 'npm run typecheck && npm run doctor',
        'launch:check': 'node scripts/launch-check.mjs',
        test: 'jest --watchAll=false --runInBand',
        'test:launch': 'node --test scripts/launch-check-lib.test.mjs',
      },
    },
  });

  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.warnings, []);
});

test('evaluateLaunchReadiness reports missing env values and scripts', () => {
  const result = evaluateLaunchReadiness({
    existingFiles: requiredFiles.slice(0, 2),
    hasEnvFile: true,
    envContents: 'EXPO_PUBLIC_SUPABASE_URL=https://example.supabase.co',
    packageJson: {
      scripts: {
        typecheck: 'tsc --noEmit',
      },
    },
  });

  assert.ok(result.errors.some((message) => message.includes('docs/manual-qa-runbook.md')));
  assert.ok(result.errors.some((message) => message.includes('test:launch')));
  assert.ok(result.warnings.includes('Missing EXPO_PUBLIC_SUPABASE_ANON_KEY in .env'));
});
