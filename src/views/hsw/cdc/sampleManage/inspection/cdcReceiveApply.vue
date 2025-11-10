<!-- 实验方法 -->
<template>
  <div class="app-container" style="height: 82vh">
    <splitpanes class="default-theme" horizontal>
      <!--检测项目数据-->
      <pane size="50">
        <el-col>
          <div>
            <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px" style="margin-top: 5px">
              <el-form-item label="批次编号" prop="batchNo">
                <el-input v-model="queryParams.batchNo" placeholder="请输入接收批次编号" clearable />
              </el-form-item>
              <el-form-item label="受检单位" prop="inspectedUnit">
                <el-input v-model="queryParams.inspectedUnit" placeholder="请输入受检单位" clearable />
              </el-form-item>
              <el-form-item label="采样日期" prop="sendSampleDate">
                <el-date-picker clearable style="width: 120px" v-model="queryParams.sendSampleDate" type="date" value-format="yyyy-MM-dd" placeholder="选择采样日期" />
              </el-form-item>
              <el-form-item label="送检日期" prop="inspectionDate">
                <el-date-picker clearable  style="width: 120px" v-model="queryParams.inspectionDate" type="date" value-format="yyyy-MM-dd" placeholder="选择送检日期" />
              </el-form-item>

              <el-form-item label="批次状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="请选择批次状态 0未开始  1实验中  2 完成" clearable  style="width: 90px" >
                  <el-option label="请选择字典生成" value="" />
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" size="default" @click="handleQuery">搜索</el-button>
                <el-button size="default" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>
            <el-row :gutter="10" class="mb8">
              <el-col :span="1.5">
                <el-button type="primary" size="default" @click="handleAdd" v-hasPermi="['app:batch:add']">新增 </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="success" size="default" :disabled="single" @click="handleUpdate" v-hasPermi="['app:batch:edit']" v-show="false">修改 </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="danger" size="default" :disabled="multiple" @click="handleDelete" v-hasPermi="['app:batch:remove']">删除 </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="info" size="default" @click="handleImport" v-hasPermi="['app:batch:import']" v-show="false">导入 </el-button>
              </el-col>
              <el-col :span="1.5">
                <el-button type="warning" size="default" @click="handleExport" v-hasPermi="['app:batch:export']" v-show="false">导出 </el-button>
              </el-col>
            </el-row>
            <el-table v-loading="loading" :data="batchList" @selection-change="handleSelectionChange" size="small">
              <el-table-column type="selection" width="55" align="center" />
              <!--                    <el-table-column label="批次ID，主键" align="center" prop="batchId" />-->
              <el-table-column label="批次编号" align="right" prop="batchNo" show-overflow-tooltip width="90" />
              <el-table-column label="受检单位" align="right" prop="inspectedUnit" show-overflow-tooltip width="90" />
              <el-table-column label="详细地址" align="right" prop="detailedAddress" show-overflow-tooltip width="90" />
              <el-table-column label="电话" align="right" prop="telephone" show-overflow-tooltip width="90" />
              <el-table-column label="联系人" align="right" prop="contactPerson" show-overflow-tooltip width="90" />
              <el-table-column label="邮编" align="right" prop="postalCode" show-overflow-tooltip width="90" />
              <el-table-column label="传真" align="right" prop="fax" show-overflow-tooltip width="90" />
              <el-table-column label="采样日期" align="right" prop="sendSampleDate" width="120">
                <template #default="scope">
                  <span v-if="scope">{{ parseTime(scope.row.sendSampleDate, '{y}-{m}-{d}') }}</span>
                  <span v-else></span>
                </template>
              </el-table-column>
              <el-table-column label="送检日期" align="center" prop="inspectionDate" width="180">
                <template #default="scope">
                  <span v-if="scope">{{ parseTime(scope.row.inspectionDate, '{y}-{m}-{d}') }}</span>
                  <span v-else></span>
                </template>
              </el-table-column>
              <el-table-column label="依据标准" align="center" prop="standardReference" />
              <el-table-column label="检验原因" align="center" prop="inspectionReason" />
              <el-table-column label="送样人" align="center" prop="sampleSender" />
              <el-table-column label="检验要求" align="center" prop="inspectionRequirements" />
              <!--                    <el-table-column label="状态" align="center" prop="delStatus" />-->
              <el-table-column label="批次状态" align="center" prop="status" />
              <el-table-column label="委托单位" align="center" prop="commissionUnit" show-overflow-tooltip />
              <el-table-column label="委托单位地址" align="center" prop="commissionAddress" show-overflow-tooltip width="110" />
              <el-table-column label="委托单位联系人" align="center" prop="commissionContact" show-overflow-tooltip width="120" />
              <el-table-column label="委托单位电话" align="center" prop="commissionPhone" show-overflow-tooltip width="120" />
              <el-table-column label="报告交付方式" align="center" prop="reportSendType" show-overflow-tooltip width="110" />
              <el-table-column label="是否退样" align="center" prop="sampleReturn" width="90" />
              <el-table-column label="退样接收人" align="center" prop="returnPerson" show-overflow-tooltip width="90" />
              <el-table-column label="委托单位客户签字" align="center" prop="commissionSign" show-overflow-tooltip width="130" />
              <el-table-column label="委托单位客户签字日期" align="center" prop="commissionSigndate" width="180">
                <template #default="scope">
                  <span v-if="scope">{{ parseTime(scope.row.commissionSigndate, '{y}-{m}-{d}') }}</span>
                  <span v-else></span>
                </template>
              </el-table-column>
              <el-table-column label="样品受理与评审人员签名" align="center" prop="reviewSign" show-overflow-tooltip width="180" />
              <el-table-column label="样品受理与评审人员签名日期" align="center" prop="reviewSigndate" width="180">
                <template #default="scope">
                  <span v-if="scope">{{ parseTime(scope.row.reviewSigndate, '{y}-{m}-{d}') }}</span>
                  <span v-else></span>
                </template>
              </el-table-column>
              <!--                    <el-table-column label="0申请1受理2任务" align="center" prop="batchStatus" />-->
              <!--              <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right">-->
              <!--                <template slot-scope="scope">-->
              <!--                  <el-button-->
              <!--                    size="mini"-->
              <!--                    type="text"-->
              <!--                    icon="el-icon-edit"-->
              <!--                    @click="handleUpdate(scope.row)"-->
              <!--                    v-hasPermi="['app:batch:edit']"-->
              <!--                  >修改-->
              <!--                  </el-button>-->
              <!--                  <el-button-->
              <!--                    size="mini"-->
              <!--                    type="text"-->
              <!--                    icon="el-icon-delete"-->
              <!--                    @click="handleDelete(scope.row)"-->
              <!--                    v-hasPermi="['app:batch:remove']"-->
              <!--                  >删除-->
              <!--                  </el-button>-->
              <!--                </template>-->
              <!--              </el-table-column>-->
            </el-table>

            <!--                  <pagination-->
            <!--                    v-show="total>0"-->
            <!--                    :total="total"-->
            <!--                    :page.sync="queryParams.pageNum"-->
            <!--                    :limit.sync="queryParams.pageSize"-->
            <!--                    @pagination="getList"-->
            <!--                  />-->
          </div>
        </el-col>
      </pane>
      <!--                        <div class="formTitle">受检方信息</div>-->
      <pane size="36">
        <el-col>
          <div>
            <!--            样品明细-->
            <cdcSampleDetail ref="cdcSampleDetail" />
          </div>
        </el-col>
      </pane>
    </splitpanes>
    <el-dialog title="新增" v-model="drawOpen" width="30%">
      <el-form ref="form" :model="form" :rules="rules" label-width="95px" label-position="left">
        <div style="height: 30vh; overflow: auto">
          <!--                        <el-form-item label="接收批次编号" prop="batchNo">-->
          <!--                          <el-input v-model="form.batchNo" placeholder="请输入接收批次编号" />-->
          <!--                        </el-form-item>-->
          <el-row>
            <el-col :span="6">
              <el-form-item label="受检单位" prop="inspectedUnit">
                <el-input v-model="form.inspectedUnit" placeholder="请输入受检单位" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="详细地址" prop="detailedAddress">
                <el-input v-model="form.detailedAddress" placeholder="请输入详细地址" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="电话" prop="telephone">
                <el-input v-model="form.telephone" placeholder="请输入电话" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="联系人" prop="contactPerson">
                <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="邮编" prop="postalCode">
                <el-input v-model="form.postalCode" placeholder="请输入邮编" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="传真" prop="fax">
                <el-input v-model="form.fax" placeholder="请输入传真" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="采样日期" prop="sendSampleDate">
                <el-date-picker clearable size="mini" style="width: 200px" v-model="form.sendSampleDate" type="date" value-format="yyyy-MM-dd" placeholder="选择采样日期" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="送检日期" prop="inspectionDate">
                <el-date-picker clearable size="mini" style="width: 100%" v-model="form.inspectionDate" type="date" value-format="yyyy-MM-dd" placeholder="选择送检日期" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="依据标准" prop="standardReference">
                <el-input v-model="form.standardReference" placeholder="请输入依据标准" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="检验原因" prop="inspectionReason">
                <el-input v-model="form.inspectionReason" placeholder="请输入检验原因" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="送样人" prop="sampleSender">
                <el-input v-model="form.sampleSender" placeholder="请输入送样人" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="检验要求" prop="inspectionRequirements">
                <el-input v-model="form.inspectionRequirements" placeholder="请输入检验要求" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="委托单位" prop="commissionUnit">
                <el-input v-model="form.commissionUnit" placeholder="请输入委托单位" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="委托单位地址" prop="commissionAddress">
                <el-input v-model="form.commissionAddress" placeholder="请输入委托单位地址" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="委托单位联系人" prop="commissionContact">
                <el-input v-model="form.commissionContact" placeholder="请输入委托单位联系人" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="委托单位电话" prop="commissionPhone">
                <el-input v-model="form.commissionPhone" placeholder="请输入委托单位电话" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="报告交付方式">
                <el-select v-model="form.reportSendType" placeholder="请选择报告交付方式">
                  <el-option label="请选择字典生成" value="" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="是否退样" prop="sampleReturn">
                <el-input v-model="form.sampleReturn" placeholder="请输入是否退样" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="退样接收人" prop="returnPerson">
                <el-input v-model="form.returnPerson" placeholder="请输入退样接收人" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
    <el-drawer :title="title" v-model="drawer" size="70%" direction="rtl">
      <div style="height: 100%">
        <!--        <div class="divtitle" style="height: 100%;display:grid;padding:15px;margin-bottom: 15px">-->
        <div class="title_css">检测申请单</div>
        <el-form ref="form" :model="form" :rules="rules" label-width="85px" size="mini" label-position="left">
          <div style="padding: 15px">
            <el-row>
              <el-col :span="6">
                <el-form-item label="受检单位" prop="inspectedUnit">
                  <el-input v-model="form.inspectedUnit" placeholder="请输入受检单位" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="详细地址" prop="detailedAddress">
                  <el-input v-model="form.detailedAddress" placeholder="请输入详细地址" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="电话" prop="telephone">
                  <el-input v-model="form.telephone" placeholder="请输入电话" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="联系人" prop="contactPerson">
                  <el-input v-model="form.contactPerson" placeholder="请输入联系人" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="邮编" prop="postalCode">
                  <el-input v-model="form.postalCode" placeholder="请输入邮编" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="传真" prop="fax">
                  <el-input v-model="form.fax" placeholder="请输入传真" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="采样日期" prop="sendSampleDate">
                  <el-date-picker clearable size="mini" style="width: 100%" v-model="form.sendSampleDate" type="date" value-format="yyyy-MM-dd" placeholder="选择采样日期" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="送检日期" prop="inspectionDate">
                  <el-date-picker clearable size="mini" style="width: 100%" v-model="form.inspectionDate" type="date" value-format="yyyy-MM-dd" placeholder="选择送检日期" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="依据标准" prop="standardReference">
                  <el-input v-model="form.standardReference" placeholder="请输入依据标准" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="检验原因" prop="inspectionReason">
                  <el-input v-model="form.inspectionReason" placeholder="请输入检验原因" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="送样人" prop="sampleSender">
                  <el-input v-model="form.sampleSender" placeholder="请输入送样人" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="检验要求" prop="inspectionRequirements">
                  <el-input v-model="form.inspectionRequirements" placeholder="请输入检验要求" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="委托单位" prop="commissionUnit">
                  <el-input v-model="form.commissionUnit" placeholder="请输入委托单位" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="地址" prop="commissionAddress">
                  <el-input v-model="form.commissionAddress" placeholder="请输入委托单位地址" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="联系人" prop="commissionContact">
                  <el-input v-model="form.commissionContact" placeholder="请输入委托单位联系人" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="电话" prop="commissionPhone">
                  <el-input v-model="form.commissionPhone" placeholder="请输入委托单位电话" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="交付方式">
                  <el-select v-model="form.reportSendType" placeholder="请选择报告交付方式" style="width: 100%">
                    <el-option label="请选择字典生成" value="" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="是否退样" prop="sampleReturn">
                  <el-input v-model="form.sampleReturn" placeholder="请输入是否退样" />
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="退样接收人" prop="returnPerson">
                  <el-input v-model="form.returnPerson" placeholder="请输入退样接收人" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>
        </el-form>
        <!--        </div>-->
        <!--        <div class="divtitle" style="height: 45vh;padding:15px">-->
        <div class="title_css" style="margin-bottom: 5px; margin-top: 15px">样品明细</div>
        <cdcSampleDetail ref="cdcSampleDetail" />
        <!--        </div>-->
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="open = false">取 消</el-button>
      </div>
    </el-drawer>
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
    importTemplate
  } from "/@/api/hsw/cdc/sampleManage/cdcSampleReceiveBatch.js";
  import { useUserStore } from '/@/store/modules/user';

  import { Splitpanes, Pane } from 'splitpanes';
  import 'splitpanes/dist/splitpanes.css';
  //样品明细
  import cdcSampleDetail from './cdcSampleDetail.vue';

  export default {
    //import引入的组件需要注入到对象中才能使用
    components: { Splitpanes, Pane, cdcSampleDetail },
    data() {
      //这里存放数据
      return {
        loading: false,
        batchList: [],
        drawer: false,
        title: undefined,
        single:true,
        multiple: true,
        rules: {},
        form: {},
        //主数据明细数据
        drawOpen: false,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          batchNo: undefined,
          inspectedUnit: undefined,
          detailedAddress: undefined,
          telephone: undefined,
          contactPerson: undefined,
          postalCode: undefined,
          fax: undefined,
          sendSampleDate: undefined,
          inspectionDate: undefined,
          standardReference: undefined,
          inspectionReason: undefined,
          sampleSender: undefined,
          inspectionRequirements: undefined,
          delStatus: undefined,
          status: undefined,
          commissionUnit: undefined,
          commissionAddress: undefined,
          commissionContact: undefined,
          commissionPhone: undefined,
          reportSendType: undefined,
          sampleReturn: undefined,
          returnPerson: undefined,
          commissionSign: undefined,
          commissionSigndate: undefined,
          reviewSign: undefined,
          reviewSigndate: undefined,
          batchStatus: undefined,
        },
      };
    },
    watch: {
      //主从表一起添加事件
      drawer: function (val) {
        if (val) {
          this.$nextTick(() => {
            this.$refs.cdcSampleDetail.mainAdd = true;
          });
        } else {
          this.$nextTick(() => {
            this.$refs.cdcSampleDetail.mainAdd = false;
          });
        }
      }
    },
    mounted() {
      // 默认显示第一条数据
      // if (this.tableData.length > 0) {
      //   this.formDataOne = { ...this.tableData[0] };
      //   this.currentRow = { ...this.tableData[0] };
      // }
    },
    methods: {
      /** 查询检测申请单主列表 */
      getList() {
        this.loading = true;
        listBatch(this.queryParams).then((response) => {
          this.batchList = response.rows;
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
          batchId: undefined,
          batchNo: undefined,
          inspectedUnit: undefined,
          detailedAddress: undefined,
          telephone: undefined,
          contactPerson: undefined,
          postalCode: undefined,
          fax: undefined,
          sendSampleDate: undefined,
          inspectionDate: undefined,
          standardReference: undefined,
          inspectionReason: undefined,
          sampleSender: undefined,
          inspectionRequirements: undefined,
          createTime: undefined,
          createBy: undefined,
          updateTime: undefined,
          updateBy: undefined,
          delStatus: '0',
          status: '0',
          commissionUnit: undefined,
          commissionAddress: undefined,
          commissionContact: undefined,
          commissionPhone: undefined,
          reportSendType: undefined,
          sampleReturn: undefined,
          returnPerson: undefined,
          commissionSign: undefined,
          commissionSigndate: undefined,
          reviewSign: undefined,
          reviewSigndate: undefined,
          batchStatus: '0',
        };
        // this.resetForm('form');
      },
      /** 搜索按钮操作 */
      handleQuery() {
        this.queryParams.pageNum = 1;
        this.getList();
      },
      /** 重置按钮操作 */
      resetQuery() {
        // this.resetForm('queryForm');
        this.handleQuery();
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map((item) => item.batchId);
        this.single = selection.length != 1;
        this.multiple = !selection.length;
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.drawer = true;
        this.title = '添加检测申请单';
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.reset();
        const batchId = row.batchId || this.ids;
        getBatch(batchId).then((response) => {
          this.form = response.data;
          this.open = true;
          this.title = '修改检测申请单主';
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            if (this.form.batchId != undefined) {
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
        const batchIds = row.batchId || this.ids;
        this.$confirm('是否确认删除检测申请单主编号为"' + batchIds + '"的数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(function () {
            return delBatch(batchIds);
          })
          .then(() => {
            this.getList();
            this.msgSuccess('删除成功');
          })
          .catch(function () {});
      },
      /** 导出按钮操作 */
      handleExport() {
        // const queryParams = this.queryParams;
        // this.$confirm('是否确认导出所有检测申请单主数据项?', '警告', {
        //   confirmButtonText: '确定',
        //   cancelButtonText: '取消',
        //   type: 'warning',
        // })
        //   .then(function () {
        //     return exportBatch(queryParams);
        //   })
        //   .then((response) => {
        //     this.download(response.msg);
        //   })
        //   .catch(function () {});
      },
      handleImport() {
        this.upload.title = '检测申请单主导入';
        this.upload.open = true;
      },
      /** 下载模板操作 */
      importTemplate() {
        // importTemplate().then((response) => {
        //   this.download(response.msg);
        // });
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
<style lang="scss" scoped>
  .formBox {
    width: 100%;
    height: 100%;
    // padding: 10px;
    padding-top: 5px;
  }

  .formTitle {
    width: 100%;
    text-align: center;
    font-size: 16px;
    font-weight: 700;
    margin: 10px 0px;
  }

  .optionTitle {
    font-weight: 500;
    line-height: 30px;
  }

  .title_css {
    display: flex;
    height: 25px;
    font-size: 15px;
    text-align: center;
    background-color: aliceblue;
    font-weight: 600;
    margin-bottom: 15px;
    justify-items: center;
    align-items: center;
    justify-content: center;
  }

  //.table-container {
  //  flex: 1;
  //  position: relative;
  //}
  //::v-deep .el-table {
  //  margin-top: 0;
  //  //position: absolute;
  //  //height: 100%;
  //}

  ::v-deep .el-table__empty-block {
    min-height: 26vh;
  }

  ::v-deep .el-table {
    margin-top: 0;
  }

  ::v-deep .el-form-item--mini.el-form-item {
    margin-right: 15px;
  }

  ::v-deep .splitpanes.default-theme .splitpanes__pane {
    background: #ffffff;
  }
</style>
