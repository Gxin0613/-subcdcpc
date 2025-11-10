import { cloneDeep } from 'lodash-es';
import { Entity } from '/@/bp/en/Entity';

export function useDtlQueryCondition() {
  const getQueryArgs = (params: Record<string, any>, query: Record<string, any>, entity: Entity) => {
    const args = Object.assign(cloneDeep(query || {}), cloneDeep(params));
    delete args.EnName;
    delete args.EnsName;
    const queryArgs: string[] = [];
    const qKeys = Object.keys(args);
    //queryArgs.push(args['RefPK'], args['RefPKVal']);
    for (const queryKey of qKeys) {
      if (queryKey === 'Idx') continue;
      if (queryKey === 'OrgNo') continue;
      if (queryKey === 'Icon') continue;
      if (queryKey === 'RefPK') {
        const refPK = args[queryKey] || 'RefPK';
        if (entity.Row.has(refPK)) queryArgs.push(refPK, args['PKVal']);
        continue;
      }
      if (queryKey === 'FrmID' && entity.Row.has('FK_MapData') && !entity.Row.has('FrmID')) queryArgs.push(queryKey, args[queryKey]);
      if (!entity.Row.has(queryKey)) continue; //如果不存在这个属性.
      if (queryKey.toLowerCase() !== 'orderby') {
        queryArgs.push(queryKey, args[queryKey]);
      }
    }

    const orderBy = qKeys.find((key) => key.toLowerCase() === 'orderby');
    if (orderBy) {
      queryArgs.push(args[orderBy]);
    }
    return queryArgs;
  };

  return {
    getQueryArgs,
  };
}
