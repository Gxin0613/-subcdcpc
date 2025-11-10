import { Component, h, markRaw } from 'vue';
import FrmBBS from '/@/CCFast/CCBill/Components/FrmBBS/FrmBBS.vue';
import Track from '/@/WF/WorkOpt/OneWork/Track.vue';
import { message, Popconfirm } from 'ant-design-vue';

const createEl = (title: string, comp: Component, params: Recordable, baseComp: any) => {
  return h(
    'span',
    {
      style: {
        marginRight: '5px',
        color: 'var(--system-hover-bg-color)',
      },
      onClick: () => {
        baseComp.value?.openDrawer({
          title,
          width: '900px',
          component: markRaw(comp),
          params,
          showFooter: true,
        });
      },
    },
    { default: () => title },
  );
};
export const createActionButtons = (method, record, toolbarProps, tableConfigs, props, confirmDelete, baseComp) => {
  const methodArr: any[] = [];
  method.forEach((item) => {
    if (item.IsList === 1) {
      if (item.MethodModel === 'FrmBBS') {
        methodArr.push(createEl(item.Name, FrmBBS, { workID: record.OID.toString(), ...props.params }, baseComp));
      } else if (item.MethodModel === 'RefFlowTrack') {
        methodArr.push(createEl(item.Name, Track, { workID: record.OID.toString(), ...props.params }, baseComp));
      } else {
        methodArr.push(
          h(
            'span',
            { style: { 'text-align': 'center', color: 'var(--system-hover-bg-color)' } },
            h(
              'a',
              {
                ['onclick']: () => {
                  message.warning('待实现！');
                },
              },
              { default: () => item.Name },
            ),
          ),
        );
      }
    }
  });
  if (methodArr.length > 0) {
    return h(
      'div',
      {},
      {
        default: () => methodArr,
      },
    );
  } else if (toolbarProps.buttonList.find((btn) => btn.name == '删除')) {
    return h(
      Popconfirm,
      {
        title: `确定要删除记录 [${record.BillNo}] 吗`,
        onConfirm: async () => {
          tableConfigs.checkedItems = [record.OID];
          await confirmDelete();
        },
        okButtonProps: {
          danger: true,
        },
      },
      // { default: () => h(Tag, { color: '#ff5555' }, { default: () => '删除' }) },
      {
        default: () =>
          h('i', {
            style: {
              color: 'red',
            },
            class: 'icon-close',
          }),
      },
    );
  }
};
