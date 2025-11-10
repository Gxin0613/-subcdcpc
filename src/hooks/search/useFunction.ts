import { ref, type Ref, type ShallowRef } from 'vue';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { message, Modal } from 'ant-design-vue';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import type { Entities } from '/@/bp/en/Entities';
import type BaseComponent from '/@/WF/Comm/BaseComponent.vue';
import type { Entity } from '/@/bp/en/Entity';
import type { RowKey } from 'naive-ui/es/data-table/src/interface';
import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
import HttpHandler from '/@/utils/gener/HttpHandler';

export function useFunction(
  ensInst: Ref<Entities | null>,
  enInst: Ref<Entity | null>,
  dataSource: Ref<Recordable[]>,
  checkedRowKeysRef: Ref<RowKey[]>,
  baseComponent: ShallowRef<InstanceType<typeof BaseComponent>>,
  entityWG: Ref<WaiGuaBaseEntity | null>,
  query: Function,
) {
  const execMethod = async (row, rm: RefMethod, title, methodType = 'EntityMap') => {
    try {
      const funcName = rm?.ClassMethod as string;
      if (!funcName) {
        message.error('方法名未找到');
        return;
      }
      if (!row) {
        message.error('未找到数据');
        return;
      }
      const tempEn = ensInst.value?.GetNewEntity;
      if (!tempEn) {
        message.error('实体未初始化');
        return;
      }
      if (methodType === 'EntityMap') {
        tempEn.setPKVal(row[tempEn.PK]);
        await tempEn.RetrieveFromDBSources();
        if (rm.RefMethodType == RefMethodType.Func) {
          Modal.confirm({
            content: rm.Warning || '您确定要执行吗？',
            okText: '确定',
            async onOk() {
              const result = await tempEn?.[funcName](row);
              if (result instanceof GPNReturnObj) {
                baseComponent.value?.handleGPNCallback(result);
                return;
              }
              await query();
              return;
            },
          });
          return;
        }
        const res = await tempEn[funcName](row);
        if (res instanceof GPNReturnObj) {
          baseComponent.value?.handleGPNCallback(res);
          return;
        }
        await query();
        return;
      }
      if (entityWG.value != null) {
        //执行自定义的方法
        const result = await entityWG.value?.BtnClick('SearchOpt', title, '', row);
        if (result?.hasOwnProperty?.('ReturnType')) {
          baseComponent.value?.handleGPNCallback(result);
        }
      }
    } catch (e: any) {
      console.error(e);
      message.error(e.toString() || '出现错误');
    }
  };
  // 批处理
  const taskList = ref<Recordable[]>([]);
  const execBatchFunction = async (rm: RefMethod) => {
    const funcName = rm?.ClassMethod as string;
    if (!rm || !funcName) {
      message.error('实体未找到此方法，请检查');
      return;
    }
    if (!enInst) {
      message.error('实体初始化失败，请检查');
      return;
    }
    if (entityWG.value != null && rm.Tag === 'WaiGua') {
      //执行自定义的方法
      const result = await entityWG.value?.BtnClick('SearchToolbar', (rm.Title || funcName) as string, checkedRowKeysRef.value.join(','), undefined);
      if (result?.hasOwnProperty?.('ReturnType')) {
        baseComponent.value?.handleGPNCallback(result);
      }
      return;
    }
    if (dataSource.value.length === 0) {
      message.error('请您选择要执行的记录.');
      return;
    }
    if (checkedRowKeysRef.value.length === 0) {
      message.warn('请选择需要批量处理的数据');
      return;
    }
    const execMethod = async (_methodName: string, data: Recordable) => {
      try {
        baseComponent.value?.resetModal();
        baseComponent.value?.handleGPNCallback(
          new GPNReturnObj(
            GPNReturnType.OpenCompByModal,
            {
              compUrl: '/src/WF/Comm/subComponents/LoadingPanel.vue',
              params: {
                taskList: taskList,
              },
            },
            `批处理(选中条数:${checkedRowKeysRef.value.length})`,
          ),
        );
        taskList.value = [];
        if (checkedRowKeysRef.value.length === 0) {
          message.warn('请选择处理的记录');
          return;
        }
        for (const pk of checkedRowKeysRef.value) {
          const tempEn = ensInst.value?.GetNewEntity;
          if (!tempEn) {
            continue;
          }
          tempEn.setPKVal(pk);
          await tempEn.RetrieveFromDBSources();
          const task = {
            id: pk,
            status: 'loading',
            text: '',
            func: async () => {
              return await tempEn[_methodName](...Object.values(data));
            },
          };
          taskList.value.push(task);
        }

        for (const task of taskList.value) {
          task
            .func()
            .then((res) => {
              task.status = 'finished';
              task.text = res;
            })
            .catch((e) => {
              task.status = 'fail';
              task.text = e.toString();
            });
        }
        message.success('执行成功');
      } catch (e: any) {
        message.error(e.toString());
      }
    };
    if (rm.Tag != 'WaiGua') {
      if (rm.HisMap.attrs.length === 0) {
        Modal.confirm({
          content: rm.Warning || '您确定要执行吗？',
          okText: '确定',
          async onOk() {
            const tempEn = ensInst.value?.GetNewEntity;
            await tempEn?.[funcName](checkedRowKeysRef.value.join(','));
            await query();
            return;
          },
        });
        return;
      }
      baseComponent.value?.handleGPNCallback(
        new GPNReturnObj(
          GPNReturnType.OpenCompByModal,
          {
            params: {
              row: dataSource.value[0],
              title: rm.Title,
              'method-name': funcName,
              'rm-en-map': rm.HisMap,
              'entity-ref': enInst,
              execTips: rm.Warning,
              execFunc: execMethod,
              refMethod: rm,
            },
            compUrl: '/src/WF/Comm/RefMethodFunc.vue',
          },
          `批处理(选中条数:${checkedRowKeysRef.value.length})`,
        ),
      );
    }
  };
  const createMethods = async () => {
    let methods = enInst.value?._enMap.rms as RefMethod[];
    if (entityWG.value != null) {
      const toolbarFuuncs = entityWG.value?.SearchToolbarBtns;
      if (typeof toolbarFuuncs === 'string' && toolbarFuuncs.length > 0) {
        const extMethods = toolbarFuuncs
          .split(',')
          .filter((b) => b)
          .map((item) => {
            const refMethod: RefMethod = new RefMethod();
            refMethod.Title = item;
            refMethod.ClassMethod = item;
            refMethod.Tag = 'WaiGua';
            refMethod.IsCanBatch = true;
            refMethod.IsForEns = false;
            refMethod.RefMethodType = RefMethodType.Func;
            return refMethod;
          });
        methods.push(...extMethods);
      }
    }
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    handler.AddPara('EnName', enInst.value?.classID);
    const data = await handler.DoMethodReturnString('Entity_DBRoleMethods');
    if (!!data) {
      methods = methods.filter((method) => data.includes(',' + method.Title + ','));
    }
    return { permissionStr: data, methods };
  };

  return {
    createMethods,
    execMethod,
    execBatchFunction,
  };
}
