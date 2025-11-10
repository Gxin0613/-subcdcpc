import { reactive } from 'vue';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();
const menuListMore = reactive([
  {
    No: 'More',
    Name: '更多',
    Icon: 'icon-layers',
    Enable: 1,
    ShowBadge: false,
    ArrList: [
      {
        No: 'FlowPage',
        Name: '流程',
        Url: '/WF/Comm/TreeEns?EnName=TreeEns_FlowSort2Flow',
        FileUrl: '/src/WF/Comm/TreeEns',
        Path: 'TreeEns',
        Paras: '?EnName=TreeEns_FlowSort2Flow',
        Icon: 'icon-organization',
        Enable: 1,
        ShowBadge: false,
      },
      {
        No: 'FrmPage',
        Name: '表单',
        Url: '/WF/Comm/TreeEns?EnName=TreeEns_FrmSort2Frm',
        FileUrl: '/src/WF/Comm/TreeEns',
        Path: 'TreeEns',
        Paras: '?EnName=TreeEns_FrmSort2Frm',
        Icon: 'icon-diamond',
        Enable: 1,
        ShowBadge: false,
      },
    ],
  },
]);

export default menuListMore;
