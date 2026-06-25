import GenericCrudPage from '../components/GenericCrudPage';
import { resourceConfig } from '../data/initialDb';

export default function RulesCrudPage() {
  return <GenericCrudPage resource="rules" config={resourceConfig.rules} />;
}
