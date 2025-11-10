<template>
  <div class="tree-wrapper">
    <div class="search-container">
      <Input :placeholder="'输入关键字'" v-model:value="pattern" />
    </div>
    <!-- <div class="search-container">
      <Button type="primary" style="width: 100%" @click="$emit('update-tree-key', '', ''), (pattern = '')">{{'清除选中'}}</Button>
    </div>  -->
    <NTree
      style="margin-top: 20px"
      block-line
      default-expand-all
      :data="treeData"
      :label-field="'Name'"
      :key-field="'No'"
      :node-props="nodeProps"
      :on-update:expanded-keys="updatePrefixWithExpaned"
    />
  </div>
</template>

<script setup lang="ts">
  import { Input } from 'ant-design-vue';
  import { h, ref, onMounted } from 'vue';
  import { NTree, NIcon, TreeOption } from 'naive-ui';
  import { Folder, Bag, FolderOpenOutline } from '@vicons/ionicons5';
  import { SFTable } from '/@/WF/Admin/FrmLogic/SFTable/SFTable';
  import { SysEnums } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnum';
  import { MapAttr } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
  const props = defineProps({
    sfKey: {
      type: String,
      required: true,
    },
    frmId: {
      type: String,
      default: '',
    },
  });
  const emit = defineEmits(['update-tree-key']);
  // filter tree pattern
  const pattern = ref('');

  const nodeProps = ({ option }: { option: TreeOption }) => {
    return {
      onClick() {
        const No = option.No == '-100' ? null : option.No;
        emit('update-tree-key', props.sfKey, No);
      },
    };
  };
  const updatePrefixWithExpaned = (
    _keys: Array<string | number>,
    _option: Array<TreeOption | null>,
    meta: {
      node: TreeOption | null;
      action: 'expand' | 'collapse' | 'filter';
    },
  ) => {
    if (!meta.node) return;
    switch (meta.action) {
      case 'expand':
        meta.node.prefix = () =>
          h(NIcon, null, {
            default: () => h(FolderOpenOutline),
          });
        break;
      case 'collapse':
        meta.node.prefix = () =>
          h(NIcon, null, {
            default: () => h(Folder),
          });
        break;
    }
  };
  const treeData = ref<Recordable[]>([]);
  const convertToTree = (list: Recordable[], rootNode: Recordable, parentKey: string) => {
    if (!Array.isArray(list)) {
      return [];
    }
    if (list.length == 0) {
      return [];
    }
    if (!list[0].hasOwnProperty(parentKey)) {
      return list;
    }

    const children = list.filter((c) => c[parentKey] == rootNode.No);
    if (children.length == 0) {
      return [];
    }

    for (const child of children) {
      child.children = convertToTree(list, child, parentKey);
    }
    return children;
  };

  const initTree = async () => {
    const realKey = `${props.frmId}_${props.sfKey}`;
    const mapattr = new MapAttr(realKey);
    await mapattr.Retrieve();
    let sfKeys: Recordable[] = [];
    if (mapattr.LGType == 1) {
      const enums = new SysEnums();
      await enums.Retrieve('EnumKey', mapattr.UIBindKey);
      const children: Recordable[] = [];
      for (let index = 0; index < enums.length; index++) {
        const enumEn = enums[index];
        const value = enumEn.IntKey;
        const label = enumEn.Lab;
        children.push({
          No: value,
          Name: label,
          prefix: () =>
            h(NIcon, null, {
              default: () => h(Folder),
            }),
        });
      }
      sfKeys = [
        {
          No: 'null',
          Name: '全部',
          prefix: () =>
            h(NIcon, null, {
              default: () => h(FolderOpenOutline),
            }),
          children,
        },
      ];
    } else {
      const sfTable = new SFTable(props.sfKey);
      await sfTable.RetrieveFromDBSources();
      sfKeys = await sfTable.GenerData();

      sfKeys.forEach((sfKey) => {
        sfKey.prefix = () =>
          h(NIcon, null, {
            default: () => h(Folder),
          });
        sfKey.ParentNo = '-100';
      });
      sfKeys = [
        {
          No: '-100',
          Name: '全部',
          ParentNo: null,
          prefix: () =>
            h(NIcon, null, {
              default: () => h(Bag),
            }),
          children: [...sfKeys],
        },
      ];
    }

    // sfTable.CodeStruct
    const rootNodeList = sfKeys.filter((key) => key.hasOwnProperty('ParentNo') && key?.ParentNo == '0');
    if (rootNodeList.length == 0) {
      treeData.value = sfKeys;
    } else {
      for (const rootNode of rootNodeList) {
        rootNode.children = convertToTree(sfKeys, rootNode, 'ParentNo');
      }
      treeData.value = rootNodeList;
    }

    console.log(treeData.value);
  };

  onMounted(async () => {
    await initTree();
  });
</script>

<style lang="less" scoped>
  .search-container {
    height: 57px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 2px solid #f0f0f0;
  }
  :deep(.n-tree .n-tree-node-switcher.n-tree-node-switcher--hide) {
    display: none;
  }
</style>
