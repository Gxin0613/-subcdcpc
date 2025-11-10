<!--实验步骤结论-->
<template>
  <div>
    <el-drawer
      title="结论维护"
      size="25%"
      v-model="drawer"
      :direction="direction"
      :before-close="handleClose">
      <div style="padding: 0 15px 0 15px">
        <el-row>
          <el-col :span="1.5">
            <el-button
              type="primary"
              size="small"
              @click="handleAdd"
              v-hasPermi="['app:option:add']"
            >新增
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              style="margin-left: 10px"
              type="success"
              size="small"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['app:option:edit']"
            >修改
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              style="margin-left: 10px"
              type="danger"
              size="small"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['app:option:remove']"
            >删除
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="info"
              icon="el-icon-upload2"
              size="small"
              @click="handleImport"
              v-hasPermi="['app:option:import']"
              v-show="false"
            >导入
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button
              type="warning"
              icon="el-icon-download"
              size="small"
              @click="handleExport"
              v-hasPermi="['app:option:export']"
              v-show="false"
            >导出
            </el-button>
          </el-col>
        </el-row>
        <el-table v-loading="loading" :data="optionList" @selection-change="handleSelectionChange" size="default">
          <el-table-column type="selection" width="55" align="center"/>
<!--          <el-table-column label="id" align="center" prop="id"/>-->
<!--          <el-table-column label="步骤id" align="center" prop="stepId"/>-->
          <el-table-column label="结论" align="center" prop="optionValue">
            <template #default="scope">
              <el-input v-if="scope.row.editing" v-model="scope.row.optionValue" placeholder="请输入结论" size="default"/>
              <span v-else>{{ scope.row.optionValue}}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="scope">
              <div v-if="scope.row.editing">
                <el-button type="text" size="small" @click="saveRow(scope.row)">保存</el-button>
                <el-button type="text" size="small" @click="cancelEdit(scope.row)">取消</el-button>
              </div>
              <div v-else>
                <el-button type="text" size="small" @click="editRow(scope.row)">编辑</el-button>
                <el-button type="text" size="small" @click="handleDelete(scope.row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

    </el-drawer>

    <!-- 添加或修改实验步骤 结论值对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="步骤id" prop="stepId">
          <el-input v-model="form.stepId" placeholder="请输入步骤id"/>
        </el-form-item>
        <el-form-item label="结论下拉值" prop="optionValue">
          <el-input v-model="form.optionValue" placeholder="请输入结论下拉值"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

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
          <em>点击上传</em>
        </div>
        <!--div class="el-upload__tip" slot="tip">
            <el-link type="info" style="font-size:12px" @click="importTemplate">下载模板</el-link>
        </div-->
        <div class="el-upload__tip" style="color:red" slot="tip">提示：仅允许导入“xls”或“xlsx”格式文件！</div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="upload.open = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {
  listStepConclusion,
  getStepConclusion,
  addStepConclusion,
  updateStepConclusion,
  delStepConclusion,
  exportStepConclusion,
  importTemplate
} from "/@/api/hsw/cdc/testMethod/cdcTStepConclusionOption";
// import {getToken} from "@/utils/auth";
import {addVariable, updateVariable} from "/@/api/hsw/cdc/testMethod/cdcTStep";

