import GenericCrudPage from '../components/GenericCrudPage';
import { resourceConfig } from '../data/initialDb';

export default function DevicesCrudPage() {
  return <GenericCrudPage resource="devices" config={resourceConfig.devices} />;
}
