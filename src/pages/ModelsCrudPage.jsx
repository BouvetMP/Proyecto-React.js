import GenericCrudPage from '../components/GenericCrudPage';
import { resourceConfig } from '../data/initialDb';

export default function ModelsCrudPage() {
  return <GenericCrudPage resource="models" config={resourceConfig.models} />;
}
