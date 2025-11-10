<template>
  <Tabs v-model:activeKey="activeKey" :tab-position="mode" :style="{ height: '600px' }">
    <TabPane :tab="'批量编辑列'" key="edit_column">
      <div class="edit-column-wrapper">
        <Divider orientation="left">{{ '选择列' }}</Divider>
        <Checkbox v-model:checked="checkAll" @change="onCheckAllChange" style="padding-left: 20px">{{ '全选' }}</Checkbox>
        <div style="padding: 20px; margin-bottom: 20px">
          <CheckboxGroup v-model:value="selectedColumns" @change="updateSelectedAttrs">
            <div class="checkbox-group">
              <Checkbox v-for="option in plainOptions" :key="option.value" :value="option.value">{{ option.label }}</Checkbox>
            </div>
          </CheckboxGroup>
        </div>
        <Divider orientation="left">{{ '批量编辑' }}</Divider>
        <Spin :spinning="loading">
          <EnFields
            v-if="selectedAttrs.length > 0"
            style="padding: 20px"
            ref="enFieldsRef"
            :row-data="row"
            :map-attrs="selectedAttrs"
            :pk="entityRef?.PK"
            :map-exts="entityRef?._enMap?.enMapExts"
            :pk-val="entityRef?.PKVal"
            :validator="entityRef?._enMap?._validator"
          />
          <Empty v-else :image="simpleImage" :description="'请选择需要批处理的列'" />
        </Spin>
        <Divider />
        <div style="padding: 20px; display: flex; justify-content: flex-end">
          <Button v-if="preSelectedItems.length > 0" type="primary" @click="updateColumns">更新所选行（{{ preSelectedItems.length }}条记录）</Button>
          <Button type="primary" style="margin-left: 12px" @click="updateColumns">{{ '更新全部' }}</Button>
        </div>
      </div>
    </TabPane>
    <TabPane :tab="'从其他列导入'" key="import_from_another_column">
      <Divider orientation="left">{{ '将某列数据导入另一列' }}</Divider>
      <div class="import-column-wrapper">
        <Select style="width: 300px" :placeholder="'请选择数据提供列'" v-model:value="provideColumn">
          <SelectOption v-for="option in plainOptions" :key="option.value">{{ option.label }}</SelectOption>
        </Select>
        <span> => </span>
        <Select style="width: 300px" :disabled="!provideColumn" :placeholder="'请选择需要更新的列'" v-model:value="targetColumn">
          <SelectOption v-for="option in plainOptions.filter((option) => option.value != provideColumn)" :key="option.value">{{ option.label }}</SelectOption>
        </Select>
      </div>
      <Divider />
      <div style="padding: 20px; display: flex; justify-content: flex-end">
        <Button v-if="preSelectedItems.length > 0" type="primary" @click="execColumnImport">导入所选行（{{ preSelectedItems.length }}条记录）</Button>
        <Button type="primary" style="margin-left: 12px" @click="execColumnImport">{{ '执行导入' }}</Button>
      </div>
    </TabPane>
  </Tabs>
</template>
<script lang="ts" setup>
  import { onMounted, ref, shallowRef, toRaw } from 'vue';
  import { Tabs, TabPane, Divider, CheckboxGroup, Checkbox, Button, Spin, Select, SelectOption, message } from 'ant-design-vue';
  import { Empty } from 'ant-design-vue';
  import { ClassFactory } from '/@/bp/da/ClassFactory';
  import EnFields from './EnFields.vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { useDDLDataLoader } from '/@/hooks/ens/useDDLDataLoader';
  import { Entity } from '/@/bp/en/Entity';
  import { UIContralType } from '/@/bp/en/EnumLab';
  const simpleImage = Empty.PRESENTED_IMAGE_SIMPLE;
  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });

  const loading = ref(false);
  const activeKey = ref('edit_column');
  const mode = 'left';
  const selectedColumns = ref<string[]>([]);
  const checkAll = ref(false);
  const onCheckAllChange = (e) => {
    selectedColumns.value = e.target.checked ? plainOptions.value.map((item) => item.value) : [];
    updateSelectedAttrs(selectedColumns.value);
  };
  const plainOptions = ref<{ label: string; value: any }[]>([]);
  const selectedAttrs = ref<any>([]);
  const enFieldsRef = shallowRef<InstanceType<typeof EnFields>>();
  const row = ref({});
  const entityRef = ref<any>(null);
  const preSelectedItems = ref([]); // 预先选择

  const ddlCache = new Map();

  const updateSelectedAttrs = async (selectedKeys) => {
    loading.value = true;
    const attrs = entityRef.value._enMap.attrs.filter((attr) => selectedKeys.includes(attr.Key));
    const { getDDLData } = useDDLDataLoader(toRaw(entityRef?.value) as Entity);
    for (const attr of attrs) {
      if (attr.UIContralType === UIContralType.DDL || attr.UIContralType === UIContralType.RadioBtn) {
        if (ddlCache.has(attr.Key)) {
          attr.ddl = ddlCache.get(attr.Key);
        } else {
          attr.ddl = await getDDLData(attr, row.value);
          ddlCache.set(attr.Key, attr.ddl);
        }
      }
    }
    selectedAttrs.value = attrs;
    setTimeout(() => {
      loading.value = false;
    }, 100);
  };
  const updateColumns = async () => {
    const row = enFieldsRef.value?.rowData;
    if (!row) return;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    const className = props.params.EnName;
    handler.AddPara('ClassID', className);
    if (preSelectedItems.value.length > 0) {
      handler.AddPara('IdListStr', preSelectedItems.value);
    }
    handler.AddPara('Row', encodeURIComponent(JSON.stringify(row)));
    const msg = await handler.DoMethodReturnString('Entities_Update');
    message.info(msg);
  };

  // 导入
  const provideColumn = ref('');
  const targetColumn = ref('');
  const execColumnImport = async () => {
    if (!provideColumn.value || !targetColumn.value) {
      message.info("请选择'数据提供列'和'需要更新的列'");
      return;
    }
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
    const className = props.params.EnName;
    handler.AddPara('ClassID', className);
    handler.AddPara('FromColumn', provideColumn.value);
    handler.AddPara('ToColumn', targetColumn.value);
    if (preSelectedItems.value.length > 0) {
      handler.AddPara('IdListStr', preSelectedItems.value);
    }
    const msg = await handler.DoMethodReturnString('Entities_UpdateFromColumn');
    message.info(msg);
  };
  // end

  onMounted(async () => {
    const className = props.params.EnName;
    preSelectedItems.value = props.params.checkedItems;
    const en = await ClassFactory.GetEn(className);
    plainOptions.value = en._enMap.attrs
      .filter((attr) => attr.UIContralType < 4) // 暂时不支持附件批处理
      .filter((attr) => attr.Key != en.PK)
      .filter((attr) => attr.UIVisible)
      .map((attr) => {
        return {
          label: attr.Desc,
          value: attr.Key,
        };
      });
    entityRef.value = en;
    row.value = en.Row;
  });
</script>

<style lang="less" scoped>
  .checkbox-group {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }

  .edit-column-wrapper {
    height: 600px;
    overflow-y: auto;
  }
  .import-column-wrapper {
    padding: 20px;
    display: flex;
    justify-content: space-between;
  }
</style>
