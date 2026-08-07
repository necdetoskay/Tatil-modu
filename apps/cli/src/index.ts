const command = process.argv[2] ?? 'status';

const status = {
  application: 'tatil-modu-headless',
  phase: 'H0_repository_foundation',
  uiDevelopmentAllowed: false,
  networkDefault: 'off',
  deterministicMode: true
} as const;

switch (command) {
  case 'status':
    process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
    break;
  default:
    process.stderr.write(`Unknown command: ${command}\n`);
    process.exitCode = 2;
}
