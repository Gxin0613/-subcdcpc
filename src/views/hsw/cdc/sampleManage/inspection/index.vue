<!--  -->
<template>
  <div class="app-container" style="height: 82vh">
    <splitpanes class="default-theme" horizontal>
      <!--检测项目数据-->
      <pane size="50">
        <el-col>
          <div>
            <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px" size="default"
                     class="query_form"
                     style="margin-top: 5px">
              <el-form-item label="批次编号" prop="batchNo">
                <el-input
                  style="width: 120px"
                  v-model="queryParams.batchNo"
                  placeholder="请输入接收批次编号"
                  clearable
                  size="default"
                  @keyup.enter.native="handleQuery"
                />
              </el-form-item>
              <el-form-item label="受检单位" prop="inspectedUnit">
                <el-input
                  style="width: 120px"
                  v-model="queryParams.inspectedUnit"
                  placeholder="请输入受检单位"
                  clearable
                  @keyup.enter.native="handleQuery"
                />
              </el-form-item>
              <el-form-item label="采样日期" prop="sendSampleDate">
                <el-date-picker clearable size="default" style="width: 120px"
                                v-model="queryParams.sendSampleDate"
                                type="date"
                                value-format="yyyy-MM-dd"
                                placeholder="选择采样日期">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="送检日期" prop="inspectionDate">
                <el-date-picker clearable size="default" style="width: 120px"
                                v-model="queryParams.inspectionDate"
                                type="date"
                                value-format="yyyy-MM-dd"
                                placeholder="选择送检日期">
                </el-date-picker>
              </el-form-item>

              <el-form-item label="批次状态" prop="status">
                <el-select v-model="queryParams.status" placeholder="请选择批次状态" style="width: 80px">
                  <el-option
                    v-for="item in statusOptions"
                    :key="item.dictValue"
                    :label="item.dictLabel"
                    :value="item.dictValue">
                  </el-option>
                </el-select>
              </el-form-item>

              <el-form-item>
                <el-button type="primary"  size="default" @click="handleQuery">搜索</el-button>
                <el-button  size="default" @click="resetQuery">重置</el-button>
              </el-form-item>
            </el-form>
            <el-row :gutter="10" class="mb8">
                <el-col :span="1.5">
                  <el-button
                    type="primary"
                    size="default"
                    @click="handleAdd"
                    v-hasPermi="['app:batch:add']"
                  >新增
                  </el-button>
                </el-col>
                <el-col :span="1.5">
                  <el-button
                    type="success"
                    size="default"
                    :disabled="single"
                    @click="handleUpdate"
                    v-hasPermi="['app:batch:edit']"
                  >修改
                  </el-button>
                </el-col>
                <el-col :span="1.5">
                  <el-button
                    type="danger"
                    size="default"
                    :disabled="multiple"
                    @click="handleDelete"
                    v-hasPermi="['app:batch:remove']"
                  >删除
                  </el-button>
                </el-col>
                <el-col :span="1.5">
                  <el-button
                    type="info"
                    size="default"
                    @click="handleImport"
                    v-hasPermi="['app:batch:import']"
                    v-show="false"
                  >导入
                  </el-button>
                </el-col>
                <el-col :span="1.5">
                  <el-button
                    type="warning"
                    size="default"
                    @click="handleExport"
                    v-hasPermi="['app:batch:export']"
                    v-show="false"
                  >导出
                  </el-button>
                </el-col>
            </el-row>
            <el-table v-loading="loading" :data="batchList" @selection-change="handleSelectionChange" size="small" @cell-click="getDetail"   :row-style="selectedstyle"
                      :row-class-name="tableRowClassName" >
              <el-table-column type="selection" width="55" align="center"/>
              <!--                    <el-table-column label="批次ID，主键" align="center" prop="batchId" />-->
              <el-table-column label="批次编号" align="right" prop="batchNo" show-overflow-tooltip
                               width="105"/>
              <el-table-column label="受检单位" align="right" prop="inspectedUnit" show-overflow-tooltip
                               width="90"/>
              <el-table-column label="详细地址" align="right" prop="detailedAddress" show-overflow-tooltip
                               width="90"/>
              <el-table-column label="电话" align="right" prop="telephone" show-overflow-tooltip width="90"/>
              <el-table-column label="联系人" align="right" prop="contactPerson" show-overflow-tooltip
                               width="90"/>
              <el-table-column label="邮编" align="right" prop="postalCode" show-overflow-tooltip width="90"/>
              <el-table-column label="传真" align="right" prop="fax" show-overflow-tooltip width="90"/>
              <el-table-column label="采样日期" align="right" prop="sendSampleDate" width="120">
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.sendSampleDate, '{y}-{m}-{d}') }}</span>
                </template>
              </el-table-column>
              <el-table-column label="送检日期" align="center" prop="inspectionDate" width="180">
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.inspectionDate, '{y}-{m}-{d}') }}</span>
                </template>
              </el-table-column>
              <el-table-column label="依据标准" align="center" prop="standardReference"/>
              <el-table-column label="检验原因" align="center" prop="inspectionReason"/>
              <el-table-column label="送样人" align="center" prop="sampleSender"/>
              <el-table-column label="检验要求" align="center" prop="inspectionRequirements"/>
              <!--                    <el-table-column label="状态" align="center" prop="delStatus" />-->
              <el-table-column label="批次状态" align="center" prop="status"/>
              <el-table-column label="委托单位" align="center" prop="commissionUnit" show-overflow-tooltip/>
              <el-table-column label="委托单位地址" align="center" prop="commissionAddress"
                               show-overflow-tooltip
                               width="110"/>
              <el-table-column label="委托单位联系人" align="center" prop="commissionContact"
                               show-overflow-tooltip
                               width="120"/>
              <el-table-column label="委托单位电话" align="center" prop="commissionPhone"
                               show-overflow-tooltip
                               width="120"/>
              <el-table-column label="报告交付方式" align="center" prop="reportSendType" show-overflow-tooltip
                               width="110"/>
              <el-table-column label="是否退样" align="center" prop="sampleReturn" width="90"/>
              <el-table-column label="退样接收人" align="center" prop="returnPerson" show-overflow-tooltip
                               width="90"/>
              <el-table-column label="委托单位客户签字" align="center" prop="commissionSign"
                               show-overflow-tooltip
                               width="130"/>
              <el-table-column label="委托单位客户签字日期" align="center" prop="commissionSigndate"
                               width="180">
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.commissionSigndate, '{y}-{m}-{d}') }}</span>
                </template>
              </el-table-column>
              <el-table-column label="样品受理与评审人员签名" align="center" prop="reviewSign"
                               show-overflow-tooltip
                               width="180"/>
              <el-table-column label="样品受理与评审人员签名日期" align="center" prop="reviewSigndate"
                               width="180">
                <template slot-scope="scope">
                  <span>{{ parseTime(scope.row.reviewSigndate, '{y}-{m}-{d}') }}</span>
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
            <cdcSampleDetail ref="cdcSampleDetail"></cdcSampleDetail>
          </div>
        </el-col>
      </pane>
    </splitpanes>
    <el-dialog
      :title="title"
      :visible.sync="open"
      width="650px"
    >
      <el-form ref="form" :model="form" :rules="rules" label-width="85px" size="mini" label-position="left">
        <div>
          <el-row>
            <el-col :span="12">
              <el-form-item label="委托单位" prop="commissionUnit">
                <el-input v-model="form.commissionUnit" placeholder="请输入委托单位"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="地址" prop="commissionAddress">
                <el-input v-model="form.commissionAddress" placeholder="请输入委托单位地址"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系人" prop="commissionContact">
                <el-input v-model="form.commissionContact" placeholder="请输入委托单位联系人"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="电话" prop="commissionPhone">
                <el-input v-model="form.commissionPhone" placeholder="请输入委托单位电话"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="受检单位" prop="inspectedUnit">
                <el-input v-model="form.inspectedUnit" placeholder="请输入受检单位"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="地址" prop="detailedAddress">
                <el-input v-model="form.detailedAddress" placeholder="请输入详细地址"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="电话" prop="telephone">
                <el-input v-model="form.telephone" placeholder="请输入电话"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系人" prop="contactPerson">
                <el-input v-model="form.contactPerson" placeholder="请输入联系人"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="邮编" prop="postalCode">
                <el-input v-model="form.postalCode" placeholder="请输入邮编"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="传真" prop="fax">
                <el-input v-model="form.fax" placeholder="请输入传真"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="检验原因" prop="inspectionReason">
                <el-input v-model="form.inspectionReason" placeholder="请输入检验原因"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="依据标准" prop="standardReference">
                <el-input v-model="form.standardReference" placeholder="请输入依据标准"/>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="送样人" prop="sampleSender">
                <el-input v-model="form.sampleSender" placeholder="请输入送样人"/>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="采样日期" prop="sendSampleDate">
                <el-date-picker clearable size="mini" style="width: 100%"
                                v-model="form.sendSampleDate"
                                type="date"
                                value-format="yyyy-MM-dd"
                                placeholder="选择采样日期">
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="送检日期" prop="inspectionDate">
                <el-date-picker clearable size="mini" style="width: 100%"
                                v-model="form.inspectionDate"
                                type="date"
                                value-format="yyyy-MM-dd"
                                placeholder="选择送检日期">
                </el-date-picker>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="检验要求" prop="inspectionRequirements">
                <el-input v-model="form.inspectionRequirements" placeholder="请输入检验要求"/>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="交付方式" prop="reportSendType">
                <el-select v-model="form.reportSendType" placeholder="请选择交付方式"  style="width: 100%">
                  <el-option
                    v-for="item in reportSendTypeOptions"
                    :key="item.dictValue"
                    :label="item.dictLabel"
                    :value="item.dictValue">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="是否退样" prop="sampleReturn">
                <el-radio-group v-model="form.sampleReturn">
                  <el-radio :label="0">否</el-radio>
                  <el-radio :label="1">是</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="10">
            <el-col :span="12">
              <el-form-item label="退样接收人" prop="returnPerson">
                <el-input v-model="form.returnPerson" placeholder="请输入退样接收人" :disabled="form.sampleReturn== 0" />"
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
    <el-dialog
      :title="title"
      :visible.sync="drawer"
      width="70%"
      direction="rtl"
    >
      <el-row>
        <splitpanes class="default-theme">
          <!--检测项目数据-->
          <pane size="36">
            <!--      <div style="height: 100%;padding: 0 15px 0 15px">-->
