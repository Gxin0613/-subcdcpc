import { withInstall } from '/@/utils';
import groupLayout from './src/GroupLayout.vue';
import menuLayout from './src/MenuLayout.vue';
import listLayout from './src/ListLayout.vue';

export * from './src/typing';
export * from './src/constants';
export const GroupLayout = withInstall(groupLayout);
export const MenuLayout = withInstall(menuLayout);
export const ListLayout = withInstall(listLayout);
