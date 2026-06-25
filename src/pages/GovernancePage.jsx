import { PageHeader } from '../components/layout/Layout';
import { VerificationRecordsTable } from '../components/governance/VerificationRecordsTable';

export function GovernancePage() {
  return (
    <div>
      <PageHeader
        title="AI Governance"
        description="Track AI feature verification records, review status, and audit evidence."
      />
      <VerificationRecordsTable />
    </div>
  );
}
