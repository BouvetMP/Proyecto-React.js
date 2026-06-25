import GenericCrudPage from '../components/GenericCrudPage';
import { resourceConfig } from '../data/initialDb';

export default function UsersCrudPage() {
  return <GenericCrudPage resource="users" config={resourceConfig.users} />;
}
