<!--实验过程步骤记录-->
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="标本ID" prop="sampleId">
        <el-input v-model="queryParams.sampleId" placeholder="请输入标本ID" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="实验方法ID" prop="methodId">
        <el-input v-model="queryParams.methodId" placeholder="请输入实验方法ID" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label=" 操作人ID" prop="operatorId">
        <el-input v-model="queryParams.operatorId" placeholder="请输入 操作人ID" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="协同操作人ID1" prop="operatorId1">
        <el-input v-model="queryParams.operatorId1" placeholder="请输入协同操作人ID1" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="协同操作人ID2" prop="operatorId2">
        <el-input v-model="queryParams.operatorId2" placeholder="请输入协同操作人ID2" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="开始时间" prop="startTime">
        <el-date-picker clearable size="small" style="width: 200px" v-model="queryParams.startTime" type="date" value-format="yyyy-MM-dd" placeholder="选择开始时间" />
      </el-form-item>
      <el-form-item label=" 结束时间" prop="endTime">
        <el-date-picker clearable size="small" style="width: 200px" v-model="queryParams.endTime" type="date" value-format="yyyy-MM-dd" placeholder="选择 结束时间" />
      </el-form-item>
      <el-form-item label="状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择状态" clearable size="small">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="条码" prop="barcode">
        <el-input v-model="queryParams.barcode" placeholder="请输入条码" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="步骤id" prop="stepId">
        <el-input v-model="queryParams.stepId" placeholder="请输入步骤id" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="序号" prop="stepOrder">
        <el-input v-model="queryParams.stepOrder" placeholder="请输入序号" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input v-model="queryParams.description" placeholder="请输入描述" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="结论" prop="conclusion">
        <el-input v-model="queryParams.conclusion" placeholder="请输入结论" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="1 是 2否" prop="conclusionSelect">
        <el-input v-model="queryParams.conclusionSelect" placeholder="请输入1 是 2否" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="1单行  2多行 3 下拉" prop="conclusionType">
        <el-select v-model="queryParams.conclusionType" placeholder="请选择1单行  2多行 3 下拉" clearable size="small">
          <el-option label="请选择字典生成" value="" />
        </el-select>
      </el-form-item>
      <el-form-item label="如果type是3 存字典dict_type" prop="conclusionDict">
        <el-input v-model="queryParams.conclusionDict" placeholder="请输入如果type是3 存字典dict_type" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="表格" prop="table1">
        <el-input v-model="queryParams.table1" placeholder="请输入表格" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="1 是 2否" prop="table1Select">
        <el-input v-model="queryParams.table1Select" placeholder="请输入1 是 2否" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="表格明细录入" prop="table2">
        <el-input v-model="queryParams.table2" placeholder="请输入表格明细录入" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="1 是 2否" prop="table2Select">
        <el-input v-model="queryParams.table2Select" placeholder="请输入1 是 2否" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="设备 是否" prop="deviceSelect">
        <el-input v-model="queryParams.deviceSelect" placeholder="请输入设备 是否" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="试剂 是否" prop="reagentSelect">
        <el-input v-model="queryParams.reagentSelect" placeholder="请输入试剂 是否" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="该步骤必填 1 是 0否" prop="necessary1">
        <el-input v-model="queryParams.necessary1" placeholder="请输入该步骤必填 1 是 0否" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="上步如果是阳性，该步骤必填  1 是 0否" prop="necessary2">
        <el-input v-model="queryParams.necessary2" placeholder="请输入上步如果是阳性，该步骤必填  1 是 0否" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="necessary2得说明" prop="necessary2Remark">
        <el-input v-model="queryParams.necessary2Remark" placeholder="请输入necessary2得说明" clearable size="small" @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" icon="el-icon-plus" size="mini" @click="handleAdd" v-hasPermi="['app:record:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" icon="el-icon-edit" size="mini" :disabled="single" @click="handleUpdate" v-hasPermi="['app:record:edit']" v-show="false">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="multiple" @click="handleDelete" v-hasPermi="['app:record:remove']">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" icon="el-icon-upload2" size="mini" @click="handleImport" v-hasPermi="['app:record:import']" v-show="false">导入</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" icon="el-icon-download" size="mini" @click="handleExport" v-hasPermi="['app:record:export']" v-show="false">导出</el-button>
      </el-col>
    </el-row>

    <el-table v-loading="loading" :data="recordList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="necessary2得说明" align="center" prop="id" />
      <el-table-column label="标本ID" align="center" prop="sampleId" />
      <el-table-column label="实验方法ID" align="center" prop="methodId" />
      <el-table-column label=" 操作人ID" align="center" prop="operatorId" />
      <el-table-column label="协同操作人ID1" align="center" prop="operatorId1" />
      <el-table-column label="协同操作人ID2" align="center" prop="operatorId2" />
      <el-table-column label="开始时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label=" 结束时间" align="center" prop="endTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="status" />
      <el-table-column label="条码" align="center" prop="barcode" />
      <el-table-column label="步骤id" align="center" prop="stepId" />
      <el-table-column label="序号" align="center" prop="stepOrder" />
      <el-table-column label="描述" align="center" prop="description" />
      <el-table-column label="结论" align="center" prop="conclusion" />
      <el-table-column label="1 是 2否" align="center" prop="conclusionSelect" />
      <el-table-column label="1单行  2多行 3 下拉" align="center" prop="conclusionType" />
      <el-table-column label="如果type是3 存字典dict_type" align="center" prop="conclusionDict" />
      <el-table-column label="表格" align="center" prop="table1" />
      <el-table-column label="1 是 2否" align="center" prop="table1Select" />
      <el-table-column label="表格明细录入" align="center" prop="table2" />
      <el-table-column label="1 是 2否" align="center" prop="table2Select" />
      <el-table-column label="设备 是否" align="center" prop="deviceSelect" />
      <el-table-column label="试剂 是否" align="center" prop="reagentSelect" />
      <el-table-column label="该步骤必填 1 是 0否" align="center" prop="necessary1" />
      <el-table-column label="上步如果是阳性，该步骤必填  1 是 0否" align="center" prop="necessary2" />
      <el-table-column label="necessary2得说明" align="center" prop="necessary2Remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)" v-hasPermi="['app:record:edit']">修改</el-button>
          <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)" v-hasPermi="['app:record:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改【请填写功能名称】对话框 -->
    <el-dialog :title="title" v-model:visible="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标本ID" prop="sampleId">
          <el-input v-model="form.sampleId" placeholder="请输入标本ID" />
        </el-form-item>
        <el-form-item label="实验方法ID" prop="methodId">
          <el-input v-model="form.methodId" placeholder="请输入实验方法ID" />
        </el-form-item>
        <el-form-item label=" 操作人ID" prop="operatorId">
          <el-input v-model="form.operatorId" placeholder="请输入 操作人ID" />
        </el-form-item>
        <el-form-item label="协同操作人ID1" prop="operatorId1">
          <el-input v-model="form.operatorId1" placeholder="请输入协同操作人ID1" />
        </el-form-item>
        <el-form-item label="协同操作人ID2" prop="operatorId2">
          <el-input v-model="form.operatorId2" placeholder="请输入协同操作人ID2" />
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker clearable size="small" style="width: 200px" v-model="form.startTime" type="date" value-format="yyyy-MM-dd" placeholder="选择开始时间" />
        </el-form-item>
        <el-form-item label=" 结束时间" prop="endTime">
          <el-date-picker clearable size="small" style="width: 200px" v-model="form.endTime" type="date" value-format="yyyy-MM-dd" placeholder="选择 结束时间" />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="1">请选择字典生成</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="条码" prop="barcode">
          <el-input v-model="form.barcode" placeholder="请输入条码" />
        </el-form-item>
        <el-form-item label="步骤id" prop="stepId">
          <el-input v-model="form.stepId" placeholder="请输入步骤id" />
        </el-form-item>
        <el-form-item label="序号" prop="stepOrder">
          <el-input v-model="form.stepOrder" placeholder="请输入序号" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="结论" prop="conclusion">
          <el-input v-model="form.conclusion" placeholder="请输入结论" />
        </el-form-item>
        <el-form-item label="1 是 2否" prop="conclusionSelect">
          <el-input v-model="form.conclusionSelect" placeholder="请输入1 是 2否" />
        </el-form-item>
        <el-form-item label="1单行  2多行 3 下拉">
          <el-select v-model="form.conclusionType" placeholder="请选择1单行  2多行 3 下拉">
            <el-option label="请选择字典生成" value="" />
          </el-select>
        </el-form-item>
        <el-form-item label="如果type是3 存字典dict_type" prop="conclusionDict">
          <el-input v-model="form.conclusionDict" placeholder="请输入如果type是3 存字典dict_type" />
        </el-form-item>
        <el-form-item label="表格" prop="table1">
          <el-input v-model="form.table1" placeholder="请输入表格" />
        </el-form-item>
        <el-form-item label="1 是 2否" prop="table1Select">
          <el-input v-model="form.table1Select" placeholder="请输入1 是 2否" />
        </el-form-item>
        <el-form-item label="表格明细录入" prop="table2">
          <el-input v-model="form.table2" placeholder="请输入表格明细录入" />
        </el-form-item>
        <el-form-item label="1 是 2否" prop="table2Select">
          <el-input v-model="form.table2Select" placeholder="请输入1 是 2否" />
        </el-form-item>
        <el-form-item label="设备 是否" prop="deviceSelect">
          <el-input v-model="form.deviceSelect" placeholder="请输入设备 是否" />
        </el-form-item>
        <el-form-item label="试剂 是否" prop="reagentSelect">
          <el-input v-model="form.reagentSelect" placeholder="请输入试剂 是否" />
        </el-form-item>
        <el-form-item label="该步骤必填 1 是 0否" prop="necessary1">
          <el-input v-model="form.necessary1" placeholder="请输入该步骤必填 1 是 0否" />
        </el-form-item>
        <el-form-item label="上步如果是阳性，该步骤必填  1 是 0否" prop="necessary2">
          <el-input v-model="form.necessary2" placeholder="请输入上步如果是阳性，该步骤必填  1 是 0否" />
        </el-form-item>
        <el-form-item label="necessary2得说明" prop="necessary2Remark">
          <el-input v-model="form.necessary2Remark" placeholder="请输入necessary2得说明" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!--文件上传对话框-->
    <el-dialog :title="upload.title" v-model:visible="upload.open" width="400px" append-to-body>
      <el-upload
        ref="upload"
        :limit="1"
        accept=".xlsx, .xls"
        :headers="upload.headers"
        :action="upload.url"
        :disabled="upload.isUploading"
        :on-progress="handleFileUploadProgress"
        :on-success="handleFileSuccess"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">
          将文件拖到此处，或
          <em>点击上传</em>
        </div>
        <!--div class="el-upload__tip" slot="tip">
            <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>
        </div-->
        <div class="el-upload__tip" style="color: red" slot="tip">提示：仅允许导入“xls”或“xlsx”格式文件！</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import { listRecord, getRecord, delRecord, addRecord, updateRecord, exportRecord, importTemplate } from '/@/api/hsw/cdc/testMethod/cdcSampleStepRecord';
  // import { getToken } from "@/utils/auth";

  export default {
    name: 'Record',
    data() {
      return {
        // 遮罩层
        loading: true,
        // 选中数组
        ids: [],
        // 非单个禁用
        single: true,
        // 非多个禁用
        multiple: true,
        // 总条数
        total: 0,
        // 【请填写功能名称】表格数据
        recordList: [],
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          sampleId: undefined,
          methodId: undefined,
          operatorId: undefined,
          operatorId1: undefined,
          operatorId2: undefined,
          startTime: undefined,
          endTime: undefined,
          status: undefined,
          barcode: undefined,
          stepId: undefined,
          stepOrder: undefined,
          description: undefined,
          conclusion: undefined,
          conclusionSelect: undefined,
          conclusionType: undefined,
          conclusionDict: undefined,
          table1: undefined,
          table1Select: undefined,
          table2: undefined,
          table2Select: undefined,
          deviceSelect: undefined,
          reagentSelect: undefined,
          necessary1: undefined,
          necessary2: undefined,
          necessary2Remark: undefined,
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          sampleId: [{ required: true, message: '标本ID不能为空', trigger: 'blur' }],
          methodId: [{ required: true, message: '实验方法ID不能为空', trigger: 'blur' }],
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
          // url: process.env.VUE_APP_BASE_API + "/app/record/importData"
        },
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询【请填写功能名称】列表 */
      getList() {
        this.loading = true;
        listRecord(this.queryParams).then((response) => {
          this.recordList = response.rows;
          this.total = response.total;
          this.loading = false;
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
          sampleId: undefined,
          methodId: undefined,
          operatorId: undefined,
          operatorId1: undefined,
          operatorId2: undefined,
          startTime: undefined,
          endTime: undefined,
          status: '0',
          barcode: undefined,
          stepId: undefined,
          stepOrder: undefined,
          description: undefined,
          conclusion: undefined,
          conclusionSelect: undefined,
          conclusionType: undefined,
          conclusionDict: undefined,
          table1: undefined,
          table1Select: undefined,
          table2: undefined,
          table2Select: undefined,
          deviceSelect: undefined,
          reagentSelect: undefined,
          necessary1: undefined,
          necessary2: undefined,
          necessary2Remark: undefined,
        };
        this.resetForm('form');
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
        this.title = '添加【请填写功能名称】';
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const id = row.id || this.ids;
        getRecord(id).then((response) => {
          this.form = response.data;
          this.open = true;
          this.title = '修改【请填写功能名称】';
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if (this.form.id != undefined) {
              updateRecord(this.form).then((response) => {
                if (response.code === 200) {
                  this.msgSuccess('修改成功');
                  this.open = false;
                  this.getList();
                }
              });
            } else {
              addRecord(this.form).then((response) => {
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
            return delRecord(ids);
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
            return exportRecord(queryParams);
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
    },
  };
</script>
