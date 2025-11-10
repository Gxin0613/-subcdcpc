<!--检测申请单明细表-样品-->
<template>
  <div>
    <!--    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px" size=" mini">-->
    <!--&lt;!&ndash;      <el-form-item label="样品编号" prop="sampleNo">&ndash;&gt;-->
    <!--&lt;!&ndash;        <el-input&ndash;&gt;-->
    <!--&lt;!&ndash;          v-model="queryParams.sampleNo"&ndash;&gt;-->
    <!--&lt;!&ndash;          placeholder="请输入样品编号"&ndash;&gt;-->
    <!--&lt;!&ndash;          clearable&ndash;&gt;-->
    <!--&lt;!&ndash;          size="small"&ndash;&gt;-->
    <!--&lt;!&ndash;          @keyup.enter.native="handleQuery"&ndash;&gt;-->
    <!--&lt;!&ndash;        />&ndash;&gt;-->
    <!--&lt;!&ndash;      </el-form-item>&ndash;&gt;-->

    <!--      <el-form-item label="样品状态" prop="sampleStatus">-->
    <!--        <el-select v-model="queryParams.sampleStatus" placeholder="请选择样品状态" clearable size="small">-->
    <!--          <el-option label="请选择字典生成" value="" />-->
    <!--        </el-select>-->
    <!--      </el-form-item>-->
    <!--      <el-form-item label="规格" prop="specification">-->
    <!--        <el-input-->
    <!--          v-model="queryParams.specification"-->
    <!--          placeholder="请输入规格"-->
    <!--          clearable-->
    <!--          size="small"-->
    <!--          @keyup.enter.native="handleQuery"-->
    <!--        />-->
    <!--      </el-form-item>-->
    <!--      <el-form-item label="实验状态" prop="status">-->
    <!--        <el-select v-model="queryParams.status" placeholder="请选择标本实验状态 0未开始 1实验中  2 完成" clearable size="small">-->
    <!--          <el-option label="请选择字典生成" value="" />-->
    <!--        </el-select>-->
    <!--      </el-form-item>-->
    <!--      <el-form-item>-->
    <!--        <el-button type="primary" icon="el-icon-search" size="mini" @click="handleQuery">搜索</el-button>-->
    <!--        <el-button icon="el-icon-refresh" size="mini" @click="resetQuery">重置</el-button>-->
    <!--      </el-form-item>-->
    <!--    </el-form>-->

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" size="default" @click="handleAdd" v-hasPermi="['app:detail:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" size="default" :disabled="single" @click="handleUpdate" v-hasPermi="['app:detail:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" size="default" :disabled="multiple" @click="handleDelete" v-hasPermi="['app:detail:remove']">删除</el-button>
      </el-col>
      <!--      <el-col :span="1.5">-->
      <!--        <el-button-->
      <!--          type="info"-->
      <!--          icon="el-icon-upload2"-->
      <!--          size="mini"-->
      <!--          @click="handleImport"-->
      <!--          v-hasPermi="['app:detail:import']"-->
      <!--          v-show="false"-->
      <!--        >导入</el-button>-->
      <!--      </el-col>-->
      <!--      <el-col :span="1.5">-->
      <!--        <el-button-->
      <!--          type="warning"-->
      <!--          icon="el-icon-download"-->
      <!--          size="mini"-->
      <!--          @click="handleExport"-->
      <!--          v-hasPermi="['app:detail:export']"-->
      <!--          v-show="false"-->
      <!--        >导出</el-button>-->
      <!--      </el-col>-->
    </el-row>

    <el-table v-loading="loading" :data="detailList" @selection-change="handleSelectionChange" size="small">
      <el-table-column type="selection" width="55" align="center" />
      <!--      <el-table-column label="样品ID，主键" align="center" prop="sampleId" />-->
      <!--      <el-table-column label="关联的批次ID" align="center" prop="batchId" />-->
      <el-table-column label="样品编号" align="center" prop="sampleNo">
        <!--        <template slot-scope="scope">-->
        <!--          <el-input v-if="scope.row.editing" v-model="scope.row.sampleNo" placeholder="请输入样品编号" size="small"/>-->
        <!--          <span v-else>{{ scope.row.sampleNo}}</span>-->
        <!--        </template>-->
      </el-table-column>
      <el-table-column label="样品名称" align="center" prop="sampleName">
        <!--        <template slot-scope="scope">-->
        <!--          <el-input v-if="scope.row.editing" v-model="scope.row.sampleName" placeholder="请输入样品名称" size="small"/>-->
        <!--          <span v-else>{{ scope.row.sampleName}}</span>-->
        <!--        </template>-->
      </el-table-column>
      <el-table-column label="生产单位" align="center" prop="productionUnit">
        <!--        <template slot-scope="scope">-->
        <!--          <el-input v-if="scope.row.editing" v-model="scope.row.productionUnit" placeholder="请输入生产单位" size="small"/>-->
        <!--          <span v-else>{{ scope.row.productionUnit}}</span>-->
        <!--        </template>-->
      </el-table-column>
      <el-table-column label="样品数量" align="center" prop="sampleQuantity">
        <!--        <template slot-scope="scope">-->
        <!--          <el-input v-if="scope.row.editing" v-model="scope.row.sampleQuantity" placeholder="请输入样品数量" size="small"/>-->
        <!--          <span v-else>{{ scope.row.sampleQuantity}}</span>-->
        <!--        </template>-->
      </el-table-column>
      <el-table-column label="包装情况" align="center" prop="packagingSituation">
        <!--        <template slot-scope="scope">-->
        <!--          <el-input v-if="scope.row.editing" v-model="scope.row.packagingSituation" placeholder="请输入包装情况" size="small"/>-->
        <!--          <span v-else>{{ scope.row.packagingSituation}}</span>-->
        <!--        </template>-->
      </el-table-column>
      <el-table-column label="保存条件" align="center" prop="storageCondition">
        <!--        <template slot-scope="scope">-->
        <!--          <el-input v-if="scope.row.editing" v-model="scope.row.storageCondition" placeholder="请输入保存条件" size="small"/>-->
        <!--          <span v-else>{{ scope.row.storageCondition}}</span>-->
        <!--        </template>-->
      </el-table-column>
      <el-table-column label="样品状态" align="center" prop="sampleStatus">
        <!--        <template slot-scope="scope">-->
        <!--&lt;!&ndash;          <el-input v-if="scope.row.editing" v-model="scope.row.sampleStatus" placeholder="请输入样品状态" size="small"/>&ndash;&gt;-->
        <!--          <el-select  v-if="scope.row.editing"  v-model="scope.row.sampleStatus" placeholder="请选择样品状态">-->
        <!--            <el-option-->
        <!--              v-for="item in sampleStatusOptions"-->
        <!--              :key="item.dictValue"-->
        <!--              :label="item.dictLabel"-->
        <!--              :value="item.dictValue">-->
        <!--            </el-option>-->
        <!--          </el-select>-->
        <!--          <span v-else>{{ scope.row.sampleStatus}}</span>-->
        <!--        </template>-->
      </el-table-column>
      <el-table-column label="商标" align="center" prop="trademark">
        <!--        <template slot-scope="scope">-->
        <!--          <el-input v-if="scope.row.editing" v-model="scope.row.trademark" placeholder="请输入商标" size="small"/>-->
        <!--          <span v-else>{{ scope.row.trademark}}</span>-->
        <!--        </template>-->
      </el-table-column>
      <el-table-column label="规格" align="center" prop="specification">
        <!--      <template slot-scope="scope">-->
        <!--        <el-input v-if="scope.row.editing" v-model="scope.row.specification" placeholder="请输入规格" size="small"/>-->
        <!--        <span v-else>{{ scope.row.specification}}</span>-->
        <!--      </template>--> </el-table-column
      >>
      <el-table-column label="生产日期" align="center" prop="productionDate" width="120">
        <!--        <template slot-scope="scope">-->
        <!--          <el-input v-if="scope.row.editing" v-model="scope.row.productionDate" placeholder="请输入生产日期" size="small"/>-->
        <!--          <span v-else>{{ parseTime(scope.row.productionDate, '{y}-{m}-{d}') }}</span>-->
        <!--        </template>-->
      </el-table-column>
      <!--      <el-table-column label="批号" align="center" prop="batchNumber" />-->
      <el-table-column label="物态" align="center" prop="physicalState">
        <!--        <template slot-scope="scope">-->
        <!--          <el-input v-if="scope.row.editing" v-model="scope.row.physicalState" placeholder="请输入物态" size="small"/>-->
        <!--          <span v-else>{{ scope.row.physicalState}}</span>-->
        <!--        </template>-->
      </el-table-column>
      <el-table-column label="颜色" align="center" prop="color">
        <!--        <template slot-scope="scope">-->
        <!--          <el-input v-if="scope.row.editing" v-model="scope.row.color" placeholder="请输入颜色" size="small"/>-->
        <!--          <span v-else>{{ scope.row.color}}</span>-->
        <!--        </template>-->
      </el-table-column>
      <el-table-column label="归类" align="center" prop="classification">
        <!--        <template slot-scope="scope">-->
        <!--          <el-input v-if="scope.row.editing" v-model="scope.row.classification" placeholder="请输入归类" size="small"/>-->
        <!--          <span v-else>{{ scope.row.classification}}</span>-->
        <!--        </template>-->
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remarks">
        <!--        <template slot-scope="scope">-->
        <!--          <el-input v-if="scope.row.editing" v-model="scope.row.remarks" placeholder="请输入备注" size="small"/>-->
        <!--          <span v-else>{{ scope.row.remarks}}</span>-->
        <!--        </template>-->
      </el-table-column>
      <!--      <el-table-column label="状态：0-已删除，1-正常" align="center" prop="delStatus" />-->
      <el-table-column label="实验状态" align="center" prop="status" v-if="!mainAdd">
        <!--        <template slot-scope="scope">-->
        <!--&lt;!&ndash;          <el-input v-if="scope.row.editing" v-model="scope.row.status" placeholder="请输入实验状态" size="small"/>&ndash;&gt;-->
        <!--          <span>{{showDictValue(scope.row.status,statusOptions)}}</span>-->
        <!--        </template>-->
      </el-table-column>
      <!--      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="">-->
      <!--        <template slot-scope="scope">-->
      <!--          <el-button-->
      <!--            size="mini"-->
      <!--            type="text"-->
      <!--            icon="el-icon-edit"-->
      <!--            @click="handleUpdate(scope.row)"-->
      <!--            v-hasPermi="['app:detail:edit']"-->
      <!--          >修改</el-button>-->
      <!--          <el-button-->
      <!--            size="mini"-->
      <!--            type="text"-->
      <!--            icon="el-icon-delete"-->
      <!--            @click="handleDelete(scope.row)"-->
      <!--            v-hasPermi="['app:detail:remove']"-->
      <!--          >删除</el-button>-->
      <!--        </template>-->
      <!--      </el-table-column>-->
    </el-table>

    <!--    <pagination-->
    <!--      v-show="total>0"-->
    <!--      :total="total"-->
    <!--      :page.sync="queryParams.pageNum"-->
    <!--      :limit.sync="queryParams.pageSize"-->
    <!--      @pagination="getList"-->
    <!--    />-->

    <!-- 添加或修改检测申请单明细-样品（跟cdc_sample_receive_batch关联）对话框 -->
    <el-dialog :title="title" v-model="open" width="750px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px" label-position="left">
        <!--        <el-form-item label="关联的批次ID" prop="batchId">-->
        <!--          <el-input v-model="form.batchId" placeholder="请输入关联的批次ID" />-->
        <!--        </el-form-item>-->
        <el-row>
          <el-col :span="12">
            <el-form-item label="样品编号" prop="sampleNo">
              <el-input v-model="form.sampleNo" placeholder="请输入样品编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="样品名称" prop="sampleName">
              <el-input v-model="form.sampleName" placeholder="请输入样品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产单位" prop="productionUnit">
              <el-input v-model="form.productionUnit" placeholder="请输入生产单位" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="样品数量" prop="sampleQuantity">
              <el-input v-model="form.sampleQuantity" placeholder="请输入样品数量" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="包装情况" prop="packagingSituation">
              <el-input v-model="form.packagingSituation" placeholder="请输入包装情况" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保存条件" prop="storageCondition">
              <el-input v-model="form.storageCondition" placeholder="请输入保存条件" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="样品状态">
              <el-radio-group v-model="form.sampleStatus">
                <el-radio label="1">请选择字典生成</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="商标" prop="trademark">
              <el-input v-model="form.trademark" placeholder="请输入商标" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格" prop="specification">
              <el-input v-model="form.specification" placeholder="请输入规格" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产日期" prop="productionDate">
              <el-date-picker clearable size="mini" style="width: 100%" v-model="form.productionDate" type="date" value-format="yyyy-MM-dd" placeholder="选择生产日期" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="批号" prop="batchNumber">
              <el-input v-model="form.batchNumber" placeholder="请输入批号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物态" prop="physicalState">
              <el-input v-model="form.physicalState" placeholder="请输入物态" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="颜色" prop="color">
              <el-input v-model="form.color" placeholder="请输入颜色" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="归类" prop="classification">
              <el-input v-model="form.classification" placeholder="请输入归类" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remarks">
              <el-input v-model="form.remarks" placeholder="请输入备注" type="textarea" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <!--文件上传对话框-->
    <!--    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>-->
    <!--      <el-upload-->
    <!--        ref="upload"-->
    <!--        :limit="1"-->
    <!--        accept=".xlsx, .xls"-->
    <!--        :headers="upload.headers"-->
    <!--        :action="upload.url"-->
    <!--        :disabled="upload.isUploading"-->
    <!--        :on-progress="handleFileUploadProgress"-->
    <!--        :on-success="handleFileSuccess"-->
    <!--        :auto-upload="false"-->
    <!--        drag-->
    <!--      >-->
    <!--        <i class="el-icon-upload"></i>-->
    <!--        <div class="el-upload__text">-->
    <!--          将文件拖到此处，或-->
    <!--          <em>点击上传</em>-->
    <!--        </div>-->
    <!--        &lt;!&ndash;div class="el-upload__tip" slot="tip">-->
    <!--            <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>-->
    <!--        </div&ndash;&gt;-->
    <!--        <div class="el-upload__tip" style="color:red" slot="tip">提示：仅允许导入“xls”或“xlsx”格式文件！</div>-->
    <!--      </el-upload>-->
    <!--      <div slot="footer" class="dialog-footer">-->
    <!--        <el-button type="primary" @click="submitFileForm">确 定</el-button>-->
    <!--        <el-button @click="upload.open = false">取 消</el-button>-->
    <!--      </div>-->
    <!--    </el-dialog>-->
  </div>
</template>

<script>
  import { listDetail, getDetail, delDetail, addDetail, updateDetail, exportDetail, importTemplate } from '/@/api/hsw/cdc/sampleManage/cdcSampleDetail';
  // import { getToken } from "@/utils/auth";
  // import { getCurrentInstance } from 'vue'

  export default {
    name: 'Detail',
    data() {
      return {
        // 遮罩层
        loading: false,
        // 选中数组
        ids: [],
        // 非单个禁用
        single: true,
        //当前为同时添加
        mainAdd: false,
        // 非多个禁用
        multiple: true,
        // 总条数
        total: 0,
        // 检测申请单明细-样品（跟cdc_sample_receive_batch关联）表格数据
        detailList: [],
        sampleNos: [], //样本编号
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 1008611,
          batchId: undefined,
          sampleNo: undefined,
          sampleName: undefined,
          productionUnit: undefined,
          sampleQuantity: undefined,
          packagingSituation: undefined,
          storageCondition: undefined,
          sampleStatus: undefined,
          trademark: undefined,
          specification: undefined,
          productionDate: undefined,
          batchNumber: undefined,
          physicalState: undefined,
          color: undefined,
          classification: undefined,
          remarks: undefined,
          delStatus: undefined,
          status: undefined,
        },
        // 表单参数
        form: {},
        //样品状态
        sampleStatusOptions: [],
        //标本实验状态
        statusOptions: [],
        // 表单校验
        rules: {
          batchId: [{ required: true, message: '关联的批次ID不能为空', trigger: 'blur' }],
          sampleNo: [{ required: true, message: '样品编号不能为空', trigger: 'blur' }],
          sampleName: [{ required: true, message: '样品名称不能为空', trigger: 'blur' }],
        },
        //  检测申请单明细-样品（跟cdc_sample_receive_batch关联）导入参数
        upload: {
          // 是否显示弹出层（用户导入）
          open: false,
          // 弹出层标题（用户导入）
          title: "",
          // 是否禁用上传
          isUploading: false,
          // 是否更新已经存在的用户数据
          updateSupport: 0,
        //   // 设置上传的请求头部
        //   headers: { Authorization: "Bearer " + getToken() },
        //   // 上传的地址
        //   url: import.meta.url + "/app/detail/importData"
        },
      };
    },
    created() {
      // this.getList();
      //样品状态
      //   this.getDicts("sample_status").then(res => {
      //     this.sampleStatusOptions = res.data;
      //   })
      //   //标本实验状态
      // this.getDicts("sample_experiment_status").then(res => {
      //     this.statusOptions = res.data;
      //   })
    },
    methods: {
      /** 查询检测申请单明细-样品（跟cdc_sample_receive_batch关联）列表 */
      getList(mainRow) {
        this.loading = true;
        this.queryParams.batchId = mainRow.batchId;
        this.mainId = mainRow.batchId;
        listDetail(this.queryParams).then((response) => {
          this.detailList = response.rows;
          // this.total = response.total;
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
          sampleId: undefined,
          batchId: undefined,
          sampleNo: undefined,
          sampleName: undefined,
          productionUnit: undefined,
          sampleQuantity: undefined,
          packagingSituation: undefined,
          storageCondition: undefined,
          sampleStatus: '0',
          trademark: undefined,
          specification: undefined,
          productionDate: undefined,
          batchNumber: undefined,
          physicalState: undefined,
          color: undefined,
          classification: undefined,
          remarks: undefined,
          createTime: undefined,
          createBy: undefined,
          updateTime: undefined,
          updateBy: undefined,
          delStatus: '0',
          status: '0',
        };
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.pageNum = 1;
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        this.handleQuery();
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map((item) => item.sampleId);
        this.sampleNos = selection.map((item) => item.sampleNo);
        this.single = selection.length != 1;
        this.multiple = !selection.length;
      },
      /** 新增按钮操作 */
      handleAdd() {
        if (this.mainId == undefined) {
          if (this.mainAdd) {
            // 添加新行并设置为编辑状态
            const newRow = {
              sampleId: undefined,
              batchId: undefined,
              sampleNo: undefined,
              sampleName: undefined,
              productionUnit: undefined,
              sampleQuantity: undefined,
              packagingSituation: undefined,
              storageCondition: undefined,
              sampleStatus: '0',
              trademark: undefined,
              specification: undefined,
              productionDate: undefined,
              batchNumber: undefined,
              physicalState: undefined,
              color: undefined,
              classification: undefined,
              remarks: undefined,
              createTime: undefined,
              createBy: undefined,
              updateTime: undefined,
              updateBy: undefined,
              delStatus: '0',
              status: '0',
              editing: true,
            };
            this.detailList.unshift(newRow);
          } else {
            this.$modal.msgError('请先选择申请单数据');
          }
        } else {
          this.reset();
          this.open = true;
          this.title = '添加检测申请单明细';
        }
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const sampleId = row.sampleId || this.ids;
        getDetail(sampleId).then((response) => {
          this.form = response.data;
          this.open = true;
          this.title = '修改检测申请单明细-样品（跟cdc_sample_receive_batch关联）';
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if (this.form.sampleId != undefined) {
              updateDetail(this.form).then((response) => {
                if (response.code === 200) {
                  this.$modal.msgSuccess('修改成功');
                  this.open = false;
                  this.getList();
                }
              });
            } else {
              addDetail(this.form).then((response) => {
                if (response.code === 200) {
                  this.$modal.msgSuccess('新增成功');
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
        const sampleIds = row.sampleId || this.ids;
        const sampleNo = row.sampleId || this.sampleNos;
        this.$confirm('是否确认删除样品编号为【"' + sampleNo + '"】的数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(function () {
            return delDetail(sampleIds);
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
        this.$confirm('是否确认导出所有检测申请单明细-样品（跟cdc_sample_receive_batch关联）数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(function () {
            return exportDetail(queryParams);
          })
          .then((response) => {
            this.download(response.msg);
          })
          .catch(function () {});
      },
      handleImport() {
        this.upload.title = '检测申请单明细-样品（跟cdc_sample_receive_batch关联）导入';
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
<style scoped lang="css">
  ::v-deep.el-form-item--default {
    marign-right: 15px;
  }
</style>
