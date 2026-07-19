import { collectLaunchInputs, evaluateLaunchReadiness } from './launch-check-lib.mjs';

const projectRoot = process.cwd();
const { errors, warnings } = evaluateLaunchReadiness(collectLaunchInputs(projectRoot));

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
