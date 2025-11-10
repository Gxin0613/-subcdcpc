import { withInstall } from '/@/utils';
import entityTree from './src/EnTree.vue';
import entityQuery from './src/EnQuery.vue';

export const EnTree = withInstall(entityTree);
export const EnQuery = withInstall(entityQuery);
export * from './src/typing';