export default {
  name: "Option",
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
      drawer: false,
      direction: 'rtl',
      // 总条数
      total: 0,
      // 实验步骤 结论值表格数据
      optionList: [],
      selectRows: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      stepId: undefined,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        stepId: undefined,
        optionValue: undefined
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {},
      //  实验步骤 结论值导入参数
      upload: {
        // 是否显示弹出层（用户导入）
        open: false,
        // 弹出层标题（用户导入）
        title: "",
        // 是否禁用上传
        isUploading: false,
        // 是否更新已经存在的用户数据
        updateSupport: 0,
        // 设置上传的请求头部
        // headers: {Authorization: "Bearer " + getToken()},
        // // 上传的地址
        // url: process.env.VUE_APP_BASE_API + "/app/option/importData"
      },
    };
  },
  created() {
    // this.getList();
  },
  watch: {
    drawer: function (val) {
      if(!val){
        this.optionList = this.optionList.filter(item => item.editing == false);
        //当前为新增增加缓存处理
        if(!this.stepId){
          this.$emit("update:paramOptions",this.optionList)
        }
      }
    }
  },
  methods: {
    /** 查询实验步骤 结论值列表 */
    getList() {
      if(!this.stepId){
        return;
      }
      this.loading = true;
      this.queryParams.stepId = this.stepId;
      listStepConclusion(this.queryParams).then(response => {
        this.optionList = response.rows;
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
        stepId: undefined,
        optionValue: undefined
      };
      this.stepId = undefined;
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.selectRows = selection.map(item => item)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      // 关闭所有行的编辑状态
      // this.optionList.forEach(item => {
      //   this.$set(item, 'editing', false);
      // });
      // 添加新行并设置为编辑状态
      const newRow = {
        optionValue:undefined,
        editing: true,
        isNew: true,
        index: this.optionList.length
      };
      this.optionList.unshift(newRow);
      // 自动选中新行
      // this.$nextTick(() => {
      //   this.$refs.table.toggleRowSelection(newRow, true);
      // });
    },

    //保存
    saveRow(row) {
      // 简单验证
      if (!row.optionValue) {
        this.$modal.msgError('参数不能为空');
        return;
      }
      // 构造提交数据
      const formData = {
        optionValue: row.defaultValue,
        stepId: this.stepId,
      };

      //缓存或者保存
      if(this.stepId){
        // 新增或更新
        if (!row.id) {
          addStepConclusion(formData).then(res => {
            debugger
            if (res.code === 200) {
              this.$modal.msgSuccess('添加成功');
              row.id = res.data; // 设置返回的ID
              row.editing = false;
              delete row.isNew;
            }
          });
        } else {
          formData.id = row.id;
          updateVariable(formData).then(res => {
            if (res.code === 200) {
              this.$modal.msgSuccess('修改成功');
              row.editing = false;
            }
          });
        }
      }else {
        row.editing = false;
      }
    },

    //批量保存
    saveRows(stepId){
      for(let item of this.optionList){
      // 构造提交数据
      const formData = {
        optionValue: item.defaultValue,
        stepId: stepId,
      };

      //缓存或者保存
        // 新增或更新
        if (!item.id) {
          addStepConclusion(formData).then(res => {
            if (res.code === 200) {
             console.log("新增成功");
            }
          });
        } else {
          formData.id = item.id;
          updateVariable(formData).then(res => {
            if (res.code === 200) {
              console.log("修改成功");
            }
          });
        }
      }
    },

    //编辑
    cancelEdit(row) {
      if (row.isNew) {
        // 移除新增行
        this.optionList = this.optionList.filter(item => !(item.isNew && item === row));
      } else {
        // 恢复原始数据
        Object.assign(row, row.originalData);
        row.editing = false;
      }
    },
    handleEditRow() {
      if (this.variableIds.length > 0) {
        const row = this.dealList.find(item => item.id === this.variableIds[0]);
        if (row) this.editRow(row);
      }
    },
    editRow(row) {
      // 先关闭所有行的编辑状态
      this.optionList.forEach(item => {
        if (item.editing && item !== row) {
          // this.$set(item, 'editing', false);
          item['editing'] = false;
        }
      });
      // 保存原始数据用于取消编辑
      row.originalData = {...row};
      // this.$set(row, 'editing', true);
      row['editing'] = true;
    },

    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getStepConclusion(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改实验步骤 结论值";
      });
    },
    //参数维护关闭事件
    handleClose(done) {
      done();
    },

    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateStepConclusion(this.form).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              }
            });
          } else {
            addStepConclusion(this.form).then(response => {
              if (response.code === 200) {
                this.$modal.msgSuccess("新增成功");
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
      let that = this;
      const ids = this.selectRows.length ==0 ? [row] : this.selectRows;
      let deleteIds = []
      let noIds = []
      ids.forEach(item => {
        if(item.id != undefined && item.id != null && item.id != ''){
          //缓存id
          deleteIds.push(item.id)
        }else {
          //缓存索引
          noIds.push(item.index)
        }
      })

      this.$confirm('是否确认删除的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        if(deleteIds.length != 0){
          return delStepConclusion(deleteIds);
        }
        if(noIds.length != 0){
          noIds.forEach(itemDelete => {
            that.optionList =  that.optionList.filter(item =>
              !noIds.includes(item.index));
          })
        }
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(function () {
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有实验步骤 结论值数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportStepConclusion(queryParams);
      }).then(response => {
        this.download(response.msg);
      }).catch(function () {
      });
    },
    handleImport() {
      this.upload.title = "实验步骤 结论值导入";
      this.upload.open = true;
    },
    /** 下载模板操作 */
    importTemplate() {
      importTemplate().then(response => {
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
      this.$alert(response.msg, "导入结果", {dangerouslyUseHTMLString: true});
      this.getList();
    },
    // 提交上传文件
    submitFileForm() {
      this.$refs.upload.submit();
    }
  }
};
</script>
