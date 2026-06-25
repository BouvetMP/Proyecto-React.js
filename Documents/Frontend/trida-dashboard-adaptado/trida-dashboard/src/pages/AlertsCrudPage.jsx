import GenericCrudPage from '../components/GenericCrudPage';
import { resourceConfig } from '../data/initialDb';

export default function AlertsCrudPage() {
  return <GenericCrudPage resource="alerts" config={resourceConfig.alerts} />;
}
