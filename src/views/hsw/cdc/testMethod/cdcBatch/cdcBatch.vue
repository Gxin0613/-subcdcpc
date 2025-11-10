<!--试验记录-->
<template>
  <div class="app-container">
    <!--      <el-button size="mini" type="primary" icon="el-icon-printer" v-hasPermi="['cdc:step:remove']">打印记录单-->
    <!--      </el-button>-->
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="批次状态" prop="batchstatus">
        <el-select v-model="batchstatus" placeholder="请选择批次状态" clearable size="default" @change="handleGetBatchChange" style="width: 100px">
          <el-option v-for="dict in testStatusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item label="实验批次" prop="receiveBatchNextId">
        <el-select v-model="queryParams.receiveBatchNextId" placeholder="请选择实验批次" clearable size="default" @change="handleQuery" style="width: 150px">
          <el-option v-for="dict in batchNumList" :key="dict.id" :label="dict.nextNo" :value="dict.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="标本状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择标本状态" clearable size="default" @change="handleQuery" style="width: 100px">
          <el-option v-for="dict in testStatusOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button size="default" type="primary" @click="handleQuery">查询 </el-button>
      </el-form-item>
      <el-form-item>
        <el-button size="default" type="primary" @click="handlePrint">打印试验记录</el-button>
      </el-form-item>
    </el-form>

    <div style="display: flex; justify-items: center; height: 100%">
      <div class="divtitle" style="height: 72vh; width: 15%">
        <div style="font-size: 18px; font-weight: 600; margin-top: 5px">标本信息</div>
        <el-table
          v-loading="loading"
          :data="sampleList"
          @selection-change="handleSelectionChangeOne"
          style="width: 100%"
          height="66vh"
          size="mini"
          :row-style="selectedstyle"
          @row-click="rowclick"
          :row-class-name="tableRowClassName"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="No." align="left" type="index" :index="indexMethod" />
          <el-table-column label="标本号" align="left" prop="sampleNo" />
        </el-table>
      </div>
      <div class="divtitle" style="height: 72vh; width: 40%; margin: 8px 10px">
        <div style="font-size: 18px; font-weight: 600; margin-top: 5px"
        >项目信息
          <el-button type="primary" @click="print1" size="small" style="margin-left: 20px">打印条码</el-button>
          <el-button type="primary" @click="print2" size="small">打印二维码</el-button>
        </div>
        <el-table v-loading="loading" :data="methodList" @selection-change="handleSelectionChange" ref="table" style="width: 100%" size="default" height="66vh">
          <!--            <el-table-column label="id" align="left" prop="id" />-->
          <el-table-column label="" align="left" class-name="small-padding fixed-width">
            <!-- 展开行图标 -->
            <template #default="scope">
              <!-- icon="el-icon-plus" -->
              <el-button v-show="!scope.row.expansion" size="default" type="text" @click="expend(scope.row)">展开</el-button>
              <!-- icon="el-icon-minus" -->
              <el-button v-show="scope.row.expansion" size="default" type="text" @click="expend(scope.row)">收起</el-button>
            </template>
          </el-table-column>
          <!-- 步骤 -->
          <el-table-column type="expand">
            <template #default="props">
              <el-table
                v-loading="loading"
                :data="recordList"
                @selection-change="handleSelectionChange"
                size="default"
                height="45vh"
                :row-style="selectedstyle1"
                @row-click="rowclick1"
                ref="table1"
                :row-class-name="tableRowClassName"
              >
                <el-table-column label="" align="center" class-name="small-padding fixed-width" width="40px">
                  <!-- 展开行图标 -->
                  <template #default="scope">
                    <!-- icon="el-icon-plus" -->
                    <el-button v-show="!scope.row.expansion" size="default" type="text" @click="expend1(scope.row)">展开</el-button>
                    <!-- icon="el-icon-minus" -->
                    <el-button v-show="scope.row.expansion" size="default" type="text" @click="expend1(scope.row)">收起</el-button>
                  </template>
                </el-table-column>
                <el-table-column type="expand">
                  <template #default="props">
                    <el-table
                      v-loading="loading"
                      border
                      :data="sampleOtherList"
                      @selection-change="handleSelectionChange"
                      size="default"
                      height="30vh"
                      :row-style="selectedstyle1"
                      @row-click="rowclick1"
                      :row-class-name="tableRowClassName"
                    >
                      <el-table-column type="selection" />
                      <el-table-column label="序号" type="index" align="left" />
                      <el-table-column label="样本编号" align="left" prop="name" />
                      <el-table-column label="操作" align="left" class-name="small-padding fixed-width">
                        <template #default="scope">
                          <el-button size="default" type="text" icon="el-icon-delete" @click="handleSampleOrderDelete(scope.row)">删除</el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                  </template>
                </el-table-column>

                <el-table-column label="序号" type="index" align="left" />
                <el-table-column label="步骤名称" align="left" prop="stepName" />
                <!-- <el-table-column label="描述" align="left" prop="description" /> -->
                <el-table-column label="状态" align="left" prop="status">
                  <template #default="scope">
                    <el-tag :type="getStatusTagType(scope.row.status)">
                      {{ getStatusLabel(scope.row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作人" align="left" class-name="small-padding fixed-width">
                  <template #default="scope">
                    {{ 'admin' }}
                    <!-- <el-button
                        size="mini"
                        type="text"
                        icon="el-icon-edit"
                        @click="handleUpdate(scope.row)"
                        v-hasPermi="['cdc:step:edit']"
                      >修改
                      </el-button> -->
                    <!-- <el-button
                        size="mini"
                        type="text"
                        icon="el-icon-delete"
                        @click="handleDelete(scope.row)"
                        v-hasPermi="['cdc:step:remove']"
                      >删除
                      </el-button> -->
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="left" class-name="small-padding fixed-width">
                  <template #default="scope">
                    <el-button size="mini" type="text" icon="el-icon-edit" @click="handleSampleOrder(scope.row)">标本分配</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </el-table-column>
          <!--            <el-table-column label="标本id" align="left" prop="sampleId" />-->
          <!--            <el-table-column label="方法id" align="left" prop="methodId" />-->
          <el-table-column label="项目名称" align="left" prop="name" show-overflow-tooltip />
          <!--            <el-table-column label="当前试验步骤" align="left" prop="currentStep" />-->
          <el-table-column label="标本试验状态" align="left" prop="status">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)"> {{ getStatusLabel(scope.row.status) }}</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="divtitle" style="width: 45%; height: 72vh; overflow-y: auto; padding: 0">
        <StepInformation v-model="stepFormData" :typeValue="typeValue" :rules="stepRules" />
      </div>
    </div>

    <!--    标本分配-->
    <el-dialog title="标本分配" v-model:visible="otherOpen" width="550px" :close-on-click-modal="false">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="样本编号" prop="reportName">
          <el-select v-model="form.reportName" placeholder="请输入选择编号" clearable multiple style="width: 100%">
            <el-option v-for="item in optionsList" :key="item.name" :label="item.name" :value="item.name" />
          </el-select>
        </el-form-item>
        <el-form-item label="数量" prop="num">
          <el-input v-model="form.num" placeholder="请输入数量" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="otherOpen = false" size="mini">取 消</el-button>
        <el-button type="primary" @click="submitOther" size="mini">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  listBatch,
  getBatch,
  delBatch,
  addBatch,
  updateBatch,
  exportBatch,
  importTemplate,
  getRecord,
  getAllocatedBatch,
  getSampleList,
  getSampleInfo,
  getMethodStep,
} from '/src/api/hsw/cdc/testMethod/cdcBatch.js';
// import { getToken } from "@/utils/auth";
//exce在线编辑
import StepInformation from './components/stepInformation/index.vue';
import { getDicts } from '/@/api/hsw/cdc/system/dict/data';
export default {
  name: 'Batch',
  components: { StepInformation },
  data() {
    return {
      // 遮罩层
      loading: false,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      sampleOtherList: [],
      otherOpen: false,
      /** 样本多选信息 */
      // 选中数组
      idsOne: [],
      // 非单个禁用
      singleOne: true,
      // 非多个禁用
      multipleOne: true,
      sampleOpen: false,
      typeValue: 0,
      // 总条数
      total: 0,
      // 【请填写功能名称】表格数据
      //批次列表
      batchNumList: [],
      batchList: [
        // { id: 1, batchNumber: "001", status: "未完成", createdUser: "张三", createdTime: "1840-08-15", remark: "备注" },
        // { id: 2, batchNumber: "002", status: "未完成", createdUser: "李四", createdTime: "1845-08-15", remark: "备注" }
      ],
      statusOptions: [],
      batchstatus: 0,
      testStatusOptions: [
        { dictLabel: '未开始', dictValue: 0 },
        { dictLabel: '实验中', dictValue: 1 },
        { dictLabel: '已完成', dictValue: 2 },
      ],
      sampleList: [
        // { sampleNo: "001", sampleId: 1 },
        // { sampleNo: "002", sampleId: 2 }
      ], //样本
      methodList: [],
      recordList: [],
      itemRow: undefined,
      // 弹出层标题
      title: '',
      // 是否显示弹出层
      open: false,
      getIndex: undefined,
      getItemIndex: undefined,
      row: undefined,
      stepRow: undefined,
      optionsList: [],
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        batchNumber: '',
        status: '',
        createdUser: '',
        createdTime: '',
        receiveUser: '',
        receiveTime: '',
        sampleBatch: '',
        reportName: '',
        receiveBatchNextId: '',
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        batchNumber: [{ required: true, message: '批次号不能为空', trigger: 'blur' }],
      },
      //试验步骤展示表单
      stepFormData: {},
      // 试验步骤表单校验
      stepRules: {
        batchNumber: [{ required: true, message: '批次号不能为空', trigger: 'blur' }],
      },
      //  【请填写功能名称】导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: '',
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        // headers: { Authorization: "Bearer " + getToken() },
        // 上传的地址
        // url: process.env.VUE_APP_BASE_API + "/app/batch/importData"
      },
    };
  },
  created() {
    this.getList();
    getDicts('batch_status').then((res) => {
      this.statusOptions = res.data;
    });
    this.handleGetBatch();
  },
  methods: {
    /** 查询【请填写功能名称】列表 */
    getList() {
      this.loading = true;
      getSampleList(this.queryParams).then((res) => {
        this.sampleList = res.data;
        this.loading = false;
      });
    },
    handleGetBatch() {
      let queryParams = {
        status: this.batchstatus,
      };
      getAllocatedBatch(queryParams).then((response) => {
        this.batchNumList = response.data;
      });
    },
    handleGetBatchChange() {
      this.batchNumList = [];
      if (this.batchstatus === null || this.batchstatus === undefined || this.batchstatus === '') {
        return;
      }
      this.handleGetBatch();
    },
    getSampleInfo(id) {
      getSampleInfo(id).then((res) => {
        this.methodList = res.data.methodList;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: undefined,
        batchNumber: undefined,
        status: '0',
        createdUser: undefined,
        createdTime: undefined,
        receiveUser: undefined,
        receiveTime: undefined,
        remark: undefined,
        stepName: undefined,
        reportName: undefined,
        num: 1,
      };
      this.resetForm('form');
    },

    /** 自定义编号 */
    indexMethod(index) {
      return index + 1;
    },

    //更改展开行图标，从">"改成展开、收起
    expend(row) {
      this.itemRow = row;
      if (row != undefined) {
        let $table = this.$refs.table;
        this.methodList.map((item) => {
          if (row.id != item.id) {
            $table.toggleRowExpansion(item, false);
            item.expansion = false;
          }
        });
        row.expansion = !row.expansion;
        $table.toggleRowExpansion(row, row.expansion);
        if (row.expansion) {
          let queryParams = {};
          let methodId = row.id;
          let sampleId = this.row.sampleId;
          queryParams.methodId = methodId;
          queryParams.sampleId = sampleId;
          getMethodStep(queryParams).then((res) => {
            this.recordList = [...res.data.map((o) => ({ ...o, expansion: false }))];
          });
        } else {
          this.recordList = [];
        }
      }
    },

    expend1(row) {
      if (row != undefined) {
        let $table = this.$refs.table1;
        this.recordList.map((item) => {
          if (row.id != item.id) {
            $table.toggleRowExpansion(item, false);
            item.expansion = false;
          }
        });
        row.expansion = !row.expansion;
        $table.toggleRowExpansion(row, row.expansion);
        let no = this.row.sampleNo;
        if (row.expansion) {
          if (this.itemRow.name == '大肠菌群' && row.stepName == '复发酵试验') {
            this.sampleOtherList = [];
          } else {
            this.sampleOtherList = [
              ...[
                { id: 6, name: no + '-01', status: '已完成', type: 0 },
                { id: 7, name: no + '-02', status: '已完成', type: 0 },
                { id: 8, name: no + '-03', status: '已完成', type: 0 },
                { id: 9, name: no + '-04', status: '已完成', type: 0 },
                { id: 10, name: no + '-05', status: '已完成', type: 0 },
                { id: 10, name: no + '-06', status: '已完成', type: 0 },
              ],
            ];
          }
        } else {
          this.sampleOtherList = [];
        }
      }
    },
    print1() {
      window.open('http://127.0.0.1:8098/filepath/2507G10211.jpg', '_blank');
    },
    print2() {
      window.open('http://127.0.0.1:8098/filepath/2507G10212.jpg', '_blank');
    },
    //标本分配
    handleSampleOrder(row) {
      let $table = this.$refs.table1;
      if (!row.expansion) {
        this.recordList.map((item) => {
          if (row.id != item.id) {
            // alert( $table)
            $table.toggleRowExpansion(item, false);
            item.expansion = false;
          } else {
            if (!item.expansion) {
              let no = this.row.sampleNo;
              item.expansion = !item.expansion;
              if (this.itemRow.name == '大肠菌群' && row.stepName == '复发酵试验') {
                this.sampleOtherList = [];
                this.optionsList = [
                  { id: 6, name: no + '-01', status: '已完成', type: 0 },
                  { id: 7, name: no + '-02', status: '已完成', type: 0 },
                  { id: 8, name: no + '-03', status: '已完成', type: 0 },
                  { id: 9, name: no + '-04', status: '已完成', type: 0 },
                  { id: 10, name: no + '-05', status: '已完成', type: 0 },
                  { id: 10, name: no + '-06', status: '已完成', type: 0 },
                ];
                this.otherOpen = true;
              } else {
                if (item.expansion) {
                  if (this.itemRow.name == '大肠菌群' && row.stepName == '复发酵试验') {
                    this.sampleOtherList = [];
                  } else {
                    this.sampleOtherList = [
                      { id: 6, name: no + '-01', status: '已完成', type: 0 },
                      { id: 7, name: no + '-02', status: '已完成', type: 0 },
                      { id: 8, name: no + '-03', status: '已完成', type: 0 },
                      { id: 9, name: no + '-04', status: '已完成', type: 0 },
                      { id: 10, name: no + '-05', status: '已完成', type: 0 },
                      { id: 10, name: no + '-06', status: '已完成', type: 0 },
                    ];
                  }
                }
              }
            }
          }
        });

        if ($table != undefined) {
          $table.toggleRowExpansion(row);
        }
      } else {
        if (this.itemRow.name != '大肠菌群' && row.stepName != '复发酵试验') {
          let no = this.sampleOtherList[this.sampleOtherList.length - 1].name;
          let noFlag = no.split('-')[0];
          let nextOrder = Number(no.split('-')[1]) + 1;
          let nextNo = nextOrder.length > 1 ? noFlag + '-' + nextOrder : noFlag + '-0' + nextOrder;
          this.sampleOtherList.push({
            name: nextNo,
            type: 0,
          });
        } else {
          this.reset();
          let no = this.row.sampleNo;
          this.sampleOtherList = [];
          this.optionsList = [
            { id: 6, name: no + '-01', status: '已完成', type: 0 },
            { id: 7, name: no + '-02', status: '已完成', type: 0 },
            { id: 8, name: no + '-03', status: '已完成', type: 0 },
            { id: 9, name: no + '-04', status: '已完成', type: 0 },
            { id: 10, name: no + '-05', status: '已完成', type: 0 },
            { id: 10, name: no + '-06', status: '已完成', type: 0 },
          ];
          this.otherOpen = true;
          this.form.reportName = undefined;
        }
      }
    },

    // 大肠菌落复标本分配
    submitOther() {
      for (let i = 1; i <= this.form.num; i++) {
        for (let item of this.form.reportName) {
          this.sampleOtherList.push({ name: item + '-0' + i });
        }
      }

      this.otherOpen = false;
    },

    //样本编号删除
    handleSampleOrderDelete(row) {
      this.sampleOtherList = this.sampleOtherList.filter((item) => {
        return item.name != row.name;
      });
    },

    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm('queryForm');
      this.handleQuery();
    },
    // 样品多选框选中数据
    handleSelectionChangeOne(selection) {
      this.idsOne = selection.map((item) => item.id);
      this.singleOne = selection.length != 1;
      this.multipleOne = !selection.length;
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map((item) => item.id);
      this.single = selection.length != 1;
      this.multiple = !selection.length;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = '添加';
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids;
      getBatch(id).then((response) => {
        this.form = response.data;
        this.open = true;
        this.title = '修改';
      });
    },
    // 获取状态标签文本
    getStatusLabel(status) {
      const statusMap = {
        0: '未完成',
        1: '实验中',
        2: '已完成',
      };
      return statusMap[status] || '未知状态';
    },
    //标签状态
    getStatusTagType(status) {
      if (status === '已完成') {
        return 'success';
      } else if (status === '进行中') {
        return 'primary';
      } else {
        return 'danger';
      }
    },
    //样本明细
    handleSampleDetail() {
      this.sampleOpen = true;
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.id != undefined) {
            updateBatch(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('修改成功');
                this.open = false;
                this.getList();
              }
            });
          } else {
            addBatch(this.form).then((response) => {
              if (response.code === 200) {
                this.msgSuccess('新增成功');
                this.open = false;
                this.getList();
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除【请填写功能名称】编号为"' + ids + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(function () {
          return delBatch(ids);
        })
        .then(() => {
          this.getList();
          this.msgSuccess('删除成功');
        })
        .catch(function () {});
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有【请填写功能名称】数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      })
        .then(function () {
          return exportBatch(queryParams);
        })
        .then((response) => {
          this.download(response.msg);
        })
        .catch(function () {});
    },
    handleImport() {
      this.upload.title = '【请填写功能名称】导入';
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      importTemplate().then((response) => {
        this.download(response.msg);
      });
    },
    // 文件上传中处理
    handleFileUploadProgress(event, file, fileList) {
      this.upload.isUploading = true;
    },
    // 文件上传成功处理
    handleFileSuccess(response, file, fileList) {
      this.upload.open = false;
      this.upload.isUploading = false;
      this.$refs.upload.clearFiles();
      this.$alert(response.msg, '导入结果', { dangerouslyUseHTMLString: true });
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    },
    //点击行
    rowclick(row) {
      this.getIndex = row.index;
      this.row = row;
      if (row.sampleId) {
        this.getSampleInfo(row.sampleId);

        // this.methodList = [{ id:1,name: "菌落总数", status: "未完成",expansion:false},
        // { id:2,name: "大肠菌群", status: "未完成" ,expansion:false}];
      } else {
        this.methodList = [];
      }
    },

    //点击行
    rowclick1(row) {
      this.getItemIndex = row.index;
      this.stepRow = row;
      this.typeValue = row.type;
      // console.log(this.stepRow)
      // this.stepFormData = row;
      getRecord(row.id).then((res) => {
        if (res.code == 200) {
          this.stepFormData = res.data;
        }
      });
    },

    /** 提交 */
    handleSubmit() {
      if (this.idsOne && this.idsOne.length > 0) {
        this.$confirm('是否批量填写样本', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(function () {
            // this.msgSuccess("提交成功");
          })
          .then(() => {
            // this.getList();
            // this.sampleOpen = false
            // this.msgSuccess("提交成功");
            this.sampleOpen = false;
            this.msgSuccess('提交成功');
          })
          .catch(function () {});
      } else {
        this.sampleOpen = false;
        this.msgSuccess('提交成功');
      }
    },

    selectedstyle({ row, rowIndex }) {
      if (this.getIndex === rowIndex) {
        return { 'background-color': '#FFCC00' };
      }
    },
    selectedstyle1({ row, rowIndex }) {
      if (this.getItemIndex === rowIndex) {
        return { 'background-color': '#FFCC00' };
      }
    },
    tableRowClassName({ row, rowIndex }) {
      row.index = rowIndex;
    },
    handlePrint(){

    },
  },
};
</script>
<style scoped lang="scss">
::v-deep .el-dialog .el-dialog__body .detailForm {
  background-color: #e7f0ff;
}

::v-deep .el-table__expand-icon {
  display: none;
}
::v-deep .el-table__empty-block {
  min-height: 20vh;
}
::v-deep .el-button--small {
  padding: 4px 15px;
}
</style>
