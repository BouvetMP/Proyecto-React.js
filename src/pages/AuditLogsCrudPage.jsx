import GenericCrudPage from '../components/GenericCrudPage';
import { resourceConfig } from '../data/initialDb';

export default function AuditLogsCrudPage() {
  return <GenericCrudPage resource="auditLogs" config={resourceConfig.auditLogs} />;
}
