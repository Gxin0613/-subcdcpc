<script lang="tsx">
  import { defineComponent, computed, ref, inject, PropType, withDirectives, vShow } from 'vue';
  import type { Menu } from '/@/router/types';
  import { Tooltip, Popover, Input, Button, message } from 'ant-design-vue';
  import { useDesign } from '/@/hooks/web/useDesign';
  import CoreMenuItem from './components/MenuItem.vue';
  import CoreSubMenu from './components/SubMenuItem.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { createAsyncComponent } from '/@/utils/factory/createAsyncComponent';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import { useGo } from '/@/hooks/web/usePage';
  import { useUserStore } from '/@/store/modules/user';
  import { Module } from '/@/CCFast/GPM/Module';
  import DBAccess from '/@/utils/gener/DBAccess';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
  import { GloComm } from '/@/WF/Comm/GloComm';
  import BSEntity from '/@/utils/gener/BSEntity';

  interface SimpleSubMenuProps {
    item?: Menu;
    parent?: boolean;
    collapsedShowTitle?: boolean;
    collapse?: boolean;
    theme?: 'dark' | 'light';
  }

  type CCMenuInfo = Menu & {
    AtPara: string;
    No: string;
    Name: string;
    meta: Recordable;
  };

  const SimpleMenuTag = createAsyncComponent(() => import('./SimpleMenuTag.vue'));

  const SimpleSubMenu = defineComponent({
    name: 'SimpleSubMenu',
    props: {
      item: { type: Object as PropType<Menu>, default: () => ({ name: '', path: '', meta: {} }) },
      parent: { type: Boolean, default: false },
      collapsedShowTitle: { type: Boolean, default: false },
      collapse: { type: Boolean, default: false },
      theme: String as PropType<'dark' | 'light'>,
    },
    setup(props: SimpleSubMenuProps) {
      const { t } = useI18n();
      const { prefixCls } = useDesign('simple-menu');
      const go = useGo();
      const user = useUserStore();
      const pStore = usePermissionStore();
      const p = usePermission();
      const overlayVisible = ref(false);
      const popVisible = ref(false);
      const popDeleteVisible = ref(false);
      const renameValue = ref('');
      const itemRef = computed(() => props.item!);
      const getShowMenu = computed(() => !itemRef.value.meta?.hideMenu);
      const getIcon = computed(() => itemRef.value.meta?.Icon);
      const getI18nName = computed(() => t(itemRef.value.name));
      const getShowSubTitle = computed(() => !props.collapse || !props.parent);
      const getIsCollapseParent = computed(() => !!props.collapse && !!props.parent);
      const getLevelClass = computed(() => {
        return [
          {
            [`${prefixCls}__parent`]: props.parent,
            [`${prefixCls}__children`]: !props.parent,
          },
        ];
      });

      const handleGPNCallback = inject<(arg: GPNReturnObj) => void>('handleGPNCallback');

      const userInfo = user.userInfo as unknown as Record<string, any>;
      const isAdmin = computed(() => userInfo?.IsAdmin === 1);

      function getSettingUrl(currentItem: CCMenuInfo, className: string) {
        const EnName = GetPara(currentItem.AtPara, 'EnName') || className;
        const No = currentItem.meta?.menuInfo?.No || '';
        const Name = currentItem.meta?.menuInfo?.Name || '';
        const url = `/src/WF/Comm/En.vue?EnName=${encodeURIComponent(EnName)}&PKVal=${No}`;
        return `/WF/Comm/TabWrapper?url=${encodeURIComponent(url)}&title=${encodeURIComponent(Name)}`;
      }

      function addTab(url: string) {
        go(url);
      }

      function menuHasChildren(menuTreeItem: Menu): boolean {
        return !menuTreeItem.meta?.hideChildrenInMenu && Reflect.has(menuTreeItem, 'children') && !!menuTreeItem.children && menuTreeItem.children.length > 0;
      }

      async function reloadMenu() {
        await pStore.buildCCFastRoutes();
        await p.refreshMenu();
      }

      async function addModule(system: any) {
        const val = window.prompt('请输入模块名称', '');
        if (!val) return;
        const en = new Module();
        en.Name = val;
        en.No = DBAccess.GenerGUID();
        en.SystemNo = system.meta.menuInfo.No;
        en.Icon = 'icon-folder';
        await en.Insert();
        await reloadMenu();
      }

      async function addSubModule(module: any) {
        const val = window.prompt('请输入模块名称', '');
        if (!val) return;
        const en = new Module();
        en.Name = val;
        en.No = DBAccess.GenerGUID();
        en.SystemNo = module.meta.menuInfo.SystemNo;
        en.ParentNo = module.meta.menuInfo.No;
        en.Icon = 'icon-folder';
        await en.Insert();
        await reloadMenu();
      }

      async function addMenu(moduleItem: any) {
        const urlSearchParams = new URLSearchParams();
        const menuParams = moduleItem.meta?.menuInfo || {};
        for (const key of Object.keys(menuParams)) {
          if (typeof key !== 'string') continue;
          urlSearchParams.append(key, String(menuParams[key]));
        }
        const urlGPN = GloComm.UrlGPN('GPN_Menu', menuParams.No, '&' + urlSearchParams.toString());
        if (handleGPNCallback) {
          handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer60, urlGPN));
        }
      }
      async function addMenuToSystem(system: any) {
        const urlSearchParams = new URLSearchParams();
        const menuParams = system.meta?.menuInfo || {};
        menuParams.SystemNo = system.meta.menuInfo.No;
        for (const key of Object.keys(menuParams)) {
          if (typeof key !== 'string') continue;
          urlSearchParams.append(key, String(menuParams[key]));
        }
        const urlGPN = GloComm.UrlGPN('GPN_Menu', '', '&' + urlSearchParams.toString());
        if (handleGPNCallback) {
          handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer60, urlGPN));
        }
      }
      async function deleteMenu() {
        popDeleteVisible.value = true;
      }

      //插入菜单
      async function insertMenu(moduleItem: any) {
        const menuParams = moduleItem.meta?.menuInfo || {};
        const urlGPN = GloComm.UrlGPN('GPN_Menu', menuParams.ModuleNo, '&SystemNo=' + menuParams.SystemNo);
        if (handleGPNCallback) {
          handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByDrawer60, urlGPN));
        }
      }

      async function handleSystemItemsMove(currentItem: any, actionType: 'Up' | 'Down') {
        const No = currentItem.meta?.menuInfo?.No || '';
        if (!No) return;
        const systemNo = currentItem.meta?.menuInfo?.SystemNo || '';
        const en = new BSEntity('BP.CCFast.CCMenu.MySystem', systemNo);
        en.No = systemNo;
        await en.RetrieveFromDBSources();
        await en.DoMethodReturnString('ItemMove', No || '', actionType);
        await reloadMenu();
      }

      async function move(currentItem: any, type: 'MySystem' | 'Module' | 'Menu', action: 'DoUp' | 'DoDown') {
        const No = currentItem.meta?.menuInfo?.No || '';
        if (!No) return;
        const en = new BSEntity('BP.CCFast.CCMenu.' + type, No);
        en.No = No;
        await en.RetrieveFromDBSources();
        await en.DoMethodReturnString(action);
        await reloadMenu();
        overlayVisible.value = false;
      }

      async function editName(currentItem) {
        renameValue.value = currentItem.meta?.menuInfo?.Name || '';
        popVisible.value = true;
      }

      async function handleRenameConfirm(currentItem: any, type: 'MySystem' | 'Module' | 'Menu') {
        const No = currentItem.meta?.menuInfo?.No || '';
        if (!No) return;
        const en = new BSEntity('BP.CCFast.CCMenu.' + type, No);
        en.No = No;
        await en.RetrieveFromDBSources();
        if (renameValue.value.trim()) {
          en.Name = renameValue.value;
          await en.Update();
          await reloadMenu();
          popVisible.value = false;
        }
      }

      async function handleDelectConfirm(currentItem: any, type: 'MySystem' | 'Module' | 'Menu') {
        const No = currentItem.meta?.menuInfo?.No || '';
        // const isChildren = currentItem?.children || '';
        if (!No) return;
        // if (!isChildren) {
        try {
          const en = new BSEntity('BP.CCFast.CCMenu.' + type, No);
          en.No = No;
          await en.RetrieveFromDBSources();
          await en.Delete();
          await reloadMenu();
          popDeleteVisible.value = false;
        } catch (e: any) {
          message.error(e.toString());
        }
        // }
      }

      async function handleInputChange(e) {
        renameValue.value = e.target.value;
      }

      function isSystem(record: any) {
        const { systemCode } = record.meta || {};
        return typeof systemCode === 'string' && systemCode !== '';
      }

      function isSubModule(record: any) {
        const { moduleCode } = record.meta || {};
        return typeof moduleCode === 'string' && moduleCode !== '' && record.meta?.menuInfo?.ParentNo;
      }

      function isModule(record: any) {
        const { moduleCode } = record.meta || {};
        return typeof moduleCode === 'string' && moduleCode !== '';
      }

      function enablePopoverAction(currentItem: Menu) {
        return isAdmin.value && currentItem.meta && 'menuInfo' in currentItem.meta;
      }

      const renderCommonItemContent = (isSubMenuTitle = false, isPopoverEnabled = false) => {
        let collapseTitleClass = 'mt-2 collapse-title'; // Default for popover enabled or submenu
        if (!isPopoverEnabled && !isSubMenuTitle && props.parent) {
          collapseTitleClass = 'mt-1 collapse-title';
        } else if (isSubMenuTitle || isPopoverEnabled) {
          collapseTitleClass = 'mt-2 collapse-title';
        }

        return (
          <>
            {getIcon.value && <i class={getIcon.value} style="margin-right: 8px"></i>}
            {props.collapsedShowTitle && getIsCollapseParent.value && <div class={collapseTitleClass}> {getI18nName.value} </div>}
            {withDirectives(<span class={['ml-2', `${prefixCls}-sub-title`]}> {getI18nName.value} </span>, [[vShow, getShowSubTitle.value]])}
            <SimpleMenuTag item={itemRef.value} collapseParent={!!props.collapse && !!props.parent} />
          </>
        );
      };

      function isDirectSystemMenu(currentItem: Menu) {
        const { ModuleNo } = currentItem?.meta?.menuInfo as Recordable;
        return ModuleNo == '';
      }

      const renderAdminActionsForMenuItem = (currentItem: Menu) => {
        if (isModule(currentItem)) {
          return (
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px">
              <span style="cursor: pointer" onClick={() => editName(currentItem)}>
                <i class="icon-note">修改</i>
              </span>
              <span style="cursor: pointer" type="primary" size="small" onClick={() => handleSystemItemsMove(currentItem, 'Up')}>
                <i class="icon-arrow-up-circle">上移</i>
              </span>
              <span style="cursor: pointer" type="primary" size="small" onClick={() => handleSystemItemsMove(currentItem, 'Down')}>
                <i class="icon-arrow-down-circle">下移</i>
              </span>
              <span style="cursor: pointer" type="primary" size="small" onClick={() => deleteMenu()}>
                <i class="icon-close">删除</i>
              </span>
              <span style="cursor: pointer" type="primary" size="small" onClick={() => addSubModule(currentItem)}>
                <i class="icon-plus">新建模块</i>
              </span>
              <span style="cursor: pointer" type="primary" size="small" onClick={() => addMenu(currentItem)}>
                <i class="icon-plus">新建菜单</i>
              </span>
            </div>
          );
        } else {
          return (
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px">
              <span style="cursor: pointer" onClick={() => editName(currentItem)}>
                <i class="icon-note">修改</i>
              </span>
              <span style="cursor: pointer" type="primary" size="small" onClick={() => addTab(getSettingUrl(currentItem as CCMenuInfo, 'TS.GPM.Menu'))}>
                <i class="icon-settings">设置</i>
              </span>
              <span
                style="cursor: pointer"
                type="primary"
                size="small"
                onClick={() => {
                  if (isDirectSystemMenu(currentItem)) {
                    handleSystemItemsMove(currentItem, 'Up');
                    return;
                  }
                  move(currentItem, 'Menu', 'DoUp');
                }}
              >
                <i class="icon-arrow-up-circle">上移</i>
              </span>
              <span
                style="cursor: pointer"
                type="primary"
                size="small"
                onClick={() => {
                  if (isDirectSystemMenu(currentItem)) {
                    handleSystemItemsMove(currentItem, 'Down');
                    return;
                  }
                  move(currentItem, 'Menu', 'DoDown');
                }}
              >
                <i class="icon-arrow-down-circle">下移</i>
              </span>
              <span style="cursor: pointer" type="primary" size="small" onClick={() => deleteMenu()}>
                <i class="icon-close">删除</i>
              </span>
              <span style="cursor: pointer" type="primary" size="small" onClick={() => insertMenu(currentItem)}>
                <i class="icon-plus">插入菜单</i>
              </span>
            </div>
          );
        }
      };

      const renderAdminCreateActions = (currentItem: Menu) => {
        if (isSystem(currentItem)) {
          return (
            <>
              <span style="cursor: pointer" type="primary" size="small" onClick={() => addModule(currentItem)}>
                <i class="icon-plus">新建模块</i>
              </span>
              <span style="cursor: pointer" onClick={() => addMenuToSystem(currentItem)}>
                <i class="icon-plus">新建菜单(sys)</i>
              </span>
            </>
          );
        } else if (isModule(currentItem)) {
          return (
            <>
              <span style="cursor: pointer" type="primary" size="small" onClick={() => addSubModule(currentItem)}>
                <i class="icon-plus">新建模块</i>
              </span>
              <span style="cursor: pointer" onClick={() => addMenu(currentItem)}>
                <i class="icon-plus">新建菜单</i>
              </span>
            </>
          );
        }
      };

      const renderAdminActionsForSubMenu = (currentItem: Menu) => {
        return (
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px">
            <span style="cursor: pointer" onClick={() => editName(currentItem)}>
              <i class="icon-note">修改</i>
            </span>
            <span style="cursor: pointer" onClick={() => addTab(getSettingUrl(currentItem as CCMenuInfo, isModule(currentItem) ? 'TS.GPM.Module' : 'TS.GPM.MySystem'))}>
              <i class="icon-settings">设置</i>
            </span>
            <span
              style="cursor: pointer"
              onClick={() => {
                if (isModule(currentItem)) {
                  handleSystemItemsMove(currentItem, 'Up');
                  return;
                }
                move(currentItem, 'MySystem', 'DoUp');
              }}
            >
              <i class="icon-arrow-up-circle">上移</i>
            </span>
            <span
              style="cursor: pointer"
              onClick={() => {
                if (isModule(currentItem)) {
                  if (!isSubModule(currentItem)) {
                    handleSystemItemsMove(currentItem, 'Down');
                  } else {
                    move(currentItem, 'Module', 'DoDown');
                  }
                  return;
                }
                move(currentItem, 'MySystem', 'DoDown');
              }}
            >
              <i class="icon-arrow-down-circle">下移</i>
            </span>
            <span style="cursor: pointer" type="primary" size="small" onClick={() => deleteMenu()}>
              <i class="icon-close">删除</i>
            </span>
            {renderAdminCreateActions(currentItem)}
          </div>
        );
      };

      return () => {
        const currentItem = itemRef.value;
        if (!getShowMenu.value) {
          return null;
        }

        const hasChildren = menuHasChildren(currentItem);
        const popoverActionsEnabled = enablePopoverAction(currentItem);

        // 渲染Popover内容
        const renderRenamePopoverContent = (currentItem, type: 'MySystem' | 'Module' | 'Menu') => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Input value={renameValue.value} onChange={handleInputChange} onPressEnter={() => handleRenameConfirm(currentItem, type)} autoFocus />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button size="small" onClick={() => (popVisible.value = false)}>
                取消
              </Button>
              <Button size="small" type="primary" onClick={() => handleRenameConfirm(currentItem, type)}>
                确认
              </Button>
            </div>
          </div>
        );

        const deletePopoverContent = (currentItem, type: 'MySystem' | 'Module' | 'Menu') => (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button size="small" onClick={() => (popDeleteVisible.value = false)}>
                取消
              </Button>
              <Button size="small" type="primary" onClick={() => handleDelectConfirm(currentItem, type)}>
                确认
              </Button>
            </div>
          </div>
        );

        if (popoverActionsEnabled) {
          if (!hasChildren) {
            return (
              <CoreMenuItem name={currentItem.path} {...props} class={getLevelClass.value}>
                <Popover
                  open={popVisible.value}
                  onOpenChange={(val) => (popVisible.value = val)}
                  trigger="click"
                  title={'重命名'}
                  content={renderRenamePopoverContent(currentItem, isModule(currentItem) ? 'Module' : 'Menu')}
                ></Popover>
                <Popover
                  open={popDeleteVisible.value}
                  onOpenChange={(val) => (popDeleteVisible.value = val)}
                  trigger="click"
                  title={'是否删除?'}
                  content={deletePopoverContent(currentItem, isModule(currentItem) ? 'Module' : 'Menu')}
                ></Popover>
                {popoverActionsEnabled && (
                  <Tooltip placement="right" open={overlayVisible.value} onUpdate:open={(val: boolean) => (overlayVisible.value = val)} color="#111111">
                    {{
                      title: () => renderAdminActionsForMenuItem(currentItem),
                      default: () => renderCommonItemContent(false, true),
                    }}
                  </Tooltip>
                )}
              </CoreMenuItem>
            );
          } else {
            return (
              <CoreSubMenu name={currentItem.path} class={[getLevelClass.value, props.theme]} collapsedShowTitle={props.collapsedShowTitle}>
                {{
                  title: () => (
                    <>
                      <Popover
                        open={popVisible.value}
                        onOpenChange={(val) => (popVisible.value = val)}
                        trigger="click"
                        title={'重命名'}
                        content={renderRenamePopoverContent(currentItem, isModule(currentItem) ? 'Module' : 'MySystem')}
                      ></Popover>
                      <Popover
                        open={popDeleteVisible.value}
                        onOpenChange={(val) => (popDeleteVisible.value = val)}
                        trigger="click"
                        title={'是否删除?'}
                        content={deletePopoverContent(currentItem, isModule(currentItem) ? 'Module' : 'MySystem')}
                      ></Popover>
                      <Tooltip placement="right" open={overlayVisible.value} onUpdate:open={(val: boolean) => (overlayVisible.value = val)} color="#111111">
                        {{
                          title: () => renderAdminActionsForSubMenu(currentItem),
                          default: () => renderCommonItemContent(true, true),
                        }}
                      </Tooltip>
                    </>
                  ),
                  default: () => (currentItem.children || []).map((childrenItem) => <SimpleSubMenu key={childrenItem.path} {...props} item={childrenItem} parent={false} />),
                }}
              </CoreSubMenu>
            );
          }
        } else {
          if (!hasChildren) {
            return (
              <CoreMenuItem name={currentItem.path} {...props} class={getLevelClass.value} style={props.collapse ? { paddingLeft: '14px' } : {}}>
                <Tooltip placement="right" open={overlayVisible.value} onUpdate:open={(val: boolean) => (overlayVisible.value = val)} color="#111111">
                  {{
                    title: () => getI18nName.value,
                    default: () => renderCommonItemContent(false, false),
                  }}
                </Tooltip>
              </CoreMenuItem>
            );
          } else {
            return (
              <CoreSubMenu name={currentItem.path} class={[getLevelClass.value, props.theme]} collapsedShowTitle={props.collapsedShowTitle}>
                {{
                  title: () => renderCommonItemContent(true, false),
                  default: () => (currentItem.children || []).map((childrenItem) => <SimpleSubMenu key={childrenItem.path} {...props} item={childrenItem} parent={false} />),
                }}
              </CoreSubMenu>
            );
          }
        }
      };
    },
  });
  export default SimpleSubMenu;
</script>
