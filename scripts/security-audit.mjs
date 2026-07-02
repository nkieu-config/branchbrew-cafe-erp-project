import { execSync } from 'node:child_process';

function readProductionAudit() {
  try {
    return JSON.parse(
      execSync('npm audit --omit=dev --json', {
        encoding: 'utf8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }),
    );
  } catch (error) {
    const stdout = error.stdout?.toString();
    if (stdout) {
      return JSON.parse(stdout);
    }
    throw error;
  }
}

const audit = readProductionAudit();

const vulnerabilities = audit.metadata?.vulnerabilities ?? {};
const critical = vulnerabilities.critical ?? 0;
const high = vulnerabilities.high ?? 0;

if (critical > 0) {
  console.error(
    `Found ${critical} critical vulnerabilities in production dependencies.`,
  );
  process.exit(1);
}

if (high > 0) {
  console.warn(
    `::warning::Found ${high} high-severity production vulnerabilities. Run "npm audit --omit=dev" and track upstream fixes.`,
  );
}

console.log('Production dependency audit passed (no critical vulnerabilities).');
