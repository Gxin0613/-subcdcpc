<template>
  <BaseComponent ref="baseComponent" :close-drawer-func="InitPage" :update-func="InitPage">
    <div class="p-1">
      <Spin :spinning="loading">
        <div v-if="errorObj.hasError" class="ant-tag-red">
          {{ errorObj.tips }}
        </div>
        <div v-else class="content">
          <div class="modules-container" ref="modulesContainer">
            <!-- 系统级菜单（ModuleNo = ''）块：标题 + 列表整体边框 -->
            <div v-if="rootMenus.length > 0" class="root-menus">
              <div class="root-title">
                <span class="badge"></span>
                系统级菜单
              </div>
              <div class="root-menus-box">
                <TreeNode
                  :node-data="{ No: '__root__', Name: '系统菜单', Icon: '', IsModule: true, children: rootMenus }"
                  :level="0"
                  :list-model="listModeCompute"
                  :render-header="false"
                  @change-enable="changeEnableStatus"
                  @get-entity-info="getEntityInfo"
                  @handle-doc-click="handleDocClick"
                  @node-moved="handleNodeMoved"
                >
                  <template #menu-actions="{ menu, parent }">
                    <template v-if="menuMethods.length > 1">
                      <AntDropButton type="default" ghost @click="BtnClick(menu, null, menuMethods[0], '')">
                        {{ menuMethods[0] }}
                        <template v-if="menuMethods.slice(1).length > 0" #overlay>
                          <Menu @click="(ev: any) => BtnClick(menu, null, ev.key, '')">
                            <MenuItem v-for="button in menuMethods.slice(1)" :key="button">
                              {{ button }}
                            </MenuItem>
                          </Menu>
                        </template>
                      </AntDropButton>
                    </template>
                    <Button v-else-if="menuMethods.length === 1" type="default" ghost class="btn_style" @click="BtnClick(menu, null, menuMethods[0], '')">
                      {{ menuMethods[0] }}
                    </Button>
                    <Popconfirm
                      v-if="delMenuBtnName"
                      :title="'`确定要删除[' + menu.Name + ']吗？`'"
                      :ok-text="'确定'"
                      :cancel-text="'取消'"
                      @confirm="BtnClick(menu, null, delMenuBtnName, '')"
                    >
                      <Button type="default" ghost danger style="margin-left: 8px">
                        <template #icon>
                          <DeleteOutlined :size="12" />
                        </template>
                      </Button>
                    </Popconfirm>
                    <Popconfirm
                      v-if="itemUAC?.IsDelete"
                      :title="'`确定要删除[' + menu.Name + ']吗？`'"
                      :ok-text="'确定'"
                      :cancel-text="'取消'"
                      @confirm="entityDelete(menu, parent)"
                    >
                      <Button type="default" ghost danger style="margin-left: 8px">
                        <template #icon>
                          <DeleteOutlined :size="12" />
                        </template>
                      </Button>
                    </Popconfirm>
                    <Button v-if="itemUAC?.IsUpdate" type="default" ghost class="btn_style" @click="getEntityInfo(menu)" style="margin-left: 8px">{{ '属性' }}</Button>
                  </template>
                </TreeNode>
              </div>
            </div>
            <!-- 模块分组标题（扁平风，与系统级统一） -->
            <div v-if="modules.length > 0" class="root-title" style="margin-top: 6px">
              <span class="badge"></span>
              模块
            </div>
            <!-- 使用递归TreeNode组件 -->
            <TreeNode
              v-for="moduleItem in modules"
              :key="moduleItem.No"
              :node-data="moduleItem"
              :level="0"
              :list-model="listModeCompute"
              @change-enable="changeEnableStatus"
              @get-entity-info="getEntityInfo"
              @handle-doc-click="handleDocClick"
              @node-moved="handleNodeMoved"
            >
              <!-- 模块操作按钮 -->
              <template #module-actions="{ node }">
                <Button
                  v-for="button in moduleMethods"
                  :key="button"
                  class="btn_style"
                  style="margin-left: 8px"
                  :type="button.includes('新建') ? 'primary' : 'default'"
                  :ghost="!button.includes('新建')"
                  @click="BtnClick(node, null, button, 'group')"
                >
                  {{ button }}
                </Button>
                <Popconfirm
                  v-if="delModuleBtnName"
                  :title="'`确定要删除模块[${node.Name}]吗？`'"
                  :ok-text="'确定'"
                  :cancel-text="'取消'"
                  @confirm="BtnClick(node, null, delModuleBtnName, 'group')"
                >
                  <Button type="default" ghost danger style="margin-left: 8px">
                    <template #icon>
                      <DeleteOutlined :size="12" />
                    </template>
                  </Button>
                </Popconfirm>
                <Button v-if="groupUAC.IsUpdate" type="default" ghost class="btn_style" @click="getEntityInfo(node)" style="margin-left: 8px">{{ '属性' }}</Button>
                <Popconfirm v-if="groupUAC.IsDelete" :title="'`确定要删除模块[${node.Name}]吗？`'" :ok-text="'确定'" :cancel-text="'取消'" @confirm="groupEnDelete(node)">
                  <Button style="margin-left: 8px; border: 1px solid #ff9999">
                    <template #icon>
                      <DeleteOutlined style="color: #ff9999" :size="12" />
                    </template>
                  </Button>
                </Popconfirm>
              </template>

              <!-- 菜单操作按钮 -->
              <template #menu-actions="{ menu, parent }">
                <template v-if="menuMethods.length > 1">
                  <AntDropButton type="default" ghost @click="BtnClick(menu, null, menuMethods[0], '')">
                    {{ menuMethods[0] }}
                    <template v-if="menuMethods.slice(1).length > 0" #overlay>
                      <Menu @click="(ev: any) => BtnClick(menu, null, ev.key, '')">
                        <MenuItem v-for="button in menuMethods.slice(1)" :key="button">
                          {{ button }}
                        </MenuItem>
                      </Menu>
                    </template>
                  </AntDropButton>
                </template>
                <Button v-else-if="menuMethods.length === 1" type="default" ghost class="btn_style" @click="BtnClick(menu, null, menuMethods[0], '')">
                  {{ menuMethods[0] }}
                </Button>
                <Popconfirm
                  v-if="delMenuBtnName"
                  :title="`确定要删除[${menu.Name}]吗？`"
                  :ok-text="'确定'"
                  :cancel-text="'取消'"
                  @confirm="BtnClick(menu, null, delMenuBtnName, '')"
                >
                  <Button type="default" ghost danger style="margin-left: 8px">
                    <template #icon>
                      <DeleteOutlined :size="12" />
                    </template>
                  </Button>
                </Popconfirm>
                <Button v-if="itemUAC.IsUpdate" type="default" ghost class="btn_style" @click="getEntityInfo(menu)" style="margin-left: 8px">{{ '属性' }}</Button>
                <Popconfirm v-if="itemUAC.IsDelete" :title="`确定要删除[${menu.Name}]吗？`" :ok-text="'确定'" :cancel-text="'取消'" @confirm="entityDelete(menu, parent)">
                  <Button type="default" ghost danger style="margin-left: 8px">
                    <template #icon>
                      <DeleteOutlined :size="12" />
                    </template>
                  </Button>
                </Popconfirm>
              </template>
            </TreeNode>

            <AntEmpty class="empty-tag" v-if="modules.length === 0" :image="simpleImage" />
          </div>
        </div>
      </Spin>
    </div>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import { Spin, Popconfirm, DropdownButton as AntDropButton, Menu, MenuItem, Button, Empty as AntEmpty, message } from 'ant-design-vue';
  import { useRoute } from 'vue-router';
  import { onMounted, reactive, ref, shallowRef, computed } from 'vue';
  import { ClassFactoryOfPanelGroup } from '/@/WF/Comm/UIEntity/ClassFactoryOfPanelGroup';
  import { PageBasePanelGroup } from '/@/bp/UIEntity/PageBasePanelGroup';
  import { DeleteOutlined } from '@ant-design/icons-vue';
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import TreeNode from '/@/WF/Comm/TreeNode.vue';
  import { EntityNoName } from '/@/bp/en/EntityNoName';
  import { AtPara } from '/@/bp/da/AtPara';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import { Entity } from '/@/bp/en/Entity';

  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();

  type Result = Array<Record<string, any>>;
  const route = useRoute();
  const props = defineProps({
    params: {
      type: Object,
      default: () => ({}),
    },
  });

  const errorObj = reactive({
    tips: '',
    hasError: false,
  });

  const simpleImage = ref(AntEmpty.PRESENTED_IMAGE_SIMPLE);
  const loading = ref(false);
  const En = ref<PageBasePanelGroup>();
  const tableData = ref<Array<Record<string, any>>>([]);

  const handleDocClick = async (func: Function, title = '') => {
    if (typeof func === 'function') {
      const data = await func();
      console.log({ data });
      baseComponent.value?.handleGPNCallback(data, title);
    }
  };

  const listModeCompute = computed(() => {
    return (En.value?.HisListModel as unknown as string) || 'Table';
  });

  const getEntityInfo = async (en: EntityNoName) => {
    const ap = new AtPara(en.AtPara);
    let actualEnName = ap.GetValStrByKey('EnName');
    if (typeof actualEnName == 'string' && actualEnName.includes('.')) {
      const paraEntity = (await ClassFactory.GetEn(actualEnName)) as Entity;
      paraEntity.setPKVal(en.No);
      if (!(await paraEntity.IsExits())) {
        actualEnName = en.classID;
      }
    }
    if (!actualEnName) actualEnName = en.classID;
    baseComponent.value?.openDrawerByUrl(en.Name + '-属性', '/src/WF/Comm/En.vue', '70%', {
      EnName: actualEnName,
      PKVal: en.No,
    });
  };

  // 模块列表
  const modules = ref<any[]>([]);
  // 模块方法
  const moduleMethods = ref<string[]>([]);
  const delModuleBtnName = ref<string>('');
  // 菜单方法
  const menuMethods = ref<string[]>([]);
  const delMenuBtnName = ref<string>('');

  const groupUAC = ref();
  const itemUAC = ref();
  const modulesContainer = shallowRef<HTMLElement>();

  // 系统级（无隶属模块）菜单
  const rootMenus = ref<any[]>([]);

  // 转换数据为树形结构，并提取系统级菜单（ModuleNo为空字符串）
  const convertToTreeData = (groupsData: any[], dtlData: any[], refKey: string) => {
    const treeData: any[] = [];
    const moduleMap = new Map();

    // 首先处理所有模块数据，建立映射
    groupsData.forEach((group) => {
      group.children = [];
      group.collapse = true;
      group.loading = false;
      moduleMap.set(group.No, group);

      // 根据ParentNo建立层级关系
      if (group.ParentNo && group.ParentNo !== '0' && group.ParentNo !== '') {
        const parent = moduleMap.get(group.ParentNo);
        if (parent) {
          parent.children.push(group);
        } else {
          // 如果父节点还没处理，暂时放到根级，后面会调整
          treeData.push(group);
        }
      } else {
        treeData.push(group);
      }
    });

    // 处理菜单数据：有模块归属的挂到模块下；ModuleNo为空字符串的作为系统级菜单单独收集
    const sysLevelMenus: any[] = [];
    dtlData.forEach((dtl) => {
      dtl.loading = false;
      const moduleNo = dtl[refKey];
      // 空字符串表示直接挂在系统层级
      if (moduleNo === '') {
        sysLevelMenus.push(dtl);
        return;
      }
      const parentModule = moduleMap.get(moduleNo);
      if (parentModule) {
        parentModule.children.push(dtl);
      }
    });

    // 递归调整树形结构，确保所有节点都在正确的父节点下
    const adjustTreeStructure = (nodes: any[]) => {
      const result: any[] = [];
      nodes.forEach((node) => {
        if (node.ParentNo && node.ParentNo !== '0' && node.ParentNo !== '') {
          const parent = findNodeById(treeData, node.ParentNo);
          if (parent && parent !== node) {
            parent.children.push(node);
            return;
          }
        }
        result.push(node);
      });
      return result;
    };

    const findNodeById = (nodes: any[], id: string): any => {
      for (const node of nodes) {
        if (node.No === id) return node;
        if (node.children) {
          const found = findNodeById(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };

    // 更新根级菜单集合（按Idx升序以与侧边栏一致）
    rootMenus.value = sysLevelMenus.sort((a, b) => {
      const ai = parseInt(a.Idx || 0);
      const bi = parseInt(b.Idx || 0);
      if (ai === bi) return String(a.Name || '').localeCompare(String(b.Name || ''));
      return ai - bi;
    });

    return adjustTreeStructure(treeData);
  };

  // 加载页面
  async function InitPage() {
    try {
      loading.value = true;
      const EnName = props?.params?.EnName || route.query?.EnName;
      if (!EnName) {
        errorObj.hasError = true;
        errorObj.tips = '缺少必要参数 [ EnName ]';
        return;
      }

      const entity = ClassFactoryOfPanelGroup.GetEn(EnName as string);
      entity.setParams({ ...props.params });
      await entity.Init();

      En.value = entity;
      tableData.value = [];

      const dtlEns =
        entity?.DtlEns?.map((en) => {
          en.loading = false;
          return en;
        }) || [];

      // 使用新的树形数据转换（支持系统级菜单）
      const result = convertToTreeData(entity.GroupsEns as Result, dtlEns as Result, entity.RefKey as string);

      if (result?.length > 0) {
        // 分组实体权限
        const groupEn = entity.GroupsEns?.GetNewEntity;
        await groupEn?.Init();
        const itemEn = entity.DtlEns?.GetNewEntity;
        await itemEn?.Init();

        groupUAC.value = groupEn?.HisUAC;
        itemUAC.value = itemEn?.HisUAC;

        // 模块
        const moduleBtnNames = entity?.BtnsEnGroup?.split(',').filter((btn) => btn !== '') as string[];
        moduleMethods.value = moduleBtnNames.filter((menu) => !menu.includes('删除'));
        delModuleBtnName.value = moduleBtnNames.find((module) => module.includes('删除'))!;

        // 菜单
        const menuBtnNames = entity?.BtnsEnDtl?.split(',').filter((btn) => btn !== '') as string[];
        menuMethods.value = menuBtnNames?.filter((menu) => !menu.includes('删除'));
        delMenuBtnName.value = menuBtnNames.find((menu) => menu.includes('删除'))!;

        modules.value = result;
        return;
      }

      modules.value = result;
    } catch (e) {
      errorObj.hasError = true;
      errorObj.tips = e as string;
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    InitPage();
  });

  // 行中开关的编辑
  const changeEnableStatus = async (e, refObj) => {
    const key = 'IsEnable';
    const pkValue = refObj.No;
    const type = refObj.IsModule ? 'group' : 'dtl';

    refObj.loading = true;
    if (type === 'group') {
      const en = En.value?.GroupsEns?.GetNewEntity;
      if (en) {
        en.No = pkValue;
        await en?.RetrieveFromDBSources();
        en[key] = e == true ? 1 : 0;
        await en.Update();
        refObj[key] = en[key];
      }
    }
    if (type === 'dtl') {
      const en = En.value?.DtlEns?.GetNewEntity;
      if (en) {
        en.No = pkValue;
        await en?.RetrieveFromDBSources();
        en[key] = e == true ? 1 : 0;
        await en.Update();
        refObj[key] = en[key];
      }
    }
    refObj.loading = false;
  };

  const entityDelete = async (en: EntityNoName, parent: EntityNoName) => {
    try {
      loading.value = true;
      await en.Retrieve();
      await en.Delete();
      if (parent && Array.isArray(parent.children)) {
        parent.children = parent.children.filter((child) => child.No !== en.No);
        if (parent.No === '__root__') {
          // 同步更新系统级菜单集合
          rootMenus.value = parent.children;
        }
      } else {
        // 删除系统级菜单的本地项
        rootMenus.value = rootMenus.value.filter((child) => child.No !== en.No);
      }
    } catch (e: any) {
      message.error('删除失败，原因：' + e.toString());
    } finally {
      loading.value = false;
    }
  };

  const groupEnDelete = async (groupEn: EntityNoName) => {
    try {
      loading.value = true;
      await groupEn.Retrieve();
      await groupEn.Delete();

      // 递归删除函数
      const removeFromTree = (nodes: any[], targetNo: string): any[] => {
        return nodes.filter((node) => {
          if (node.No === targetNo) {
            return false;
          }
          if (node.children) {
            node.children = removeFromTree(node.children, targetNo);
          }
          return true;
        });
      };

      modules.value = removeFromTree(modules.value, groupEn.No);
    } catch (e: any) {
      message.error('删除失败，原因：' + e.toString());
    } finally {
      loading.value = false;
    }
  };

  const BtnClick = async (record: Recordable, _: unknown, btnName: string, type: string) => {
    const groupNo = type == 'group' ? record.No : record[En.value?.RefKey || ''];
    const no = type == 'group' ? '' : record.No;
    const result = await En.value?.BtnClick(btnName, groupNo, no);
    baseComponent.value?.handleGPNCallback(result);
  };

  // 处理节点拖动
  const handleNodeMoved = async (event: any) => {
    const { node, parent, oldIndex, newIndex } = event;

    // 重新排序子节点数组
    if (parent.children) {
      const children = [...parent.children];
      const [movedItem] = children.splice(oldIndex, 1);
      children.splice(newIndex, 0, movedItem);
      parent.children = children;
    }

    // 这里可以调用后端API来保存新的顺序
    // 例如：await saveNodeOrder(node.No, parent.No, newIndex);
    console.log('节点移动:', {
      nodeId: node.No,
      parentId: parent.No,
      oldIndex,
      newIndex,
    });
  };
</script>

<style scoped lang="less">
  .btn_style {
    height: 26px;
    border-radius: 4px;
    font-size: 12px;
    padding: 0 8px;
    margin-left: 4px;
  }

  .btn_add {
    /* 扁平风：统一为镂空按钮，保留类占位避免影响 */
    background-color: transparent;
    border-color: var(--system-bg-color);
    color: var(--system-bg-color);
  }

  .btn_del {
    background-color: transparent !important;
    border-color: #f56c6c !important;
    color: #f56c6c !important;
  }

  .modules-container {
    width: 100%;

    :deep(.ant-empty) {
      width: 100%;
    }
  }

  /* 系统级菜单卡片样式 */
  .root-menus {
    /* 更协调：淡化容器，仅保留标题，避免与模块卡片冲突 */
    border: none;
    background: transparent;
    border-radius: 0;
    padding: 2px 0 6px 0;
    margin-bottom: 6px;
  }

  .root-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #475569;
    padding: 0 2px 6px 2px;
    font-weight: 600;
  }
  .root-title .badge {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%);
    box-shadow: 0 0 0 2px rgba(96, 165, 250, 0.12);
  }

  /* 系统级菜单样式，严格复用 TreeNode 菜单样式 */
  .menu-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    margin-left: 24px;
    margin-top: 4px;
    position: relative;
    padding-left: 16px;
    background: linear-gradient(90deg, rgba(240, 240, 240, 0.2) 0%, transparent 15%);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(to bottom, #f0f0f0, #e6f7ff);
      border-radius: 1px;
    }

    :deep(.ant-empty) {
      width: 100%;
    }
  }

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 100%;
    box-sizing: border-box;
    font-size: 14px;
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #f0f0f0;
    border-radius: 4px;
    margin-bottom: 2px;
    transition: all 0.2s ease;

    &:hover {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
      border-color: #d1d5db;
    }

    .td {
      box-sizing: border-box;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;

      &.td-name {
        width: 300px;
        flex-shrink: 0;
        min-width: 0;
      }

      &.td-type {
        width: 80px;
        height: 30px;
        flex-shrink: 0;
      }

      &.td-content {
        flex: 1;
        min-width: 150px;
      }

      &.td-enable {
        width: 80px;
        flex-shrink: 0;
      }

      &.td-operate {
        width: 300px;
        flex-shrink: 0;
        padding-right: 46px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 4px;
      }
    }

    .td-name {
      color: #1890ff;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;
      display: flex;
      align-items: center;

      &:hover {
        color: #0968db;
      }

      .menu-name-content {
        display: flex;
        align-items: center;

        i {
          margin-right: 8px;
          font-size: 14px;
          width: 16px;
          text-align: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }
      }
    }

    .td-type {
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      color: #64748b;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      padding: 0 8px;
      height: 26px;
      line-height: 26px;
      border-radius: 12px;
    }

    .td-content {
      display: flex;
      align-items: center;
      gap: 8px;

      .tiny-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        height: 26px;
        border: 1px solid #d1d5db;
        background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        color: #0f172a;
        cursor: pointer;
        min-width: 28px;
        padding: 2px 6px;
        border-radius: 3px;
        transition: all 0.2s ease;
        font-weight: 500;
        white-space: nowrap;

        &:hover {
          background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
          color: #0968db;
          box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
          border-color: #0968db;
        }
      }
    }

    .td-enable {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .td-operate {
      :deep(.ant-btn) {
        height: 26px;
        font-size: 12px;
        padding: 0 8px;
        border-radius: 4px;
        margin-left: 4px;
        color: #1677ff;
        border-color: rgba(24, 144, 255, 0.35);
        background: rgba(24, 144, 255, 0.06);
      }
      :deep(.ant-dropdown-button) {
        height: 26px;
        font-size: 12px;
        .ant-btn {
          height: 26px;
          padding: 0 8px;
          color: #1677ff;
          border-color: rgba(24, 144, 255, 0.35);
          background: rgba(24, 144, 255, 0.06);
        }
      }
      :deep(.ant-popconfirm) {
        .ant-btn {
          height: 26px;
          width: 26px;
          padding: 0;
        }
      }
    }
  }

  .menu-icon-item {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 220px;
    display: inline-flex;
    border: 1px solid #eeeeee;
    border-radius: 12px;
    margin: 10px;
    background-color: #f7f7f7;
    flex-grow: 0;
    flex-shrink: 0;
    width: calc(20% - 20px);

    .td {
      margin-bottom: 8px;
    }

    .td-name {
      display: flex;
      align-items: center;
      flex-direction: column;

      i {
        font-size: 32px;
        margin-bottom: 12px;
      }
    }

    .td-type {
      font-size: 12px;
    }

    .td-content {
      display: none;
    }
  }

  .empty-tag {
    width: 100%;
    padding: 20px;
  }

  /* 系统级菜单列表边框容器 */
  .root-menus-box {
    border: 1px solid #e6efff;
    border-radius: 8px;
    padding: 6px 0 2px 0;
    background: #ffffff;
  }
</style>
