import { guid } from '../utils/Uuid';
export default function useUUID(key: string) {
  return key + '_' + guid().substring(0, 6);
}
