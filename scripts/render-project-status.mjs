import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));
const statusPath = join(root, 'project-status.json');
const outputPath = join(root, 'docs', 'generated', 'project-status.md');
const checkOnly = process.argv.includes('--check');

const status = JSON.parse(await readFile(statusPath, 'utf8'));
const completed = status.harness.caseDepthCompletedComponents.length;
const total = status.harness.registeredComponents;

const rendered = `# Tatil Modu — Generated Project Status

> Bu dosya \`project-status.json\` kaynağından üretilir. Elle düzenlenmez.

| Alan | Değer |
|---|---|
| Güncelleme | ${status.updatedAt} |
| Güncel aşama | ${status.currentStage} |
| Güncel odak | ${status.currentFocus} |
| Golden contract paketleri | ${status.design.goldenContractPackages}/${status.design.goldenContractPackagesRequired} |
| Cross-contract reconciliation | ${status.design.crossContractReconciliation} |
| H0 Repository Foundation | ${status.foundation.h0RepositoryFoundation} |
| M1 harness | ${status.harness.state} |
| Recorded artifact coverage | ${status.harness.recordedArtifactCoverage}/${total} |
| R2 case-depth tamamlanan component | ${completed}/${total} (${status.harness.caseDepthCompletedComponents.join(', ')}) |
| R2 case-depth gate | ${status.harness.caseDepthGate} |
| Deterministic runtime vertical slice | ${status.runtime.verticalSlice} |
| Verification blocks final composition | ${status.runtime.verificationBlocksFinalComposition ? 'YES' : 'NO'} |
| Local deterministic suite | ${status.quality.localDeterministicSuite} (${status.quality.testFilesPassed} files / ${status.quality.testsPassed} tests) |
| Runtime implementation | ${status.gates.runtimeImplementationAllowed ? 'ALLOWED' : 'LOCKED'} |
| Live provider integration | ${status.gates.liveProviderIntegrationAllowed ? 'ALLOWED' : 'LOCKED'} |
| Headless core acceptance | ${status.gates.headlessCoreAccepted ? 'PASS' : 'PENDING'} |
| UI readiness review | ${status.gates.uiReadinessReviewAllowed ? 'ALLOWED' : 'LOCKED'} |
| UI development | ${status.gates.uiDevelopmentAllowed ? 'ALLOWED' : 'LOCKED'} |
| Production release | ${status.gates.productionReleaseAllowed ? 'ALLOWED' : 'LOCKED'} |
`;

if (checkOnly) {
  const current = await readFile(outputPath, 'utf8').catch(() => '');
  if (current !== rendered) {
    console.error('Generated project status is stale. Run: pnpm status:render');
    process.exit(1);
  }
  console.log('Project status sync: PASS');
} else {
  await writeFile(outputPath, rendered, 'utf8');
  console.log('Rendered docs/generated/project-status.md');
}
