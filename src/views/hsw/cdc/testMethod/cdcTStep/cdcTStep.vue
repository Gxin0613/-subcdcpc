<!--试验方法步骤-->
<template>
  <div>
    <!--    <el-dialog-->
    <!--      title="主记录与步骤明细"-->
    <!--      :visible.sync="detailOpen"-->
    <!--      width="85%"-->
    <!--      :close-on-click-modal="false"-->
    <!--    >-->
    <!-- 项目名称 -->
    <!--    <el-drawer-->
    <!--      :title="mainTitle"-->
    <!--      :visible.sync="mainDrawer"-->
    <!--      :direction="direction"-->
    <!--      :before-close="handleClose">-->
    <!--        <el-form ref="Titleform" :model="Titleform" :rules="Titlerules" label-width="80px" style="padding-bottom: 0px;">-->
    <!--          <el-row :gutter="20" class="mb8">-->
    <!--             <el-col :span="8">-->
    <!--                <el-form-item label="项目名称" prop="name">-->
    <!--                  <el-input v-model="Titleform.name" placeholder="请输入项目名称" clearable/>-->
    <!--                </el-form-item>-->
    <!--              </el-col>-->
    <!--              <el-col :span="8">-->
    <!--            <el-form-item label="样品类型">-->
    <!--              <el-select v-model="Titleform.type" placeholder="请选择样品类型" style="width: 100%" clearable>-->
    <!--                <el-option-->
    <!--                  v-for="dict in sampleOptions"-->
    <!--                  :key="dict.dictValue"-->
    <!--                  :label="dict.dictLabel"-->
    <!--                  :value="dict.dictValue" />-->
    <!--              </el-select>-->
    <!--            </el-form-item>-->
    <!--            </el-col>-->

    <!--            <el-col :span="8">-->
    <!--            <el-form-item label="实验方法" prop="method">-->
    <!--              <el-select v-model="Titleform.method" placeholder="请选择实验方法" style="width: 100%" clearable>-->
    <!--                <el-option-->
    <!--                  v-for="dict in experimentOptions"-->
    <!--                  :key="dict.dictValue"-->
    <!--                  :label="dict.dictLabel"-->
    <!--                  :value="dict.dictValue" />-->
    <!--              </el-select>-->
    <!--            </el-form-item>-->
    <!--            </el-col>-->
    <!--            <el-col :span="8">-->
    <!--            <el-form-item label="检测依据" prop="testingBasis">-->
    <!--              <el-input v-model="Titleform.testingBasis" placeholder="请输入检测依据" clearable/>-->
    <!--            </el-form-item>-->
    <!--            </el-col>-->
    <!--            <el-col :span="8">-->
    <!--            <el-form-item label="描述备注" prop="description">-->
    <!--              <el-input v-model="Titleform.description" placeholder="请输入描述备注" />-->
    <!--            </el-form-item>-->
    <!--            </el-col>-->
    <!--            </el-row>-->
    <!--          </el-form>-->
    <!--    </el-drawer>-->

    <!-- 步骤表单 -->

    <!-- <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">

      <el-form-item label="步骤名称" prop="stepName">
        <el-input
          v-model="queryParams.stepName"
          placeholder="请输入步骤名称"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="结论" prop="conclusion">
        <el-input
          v-model="queryParams.conclusion"
          placeholder="请输入结论"
          clearable
          size="small"
          @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" size="default" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" size="default" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form> -->

    <!--      <el-row :gutter="10" class="mb8">-->
    <!--        <el-col :span="1.5">-->
    <!--          <el-button-->
    <!--            type="primary"-->
    <!--            icon="el-icon-plus"-->
    <!--            size="default"-->
    <!--            @click="handleAdd"-->
    <!--            v-hasPermi="['cdc:step:add']"-->
    <!--          >新增-->
    <!--          </el-button>-->
    <!--        </el-col>-->
    <!--        <el-col :span="1.5">-->
    <!--          <el-button-->
    <!--            type="success"-->
    <!--            icon="el-icon-edit"-->
    <!--            size="default"-->
    <!--            :disabled="single"-->
    <!--            @click="handleUpdate"-->
    <!--            v-hasPermi="['cdc:step:edit']"-->

    <!--          >修改-->
    <!--          </el-button>-->
    <!--        </el-col>-->
    <!--        <el-col :span="1.5">-->
    <!--          <el-button-->
    <!--            type="danger"-->
    <!--            icon="el-icon-delete"-->
    <!--            size="default"-->
    <!--            :disabled="multiple"-->
    <!--            @click="handleDelete"-->
    <!--            v-hasPermi="['cdc:step:remove']"-->
    <!--          >删除-->
    <!--          </el-button>-->
    <!--        </el-col>-->
    <!--        <el-col :span="1.5">-->
    <!--          <el-button-->
    <!--            type="info"-->
    <!--            icon="el-icon-upload2"-->
    <!--            size="default"-->
    <!--            @click="handleImport"-->
    <!--            v-hasPermi="['cdc:step:import']"-->
    <!--            v-show="false"-->
    <!--          >导入-->
    <!--          </el-button>-->
    <!--        </el-col>-->
    <!--        <el-col :span="1.5">-->
    <!--          <el-button-->
    <!--            type="warning"-->
    <!--            icon="el-icon-download"-->
    <!--            size="default"-->
    <!--            @click="handleExport"-->
    <!--            v-hasPermi="['cdc:step:export']"-->
    <!--            v-show="false"-->
    <!--          >导出-->
    <!--          </el-button>-->
    <!--        </el-col>-->
    <!--      </el-row>-->
    <el-row>
      <splitpanes class="default-theme">
        <!--检测项目数据-->
        <pane size="36">
          <el-col>
            <el-table
              v-loading="loading"
              size="small"
              :data="stepList"
              @cell-dblclick="handleUpdate"
              height="25vh"
              ref="detailTable"
              @row-contextmenu="handleRightClick"
              @selection-change="handleSelectionChange"
              border
              :row-style="selectedstyle"
              :row-class-name="tableRowClassName"
            >
              <!--        <el-table-column type="selection" width="55" align="center"/>-->
              <!--      <el-table-column label="id" align="center" prop="id" />-->
              <!--      <el-table-column label="方法id" align="center" prop="methodId" />-->
              <el-table-column label="序号" align="left" prop="stepOrder" width="60" />

              <el-table-column label="步骤名称" align="left" show-overflow-tooltip prop="stepName" />
              <el-table-column label="创建人" align="left" prop="user1" show-overflow-tooltip />
              <el-table-column label="创建时间" align="left" prop="creatTime" width="130">
                <template #default="scope">
                  <span>{{ parseTime(scope.row.creatTime, '{y}-{m}-{d}') }}</span>
                </template>
              </el-table-column>
              <!--      <el-table-column label="1 是 2否" align="center" prop="conclusionSelect" />-->
              <!--      <el-table-column label="1单行  2多行 3 下拉" align="center" prop="conclusionType" />-->
              <!--      <el-table-column label="如果type是3 存字典dict_type" align="center" prop="conclusionDict" />-->
              <!--      <el-table-column label="1 是 2否" align="center" prop="table1Select" />-->
              <!--      <el-table-column label="表格明细录入" align="center" prop="table2" />-->
              <!--      <el-table-column label="1 是 2否" align="center" prop="table2Select" />-->
              <el-table-column label="设备" align="left" prop="deviceSelect">
                <template #default="scope">
                  <el-tag :type="scope.row.deviceSelect == '1' ? '' : 'danger'">
                    {{ scope.row.deviceSelect == '1' ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="试剂" align="left" prop="reagentSelect">
                <template #default="scope">
                  <el-tag :type="scope.row.reagentSelect == '1' ? '' : 'danger'">
                    {{ scope.row.reagentSelect == '1' ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column label="描述" align="left" show-overflow-tooltip prop="description" />
              <el-table-column label="表格" align="left" prop="table1Select">
                <template #default="scope">
                  <el-tag :type="scope.row.table1Select == '1' ? '' : 'danger'">
                    {{ scope.row.table1Select == '1' ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="结论" align="left" prop="conclusionSelect" width="">
                <template #default="scope">
                  <el-tag :type="scope.row.conclusionSelect == '1' ? '' : 'danger'">
                    {{ scope.row.conclusionSelect == '1' ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <!-- <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                  <el-button
                    size="default"
                    type="text"
                    icon="el-icon-edit"
                    @click="handleUpdate(scope.row)"
                    v-hasPermi="['cdc:step:edit']"
                  >修改
                  </el-button>
                  <el-button
                    size="default"
                    type="text"
                    icon="el-icon-delete"
                    @click="handleDelete(scope.row)"
                    v-hasPermi="['cdc:step:remove']"
                  >删除
                  </el-button>
                </template>
              </el-table-column> -->
            </el-table>
            <!--          </el-col>-->
            <!--        </pane>-->

            <!--      <pagination-->
            <!--        v-show="total>0"-->
            <!--        :total="total"-->
            <!--        :page.sync="queryParams.pageNum"-->
            <!--        :limit.sync="queryParams.pageSize"-->
            <!--        @pagination="getList"-->
            <!--      />-->

            <!-- 添加或修改试验方法步骤表对话框 -->
            <!--      <el-dialog :title="title" :visible.sync="open" width="850px" append-to-body :close-on-click-modal="false">-->
            <!--检测项目数据-->
            <!--        <pane size="86">-->
            <!--          <el-col>-->
            <el-form ref="form" :model="form" :rules="rules" label-width="85px" label-position="left" size="default">
              <!--        <el-form-item label="方法id" prop="methodId">-->
              <!--          <el-input v-model="form.methodId" placeholder="请输入方法id" />-->
              <!--        </el-form-item>-->
              <!--              <div :style="{ height: `calc(56vh - ${tableHeight}px)` ,padding: '10px',overflow: 'auto'}">-->
              <div style="height: 46vh; padding: 10px; overflow: auto">
                <el-row class="header-box">
                  <el-col :span="3">
                    <el-form-item label="序号" prop="stepOrder" label-width="55px">
                      <el-input v-model="form.stepOrder" placeholder="请输入序号" disabled />
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="步骤名称" prop="stepName">
                      <el-input v-model="form.stepName" placeholder="请输入步骤名称" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="7">
                    <el-form-item label="" prop="deviceSelect" style="float: left" label-width="15px">
                      <el-checkbox v-model="form.deviceSelect" :true-label="1" :false-label="2">设备 </el-checkbox>
                    </el-form-item>
                    <el-form-item label="" prop="device" label-width="10px">
                      <!--                      @remove-tag="deviceRemove" @visible-change="deviceChange"-->
                      <el-select style="width: 100%" filterable :disabled="form.deviceSelect == 2" v-model="device" multiple placeholder="请选择设备" @remove-tag="deviceClear">
                        <el-option v-for="item in deviceData" :key="item.no" :label="item.deviceName" :value="item.no" @click.natice="deviceClick(item)"/>
                      </el-select>
                      <!-- <el-input v-model="form.deviceSelect" placeholder="请输入设备" style="width: 99%;margin-left: 10px" :disabled="form.deviceSelect != 1"></el-input> -->
                    </el-form-item>
                  </el-col>
                  <el-col :span="7">
                    <el-form-item label="" prop="reagentSelect" style="float: left" label-width="15px">
                      <el-checkbox v-model="form.reagentSelect" :true-label="1" :false-label="2">试剂 </el-checkbox>
                    </el-form-item>
                    <el-form-item label="" prop="reagent" label-width="10px">
                      <!--                      <el-input v-model="form.reagent" placeholder="请输入试剂" style="width: 100%"-->
                      <!--                                :disabled="form.reagentSelect != 1"/>-->
                      <el-select style="width: 100%" filterable :disabled="form.deviceSelect == 2" v-model="regent" multiple placeholder="请选择试剂"  @remove-tag="regentClear">
                        <el-option v-for="item in deviceData" :key="item.id" :label="item.deviceName" :value="item.id" @click.natice="regentClick(item)"/>
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="21">
                    <el-form-item label="描述" prop="description" label-width="55px">
                      <el-input
                        rows="4"
                        v-model="form.description"
                        @blur="handleFocus"
                        ref="inputField"
                        @contextmenu.native="showMenu"
                        placeholder="请输入描述"
                        type="textarea"
                        style="width: 98%"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="3">
                    <el-button type="primary" size="small" @click="handleDeal">变量维护 </el-button>
                  </el-col>
                </el-row>
                <el-row>
                  <el-col :span="6">
                    <el-form-item label="" prop="table1Select" label-width="0">
                      <el-checkbox v-model="form.table1Select" :true-label="1" :false-label="2">表格 </el-checkbox>
                      <!--                <el-input v-model="form.table1" placeholder="请输入表格" style="width: 99%;margin-left: 10px" />-->
                      <el-button type="primary" size="small" :disabled="form.table1Select != 1" style="margin-left: 15px" @click="tableEdit('1')">表格编辑 </el-button>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="" prop="table2" label-width="0">
                      <!--                      <span slot="label" label-width="1000px"></span>-->
                      <el-checkbox v-model="form.table2Select" :true-label="1" :false-label="2">表格明细 </el-checkbox>
                      <!--                <el-input v-model="form.table2" placeholder="请输入表格明细" style="width: 99%;margin-left: 10px" :disabled="form.table2Select != 1"/>-->
                      <el-button type="primary" size="small" :disabled="form.table2Select != 1" style="margin-left: 15px" @click="tableEdit('2')">表格编辑 </el-button>
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="" prop="conclusion" label-width="0">
                      <el-checkbox v-model="form.conclusionSelect" :true-label="1" :false-label="2">结论 </el-checkbox>
                      <el-radio-group v-model="form.conclusionType" :disabled="form.conclusionSelect == 2">
                        <el-radio :label="1">单行</el-radio>
                        <el-radio :label="2">多行</el-radio>
                        <el-radio :label="3">下拉</el-radio>
                      </el-radio-group>
                      <el-button style="margin-left: 15px" type="primary" size="small" @click="handleParam" :disabled="form.conclusionSelect == 2 || form.conclusionType != 3"
                        >结论维护
                      </el-button>
                      <!-- <el-input v-model="form.conclusion" style="width: 99%;margin-left: 10px" :disabled="form.conclusionSelect != 1" placeholder="请输入结论"/> -->
                    </el-form-item>
                  </el-col>
                  <!--                  <el-col :span="7">-->
                  <!--                    <el-form-item label="" label-width="0">-->
                  <!--                      <el-radio-group v-model="form.conclusionType" :disabled="form.conclusionSelect == 2">-->
                  <!--                        <el-radio :label="1">单行</el-radio>-->
                  <!--                        <el-radio :label="2">多行</el-radio>-->
                  <!--                        <el-radio :label="3">下拉</el-radio>-->
                  <!--                      </el-radio-group>-->
                  <!--                    </el-form-item>-->
                  <!--                  </el-col>-->
                  <!--                  <el-col :span="3">-->
                  <!--                    <el-button type="primary" size="default" @click="handleDeal" :disabled="form.conclusionSelect == 2">结论维护</el-button>-->
                  <!--                  </el-col>-->
                </el-row>
                <el-row>
                  <!--                  <el-col :span="6">-->
                  <!--                    <el-form-item label="" prop="necessary1Select" label-width="0">-->
                  <!--                      <el-checkbox v-model="form.necessary1Select" :true-label="1" :false-label="2" >-->
                  <!--                        该步骤必填-->
                  <!--                      </el-checkbox>-->
                  <!--                      <el-radio-group v-model="form.necessary1" :disabled="form.necessary1Select != 1">-->
                  <!--                        <el-radio :label="1">是</el-radio>-->
                  <!--                        <el-radio :label="0">否</el-radio>-->
                  <!--                      </el-radio-group>-->
                  <!--                    </el-form-item>-->
                  <!--                  </el-col>-->
                  <el-col :span="9">
                    <el-form-item label="" prop="necessary1Select" label-width="0">
                      <el-checkbox v-model="form.necessary1Select" :true-label="1" :false-label="2" @change="handleCheckChange($event, 'necessary1')"> 当前结果为 </el-checkbox>
                      <el-select v-model="form.necessary1Remark" placeholder="" clearable :disabled="form.necessary1Select != 1" size="default" style="width: 100px">
                        <el-option v-for="(item, index) in paramList" :key="index" :label="item.optionValue" :value="item.optionValue" />
                      </el-select>
                      ，下一步进行步骤
                      <el-select v-model="form.necessary1" placeholder="步骤序号" style="width: 70px">
                        <el-option v-for="item in stepListOptions" :key="item.stepOrder" :label="item.stepOrder" :value="item.stepOrder" />
                      </el-select>
                      <!--                      <el-radio-group v-model="form.necessary2" :disabled="form.necessary2Select != 1">-->
                      <!--                        <el-radio :label="1">是</el-radio>-->
                      <!--                        <el-radio :label="0">否</el-radio>-->
                      <!--                      </el-radio-group>-->
                    </el-form-item>
                  </el-col>
                  <el-col :span="9">
                    <el-form-item label="" prop="necessary2Select" label-width="0">
                      <el-checkbox v-model="form.necessary2Select" :true-label="1" :false-label="2" @change="handleCheckChange($event, 'necessary2')"> 当前结果为 </el-checkbox>
                      <el-select v-model="form.necessary2Remark" placeholder="" clearable :disabled="form.necessary2Select != 1" size="default" style="width: 100px">
                        <el-option v-for="(item, index) in paramList" :key="index" :label="item.optionValue" :value="item.optionValue" />
                      </el-select>
                      ，下一步进行步骤
                      <el-select v-model="form.necessary2" placeholder="步骤序号" style="width: 70px" :disabled="form.necessary2Select != 1">
                        <el-option v-for="item in stepListOptions" :key="item.stepOrder" :label="item.stepOrder" :value="item.stepOrder" />
                      </el-select>
                    </el-form-item>
                  </el-col>
                  <el-col :span="6">
                    <el-form-item label="" prop="sampleNextSelect" label-width="0">
                      <el-checkbox v-model="form.sampleNextSelect" :true-label="1" :false-label="2">稀释样品数 </el-checkbox>
                      <el-input-number v-model="form.sampleNext" placeholder="请输入稀释样品数" :disabled="form.sampleNextSelect != 1" />
                    </el-form-item>
                  </el-col>

                  <el-col :span="9">
                    <el-form-item label="" prop="intervalMinSelect" label-width="0">
                      <el-checkbox v-model="form.intervalMinSelect" :true-label="1" :false-label="2"> 距上一步最小时间间隔(小时) </el-checkbox>
                      <!-- <el-input v-model="form.aa1" style="width: 100px;margin-left: 10px" :disabled="form.aa != 1" placeholder=""/> -->
                      <el-input-number v-model="form.intervalMin" style="margin-left: 10px" size="default" :min="1" :step="0.1" :disabled="form.intervalMinSelect != 1" />
                    </el-form-item>
                  </el-col>
                  <el-col :span="9">
                    <el-form-item label="" prop="intervalMax" label-width="0">
                      <el-checkbox v-model="form.intervalMaxSelect" :true-label="1" :false-label="2"> 距上一步最大时间间隔(小时) </el-checkbox>
                      <!-- <el-input v-model="form.bb1" style="width: 100px;margin-left: 10px;" :disabled="form.bb != 1" placeholder=""/> -->
                      <el-input-number v-model="form.intervalMax" style="margin-left: 10px" size="default" :min="1" :step="0.1" :disabled="form.intervalMaxSelect != 1" />
                    </el-form-item>
                  </el-col>

                  <el-col :span="6">
                    <el-form-item label="" prop="compareCountSelect" label-width="0">
                      <el-checkbox v-model="form.compareCountSelect" :true-label="1" :false-label="0">是否有对照 </el-checkbox>
                      <el-radio-group v-model="form.isCompare" :disabled="form.compareCountSelect != 1">
                        <el-radio :label="1">是</el-radio>
                        <el-radio :label="0">否</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </el-col>
                </el-row>
                <div slot="footer" class="dialog-footer" style="bottom: 10px; right: 10px; position: absolute">
                  <el-button type="primary" @click="submitForm" size="default">{{ btnText }}</el-button>
                  <el-button @click="cancel" size="default">取 消</el-button>
                </div>
              </div>
            </el-form>
            <!--            </div>-->
          </el-col>
        </pane>
      </splitpanes>
    </el-row>
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

    <luckySheet ref="luckySheet" @saveLists="getsaveList" @updateStepByLuckySheet="updateStepByLuckySheet" />

    <!--      <span slot="footer" class="dialog-footer">-->
    <!--        <el-button type="primary" @click="submitTitleForm">确 定</el-button>-->
    <!--        <el-button @click="closeForm">关 闭</el-button>-->
    <!--        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>-->
    <!--      </span>-->
    <!--    </el-dialog>-->

    <!--变量维护-->
    <el-drawer title="变量维护" v-model="drawer" size="50%" :direction="direction" :before-close="handleClose">
      <div style="padding: 0 15px 0 15px; height: 100%; width: 100%">
        <el-button style="margin-left: 10px" type="primary" size="small" @click="handleAddDeal" v-hasPermi="['cdc:step:add']">新增 </el-button>
        <el-button
          style="margin-left: 10px"
          type="success"
          size="small"
          :disabled="variableSingle || !variableIds.length"
          @click="handleEditRow"
          v-hasPermi="['cdc:step:edit']"
          >编辑所选
        </el-button>
        <el-button
          style="margin-left: 10px"
          type="danger"
          size="small"
          :disabled="variableMultiple"
          @click="handleDeleteDeal"
          v-hasPermi="['cdc:step:edit']"
          >删除
        </el-button>
        <el-table v-loading="loading" :data="dealList" @cell-dblclick="variableCell" @selection-change="handleSelectionChangevariable" size="default">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="变量名称" align="center" prop="varName">
            <template #default="scope">
              <el-input v-if="scope.row.editing" v-model="scope.row.varName" placeholder="请输入变量名称" size="default" />
              <span v-else>{{ '${' + scope.row.varName + '}' }}</span>
            </template>
          </el-table-column>
          <el-table-column label="变量类型" align="center" prop="varType">
            <template #default="scope">
              <el-select v-if="scope.row.editing" v-model="scope.row.varType" placeholder="请选择类型" size="default">
                <el-option v-for="item in optionsList" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
              <span v-else>{{ varTyprRun(scope.row.varType) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="默认值" align="center" prop="defaultValue">
            <template #default="scope">
              <el-input
                v-if="scope.row.editing && (scope.row.varType == 1 || scope.row.varType == undefined)"
                v-model="scope.row.defaultValue"
                placeholder="请输入默认值"
                size="default"
              />
              <el-input
                v-else-if="scope.row.editing && scope.row.varType == 2"
                @input="scope.row.defaultValue = scope.row.defaultValue.replace(/[^\d]/g, '')"
                v-model="scope.row.defaultValue"
                placeholder="请输入默认值"
                size="defaul"
              />
              <el-select
                v-else-if="scope.row.editing && scope.row.varType == 3"
                @keyup.enter.native="handleAddOption($event, scope.row)"
                v-model="scope.row.defaultValue"
                clearable
                allow-create
                filterable
                style="width: 100%"
                placeholder="请选择默认值"
              >
                <el-option v-for="item in variableOption" :key="item.optionValue" :label="item.optionValue" :value="item.optionValue">
                  <span style="float: left">{{ item.optionValue }}</span>
                  <el-button type="text" @click.stop="handleOptionDelete(item, scope.row)" style="float: right"> 删除 </el-button>
                </el-option>
              </el-select>
              <el-date-picker v-else-if="scope.row.editing && scope.row.varType == 4" v-model="scope.row.defaultValue" placeholder="请选择默认值" size="small" />
              <span v-else>{{ scope.row.defaultValue }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="150">
            <template #default="scope">
              <div v-if="scope.row.editing">
                <el-button type="text" size="default" @click="saveRow(scope.row)">保存</el-button>
                <el-button type="text" size="default" @click="cancelEdit(scope.row)">取消</el-button>
              </div>
              <div v-else>
                <el-button type="text" size="default" @click="editRow(scope.row)">编辑</el-button>
                <el-button type="text" size="default" @click="handleDeleteDeal(scope.row)">删除</el-button>
              </div>
            </template>
          </el-table-column>
          <!-- <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150">
            <template #default="scope">
              <el-button
                size="default"
                type="text"
                icon="el-icon-edit"
                @click="handleUpdateDeal(scope.row)"
                v-hasPermi="['cdc:step:edit']"
              >修改
              </el-button>
              <el-button
                size="default"
                type="text"
                icon="el-icon-delete"
                @click="handleDeleteDeal(scope.row)"
                v-hasPermi="['cdc:step:remove']"
              >删除
              </el-button>
            </template>
          </el-table-column> -->
        </el-table>
      </div>
    </el-drawer>
    <!--     结论维护-->
    <cdcTStepConclusionOption ref="cdcTStepConclusionOption" />

    <!--    右键菜单事件-->
    <rightMenu
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
  import {
    listStep,
    getStep,
    delStep,
    updateStep,
    exportStep,
    addStep,
    importTemplate,
    saveStepDevice,
    deleteStepDevice,
    getDevByStepId,
    addVariable,
    getVarByStepId,
    updateVariable,
  } from '/@/api/hsw/cdc/testMethod/cdcTStep';

  import { queryDeviceInfoManage } from '/@/api/hsw/cdc/device/deviceInfo';
  // import {getToken} from "@/utils/auth";
  import { listMethod, getMethod, delMethod, addMethod, updateMethod, getTStepByMethodId } from '/@/api/hsw/cdc/testMethod/cdcTMethod';
  //变量下拉明细
  import {listOption, getOption, addOption, delOption,} from "/@/api/hsw/cdc/testMethod/cdcTVariableOption"
  import { Splitpanes, Pane } from 'splitpanes';
  import 'splitpanes/dist/splitpanes.css';
  //在线编辑
  import luckySheet from '/@/views/hsw/cdc/luckySheet/luckySheet.vue';

  //结论维护
  import cdcTStepConclusionOption from '/@/views/hsw/cdc/testMethod/cdcTStepConclusionOption/cdcTStepConclusionOption.vue';
  // import {upload} from "@/api/cdc/testMethod/cdcTStep";
  import axios from 'axios';
  export default {
    name: 'Step',
    components: { luckySheet, Splitpanes, Pane, cdcTStepConclusionOption },
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
        // 变量选中数组
        variableIds: [],
        btnText: '确 定',
        // 变量非单个禁用
        variableSingle: true,
        reagent: undefined,
        //当前可以选择的步骤
        stepListOptions: [],
        contextMenu: {
          visible: false,
          x: undefined,
          y: undefined,
        },
        menuItems: [],
        // 变量选中数组
        variableMultiple: true,
        mainDrawer: false,
        row: undefined,
        mainTitle: undefined,
        selectRows: [],
        //参数list
        paramList: [],
        //下拉变量参数明细
        variableOption: [],
        //下拉变量缓存明细
        variableCache: {},
        //试剂
        // 总条数
        total: 0,
        // 试验方法步骤表表格数据
        stepList: [],
        divHeight: '68vh',
        // 弹出层标题
        title: '',
        // 是否显示弹出层
        open: false,
        tableHeight: 20,
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          methodId: undefined,
          stepOrder: undefined,
          description: undefined,
          stepName: undefined,
          creatUser: undefined,
          creatTime: undefined,
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
        //变量新增表单
        variableForm: {
          defaultValue: null,
          varType: null,
          varName: null,
        },
        // 变量新增表单校验
        variableRules: {
          varType: [{ required: true, message: '类型不能为空', trigger: 'blur' }],
          varName: [{ required: true, message: '名称不能为空', trigger: 'blur' }],
        },
        // 表单参数
        form: {
          deviceSelect: 2,
          reagentSelect: 2,
          table1Select: 2,
          table2Select: 2,
          conclusionType: 1,
          conclusionSelect: 2,
          necessary1: undefined,
          necessary2: undefined,
        },
        // 表单校验
        rules: {
          methodId: [{ required: true, message: '方法id不能为空', trigger: 'blur' }],
          stepOrder: [{ required: true, message: '序号不能为空', trigger: 'blur' }],
          stepName: [{ required: true, message: '步骤名称不能为空', trigger: 'blur' }],
          description: [{ required: true, message: '描述不能为空', trigger: 'blur' }],
        },
        //实验项目表单
        Titleform: {},
        //选中的实验数据
        device: [],
        //选中的试剂实验数据
        regent:[],
        //实验项目表单y验证
        Titlerules: {
          name: [{ required: true, message: '项目名称不能为空', trigger: 'blur' }],
        },
        //  试验方法步骤表导入参数
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
          // url: process.env.VUE_APP_BASE_API + "/cdc/step/importData"
        },
        //样品类型
        sampleOptions: [],
        //实验方法
        experimentOptions: [],
        //表格保存
        sheetDataMap: {},
        //缓存的excel数据
        excelData: {},
        //当前行数据
        stepRow: undefined,
        //缓存的参数维护数据
        paramOptions: [],
        //设备选择数据
        deviceOptions: [],
        //试剂选择数据
        regentOptions: [],
        currentComponentId: null,
        saveList: null,
        detailOpen: false,
        dealOpen: false,
        //类型
        optionsList: [
          { value: 1, label: '文本' },
          { value: 2, label: '数字' },
          { value: 3, label: '下拉' },
          { value: 4, label: '时间' },
        ],
        dealList: [],
        methodRow: undefined,
        getIndex: undefined,
        // 试验方法步骤表表格数据
        // stepList: [],
        drawer: false,
        direction: 'rtl',
        //步骤id
        stepId: undefined,
        //实验项目id
        methodId: undefined,
        //父级页面按钮
        detailType: 1, //1:新增 2:修改
        //步骤详情按钮
        setpType: 1, //1:新增  2:修改
        //设备列表
        deviceData: [],
        //焦点位置
        focusStart: [],
      };
    },
    watch: {
      //设备
      'form.deviceSelect': function (val) {
        if (val != 1) {
          this.device = [];
        }
      },
      //试剂
      'form.reagentSelect': function (val) {
        if (val != 1) {
          this.device = [];
        }
      },
      //序号
      'form.stepOrder': function (val) {
        this.stepListOptions = [];
        for (let item of this.stepList) {
          if (item.stepOrder > val) {
            this.stepListOptions.push(item);
          }
        }
      },
      //结果1
      'form.necessary1Remark': function (val) {
        if (val && val == this.form.necessary2Remark) {
          this.$confirm('结果描述不能一致', '提示', {
            distinguishCancelAndClose: true,
            confirmButtonText: '确定',
            showCancelButton: false, //是否显示取消按钮
            showClose: true, //是否显示关闭按钮
            type: 'warning',
          });
        }
      },
      //结果2
      'form.necessary2Remark': function (val) {
        if (val && val == this.form.necessary1Remark) {
          this.$confirm('结果描述不能一致', '提示', {
            distinguishCancelAndClose: true,
            confirmButtonText: '确定',
            showCancelButton: false, //是否显示取消按钮
            showClose: true, //是否显示关闭按钮
            type: 'warning',
          });
        }
      },

      drawer: function (val) {
        if (!val) {
          this.dealList = this.dealList.filter((item) => item.editing == false);
        }
        ``;
      },
    },
    created() {
      // this.getList();
      //获取样品类型字典
      // this.getDicts("sample_type").then(response => {
      //   this.sampleOptions = response.data;
      // });
      // //获取实验方法字典
      // this.getDicts("test_method").then(response => {
      //   this.experimentOptions = response.data;
      // });
    },
    mounted() {
      document.addEventListener('click', () => {
        this.contextMenu.visible = false;
      });
    },

    methods: {
      /** 查询试验方法步骤表列表 */
      getList(id) {
        //查询设备
        this.queryDeviceInfoManage();
        this.loading = true;
        this.getIndex = undefined;
        this.row = undefined;
        this.excelData = {};
        this.stepRow = undefined;
        this.paramOptions = [];
        // this.stepRow = undefined;
        // this.dealList = [];
        this.methodId = id;
        getTStepByMethodId({ methodId: id }).then((response) => {
          this.stepList = response.data;
          // this.tableHeight = this.$refs.detailTable.$el.offsetHeight;
          // this.total = response.total;
          this.reset();
          this.loading = false;
        });
      },
      // 实验步骤取消按钮
      cancel() {
        // console.log(this.stepId, '当前stepId')
        this.reset();
        this.stepRow = undefined;
        this.stepId = undefined;
        this.getIndex = undefined;
        this.btnText = '确 定';
        //初始化表格编辑
        this.$refs.luckySheet.reset();
        //初始化参数维护
        this.$refs.cdcTStepConclusionOption.reset();
        // if (this.setpType == 1) {
        //   if (this.stepId) {
        //     delStep(this.stepId).then(res => {
        //       this.open = false;
        //       this.reset();
        //       this.device = []
        //       this.getList(this.methodId)
        //     })
        //   }
        // } else {
        //   this.open = false;
        //   this.device = []
        //   this.reset();
        // }
      },
      //修改获取设备id
      getDevByStepId() {
        let query = {
          tStepId: this.stepId,
        };
        getDevByStepId(query).then((res) => {
          // console.log(res, 'hdhhd')
          if (res.code == 200) {
            let muData = [];
            if (res.data.length > 0) {
              res.data.forEach((row) => {
                muData.push(row.no);
              });
            }
            this.device = muData;
          }
        });
      },
      //新增变量下拉明细项目
      handleAddOption(event, mainRow) {
        const inputValue = event.target.value.trim();
        if (!inputValue || this.variableOption.some((item) => item.optionValue === inputValue)) return false;
        //当前变量为新增数据，缓存明细
        let data = {
          mainId: mainRow.index,
          optionValue: inputValue,
        };
        if (!mainRow.id) {
          if (this.variableCache[mainRow.index]) {
            this.variableCache[mainRow.index].push(data);
          } else {
            this.variableCache[mainRow.index] = [data];
          }
          this.variableOption.push(data);
        } else {
          data.variableId = mainRow.id;
          addOption(data).then((res) => {
            if (res.code == 200) {
              this.$message.success('新增成功');
            }
          });
        }
      },

      //下拉框中的数据删除操作
      handleOptionDelete(item, mainRow) {
        if (!item.id) {
          this.variableOption = this.variableOption.filter((i) => i.optionValue !== item.optionValue);
          this.variableCache[mainRow.index] = this.variableCache[mainRow.index].filter((i) => i.optionValue !== item.optionValue);
        } else {
          delVariable(item.id).then((res) => {
            if (res.code == 200) {
              this.$message.success('删除成功');
            }
          });
        }
      },

      //录入框过滤只能输入数字
      handleInput(value) {
        // 实时过滤非数字字符
        this.integerValue = value.replace(/[^\d-]/g, '');

        // 处理负号只能出现在首位的情况
        if (this.integerValue.indexOf('-') > 0) {
          this.integerValue = this.integerValue.replace(/-/g, '');
        }
      },

      //设备删除事件
      deviceClear(val){
        if (val !== '' && val !== undefined && val !== null) {
          this.deviceOptions = this.deviceOptions.filter((item) => item.no != val);
        }
      },

      //试剂删除事件
      regentClear(val){
        if (val !== '' && val !== undefined && val !== null) {
          this.regentOptions = this.regentOptions.filter((item) => item.no != val);
        }
      },
      //试剂项选择事件
      regentClick(item){
        this.regentOptions.push(item);
      },

      //步骤哦设备新增事件
      handleDeviceAdd(stepId){
        let params = {
          tStepId: this.stepId,
          deviceName: "",
          no: "",
        };

        this.deviceOptions.forEach((item) => {
          if (params.deviceName == "") {
            params.deviceName = item.deviceName;
            params.no = item.no;
          }else {
            params.deviceName += "," + item.deviceName;
            params.no += ',' +  item.no;
          }
        });
        // console.log(params)
        saveStepDevice(params).then((res) => {
          this.deviceOptions = [];
          // this.msgSuccess('设备添加成功')
        });
      },

      //删除设备
      deviceRemove(row) {
        console.log(row, '删除设备');
        let params = {
          tStepId: this.stepId,
          deviceId: row,
        };
        deleteStepDevice(params);
      },

      //添加设步骤设备
      deviceChange(e) {
        // console.log(e, '数据');
        if (!e) {
          console.log(this.device, '选中实验数据');
          let muID = null;
          if (this.device.length > 0) {
            muID = this.device.join(',');
          }
          let params = {
            tStepId: this.stepId,
            deviceId: muID ? muID : '',
          };
          // console.log(params, '传输数据')
          saveStepDevice(params).then((res) => {
            // this.msgSuccess('设备添加成功')
          });
        }
      },
      //查询设备
      queryDeviceInfoManage() {
        this.deviceData = [
          {no: '1',deviceName: '测试1'},
          {no: '2', deviceName: '测试2'},
        ]
        axios.get('http://192.168.0.76:56146/WF/Device//loadList').then(response => {
          this.deviceData = response.data.rows;
        });

        // let params = {
        //   pageNum: 1,
        //   pageSize: 108611,
        //   departmentId: this.methodRow.deptId,
        // };
        // queryDeviceInfoManage(params).then((response) => {
        //   this.deviceData = response.rows;
        //   // this.total = response.total;
        //   // this.loading = false;
        // });
      },
      //获取参数数据
      handleCheckChange(val, field) {
        if (val == 1 && (field == 'necessary2' || field == 'necessary1')) {
          this.paramList = this.$refs.cdcTStepConclusionOption.optionList;
        } else {
          this.form[field] = undefined;
        }
      },

      // 表单重置
      reset() {
        this.form = {
          // id: undefined,
          // methodId: undefined,
          // stepOrder: undefined,
          // description: undefined,
          // stepName: undefined,
          // creatUser: undefined,
          // creatTime: undefined,
          // conclusion: undefined,
          // conclusionSelect: undefined,
          // conclusionType: undefined,
          // conclusionDict: undefined,
          // table1: undefined,
          // table1Select: 0,
          // table2: undefined,
          // table2Select: 0,
          // deviceSelect: undefined,
          // reagentSelect: undefined,
          // necessary1: undefined,
          // necessary2: undefined,
          necessary2Remark: undefined,
          necessary1Remark: undefined,
          stepOrder: this.stepList.length + 1,
          deviceSelect: 2,
          reagentSelect: 2,
          table1Select: 2,
          table2Select: 2,
          conclusionType: 1,
          conclusionSelect: 2,
          necessary1: undefined,
          necessary2: undefined,
          // num: 1,
          isCompare: 1,
          intervalMin: 1,
          sampleNext: 1,
          intervalMax: 1,
          sampleNextStep: 2,
          necessary1Select: 2,
          necessary2Select: 2,
          intervalMinSelect: 2,
          intervalMaxSelect: 2,
          sampleNextSelect: 2,
          sampleNextStepSelect: 2,
          compareCountSelect: 2,
        };
        this.btnText = '确 定';
        this.stepRow = undefined;
        this.resetForm('form');
      },
      tableRowClassName({ row, rowIndex }) {
        row.index = rowIndex;
      },
      selectedstyle({ row, rowIndex }) {
        if (this.getIndex === rowIndex) {
          return { 'background-color': '#EDD385' };
          // return { "background-color": "#F0FFF0" };
        }
      },

      handleAddDeal() {
        // 关闭所有行的编辑状态
        // this.dealList.forEach(item => {
        //   this.$set(item, 'editing', false);
        // });
        // 添加新行并设置为编辑状态
        const newRow = {
          varName: '',
          varType: null,
          defaultValue: '',
          editing: true,
          isNew: true,
          index: this.dealList.length,
        };
        this.dealList.unshift(newRow);
        this.variableOption = [];
        // 自动选中新行
        // this.$nextTick(() => {
        //   this.$refs.table.toggleRowSelection(newRow, true);
        // });
      },
      handleEditRow() {
        if (this.variableIds.length > 0) {
          const row = this.dealList.find((item) => item.id === this.variableIds[0]);
          if (row) this.editRow(row);
        }
      },
      editRow(row) {
        // 先关闭所有行的编辑状态
        this.dealList.forEach((item) => {
          if (item.editing && item !== row) {
            // this.$set(item, 'editing', false);
            item['editing'] = false;
          }
        });
        // 保存原始数据用于取消编辑
        row.originalData = { ...row };
        // this.$set(row, 'editing', true);
        row['editing'] = true;
        //如果当前变量为下拉则查询下拉明细
        if (row.varType == 3) {
          if (row.id) {
            listOption(row.id).then((res) => {
              this.variableOption = res.data;
            });
          } else {
            this.variableOption = this.variableCache[row.index];
          }
        }
      },
      //变量维护保存
      saveRow(row) {
        // 简单验证
        if (!row.varName) {
          this.$modal.msgError('变量名称不能为空');
          return;
        }
        if (row.varType === null) {
          this.$modal.msgError('请选择变量类型');
          return;
        }
        //缓存或者保存
        if (this.stepId) {
          // 构造提交数据
          const formData = {
            varName: row.varName,
            varType: row.varType,
            defaultValue: row.defaultValue,
            stepId: this.stepId,
          };
          // 新增或更新
          if (!row.id) {
            addVariable(formData).then((res) => {
              if (res.code === 200) {
                this.$modal.msgSuccess('添加成功');
                //如果当前变量为下拉则保存下拉明细
                if (formData.varType == 3) {
                  let options = this.variableCache[row.index];
                  for (let item of options) {
                    item.variableId = res.data;
                    addOption(item).then((res) => {
                      if (res.code === 200) {
                        console.log('添加成功');
                      }
                    });
                  }
                }
                row.id = res.data; // 设置返回的ID
                row.editing = false;
                delete row.isNew;
              }
            });
          } else {
            formData.id = row.id;
            updateVariable(formData).then((res) => {
              if (res.code === 200) {
                this.$modal.msgSuccess('修改成功');
                row.editing = false;
              }
            });
          }
        } else {
          row.editing = false;
        }
      },
      //变量维护批量保存
      saveRows(stepId) {
        for (let row of this.dealList) {
          //缓存或者保存
          // 构造提交数据
          const formData = {
            varName: row.varName,
            varType: row.varType,
            defaultValue: row.defaultValue,
            stepId: stepId,
          };
          // 新增或更新
          if (!row.id) {
            addVariable(formData).then((res) => {
              if (res.code === 200) {
                if (formData.varType == 3) {
                  let options = this.variableCache[row.index];
                  for (let item of options) {
                    item.variableId = res.data;
                    addOption(item).then((res) => {
                      if (res.code === 200) {
                        console.log('添加成功');
                      }
                    });
                  }
                }
              }
            });
          } else {
            formData.id = row.id;
            updateVariable(formData).then((res) => {
              if (res.code === 200) {
              }
            });
          }
        }
      },
      cancelEdit(row) {
        if (row.isNew) {
          // 移除新增行
          this.dealList = this.dealList.filter((item) => !(item.isNew && item === row));
        } else {
          // 恢复原始数据
          Object.assign(row, row.originalData);
          row.editing = false;
        }
      },
      handleDeleteDeal(row) {
        let that = this;
        // this.dealList =  this.dealList.filter(item => item.dealId != row.dealId)
        const ids = this.selectRows.length == 0 ? [row] : this.selectRows;
        let deleteIds = [];
        let noIds = [];
        ids.forEach((item) => {
          if (item.id != undefined && item.id != null && item.id != '') {
            //缓存id
            deleteIds.push(item.id);
          } else {
            //缓存索引
            noIds.push(item.index);
          }
        });
        //存在已经保存过的数据项
        this.$confirm('是否确认删除数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(function () {
            if (deleteIds.length != 0) {
              return delVariable(deleteIds);
            }
            if (noIds.length != 0) {
              // noIds.forEach(itemDelete => {
              that.dealList = that.dealList.filter((item) => !noIds.includes(item.index));
              // })
            }
          })
          .then(() => {
            this.handleDeal();
            this.msgSuccess('删除成功');
          })
          .catch(function () {});
      },

      //返回变量类型
      varTyprRun(row) {
        let varTypeName = null;
        this.optionsList.forEach((res) => {
          if (row == res.value) {
            varTypeName = res.label;
          }
        });
        return varTypeName;
      },

      //双击变量列表插入变量
      variableCell(row) {
        if (row.editing) {
          return;
        }
        var focusValue = this.form.description;
        if (focusValue) {
          this.form.description = focusValue.slice(0, this.focusStart) + '${' + row.varName + '}' + focusValue.slice(this.focusStart);
        } else {
          this.form.description = '${' + row.varName + '}';
        }
        this.drawer = false;
      },

      //获取焦点
      handleFocus(e) {
        this.focusStart = e.srcElement.selectionStart;
        console.log(this.focusStart, '调用焦点');
      },
      // 右键触发变量维护
      showMenu(event) {
        event.preventDefault(); // 阻止默认的右键菜单显示（可选）
        console.log(event, '鼠标右键被点击');
        this.handleDeal();
        // 在这里添加你的逻辑代码，例如弹出自定义菜单等。
      },
      handleRightClick(row, column, event) {
        this.menuItems = [
          { label: '修改', method: 'handleUpdate', param: row, hasPermi: ['hsw:method:edit'] },
          { label: '删除', method: 'handleDelete', param: row, hasPermi: ['hsw:method:remove'] },
        ];
        event.preventDefault();
        this.contextMenu = {
          visible: true,
          x: event.clientX,
          y: event.clientY,
          rowData: row,
        };
      },

      //变量维护
      handleDeal() {
        if (!this.methodId) {
          this.$modal.msgError('请选择检测项目');
          return;
        }
        this.drawer = true;
        //当前步骤为新增时缓存变量步骤新增时同时保存
        if (this.stepId != undefined && this.stepId != null && this.stepId != '') {
          let query = {
            tStepId: this.stepId,
          };
          getVarByStepId(query).then((res) => {
            if (res.code == 200) {
              this.dealList = res.data;
            }
          });
        }
      },
      //变量维护关闭事件
      handleClose(done) {
        done();
      },

      //结论维护
      handleParam() {
        if (!this.methodId) {
          this.$modal.msgError('请选择检测项目');
          return;
        }
        this.$refs.cdcTStepConclusionOption.stepId = this.stepId
        this.$refs.cdcTStepConclusionOption.drawer = true;
      },

      //设备选择事件
      deviceClick(item){
        this.deviceOptions.push(item);

      },

      //实验项目清空
      Titlereset() {
        this.Titleform = {
          id: undefined,
          name: undefined,
          description: undefined,
          createTime: undefined,
          type: undefined,
          method: undefined,
          creatUser: undefined,
          approveUser: undefined,
          approveTime: undefined,
          isvalid: undefined,
          testingBasis: undefined,
        };
        this.resetForm('Titleform');
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
      //变量多选框选中
      handleSelectionChangevariable(selection) {
        this.variableIds = selection.map((item) => item.id);
        this.selectRows = selection.map((item) => item);
        this.variableSingle = selection.length != 1;
        this.variableMultiple = !selection.length;
      },
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map((item) => item.id);
        this.single = selection.length != 1;
        this.multiple = !selection.length;
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.$refs['Titleform'].validate((valid) => {
          if (valid) {
            console.log(this.Titleform, '当前表单');
            this.setpType = 1;
            this.Titleform.id = null;
            this.title = '新增步骤明细';
            this.reset();
            if (this.methodId) {
              // console.log('走1')
              addStep({ methodId: this.methodId }).then((response) => {
                if (response.code === 200) {
                  // this.getList();
                  //步骤id

                  this.stepId = response.data;
                  console.log(response.data, '当前的stepId');
                  this.open = true;
                }
              });
            } else {
              console.log('走2');
              addMethod(this.Titleform).then((response) => {
                if (response.code === 200) {
                  console.log(response, '新增实验方法');

                  this.methodId = response.data;
                  addStep({ methodId: this.methodId }).then((response) => {
                    if (response.code === 200) {
                      // this.getList();
                      //步骤id
                      this.stepId = response.data;
                      console.log(response.data, '当前的stepId');
                      this.open = true;
                    }
                  });
                }
              });
            }

            // if (this.Titleform.id != undefined) {
            //   // updateMethod(this.form).then(response => {
            //   //   if (response.code === 200) {
            //   //     this.msgSuccess("修改成功");
            //   //     this.open = false;
            //   //     this.getList();
            //   //   }
            //   // });
            //       this.reset();
            //       this.open = true;
            // } else {
            //   addMethod(this.Titleform).then(response => {
            //     if (response.code === 200) {
            //       console.log(response,'新增实验方法')
            //       this.reset();
            //       this.methodId = response.data
            //       addStep({methodId:this.methodId}).then(response => {
            //         if (response.code === 200) {
            //             // this.getList();
            //             //步骤id
            //             this.stepId = response.data
            //             this.open = true;
            //         }
            //       });

            //     }
            //   });
            // }
          } else {
            this.msgError('请先填写上面实验名称');
          }
        });
        // this.reset();
        // this.open = true;
        // this.title = "添加试验方法步骤表";
      },
      //关闭
      closeForm() {
        if (this.detailType == 1) {
          if (this.methodId) {
            if (this.stepList.length > 0) {
              this.$confirm('此实验项目您已添加步骤，关闭将取消保存，是否继续？', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning',
              })
                .then(() => {
                  this.detailOpen = false;
                  this.stepList = [];
                  this.Titlereset();
                  this.$emit('handleDeleteMet', this.methodId);
                  this.methodId = undefined;
                })
                .catch(() => {
                  this.$message({
                    type: 'info',
                    message: '已取消',
                  });
                });
            } else {
              this.detailOpen = false;
              this.stepList = [];
              this.Titlereset();
              this.$emit('handleDeleteMet', this.methodId);
              this.methodId = undefined;
            }
          } else {
            this.detailOpen = false;
            this.stepList = [];
            this.Titlereset();
            this.$emit('handeList');
            this.methodId = undefined;
          }
        } else {
          this.detailOpen = false;
          this.stepList = [];
          this.Titlereset();
          this.$emit('handeList');
          this.methodId = undefined;
        }
      },
      //调用父组件刷新表格
      submitTitleForm() {
        this.$refs['Titleform'].validate((valid) => {
          if (valid) {
            if (this.detailType == 2) {
              if (!this.Titleform.id) {
                this.Titleform.id = this.methodId;
              }
              updateMethod(this.Titleform).then((response) => {
                if (response.code === 200) {
                  this.$modal.msgSuccess('修改成功');

                  this.detailOpen = false;
                  this.$emit('handeList');
                  this.methodId = undefined;
                  this.stepList = [];
                  this.Titlereset();
                }
              });
            } else {
              if (this.stepList.length == 0) {
                addMethod(this.Titleform).then((response) => {
                  if (response.code === 200) {
                    this.$modal.msgSuccess('新增成功');

                    this.detailOpen = false;
                    this.$emit('handeList');
                    this.stepList = [];
                    this.methodId = undefined;
                    this.Titlereset();
                  }
                });
              } else {
                this.Titleform.id = this.methodId;
                updateMethod(this.Titleform).then((response) => {
                  if (response.code === 200) {
                    this.$modal.msgSuccess('修改成功');

                    this.detailOpen = false;
                    this.$emit('handeList');
                    this.methodId = undefined;
                    this.stepList = [];
                    this.Titlereset();
                  }
                });
              }
            }
          }
        });
      },

      //表格编辑
      tableEdit(tableType) {
        if (!this.methodId) {
          this.$modal.msgError('请选择检测项目');
          return;
        }
        //主数据id存在则为修改，主数据id不存在则为添加数据需缓存处理
        //   this.currentComponentId = `${this.stepId}_${tableType}`;
        //   console.log('Component ID:', this.currentComponentId);
        this.$refs.luckySheet.currentComponentId = 'table' + tableType;
        // const savedData = this.sheetDataMap[this.currentComponentId];
        this.$refs.luckySheet.tableOpen = true;
        this.$nextTick(() => {
          this.$refs.luckySheet.methodRow = this.methodRow;
          this.$refs.luckySheet.stepRow = this.stepRow;
          this.$refs.luckySheet.tableType = tableType;
          // if (!this.form.id) {
          //   this.$refs.luckySheet.excelFeedback(JSON.stringify(savedData), this.currentComponentId);
          // } else {
          //   this.$refs.luckySheet.excelFeedback(null, this.currentComponentId);
          // }
        });
      },

      //表格保存数据
      getsaveList(payload) {
        // const {componentId, data} = payload;
        // this.sheetDataMap[componentId] = data;
        this.excelData[payload.get('flag')] = payload;
      },

      //实验方法修改
      handleUpdateTitle(id) {
        this.Titlereset();
        if (Array.isArray(id)) {
          this.methodId = id[0];
        } else {
          this.methodId = id;
        }

        getMethod(id).then((response) => {
          this.Titleform = response.data;
          // console.log(this.Titleform,'jhhh')
          // if(this.Titleform.type){
          //   this.Titleform.type = this.Titleform.type.toString()
          // }
          // if(this.Titleform.method){
          //   this.Titleform.method = this.Titleform.method.toString()
          // }
          this.detailOpen = true;
          this.title = '修改步骤明细';
        });
        this.getList(this.methodId);
      },

      /** 修改按钮操作 */
      handleUpdate(row) {
        // console.log(row, 'aaa')
        this.reset();
        this.stepRow = row;
        const id = row.id || this.ids;
        if (Array.isArray(id)) {
          this.stepId = id[0];
        } else {
          this.stepId = id;
        }
        this.getIndex = row.index;
        this.btnText = '保 存';
        getStep(id).then((response) => {
          this.form = response.data;
          this.setpType = 2; //当前点击的状态
          this.open = true;
          this.title = '修改试验方法步骤表';
          this.getDevByStepId();
        });
      },
      /** 提交按钮 */
      submitForm: function () {
        this.$refs['form'].validate((valid) => {
          if (valid) {
            this.form.methodId = this.methodId;
            if (this.form.id != undefined) {
              updateStep(this.form).then((response) => {
                if (response.code === 200) {
                  // if (this.setpType == 1) {
                  //   this.msgSuccess("新增成功");
                  // } else {
                  this.$modal.msgSuccess('修改成功');
                  // }
                  //设备更改
                  this.handleDeviceAdd(this.form.id)
                  this.open = false;
                  this.device = [];
                  this.getList(this.methodId);
                }
              });
            } else {
              // this.form.methodId = this.methodId
              addStep(this.form).then((response) => {
                if (response.code === 200) {
                  //新增变量维护
                  this.saveRows(response.data);
                  // if(this.excelData){
                  //新增时保存维护参数
                  this.$refs.cdcTStepConclusionOption.saveRows(response.data);
                  //上传表格文件
                  this.$refs.luckySheet.uploadSaves(response.data, this.form);
                  //

                  // }
                  //设备处理
                  this.handleDeviceAdd(response.data);
                  // if (this.setpType == 1) {
                  this.$modal.msgSuccess('新增成功');
                  // } else {
                  //   this.msgSuccess("修改成功");
                  // }
                  this.open = false;
                  this.device = [];
                  this.getList(this.methodId);
                }
              });
            }
          }
        });
      },

      //修改步骤
      updateStepByLuckySheet(data) {
        updateStep(data).then((response) => {
          if (response.code === 200) {
          }
        });
      },

      /** 删除按钮操作 */
      handleDelete(row) {
        const ids = row.id || this.ids;
        this.$confirm('是否确认删除试验方法步骤序号为"' + row.stepOrder + '"的数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(function () {
            return delStep(ids);
          })
          .then(() => {
            this.getList(this.methodId);
            this.msgSuccess('删除成功');
          })
          .catch(function () {});
      },
      /** 导出按钮操作 */
      handleExport() {
        const queryParams = this.queryParams;
        this.$confirm('是否确认导出所有试验方法步骤表数据项?', '警告', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(function () {
            return exportStep(queryParams);
          })
          .then((response) => {
            this.download(response.msg);
          })
          .catch(function () {});
      },
      handleImport() {
        this.upload.title = '试验方法步骤表导入';
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
<style lang="scss" scoped>
  // .header-box{
  //   width: 100%;
  //   height: 100%;
  //   border: 1px #409EFF dashed;
  //   border-radius: 8px;
  //   margin-left: 0px;
  //   padding-left: 10px;
  // }
  ::v-deep .el-checkbox__label {
    font-weight: 700;
  }

  ::v-deep.el-form-item--mini.el-form-item {
    margin-bottom: 16px;
  }

  ::v-deep .el-table__empty-block {
    min-height: 0;
  }

  ::v-deep .el-table__empty-text {
    line-height: 2vh;
  }

  //::v-deep .el-table__body-wrapper{
  //  //max-height: 26vh;
  //  //overflow: auto;
  //}
  ::v-deep .el-table .el-table__header-wrapper th {
    height: 0;
  }
</style>