<!--            <div class="divtitle" style="height: 100%;display:grid;">-->
              <div class="title_css">检测申请单</div>
              <el-form ref="form" :model="form" :rules="rules" label-width="85px" size="mini" label-position="left">
                <div>
                  <el-row>
                    <el-col :span="12">
                      <el-form-item label="委托单位" prop="commissionUnit">
                        <el-input v-model="form.commissionUnit" placeholder="请输入委托单位"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="地址" prop="commissionAddress">
                        <el-input v-model="form.commissionAddress" placeholder="请输入委托单位地址"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="联系人" prop="commissionContact">
                        <el-input v-model="form.commissionContact" placeholder="请输入委托单位联系人"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="电话" prop="commissionPhone">
                        <el-input v-model="form.commissionPhone" placeholder="请输入委托单位电话"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="受检单位" prop="inspectedUnit">
                        <el-input v-model="form.inspectedUnit" placeholder="请输入受检单位"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="地址" prop="detailedAddress">
                        <el-input v-model="form.detailedAddress" placeholder="请输入详细地址"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="电话" prop="telephone">
                        <el-input v-model="form.telephone" placeholder="请输入电话"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="联系人" prop="contactPerson">
                        <el-input v-model="form.contactPerson" placeholder="请输入联系人"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="邮编" prop="postalCode">
                        <el-input v-model="form.postalCode" placeholder="请输入邮编"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="传真" prop="fax">
                        <el-input v-model="form.fax" placeholder="请输入传真"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="检验原因" prop="inspectionReason">
                        <el-input v-model="form.inspectionReason" placeholder="请输入检验原因"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="依据标准" prop="standardReference">
                        <el-input v-model="form.standardReference" placeholder="请输入依据标准"/>
                      </el-form-item>
                    </el-col>

                    <el-col :span="12">
                      <el-form-item label="送样人" prop="sampleSender">
                        <el-input v-model="form.sampleSender" placeholder="请输入送样人"/>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="采样日期" prop="sendSampleDate">
                        <el-date-picker clearable size="mini" style="width: 100%"
                                        v-model="form.sendSampleDate"
                                        type="date"
                                        value-format="yyyy-MM-dd"
                                        placeholder="选择采样日期">
                        </el-date-picker>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="送检日期" prop="inspectionDate">
                        <el-date-picker clearable size="mini" style="width: 100%"
                                        v-model="form.inspectionDate"
                                        type="date"
                                        value-format="yyyy-MM-dd"
                                        placeholder="选择送检日期">
                        </el-date-picker>
                      </el-form-item>
                    </el-col>

                    <el-col :span="12">
                      <el-form-item label="检验要求" prop="inspectionRequirements">
                        <el-input v-model="form.inspectionRequirements" placeholder="请输入检验要求"/>
                      </el-form-item>
                    </el-col>

                    <el-col :span="12">
                      <el-form-item label="交付方式" prop="reportSendType">
                        <el-select v-model="form.reportSendType" placeholder="请选择交付方式"  style="width: 100%">
                          <el-option
                            v-for="item in reportSendTypeOptions"
                            :key="item.dictValue"
                            :label="item.dictLabel"
                            :value="item.dictValue">
                          </el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="是否退样" prop="sampleReturn">
                          <el-radio-group v-model="form.sampleReturn">
                            <el-radio :label="0">否</el-radio>
                            <el-radio :label="1">是</el-radio>
                          </el-radio-group>
                      </el-form-item>
                    </el-col>
                  </el-row>
                    <el-row :gutter="10">
                      <el-col :span="12">
                        <el-form-item label="退样接收人" prop="returnPerson">
                          <el-input v-model="form.returnPerson" placeholder="请输入退样接收人" :disabled="form.sampleReturn== 0" />"
                        </el-form-item>
                      </el-col>
                    </el-row>

                </div>
              </el-form>
