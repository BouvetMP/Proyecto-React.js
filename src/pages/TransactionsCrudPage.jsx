import GenericCrudPage from '../components/GenericCrudPage';
import { resourceConfig } from '../data/initialDb';

export default function TransactionsCrudPage() {
  return <GenericCrudPage resource="transactions" config={resourceConfig.transactions} />;
}
