import GenericCrudPage from '../components/GenericCrudPage';
import { resourceConfig } from '../data/initialDb';

export default function BanksCrudPage() {
  return <GenericCrudPage resource="banks" config={resourceConfig.banks} />;
}
