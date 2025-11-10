<template>
  <BaseComponent ref="baseComponent" style="width: unset; height: unset">
    <div
      class="content"
      :style="
        curMapAttr?.color
          ? {
              ...hasEditorStyle,
              border: `2px solid ${curMapAttr.color}`,
              color: `${curMapAttr.color} !important`, // 修复模板字符串拼接
            }
          : hasEditorStyle
      "
      @mouseenter="tryLockField(curMapAttr.KeyOfEn)"
      @mouseleave="($event) => tryReleaseField($event, curMapAttr.KeyOfEn)"
    >
      <div v-if="shouldShowEditUser" :style="editUserStyle(sformStore.editInfo[curMapAttr.KeyOfEn])" class="edit-user-info">
        @{{ getUsername(sformStore.editInfo[curMapAttr.KeyOfEn]) }}
      </div>
      <!--下拉框-->
      <template v-if="isDDL(curMapAttr) || curMapAttr.type === 'select' || curMapAttr.type === 'cselect'">
        <template v-if="curMapAttr.mode === 'multiple'">
          <template v-if="isDtl">
            <TreeSelect
              v-if="curMapAttr.ShowType == 'Tree'"
              v-model:value="rowData[mapAttr.KeyOfEn]"
              show-search
              style="width: 100%"
              :dropdown-style="createStyle({ maxHeight: '400px', overflow: 'auto' })"
              allow-clear
              multiple
              :disabled="attrIsReadonly()"
              tree-default-expand-all
              :tree-data="curMapAttr.ddl"
              :field-names="{
                children: 'children',
                label: 'Name',
                value: 'No',
              }"
              @change="ChangeTreeSelect"
              tree-node-filter-prop="Name"
              class="frmStyleType"
            />
            <Select
              v-else
              v-model:value="rowData[mapAttr.KeyOfEn]"
              :placeholder="curMapAttr.Tip"
              style="width: 100%"
              mode="multiple"
              :show-search="curMapAttr.ddl.length > 20 ? true : false"
              optionFilterProp="label"
              :listHeight="30 * curMapAttr.ddl.length"
              :disabled="attrIsReadonly()"
              :options="curMapAttr.ddl"
              @select="(val, option) => ChangeSelect(val, option)"
              @focus="showTip = true"
              @blur="showTip = false"
              class="frmStyleType"
            />
            <div v-if="showTip && curMapAttr.Tip" class="input-tip">
              {{ curMapAttr.Tip }}
            </div>
          </template>
          <template v-else>
            <TreeSelect
              v-if="curMapAttr.ShowType == 'Tree'"
              v-model:value="rowData[mapAttr.KeyOfEn]"
              show-search
              style="width: 100%"
              :dropdown-style="createStyle({ maxHeight: '400px', overflow: 'auto' })"
              allow-clear
              multiple
              tree-default-expand-all
              :disabled="attrIsReadonly()"
              :tree-data="curMapAttr.ddl"
              :field-names="{ children: 'children', label: 'Name', value: 'No' }"
              tree-node-filter-prop="Name"
              @change="ChangeTreeSelect"
              :getPopupContainer="
                (triggerNode) => {
                  // @ts-ignore
                  return triggerNode.parentNode || document.body;
                }
              "
              class="frmStyleType"
            />
            <Select
              v-else-if="!curMapAttr.suffix"
              v-model:value="rowData[mapAttr.KeyOfEn]"
              :placeholder="curMapAttr.Tip"
              mode="multiple"
              style="width: 100%"
              :show-search="curMapAttr.ddl.length > 20 ? true : false"
              optionFilterProp="label"
              :disabled="attrIsReadonly()"
              @select="(val, option) => ChangeSelect(val, option)"
              @focus="showTip = true"
              @blur="showTip = false"
              :options="curMapAttr.ddl"
              :listHeight="30 * curMapAttr.ddl.length"
              :addon-after="curMapAttr.suffix"
              :getPopupContainer="
                (triggerNode) => {
                  // @ts-ignore
                  return triggerNode.parentNode || document.body;
                }
              "
              class="frmStyleType"
            />
            <InputGroup compact v-else>
              <Select
                v-model:value="rowData[mapAttr.KeyOfEn]"
                :placeholder="curMapAttr.Tip"
                mode="multiple"
                style="width: 100%"
                :show-search="curMapAttr.ddl.length > 20 ? true : false"
                optionFilterProp="label"
                :disabled="attrIsReadonly()"
                @select="(val, option) => ChangeSelect(val, option)"
                @focus="showTip = true"
                @blur="showTip = false"
                :options="curMapAttr.ddl"
                :listHeight="30 * curMapAttr.ddl.length"
                :addon-after="curMapAttr.suffix"
                :getPopupContainer="
                  (triggerNode) => {
                    // @ts-ignore
                    return triggerNode.parentNode || document.body;
                  }
                "
                class="frmStyleType"
              />
              <span style="width: 40%; line-height: 2.2" class="ant-input-group-addon" slot="addonAfter">{{ curMapAttr.suffix }}</span>
            </InputGroup>
            <div v-if="showTip && curMapAttr.Tip" class="input-tip">
              {{ curMapAttr.Tip }}
            </div>
          </template>
        </template>
        <template v-else>
          <template v-if="isDtl">
            <TreeSelect
              v-if="curMapAttr.ShowType == 'Tree'"
              v-model:value="rowData[mapAttr.KeyOfEn]"
              show-search
              style="width: 100%"
              :dropdown-style="createStyle({ maxHeight: '400px', overflow: 'auto' })"
              allow-clear
              tree-default-expand-all
              :disabled="attrIsReadonly()"
              :tree-data="curMapAttr.ddl"
              :field-names="{
                children: 'children',
                label: 'Name',
                value: 'No',
              }"
              @change="ChangeTreeSelect"
              tree-node-filter-prop="Name"
              class="frmStyleType"
            />
            <Select
              v-else
              v-model:value="rowData[mapAttr.KeyOfEn]"
              :placeholder="curMapAttr.Tip"
              style="width: 100%"
              :show-search="curMapAttr.ddl.length > 20 ? true : false"
              optionFilterProp="label"
              :listHeight="30 * curMapAttr.ddl.length"
              :disabled="attrIsReadonly()"
              :options="curMapAttr.ddl"
              @select="(val, option) => ChangeSelect(val, option)"
              @focus="showTip = true"
              @blur="showTip = false"
              class="frmStyleType"
            />
            <div v-if="showTip && curMapAttr.Tip" class="input-tip">
              {{ curMapAttr.Tip }}
            </div>
          </template>
          <template v-else>
            <TreeSelect
              v-if="curMapAttr.ShowType == 'Tree'"
              v-model:value="rowData[mapAttr.KeyOfEn]"
              show-search
              style="width: 100%"
              :dropdown-style="createStyle({ maxHeight: '400px', overflow: 'auto' })"
              allow-clear
              :disabled="attrIsReadonly()"
              tree-default-expand-all
              :tree-data="curMapAttr.ddl"
              :field-names="{ children: 'children', label: 'Name', value: 'No' }"
              tree-node-filter-prop="Name"
              @change="ChangeTreeSelect"
              :getPopupContainer="
                (triggerNode) => {
                  // @ts-ignore
                  return triggerNode.parentNode || document.body;
                }
              "
              class="frmStyleType"
            />
            <Select
              v-else-if="!curMapAttr.suffix"
              v-model:value="rowData[mapAttr.KeyOfEn]"
              :placeholder="curMapAttr.Tip"
              style="width: 100%"
              :show-search="curMapAttr.ddl.length > 20 ? true : false"
              optionFilterProp="label"
              :disabled="attrIsReadonly()"
              @select="(val, option) => ChangeSelect(val, option)"
              @focus="showTip = true"
              @blur="showTip = false"
              :options="curMapAttr.ddl"
              :getPopupContainer="
                (triggerNode) => {
                  // @ts-ignore
                  return triggerNode.parentNode || document.body;
                }
              "
              class="frmStyleType"
            />
            <InputGroup compact v-else>
              <Select
                v-model:value="rowData[mapAttr.KeyOfEn]"
                :placeholder="curMapAttr.Tip"
                style="width: 60%"
                :show-search="curMapAttr.ddl.length > 20 ? true : false"
                optionFilterProp="label"
                :disabled="attrIsReadonly()"
                @select="(val, option) => ChangeSelect(val, option)"
                @focus="showTip = true"
                @blur="showTip = false"
                :options="curMapAttr.ddl"
                :getPopupContainer="
                  (triggerNode) => {
                    // @ts-ignore
                    return triggerNode.parentNode || document.body;
                  }
                "
                class="frmStyleType"
              />
              <span style="width: 40%; line-height: 2.2" class="ant-input-group-addon" slot="addonAfter">{{ curMapAttr.suffix }}</span>
            </InputGroup>
            <div v-if="showTip && curMapAttr.Tip" class="input-tip">
              {{ curMapAttr.Tip }}
            </div>
          </template>
        </template>
      </template>
      <!--枚举-->
      <template v-if="isRadio(curMapAttr)">
        <RadioGroup class="frmStyleType" v-model:value="rowData[mapAttr.KeyOfEn]" :name="curMapAttr.KeyOfEn" :disabled="attrIsReadonly()" @change="ChangeSelect">
          <Radio v-for="item in curMapAttr.ddl" :key="item.value" :value="item.value" :style="curMapAttr.AtPara.indexOf('@RBShowModel=3') == -1 ? 'display:flex' : ''">
            {{ item.label }}</Radio
          >
        </RadioGroup>
      </template>
      <!--多复选框-->
      <template v-if="isCheckBoxs(curMapAttr)">
        <CheckboxGroup class="frmStyleType" v-model:value="rowData[mapAttr.KeyOfEn]" :disabled="attrIsReadonly()" @change="ChangeSelect">
          <checkbox
            v-for="item in curMapAttr.ddl"
            :key="item.value"
            :value="item.value"
            :name="item.label"
            :style="curMapAttr.AtPara.indexOf('@RBShowModel=3') == -1 ? 'display:flex' : ''"
          >
            {{ item.label }}
          </checkbox>
        </CheckboxGroup>
      </template>
      <!--布尔类型-->
      <template v-if="isBool(curMapAttr)">
        <Switch
          class="frmStyleType"
          v-model:checked="rowData[mapAttr.KeyOfEn]"
          v-if="parseInt(GetPara(mapAttr.AtPara, 'CheckModel') || '0') === 0"
          :disabled="attrIsReadonly()"
          @change="(checked, evt) => ChangeSelect(checked)"
          :checked-children="GetPara(curMapAttr.AtPara, 'checkedTips') || ''"
          :un-checked-children="GetPara(curMapAttr.AtPara, 'unCheckedTips') || ''"
        />
        <RadioGroup v-else class="frmStyleType" v-model:value="rowData[mapAttr.KeyOfEn]" :name="curMapAttr.KeyOfEn" :disabled="attrIsReadonly()" @change="ChangeSelect">
          <Radio :value="0">{{ GetPara(curMapAttr.AtPara, 'unCheckedTips') || '否' }}</Radio>
          <Radio :value="1">{{ GetPara(curMapAttr.AtPara, 'checkedTips') || '是' }}</Radio>
        </RadioGroup>
      </template>
      <!--整数-->
      <template v-if="isInt(curMapAttr)">
        <InputNumber
          v-model:value="rowData[mapAttr.KeyOfEn]"
          :id="curMapAttr.KeyOfEn"
          :placeholder="curMapAttr.Tip"
          :controls="false"
          style="width: 100%"
          :precision="0"
          :max="numMax"
          :min="numMin"
          stringMode
          :disabled="attrIsReadonly()"
          @blur="inputBlur"
          @focus="showTip = true"
          class="frmStyleType"
        >
          <template v-if="!!curMapAttr.sufOptions" #addonAfter>
            <Select v-model:value="rowData['AP_' + mapAttr.KeyOfEn]" style="width: 80px" optionFilterProp="label" :disabled="attrIsReadonly()" :options="curMapAttr.sufOptions" />
          </template>

          <template
            v-else-if="(curMapAttr.UIIsEnable === 0 || isReadonly == true) && curMapAttr.mapExts.find((ext) => ext.ExtModel === 'FieldPopShowDtl' && ext.DoWay != 0)"
            #addonBefore
          >
            <div>
              <LinkOutlined style="color: #459dff" @click="openPop" />
            </div>
          </template>

          <template v-else-if="!!curMapAttr.suffix" #addonAfter>{{ curMapAttr.suffix }}</template>

          <template v-if="isDtl == false && curMapAttr.UIIsEnable === 1 && isReadonly == false && numInputStyle != 0" #addonAfter>
            <div v-if="numInputStyle === 1" class="controls">
              <CaretUpOutlined clas="controls-btn" @click="increaseStep" />
              <CaretDownOutlined clas="controls-btn" @click="decreaseStep" />
            </div>
            <PlusOutlined v-if="numInputStyle === 2" @click="increaseStep" />
          </template>
          <template v-if="isDtl == false && curMapAttr.UIIsEnable === 1 && isReadonly == false && numInputStyle === 2" #addonBefore>
            <MinusOutlined v-if="numInputStyle === 2" @click="decreaseStep" />
          </template>
        </InputNumber>
        <div v-if="showTip && curMapAttr.Tip" class="input-tip">
          {{ curMapAttr.Tip }}
        </div>
      </template>
      <!--浮点数-->
      <template v-if="isFloat(curMapAttr)">
        <InputNumber
          v-model:value="rowData[mapAttr.KeyOfEn]"
          :id="curMapAttr.KeyOfEn"
          :placeholder="curMapAttr.Tip"
          :controls="false"
          :precision="curMapAttr.bit"
          :max="numMax"
          :min="numMin"
          style="width: 100%"
          stringMode
          :disabled="attrIsReadonly()"
          @blur="inputBlur"
          @focus="showTip = true"
          class="frmStyleType"
        >
          <template v-if="!!curMapAttr.sufOptions" #addonAfter>
            <Select v-model:value="rowData['AP_' + mapAttr.KeyOfEn]" style="width: 80px" optionFilterProp="label" :disabled="attrIsReadonly()" :options="curMapAttr.sufOptions" />
          </template>
          <template v-else-if="!!curMapAttr.suffix" #addonAfter>{{ curMapAttr.suffix }}</template>

          <template v-if="isDtl == false && curMapAttr.UIIsEnable === 1 && isReadonly == false && numInputStyle != 0" #addonAfter>
            <div v-if="numInputStyle === 1" class="controls">
              <CaretUpOutlined clas="controls-btn" @click="increaseStep" />
              <CaretDownOutlined clas="controls-btn" @click="decreaseStep" />
            </div>
            <PlusOutlined v-if="numInputStyle === 2" @click="increaseStep" />
          </template>
          <template v-if="isDtl == false && curMapAttr.UIIsEnable === 1 && isReadonly == false && numInputStyle === 2" #addonBefore>
            <MinusOutlined v-if="numInputStyle === 2" @click="decreaseStep" />
          </template>
        </InputNumber>
        <div v-if="showTip && curMapAttr.Tip" class="input-tip">
          {{ curMapAttr.Tip }}
        </div>
      </template>
      <!--金额-->
      <template v-if="isMoney(curMapAttr)">
        <InputNumber
          v-model:value="rowData[mapAttr.KeyOfEn]"
          :id="curMapAttr.KeyOfEn"
          :placeholder="curMapAttr.Tip"
          :controls="false"
          :precision="curMapAttr.bit"
          style="width: 100%"
          :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
          :max="numMax"
          :min="numMin"
          stringMode
          :disabled="attrIsReadonly()"
          @blur="inputBlur"
          @focus="showTip = true"
          class="frmStyleType"
        >
          <template v-if="!!curMapAttr.sufOptions" #addonAfter>
            <Select v-model:value="rowData['AP_' + mapAttr.KeyOfEn]" style="width: 80px" optionFilterProp="label" :disabled="attrIsReadonly()" :options="curMapAttr.sufOptions" />
          </template>
          <template v-else-if="!!curMapAttr.suffix" #addonAfter>{{ curMapAttr.suffix }}</template>
          <template v-if="isDtl == false && curMapAttr.UIIsEnable === 1 && isReadonly == false && numInputStyle != 0" #addonAfter>
            <div v-if="numInputStyle === 1" class="controls">
              <CaretUpOutlined clas="controls-btn" @click="increaseStep" />
              <CaretDownOutlined clas="controls-btn" @click="decreaseStep" />
            </div>
            <PlusOutlined v-if="numInputStyle === 2" @click="increaseStep" />
          </template>
          <template v-if="isDtl == false && curMapAttr.UIIsEnable === 1 && isReadonly == false && numInputStyle === 2" #addonBefore>
            <MinusOutlined v-if="numInputStyle === 2" @click="decreaseStep" />
          </template>
        </InputNumber>
        <div v-if="showTip && curMapAttr.Tip" class="input-tip">
          {{ curMapAttr.Tip }}
        </div>
      </template>
      <!--日期/日期时间-->
      <template v-if="isDateOrDateTime(curMapAttr)">
        <DatePicker
          v-if="isDtl"
          v-model:value="rowData[mapAttr.KeyOfEn]"
          :show-time="IsShowTime(mapAttr)"
          :picker="curMapAttr.picker"
          :format="curMapAttr.format"
          :value-format="curMapAttr.format"
          :disabled-date="disabledDate"
          :disabled-time="disabledDateTime"
          style="width: 100%"
          :placeholder="curMapAttr.Tip"
          :disabled="attrIsReadonly()"
          class="frmStyleType"
          @change="DataTimeBlur"
          @focus="showTip = true"
          @blur="showTip = false"
        />
        <DatePicker
          v-else
          v-model:value="rowData[mapAttr.KeyOfEn]"
          :show-time="IsShowTime(mapAttr)"
          :picker="curMapAttr.picker"
          :format="curMapAttr.format"
          :value-format="curMapAttr.format"
          :disabled-date="disabledDate"
          :disabled-time="disabledDateTime"
          style="width: 100%"
          :placeholder="curMapAttr.Tip"
          :getPopupContainer="
            (triggerNode) => {
              // @ts-ignore
              return triggerNode.parentNode || document.body;
            }
          "
          :disabled="curMapAttr.UIIsEnable === 0 || isReadonly === true"
          class="frmStyleType"
          @change="DataTimeBlur"
          @focus="showTip = true"
          @blur="showTip = false"
        />
        <div v-if="showTip && curMapAttr.Tip" class="input-tip">
          {{ curMapAttr.Tip }}
        </div>
      </template>
      <!--大块文本的说明-->
      <template v-if="isBigText(curMapAttr)">
        <div v-html="safeHtmlContent" class="html-field"></div>
      </template>
      <!--密码框-->
      <template v-if="isPassword(curMapAttr)">
        <InputPassword
          v-model:value="rowData[mapAttr.KeyOfEn]"
          :placeholder="curMapAttr.Tip"
          style="width: 100%"
          :addon-after="curMapAttr.suffix"
          :disabled="attrIsReadonly()"
          @focus="showTip = true"
          @blur="showTip = false"
          class="frmStyleType"
        >
          <!--前置图标-->
        </InputPassword>
        <div v-if="showTip && curMapAttr.Tip" class="input-tip">
          {{ curMapAttr.Tip }}
        </div>
      </template>
      <!--大文本-->
      <template v-if="isTextArea(curMapAttr)">
        <template v-if="isFastInput(curMapAttr) && curMapAttr.UIIsEnable != 0 && isReadonly === false">
          <div class="input-wrapper" style="width: 100%">
            <Textarea
              ref="textareaRef"
              v-model:value="rowData[mapAttr.KeyOfEn]"
              :placeholder="curMapAttr.Tip"
              :allow-clear="curMapAttr.clearable"
              :addon-after="curMapAttr.suffix"
              :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
              :style="{ border: '1px solid #d9d9d9', width: '100%', minHeight: curMapAttr.UIHeight + 'px' }"
              :autosize="true"
              @change="inputChange"
              @blur="inputBlur"
              @focus="showTip = true"
              class="frmStyleType"
            />
            <div class="action-link">
              <Button type="link" @click="FastInput">录入</Button>
            </div>
          </div>
          <div v-if="showTip && curMapAttr.Tip" class="input-tip">
            {{ curMapAttr.Tip }}
          </div>
        </template>
        <Textarea
          v-else
          ref="textareaRef"
          v-model:value="rowData[mapAttr.KeyOfEn]"
          :placeholder="curMapAttr.Tip"
          :style="{ border: '1px solid #d9d9d9', width: '100%', minHeight: curMapAttr.UIHeight + 'px' }"
          :allow-clear="curMapAttr.clearable"
          :addon-after="curMapAttr.suffix"
          :autosize="true"
          :disabled="attrIsReadonly()"
          @focus="showTip = true"
          @blur="showTip = false"
          class="frmStyleType"
        />
        <div v-if="showTip && curMapAttr.Tip" class="input-tip">
          {{ curMapAttr.Tip }}
        </div>
      </template>
      <!--签批字段-->
      <template v-if="isSignCheck(curMapAttr)">
        <div v-if="!rowData[mapAttr.KeyOfEn]"></div>
        <WorkCheck
          v-else
          ref="workCheck"
          :params="props.params"
          :nodeIds="rowData[mapAttr.KeyOfEn]"
          :nodeInfo="nodeInfo"
          :is-readonly="props.isPageReadonly"
          :isSignCheck="true"
          examineMode="normalMode"
        />
      </template>
      <!--富文本-->
      <template v-if="isRich(curMapAttr)">
        <template v-if="curMapAttr.UIIsEnable === 0 || isReadonly == true">
          <div v-html="rowData[mapAttr.KeyOfEn]" class="html-field"></div>
        </template>
        <template v-else>
          <Tinymce v-model="rowData[mapAttr.KeyOfEn]" width="100%" class="frmStyleType" />
        </template>
      </template>
      <!--普通字段-->
      <template v-if="isTextBox(curMapAttr) && curMapAttr.type !== 'select' && curMapAttr.type !== 'cselect'">
        <!--pop下拉框显示-->
        <template v-if="isTextPopSelect(curMapAttr)">
          <template v-if="curMapAttr.UIIsEnable === 0 || isReadonly">
            <Input
              v-model:value="rowData[mapAttr.KeyOfEn + 'T']"
              :placeholder="curMapAttr.Tip"
              :allow-clear="curMapAttr.clearable"
              :addon-after="curMapAttr.suffix"
              @focus="showTip = true"
              @blur="showTip = false"
              disabled="true"
              class="frmStyleType"
            />
            <div v-if="showTip && curMapAttr.Tip" class="input-tip">
              {{ curMapAttr.Tip }}
            </div>
          </template>
          <template v-else>
            <TreeSelect
              v-if="curMapAttr.type === ''"
              v-model:value="rowData[mapAttr.KeyOfEn]"
              show-search
              style="width: 100%"
              :dropdown-style="createStyle({ maxHeight: '400px', overflow: 'auto' })"
              allow-clear
              :multiple="!curMapAttr.mode ? false : true"
              tree-default-expand-all
              :disabled="attrIsReadonly()"
              :tree-data="curMapAttr.ddl"
              :field-names="{ children: 'children', label: 'Name', value: 'No' }"
              tree-node-filter-prop="Name"
              @change="ChangeTreeSelect"
              :getPopupContainer="
                (triggerNode) => {
                  // @ts-ignore
                  return triggerNode.parentNode || document.body;
                }
              "
              class="frmStyleType"
            />
            <TreeSelect
              v-else
              v-model:value="rowData[mapAttr.KeyOfEn]"
              show-search
              style="width: 100%"
              :dropdown-style="createStyle({ maxHeight: '400px', overflow: 'auto' })"
              allow-clear
              :multiple="!curMapAttr.mode ? false : true"
              tree-default-expand-all
              :disabled="attrIsReadonly()"
              :tree-data="curMapAttr.ddl"
              :load-data="onLoadData"
              :field-names="{ children: 'children', label: 'Name', value: 'No' }"
              tree-node-filter-prop="Name"
              @change="ChangeTreeSelect"
              :getPopupContainer="
                (triggerNode) => {
                  // @ts-ignore
                  return triggerNode.parentNode || document.body;
                }
              "
              class="frmStyleType"
            />
          </template>
        </template>
        <!--Pop弹窗-->
        <InputGroup
          v-else-if="isTextPop(curMapAttr)"
          compact
          :disabled="true"
          :style="createStyle({ position: 'relative', background: curMapAttr.UIIsEnable === 1 && isReadonly == false ? '' : '#00000005' })"
        >
          <div
            class="pop_intput_div"
            :id="'div_' + curMapAttr.KeyOfEn"
            :style="createStyle({ paddingLeft: '5px', width: curMapAttr.UIIsEnable === 1 && isReadonly == false ? 'calc(100% - 46px)' : 'calc(100%)' })"
          >
            <template v-for="(ele, idx) in curMapAttr.eleDBs" :key="ele">
              <Tag :closable="curMapAttr.UIIsEnable === 1 && isReadonly == false" @close="DeleteEleDB(ele, idx)">
                {{ ele?.label || ele }}
              </Tag>
            </template>
          </div>
          <Button v-if="curMapAttr.UIIsEnable === 1 && isReadonly == false" @click="PopModalShow(curMapAttr)" style="position: absolute; height: 100%">
            <SettingOutlined />
          </Button>
        </InputGroup>
        <!--pop下拉选择-->
        <Select v-else-if="isTextSelect(curMapAttr)" v-model:value="rowData[mapAttr.KeyOfEn]" mode="multiple" :disabled="attrIsReadonly()">
          <SelectOption v-for="item in _ddlOption" :key="item.value" :value="item.value">{{ item.label }} </SelectOption>
        </Select>
        <!--搜索多选-->
        <!-- <Input type="hidden" v-model:value="rowData[mapAttr.KeyOfEn]" /> -->
        <template v-else-if="isTextChoiceSearch(curMapAttr)">
          <Select
            v-if="isDtl"
            v-model:value="searchSelectVM"
            mode="multiple"
            label-in-value
            :placeholder="curMapAttr.Tip"
            :disabled="attrIsReadonly()"
            style="width: 100%"
            :filter-option="false"
            :not-found-content="choiceSearchFetching ? undefined : null"
            :options="choiceSearchData"
            :listHeight="Math.min(30 * choiceSearchData.length, 300)"
            @search="ChoiceSearchFetch"
            @focus="showTip = true"
            @blur="showTip = false"
          >
            <template v-if="choiceSearchFetching" #notFoundContent>
              <Spin size="small" />
            </template>
          </Select>
          <Select
            v-else
            v-model:value="searchSelectVM"
            mode="multiple"
            label-in-value
            :placeholder="curMapAttr.Tip"
            :disabled="attrIsReadonly()"
            style="width: 100%"
            :filter-option="false"
            :not-found-content="choiceSearchFetching ? undefined : null"
            :options="choiceSearchData"
            :listHeight="Math.min(30 * choiceSearchData.length, 300)"
            @search="ChoiceSearchFetch"
            @focus="showTip = true"
            @blur="showTip = false"
            :getPopupContainer="
              (triggerNode) => {
                // @ts-ignore
                return triggerNode.parentNode || document.body;
              }
            "
          >
            <template v-if="choiceSearchFetching" #notFoundContent>
              <Spin size="small" />
            </template>
          </Select>
          <div v-if="showTip && curMapAttr.Tip" class="input-tip">
            {{ curMapAttr.Tip }}
          </div>
        </template>

        <!--自动完成-->
        <template v-else-if="isAutoCompleteSimple(curMapAttr)">
          <AutoComplete
            allowClear
            v-model:value="rowData[mapAttr.KeyOfEn]"
            :options="completeOptions"
            style="width: 100%"
            :placeholder="curMapAttr.Tip"
            :disabled="attrIsReadonly()"
            @select="(val) => onAutoCompleteSelect(val)"
            @search="onAutoCompleteSearch"
            @clear="() => onAutoCompleteClear()"
            @focus="showTip = true"
            @blur="showTip = false"
            class="frmStyleType"
          />
          <div v-if="showTip && curMapAttr.Tip" class="input-tip">
            {{ curMapAttr.Tip }}
          </div>
        </template>
        <template v-else-if="isAutoCompleteTable(curMapAttr)">
          <Popover v-model:open="visible" placement="bottomLeft" trigger="click">
            <template #content>
              <Table :columns="columns" :dataSource="autoData" bordered size="small" :key="computkey" :pagination="{ pageSize: 5, pageSizeOptions: ['5'] }" :customRow="rowClick" />
            </template>
            <AutoComplete
              allowClear
              v-model:value="rowData[mapAttr.KeyOfEn]"
              style="width: 100%"
              :placeholder="curMapAttr.Tip"
              :disabled="attrIsReadonly()"
              @select="(val) => onAutoCompleteSelect(val)"
              @search="onAutoCompleteSearch"
              @clear="() => onAutoCompleteClear()"
              @focus="showTip = true"
              @blur="showTip = false"
              class="frmStyleType"
            />
          </Popover>
          <div v-if="showTip && curMapAttr.Tip" class="input-tip">
            {{ curMapAttr.Tip }}
          </div>
        </template>
        <!--快速录入-->
        <template v-else-if="isFastInput(curMapAttr)">
          <template v-if="curMapAttr.UIIsEnable === 0 || isReadonly">
            <Input
              v-model:value="rowData[mapAttr.KeyOfEn + 'T']"
              :placeholder="curMapAttr.Tip"
              :allow-clear="curMapAttr.clearable"
              :addon-after="curMapAttr.suffix"
              @focus="showTip = true"
              @blur="showTip = false"
              style="width: 100%"
              disabled="true"
              class="frmStyleType"
            />
            <div v-if="showTip && curMapAttr.Tip" class="input-tip">
              {{ curMapAttr.Tip }}
            </div>
          </template>
          <div v-else class="input-wrapper" style="width: 100%">
            <Input
              v-model:value="rowData[mapAttr.KeyOfEn]"
              :placeholder="curMapAttr.Tip"
              :allow-clear="curMapAttr.clearable"
              :addon-after="curMapAttr.suffix"
              :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
              @change="inputChange"
              @blur="inputBlur"
              @focus="showTip = true"
              class="frmStyleType"
            />
            <div class="action-link">
              <Button type="link" @click="FastInput">录入</Button>
            </div>
          </div>
          <div v-if="showTip && curMapAttr.Tip" class="input-tip">
            {{ curMapAttr.Tip }}
          </div>
        </template>

        <!--保密格式显示-->
        <template v-else-if="isKeepSecret(curMapAttr)">
          <Input
            v-model:value="rowData[mapAttr.KeyOfEn + 'T']"
            :placeholder="curMapAttr.Tip"
            :allow-clear="curMapAttr.clearable"
            :addon-after="curMapAttr.suffix"
            :disabled="true"
            @focus="showTip = true"
            @blur="showTip = false"
            class="frmStyleType"
          />
          <div v-if="showTip && curMapAttr.Tip" class="input-tip">
            {{ curMapAttr.Tip }}
          </div>
        </template>
        <!--邮件格式显示-->
        <Button v-else-if="isEmailFormat(curMapAttr)" type="link" @click="mailToLink" class="frmStyleType">点击发送邮件</Button>
        <!--地址格式显示-->
        <Button v-else-if="isAddrFormat(curMapAttr)" type="link" @click="OpenAddr" class="frmStyleType">打开地址</Button>
        <!--字段值链接-->
        <template v-else-if="isReadOnlyLink(curMapAttr)">
          <template v-if="!!rowData[mapAttr.KeyOfEn + 'T']">
            <span v-for="(str, idx) in rowData[mapAttr.KeyOfEn + 'T'].split(',')" :key="str"
              ><Button type="link" @click="GetReadOnlyLink(rowData[mapAttr.KeyOfEn].split(',')[idx], curMapAttr)">{{ str }}</Button></span
            >
          </template>
          <template v-else
            ><span
              ><Button type="link" @click="GetReadOnlyLink(rowData[mapAttr.KeyOfEn], curMapAttr)">{{ rowData[mapAttr.KeyOfEn] }}</Button></span
            ></template
          >
        </template>
        <template v-else-if="isCascader(curMapAttr)">
          <Input
            v-if="curMapAttr.UIIsEnable === 0 || isReadonly == true"
            v-model:value="rowData[mapAttr.KeyOfEn + 'T']"
            :placeholder="curMapAttr.Tip"
            :allow-clear="curMapAttr.clearable"
            :addon-after="curMapAttr.suffix"
            :disabled="true"
            @focus="showTip = true"
            @blur="showTip = false"
            class="frmStyleType"
          />
          <Cascader
            v-else
            v-model:value="rowData[mapAttr.KeyOfEn + 'T']"
            :options="options"
            :load-data="loadCascaderData"
            :placeholder="curMapAttr.Tip"
            change-on-select
            @change="SetCascaderData"
            @focus="showTip = true"
            @blur="showTip = false"
          />
          <div v-if="showTip && curMapAttr.Tip" class="input-tip">
            {{ curMapAttr.Tip }}
          </div>
        </template>
        <template v-else-if="isIDCard(curMapAttr)">
          <InputGroup compact>
            <Input
              v-model:value="rowData[mapAttr.KeyOfEn]"
              :placeholder="curMapAttr.Tip"
              :allow-clear="curMapAttr.clearable"
              :addon-after="curMapAttr.suffix"
              :disabled="true"
              class="frmStyleType"
            />
            <Upload :max-count="1" :multiple="false" accept="image/*" :customRequest="customRequest">
              <Button>
                <UploadOutlined />
                上传身份证
              </Button>
            </Upload>
          </InputGroup>
          <div v-if="showTip && curMapAttr.Tip" class="input-tip">
            {{ curMapAttr.Tip }}
          </div>
        </template>
        <!--普通文本-->
        <template v-else>
          <Input
            v-model:value="rowData[mapAttr.KeyOfEn]"
            :placeholder="curMapAttr.Tip"
            :allow-clear="curMapAttr.clearable"
            :addon-after="curMapAttr.suffix"
            :disabled="attrIsReadonly()"
            @change="inputChange"
            @blur="inputBlur"
            @focus="showTip = true"
            class="frmStyleType"
          >
            <template
              v-if="
                (curMapAttr.UIIsEnable === 0 || isReadonly == true) && curMapAttr.mapExts && curMapAttr.mapExts.find((ext) => ext.ExtModel === 'FieldPopShowDtl' && ext.DoWay != 0)
              "
              #addonBefore
            >
              <div>
                <LinkOutlined style="color: #459dff" @click="openPop" />
              </div>
            </template>
          </Input>
          <!-- 输入提示信息 -->
          <div v-if="showTip && curMapAttr.Tip" class="input-tip"> {{ curMapAttr.Tip }} </div>
        </template>
      </template>
      <!--字段附件-->
      <template v-if="isFileAth(curMapAttr)">
        <template v-if="curMapAttr.ath == null">
          <span style="color: red">{{ rowData[mapAttr.KeyOfEn] }}</span>
        </template>
        <template v-else>
          <!--上传-->
          <template v-if="parseInt(curMapAttr.ath.IsUpload) === 1 && isReadonly == false">
            <template v-if="isDtl == false">
              <Button type="primary" @click="OpenUploadModal(curMapAttr, false)"> <CloudUploadOutlined />上传 </Button>
              <span class="frmStyleType">上传的附件({{ athNum }})</span>
            </template>
            <template v-else> <Button type="link" @click="OpenUploadModal(curMapAttr, false)"> 上传 </Button>({{ athNum }}) </template>
          </template>
          <!--预览-->
          <template v-else>
            <template v-if="isDtl == true && curMapAttr.ath.FileType == 1">
              <div v-for="athDB in dbs" :key="athDB.MyPK">
                <img
                  alt="example"
                  style="height: 48px"
                  :src="baseFilePath + '&MyPK=' + athDB.MyPK"
                  @click="
                    previewVisible = true;
                    previewImage = baseFilePath + '&MyPK=' + athDB.MyPK;
                  "
                />
              </div>
            </template>
            <template v-else>
              <div v-if="isDtl == false && curMapAttr.ath.FileType !== 2" style="width: 100%; border-radius: 2px">
                <AthView :ath-info="curMapAttr.ath" :params="props.params" :PKValue="refPKVal" />
              </div>
              <span v-if="isDtl == true || curMapAttr.ath.FileType === 2" @click="OpenUploadModal(curMapAttr, true)" style="color: #007af5">
                <Icon icon="bi:eye" /> 预览 ({{ athNum }})
              </span>
              <span v-if="athNum !== 0 && (isDtl == false || curMapAttr.ath.FileType === 2)">上传的附件({{ athNum }})</span>
            </template>
          </template>
        </template>
      </template>
      <!--写字板-->
      <template v-if="isHandWriting(curMapAttr)">
        <template v-if="parseInt(curMapAttr.UIIsEnable) === 0 || isReadonly == true">
          <img
            :src="GetImgSrc(curMapAttr, rowData[mapAttr.KeyOfEn])"
            onerror="this.style.dispaly='none'"
            :style="{ width: 'auto', height: (curMapAttr.UIHeight < 46 ? 46 : curMapAttr.UIHeight) + 'px' }"
          />
        </template>
        <template v-else>
          <img
            :src="GetImgSrc(curMapAttr, rowData[mapAttr.KeyOfEn])"
            @click="DoHandWrite(curMapAttr, rowData[mapAttr.KeyOfEn])"
            @error="defaultImg"
            :style="{ width: 'auto', height: (curMapAttr.UIHeight < 46 ? 46 : curMapAttr.UIHeight) + 'px' }"
          />
        </template>
      </template>
      <!--超链接-->
      <template v-if="isLink(curMapAttr)">
        <Button v-if="curMapAttr.Tag1 != '_modal'" type="link" :target="curMapAttr.Tag1" @click="handlerLinkClick($event, curMapAttr)">{{ curMapAttr.Name }}</Button>
        <Button v-else type="link" @click="handlerLinkClick($event, curMapAttr)">{{ curMapAttr.Name }}</Button>
      </template>
      <!-- 颜色组件 -->
      <template v-if="isLabColor(curMapAttr)">
        <NColorPicker v-model:value="rowData[mapAttr.KeyOfEn]" show-alpha :disabled="attrIsReadonly()" />
      </template>
      <!--是否是按钮-->
      <template v-if="isBtn(curMapAttr)">
        <Button type="primary" :disabled="attrIsReadonly()" @click="handlerBtnClick($event, curMapAttr)">{{ curMapAttr.Name }}</Button>
      </template>
      <!--进度图-->
      <template v-if="isJobSchedule(curMapAttr)">
        <JobSchedule />
      </template>
      <!--评分-->
      <template v-if="isScore(curMapAttr)">
        <Rate v-model:value="rowData[mapAttr.KeyOfEn]" :count="parseInt(curMapAttr.Tag2)" :disabled="attrIsReadonly()" />
      </template>

      <!--地图-->
      <template v-if="isMap(curMapAttr)">
        <Input v-model:value="rowData[mapAttr.KeyOfEn]" style="display: none" />
        <Button @click="OpenMap">选择</Button>{{ rowData[mapAttr.KeyOfEn] }}
      </template>

      <!--关联流程单据-->
      <template v-if="isRelatedDocs(curMapAttr)">
        <InputGroup v-if="curMapAttr.UIIsEnable === 1 && isReadonly == false" compact :disabled="true" style="position: relative">
          <div
            class="pop_intput_div"
            :id="'div_' + curMapAttr.KeyOfEn"
            :style="createStyle({ paddingLeft: '5px', width: curMapAttr.UIIsEnable === 1 && isReadonly == false ? 'calc(100% - 46px)' : 'calc(100%)' })"
          >
            <template v-for="(ele, idx) in curMapAttr.eleDBs" :key="ele">
              <Tooltip :title="ele?.label || ele" placement="topLeft">
                <Tag :closable="curMapAttr.UIIsEnable === 1 && isReadonly == false" @close="DeleteEleDB(ele, idx)" class="custom-tag">
                  <span class="tag-content">{{ ele?.label || ele }}</span>
                </Tag>
              </Tooltip>
            </template>
          </div>
          <Button v-if="curMapAttr.UIIsEnable === 1 && isReadonly == false" @click="DoLinkRefFlow(curMapAttr, rowData[mapAttr.KeyOfEn])" style="position: absolute; height: 100%">
            <SettingOutlined />
          </Button>
        </InputGroup>
        <template v-else v-for="ele in curMapAttr.eleDBs" :key="ele">
          <Button type="link" @click="OpenMyView(ele)">
            <span style="width: 225px" class="link_flow">
              <Tooltip :title="ele?.label || ele">
                {{ ele.label }}
              </Tooltip>
            </span>
          </Button>
        </template>
      </template>
      <!--评论-->
      <template v-if="isReview(curMapAttr)">
        <Input v-model:value="rowData[mapAttr.KeyOfEn]" :disabled="true" class="frmStyleType">
          <template #addonAfter>
            <Button class="btnSetting" @click="DoreviewBlur(curMapAttr, rowData[mapAttr.KeyOfEn])" :disabled="attrIsReadonly()">
              <SettingOutlined />
            </Button>
          </template>
        </Input>
      </template>
      <!-- 公文正文组件 -->
      <template v-if="isGovDocFile(curMapAttr)">
        <GovAth :params="props.params" :curMapAttr="curMapAttr" :rowData="rowData" @update-row="upDateRow" />
        <!-- <Button type="link" @click="handlerGovFile($event, curMapAttr)">{{ curMapAttr.Name }}</Button> -->
      </template>
      <!--图片-->
      <template v-if="isPic(curMapAttr)">
        <img
          :src="rowData[mapAttr.KeyOfEn]"
          :style="createStyle({ width: curMapAttr.UIWidth === 0 ? '100%' : curMapAttr.UIWidth + 'px', height: curMapAttr.UIHeight === 0 ? '100%' : curMapAttr.UIHeight + 'px' })"
        />
      </template>
      <!--单附件-->
      <template v-if="isSinglePic(curMapAttr)">
        <img v-if="curMapAttr.UIIsEnable === 0 || isReadonly == true" :src="GetSignature" :style="createStyle({ width: '300px', objectFit: 'contain' })" alt="图片加载失败" />
        <div v-else class="change-avatar" :key="mapAttr.KeyOfEn">
          <CropperAvatar
            :uploadApi="uploadApi"
            :value="GetSignature"
            :btnText="curMapAttr.Name"
            :btnProps="{ preIcon: 'ant-design:cloud-upload-outlined' }"
            @change="updateAvatar"
            width="150"
            @error="IconImgErr"
          />
        </div>
      </template>

      <!--居中弹窗-->
      <Modal v-model:open="modal.modalVisible" centered :title="modal.modalTitle" :width="modal.modalWidth" :body-style="modal.modalHeight" :footer="null" @cancel="HandlerCancel">
        <div class="h-100" style="overflow-y: auto; height: 100%">
          <HandWriting v-if="modal.modalType === 'HandWriting'" :imageSrc="modal.ImgSrc" writingType="KeyOfEn" :keyOfEn="modal.keyOfEn" @ChangeWriteImg="ChangeWriteImg" />
          <Ath
            v-else-if="modal.modalType === 'Ath'"
            ref="refAth"
            :ath-info="modal.Ath"
            :params="props.params"
            :PKValue="refPKVal"
            :is-readonly="props.isReadonly"
            :key="modal.componentKey"
          />
          <GenerList v-else-if="modal.modalType === 'GenerList'" :params="params" @modal-is-show="modalIsShow" :key="modal.componentKey" />
          <FrmBBS v-else-if="modal.modalType === 'FrmBBS'" :key="modal.componentKey" />
          <ExtMap v-else-if="modal.modalType === 'ExtMap'" :params="modal.params" @MapAddress="MapAddress" :key="modal.componentKey" />
          <iframe v-else-if="modal.modalType === 'link'" :src="modal.params.Doc" scrolling="auto" frameborder="no" style="width: 100%; height: 100%"></iframe>
        </div>
      </Modal>
      <!--右侧滑出-->
      <Drawer :visible="drawer.visible" :title="drawer.title" width="70%" :body-style="{ padding: 0 } as any" @close="drawer.visible = false" class="header-style">
        <template v-if="drawer.visible">
          <Frm v-if="drawer.type === 'Frm'" :params="drawer.params" />
          <iframe v-if="drawer.type === 'link'" :src="drawer.params.Doc" scrolling="auto" frameborder="no" style="width: 100%; height: 100%"></iframe>
        </template>
      </Drawer>
      <Modal
        v-model:open="popModal.visible"
        :title="popModal.title"
        :width="popModal.width"
        :bodyStyle="{
          padding: '0px 12px !important',
        }"
        :style="popModal.height"
        @ok="PopModalOK"
      >
        <UsefulExpres v-if="popModal.modalType === 'UsefulExpress'" :attrKey="curMapAttr.KeyOfEn" :frmID="curMapAttr.FK_MapData" :mapExt="popModal.mapExt" ref="fastRef" />
        <Pop
          v-else
          :refPKVal="props.refPKVal"
          :selectVal="rowData[popModal.keyOfEn]"
          :selectNameVal="popModal.itemNames"
          :mapExt="popModal.mapExt"
          :rowData="rowData"
          :mainData="props.data"
          :key="componetKey"
          :popHeight="popModal.height"
          ref="refPop"
        />
        <template #footer>
          <div style="padding: 12px">
            <Button @click="popModal.visible = false">取消</Button>
            <Button type="primary" @click="PopModalOK">确认</Button>
          </div>
        </template>
      </Modal>
      <Modal :open="previewVisible" :footer="null" @cancel="previewVisible = false">
        <img alt="example" style="width: 100%" :src="previewImage" />
      </Modal>
    </div>
  </BaseComponent>