<!--            </div>-->
          </pane>

          <!--        </div>-->
          <pane size="36">
<!--            <div class="divtitle" style="height: 100%;display: grid">-->
              <div class="title_css">样品明细</div>
              <el-form ref="detailForm" :model="detailForm" :rules="rules" label-width="80px" size="mini">
                <!--        <el-form-item label="关联的批次ID" prop="batchId">-->
                <!--          <el-input v-model="form.batchId" placeholder="请输入关联的批次ID" />-->
                <!--        </el-form-item>-->
                <el-row>
                  <el-col :span="12">
                    <el-form-item label="样品编号" prop="sampleNo">
                      <el-input v-model="detailForm.sampleNo" placeholder="请输入样品编号" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="样品名称" prop="sampleName">
                      <el-input v-model="detailForm.sampleName" placeholder="请输入样品名称" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="生产单位" prop="productionUnit">
                      <el-input v-model="detailForm.productionUnit" placeholder="请输入生产单位" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="样品数量" prop="sampleQuantity">
                      <el-input v-model="detailForm.sampleQuantity" placeholder="请输入样品数量" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="包装情况" prop="packagingSituation">
                      <el-input v-model="detailForm.packagingSituation" placeholder="请输入包装情况" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="保存条件" prop="storageCondition">
                      <el-input v-model="detailForm.storageCondition" placeholder="请输入保存条件" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="样品状态" prop="sampleStatus">
                      <el-select v-model="detailForm.sampleStatus" placeholder="请选择样品状态" style="width: 100%;">
                        <el-option
                          v-for="item in sampleStatusOption"
                          :key="item.dictValue"
                          :label="item.dictLabel"
                          :value="item.dictValue">
                        </el-option>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="商标" prop="trademark">
                      <el-input v-model="detailForm.trademark" placeholder="请输入商标" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="规格" prop="specification">
                      <el-input v-model="detailForm.specification" placeholder="请输入规格" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="生产日期" prop="productionDate">
                      <el-date-picker clearable size="mini" style="width:100%"
                                      v-model="detailForm.productionDate"
                                      type="date"
                                      value-format="yyyy-MM-dd"
                                      placeholder="选择生产日期">
                      </el-date-picker>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="批号" prop="batchNumber">
                      <el-input v-model="detailForm.batchNumber" placeholder="请输入批号" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="物态" prop="physicalState">
                      <el-input v-model="detailForm.physicalState" placeholder="请输入物态" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="颜色" prop="color">
                      <el-input v-model="detailForm.color" placeholder="请输入颜色" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="归类" prop="classification">
                      <el-input v-model="detailForm.classification" placeholder="请输入归类" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="24">
                    <el-form-item label="备注" prop="remarks">
                      <el-input v-model="detailForm.remarks" placeholder="请输入备注"  type="textarea"/>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
