<template>
   <div class="container">
    <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
      <el-tab-pane label="步骤信息" name="0" style="height:62vh;padding: 0 10px; overflow-y: auto;">
             <el-form ref="form" :model="form" :rules="rules" label-width="80px" class="detailForm" style="margin-top: 15px;width: 100%;padding: 20px 20px 20px 0">
<!--            <el-form-item label="条码" prop="barcode">-->
<!--              <el-input v-model="form.barcode" placeholder="请输入条码" />-->
<!--            </el-form-item>-->
<!--            <el-form-item label="步骤id" prop="stepId">-->
<!--              <el-input v-model="form.stepId" placeholder="请输入步骤id" />-->
<!--            </el-form-item>-->
            <!-- <el-form-item label="序号" prop="stepOrder">
              <el-input v-model="form.stepOrder" placeholder="请输入序号" />
            </el-form-item> -->
            <el-form-item label="步骤名称" prop="stepName">
              <el-input v-model="form.stepName" placeholder="请输入步骤名称" readonly/>
            </el-form-item>

            <el-form-item label="描述" prop="description">
              <!-- <el-input v-model="form.description" placeholder="请输入描述" /> -->
               <!-- <div @click="handleClick" v-html="highlightedText(form.description)"></div> -->
                <div v-html="highlightedText(form.description)" @dblclick="handleDoubleClick"></div>
               <el-input ref="editInput" v-if="isEditing" v-model="editingText" @blur="(e) => { saveEdit(e, 'blur'); }" @keydown.enter.native="handleEnterKey" name="editInput" autofocus :autosize="{ minRows: 1, maxRows: 4 }"/>
              <!-- <span>{{ form.description }}</span> -->
            </el-form-item>
            <el-form-item v-if="form.deviceSelect == 1" label="设备" prop="deviceSelect">
                <!-- <el-input v-model="form.deviceSelect" placeholder="请输入设备 是否" /> -->
                <el-select v-model="form.deviceValue" multiple filterable placeholder="请选择" style="width: 100%;">
                    <el-option
                    v-for="item in deviceOptions"
                    :key="item.id"
                    :label="item.assetName"
                    :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
            <el-form-item v-if="form.reagentSelect == 1" label="试剂" prop="reagentSelect">
                <el-select v-model="form.reagentValue" multiple filterable placeholder="请选择" style="width: 100%;">
                    <el-option
                    v-for="item in reagentOptions"
                    :key="item.id"
                    :label="item.tagName"
                    :value="item.id">
                    </el-option>
                </el-select>
            </el-form-item>
             <el-form-item v-if="form.conclusionSelect == 1" label="结论" prop="conclusion" >
                <el-input v-if="form.conclusionType == 1" v-model="form.conclusion" placeholder="请输入结论" />
                <el-input v-if="form.conclusionType == 2" type="textarea" :rows="4" v-model="form.conclusion" placeholder="请输入结论" />
                <el-select v-if="form.conclusionType == 3" v-model="form.conclusion" placeholder="请选择结论">
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item v-if="form.table1Select == 1" label="表格" prop="table1" >
              <el-button type="primary" size="mini" @click="tableEdit">表格编辑</el-button>
            </el-form-item>
            <el-form-item v-if="form.table2Select == 1" label="表格明细" prop="table2" >
             <el-input v-model="form.table2" placeholder="请输入表格明细录入" />
            </el-form-item>
            <el-form-item label="操作人"  >
             <template>
              <span>{{ 'admin' }}</span>
             </template>
            </el-form-item>
            <el-form-item  label="协同人" >
                <el-select v-model="collaboraValue" placeholder="请选择">
                    <el-option
                    v-for="item in collaborativeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value">
                    </el-option>
                </el-select>
            </el-form-item>
            <!-- <el-form-item style="margin-left: 32px;" label-width="auto" label="距上一步最小时间间隔(小时)" prop="">
                <el-input-number v-model="form.aa1" style="margin-left: 10px" size="mini" :min="1" :step="0.1" ></el-input-number>
            </el-form-item>
            <el-form-item style="margin-left: 32px;" label-width="auto" label="距上一步最大时间间隔(小时)" prop="">
                <el-input-number v-model="form.bb1" style="margin-left: 10px" size="mini" :min="1" :step="0.1" ></el-input-number>
            </el-form-item> -->
            <!-- <el-form-item v-if="form.necessary1 == 1" label="" prop="">
              <el-checkbox v-model="form.necessary3" :true-label="1" :false-label="0" style="margin-left: -65px;">该步骤必填</el-checkbox>
            </el-form-item> -->

            <!-- <el-form-item v-if="form.necessary2 == 1" label="" prop="">
                <el-checkbox v-model="form.necessary4" :true-label="1" :false-label="0" style="margin-left: -65px;">上步如果是阳性，该步骤必填</el-checkbox>
            </el-form-item> -->
          </el-form>
      </el-tab-pane>
      <el-tab-pane label="培养信息" name="1" style="height:400px;overflow-y: auto;" v-if="typeValue==1">
        <el-card class="box-card" shadow="never" style="margin-bottom: 10px;">
          <el-row>
            <el-col :span="12" style="display: flex;align-items: center;">
              <span style="font-size: 16px;margin-right: 5px;">设备码:</span> <el-input style="width: 70%;" placeholder="请扫描设备码" />
            </el-col>
             <el-col :span="12" style="display: flex;align-items: center;">
             <span style="font-size: 16px;margin-right: 5px;">样品码:</span> <el-input style="width: 70%;" placeholder="请扫描样品码" />
            </el-col>
          </el-row>
        </el-card>
        <el-card class="box-card" shadow="never" style="padding: 0 2px;height: 300px;">
        <vxe-table :page-show="false" @toolbarButtonClickEvent="toolbarButtonClickEvent"  :table-config="tableConfig" :table-data="tableData">

                        <template #region_edit="{ row }">
                            <vxe-tree-select v-model="row.deviceSelect" :options="regionOptions">
                            </vxe-tree-select>
                        </template>
                        <template #region_default="{ row }">
                            <el-tag v-if="formatSexLabel([row.deviceSelect],regionOptions )=='进'">{{ formatSexLabel([row.deviceSelect],regionOptions )}}</el-tag>
                            <el-tag type="success" v-if="formatSexLabel([row.deviceSelect],regionOptions )=='出'">{{ formatSexLabel([row.deviceSelect],regionOptions )}}</el-tag>
                        </template>
                    </vxe-table>
                    </el-card>
      </el-tab-pane>
    </el-tabs>

          <!-- <el-drawer
          :title="tableEditTitle"
          :visible.sync="tableEdit"
          direction="rtl"
          size="65%">
          <luckySheet ref="luckySheet"></luckySheet>
        </el-drawer> -->
        <luckySheet ref="luckySheet" @saveLists = "getsaveList"></luckySheet>
   </div>
 </template>

