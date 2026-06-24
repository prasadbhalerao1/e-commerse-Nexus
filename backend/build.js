import fs from 'fs';
import { execSync } from 'child_process';

console.log('// PROJECT NEXUS: RUNNING BACKEND BUILD COMPILING CHECKS...');
try {
  // Syntax checks the main server file
  execSync('node --check src/app/server.js', { stdio: 'inherit' });

  // Satisfy Vercel static build requirements by creating a dummy public directory
  if (!fs.existsSync('public')) {
    fs.mkdirSync('public');
  }
  console.log('// UPLINK CHECK COMPLETED: 0 ERRORS DETECTED.');
} catch (err) {
  console.error('// BUILD CHECK FAILURE:', err.message);
  process.exit(1);
}
