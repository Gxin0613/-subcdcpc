<!--实验方法-->
<!--<script src="../../../../../api/restApi.ts"></script>-->
<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px" size="default">
      <el-form-item label="创建时间" prop="approveTime">
        <el-date-picker
          clearable
          style="width: 280px"
          popper-class="large-date-picker"
          v-model="dateRange"
          type="daterange"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>
      <el-form-item label="项目名称" prop="name" size="default">
        <el-input v-model="queryParams.name" placeholder="请输入项目名称" clearable @keyup.enter.native="handleQuery" />
      </el-form-item>
      <el-form-item label="实验方法" prop="method">
        <el-select v-model="queryParams.method" placeholder="请选择实验方法" style="width: 110px" clearable>
          <el-option v-for="dict in experimentOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" size="default" @click="handleQuery">搜索</el-button>
        <el-button size="default" @click="resetQuery">重置</el-button>
<!--        <el-button size="default" @click="resetCeshi">接口测试</el-button>-->
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" size="default" @click="handleAdd" v-hasPermi="['cdc:method:add']">新增 </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" size="default" :disabled="single" @click="handleUpdate" v-hasPermi="['cdc:method:edit']">修改 </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" size="default" :disabled="multiple" @click="handleDelete" v-hasPermi="['cdc:method:remove']">删除 </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" size="default" @click="handleExamine" v-hasPermi="['cdc:method:check']">审核 </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" size="default" @click="handleImport" v-hasPermi="['cdc:method:import']">复制 </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="info" size="default" @click="handleImport" v-hasPermi="['cdc:method:import']" v-show="false">导入 </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="warning" size="default" @click="handleExport" v-hasPermi="['cdc:method:export']" v-show="false">导出 </el-button>
      </el-col>
    </el-row>
    <el-row>
      <splitpanes class="default-theme">
        <!--检测项目数据-->
        <pane size="36">
          <el-col>
            <div class="divtitle">
              <el-table
                v-loading="loading"
                :data="methodList"
                @cell-dblclick="handleUpdate"
                height="45vh"
                @cell-click="getDeptData"
                @row-contextmenu="handleRightClick"
                @selection-change="handleSelectionChange"
                size="default"
                :row-style="selectedstyle"
                :row-class-name="tableRowClassName"
              >
                <el-table-column type="selection" width="55" align="center" />
                <!--      <el-table-column label="id" align="center" prop="id" />-->
                <el-table-column label="项目名称" show-overflow-tooltip align="left" prop="name" width="100" />

                <el-table-column label="样品类型" show-overflow-tooltip align="left" prop="type" width="80">
                  <template #default="scope">
                    <span>{{ showDictValue(scope.row.type, sampleOptions) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="科室" show-overflow-tooltip align="left" prop="deptName" width="100" />
                <el-table-column label="实验方法" show-overflow-tooltip align="left" prop="method" width="90">
                  <template #default="scope">
                    <span>{{ showDictValue(scope.row.method, experimentOptions) }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="创建人" align="left" show-overflow-tooltip prop="user1" width="85" />

                <el-table-column label="创建时间" align="left" show-overflow-tooltip prop="createTime" width="115">
                  <template #default="scope">
                    <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
                  </template>
                </el-table-column>
                <el-table-column label="批准人" align="left" show-overflow-tooltip prop="approveUser" width="85" />
                <el-table-column label="批准时间" align="left" show-overflow-tooltip prop="approveTime" width="115">
                  <template #default="scope">
                    <span>{{ parseTime(scope.row.approveTime, '{y}-{m}-{d}') }}</span>
                  </template>
                </el-table-column>
                <!--      <el-table-column label="是否有效 1有效 2无效" align="center" prop="isvalid" />-->
                <el-table-column label="检测依据" align="left" show-overflow-tooltip prop="testingBasis" width="120" />
                <el-table-column label="描述备注" align="left" show-overflow-tooltip prop="description" width="150" />
                <!-- <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200">
                  <template #default="scope">
                    <el-button
                      size="default"
                      type="text"
                      icon="el-icon-s-operation"
                      @click="handleDetail(scope.row)"
                      v-hasPermi="['cdc:method:detail']"
                    >明细</el-button>
                    <el-button
                      size="default"
                      type="text"
                      icon="el-icon-edit"
                      @click="handleUpdate(scope.row)"
                      v-hasPermi="['cdc:method:edit']"
                    >修改</el-button>
                    <el-button
                      size="default"
                      type="text"
                      icon="el-icon-delete"
                      @click="handleDelete(scope.row)"
                      v-hasPermi="['cdc:method:remove']"
                    >删除</el-button>
                  </template>
                </el-table-column> -->
              </el-table>
              <!--            主数据操作框-->
              <el-form ref="Titleform" :model="Titleform" :rules="Titlerules" label-width="80px" size="default" style="padding-bottom: 0px">
                <div style="height: 26vh; overflow: auto; padding: 15px">
                  <el-row>
                    <el-col :span="12">
                      <el-form-item label="项目名称" prop="name">
                        <el-input v-model="Titleform.name" placeholder="请输入项目名称" clearable />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="样品类型">
                        <el-select v-model="Titleform.type" placeholder="请选择样品类型" style="width: 100%" clearable>
                          <el-option v-for="dict in sampleOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
                        </el-select>
                      </el-form-item>
                    </el-col>

                    <el-col :span="12">
                      <el-form-item label="实验方法" prop="method">
                        <el-select v-model="Titleform.method" placeholder="请选择实验方法" style="width: 100%" clearable>
                          <el-option v-for="dict in experimentOptions" :key="dict.dictValue" :label="dict.dictLabel" :value="dict.dictValue" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="检测依据" prop="testingBasis">
                        <el-input v-model="Titleform.testingBasis" placeholder="请输入检测依据" clearable />
                      </el-form-item>
                    </el-col>
                    <el-col :span="24">
                      <el-form-item label="描述备注" prop="description">
                        <el-input v-model="Titleform.description" placeholder="请输入描述备注" type="textarea" />
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <div slot="footer" class="dialog-footer" style="position: absolute; bottom: 10px">
                    <el-button type="primary" @click="submitForm" size="default">{{ btnTextMain }}</el-button>
                    <el-button @click="cancel" size="default">取 消</el-button>
                  </div>
                </div>
              </el-form>
              <!--            <pagination-->
              <!--              v-show="total>0"-->
              <!--              :total="total"-->
              <!--              :page.sync="queryParams.pageNum"-->
              <!--              :limit.sync="queryParams.pageSize"-->
              <!--              @pagination="getList"-->
              <!--            />-->
            </div>
          </el-col>
        </pane>
        <pane size="84">
          <el-col>
            <div class="divtitle">
              <!--      明细-->
              <cdcTStep ref="cdcTStep" @handeList="getList" @handleDeleteMet="handleDeleteMetsilent" />
            </div>
          </el-col>
        </pane>
      </splitpanes>
    </el-row>
    <!-- 添加或修改实验方法主表对话框 -->
    <!-- <el-dialog :title="title"  v-model="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入项目名称" clearable/>
        </el-form-item>
        <el-form-item label="样品类型">
          <el-select v-model="form.type" placeholder="请选择样品类型" style="width: 100%" clearable>
            <el-option
              v-for="dict in sampleOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="科室" prop="deptId">
          <el-input v-model="form.deptId" placeholder="请输入科室" clearable/>
        </el-form-item>
        <el-form-item label="实验方法" prop="method">
          <el-select v-model="form.method" placeholder="请选择实验方法" style="width: 100%" clearable>
            <el-option
              v-for="dict in experimentOptions"
              :key="dict.dictValue"
              :label="dict.dictLabel"
              :value="dict.dictValue" />
          </el-select>
        </el-form-item>
        <el-form-item label="检测依据" prop="testingBasis">
          <el-input v-model="form.testingBasis" placeholder="请输入检测依据" clearable/>
        </el-form-item>
        <el-form-item label="描述备注" prop="description">
          <el-input v-model="form.description" placeholder="请输入描述备注"  type="textarea"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog> -->

    <!--文件上传对话框-->
    <el-dialog :title="upload.title" v-model="upload.open" width="400px" append-to-body>
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
          <em>点击上传1</em>
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

    <!--    右键菜单事件-->
    <rightMenu
      @handleAdd="handleAdd"
      @handleUpdate="handleUpdate"
      @handleDelete="handleDelete"
      v-show="contextMenu.visible"
      :position="{ x: contextMenu.x, y: contextMenu.y }"
      :menu-items="menuItems"
      @close="contextMenu.visible = false"
    />
  </div>
</template>

<script>
  import { listMethod, getMethod, delMethod, addMethod, updateMethod, exportMethod, importTemplate } from '/@/api/hsw/cdc/testMethod/cdcTMethod';
  // import {getToken} from "@/utils/auth";
  // import {ceshi} from "/@/api/hsw/cdc/ceshi"
  import { Splitpanes, Pane } from 'splitpanes';
  import 'splitpanes/dist/splitpanes.css';
  import { useDict } from '/@/views/hsw/utils/dict.js';
  //明细
  import cdcTStep from '/@/views/hsw/cdc/testMethod/cdcTStep/cdcTStep.vue';
  // import {upload} from "@/api/cdc/testMethod/cdcTStep";
  import { getDicts } from '/@/api/hsw/cdc/system/dict/data.js';

  export default {
    name: 'Method',
    components: { cdcTStep, Splitpanes, Pane },
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
        // 实验方法主表表格数据
        methodList: [],
        dateRange: [],
        getIndex: undefined,
        Titleform: {},
        btnTextMain: '确 定',
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        contextMenu: {
          visible: false,
          x: undefined,
          y: undefined,
        },
        menuItems: [],
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          name: '',
          description: '',
          type: '',
          method: '',
          creatUser: '',
          approveUser: '',
          approveTime: '',
          isvalid: '',
          testingBasis: '',
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          name: [{ required: true, message: '项目名称不能为空', trigger: 'blur' }],
        },
        //实验项目表单y验证
        Titlerules: {
          name: [{ required: true, message: '项目名称不能为空', trigger: 'blur' }],
        },
        //  实验方法主表导入参数
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
          // headers: {Authorization: "Bearer " + getToken()},
          // 上传的地址
          // url: process.env.VUE_APP_BASE_API + "/cdc/method/importData"
        },
        //样品类型
        sampleOptions: [],
        //实验方法
        experimentOptions: [],
      };
    },
    created() {
      //获取样品类型字典
      getDicts('sample_type').then((response) => {
        this.sampleOptions = response.data;
      });
      //获取实验方法字典
      getDicts('test_method').then((response) => {
        this.experimentOptions = response.data;
      });

      this.getList();
    },

    mounted() {
      document.addEventListener('click', () => {
        this.contextMenu.visible = false;
      });
    },

    methods: {
      //接口测试
      // resetCeshi() {
      //   ceshi({pageSize: 10, pageNum: 1}).then(response => {
      //
      //   })
      // },

      /** 查询实验方法主表列表 */
      getList() {
        this.loading = true;
        listMethod(this.queryParams).then((response) => {
          this.$refs.cdcTStep.methodId = undefined;
          this.$refs.cdcTStep.stepList = [];
          this.getIndex = undefined;
          this.methodList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
      },

      // 取消按钮
      cancel() {
        // this.open = false;
        // this.reset();
        this.resetTitle();
        this.btnTextMain = '确 定';
      },
      // 表单重置
      reset() {
        this.form = {
          id: undefined,
          name: undefined,
          description: undefined,
          createTime: undefined,
          type: undefined,
          deptId: undefined,
          method: undefined,
          creatUser: undefined,
          approveUser: undefined,
          approveTime: undefined,
          isvalid: undefined,
          testingBasis: undefined,
        };
      },
      tableRowClassName({ row, rowIndex }) {
        row.index = rowIndex;
      },
      selectedstyle({ row, rowIndex }) {
        if (this.getIndex === rowIndex) {
          return { 'background-color': '#FFCC00' };
          // return { "background-color": "#F0FFF0" };
        }
      },

      //表格右键事件
      handleRightClick(row, column, event) {
        this.menuItems = [
          { label: '新增', method: 'handleAdd', param: row, hasPermi: ['hsw:method:add'] },
          { label: '修改', method: 'handleUpdate', param: row, hasPermi: ['hsw:method:edit'] },
          { label: '删除', method: 'handleDelete', param: row, hasPermi: ['hsw:method:remove'] },
          { label: '审核', method: 'handleExamine', param: row, hasPermi: ['hsw:method:check'] },
        ];

        event.preventDefault();
        this.contextMenu = {
          visible: true,
          x: event.clientX,
          y: event.clientY,
          rowData: row,
        };
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
      //初始化主数据录入框
      resetTitle() {
        this.Titleform = {
          name: undefined,
          description: undefined,
          type: undefined,
          method: undefined,
          creatUser: undefined,
          approveUser: undefined,
          approveTime: undefined,
          isvalid: undefined,
          testingBasis: undefined,
        };
      },

      /** 新增按钮操作 */
      handleAdd() {
        this.btnTextMain = '确 定';
        this.resetTitle();

        // this.$refs.cdcTStep.detailOpen = true;
        // this.$refs.cdcTStep.mainTitle = "新增实验方法";
        // this.$refs.cdcTStep.mainDrawer = true;
        // this.$refs.cdcTStep.detailType = 1
        // this.$refs.cdcTStep.stepId = undefined
        // this.reset();
        // this.open = true;
        // this.title = "添加实验方法";
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.btnTextMain = '保 存';
        this.resetTitle();
        this.Titleform = {
          id: row.id,
          name: row.name,
          description: row.description,
          type: row.type,
          method: row.method,
          creatUser: row.creatUser,
          approveUser: row.approveUser,
          approveTime: row.approveTime,
          isvalid: row.isvalid,
          testingBasis: row.testingBasis,
        };
        // const id = row.id || this.ids
        // this.$refs.cdcTStep.handleUpdateTitle(id)
        // this.$refs.cdcTStep.detailType = 2
      },

      //明细
      handleDetail() {
        this.$refs.cdcTStep.detailOpen = true;
      },
      //获得字典值
      showDictValue(val, dictArr) {
        if (val !== '' && val !== undefined && val !== null) {
          const label = dictArr.filter((item) => item.dictValue == val)[0];
          if (label != undefined) {
            return dictArr.filter((item) => item.dictValue == val)[0].dictLabel;
          }
        }
      },

      //单机式查询步骤信息
      getDeptData(row) {
        this.getIndex = row.index;
        this.$refs.cdcTStep.methodRow = row;
        this.$refs.cdcTStep.getList(row.id);
      },

      // 审核
      handleExamine() {
        console.log('审核');
      },

      /** 提交按钮 */
      submitForm: function () {
        this.$refs['Titleform'].validate((valid) => {
          if (valid) {
            if (this.Titleform.id != undefined) {
              updateMethod(this.Titleform).then((response) => {
                if (response.code === 200) {
                  this.$modal.msgSuccess('修改成功');
                  // this.open = false;
                  this.getList();
                  this.resetTitle();
                  this.btnTextMain = '确 定';
                }
              });
            } else {
              addMethod(this.Titleform).then((response) => {
                if (response.code === 200) {
                  this.$modal.msgSuccess('新增成功');
                  // this.open = false;
                  this.getList();
                  this.resetTitle();
                  this.btnTextMain = '确 定';
                }
              });
            }
          }
        });
      },
      //静默删除
      handleDeleteMetsilent(row) {
        this.$nextTick(() => {
          delMethod(row).then((res) => {
            this.getList();
          });
        });
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const ids = row.id || this.ids;
        this.$confirm('是否确认删除实验方法主表编号为"' + ids + '"的数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(function () {
            return delMethod(ids);
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
        this.$confirm('是否确认导出所有实验方法主表数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(function () {
            return exportMethod(queryParams);
          })
          .then((response) => {
            this.download(response.msg);
          })
          .catch(function () {});
      },
      handleImport() {
        this.upload.title = '实验方法主表导入';
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

<style scoped lang="scss">
  ::v-deep .el-dialog .el-dialog__body {
    padding: 20px 15px;
  }

  ::v-deep .el-dialog .el-form-item--small.el-form-item {
    margin-bottom: 5px;
  }
</style>