</template>

<script lang="ts" setup>
  import BaseComponent from '/@/WF/Comm/BaseComponent.vue';
  import { Tinymce } from '/@/components/Tinymce/index';
  import { CropperAvatar } from '/@/components/Cropper';
  import {
    Switch,
    Select,
    SelectOption,
    TreeSelect,
    RadioGroup,
    Radio,
    Checkbox,
    CheckboxGroup,
    Tag,
    Input,
    InputGroup,
    InputNumber,
    DatePicker,
    InputPassword,
    Textarea,
    Button,
    Rate,
    Modal,
    AutoComplete,
    Spin,
    message,
    Drawer,
    notification,
    Cascader,
    Upload,
    Popover,
    Table,
    Tooltip,
  } from 'ant-design-vue';
  import type { CascaderProps } from 'ant-design-vue';
  import { CloudUploadOutlined, LinkOutlined, SettingOutlined, UploadOutlined, PlusOutlined, MinusOutlined, CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons-vue';
  // 外部传过来的属性
  import { reactive, ref, shallowRef, watch, inject, computed, onMounted, getCurrentInstance, PropType, unref, Ref, onUnmounted } from 'vue';
  import { ddlInfo, MapAttrExt, useKeyOfEnType } from '/@/WF/CCForm/FrmEnd';
  import BSEntity from '/@/utils/gener/BSEntity';
  import JobSchedule from '/@/WF/WorkOpt/OneWork/JobSchedule.vue';
  import ExtMap from '/@/WF/CCForm/ExtMap.vue';
  import Pop from '/@/WF/CCForm/Pop.vue';
  import { DealExp } from '/@/utils/gener/StringUtils';
  import HandWriting from '/@/WF/CCForm/HandWriting.vue';
  import GenerList from '../views/GenerList.vue';
  import FrmBBS from '/@/CCFast/CCBill/Components/FrmBBS/FrmBBS.vue';
  import { urlToBase64 } from '/@/utils/file/base64Conver';
  import Ath from './Ath.vue';
  import AthView from './AthView.vue';
  import GovAth from './GovAth.vue';
  import Frm from '/@/WF/Frm.vue';
  import { SysEnums } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnum';
  import WebUser from '/@/bp/web/WebUser';
  import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
  import { mapExtParse } from '/@/WF/CCForm/MapExt';
  import { getAppEnvConfig } from '/@/utils/env';
  import { GetPara } from '/@/utils/gener/StringUtils';
  import DBAccess from '/@/utils/gener/DBAccess';
  import { cloneDeep } from 'lodash-es';
  import dayjs, { Dayjs } from 'dayjs';
  import { handleNoNameField } from '/@/utils/stringUtils';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { FrmHtml } from '/@/WF/Admin/FrmLogic/Components/FrmHtml';
  import emailjs from '@emailjs/browser';
  import { windowOpen } from '/@/utils/windowOpen';
  import WorkCheck from '/@/WF/WorkOpt/WorkCheck.vue';
  import Icon from '/@/components/Icon';
  import { debounce } from 'lodash';
  import { AtPara } from '/@/bp/da/AtPara';
  import { DataType } from '/@/bp/en/DataType';
  import { useTreeConvert } from '/@/hooks/ens/useDataConvert';
  import { useDBSourceLoader } from '/@/hooks/ens/useDBSourceLoader';
  import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
  import { FrmBodyItemChange } from '/@/DataUser/OverrideFiles/FrmBodyItemChange';
  import { FrmBodyBtnClick } from '/@/DataUser/OverrideFiles/FrmBodyBtnClick';
  import { WaiGuaBaseFrm } from '/@/bp/UIEntity/WaiGuaBaseFrm';
  import { useSharedFormStore } from '/@/store/modules/sharedForm';
  import UsefulExpres from '/@/WF/CCForm/UsefulExpres.vue';
  import { FrmAttachmentDBs } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmAttachmentDB';
  import { NColorPicker } from 'naive-ui';
  import Event from '/@/utils/Events';
  import { calculateLeaveDays } from '/@/utils/computeTime';
  import { GloGenerDBSrc } from '/@/CCFast/GenerDBSrc/GloGenerDBSrc';

  const baseComponent = shallowRef<InstanceType<typeof BaseComponent>>();
  const props = defineProps({
    mapAttr: {
      type: Object,
      default: () => {
        return {};
      },
    },
    params: {
      type: Object,
      default: null,
    },
    isReadonly: {
      type: Boolean,
      default: false,
    },
    isPageReadonly: {
      type: Boolean,
      default: false,
    },
    //当前表单数据
    mainData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    //对于从表来说的主表数据
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
    frmData: {
      type: Object,
      default: null,
    },
    refPKVal: {
      type: [Number, String],
      default: '0',
    },
    isDtl: {
      type: Boolean,
      default: false,
    },
    rowIdx: {
      type: Number,
      default: 0,
    },
    WGFrm: {
      type: Object as PropType<WaiGuaBaseFrm>,
      default: null,
    },
    isReload: {
      type: Boolean,
      default: false,
    },
  });

  const showTip = ref(false);

  // styles
  const createStyle = (style: Recordable) => {
    return style;
  };
  // end
  // const sysLang = WebUser.SysLang || 'CH';
  //弹窗显示
  const modal = reactive({
    modalVisible: false,
    modalTitle: '',
    modalType: '',
    keyOfEn: '',
    ImgSrc: '',
    Ath: {},
    modalWidth: 800,
    modalHeight: {},
    params: {},
    componentKey: 0,
  });
  //弹窗显示
  const popModal = reactive({
    visible: false,
    title: '',
    modalType: '',
    keyOfEn: '',
    width: 800,
    height: {},
    mapExt: {},
    itemNames: '',
  });
  const componetKey = ref(0);
  const curMapAttr = ref(props.mapAttr as MapAttrExt);

  const rowData = ref(props.mainData);

  const { VITE_GLOB_API_URL } = getAppEnvConfig();

  // 共享表单
  const sformStore = useSharedFormStore();
  const getUserColor = (userid: string) => {
    return sformStore.onlineUsers.find((u) => u.UserId == userid)?.HexColor || '#1890ff';
  };
  const editUserStyle = (userid: string) => {
    return {
      backgroundColor: getUserColor(userid),
      color: 'white',
    };
  };

  /************************************************从表图片显示*****************************************************************************/
  const basePath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';
  const GetAthDB = async () => {
    const dbs = new FrmAttachmentDBs();
    await dbs.Retrieve('RefPKVal', rowData.value['OID'], 'NoOfObj', curMapAttr.value.KeyOfEn, 'Idx');
    return dbs;
  };
  const prefix = import.meta.env.MODE === 'development' ? '/api/' : basePath;
  const baseFilePath =
    prefix +
    'WF/Comm/ProcessRequest?DoType=HttpHandler&DoMethod=AttachmentUpload_Down&HttpHandlerName=BP.WF.HttpHandler.WF_CCForm&WorkID=' +
    rowData.value['OID'] +
    '&Token=' +
    WebUser.Token;
  const previewVisible = ref(false);
  const previewImage = ref(baseFilePath);
  /************************************************从表图片显示*****************************************************************************/

  const getUsername = (userId: string) => {
    return sformStore.onlineUsers.find((u) => u.UserId == userId)?.Username || `未知用户名 - id => ${userId}`;
  };
  const tryLockField = (fieldKey: string) => {
    if (attrIsReadonly()) return;
    sformStore.tryLockField(fieldKey);
  };
  const tryReleaseField = (_ev: any, fieldKey: string) => {
    if (attrIsReadonly()) return;
    sformStore.tryReleaseField(fieldKey);
  };
  const shouldShowEditUser = computed(() => {
    return sformStore.editInfo[curMapAttr.value.KeyOfEn] && sformStore.onlineUsers.length > 1;
  });
  const hasEditorStyle = computed(() => {
    const color = getUserColor(sformStore.editInfo[curMapAttr.value.KeyOfEn]);
    return {
      border: shouldShowEditUser.value ? `1px solid ${color}` : 'none',
    };
  });

  const updateFieldVal = (fieldKey: string, value: any) => {
    sformStore.updateFieldVal(fieldKey, value);
  };
  const editByOthers = ref(false);
  watch(
    () => sformStore.editInfo,
    (val) => {
      const attrInEdit = !!val[curMapAttr.value.KeyOfEn];
      if (attrInEdit) editByOthers.value = val[curMapAttr.value.KeyOfEn] != WebUser.No;
      else editByOthers.value = false;
    },
  );
  watch(
    () => sformStore.gloData,
    (val) => {
      const _key_ = curMapAttr.value.KeyOfEn;
      if (typeof val[_key_] == 'undefined') return;
      if (rowData.value[_key_] == val[_key_]) return;
      if (isInt(curMapAttr.value)) {
        rowData.value[_key_] = parseInt(val[_key_]);
        return;
      }
      if (isFloat(curMapAttr.value) || isMoney(curMapAttr.value)) {
        rowData.value[_key_] = parseFloat(val[_key_]);
        return;
      }
      rowData.value[_key_] = val[_key_];
    },
  );
  const attrIsReadonly = () => {
    return editByOthers.value || curMapAttr.value.UIIsEnable === 0 || props.isReadonly == true;
  };
  // end

  //自动完成
  const completeOptions = ref<Record<string, string>[]>([]);
  //数值型的最大值、最小值
  const numMax = ref(Infinity);
  const numMin = ref(Infinity);
  const step = ref(1.0);
  const numInputStyle = ref(0);
  //上传附件
  const athNum = ref(0);
  const nodeInfo = props.frmData == null ? null : typeof props.frmData.WF_Node != 'undefined' ? props.frmData.WF_Node[0] : null;
  const entityFrm = unref(props.WGFrm);
  //判断字段类型
  const {
    isDDL,
    isRadio,
    isCheckBoxs,
    isBool,
    isInt,
    isFloat,
    isMoney,
    isDateOrDateTime,
    isTextBox,
    isTextPop,
    isTextPopSelect,
    isTextSelect,
    isTextChoiceSearch,
    isAutoCompleteSimple,
    isAutoCompleteTable,
    isReadOnlyLink,
    isPassword,
    isTextArea,
    isRich,
    isBigText,
    isFileAth,
    isHandWriting,
    isLink,
    isBtn,
    isJobSchedule,
    isScore,
    isMap,
    isPic,
    isSinglePic,
    isRelatedDocs,
    isReview,
    isGovDocFile,
    isKeepSecret,
    isEmailFormat,
    isAddrFormat,
    isSignCheck,
    isCascader,
    isIDCard,
    isFastInput,
    isNumber,
    isLabColor,
  } = useKeyOfEnType(props.isReadonly);

  const { GetDataTableByDB, CovertMoneyToCN, GetActionDLLData, GetFullData, GetFullDataDtl, GetFullDataAth, GetDataTableOfTBChoice, objectToKeyValueString } = mapExtParse();
  const options = ref<CascaderProps['options']>([]);
  /**
   * 快速录入
   * @constructor
   */
  const FastInput = () => {
    popModal.visible = true;
    popModal.modalType = 'UsefulExpress';
    const mapExt = curMapAttr.value.mapExts.filter((mapExt) => mapExt['ExtModel'] === 'FastInput')[0];
    popModal.title = '选择词汇';
    popModal.keyOfEn = curMapAttr.value.KeyOfEn;
    popModal.mapExt = cloneDeep(mapExt);
    componetKey.value++;
  };
  const upDateRow = (key, val) => {
    emit('update-row', key, val);
  };
  /**
   * 获取级联的一级的值
   * @param mapAttr
   * @constructor
   */
  const GetCascaderOption = async (mapAttr) => {
    const mapExt = mapAttr.mapExts.filter((mapExt) => {
      return mapExt['ExtModel'] === 'Cascader';
    })[0];
    //一级级联
    const data = await GetDataTableByDB(mapExt, 'Tag1', '', props.refPKVal, rowData.value);
    if (Array.isArray(data)) {
      return data.map((item) => {
        return {
          value: item.No || item.NO || item.no,
          label: item.Name || item.NAME || item.name,
          isLeaf: false,
        };
      });
    }
    return [];
  };
  const loadCascaderData = async (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    const mapExt = curMapAttr.value.mapExts.filter((mapExt) => {
      return mapExt['ExtModel'] === 'Cascader';
    })[0];
    // load options lazily
    //setTimeout(() => {
    targetOption.loading = false;
    if (selectedOptions.length < 2) {
      const data = await GetDataTableByDB(mapExt, 'Tag2', targetOption.value, props.refPKVal, rowData.value);
      targetOption.children = data.map((item) => {
        return {
          value: item.No || item.NO || item.no,
          label: item.Name || item.NAME || item.name,
          isLeaf: false,
        };
      });
    } else {
      const data = await GetDataTableByDB(mapExt, 'Tag3', targetOption.value, props.refPKVal, rowData.value);
      targetOption.children = data.map((item) => {
        return {
          value: item.No || item.NO || item.no,
          label: item.Name || item.NAME || item.name,
          isLeaf: true,
        };
      });
    }

    options.value = [...options.value];
    //}, 1000);
  };
  const SetCascaderData = async (value, selectedOptions) => {
    const labels: string[] = [];
    let val = '';
    selectedOptions.forEach((item) => {
      labels.push(item.label);
      val = item.value;
    });
    rowData.value[curMapAttr.value.KeyOfEn + 'T'] = labels.join('/');
    rowData.value[curMapAttr.value.KeyOfEn] = value.join(',');
    await DealMapExtBySelect(false, val);
    //执行自定义的方法
    let result;
    if (entityFrm != null) {
      entityFrm.FrmBodyJson = rowData.value;
      result = await entityFrm.FrmBodyItemChange(curMapAttr.value.KeyOfEn, selectedOptions[selectedOptions.length - 1].value);
    } else
      result = await FrmBodyItemChange.FrmBodyItemChange(
        curMapAttr.value.FK_MapData,
        props.refPKVal,
        curMapAttr.value.KeyOfEn,
        selectedOptions[selectedOptions.length - 1].value,
        rowData.value,
      );
    if (!!result && typeof result === 'object') {
      for (const key in result) {
        if (rowData.value[key] != result[key]) rowData.value[key] = result[key];
      }
    }
  };
  const openPop = () => {
    const ext = curMapAttr.value.mapExts.find((ext) => ext.ExtModel == 'FieldPopShowDtl' && ext.DoWay != 0);
    if (!!ext) {
      if (ext.DoWay == 1) {
        let url = `/src/WF/views/GenerList.vue?EnName=GL_FieldPopShowDtl&FrmID=${curMapAttr.value.FK_MapData}&PKVal=${props.params.WorkID}&AttrKey=${curMapAttr.value.KeyOfEn}`;
        if (!ext.Tag1) {
          ext.Tag1 = '1000px';
        }
        if (!ext.Tag2) {
          ext.Tag = '700px';
        }
        baseComponent.value?.openModalByUrl('', url, null, ext.Tag1 + 'px', ext.Tag2 + 'px');
      }
      if (ext.DoWay == 2) {
        let url = `/src/WF/views/GenerList.vue?EnName=${ext.Doc}&FrmID=${curMapAttr.value.FK_MapData}&PKVal=${props.params.WorkID}&AttrKey=${curMapAttr.value.KeyOfEn}`;
        baseComponent.value?.openModalByUrl('', url);
      }
      if (ext.DoWay == 3) {
        let url = `${ext.Doc}`;
        // baseComp.value?.openModalByUrl('', url);
        baseComponent.value?.openIframe({
          width: '70%',
          height: '600px',
          openType: 0,
          src: url,
        });
        // baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenIframeByModal, url));
      }
    }
  };
  const increaseStep = () => {
    if (curMapAttr.value.UIIsEnable === 0 || props.isReadonly == true) return;
    const keyOfEn = curMapAttr.value.KeyOfEn;
    const val = rowData.value[keyOfEn] || 0;
    let newVal = 0;
    if (curMapAttr.value.MyDataType == 2) newVal = parseInt(parseInt(val) + step.value);
    else {
      const bit = parseInt(GetPara(curMapAttr.value.AtPara, 'NumScale') || 2);
      newVal = parseFloat((parseFloat(val) + step.value).toFixed(bit));
    }
    if (!!numMax.value && numMax.value != Infinity && parseFloat(numMax.value) < newVal) {
      message.error(curMapAttr.value.Name + '最大的值' + numMax.value);
      return;
    }
    rowData.value[curMapAttr.value.KeyOfEn] = newVal;
  };
  const decreaseStep = () => {
    if (curMapAttr.value.UIIsEnable === 0 || props.isReadonly == true) return;
    const keyOfEn = curMapAttr.value.KeyOfEn;
    const val = rowData.value[keyOfEn] || 0;
    let newVal = 0;
    if (curMapAttr.value.MyDataType == 2) newVal = parseInt(parseInt(val) - step.value);
    else {
      const bit = parseInt(GetPara(curMapAttr.value.AtPara, 'NumScale') || 2);
      newVal = parseFloat((parseFloat(val) - step.value).toFixed(bit));
    }
    if (!!numMin.value && numMin.value != Infinity && parseFloat(numMin.value) > newVal) {
      message.error(curMapAttr.value.Name + '最小的值' + numMin.value);
      return;
    }
    rowData.value[curMapAttr.value.KeyOfEn] = newVal;
  };
  /**
   * 字段值链接
   * @param val
   * @param mapAttr
   * @constructor
   */
  const GetReadOnlyLink = (val, mapAttr) => {
    const mapExt = mapAttr.mapExts.filter((mapExt) => {
      return mapExt['ExtModel'] === 'ReadOnlyLink';
    })[0];
    const doWay = mapExt['DoWay'];
    let doc = mapExt.Doc;
    doc = doc.replace(/@Key/g, val);
    doc = DealExp(doc);
    switch (doWay) {
      case 'HelpInfo': //弹出帮助说明
        notification.open({
          message: '帮助说明',
          description: doc,
          placement: 'top',
          duration: 0,
        });
        return;
      case 'UrlRightOpen': //侧滑弹出
        drawer.visible = true;
        drawer.type = 'link';
        drawer.params.Doc = doc;
        return;
      case 'UrlOpen': //模弹窗打开
        modal.modalVisible = true;
        modal.modalType = 'link';
        modal.componentKey++;
        modal.params.Doc = doc;
        modal.modalWidth = mapExt.Tag2 || window.innerWidth * 0.5;
        modal.modalHeight = { height: mapExt.Tag1 || 400 + 'px' };
        return;
      case 'UrlWinOpen': //新窗口打开
        windowOpen(doc);
        return;
    }
  };
  //打开地图
  const OpenMap = async () => {
    modal.keyOfEn = curMapAttr.value.KeyOfEn;
    //
    const atPara = new AtPara(rowData.value['AtPara']);
    const val = atPara.GetValStrByKey(curMapAttr.value.KeyOfEn) || '';
    let lng = val.split(',')[0] || '';
    let lat = val.split(',')[1] || '';
    if (!lng || !lat) {
      //获取当前地址
      /*try {
const url = window.location.href;
const handler = new HttpHandler('BP.WF.HttpHandler.CCMobile_CCForm');
handler.AddPara('htmlPage', url);
handler.AddPara('CorpID', CommonConfig.CorpID);
handler.AddPara('CorpSecret', CommonConfig.CorpSecret);
const config = await handler.DoMethodReturnString('GetWXConfigSetting');
wx.config({
beta: true,
debug: false,
appId: config.AppID,
timestamp: config.timestamp,
nonceStr: config.nonceStr,
signature: config.signature,
jsApiList: ['getLocation'],
});

wx.getLocation({
type: 'gcj02', // 返回的经纬度可以用于wx.openLocation
success: (res) => {
lng = res.longitude;
lat = res.latitude;
},
fail: (err) => {
console.error('获取位置失败: ', err);
},
});

wx.error((err) => {
console.error('wx.error: ', err);
});
} catch (err) {
console.error('获取签名配置信息失败: ', err);
}*/
    }
    modal.params = {
      lng: lng,
      lat: lat,
      address: rowData.value[modal.keyOfEn] || '',
      isReadonly: curMapAttr.value.UIIsEnable === 0 || props.isReadonly == true,
    };
    modalShow('ExtMap', '选择地图');
  };

  const MapAddress = (address, lng, lat) => {
    rowData.value[modal.keyOfEn] = address;
    const atPara = new AtPara(rowData.value['AtPara']);
    atPara.SetVal(modal.keyOfEn, lng + ',' + lat);
    rowData.value['AtPara'] = atPara.GenerAtParaStrs();
    modal.modalVisible = false;
    emit('update-row', modal.keyOfEn, address, props.rowIdx);
  };

  const onLoadData = async (treeNode) => {
    try {
      const mapExt = curMapAttr.value.mapExts.filter((mapExt) => {
        return mapExt['DoWay'] === 'PopBranches';
      })[0];
      const data = await GetDataTableByDB(mapExt, 'Tag2', treeNode.dataRef.No, props.refPKVal, rowData.value, '');
      treeNode.dataRef.children = data.filter((item) => item.No != treeNode.No);
      curMapAttr.value['ddl'] = [...curMapAttr.value['ddl']];
      if (data.length === 1 && typeof data[0].No === 'undefined') treeNode.dataRef.children = [];
      else {
        treeNode.dataRef.children = data;
      }
    } catch (e: any) {
      console.error(e);
      message.error(e.toString());
    } finally {
    }
  };

  const { listToTree } = useTreeConvert();

  // treeSelect添加change事件
  const ChangeTreeSelect = async (value, label, _extra) => {
    emit('update-row', curMapAttr.value.KeyOfEn, value, props.rowIdx);
    emit('update-row', curMapAttr.value.KeyOfEn + 'T', label.join(','), props.rowIdx);
    let text = value;
    if (Array.isArray(value)) text = value.join(',');
    await DealMapExtBySelect(false, text);
  };
  const IsShowTime = (mapAttr) => {
    /* if ([1, 2, 4, 5].includes(parseInt(mapAttr.IsSupperText))) return true;
return false;*/
    if (parseInt(mapAttr.IsSupperText) == 1) return { format: 'HH' };
    if (parseInt(mapAttr.IsSupperText) == 2 || parseInt(mapAttr.IsSupperText) == 5) return { format: 'HH:mm' };
    if (parseInt(mapAttr.IsSupperText) == 3 || parseInt(mapAttr.IsSupperText) == 6) return { format: 'HH:mm:ss' };
    return false;
  };

  /********************************文本自动完成************************************/
  const validateInputKey = (searchText) => {
    let value: string = (searchText || '') as string;
    if (!!value) {
      const forbiddenChars = ';*--\'"';
      let isHave = false;
      for (const c of forbiddenChars) {
        if (value.includes(c)) {
          isHave = true;
          value = value.replaceAll(c, '');
        }
      }
      if (isHave) message.warn('禁止输入含有' + forbiddenChars + '的字符,防止SQL注入');
    }
    return value;
  };
  const onAutoCompleteSearch = async (searchText: string) => {
    if (!searchText) {
      completeOptions.value = [];
      return;
    }
    searchText = validateInputKey(searchText);
    const mapExt = curMapAttr.value.mapExts.filter((mapExt) => {
      return mapExt['ExtModel'] === 'TBFullCtrl';
    })[0];
    let data: any[] = [];
    if (mapExt?.DoWay === 'Simple' || mapExt?.DoWay === 'Table' || mapExt?.DoWay === 'SimpleSFTable' || mapExt?.DoWay === 'TableSFTable') {
      if (mapExt.DBType == 0) {
        const en = new BSEntity('BP.Sys.MapExt', mapExt.MyPK);
        await en.Init();
        let rowDataPara = objectToKeyValueString(rowData.value);
        const rowDataPara2 = objectToKeyValueString(props.params);
        rowDataPara += rowDataPara2;
        const myPK = 'Frm.' + mapExt?.FK_MapData + '_' + mapExt?.AttrOfOper + '.TBFullCtrl';
        data = (await GloGenerDBSrc.GenerData_ByMyPK_WithAtPara(myPK, '@Key=' + searchText.replace(/'/, '') + rowDataPara)) || [];
        data = handleNoNameField(data);
      }
      if (mapExt.DBType == 1) {
        let TagUrl = mapExt.Tag4;
        let dbSrc = '';
        dbSrc = TagUrl.replace(/@Key/g, searchText);
        await DBAccess.RunUrlReturnJSON(dbSrc);
        data = DBAccess.data || [];
      }
      if (mapExt.DBType == 2) {
        data = (await DBAccess.RunFunctionReturnStr(mapExt.Tag4)) || [];
      }
    }
    if (data.length == 0) {
      await onAutoCompleteClear();
    }
    // if (mapExt?.DoWay === 'SimpleSFTable' || mapExt?.DoWay === 'TableSFTable') {
    //   const en = new BSEntity('BP.Sys.MapExt', mapExt.MyPK);
    //   await en.Init();
    //   let paras = '';
    //   for (const item in rowData.value) {
    //     paras += '@' + item + '=' + rowData.value[item];
    //   }
    //   paras += '@Key=' + searchText;
    //   data = (await en.DoMethodReturnString('GetDataTableByWebApi', paras)) || [];
    // }
    if (mapExt?.DoWay === 'Table') {
      visible.value = true;
      autoData.value = cloneDeep(data);
      computkey.value++;
    } else {
      completeOptions.value = data.map((item) => {
        return {
          value: item.No,
          label: item.Name,
        };
      });
      if (Array.isArray(completeOptions.value) && completeOptions.value.length > 0) {
        const item = completeOptions.value[0];
        if (!item['value']) {
          message.error('查询结果列必须包含No,Name，请检查数据源配置');
          completeOptions.value = [];
        } else if (!item['label']) {
          message.info('查询结果列必须包含No,Name，请检查数据源配置');
        }
      }
    }
  };
  const onAutoCompleteSelect = async (value: string) => {
    const data = completeOptions.value.filter((item) => item.value === value);
    const mapExt = curMapAttr.value.mapExts.filter((mapExt) => {
      return mapExt['ExtModel'] === 'TBFullCtrl';
    })[0];
    const showModel = GetPara(mapExt.AtPara, 'ShowModel') || '0';
    if (showModel == '0') emit('update-row', curMapAttr.value.KeyOfEn, data[0].value, props.rowIdx);
    else emit('update-row', curMapAttr.value.KeyOfEn, data[0].label, props.rowIdx);
    //填充其他控件
    await ChangeSelect(data[0].value);
  };
  const onAutoCompleteClear = async () => {
    await ChangeSelect('');
  };
  /**
   * 自动填充表格模式
   * @param record
   */
  const rowClick = (record) => {
    return {
      onClick: async () => {
        visible.value = false;
        const mapExt = curMapAttr.value.mapExts.filter((mapExt) => {
          return mapExt['ExtModel'] === 'TBFullCtrl';
        })[0];
        const showModel = GetPara(mapExt.AtPara, 'ShowModel') || '0';
        if (showModel == '0') emit('update-row', curMapAttr.value.KeyOfEn, record.No, props.rowIdx);
        else emit('update-row', curMapAttr.value.KeyOfEn, record.Name, props.rowIdx);
        //填充其他控件
        await ChangeSelect(record.No);
      },
    };
  };
  /********************************文本自动完成************************************/
  /********************************弹窗返回值的操作*************************************/
  /**
   * Pop弹窗
   * @param mapAttr
   * @constructor
   */
  const PopModalShow = (mapAttr) => {
    const mapExt = mapAttr.mapExts.filter((mapExt) => mapExt['ExtModel'] === 'Pop')[0];
    popModal.title = GetPara(mapExt.AtPara, 'Title') || '选择' + mapAttr.Name;
    popModal.keyOfEn = mapAttr.KeyOfEn;
    popModal.width = mapExt.W || window.innerWidth * 0.8;
    popModal.width = popModal.width > window.innerWidth * 0.8 ? window.innerWidth * 0.8 : popModal.width;
    popModal.height = {
      height: mapExt.H + 'px' || window.innerHeight * 0.8 + 'px',
    };
    popModal.mapExt = cloneDeep(mapExt);
    popModal.itemNames = rowData.value[mapAttr.KeyOfEn + 'T'];
    popModal.visible = true;
    componetKey.value++;
  };
  /**
   * Pop弹窗点击确定后执行的操作
   */
  const refPop = shallowRef<InstanceType<typeof Pop>>();
  const fastRef = shallowRef<InstanceType<typeof UsefulExpres>>();
  const PopModalOK = async () => {
    if (popModal.modalType === 'UsefulExpress') {
      const val = fastRef.value?.selectNames;
      rowData.value[popModal.keyOfEn] = rowData.value[popModal.keyOfEn] + val.join(' ');
      popModal.visible = false;
      return;
    }
    const val = refPop.value?.handlerPopOK?.();
    if (Array.isArray(val) && val.length == 2) {
      rowData.value[popModal.keyOfEn] = val[0].join(',');
      rowData.value[popModal.keyOfEn + 'T'] = val[1].join(',');
      curMapAttr.value['eleDBs'] = val[1];
      popModal.visible = false;
      emit('update-row', curMapAttr.value.KeyOfEn, rowData.value[popModal.keyOfEn], props.rowIdx);
      await ChangeSelect(rowData.value[popModal.keyOfEn]);
    }
  };
  /**
   * 删除FrmEleDB
   * @param mapAttr
   * @param eledb
   * @constructor
   */
  const DeleteEleDB = async (eleItem, idx) => {
    let arr = rowData.value[curMapAttr.value.KeyOfEn].split(',');
    arr.splice(idx, 1);
    emit('update-row', curMapAttr.value.KeyOfEn, arr.join(','), props.rowIdx);
    arr = rowData.value[curMapAttr.value.KeyOfEn + 'T'].split(',');
    arr.splice(idx, 1);
    curMapAttr.value['eleDBs'] = arr;
    rowData.value[curMapAttr.value.KeyOfEn + 'T'] = arr.join(',');
    await ChangeSelect(rowData.value[curMapAttr.value.KeyOfEn]);
  };

  // Pop下拉选择
  const _ddlOption = ref<Array<{ label: string; value: string | number }>>([]);
  const GetOption = async (mapAttr) => {
    const options: { label: string; value: string }[] = [];
    if (!Array.isArray(mapAttr.mapExts)) return [];
    const mapExt = mapAttr.mapExts.filter((mapExt) => mapExt['ExtModel'] === 'Pop')[0];
    if (mapExt.ExtType === 'PopBindEnum') {
      const enums = new SysEnums();
      if (WebUser.CCBPMRunModel === CCBPMRunModel.SAAS) await enums.Retrieve('EnumKey', mapExt.Tag2, 'OrgNo', WebUser.OrgNo);
      else await enums.Retrieve('EnumKey', mapExt.Tag2);
      enums.forEach((item) =>
        options.push({
          value: item.IntKey,
          label: item.Lab,
        }),
      );
    }
    if (mapExt.ExtType === 'PopBindSFTable') {
      const sftable = new BSEntity('BP.Sys.SFTable', mapExt.Tag2);
      const data = await sftable.DoMethodReturnJSON('GenerDataOfJson');
      if (Array.isArray(data)) {
        data.forEach((item) =>
          options.push({
            value: item.No,
            label: item.Name,
          }),
        );
      }
    }
    if (mapExt.ExtType === 'PopTableList') {
      const data = await GetDataTableByDB(mapExt, 'Tag2', '', props.refPKVal, rowData.value);
      if (Array.isArray(data)) {
        data.forEach((item) =>
          options.push({
            value: item.No,
            label: item.Name,
          }),
        );
      }
    }
    return options;
  };

  onMounted(async () => {
    //关联uop
    Event.on('LinkRefFlow', async (LinkFlow) => {
      console.log('data', LinkFlow);
      if (!!LinkFlow && !!params.KeyOfEn) {
        const result = LinkFlow.split(',').reduce(
          (acc, entry) => {
            const parts = entry.split('@');
            // 非Title部分
            acc[0].push(parts.filter((part) => !part.startsWith('Title=')).join('@'));
            // Title部分
            const title = parts.find((part) => part.startsWith('Title='));
            acc[1].push(title ? title.substring(6) : '');
            return acc;
          },
          [[], []] as [string[], any[]],
        ); // 显式类型声明

        rowData.value[params.KeyOfEn] = result[0].join(',');
        rowData.value[params.KeyOfEn + 'T'] = result[1].join(',');
        curMapAttr.value['eleDBs'] = [];
        const no = rowData.value[params.KeyOfEn] || '';
        const text = rowData.value[params.KeyOfEn + 'T'] || '';
        if (!!no && !!text) {
          no.split(',').forEach((item, idx) => {
            curMapAttr.value['eleDBs'].push({
              value: item,
              label: text.toString().split(',')[idx],
            });
          });
        }

        modal.modalVisible = false;
        emit('update-row', curMapAttr.value.KeyOfEn, rowData.value[params.KeyOfEn], props.rowIdx);
        await ChangeSelect(rowData.value[params.KeyOfEn]);
      }
    });
    if (!isTextSelect(curMapAttr.value)) return;
    const res = await GetOption(curMapAttr.value);
    _ddlOption.value = res;
  });
  onUnmounted(() => {
    Event.off('LinkRefFlow');
  });

  // end

  /********************************弹窗返回值的操作*************************************/
  /********************************搜索多选*******************************************/

  const isMultiSelect = computed(() => {
    const mapExt = props.mapAttr.mapExts.filter((mapExt) => mapExt['ExtModel'] === 'MultipleChoiceSearch')[0];
    if (!mapExt) return true; // 默认多选
    if (mapExt.DoWay == '2') return true;
    return GetPara(mapExt.AtPara, 'MultipleSelectType') == '1';
  });
  // 保持单向数据流 by wanglu
  const searchSelectVM = computed({
    get: () => {
      const val = cloneDeep(curMapAttr.value['eleDBs'] as { label: string; value: string }[]);
      return val;
    },
    set: (items: { label: string; value: string }[]) => {
      if (isMultiSelect.value) {
        curMapAttr.value['eleDBs'] = items;
      } else {
        curMapAttr.value['eleDBs'] = items.slice(items.length - 1);
      }
      // console.log({ items });
      emit('update-row', curMapAttr.value.KeyOfEn, curMapAttr.value['eleDBs'].map((item) => item.value).join(','), props.rowIdx);
      emit('update-row', curMapAttr.value.KeyOfEn + 'T', curMapAttr.value['eleDBs'].map((item) => item.label).join(','), props.rowIdx);
    },
  });
  // end
  const choiceSearchFetching = ref(false);
  const choiceSearchData = ref<any[]>([]);
  const ChoiceSearchFetch = debounce(async (value) => {
    if (value.includes("'") || value == '') {
      choiceSearchData.value = [];
      return;
    }
    choiceSearchData.value = [];
    const mapExt = curMapAttr.value.mapExts.filter((mapExt) => mapExt['ExtModel'] === 'MultipleChoiceSearch')[0];
    const data = await GetDataTableByDB(mapExt, 'Doc', value, props.refPKVal, rowData.value);
    choiceSearchData.value = data.map((item) => ({
      label: item.Name,
      value: item.No,
    }));
    if (parseInt(mapExt?.DoWay) === 2 && data.length == 0) {
      choiceSearchData.value.push({
        label: value,
        value: value,
      });
    }
    choiceSearchFetching.value = false;
  }, 200);
  // const onSelectItems = async (selectedItem: { label: string; value: string }) => {
  //   if (rowData.value.hasOwnProperty(curMapAttr.value.KeyOfEn)) {
  //     if (isMultiSelect.value) {
  //       if (rowData.value[curMapAttr.value.KeyOfEn] == '') {
  //         // rowData.value[curMapAttr.value.KeyOfEn] = selectedItem.value;
  //         emit('update-row', curMapAttr.value.KeyOfEn, selectedItem.value);
  //       } else {
  //         // rowData.value[curMapAttr.value.KeyOfEn] += ',' + selectedItem.value;
  //         emit('update-row', curMapAttr.value.KeyOfEn, selectedItem.value);
  //       }
  //     } else {
  //       // rowData.value[curMapAttr.value.KeyOfEn] = selectedItem.value;
  //       emit('update-row', curMapAttr.value.KeyOfEn, selectedItem.value);
  //     }
  //   }
  //   if (rowData.value.hasOwnProperty(curMapAttr.value.KeyOfEn + 'T')) {
  //     if (isMultiSelect.value) {
  //       if (rowData.value[curMapAttr.value.KeyOfEn + 'T'] == '') {
  //         rowData.value[curMapAttr.value.KeyOfEn + 'T'] = selectedItem.label;
  //       } else {
  //         rowData.value[curMapAttr.value.KeyOfEn + 'T'] += ',' + selectedItem.label;
  //       }
  //     } else {
  //       rowData.value[curMapAttr.value.KeyOfEn + 'T'] = selectedItem.label;
  //     }
  //   }
  // };
  // const onRemoveItems = async (value) => {
  //   let arr = rowData.value[curMapAttr.value.KeyOfEn].split(',');
  //   arr.splice(arr.indexOf(value.value), 1);
  //   rowData.value[curMapAttr.value.KeyOfEn] = arr.join(',');
  //   arr = rowData.value[curMapAttr.value.KeyOfEn + 'T'].split(',');
  //   arr.splice(arr.indexOf(value.label), 1);
  //   rowData.value[curMapAttr.value.KeyOfEn + 'T'] = arr.join(',');
  //   //curMapAttr.value['eleDBs'].splice(idx, 1);
  // };
  /********************************搜索多选*******************************************/
  /********************************事件绑定函数**blur/change**************************/
  const inputChange = async () => {
    if (props.isDtl === true) {
      emit('TextBoxChange', curMapAttr.value.KeyOfEn, rowData.value, rowData.value['OID']);
    }
    await CommDoFunc('change', rowData.value[curMapAttr.value.KeyOfEn]);
  };
  const inputBlur = async () => {
    if (props.isDtl === true) {
      emit('TextBoxBlur', curMapAttr.value.KeyOfEn, rowData.value, rowData.value['OID']);
    }
    await CommDoFunc('blur', rowData.value[curMapAttr.value.KeyOfEn]);
    DataChange2FrmBodyItemChange();
    showTip.value = false;
  };

  /**
   * 通用的执行外部方法
   * @param eventType
   * @param val
   * @constructor
   */
  const CommDoFunc = async (eventType, val) => {
    let mapExts = curMapAttr.value.mapExts || [];
    mapExts = mapExts.filter((mapExt) => mapExt.ExtModel === 'BindFunction' && mapExt.ExtType === 'SelfFunc' && mapExt.Tag === eventType);
    if (mapExts.length > 0) {
      let module = await import(/* @vite-ignore */ '/@/DataUser/JSLibData/' + curMapAttr.value.FK_MapData);
      let doc = mapExts[0].Doc;
      doc = doc.replace(/@Key/g, val);
      if (doc.includes('(')) eval(module[doc]);
      else eval(module[doc](val));
    }
    mapExts = mapExts.filter((mapExt) => mapExt.ExtModel === 'BindFunction' && mapExt.ExtType === 'JSBody' && mapExt.Tag === eventType);
    if (mapExts.length > 0) {
      let doc = mapExts[0].Doc;
      doc = DealExp(doc, rowData.value);
      eval(doc);
    }
  };
  /********************************事件绑定函数**blur/change**************************/

  /********************************下拉框的操作***************************************/
  const ChangeParentAttr: Function = inject('ChangeParentAttr') as Function;
  const CleanAll: Function = inject('CleanAll') as Function;
  const SetEnable: Function = inject('SetEnable') as Function;
  const ChangeSelect = async (value, option: ddlInfo | null = null, isPageLoad = false) => {
    //修改对应的T值
    if (curMapAttr.value.type === 'multiple' || curMapAttr.value.mode === 'multiple') {
      //根据val值获取文本值
      const valText = [];
      curMapAttr.value.ddl.forEach((item) => {
        if (rowData.value[curMapAttr.value.KeyOfEn].includes(item.value)) valText.push(item.label);
      });
      if (props.isDtl) rowData.value[curMapAttr.value.KeyOfEn + 'T'] = valText.join(',');
      else emit('update-row', curMapAttr.value.KeyOfEn + 'T', valText.join(','), props.rowIdx);
    } else {
      if (option != null) {
        if (props.isDtl) rowData.value[curMapAttr.value.KeyOfEn + 'T'] = option.label;
        else emit('update-row', curMapAttr.value.KeyOfEn + 'T', option.label, props.rowIdx);
      }
    }
    /* if (option != null) {
      if (props.isDtl) rowData.value[curMapAttr.value.KeyOfEn + 'T'] = option.label;
      else emit('update-row', curMapAttr.value.KeyOfEn + 'T', option.label, props.rowIdx);
    }*/
    //if (isRadio(curMapAttr.value) || isCheckBoxs(curMapAttr.value)) emit('update-row', curMapAttr.value.KeyOfEn, value, props.rowIdx);
    //else emit('update-row', curMapAttr.value.KeyOfEn, value, props.rowIdx);
    await DealMapExtBySelect(isPageLoad, value);
    //执行自定义的方法
    let result;
    if (entityFrm != null) {
      entityFrm.FrmBodyJson = rowData.value;
      result = await entityFrm.FrmBodyItemChange(curMapAttr.value.KeyOfEn, value);
    } else result = await FrmBodyItemChange.FrmBodyItemChange(curMapAttr.value.FK_MapData, props.refPKVal, curMapAttr.value.KeyOfEn, value, rowData.value);

    if (!!result && typeof result === 'object') {
      for (const key in result) {
        if (rowData.value[key] != result[key]) emit('update-row', key, result[key], props.rowIdx);
      }
    }
  };
  const DataChange2FrmBodyItemChange = async () => {
    //执行自定义的方法
    let result;
    if (entityFrm != null) {
      entityFrm.FrmBodyJson = rowData.value;
      result = await entityFrm.FrmBodyItemChange(curMapAttr.value.KeyOfEn, rowData.value[curMapAttr.value.KeyOfEn]);
    } else
      result = await FrmBodyItemChange.FrmBodyItemChange(
        curMapAttr.value.FK_MapData,
        props.refPKVal,
        curMapAttr.value.KeyOfEn,
        rowData.value[curMapAttr.value.KeyOfEn],
        rowData.value,
      );
    if (!!result && typeof result === 'object') {
      for (const key in result) {
        if (rowData.value[key] != result[key]) emit('update-row', key, result[key], props.rowIdx);
      }
    }
  };
  const DataTimeBlur = async () => {
    //执行自定义的方法
    let result;
    if (entityFrm != null) {
      entityFrm.FrmBodyJson = rowData.value;
      result = await entityFrm.FrmBodyItemChange(curMapAttr.value.KeyOfEn, rowData.value[curMapAttr.value.KeyOfEn]);
    } else
      result = await FrmBodyItemChange.FrmBodyItemChange(
        curMapAttr.value.FK_MapData,
        props.refPKVal,
        curMapAttr.value.KeyOfEn,
        rowData.value[curMapAttr.value.KeyOfEn],
        rowData.value,
      );
    if (!!result && typeof result === 'object') {
      for (const key in result) {
        if (rowData.value[key] != result[key]) emit('update-row', key, result[key], props.rowIdx);
      }
    }
  };

  const DealMapExtBySelect = async (isPageLoad, value) => {
    //if (loaded == false) return;
    //处理扩展属性
    const mapExts = curMapAttr.value.mapExts || [];
    for (const mapExt of mapExts) {
      if (isPageLoad && mapExt.ExtModel === 'RBAction') continue;
      if (isPageLoad && mapExt.ExtModel === 'DDLFullCtrl' && parseInt(mapExt['IsLoadFull'] || 1) == 0) {
        continue;
      }
      if (isPageLoad && (mapExt.ExtModel === 'FullDataDtl' || mapExt.ExtModel === 'FullDataDDL')) continue;
      switch (mapExt.ExtModel) {
        case 'ActiveDDL': //级联其他控件
          const data = await GetActionDLLData(value, mapExt, 'Doc', props.refPKVal, rowData.value, props.isDtl ? 'Dtl' : '');
          await ChangeParentAttr(mapExt.AttrsOfActive, 'ActiveDDL', data, props.rowIdx, mapExt.AtPara);
          break;
        case 'FullCtrl':
        case 'TBFullCtrl':
        case 'Pop':
        case 'DDLFullCtrl':
        case 'Cascader':
          //不填充
          if (mapExt?.DoWay == 0) break;
          if (mapExt?.DoWay === 'None') break;
          //填充主表控件,控制字段是Tag5
          //if (!!mapExt.Tag5 && mapExt.Tag5 != 'None' && mapExt.Tag5 != '0') {
          const fullData = await GetFullData(value, mapExt, props.refPKVal, rowData.value, props.data, props.isDtl);
          if (fullData == null) continue;
          if (props.isDtl === false) await ChangeParentAttr(curMapAttr.value.KeyOfEn, 'FullData', fullData);
          else if (Array.isArray(fullData)) {
            if (fullData.length == 1) {
              for (const item in fullData[0]) {
                if (rowData.value.hasOwnProperty(item)) rowData.value[item] = fullData[0][item];
              }
            }

            if (fullData.length > 1) {
              //填充多条从表数据
              await ChangeParentAttr(curMapAttr.value.KeyOfEn, 'FullData', fullData, props.rowIdx);
            }
          }
          if (typeof fullData === 'object') {
            for (const item in fullData) {
              if (rowData.value.hasOwnProperty(item)) {
                rowData.value[item] = fullData[item];
              }
            }
          }
          //}
          break;
        case 'FullDataDDL':
          const result = await GetActionDLLData(value, mapExt, 'Doc', props.refPKVal, rowData.value, props.isDtl ? 'Dtl' : '');
          if (result == null) break;
          await ChangeParentAttr(mapExt.Tag1, 'FullDataDDL', result, props.rowIdx);
          break;
        case 'FullDataDtl':
          const resultData = await GetFullDataDtl(value, mapExt, props.refPKVal, rowData.value, props.data);
          if (resultData == null) break;
          await ChangeParentAttr(mapExt.Tag1, 'FullDataDtl', resultData);
          break;
        case 'FullDataAth':
          const resultAthData = await GetFullDataAth(value, mapExt, props.refPKVal, rowData.value, props.data);
          if (resultAthData == null) break;
          await ChangeParentAttr(mapExt.Tag1, 'FullDataAth');
          break;
        case 'BindFunction': //绑定函数
          await CommDoFunc('change', value);
          break;
        case 'RBAction': //联动其他控件
          if (mapExt?.DoWay == 0) break;
          if (mapExt?.DoWay === 'None') break;
          if (typeof value === 'object') value = rowData.value[curMapAttr.value.KeyOfEn];
          //清空之前的设置
          CleanAll(mapExt.FK_MapData, mapExt.AttrOfOper);
          //设置联动
          if (Array.isArray(value)) {
            value.forEach((item) => {
              SetEnable(mapExt.FK_MapData, mapExt.AttrOfOper, item, false, props.rowIdx);
            });
          } else SetEnable(mapExt.FK_MapData, mapExt.AttrOfOper, value, false, props.rowIdx);
          break;
        case 'EnumHidItems': //隐藏枚举项
          if (!!mapExt.Tag4) {
            value = rowData.value[curMapAttr.value.KeyOfEn];
            let hideItems = '';
            const args = mapExt.Tag4.split('@');
            args.forEach((item) => {
              const strs = item.split('=');
              if (strs.length === 2 && strs[0] === value.toString()) {
                hideItems = strs[1].replace('\n', '') + ',';
              }
            });
            await ChangeParentAttr(mapExt.Tag, 'EnumHidItems', hideItems, props.rowIdx);
            break;
          }
          break;
        default:
          // message.error(curMapAttr.value.Name + '的扩展属性' + mapExt.ExtModel + '还未解析');
          break;
      }
    }
  };
  /********************************下拉框的操作*************************************/

  /********************************数值型的操作***************************************/
  /**
   * 金额类型转换
   * @param value
   * @constructor
   */
  // const FormatMoney = (value) => {
  //   const valStr = value.toString();
  //   if (!valStr) return '';
  //   const newValue = !valStr.includes('.') ? valStr : valStr.substring(0, valStr.indexOf('.'));
  //   let precisionVal = !valStr.includes('.') ? '0' : valStr.substring(valStr.indexOf('.') + 1);
  //   if (precisionVal.length < curMapAttr.value['bit']) {
  //     for (let i = precisionVal.length; i < curMapAttr.value['bit']; i++) precisionVal += '0';
  //   }

  //   return newValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + precisionVal;
  // };
  const emit = defineEmits(['ChangeDtlData', 'update-row', 'TextBoxChange', 'TextBoxBlur']);

  // const colorValue = computed({
  //   get() {
  //     return rowData[curMapAttr.value.KeyOfEn] || '#FFFFFF';
  //   },
  //   set(value) {
  //     rowData[curMapAttr.value.KeyOfEn] = value;
  //   },
  // });

  watch(
    () => rowData.value[curMapAttr.value.KeyOfEn],
    (val) => {
      const key = curMapAttr.value.KeyOfEn;
      updateFieldVal(key, val);
      NumberORDateChange();
      if (sformStore.isOnline && curMapAttr.value.ddl) {
        ChangeSelect(
          { target: { value: val } },
          curMapAttr.value.ddl.find((item) => item.value == val),
          true,
        );
      }
    },
  );

  // watch(
  //   () => cloneDeep(rowData.value),
  //   async () => {
  //     await NumberORDateChange();
  //   },
  // );
  const NumberORDateChange = async () => {
    if (curMapAttr.value.LGType != FieldTypeS.Normal) return;
    const isDate = isDateOrDateTime(curMapAttr.value);
    const mapExts = curMapAttr.value.mapExts || [];
    if (isDate && mapExts.length > 0) {
      for (const mapExt of mapExts) {
        switch (mapExt.ExtModel) {
          case 'DateFiledMaxMin': //对从表列求最大值最小值
            emit('ChangeDtlData', { dtlKey: mapExt.Tag1, mainKey: mapExt.AttrOfOper, computed: mapExt.Tag, type: 'Date' });
            break;
          case 'ReqDays': //计算两个日期时间的差
            const tag2 = mapExt.Tag2 || 'ReqDays';
            //判断
            const mapAttr = props.frmData.Sys_MapAttr.filter((mapAttr) => mapAttr.KeyOfEn == mapExt.AttrOfOper)[0];
            const tag3 = mapExt.Tag3;
            const tag4 = mapExt.Tag4;
            const tag = parseInt(mapExt.Tag || 0); //不计算节假日
            if (tag2 === 'ReqDays' || (tag2 === 'ReqTimes' && (!tag3 || !tag4))) {
              let time = dayjs(rowData.value[mapExt.Tag1]).diff(rowData.value[mapExt.Doc], 'hour') + 1 || 0;
              time = time / 24.0;
              //其中一个值未空，日期差为0
              if (!rowData.value[mapExt.Doc] || !rowData.value[mapExt.Tag1]) time = 0;

              if (tag === 1) {
                const startDate = dayjs(rowData.value[mapExt.Doc]).format('MM-DD HH');
                const endDate = dayjs(rowData.value[mapExt.Tag1]).format('MM-DD HH');
                const holidayEn = new BSEntity('BP.Sys.GloVar');
                holidayEn.setPK('Holiday');
                const count = await holidayEn.RetrieveFromDBSources();
                if (count === 1) {
                  const day = holidayEn.Val || '';
                  const days = day.split(',');
                  days.forEach((item) => {
                    if (startDate <= item && item <= endDate) time = time - 1;
                  });
                }
              }
              if (time == 0 && !!rowData.value[mapExt.Doc] && !!rowData.value[mapExt.Tag1]) message.info('选择的时间都在节假日内');
              if (mapAttr.MyDataType === DataType.AppInt) rowData.value[mapExt.AttrOfOper] = time.toFixed(0);
              else rowData.value[mapExt.AttrOfOper] = time.toFixed(1);
            }
            if (tag2 === 'ReqTimes' && !!tag3 && !!tag4) {
              const result = await calculateLeaveDays(rowData.value[mapExt.Doc], rowData.value[mapExt.Tag1], tag3, tag4, tag === 1);
              if (mapAttr.MyDataType === DataType.AppInt) rowData.value[mapExt.AttrOfOper] = result.toFixed(0);
              else rowData.value[mapExt.AttrOfOper] = result.toFixed(1);
            }

            break;
          case 'DateFieldInputRole':
            break;
          default:
            message.error(mapExt.AttrOfOper + '的扩展属性' + mapExt.ExtModel + '还未解析');
        }
      }
      return;
    }
    if (isNumber(curMapAttr.value) && mapExts.length > 0) {
      for (const mapExt of mapExts) {
        switch (mapExt.ExtModel) {
          case 'AutoFull': //自动计算
            let expression = mapExt.Tag;
            expression = expression.toLowerCase();
            for (const key in rowData.value) {
              if (expression.includes('@') == false) continue;
              const lowerKey = key.toLowerCase();
              const regExp = new RegExp(`@${lowerKey}\\b`, 'g');
              expression = expression.replace(regExp, rowData.value[key + 'T'] || rowData.value[key] || '0');
              let exp = '';
              for (let i = 0; i < expression.length; i++) {
                let char = expression.charAt(i);
                if (char != ' ') {
                  exp += char;
                }
              }
              expression = exp;
              if (expression.includes('/0')) {
                rowData.value[mapExt.AttrOfOper] = parseFloat('0.00').toFixed(curMapAttr.value['bit'] || 2);
                return;
              }
            }
            try {
              const data = eval(expression) || 0;
              const attr = props.frmData.Sys_MapAttr.filter((attr) => attr.KeyOfEn == mapExt.AttrOfOper && attr.FK_MapData == mapExt.FK_MapData)[0];
              if (rowData.value[mapExt.AttrOfOper] === '' || data != rowData.value[mapExt.AttrOfOper]) {
                const val = data + '';
                if (isFloat(attr) || isMoney(attr)) {
                  const factor = Math.pow(10, parseInt(GetPara(attr.AtPara, 'NumScale') || 2));
                  rowData.value[mapExt.AttrOfOper] = Math.round(parseFloat(val) * factor + Number.EPSILON) / factor;
                } else {
                  rowData.value[mapExt.AttrOfOper] = parseFloat(val).toFixed(0);
                }
              }
              emit('update-row', mapExt.AttrOfOper, rowData.value[mapExt.AttrOfOper], props.rowIdx);
              await ChangeParentAttr(mapExt.AttrOfOper, 'AutoFull', '', props.rowIdx);
            } catch (e) {
              console.log(e);
            }
            //emit('update-row', curMapAttr.value.KeyOfEn, rowData.value[mapExt.AttrOfOper], props.rowIdx);
            break;
          case 'RMBDaXie': //转大写
            rowData.value[mapExt.Tag] = CovertMoneyToCN(rowData.value[mapExt.AttrOfOper]);
            break;
          case 'ReqDays': //计算两个日期时间的差
            let time = dayjs(rowData.value[mapExt.Tag1]).diff(rowData.value[mapExt.Doc], 'hour') + 1 || 0;
            time = time / 24.0;
            //其中一个值未空，日期差为0
            if (!rowData.value[mapExt.Doc] || !rowData.value[mapExt.Tag1]) time = 0;
            const tag = mapExt.Tag || 0; //不计算节假日
            if (tag == 0) {
              const startDate = dayjs(rowData.value[mapExt.Doc]).format('MM-DD HH');
              const endDate = dayjs(rowData.value[mapExt.Tag1]).format('MM-DD HH');
              const holidayEn = new BSEntity('BP.Sys.GloVar');
              holidayEn.setPK('Holiday');
              const count = await holidayEn.RetrieveFromDBSources();
              if (count === 1) {
                const day = holidayEn.Val || '';
                const days = day.split(',');
                days.forEach((item) => {
                  if (startDate <= item && item <= endDate) time = time - 1;
                });
              }
            }
            if (time == 0 && !!rowData.value[mapExt.Doc] && !!rowData.value[mapExt.Tag1]) message.info('选择的时间都在节假日内');
            //判断
            const mapAttr = props.frmData.Sys_MapAttr.filter((mapAttr) => mapAttr.KeyOfEn == mapExt.AttrOfOper)[0];
            if (mapAttr.MyDataType === DataType.AppInt) rowData.value[mapExt.AttrOfOper] = time.toFixed(0);
            else rowData.value[mapExt.AttrOfOper] = time.toFixed(1);
            break;
          case 'NumEnterLimit': //对从表列求值
            emit('ChangeDtlData', { dtlKey: mapExt.Tag1, mainKey: mapExt.AttrOfOper, computed: mapExt.Tag, type: 'Number', filterCond: mapExt.Tag5, attrBit: mapExt.Tag6 });
            break;
          case 'NumFiledSumAvg': //从表列求和求平均
          case 'BindFunction':
          case 'FieldPopShowDtl':
          case 'EndLabEnum':
          case 'RBAction':
          case 'FieldInputStyle':
          case 'DDLFullCtrl':
          case 'FullDataDtl':
            break;
          default:
            message.error(mapExt.AttrOfOper + '的扩展属性' + mapExt.ExtModel + '还未解析');
        }
      }
    }
  };
  /********************************数值型的操作***************************************/
  /********************************日期时间型的操作************************************/
  const disabledDate = (current: Dayjs) => {
    // 不选择历史时间
    const mapExts = curMapAttr.value.mapExts || [];
    if (mapExts.length === 0) return current && current < dayjs().endOf('day') && current > dayjs().endOf('day');
    if (mapExts.length === 1 && mapExts[0].ExtModel === 'BindFunction') return current && current < dayjs().endOf('day') && current > dayjs().endOf('day');
    for (const mapExt of mapExts) {
      if (mapExt.ExtModel === 'DateFieldInputRole') {
        //不能选择历史时间
        if (parseInt(mapExt?.DoWay) === 1) return current && current < dayjs().subtract(1, 'day');
        //不能小于开始时间
        if (parseInt(mapExt?.DoWay) === 2) {
          const compareDate = mapExt.Tag1; //比较时间
          const expersion = mapExt.Tag; //表达式
          switch (expersion) {
            case 'GT': //大于
            case '>':
              return current && current <= dayjs(rowData.value[compareDate]).endOf('day');
            case 'GTE': //大于等于
            case '>=':
              return current && dayjs(dayjs(current).format(curMapAttr.value.format)) < dayjs(rowData.value[compareDate]);
            case 'IT': //小于
              return current && current >= dayjs(rowData.value[compareDate]);
            case 'ITE': //小于等于
              return current && dayjs(dayjs(current).format(curMapAttr.value.format)) > dayjs(rowData.value[compareDate]);
            case 'EQ': //等于
              return dayjs(current).format(curMapAttr.value.format) != rowData.value[compareDate];
            case 'NEQ': //不等于
              return dayjs(current).format(curMapAttr.value.format) === rowData.value[compareDate];
            default:
              message.error(mapExt.AttrOfOper + '时间限制条件' + expersion + '未解析');
              return current && current < dayjs().endOf('day') && current > dayjs().endOf('day');
          }
        }
      }
    }
    return current && current < dayjs().endOf('day') && current > dayjs().endOf('day');

    //当天之前的不可选，不包括当天
    //return current && current < dayjs().subtract(1, 'day');
    // return current && current <= dayjs().endOf('day'); 当天之前的不可选，包括当天
  };
  const range = (start: number, end: number) => {
    const result: number[] = [];
    for (let i = start; i < end; i++) {
      result.push(i);
    }
    return result;
  };
  const disabledDateTime = () => {
    return {
      disabledHours: () => range(0, 0),
      disabledMinutes: () => range(0, 0),
      disabledSeconds: () => range(0, 0),
    };
  };
  /********************************日期时间型的操作************************************/

  //获取大块文本的说明
  const htmlContent = ref('');
  const safeHtmlContent = computed(() => {
    if (typeof htmlContent.value === 'string') {
      // 将 ^ 替换为 "
      return htmlContent.value.replace(/\^/g, '"');
    }
    return '';
  });
  const GetBigText = async () => {
    const mapExt = new FrmHtml();
    mapExt.setPKVal('HtmlText_' + curMapAttr.value.MyPK);
    const i = await mapExt.RetrieveFromDBSources();
    if (i == 0) {
      htmlContent.value = '';
      return;
    }
    const val = mapExt.HtmlText || '';
    htmlContent.value = val.replace(/~~/g, '"');
  };
  /**
   * 点击超链接时的操作
   * @param curMapAttr
   */
  const handlerLinkClick = (event, mapAttr) => {
    const doc = mapAttr.Tag2;
    curMapAttr.value.Tag = DealExp(doc, rowData.value, false, true);
    if (curMapAttr.value.Tag1 === '_modal') {
      modal.modalVisible = true;
      modal.modalType = 'link';
      modal.componentKey++;
      modal.params.Doc = curMapAttr.value.Tag;
      modal.modalWidth = window.innerWidth * 0.75;
      modal.modalHeight = { height: 'calc(100vh - 60px)' };
      return;
    }
    window.open(curMapAttr.value.Tag, curMapAttr.value.Tag1);
  };

  /**
   * 点击按钮的操作
   * @param curMapAttr
   */
  const handlerBtnClick = async (event, mapAttr) => {
    try {
      if (!!curMapAttr.value.Tag) {
        let doc = DealExp(curMapAttr.value.Tag, rowData.value);
        eval(doc);
      } else {
        if (entityFrm != null) {
          entityFrm.FrmBodyJson = rowData.value;
          await entityFrm.FrmBodyBtnClick(mapAttr.KeyOfEn, '');
        } else await FrmBodyBtnClick.FrmBodyBtnclick(mapAttr.FK_MapData, props.refPKVal, mapAttr.KeyOfEn, rowData.value, baseComponent as any);
      }
    } catch (e) {
      message.error(e as string);
    }
    //执行填充
    await DealMapExtBySelect(false, null);
  };

  /**
   * 获取签字版的图片
   * @param curMapAttr
   * @param value
   * @constructor
   */
  const GetImgSrc = (mapAttr, value) => {
    const prefix = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
    if (value == null || value == undefined || value == '') return prefix + '/DataUser/Siganture/UnName.jpg';
    return prefix + value.substring(value.indexOf('/DataUser'));
  };
  /**
   * 默认图片
   */
  const defaultImg = (e) => {
    const img = e.srcElement;
    const prefix = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
    img.src = prefix + '/DataUser/Siganture/UnName.jpg';
    img.onerror = null;
  };
  /**********************************图片附件******************************************************/
  let basicPath = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
  if (basicPath.endsWith('/')) basicPath = basicPath.slice(0, -1);
  const uploadApi = async (uploadParams) => {
    const { fileSrc } = uploadParams;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddFile(fileSrc);
    handler.AddPara('FK_MapData', curMapAttr.value.FK_MapData);
    handler.AddPara('CtrlID', curMapAttr.value.KeyOfEn);
    handler.AddPara('RefPKVal', props.refPKVal);
    const response = await handler.DoMethodReturnString('FrmImgAthDB_Upload');
    return {
      data: response,
    };
  };
  const GetSignature = computed(() => {
    const mainData = props.mainData || {};
    const mapAttr = props.mapAttr || {};
    let imgSrc = basicPath + '/DataUser/ICON/CCFlow/LogBig.png';
    if (!!mainData[mapAttr?.KeyOfEn]) {
      // const frmImgAths = props.frmData.Sys_FrmImgAth.filter((item) => item.MyPK === curMapAttr.value.MyPK);
      // if (frmImgAths.length > 0) {
      //   //获取数据
      //   if (frmImgAths[0].FK_MapData.startsWith('ND') === true) imgSrc = basicPath + '/DataUser/ImgAth/Data/' + frmImgAths[0].CtrlID + '_' + props.refPKVal + '.png';
      //   else imgSrc = basicPath + '/DataUser/ImgAth/Data/' + frmImgAths[0].FK_MapData + '_' + frmImgAths[0].CtrlID + '_' + props.refPKVal + '.png';
      // }
      imgSrc = basicPath + mainData[mapAttr?.KeyOfEn];
    }
    return imgSrc + '?t=' + Math.random();
  });
  const IconImgErr = () => {
    const avatar = ref<string>('');
    avatar.value = basicPath + '/DataUser/ICON/CCFlow/LogBig.png';
    return avatar.value;
  };
  function updateAvatar({ _src, _data }) {}
  /**********************************图片附件******************************************************/
  /**
   * 弹窗打开签字版
   * @param curMapAttr
   * @param val
   * @constructor
   */
  const DoHandWrite = (mapAttr, val) => {
    const basePath = VITE_GLOB_API_URL.endsWith('/') ? VITE_GLOB_API_URL : VITE_GLOB_API_URL + '/';

    //把路径转base64
    const filePath = basePath + val.substring(val.indexOf('/DataUser'));
    if (val == '') {
      modal.keyOfEn = mapAttr.KeyOfEn;
      modalShow('HandWriting', '签字版', 825);
    } else {
      urlToBase64(filePath).then((base64) => {
        modal.ImgSrc = base64;
        modal.keyOfEn = mapAttr.KeyOfEn;
        modalShow('HandWriting', '签字版', 825);
      });
    }
  };

  const ChangeWriteImg = (val) => {
    rowData.value[modal.keyOfEn] = VITE_GLOB_API_URL + val.substring(val.indexOf('/DataUser'));
    modal.modalVisible = false;
    modal.modalType = '';
    modal.keyOfEn = '';
  };

  /**
   * 字段附件
   * @param curMapAttr
   * @param isReadonly
   * @constructor
   */
  const OpenUploadModal = async (mapAttr, isReadonly) => {
    if (entityFrm != null) {
      entityFrm.FrmBodyJson = rowData.value;
      const result = await entityFrm.FrmAthUploadBefore(mapAttr.KeyOfEn);
      if (typeof result === 'boolean' && result === false) return;
    }
    modal.Ath = mapAttr.ath;
    modal.keyOfEn = mapAttr.KeyOfEn;
    modalShow('Ath', isReadonly ? '查看' : '附件上传', window.innerWidth * 0.7);
  };

  //公文正文
  const fileFink = ref('');
  const handlerGovFile = (event, mapAttr) => {
    fileFink.value = '1234567';
  };
  /**
   * 弹窗打开关联流程单据
   * @param curMapAttr
   * @param val
   * @constructor
   */
  const params = reactive({
    EnName: '',
    FlowNo: '',
    FrmID: '',
    KeyOfEn: '',
    WorkID: '',
  });
  const DoLinkRefFlow = async (mapAttr, _val) => {
    params.WorkID = props.params.WorkID;
    params.EnName = 'GL_LinkRefFlow';
    params.FlowNo = mapAttr.Tag2;
    params.FrmID = mapAttr.FK_MapData;
    params.KeyOfEn = mapAttr.KeyOfEn;
    modalShow('GenerList', '关联流程单据', window.innerWidth * 0.9);
  };
  /**
   * 弹窗打开评论
   * @param curMapAttr
   * @param val
   * @constructor
   */
  const DoreviewBlur = (_mapAttr, _val) => {
    modalShow('FrmBBS', '评论');
  };
  //GenerList关闭弹窗并修改KeyOfEn
  const modalIsShow = async (isShow: boolean, LinkTitle: string) => {
    modal.modalVisible = isShow;
    emit('update-row', curMapAttr.value.KeyOfEn + 'T', LinkTitle, props.rowIdx);
    LinkTitle = LinkTitle.split(',')[0].substring(7);
    emit('update-row', curMapAttr.value.KeyOfEn, LinkTitle, props.rowIdx);
  };
  type DrawerOption = {
    visible: boolean;
    params: Record<string, any>;
    title: string;
    type: string;
  };
  const drawer = reactive<DrawerOption>({
    visible: false,
    params: {},
    title: '',
    type: '',
  });

  const OpenMyView = async (current) => {
    //获取WorkID,FlowNo
    console.log('current', current);
    const linkflowObj = Object.fromEntries(current.value.split('@').map((pair) => pair.split('=')));
    const url = `/src/WF/MyFrm.vue?WorkID=${linkflowObj.WorkID}&FlowNo=${linkflowObj.FK_Flow}&isReadonly=1`;
    baseComponent.value?.openDrawerByUrl(current.label, url, '70%', { isComponent: true, WorkID: linkflowObj.WorkID, FlowNo: linkflowObj.FK_Flow, isReadonly: 1 });
    // drawer.params.FlowNo = linkflowObj.FK_Flow;
    // drawer.params.WorkID = linkflowObj.WorkID;
    // drawer.params.isReadonly = true;
    // drawer.params.isComponent = true;
    // drawer.visible = true;
    // drawer.title = current.label;
    // drawer.type = 'Frm';
  };
  /**
   * 弹窗
   * @param type
   * @param title
   * @param width
   * @param height
   */
  const modalShow = (type: string, title: string, width: number = window.innerWidth * 0.5, height = 400) => {
    modal.modalVisible = true;
    modal.modalType = type;
    modal.modalTitle = title;
    modal.modalWidth = width;
    modal.modalHeight = { height: height + 'px' };
    modal.componentKey++;
  };
  //弹窗点击确定的操作
  // const handlerOK = () => {
  //   modal.modalVisible = false;
  // };
  const refAth = shallowRef<InstanceType<typeof Ath>>();
  //关闭弹窗
  const HandlerCancel = async () => {
    if (modal.modalType === 'Ath') {
      const val = refAth.value?.dbList;
      if (Array.isArray(val) && val.length >= 0) {
        athNum.value = val.length;
        emit('update-row', curMapAttr.value.KeyOfEn, athNum.value, props.rowIdx);
        //执行自定义的方法
        let result;
        if (entityFrm != null) {
          entityFrm.FrmBodyJson = rowData.value;
          result = await entityFrm.FrmBodyItemChange(curMapAttr.value.KeyOfEn, val.length.toString());
        } else result = await FrmBodyItemChange.FrmBodyItemChange(curMapAttr.value.FK_MapData, props.refPKVal, curMapAttr.value.KeyOfEn, val.length.toString(), rowData.value);

        if (!!result && typeof result === 'object') {
          for (const key in result) {
            if (rowData.value[key] != result[key]) emit('update-row', key, result[key], props.rowIdx);
          }
        }
      }
    }
    modal.modalType = '';
    modal.keyOfEn = '';
  };
  /**
   * 发送邮件
   */
  const mailToLink = () => {
    // 设置服务器ID、模版ID等参数
    const serviceId = '';
    const templateId = 'your_template_id';
    const userId = '';
    // 构建邮件内容对象
    const messageData = {
      to_name: '收件人名字',
      to_email: rowData.value[curMapAttr.value.KeyOfEn],
      subject: '邮件主题',
      body: '邮件正文',
    };

    // 发送邮件
    emailjs
      .send(serviceId, templateId, messageData, userId)
      .then(() => {
        console.log('邮件已发送');
      })
      .catch((error) => {
        console.error('发送邮件失败', error);
      });
  };
  const OpenAddr = () => {
    const url = rowData.value[curMapAttr.value.KeyOfEn];
    windowOpen(url);
  };
  //保存审核组件
  const instance = getCurrentInstance();
  const WorkCheckSave = async (isSaveOnly) => {
    let refW = instance?.refs['workCheck'] as InstanceType<typeof WorkCheck>;
    if (!!refW && Array.isArray(refW)) refW = refW[0];
    if (!!refW) {
      return await refW?.WorkCheckSave?.(isSaveOnly);
    }
  };
  const columns = ref<any[]>([]);
  const autoData = ref<any[]>([]);
  const visible = ref(false);
  const computkey = ref(0);
  const dbs = ref<any[]>([]);
  let loaded = false;
  const InitPage = async () => {
    try {
      if (props.isDtl == true && curMapAttr.value.ath != null && curMapAttr.value.ath?.FileType === 1 && props.isReadonly) {
        dbs.value = await GetAthDB();
        return;
      }
      if ([2, 3, 5, 8].includes(curMapAttr.value.MyDataType) && curMapAttr.value.LGType === FieldTypeS.Normal) {
        //获取数值型后缀显示的方式
        const mapexts = curMapAttr.value.mapExts.filter((mapExt) => mapExt.ExtModel === 'FieldInputStyle');
        numInputStyle.value = mapexts.length == 0 ? 0 : parseInt(mapexts[0].DoWay);
        if (!!curMapAttr.value.AtPara) {
          let num = GetPara(curMapAttr.value.AtPara, 'NumMax');
          if (!!num) numMax.value = parseFloat(num);
          num = GetPara(curMapAttr.value.AtPara, 'NumMin');
          if (!!num) numMin.value = parseFloat(num);
          num = GetPara(curMapAttr.value.AtPara, 'NumStepLength');
          if (!!num) step.value = parseFloat(num);
          await NumberORDateChange();
        }

        return;
      }
      if (isTextPopSelect(curMapAttr.value)) {
        if (curMapAttr.value.UIIsEnable == 0 || props.isReadonly == true) {
        } else {
          const mapExt = curMapAttr.value.mapExts.filter((mapExt) => {
            return mapExt['DoWay'] === 'PopBranches';
          })[0];
          curMapAttr.value['mode'] = '';
          if (GetPara(mapExt.AtPara, 'PopSelectType') == '1') {
            curMapAttr.value['mode'] = 'multi';
          }
          const isLazy = GetPara(mapExt.AtPara, 'IsLazy') === '1' ? true : false;
          curMapAttr.value['type'] = '';
          if (isLazy === true) {
            curMapAttr.value['type'] = 'isLazy';
          }
          curMapAttr.value['ShowType'] == 'Tree';
          //获取数据
          //let treeSql = mapExt.Tag2;
          let parentNo = mapExt.Doc;
          if (parentNo.includes('@')) parentNo = DealExp(parentNo, rowData.value);

          //if (treeSql.toLowerCase().includes('@key')) treeSql = treeSql.replace(/@Key/g, parentNo).replace(/@key/g, parentNo);
          //treeSql = DealExp(treeSql, rowData.value);
          //treeSql = DealExp(treeSql, props.data);
          const mypk = 'Frm.' + curMapAttr.value.FK_MapData + '_' + curMapAttr.value.KeyOfEn + '.Pop.TreeDB';
          const data = await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk, { Key: parentNo, OID: props.refPKVal, ...props.rowData });

          const treeData = listToTree(parentNo, data.slice(0, data.length));

          curMapAttr.value['ddl'] = treeData; //treeData;
          let val = rowData.value[curMapAttr.value.KeyOfEn];
          if (val == null) val = [];
          if (typeof val === 'string') {
            if (!!curMapAttr.value['mode']) rowData.value[curMapAttr.value.KeyOfEn] = !val ? [] : val.split(',');
          }
        }
        return;
      }
      //pop弹窗
      if (isTextPop(curMapAttr.value) || isTextSelect(curMapAttr.value)) {
        const no = rowData.value[curMapAttr.value.KeyOfEn] || '';
        const text = rowData.value[curMapAttr.value.KeyOfEn + 'T'] || rowData.value[curMapAttr.value.KeyOfEn] || '';
        curMapAttr.value['eleDBs'] = [];
        if (!!no && !!text) {
          curMapAttr.value['eleDBs'] = text.toString().split(',');
        }
        if (curMapAttr.value.UIIsEnable === 1 && props.isReadonly === false && !!no) {
          let mapExts = curMapAttr.value.mapExts || [];
          mapExts = mapExts.filter((item) => item.ExtModel === 'Pop');
          if (mapExts.length == 1 && parseInt(mapExts[0]['IsLoadFull'] || 1) === 1) {
            if (props.isReload) await ChangeSelect(no, null, true);
          }
          return;
        }
      }
      if (isRelatedDocs(curMapAttr.value)) {
        const no = rowData.value[curMapAttr.value.KeyOfEn] || '';
        const text = rowData.value[curMapAttr.value.KeyOfEn + 'T'] || '';
        curMapAttr.value['eleDBs'] = [];
        if (!!no && !!text) {
          no.split(',').forEach((item, idx) => {
            curMapAttr.value['eleDBs'].push({
              value: item,
              label: text.toString().split(',')[idx],
            });
          });
        }
      }
      //搜索多选
      if (isTextChoiceSearch(curMapAttr.value)) {
        const no = rowData.value[curMapAttr.value.KeyOfEn] || '';
        const text = rowData.value[curMapAttr.value.KeyOfEn + 'T'] || '';
        curMapAttr.value['eleDBs'] = [];

        if (!!no && !!text) {
          no.split(',').forEach((item, idx) => {
            curMapAttr.value['eleDBs'].push({
              value: item,
              label: text.toString().split(',')[idx],
            });
          });
        }
        return;
      }
      //签批字段
      if (isSignCheck(curMapAttr.value) && props.isPageReadonly === false) {
        if (!!nodeInfo) {
          const checkField = nodeInfo.CheckField;
          const keyOfEn = curMapAttr.value.KeyOfEn;

          if (checkField == keyOfEn) {
            const val = rowData.value[keyOfEn];
            if (val.includes(nodeInfo.NodeID + ',') == false) rowData.value[keyOfEn] = val + nodeInfo.NodeID + ',';
          }
        }

        return;
      }
      if (curMapAttr.value.UIIsEnable === 1 && props.isReadonly === false) {
        if (isAutoCompleteSimple(curMapAttr.value) || isAutoCompleteTable(curMapAttr.value)) {
          let mapExts = curMapAttr.value.mapExts || [];
          mapExts = mapExts.filter((item) => item.ExtModel === 'TBFullCtrl' || item.ExtModel === 'DDLFullCtrl');
          if (mapExts.length == 1) {
            const mapExt = mapExts[0];
            if (mapExt.DoWay === 'Table') {
              const tag3 = mapExt.Tag3;
              if (!!tag3) {
                tag3
                  .replace(/，/g, ',')
                  .split(',')
                  .forEach((item) => {
                    const exp = item.split('=');
                    columns.value.push({
                      title: exp.length > 1 ? exp[1] : '',
                      key: exp[0],
                      dataIndex: exp[0],
                    });
                  });
              } else {
                columns.value.push({
                  title: '编号',
                  key: 'No',
                  dataIndex: 'No',
                });
                columns.value.push({
                  title: '名称',
                  key: 'Name',
                  dataIndex: 'Name',
                });
              }
            }
            if (parseInt(mapExts[0]['IsLoadFull'] || 0) === 1 && props.isPageReadonly === false) {
              const val = rowData.value[curMapAttr.value.KeyOfEn];
              const options = curMapAttr.value.ddl === undefined ? null : curMapAttr.value.ddl.filter((item) => item.value === val);
              if (props.isReload) await ChangeSelect(val, options != null && options.length > 0 ? options[0] : null, true);
            }
          }
          return;
        }
        if (isDDL(curMapAttr.value) && props.isPageReadonly === false) {
          const val = rowData.value[curMapAttr.value.KeyOfEn];
          const options = curMapAttr.value.ddl === undefined ? null : curMapAttr.value.ddl.filter((item) => item.value === val);
          if (props.isReload) await ChangeSelect(val, options != null && options.length > 0 ? options[0] : null, true);
          return;
        }
      }
      //判断是不是存在小范围单选，小范围多选
      let data = !curMapAttr.value.mapExts ? [] : curMapAttr.value.mapExts.filter((item) => item.ExtModel === 'MultipleChoiceSmall' || item.ExtModel === 'SingleChoiceSmall');
      if (data.length > 0) {
        const dataSource = await GetDataTableOfTBChoice(data[0], props.refPKVal);
        if (Array.isArray(dataSource)) {
          curMapAttr.value['ddl'] = dataSource;
        }
        curMapAttr.value['type'] = 'cselect';
        curMapAttr.value['mode'] = '';
        if (data[0].ExtModel === 'MultipleChoiceSmall') {
          curMapAttr.value['mode'] = 'multiple';
          const items = !!rowData.value[curMapAttr.value.KeyOfEn] ? rowData.value[curMapAttr.value.KeyOfEn].split(',') : [];
          emit('update-row', curMapAttr.value.KeyOfEn, items, props.rowIdx);
        }
        return;
      }
      if (curMapAttr.value.LGType === FieldTypeS.Enum && curMapAttr.value.UIContralType === UIContralType.CheckBok) {
        return;
      }
      //保密格式
      if (isKeepSecret(curMapAttr.value)) {
        let val = rowData.value[curMapAttr.value.KeyOfEn];
        const mapExts = curMapAttr.value.mapExts;
        mapExts.forEach((mapExt) => {
          if (mapExt?.DoWay === 'IDCard') val = val.substring(0, 3) + '***********' + val.substring(val.length - 2, val.length);
          if (mapExt?.DoWay === 'Tel') val = val.substring(0, 3) + '******' + val.substring(val.length - 3, val.length);
          if (mapExt?.DoWay === 'Bank') val = val.substring(0, 4) + '************' + val.substring(val.length - 4, val.length);
          rowData.value[curMapAttr.value.KeyOfEn + 'T'] = val;
        });
        return;
      }
      if (isCascader(curMapAttr.value) && curMapAttr.value.UIIsEnable == 1 && props.isReadonly == false) {
        options.value = await GetCascaderOption(curMapAttr.value);
        rowData.value[curMapAttr.value.KeyOfEn] = '';
        return;
      }
      //附件数量
      if (curMapAttr.value.UIContralType === 6) {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
        handler.AddJson(props.params);
        handler.AddPara('RefOID', props.refPKVal);
        handler.AddPara('IsReadonly', props.isReadonly);
        handler.AddPara('FK_FrmAttachment', curMapAttr.value.MyPK);
        handler.AddPara('FrmID', curMapAttr.value.FK_MapData);
        const data = await handler.DoMethodReturnString('Ath_Init');
        if (typeof data == 'string' && data.includes('err@') == true) {
          message.error(data.replace('err@', ''));
          return;
        }
        const dbs = data['DBAths'] || [];
        athNum.value = dbs.length;
        emit('update-row', curMapAttr.value.KeyOfEn, athNum.value, props.rowIdx);
        return;
      }
      if (curMapAttr.value.UIContralType === 60) {
        await GetBigText();
        return;
      }
      if (isDateOrDateTime(curMapAttr.value) && props.isReload) {
        await NumberORDateChange();
        return;
      }
    } catch (e: any) {
      console.error('初始化失败 ', ' - attr -  ', curMapAttr.value.KeyOfEn + '错误:' + e.toString());
    } finally {
      loaded = true;
    }
  };

  const customRequest = async (data) => {
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.CCMobile_CCForm');
      handler.AddFile(data.file);
      const result = await handler.DoMethodReturnString('GetIDCardInfo');
      if (result['error_code'] != undefined) {
        message.error('上传身份证解析错误:' + result['error_code'] + result['error_msg']);
      } else {
        const cardNo = curMapAttr.value.KeyOfEn.replace('Address', '');
        rowData.value[curMapAttr.value.KeyOfEn] = result.words_result.住址.words;
        emit('update-row', cardNo, result.words_result.公民身份号码.words, props.rowIdx);
        emit('update-row', cardNo + 'Name', result.words_result.姓名.words, props.rowIdx);
      }
    } catch (e) {
      message.error(e as string);
    }
  };
  onMounted(() => {
    InitPage();
  });

  defineExpose({ WorkCheckSave });
</script>

<style lang="less" scoped>
  .input-tip {
    color: #ff4d4f;
    font-size: 13px;
    margin-top: 2px;
    padding-left: 2px;
    line-height: 1.5;
  }
  .content {
    position: relative;
    .edit-user-info {
      position: absolute;
      z-index: 999;
      right: 0;
      top: -18px;
      width: 100px;
      text-align: right;
      background-color: #1890ff;
      color: white;
      height: 18px;
      line-height: 18px;
    }
  }

  .html-field,
  .html-preview-field {
    :deep(img) {
      max-width: 100%;
    }

    border: 1px solid #d9d9d9;
    border-radius: 6px;
    background-color: rgba(0, 0, 0, 0.04);
    padding: 4px;
  }

  .form-item-mustInput {
    display: inline-block;
    margin-right: 4px;
    color: #ff4d4f;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
  }

  :deep(.ant-input-number-input) {
    text-align: right !important;
  }

  :deep(.ant-input-number) {
    //border-radius: 6px !important;
    min-width: 0px !important;
  }

  :deep(.ant-input-group) {
    //width: 295px;
  }

  :deep(.ant-input) {
    color: rgba(0, 0, 0, 0.88);
  }

  :deep(.ant-picker-input > input[disabled]) {
    color: rgba(0, 0, 0, 0.88);
  }

  :deep(.ant-select-selection-item) {
    color: rgba(0, 0, 0, 0.88);
  }

  :deep(.ant-input-affix-wrapper-disabled) {
    background-color: rgba(0, 0, 0, 0.02);
  }

  .custom-tag {
    display: inline-flex;
    align-items: center;
    max-width: 150px;
  }

  .custom-tag :deep(.ant-tag-close-icon) {
    margin-left: 4px;
    flex-shrink: 0;
    opacity: 1;
    visibility: visible;
  }
  .tag-content {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 150px;
    display: inline-block;
  }

  .btnSetting {
    padding: 0;
    width: 100%;
    height: 100%;
    border: 0;
    background-color: #fafafa;
  }

  .pop_intput_div {
    overflow: hidden;
    line-height: 32px;
    min-height: 32px;
    /*height: auto;*/
    width: calc(100% - 46px);
    border: 1px solid #ccc;
  }

  .input-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .action-link {
    position: absolute;
    right: 0;
    bottom: -8px;
    display: flex;
    align-items: center;
    padding-left: 8px;
    /* 根据需要调整 */
  }
  .link_flow {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .action-link a {
    text-decoration: none;
    color: #1890ff;
    /* 链接颜色 */
  }

  :deep(#FlowRefLink) {
    color: #1890f1;
  }

  .controls {
    display: flex;
    flex-direction: column;
    margin-left: 4px;
  }

  .control-btn {
    height: 20px;
    padding: 0 4px;
    line-height: 1;
  }
</style>