<!--            </div>-->
          </pane>
        </splitpanes>
      </el-row>
      <!--        </div>-->
      <!--      </div>-->
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm(true)" size="mini">保存并继续</el-button>
        <el-button type="primary" @click="submitForm(false)" size="mini">确 定</el-button>
        <el-button @click="drawer = false" size="mini">关 闭</el-button>
      </div>
    </el-dialog>


  </div>
</template>

<script>
// import {
//   listBatch,
//   getBatch,
//   delBatch,
//   addBatch,
//   updateBatch,
//   exportBatch,
//   importTemplate
// } from "@/api/cdc/sampleManage/cdcSampleReceiveBatch";
// import {getToken} from "@/utils/auth";

import {Splitpanes, Pane} from "splitpanes"
import "splitpanes/dist/splitpanes.css"
//样品明细
import cdcSampleDetail from './cdcSampleDetail.vue'
import { listDetail, getDetail, delDetail, addDetail, updateDetail, exportDetail } from "/@/api/hsw/cdc/sampleManage/cdcSampleDetail";

export default {
  //import引入的组件需要注入到对象中才能使用
  components: { Splitpanes, Pane, cdcSampleDetail},
  data() {
    //这里存放数据
    return {
      loading: false,
      batchList: [],
      drawer: false,
      title: undefined,
      reportSendTypeOptions:[],//交付方式字典
      rules: {
        inspectedUnit:[{required: true, message: '检测单位不能为空', trigger: 'blur'}],
        telephone:[{required: true, message: '检测单位电话不能为空', trigger: 'blur'}],
        sendSampleDate:[{required: true, message: '采样日期不能为空', trigger: 'blur'}],
        inspectionDate:[{required: true, message: '送检日期不能为空', trigger: 'blur'}],
        commissionUnit:[{required: true, message: '委托单位不能为空', trigger: 'blur'}],
        commissionContact:[{required: true, message: '委托单位联系人不能为空', trigger: 'blur'}],
        commissionPhone:[{required: true, message: '委托单位电话不能为空', trigger: 'blur'}],
        sampleNo:[{required: true, message: '样品编号不能为空', trigger: 'blur'}],
      },
      form: {},
      detailForm: {},
      mainRow:undefined,
      //主数据明细数据
      drawOpen: false,
      statusOptions: [],
      //样品状态
      sampleStatusOption:[],
      getIndex:undefined,
      single: true,
      // 非多个禁用
      multiple: true,
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
        batchStatus: undefined
      },
    };
  },

  created() {
    //标本实验状态
    this.getDicts("sample_experiment_status").then(res => {
      this.statusOptions = res.data;
    })
    //交付方式字典
    this.getDicts("report_send_type").then(res => {
      this.reportSendTypeOptions = res.data;
    })
   this.getList();
  },

  mounted() {
    // 默认显示第一条数据
    // if (this.tableData.length > 0) {
    //   this.formDataOne = {...this.tableData[0]};
    //   this.currentRow = {...this.tableData[0]};
    // }
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
  methods: {
    /** 查询检测申请单主列表 */
    getList() {
      this.loading = true;
      this.getIndex = undefined;
      this.mainRow = undefined;
      listBatch(this.queryParams).then(response => {
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
        delStatus: "0",
        status: "0",
        commissionUnit: undefined,
        commissionAddress: undefined,
        commissionContact: undefined,
        commissionPhone: undefined,
        reportSendType: undefined,
        sampleReturn: 0,
        returnPerson: undefined,
        commissionSign: undefined,
        commissionSigndate: undefined,
        reviewSign: undefined,
        reviewSigndate: undefined,
        batchStatus: "0"
      };
      this.resetForm("form");
    },

    //初始化明细弹框
    resetDetail(){
      //初始化明细弹框
      this.detailForm = {
        batchId: this.form.id,
        sampleId: undefined,
        sampleName: undefined,
        sampleType: undefined,
        sampleNumber: undefined,
        sampleUnit: undefined,
        sampleStatus: undefined,
        sampleInspection: undefined,
        sampleInspectionResult: undefined,
        sampleInspectionResultRemark: undefined,
        sampleInspectionResultDate: undefined,
        sampleInspectionResultPerson: undefined,
      }
      this.resetForm("detailForm");
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
      this.ids = selection.map(item => item.batchId)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.drawer = true;
      this.title = "添加检测申请单";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const batchId = row.batchId || this.ids
      getBatch(batchId).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改检测申请单主";
      });
    },
    //获取明细
    getDetail(mainRow){
      this.getIndex = mainRow.index
      this.mainRow = mainRow;
      this.$refs.cdcSampleDetail.getList(mainRow);
    },

    /** 提交按钮 */
    submitForm (flag) {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.batchId != undefined) {
            //如果当前保存并且主数据id不为空则只保存明细
            if(flag){
              addDetail(this.detailForm).then(res => {
                if(res.code === 200){
                  this.msgSuccess("新增成功");
                  this.resetDetail();
                }
              })
            }else {
              updateBatch(this.form).then(response => {
                if (response.code === 200) {
                  this.msgSuccess("修改成功");
                  this.open = false;
                  this.getList();
                }
              });
            }

          } else {
            addBatch(this.form).then(response => {
              if (response.code === 200) {
                //新增明细数据
                this.detailForm.batchId =  response.data;
                addDetail(this.detailForm).then(res => {
                  if(res.code === 200){
                    this.msgSuccess("新增成功");
                    if(!flag){
                      this.open = false;
                      this.reset();
                      this.resetDetail();
                    }else {
                      this.resetDetail();
                    }
                  }
                  this.getList();
                })
                // this.msgSuccess("新增成功");
                // if(!flag){
                //   this.open = false;
                //   this.reset();
                //   this.resetDetail();
                // }else {
                //   this.resetDetail();
                // }

              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const batchIds = row.batchId || this.ids;
      this.$confirm('是否确认删除检测申请单主编号为"' + batchIds + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delBatch(batchIds);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      }).catch(function () {
      });
    },
    /** 导出按钮操作 */
    handleExport() {
      const queryParams = this.queryParams;
      this.$confirm('是否确认导出所有检测申请单主数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return exportBatch(queryParams);
      }).then(response => {
        this.download(response.msg);
      }).catch(function () {
      });
    },
    handleImport() {
      this.upload.title = "检测申请单主导入";
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
    },
    tableRowClassName({ row, rowIndex }) {
      row.index = rowIndex;
    },
    selectedstyle({ row, rowIndex }) {
      if (this.getIndex === rowIndex) {
        return { "background-color": "#FFCC00" };
        // return { "background-color": "#F0FFF0" };
      }
    },
  },


}
</script>
<style lang='scss' scoped>
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
  margin-bottom: 5px;
  justify-items: center;
  align-items: center;
  justify-content: center;
}

.query_form .el-form-item--mini.el-form-item {
  margin-bottom: 0;
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

::v-deep .el-dialog__body {
  padding: 10px 15px;
}

</style>