<script>
// import luckySheet from"@/views/cdc/luckySheet/luckySheetOnLine";
import vxeTable from "/@/views/hsw/components/vxeTable/index.vue"
import luckySheet from"/@/views/hsw/cdc/luckySheet/luckySheet.vue"
import {queryDeviceInfoManage} from "/@/api/hsw/cdc/device/deviceInfo.js";
import {getReagent} from "/src/api/hsw/cdc/testMethod/cdcBatch.js";
export default {
    props: {
        value: {
            type: Object,
            required: true
        },
        rules: {
            type: Object,
            default: () => ({})
        },
        typeValue:{
          type: Number,
          default: 0
        }

    },
    components:{luckySheet,vxeTable},
  data() {
    return {
        activeName:'0',
        //协同人临时
        collaboraValue:'1',
        //表格标题
        tableEditTitle:" ",
        value:{},
        //是否打开表格
        // tableEdit:false,
        // 表单参数
        // form: JSON.parse(JSON.stringify(this.value)),
        //结论
        options: [{
          value: '1',
          label: '有可疑菌落生长'
        }, {
          value: '2',
          label: '无可疑菌落生长'
        }],
        //选中设备
        deviceValue:[],
        //设备
        deviceOptions:[{
          value: '1',
          label: '采血器'
        }, {
          value: '2',
          label: 'PAD'
        }, {
          value: '3',
          label: '无菌接管机'
        }
        ],
        //选中试剂
        reagentValue:[],
        //试剂
        reagentOptions:[{
          value: '1',
          label: '乳糖胆盐肉汤'
        }, {
          value: '2',
          label: '乳糖胆盐肉汤'
        }
        ],
        //协同人
        collaborativeOptions:[
          {
            value: '1',
            label: '张三'
          },
          {
            value: '2',
            label: '李四'
          }
        ],

        //下拉数据
            regionOptions:[
                {
                    label:'进',
                    value:'0',
                },
                {
                    label:'出',
                    value:'1',
                }
            ],
        //表格保存
        saveList:null,
        /**
         * 是否处于编辑状态
         * @type {boolean}
         * @default false
         */
        isEditing: false,
        /**
         * 当前编辑的文本内容
         * @type {string}
         * @default ''
         */
        editingText: '',
        /**
         * 当前编辑的高亮文本索引
         * @type {number}
         * @default -1
         */
        editingIndex: -1,
        /**
         * 原始文本内容，用于编辑对比
         * @type {string}
         * @default ''
         */
        originalContent: '',
        tableData:[
                {
                    user1: '001-1',
                    creatTime: '2025-7-4 12:20:30',
                    deviceSelect: '0',
                    reagentSelect: '培养箱',
                    description: '张三',
                },
                {
                    user1: '001-2',
                    creatTime: '2025-7-5 12:40:30',
                    deviceSelect: '1',
                    reagentSelect: '培养箱',
                    description: '赵四',
                },
            ],
          //培养信息
            tableConfig: {
                columns: [
                    { type: 'seq', width: 70,title: '序号' },

                    { field: 'user1', title: '样品号', showOverflow: true, showHeaderOverflow: true, sortable: true },
                    { field: 'creatTime', title: '时间', showOverflow: true, showHeaderOverflow: true, sortable: true,with:200 },
                    { field: 'deviceSelect', title: '类型', showOverflow: true, showHeaderOverflow: true, sortable: true,editRender: {}, slots: { edit: 'region_edit', default: 'region_default' } },
                    { field: 'reagentSelect', title: '设备', showOverflow: true, showHeaderOverflow: true, sortable: true,  },
                    { field: 'description', title: '操作人', showOverflow: true, showHeaderOverflow: true, sortable: true },
                ],
                props: {
                    id: 'testMethod_cdcBatch_stepInformation',
                    border: true,
                    stripe: true,
                    height: '100%',
                    size: 'mini',
                    showAll: true,
                    editConfig: {
                        trigger: 'click',
                        mode: 'row'
                    },
                    //头部工具
                    toolbarConfig: {
                        custom: true,
                        immediate:true,
                        zoom: true,//最大化
                        print: true,//打印
                        buttons: [
                            { name: '新增', code: 'myAdd', status: 'primary', click: 'handleAddClick' },
                        ]
                    },
                    //右键菜单
                    // menuConfig: {

                    //     body: {
                    //         options: [
                    //             [
                    //                 { code: 'custom3', name: '新增', prefixConfig: { icon: 'vxe-icon-add' }, click: 'handleAddClick' },
                    //                 { code: 'custom4', name: '编辑', prefixConfig: { icon: 'vxe-icon-edit' }, click: 'handleRowClick' },
                    //                 { code: 'custom4', name: '删除', prefixConfig: { icon: 'vxe-icon-delete' }, click: 'handleDelete' }
                    //             ],

                    //         ]
                    //     },

                    // },
                }
            },
    };
  },

  watch: {
    value: {
      handler(newVal) {
        this.form = JSON.parse(JSON.stringify(newVal))
        console.log(this.form,'009aaa')
      },
      immediate:true,
      deep: true
    }
  },
  mounted() {
    this.getDeviceList();
    this.getReagentList();
    // this.$nextTick(() => {
    //   const spans = this.$refs.content.querySelectorAll('.highlight')
    //   spans.forEach(span => {
    //     span.addEventListener('click', this.handleClick)
    //   })
    // })
  },
  methods: {
    //表格按钮
        toolbarButtonClickEvent (params) {
          console.log(params,'表格按钮-----')
          if(params.code == 'myAdd'){
            this.handleAddClick()
          }
        },
    handleAddClick() {
            // 新增按钮点击事件
            // this.tableData.unshift({
            //     user1: '',
            //     creatTime: '',
            //     deviceSelect: '',
            //     reagentSelect: '',
            //     description: '',
            // })
        },
    //双向绑定通信
    updateParent() {
      this.$emit('input', { ...this.form })
    },
    // 表单重置
      reset() {
        this.form = {
          id: undefined,
          batchNumber: undefined,
          status: "0",
          createdUser: undefined,
          createdTime: undefined,
          receiveUser: undefined,
          receiveTime: undefined,
          remark: undefined,
          stepName:undefined,
        };
        this.resetForm("form");
      },
    /**
     * 处理文本高亮显示
     * 将文本中的${...}格式内容替换为高亮span元素
     * @param {string} row - 原始文本内容
     * @returns {string} 处理后的HTML字符串
     */
    highlightedText(row) {
      if(row){
        let matchIndex = 0;
        return row.replace(
        /\$\{(.*?)\}/g,
        (match, content) => {
          const currentIndex = matchIndex++;
          if (this.isEditing && currentIndex === this.editingIndex) {
            return '';
          }
          return `<input type="text" style="width: ${(this.filterText(content).length + 1) * 15}px; min-width: 20px; margin: 0px 10px; padding: 0 3px" class="highlight dynamic-width-input" data-content="${content}" data-index="${currentIndex}" value="${this.filterText(content=='单位'?'ml':'20')}" oninput="this.style.width = (this.value.length + 1) * 15 + 'px'">`;
        }
      );
      } else {
        return '无';
      }
    },
    /**
     * 开始编辑高亮文本
     * @param {string} content - 原始文本内容
     * @param {number} index - 高亮文本索引
     */
    startEdit(content, index) {
        console.log('开始编辑 - 原始内容:', content);
      console.log(content,index,'hhhaa')
      this.originalContent = content;
      this.isEditing = true;
      this.editingText = content;
      this.editingIndex = index;
      this.$nextTick(() => {
        if (this.$refs.editInput) {
          this.$refs.editInput.focus();
        }
      });
    },
    /**
     * 处理回车键保存编辑
     * @param {Event} e - 键盘事件对象
     */
    handleEnterKey(e) {
        console.log('[输入框] 回车事件触发，直接调用保存方法');
        e.preventDefault();
        e.stopPropagation();
        this.saveEdit(e, 'keydown');
      },
      /**
       * 处理点击空白区域保存编辑
       * @param {Event} event - 鼠标事件对象
       */
      handleClickOutside(event) {
        const input = this.$refs.editInput;
        // 检查点击是否在输入框外部
        if (input && !input.$el.contains(event.target) && (!input.input || !input.input.contains(event.target))) {
          console.log('[编辑流程] 点击空白区域，触发保存');
          this.saveEdit(event, 'clickoutside');
        }
      },
      /**
       * 处理双击事件，进入编辑模式
       * @param {Event} event - 鼠标事件对象
       */
      handleDoubleClick(event) {
        console.log('[编辑流程] 双击事件触发，准备进入编辑模式');
        this.$nextTick(() => {
          const input = this.$refs.editInput;
          if (input) {
            // 强制聚焦并验证
            input.focus();
            const focused = document.activeElement === input.$el || document.activeElement === input.input;
            console.log('[编辑流程] 输入框是否获得焦点:', focused);
            if (!focused) {
              console.warn('[编辑流程] 输入框聚焦失败，尝试延迟聚焦');
              setTimeout(() => input.focus(), 100);
            }
            // 添加点击空白区域保存事件
            setTimeout(() => {
              document.addEventListener('click', this.handleClickOutside);
            }, 100);
          }
        });
        const target = event.target.closest('.highlight');
        if (target) {
        const content = target.dataset.content;
        const index = parseInt(target.dataset.index);
        this.startEdit(content, index);
      }
    },
    /**
     * 保存编辑内容
     * @param {Event} e - 事件对象
     * @param {string} source - 触发保存的来源（'blur'|'keydown'|'clickoutside'）
     */
    saveEdit(e, source) {
        console.log('[保存流程] saveEdit方法被调用，触发来源:', source || '未知', '事件对象类型:', typeof e);
        // 移除点击空白区域保存事件
        document.removeEventListener('click', this.handleClickOutside);
        console.log('[保存流程] 事件对象是否存在:', !!e);
        if (e) {
          console.log('[保存流程] 事件类型:', e.type, '事件来源:', e.target ? e.target.tagName : '未知');
          console.log('[保存流程] 按键信息:', e.key ? `key=${e.key}, code=${e.code}` : '非键盘事件');
          // 安全地阻止事件冒泡和默认行为
          try {
            if (typeof e.stopPropagation === 'function') e.stopPropagation();
            if (typeof e.preventDefault === 'function') e.preventDefault();
          } catch (err) {
            console.error('[保存流程] 阻止事件行为失败:', err.message);
          }
        } else {
          console.warn('[保存流程] 未接收到事件对象');
        }
        try {
          console.log('[保存流程] 当前编辑值:', this.editingText);
            console.log('[保存流程] 原始值:', this.originalContent);
            // 验证编辑内容是否存在
            if (this.editingText === undefined || this.originalContent === undefined) {
              console.error('[保存流程] 编辑内容或原始值未定义');
              this.isEditing = false;
              return;
            }
            // 验证内容是否有变化
            if (this.editingText === this.originalContent) {
            console.log('[保存流程] 内容未变化，无需保存');
            this.isEditing = false;
            return;
          }
          // 验证是否从回车事件触发
          if (e && e.type === 'keydown' && (e.key === 'Enter' || e.keyCode === 13)) {
            console.log('[保存流程] 确认从回车事件触发保存');
          }
          // 原有保存逻辑
        console.log('保存编辑 - originalContent:', this.originalContent, 'editingText:', this.editingText);
          if (this.isEditing) {
            // 直接替换原始内容为编辑值
            // 恢复正则表达式转义处理以支持特殊字符
            // 基于位置索引替换指定高亮文本
              let count = -1;
               this.form.description = this.form.description.replace(
                  /\$\{(.*?)\}/g,
                  (match, content) => {
                    count++;
                    if (count === this.editingIndex) {
                      return `\${${this.editingText}}`;
                    }
                    return match;
                  }
                );

            this.isEditing = false;
            this.editingText = '';
            this.editingIndex = -1;
            console.log('[保存流程] 准备调用updateParent更新父组件');
            try {
              this.updateParent();
              console.log('[保存流程] updateParent调用成功');
            } catch (err) {
              console.error('[保存流程] updateParent调用失败:', err.message, '堆栈:', err.stack);
              throw err; // 继续抛出错误以触发上层catch
            }
            console.log('[保存流程] 数据更新成功并通知父组件，新值:', this.form.description);
            // 显示保存成功提示
            if (this.$message) {
              this.$message.success('内容已成功保存');
            } else {
              console.log('[保存流程] 提示: 内容已成功保存');
            }
            console.log('[保存流程] 保存流程已完成');
          }
          console.log('[保存流程] saveEdit方法执行完成');
        } catch (error) {
              console.error('[保存流程] 保存失败:', error.message, '堆栈:', error.stack);
              if (this.$message) {
                this.$message.error('保存失败: ' + error.message);
              }
        }
    },
    //过滤展示数字
    filterText(row){
        console.log(row)
        return row
    },

    //表格保存数据
      getsaveList(row){
        // console.log(row,'父组件赋值-----1111')
        this.saveList = row
      },
    //表格编辑
      tableEdit(){
        this.$refs.luckySheet.tableOpen = true;
        if(this.saveList){
          this.$refs.luckySheet.excelFeedback(this.saveList)
        }

      },
      //数据回显
      formatSexLabel(values, options) {
            if (!values || !values.length) return '';
            const value = values[0];
            const option = options.find(item => item.value === value);
            return option ? option.label : '';
        },
      //tab切换
      handleClick(tab) {
        console.log('切换到标签页:', tab);
      },
      //设备资产列表
      getDeviceList(){
        let query = {
          pageNum: 1,
          pageSize: 1008611,
        };
        queryDeviceInfoManage(query).then((response) => {
          this.deviceOptions = response.rows;
        });
      },
      getReagentList(){
        getReagent().then((response) => {
          this.reagentOptions = response.data;
        });
      },

  },
};
</script>

<style lang="scss" scoped>
 ::v-deep .el-dialog .el-dialog__body .detailForm {
    background-color: #E7F0FF;
  }
</style>
<style scoped lang="scss">
.highlight {
  color: #ff0000; /* 红色 */
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  text-align: center;
}
::v-deep.el-tabs__item {
	/* 修改为您想要的文字大小 */
    font-size: 18px!important;
    font-weight: 600;
}
::v-deep.el-card__body{
  height: 100%;
}

</style>
<style>
.highlight {
  color: #ff0000; /* 红色 */
  cursor: pointer;
  font-weight: bold;
  font-size: 14px;
  text-align: center;
}
</style>
