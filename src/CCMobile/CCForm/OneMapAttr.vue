<template>
  <!--下拉框-->
  <template v-if="isDDL(curMapAttr) || isRadio(curMapAttr) || curMapAttr.type === 'select'">
    <Field
      v-model="rowData[mapAttr.KeyOfEn + 'T']"
      readonly
      clickable
      :name="curMapAttr.KeyOfEn"
      :id="curMapAttr.KeyOfEn"
      :is-link="curMapAttr.UIIsEnable === 1 && isReadonly == false"
      :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
      :required="curMapAttr.UIIsInput === 0 ? false : true"
      :rules="curMapAttr.rules"
      @click="onSelectClickPop(curMapAttr)"
    />
  </template>

  <!--多复选框-->
  <template v-if="isCheckBoxs(curMapAttr)">
    <Field :name="curMapAttr.KeyOfEn" :rules="curMapAttr.rules" :id="curMapAttr.KeyOfEn" ref="inputRef">
      <template #input>
        <CheckboxGroup
          v-model="rowData[mapAttr.KeyOfEn]"
          :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
          :direction="curMapAttr.AtPara.indexOf('@RBShowModel=3') == -1 ? 'vertical' : 'horizontal'"
          @change="changeSelect"
        >
          <checkbox v-for="item in curMapAttr.ddl" :key="item.value" :name="item.value" shape="square">{{ item.text }} </checkbox>
        </CheckboxGroup>
      </template>
    </Field>
  </template>
  <!--布尔类型-->
  <template v-if="isBool(curMapAttr)">
    <Field :name="curMapAttr.KeyOfEn" ref="inputRef" :id="curMapAttr.KeyOfEn" :rules="curMapAttr.rules" :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true">
      <template #input>
        <Switch
          v-if="parseInt(GetPara(mapAttr.AtPara, 'CheckModel') || '0') === 0"
          v-model="rowData[mapAttr.KeyOfEn]"
          :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
          @change="changeSelect"
        />
        <RadioGroup v-else v-model="rowData[mapAttr.KeyOfEn]" direction="horizontal">
          <Radio :name="0">{{ GetPara(curMapAttr.AtPara, 'unCheckedTips') || '否' }}</Radio>
          <Radio :name="1">{{ GetPara(curMapAttr.AtPara, 'checkedTips') || '是' }}</Radio>
        </RadioGroup>
      </template>
    </Field>
  </template>
  <!--整数-->
  <template v-if="isInt(curMapAttr)">
    <Field
      v-model="rowData[mapAttr.KeyOfEn]"
      type="number"
      :id="curMapAttr.KeyOfEn"
      :name="curMapAttr.KeyOfEn"
      :placeholder="curMapAttr.Tip"
      :precision="0"
      :addon-after="curMapAttr.suffix"
      :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
      :rules="curMapAttr.rules"
      input-align="right"
      ref="inputRef"
      @input="handleIntegerInput" 
    >
      <template #button>
        <Field
          v-if="!!curMapAttr.sufOptions"
          v-model="rowData['AP_' + mapAttr.KeyOfEn]"
          style="width: 120px"
          readonly
          clickable
          name="picker"
          :is-link="curMapAttr.UIIsEnable === 1 && isReadonly == false"
          :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
          @click="onSufSelectClickPop(curMapAttr)"
        />
        <span v-else-if="!!curMapAttr.suffix">{{ curMapAttr.suffix }}</span>
      </template>
    </Field>
  </template>
  <!--浮点数-->
  <template v-if="isFloat(curMapAttr)">
    <Field
      v-model="rowData[mapAttr.KeyOfEn]"
      type="number"
      :id="curMapAttr.KeyOfEn"
      :name="curMapAttr.KeyOfEn"
      :rules="curMapAttr.rules"
      :placeholder="curMapAttr.Tip"
      :precision="curMapAttr.bit"
      stringMode
      :addon-after="curMapAttr.suffix"
      @blur="handleBit"
      :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
      input-align="right"
      ref="inputRef"
      @input="handleFloatInput"
    >
      <template #button>
        <Field
          v-if="!!curMapAttr.sufOptions"
          v-model="rowData['AP_' + mapAttr.KeyOfEn]"
          style="width: 120px"
          readonly
          clickable
          name="picker"
          :is-link="curMapAttr.UIIsEnable === 1 && isReadonly == false"
          :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
          @click="onSufSelectClickPop(curMapAttr)"
        />
        <span v-else-if="!!curMapAttr.suffix">{{ curMapAttr.suffix }}</span>
      </template>
    </Field>
  </template>
  <!--金额-->
  <template v-if="isMoney(curMapAttr)">
    <Field
      v-model="rowData[mapAttr.KeyOfEn]"
      type="number"
      :id="curMapAttr.KeyOfEn"
      :name="curMapAttr.KeyOfEn"
      :placeholder="curMapAttr.Tip"
      :precision="curMapAttr.bit"
      :parser="(value) => value.replace(/\$\s?|(,*)/g, '')"
      format-trigger="onBlur"
      :addon-after="curMapAttr.suffix"
      ref="inputRef"
      stringMode
      :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
      :rules="curMapAttr.rules"
      input-align="right"
      @input="handleFloatInput"
    >
      <template #button>
        <Field
          v-if="!!curMapAttr.sufOptions"
          v-model="rowData['AP_' + mapAttr.KeyOfEn]"
          style="width: 120px"
          readonly
          clickable
          name="picker"
          :is-link="curMapAttr.UIIsEnable === 1 && isReadonly == false"
          :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
          @click="onSufSelectClickPop(curMapAttr)"
        />
        <span v-else-if="!!curMapAttr.suffix">{{ curMapAttr.suffix }}</span>
      </template>
    </Field>
  </template>
  <!--日期-->
  <template v-if="isDateOrDateTime(curMapAttr)">
    <Field
      v-model="rowData[curMapAttr.KeyOfEn]"
      :is-link="curMapAttr.UIIsEnable === 1 && isReadonly == false"
      :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
      :rules="curMapAttr.rules"
      readonly
      :name="curMapAttr.KeyOfEn"
      :id="curMapAttr.KeyOfEn"
      :format="curMapAttr.format"
      :value-format="curMapAttr.format"
      :placeholder="curMapAttr.Tip"
      :disabled-date="disabledDate"
      ref="inputRef"
      @click="onDateClickPop"
    >
      <template #button>
        <span>{{ curMapAttr.suffix }}</span>
      </template>
    </Field>
    <!-- input-align="right" -->
  </template>
  <!--大块文本的说明-->
  <template v-if="isBigText(curMapAttr)">
    <!--<label style="padding: var(--van-cell-vertical-padding)">{{ curMapAttr.Name }}:</label>-->
    <div v-html="htmlContent" style="padding: var(--van-cell-vertical-padding)"></div>
  </template>
  <!--密码框-->
  <template v-if="isPassword(curMapAttr)">
    <Field
      v-model="rowData[mapAttr.KeyOfEn]"
      type="password"
      :id="curMapAttr.KeyOfEn"
      :name="curMapAttr.KeyOfEn"
      :rules="curMapAttr.rules"
      :placeholder="curMapAttr.Tip"
      :addon-after="curMapAttr.suffix"
      :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
      ref="inputRef"
    >
      <!--前置图标-->
    </Field>
  </template>
  <!--大文本-->
  <template v-if="isTextArea(curMapAttr)">
    <Field
      v-model="rowData[mapAttr.KeyOfEn]"
      type="textarea"
      rows="1"
      autosize
      :id="curMapAttr.KeyOfEn"
      :name="curMapAttr.KeyOfEn"
      :rules="curMapAttr.rules"
      :maxlength="mapAttr.MaxLen"
      :placeholder="curMapAttr.Tip"
      :allow-clear="curMapAttr.clearable"
      :addon-after="curMapAttr.suffix"
      :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
      ref="inputRef"
    />
  </template>
  <!--签批字段-->
  <template v-if="isSignCheck(curMapAttr)">
    <WorkCheck
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
      <div v-html="rowData[mapAttr.KeyOfEn]"></div>
    </template>
    <template v-else>
      <Tinymce v-model="rowData[mapAttr.KeyOfEn]" width="100%" />
    </template>
  </template>
  <!--普通字段-->
  <template v-if="isTextBox(curMapAttr) && curMapAttr.type !== 'select'">
    <div v-if="isTextPop(curMapAttr)" class="van-cell vant-cell-label van-cell--clickable van-field" role="button" @click="onClickTextPop(mapAttr)">
      <div class="van-cell__value van-field__value">
        <div class="van-field__body">
          <div class="van-field__control van-field__control--right">
            <template v-if="!!curMapAttr.eleDBs && curMapAttr.eleDBs.length != 0">
              <template v-for="(ele, idx) in curMapAttr.eleDBs" :key="idx">
                <Tag :closeable="curMapAttr.UIIsEnable === 1 && isReadonly == false" size="medium" type="primary" @close="DeleteEleDB(ele, idx)">
                  {{ ele }}
                </Tag>
              </template>
            </template>
            <label v-else>点击选择{{ mapAttr.Name }}</label>
          </div>
        </div>
      </div>
      <i v-if="curMapAttr.UIIsEnable === 1 && isReadonly == false" class="van-badge__wrapper van-icon van-icon-arrow van-cell__right-icon"></i>
    </div>
    <Field
      v-else-if="isTextSelect(curMapAttr)"
      v-model="rowData[mapAttr.KeyOfEn]"
      readonly
      clickable
      :name="curMapAttr.KeyOfEn"
      :id="curMapAttr.KeyOfEn"
      :is-link="curMapAttr.UIIsEnable === 1 && isReadonly == false"
      :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
      :required="curMapAttr.UIIsInput === 0 ? false : true"
      :rules="mapAttr.rules"
      @click="onSelectClickPop(mapAttr)"
      ref="inputRef"
    >
      <template #button>
        <span>{{ curMapAttr.suffix }}</span>
      </template>
    </Field>
    <Field
      v-else-if="isAutoCompleteSimple(curMapAttr) || isAutoCompleteTable(curMapAttr)"
      v-model="rowData[mapAttr.KeyOfEn]"
      :id="curMapAttr.KeyOfEn"
      :name="curMapAttr.KeyOfEn"
      :rules="curMapAttr.rules"
      :placeholder="curMapAttr.Tip"
      :allow-clear="curMapAttr.clearable"
      :addon-after="curMapAttr.suffix"
      label-align="top"
      :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
      ref="inputRef"
      @blur="onAutoCompleteSearch"
    >
      <template #button>
        <span>{{ curMapAttr.suffix }}</span>
      </template>
    </Field>
    <!--字段保密-->
    <Field
      v-else-if="isKeepSecret(curMapAttr)"
      v-model="rowData[mapAttr.KeyOfEn + 'T']"
      :id="curMapAttr.KeyOfEn"
      :name="curMapAttr.KeyOfEn"
      :rules="curMapAttr.rules"
      :placeholder="curMapAttr.Tip"
      :allow-clear="curMapAttr.clearable"
      :addon-after="curMapAttr.suffix"
      :disabled="true"
      ref="inputRef"
    >
      <template #button>
        <span>{{ curMapAttr.suffix }}</span>
      </template>
    </Field>
    <!--电话格式-->
    <Field v-else-if="isTelFormat(curMapAttr)" is-link readonly name="picker" placeholder="拨打电话" @click="telToLink" />
    <!--邮件格式-->
    <Field v-else-if="isEmailFormat(curMapAttr)" is-link readonly name="picker" placeholder="发送邮件" @click="mailToLink" />
    <!--地址格式-->
    <Field v-else-if="isAddrFormat(curMapAttr)" is-link readonly name="picker" placeholder="打开链接" @click="OpenAddr" />
    <!--日历事件格式-->
    <Field v-else-if="isCalendarFormat(curMapAttr)" is-link readonly name="picker" placeholder="打开日历事件" @click="calendarToLink" />
    <!--字段值链接-->
    <div v-else-if="isReadOnlyLink(curMapAttr)" class="van-cell vant-cell-label van-cell--clickable van-field" role="button">
      <div class="van-cell__title van-field__label">
        <label>{{ mapAttr.Name }}</label>
      </div>
      <template v-if="!!rowData[mapAttr.KeyOfEn + 'T']">
        <span v-for="(str, idx) in rowData[mapAttr.KeyOfEn + 'T'].split(',')" :key="str"
          ><a href="javaScript:void(0)" @click="GetReadOnlyLink(rowData[mapAttr.KeyOfEn].split(',')[idx], curMapAttr)">{{ str }}</a></span
        >
      </template>
      <template v-else
        ><span
          ><a ty href="javaScript:void(0)" @click="GetReadOnlyLink(rowData[mapAttr.KeyOfEn], curMapAttr)">{{ rowData[mapAttr.KeyOfEn] }}</a></span
        ></template
      >
    </div>
    <Field
      v-else-if="isCascader(curMapAttr)"
      v-model="rowData[mapAttr.KeyOfEn + 'T']"
      is-link
      readonly
      :id="curMapAttr.KeyOfEn"
      :name="curMapAttr.KeyOfEn"
      :placeholder="curMapAttr.Tip"
      :rules="curMapAttr.rules"
      :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
      @click="GetCascaderOption(mapAttr)"
    />
    <Field
      v-else
      v-model="rowData[mapAttr.KeyOfEn]"
      type="textarea"
      rows="1"
      autosize
      :id="curMapAttr.KeyOfEn"
      :name="curMapAttr.KeyOfEn"
      :rules="curMapAttr.rules"
      :placeholder="curMapAttr.Tip"
      :allow-clear="curMapAttr.clearable"
      :addon-after="curMapAttr.suffix"
      :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
      @change="inputChange"
    />
  </template>
  <!--字段附件-->
  <template v-if="isFileAth(curMapAttr)">
    <template v-if="curMapAttr.ath == null">
      <span style="color: red">{{ rowData[mapAttr.KeyOfEn] }}</span>
    </template>
    <template v-else>
      <!-- 上传 -->
      <Field name="button" disabled center v-if="parseInt(curMapAttr.ath.IsUpload) === 1 && isReadonly == false">
        <template #button>
          <Button v-if="isReadonly" type="primary" size="small" @click="OpenUploadModal(curMapAttr, false)"> <EyeOutlined />预览 </Button>
          <Button v-else type="primary" size="small" @click="OpenUploadModal(curMapAttr, false)"> <CloudUploadOutlined />上传 </Button>
          <span class="frmStyleType">上传的附件({{ athNum }})</span>
        </template>
      </Field>
      <!--预览-->
      <Field name="uploader" v-else>
        <template #input>
          <div style="width: 100%; border-radius: 2px">
            <AthView :ath-info="curMapAttr.ath" :params="props.params" :PKValue="props.refPKVal" />
          </div>
        </template>
      </Field>
      <!-- <Ath ref="ath" :ath-info="curMapAttr.ath" :params="props.params" :is-readonly="props.isReadonly" /> -->
    </template>
  </template>
  <!--写字板-->
  <template v-if="isHandWriting(curMapAttr)">
    <template v-if="parseInt(curMapAttr.UIIsEnable) === 0 || isReadonly == true">
      <img
        :src="GetImgSrc(curMapAttr, rowData[mapAttr.KeyOfEn])"
        onerror="this.style.dispaly='none'"
        :style="{ width: '100%', height: (curMapAttr.UIHeight < 50 ? 50 : curMapAttr.UIHeight) + 'px' }"
      />
    </template>
    <template v-else>
      <img
        :src="GetImgSrc(curMapAttr, rowData[mapAttr.KeyOfEn])"
        @click="DoHandWrite(curMapAttr, rowData[mapAttr.KeyOfEn])"
        onerror="this.style.dispaly='none'"
        :style="{ width: '100%', height: (curMapAttr.UIHeight < 50 ? 50 : curMapAttr.UIHeight) + 'px' }"
      />
    </template>
  </template>
  <!--超链接-->
  <template v-if="isLink(curMapAttr)">
    <div class="van-cell vant-cell-label van-cell--clickable van-field" role="button">
      <div class="van-cell__title van-field__label">
        <label>{{ mapAttr.Name }}</label>
      </div>
      <div class="van-cell__value van-field__value">
        <a v-if="curMapAttr.Tag1 != '_modal'" type="link" :target="curMapAttr.Tag1" @click="handlerLinkClick($event, curMapAttr)">{{ curMapAttr.Name }}</a>
        <a v-else type="link" @click="handlerLinkClick($event, curMapAttr)">{{ curMapAttr.Name }}</a>
      </div>
    </div>
  </template>

  <!-- 颜色组件 -->
  <template v-if="isLabColor(curMapAttr)">
    <NColorPicker v-model:value="rowData[mapAttr.KeyOfEn]" show-alpha :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true" />
  </template>
  <!--是否是按钮-->
  <template v-if="isBtn(curMapAttr)">
    <Button
      :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true"
      type="primary"
      size="small"
      @click="handlerBtnClick($event, curMapAttr)"
      style="padding: 10px 16px; margin-left: 10px"
      >{{ curMapAttr.Name }}</Button
    >
  </template>
  <!--进度图-->
  <template v-if="isJobSchedule(curMapAttr)">
    <JobSchedule />
  </template>
  <!--评分-->
  <template v-if="isScore(curMapAttr)">
    <Field name="rate" :required="curMapAttr.UIIsInput === 0 ? false : true">
      <Rate v-model="rowData[mapAttr.KeyOfEn]" :count="parseInt(curMapAttr.Tag2)" :disabled="curMapAttr.UIIsEnable === 0 || isReadonly == true" />
    </Field>
  </template>

  <!--地图-->
  <template v-if="isMap(curMapAttr)">
    <Field v-model="rowData[mapAttr.KeyOfEn]" readonly clickable :is-link="true" placeholder="选择位置" @click="OpenMap" />
  </template>
  <!--关联流程-->
  <Field
    v-if="isRelatedDocs(curMapAttr)"
    v-model="rowData[mapAttr.KeyOfEn]"
    readonly
    name="picker"
    :id="curMapAttr.KeyOfEn"
    :name="curMapAttr.KeyOfEn"
    :is-link="isReadonly == true ? true : false"
    :disabled="parseInt(curMapAttr.UIIsEnable) === 0 || isReadonly == true"
    :required="curMapAttr.UIIsInput === 0 ? false : true"
    :rules="mapAttr.rules"
    @click="jumpOrOpenFrm(rowData[mapAttr.KeyOfEn + 'T'])"
  >
    <template #button>
      <template v-if="parseInt(curMapAttr.UIIsEnable) === 1 && isReadonly == false">
        <Button size="small" type="primary" @click.stop="SelectOrOpenFrm(mapAttr)">选择</Button>
      </template>
    </template>
  </Field>
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
  <!--日期时间弹出-->
  <Popup v-model:show="datePop.visible" position="bottom">
    <DatePicker
      v-if="datePop.dateType === 'date'"
      v-model="datePop.currentDate"
      :minDate="datePop.minDate"
      :maxDate="datePop.maxDate"
      :columns-type="datePop.columnsType"
      @confirm="onConfirmDate"
      @cancel="datePop.visible = false"
    />
    <TimePicker
      v-else-if="datePop.dateType === 'time'"
      v-model="datePop.currentTime"
      :minDate="datePop.minDate"
      :maxDate="datePop.maxDate"
      :columns-type="datePop.columnsType"
      @confirm="onConfirmDate"
      @cancel="datePop.visible = false"
    />
    <PickerGroup v-else :title="curMapAttr.Name" :tabs="['选择日期', '选择时间']" @confirm="onConfirmDate" @cancel="datePop.visible = false">
      <DatePicker v-model="datePop.currentDate" :minDate="datePop.minDate" :maxDate="datePop.maxDate" />
      <TimePicker v-model="datePop.currentTime" :columns-type="datePop.columnsType" />
    </PickerGroup>
  </Popup>
  <!--下拉框弹出-->
  <Popup v-model:show="selectPop.visible" position="bottom">
    <template v-if="selectPop.mode === 'multiple'">
      <div style="display: flex; justify-content: space-between; height: 44px; line-height: 44px">
        <Button style="border: none; color: #969799" @click="selectPop.visible = false" size="normal">取消</Button>
        <Button style="border: none; color: #6398fb" @click="onConfirmSelect" size="normal">确认</Button>
      </div>
      <CheckboxGroup v-model="checked">
        <CellGroup inset>
          <Cell v-for="item in selectPop.ddl" clickable :key="item" :title="item.text">
            <template #right-icon>
              <Checkbox :name="item.value" />
            </template>
          </Cell>
        </CellGroup>
      </CheckboxGroup>
    </template>
    <Picker v-else show-toolbar :columns="selectPop.ddl" @confirm="onConfirmSelect" @cancel="selectPop.visible = false" />
  </Popup>
  <!-- z-index 设置最高2000 因图片预览组件的z-index是2001-->
  <Popup v-model:show="popModal.visible" position="right" :z-index="2000" :style="{ width: '100%', height: '100%' }" :lock-scroll="false">
    <NavBar :title="popModal.title" :fixed="true" left-arrow @click-left="TextPopOK" style="z-index: 0" />
    <!-- 成都pc端使用钉钉的情况下模式进入不了此判断 llj -->
    <!-- <template v-if="IsMobile()"> -->
    <PopMobile
      v-if="popModal.visible === true && popModal.modalType === 'Pop'"
      :selectVal="rowData[popModal.keyOfEn]"
      :title="popModal.title"
      :selectNameVal="popModal.itemNames"
      :mapExt="popModal.mapExt"
      :refPKVal="props.refPKVal"
      :rowData="rowData"
      :mainData="props.data"
      ref="refPopMobile"
    />
    <Frm v-if="popModal.visible === true && popModal.modalType === 'Frm'" :params="popModal.params" :style="{ overflow: AthViewShow ? 'hidden' : 'visible' }" />
    <GenerList v-if="popModal.visible === true && popModal.modalType === 'GenerList'" :params="popModal.params" @modalIsShow="modalIsShow" />
    <Ath
      v-if="popModal.visible === true && popModal.modalType === 'Ath'"
      ref="ath"
      :ath-info="popModal.Ath"
      :params="props.params"
      :is-readonly="props.isReadonly"
      :isMarginTop="true"
    />
    <ExtMap v-else-if="popModal.modalType === 'ExtMap'" :params="popModal.params" @MapAddress="MapAddress" />
    <iframe
      v-else-if="popModal.modalType === 'link'"
      :src="popModal.params.Doc"
      scrolling="auto"
      frameborder="no"
      style="width: 100%; height: calc(var(--viewport-height) - 45px); margin-top: 45px"
    ></iframe>
    <!-- </template> -->
    <!--    <template v-else>-->
    <!--      <Pop-->
    <!--        v-if="popModal.visible === true && popModal.modalType === 'Pop'"-->
    <!--        :selectVal="rowData[popModal.keyOfEn]"-->
    <!--        :title="popModal.title"-->
    <!--        :selectNameVal="popModal.itemNames"-->
    <!--        :mapExt="popModal.mapExt"-->
    <!--        :refPKVal="props.refPKVal"-->
    <!--        :rowData="rowData"-->
    <!--        :mainData="props.data"-->
    <!--        ref="refPop"-->
    <!--      />-->
    <!--    </template>-->
  </Popup>
  <Popup v-model:show="cascaderPopVisible" round position="bottom">
    <Cascader v-model="cascaderValue" title="请选择所在地区" :options="options" @close="cascaderPopVisible = false" @change="loadCascaderData" @finish="SetCascaderData" />
  </Popup>
  <Popup v-model:show="visible" round position="bottom">
    <Table :columns="columns" :dataSource="autoData" bordered size="small" :key="computkey" :pagination="{ pageSize: 10, pageSizeOptions: ['10'] }" :customRow="rowClick" />
  </Popup>
  <Popup v-model:show="popCenter.visible" round>
    <HandWriting v-if="popCenter.modalType === 'HandWriting'" :imageSrc="popCenter.ImgSrc" writingType="KeyOfEn" :keyOfEn="popCenter.keyOfEn" @ChangeWriteImg="ChangeWriteImg" />
  </Popup>
</template>

<script lang="ts" setup>
  import { Tinymce } from '/@/components/Tinymce/index';
  import { Table } from 'ant-design-vue';
  import { CropperAvatar } from '/@/components/Cropper';
  import {
    Field,
    CellGroup,
    CheckboxGroup,
    Checkbox,
    Switch,
    Button,
    Rate,
    Popup,
    PickerGroup,
    DatePicker,
    TimePicker,
    Cell,
    Picker,
    NavBar,
    Tag,
    showFailToast,
    Cascader,
    RadioGroup,
    Radio,
  } from 'vant';
  // 外部传过来的属性
  import { CloudUploadOutlined, EyeOutlined } from '@ant-design/icons-vue';
  import { computed, getCurrentInstance, inject, onMounted, onUnmounted, PropType, reactive, ref, shallowRef, unref, watch } from 'vue';
  import { MapAttrExt, useKeyOfEnType } from '/@/CCMobile/CCForm/FrmEnd';
  import BSEntity from '/@/utils/gener/BSEntity';
  import JobSchedule from '/@/WF/WorkOpt/OneWork/JobSchedule.vue';
  import Pop from '/@/CCMobile/CCForm/Pop.vue';
  import PopMobile from '/@/CCMobile/CCForm/PopMobile.vue';
  import { DealExp, GetPara } from '/@/utils/gener/StringUtils';
  import Ath from './Ath.vue';
  import Frm from '/@/CCMobile/Frm.vue';
  import GenerList from '/@/CCMobile/GenerList.vue';
  import ExtMap from '/@/CCMobile/CCForm/ExtMap.vue';
  import { mapExtParse } from '/@/CCMobile/CCForm/MapExt';
  import dayjs from 'dayjs';
  import { message, notification } from 'ant-design-vue';
  import { cloneDeep } from 'lodash-es';
  import DBAccess from '/@/utils/gener/DBAccess';
  import { FrmHtml } from '/@/WF/Admin/FrmLogic/Components/FrmHtml';
  import AthView from '/@/CCMobile/CCForm/AthView.vue';
  // import emailjs from '@emailjs/browser';
  import { windowOpen } from '/@/utils/windowOpen';
  import WorkCheck from '/@/CCMobile/WorkOpt/WorkCheck.vue';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { AtPara } from '/@/bp/da/AtPara';
  import { DataType } from '/@/bp/en/DataType';
  import Event from '/@/utils/Events';
  import { useRoute } from 'vue-router';
  import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
  import wx from 'weixin-js-sdk';
  import { FieldTypeS, UIContralType } from '/@/bp/en/EnumLab';
  import { FrmBodyItemChange } from '/@/DataUser/OverrideFiles/FrmBodyItemChange';
  import { FrmBodyBtnClick } from '/@/DataUser/OverrideFiles/FrmBodyBtnClick';
  import { WaiGuaBaseFrm } from '/@/bp/UIEntity/WaiGuaBaseFrm';
  import HandWriting from '/@/CCMobile/CCForm/HandWriting.vue';
  import { urlToBase64 } from '/@/utils/file/base64Conver';
  import { getAppEnvConfig } from '/@/utils/env';
  import { NColorPicker } from 'naive-ui';
  const props = defineProps({
    mapAttr: {
      type: Object,
      default: () => {
        return {};
      },
    },
    frmData: {
      type: Object,
      default: null,
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
    mainData: {
      type: Object,
      default: () => {
        return {};
      },
    },
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
    refPKVal: {
      type: [Number, String],
      default: '0',
    },
    rules: {
      type: Array,
      default: () => {
        return [];
      },
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
  });
  //多选
  const checked = ref([]);

  const curMapAttr = ref(props.mapAttr as MapAttrExt);
  //const isLabLine = parseInt(GetPara(curMapAttr.value.AtPara, 'IsLabLine') || '0') == 0 ? false : true;

  const rowData = ref(props.mainData);
  const currYear = dayjs().year();
  //数值型的最大值、最小值
  const numMax = ref(Infinity);
  const numMin = ref(Infinity);
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
    isRelatedDocs,
    isKeepSecret,
    isTelFormat,
    isEmailFormat,
    isAddrFormat,
    isCalendarFormat,
    isSignCheck,
    isCascader,
    isNumber,
    isLabColor,
    isPic,
    isSinglePic,
  } = useKeyOfEnType(props.isReadonly);
  const { GetDataTableByDB, CovertMoneyToCN, GetActionDLLData, GetFullData, GetFullDataDtl, GetFullDataAth, GetDataTableOfTBChoice, objectToKeyValueString } = mapExtParse();
  //时间弹窗
  const datePop = reactive({
    visible: false,
    dateType: '',
    currentDate: [],
    currentTime: [],
    minDate: new Date(currYear - 100, 0, 1),
    maxDate: new Date(currYear + 100, 12, 32),
    columnsType: [],
  });
  //选择器弹窗
  const selectPop = reactive({
    visible: false,
    ddl: [],
    mode: '',
    type: 'attr',
    para: '',
  });
  const { VITE_GLOB_API_URL } = getAppEnvConfig();
  //图片、图片附件
  const createStyle = (style: Recordable) => {
    return style;
  };
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
  const handleIntegerInput=(value)=>{
     // 使用正则表达式过滤非整数字符，只保留数字和负号（-） 
      let integerValue  = rowData.value[curMapAttr.value.KeyOfEn].replace(/[^\-?\d]/g,  ''); 
      // 确保负号（-）只能出现在第一位 
      if (integerValue.indexOf('-')  > 0) { 
        integerValue  = integerValue.replace(/-/g,  ''); 
      } 
      // 避免出现多个负号 
      if (integerValue.split('-').length  > 2) { 
        integerValue  = integerValue.replace(/-(?=-)/g,  ''); 
      } 
      rowData.value[curMapAttr.value.KeyOfEn] =  integerValue;
  }
  const handleFloatInput=(value)=> { 
      // 保留数字、负号（-）和小数点（.） 
      let floatValue  = rowData.value[curMapAttr.value.KeyOfEn].replace(/[^\-?\d.]/g,  ''); 
      // 负号（-）只能出现在第一位 
      if (floatValue.indexOf('-')  > 0) floatValue = floatValue.replace(/-/g,  ''); 
      // 避免多个负号 
      if (floatValue.split('-').length  > 2) floatValue = floatValue.replace(/-(?=-)/g,  ''); 
      // 只允许一个小数点（.） 
      const dotIndex = floatValue.indexOf('.');  
      if (dotIndex > -1) { 
        // 小数点后最多保留2位数字 
        floatValue = floatValue.slice(0,  dotIndex + curMapAttr.value.bit+1); // 小数点+2位小数 
        // 移除小数点后的非数字字符 
        floatValue = floatValue.replace(/(\.\d{${curMapAttr.value.bit}})\d+/g,  '$1'); 
      } 
       rowData.value[curMapAttr.value.KeyOfEn] =  floatValue;
    } 
  const GetSignature = computed(() => {
    let imgSrc = basicPath + '/DataUser/ICON/CCFlow/LogBig.png';
    if (!!props.frmData.Sys_FrmImgAth) {
      const frmImgAths = props.frmData.Sys_FrmImgAth.filter((item) => item.MyPK === curMapAttr.value.MyPK);
      if (frmImgAths.length > 0) {
        //获取数据
        if (frmImgAths[0].FK_MapData.startsWith('ND') === true) imgSrc = basicPath + '/DataUser/ImgAth/Data/' + frmImgAths[0].CtrlID + '_' + props.refPKVal + '.png';
        else imgSrc = basicPath + '/DataUser/ImgAth/Data/' + frmImgAths[0].FK_MapData + '_' + frmImgAths[0].CtrlID + '_' + props.refPKVal + '.png';
      }
    }
    return imgSrc + '?t=' + Math.random();
  });
  const IconImgErr = () => {
    const avatar = ref<string>('');
    avatar.value = basicPath + '/DataUser/ICON/CCFlow/LogBig.png';
    return avatar.value;
  };
  function updateAvatar({ _src, _data }) {}
  //自动完成
  const columns = ref<any[]>([]);
  const autoData = ref<any[]>([]);
  const visible = ref(false);
  const computkey = ref(0);

  const cascaderPopVisible = ref(false);
  const cascaderValue = ref('');
  const options = ref<Record<string, any>[]>([]);

  const onEditorChange = (event: any) => {
    rowData.value[curMapAttr.value.KeyOfEn] = event.target.getContent();
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
      options.value = data.map((item) => {
        return {
          value: item.No || item.NO || item.no,
          text: item.Name || item.NAME || item.name,
          children: [],
        };
      });
    } else options.value = [];
    cascaderPopVisible.value = true;
  };
  const validateNumber = async (value) => {
    if (value === 'NaN') rowData.value[curMapAttr.value.KeyOfEn] = '';
    // 使用正则表达式检查输入是否为有效的正负数值
    const isValidNumber = /^[+-]?\d*(\.\d+)?$/.test(value);
    return isValidNumber;
  };
  const loadCascaderData = async ({ selectedOptions }) => {
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
          text: item.Name || item.NAME || item.name,
          children: [],
        };
      });
    } else {
      const data = await GetDataTableByDB(mapExt, 'Tag3', targetOption.value, props.refPKVal, rowData.value);
      targetOption.children = data.map((item) => {
        return {
          value: item.No || item.NO || item.no,
          text: item.Name || item.NAME || item.name,
        };
      });
    }
    options.value = [...options.value];
    //}, 1000);
  };
  const SetCascaderData = async ({ selectedOptions }) => {
    cascaderPopVisible.value = false;
    rowData.value[curMapAttr.value.KeyOfEn + 'T'] = selectedOptions.map((option) => option.text).join('/');
    rowData.value[curMapAttr.value.KeyOfEn] = selectedOptions.map((option) => option.value).join(',');
    await DealMapExtBySelect(false, selectedOptions[selectedOptions.length - 1].value);
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
      case 'UrlOpen': //模弹窗打开
        popModal.visible = true;
        popModal.modalType = 'link';
        popModal.params.Doc = doc;
        return;
      case 'UrlWinOpen': //新窗口打开
        windowOpen(doc);
        return;
    }
  };
  //打开地图
  const OpenMap = async () => {
    popModal.keyOfEn = curMapAttr.value.KeyOfEn;
    popModal.visible = true;
    popModal.modalType = 'ExtMap';

    const atPara = new AtPara(rowData.value['AtPara']);
    const val = atPara.GetValStrByKey(curMapAttr.value.KeyOfEn) || '';
    let lng = val.split(',')[0] || '';
    let lat = val.split(',')[1] || '';
    if (!lng || !lat) {
      //获取当前地址
      try {
        const url = window.location.href;
        const handler = new HttpHandler('BP.WF.HttpHandler.CCMobile_CCForm');
        handler.AddPara('htmlPage', url);
        handler.AddPara('CorpID', CommonConfig.CorpID);
        handler.AddPara('CorpSecret', CommonConfig.CorpSecret);
        const config = await handler.DoMethodReturnString('GetWXConfigSetting');
        wx.config({
          beta: true,
          debug: false,
          appId: config['AppID'],
          timestamp: config['timestamp'],
          nonceStr: config['nonceStr'],
          signature: config['signature'],
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
      }
    }
    popModal.params = {
      lng: lng,
      lat: lat,
      address: rowData.value[popModal.keyOfEn] || '',
      isReadonly: curMapAttr.value.UIIsEnable === 0 || props.isReadonly == true,
    };
    popModal.title = '地图';
  };
  const MapAddress = (address, lng, lat) => {
    rowData.value[popModal.keyOfEn] = address;
    const atPara = new AtPara(rowData.value['AtPara']);
    atPara.SetVal(popModal.keyOfEn, lng + ',' + lat);
    rowData.value['AtPara'] = atPara.GenerAtParaStrs();
    popModal.visible = false;
  };

  const handleBit = (ev) => {
    const bit = parseInt(curMapAttr.value.bit);
    if (bit) {
      rowData.value[curMapAttr.value.KeyOfEn] = parseFloat(ev.target.value).toFixed(bit);
    }
  };
  /********************************文本自动完成************************************/
  const onAutoCompleteSearch = async () => {
    const searchText = rowData.value[curMapAttr.value.KeyOfEn];
    const mapExt = curMapAttr.value.mapExts.filter((mapExt) => {
      return mapExt['ExtModel'] === 'TBFullCtrl';
    })[0];
    let data: any[] = [];
    if (mapExt?.DoWay === 'Simple' || mapExt?.DoWay === 'Table' || mapExt?.DoWay === 'SimpleSFTable' || mapExt?.DoWay === 'TableSFTable') {
      if (mapExt.DBType == 0) {
        const en = new BSEntity('BP.Sys.MapExt', mapExt.MyPK);
        await en.Init();
        const rowDataPara = objectToKeyValueString(rowData.value);
        data = (await en.DoMethodReturnString('GetDataTableByField', 'Tag4', '@Key=' + searchText.replace(/'/g, '') + rowDataPara, '', props.refPKVal, '')) || [];
      }
      if (mapExt.DBType == 1) {
        await DBAccess.RunUrlReturnJSON(mapExt.Tag4);
        data = DBAccess.data || [];
      }
      if (mapExt.DBType == 2) {
        data = (await DBAccess.RunFunctionReturnStr(mapExt.Tag4)) || [];
      }
    }
    if (isAutoCompleteTable(curMapAttr.value)) {
      visible.value = true;
      autoData.value = cloneDeep(data);
      computkey.value++;
      return;
    }
    data = data.map((item) => {
      return {
        value: item.No || item.NO || item.no,
        text: item.Name || item.NAME || item.name,
      };
    });

    if (Array.isArray(data) && data.length > 0) {
      const item = data[0];
      if (!item['value'] || !item['text']) {
        message.error('查询结果列必须包含No,Name，请检查数据源配置');
      }
    }
    selectPop.visible = true;
    selectPop.ddl = data;
    selectPop.mode = 'TBFullCtrl';
    selectPop.para = GetPara(mapExt.AtPara, 'ShowModel') || '0';
  };

  /**
   * 自动填充表格模式
   * @param record
   */
  const rowClick = (record) => {
    return {
      onClick: async () => {
        visible.value = false;
        //填充其他控件
        await changeSelect(record.No, '');
      },
    };
  };
  /********************************文本自动完成************************************/

  /********************************弹窗返回值的操作*********************************/
  /**
   * Pop弹窗
   * @param mapAttr
   * @constructor
   */
  //弹窗显示
  const popModal = reactive({
    visible: false,
    title: '',
    modalType: 'Pop',
    keyOfEn: '',
    mapExt: {},
    itemNames: '',
    params: {},
    Ath: '',
    isReadonly: false,
  });
  const onClickTextPop = (mapAttr) => {
    if (mapAttr.UIIsEnable === 0 || props.isReadonly == true) return;
    const mapExt = mapAttr.mapExts.filter((mapExt) => mapExt['ExtModel'] === 'Pop')[0];
    popModal.visible = true;
    popModal.title = mapExt.Title || '请选择' + mapAttr.Name;
    popModal.keyOfEn = mapAttr.KeyOfEn;
    popModal.mapExt = cloneDeep(mapExt);
    popModal.modalType = 'Pop';
    popModal.itemNames = rowData.value[mapAttr.KeyOfEn + 'T'];
  };
  /**
   * Pop弹窗点击确定后执行的操作
   */
  const ath = shallowRef<InstanceType<typeof Ath>>();
  const refPop = shallowRef<InstanceType<typeof Pop>>();
  const refPopMobile = shallowRef<InstanceType<typeof PopMobile>>();
  const TextPopOK = async () => {
    if (popModal.modalType == 'Frm' || popModal.modalType === 'ExtMap' || popModal.modalType === 'link') {
      popModal.visible = false;
      return;
    }
    if (popModal.modalType == 'Ath') {
      popModal.visible = false;
      let AthNum = ath.value?.dbList;
      athNum.value = AthNum.length;
      rowData.value[curMapAttr.value.KeyOfEn] = athNum.value;
      return;
    }
    const val = (await refPopMobile.value?.handlerPopOK()) || refPop.value?.handlerPopOK();
    console.log('val', val);
    if (!!val && !!val[0]) {
      rowData.value[popModal.keyOfEn] = val[0].join(',');
      rowData.value[popModal.keyOfEn + 'T'] = val[1].join(',');
      curMapAttr.value['eleDBs'] = val[1];
      await changeSelect(val[0].join(','), val[1].join(','));
    }
    popModal.visible = false;
  };

  //上传附件
  const athNum = ref(0);
  /**
   * 字段附件
   * @param curMapAttr
   * @param isReadonly
   * @constructor
   */
  const OpenUploadModal = (mapAttr, isReadonly) => {
    popModal.visible = true;
    popModal.keyOfEn = mapAttr.KeyOfEn;
    popModal.modalType = 'Ath';
    popModal.Ath = mapAttr.ath;
    popModal.isReadonly = isReadonly;
    popModal.title = mapAttr.Name;
  };

  /********************************关联流程***************************************/
  const SelectOrOpenFrm = () => {
    // if (curMapAttr.value.UIIsEnable === 0 || props.isReadonly == true) {
    //   return;
    // }
    popModal.params['WorkID'] = props.params.WorkID;
    popModal.params['EnName'] = 'GL_LinkRefFlow';
    popModal.params['FlowNo'] = curMapAttr.value.Tag2;
    popModal.params['FrmID'] = curMapAttr.value.FK_MapData;
    popModal.params['KeyOfEn'] = curMapAttr.value.KeyOfEn;
    popModal.modalType = 'GenerList';
    popModal.title = '关联流程';
    popModal.visible = true;
  };
  const jumpOrOpenFrm = async (val) => {
    const strs = val.split(',');
    if (strs.length === 3) {
      const flowNo = strs[1].replace('FlowNo=', '');
      const workID = strs[2].replace('WorkID=', '');
      popModal.params['FlowNo'] = flowNo;
      popModal.params['WorkID'] = workID;
      popModal.params['isComponent'] = true;
      popModal.params['isReadonly'] = true;
      popModal.visible = true;
      popModal.title = strs[0].substring(7);
      popModal.modalType = 'Frm';
    } else {
      const billNoStr = val.split(',');
      if (billNoStr.length == 2) {
        const handler = new HttpHandler('BP.WF.HttpHandler.WF');
        handler.AddPara('BillNo', billNoStr[1]);
        const data = await handler.DoMethodReturnString('getLinkFlowInfo');
        console.log('data', data);

        const LinkFlowInfo = JSON.parse(JSON.stringify(data));
        console.log(LinkFlowInfo);

        popModal.params['FlowNo'] = LinkFlowInfo.FlowNo;
        popModal.params['WorkID'] = LinkFlowInfo.WorkID;
        popModal.params['isReadonly'] = true;
        popModal.params['isComponent'] = true;
        popModal.visible = true;
        popModal.title = billNoStr[0];
        popModal.modalType = 'Frm';
      }
    }
  };
  const modalIsShow = async (isShow: boolean, LinkTitle: string) => {
    popModal.visible = isShow;
    rowData.value[curMapAttr.value.KeyOfEn + 'T'] = LinkTitle;
    LinkTitle = LinkTitle.split(',')[0].substring(7);
    rowData.value[curMapAttr.value.KeyOfEn] = LinkTitle;
  };
  /********************************关联流程***************************************/
  /**
   * 删除FrmEleDB
   * @param mapAttr
   * @param eledb
   * @constructor
   */
  const DeleteEleDB = async (eleItem, idx) => {
    let arr = rowData.value[curMapAttr.value.KeyOfEn].split(',');
    arr.splice(idx, 1);
    rowData.value[curMapAttr.value.KeyOfEn] = arr.join(',');
    arr = rowData.value[curMapAttr.value.KeyOfEn + 'T'].split(',');
    arr.splice(idx, 1);
    curMapAttr.value['eleDBs'] = arr;
    rowData.value[curMapAttr.value.KeyOfEn + 'T'] = arr.join(',');
  };
  /********************************弹窗返回值的操作完成*********************************/
  /********************************搜索多选*******************************************/
  const choiceSearchFetching = ref(false);
  const choiceSearchData = ref<any[]>([]);
  const ChoiceSearchFetch = async (value) => {
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
  };

  /********************************搜索多选*******************************************/
  /********************************事件绑定函数**blur/change**************************/
  const inputChange = async () => {
    await CommDoFunc('change', rowData.value[curMapAttr.value.KeyOfEn]);
    await DataChange2FrmBodyItemChange();
  };
  const inputBlur = async () => {
    await CommDoFunc('blur', rowData.value[curMapAttr.value.KeyOfEn]);
    await DataChange2FrmBodyItemChange();
  };
  /**
   *
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
  /********************************事件绑定函数**blur/change**************************/

  /********************************下拉框的操作***************************************/
  const ChangeParentAttr: Function = inject('ChangeParentAttr') as Function;
  const CleanAll: Function = inject('CleanAll') as Function;
  const SetEnable: Function = inject('SetEnable') as Function;
  /**
   * select 选择弹窗
   * @param mapAttr
   */
  const onSelectClickPop = (mapAttr) => {
    if (mapAttr.UIIsEnable === 0 || props.isReadonly == true) return;
    selectPop.visible = true;
    selectPop.ddl = mapAttr['ddl'];
    console.log(mapAttr['ddl']);
    selectPop.ddl?.map((item) => {
      if (item['label']) item['text'] = item?.label;
      else return item['text'];
    });
    selectPop.mode = mapAttr['mode'];
  };
  const onSufSelectClickPop = (mapAttr) => {
    if (mapAttr.UIIsEnable === 0 || props.isReadonly == true) return;
    selectPop.visible = true;
    selectPop.ddl = mapAttr['sufOptions'];
    console.log(mapAttr['ddl']);
    selectPop.ddl?.map((item) => {
      if (item['label']) item['text'] = item?.label;
      else return item['text'];
    });
    selectPop.type = 'suf';
  };
  /**
   * select弹窗选择后确定操作
   * @param value
   */
  const onConfirmSelect = async ({ selectedOptions }) => {
    if (selectPop.type === 'suf') {
      rowData.value['AP_' + curMapAttr.value.KeyOfEn] = selectedOptions[0].text;
      selectPop.visible = false;
      return;
    }
    if (selectPop.mode === 'multiple') {
      const value = checked.value.join(',');
      const text = [];
      selectPop.ddl.forEach((item) => {
        if ((value + ',').includes(item.value + ',')) text.push(item.text);
      });
      await changeSelect(value, text.join(','));
    } else {
      let value = selectedOptions[0].value;
      let text = selectedOptions[0].text;
      if (selectedOptions.length > 1) {
        value = selectedOptions?.[selectedOptions.length - 1]?.value;
        text = selectedOptions?.[selectedOptions.length - 1]?.text;
      }
      await changeSelect(value, text);
    }
  };

  const changeSelect = async (value, text, isPageload = false) => {
    if (selectPop.mode === 'TBFullCtrl' && selectPop.para == '1') rowData.value[curMapAttr.value.KeyOfEn] = text;
    else rowData.value[curMapAttr.value.KeyOfEn] = value;
    if (text != null) {
      rowData.value[curMapAttr.value.KeyOfEn + 'Text'] = text;
      rowData.value[curMapAttr.value.KeyOfEn + 'T'] = text;
    }

    selectPop.visible = false;
    await DealMapExtBySelect(value, isPageload);
    //执行自定义的方法
    let result;
    if (entityFrm != null) {
      entityFrm.FrmBodyJson = rowData.value;
      result = await entityFrm.FrmBodyItemChange(curMapAttr.value.KeyOfEn, value);
    } else result = await FrmBodyItemChange.FrmBodyItemChange(curMapAttr.value.FK_MapData, props.refPKVal, curMapAttr.value.KeyOfEn, value, rowData.value);
    if (!!result && typeof result === 'object') {
      for (const key in result) {
        if (rowData.value[key] != result[key]) rowData.value[key] = result[key];
      }
    }
  };
  const DealMapExtBySelect = async (value, isPageLoad) => {
    //处理扩展属性
    const mapExts = curMapAttr.value.mapExts || [];
    let isLoadFul = true;
    for (const mapExt of mapExts) {
      if (isPageLoad && mapExt.ExtModel === 'RBAction') continue;
      if (isPageLoad && mapExt.ExtModel === 'DDLFullCtrl' && parseInt(mapExt['IsLoadFull'] || 1) == 0) {
        isLoadFul = false;
        continue;
      }
      if (isPageLoad && (mapExt.ExtModel === 'FullDataDtl' || mapExt.ExtModel === 'FullDataDDL')) continue;
      switch (mapExt.ExtModel) {
        case 'ActiveDDL': //级联其他控件
          const data = await GetActionDLLData(value, mapExt, props.refPKVal, rowData.value);
          ChangeParentAttr(mapExt.AttrsOfActive, 'ActiveDDL', data, mapExt.AtPara, props.rowIdx);
          break;
        case 'FullCtrl':
        case 'TBFullCtrl':
        case 'Pop':
        case 'DDLFullCtrl':
          //不填充
          if (mapExt?.DoWay == 0) break;
          if (mapExt?.DoWay === 'None') break;
          //填充主表控件,控制字段是Tag5
          if (!!mapExt.Tag5 && mapExt.Tag5 != 'None' && mapExt.Tag5 != '0') {
            const fullData = await GetFullData(value, mapExt, props.refPKVal, rowData.value, props.data);
            if (fullData == null) continue;
            if (props.isDtl === false) ChangeParentAttr(curMapAttr.value.KeyOfEn, 'FullData', fullData, mapExt.AtPara, props.rowIdx);
            else
              for (const item in fullData) {
                if (rowData.value.hasOwnProperty(item)) rowData.value[item] = fullData[item];
              }
          }
          break;
        case 'FullDataDDL':
          const result = await GetActionDLLData(value, mapExt, props.refPKVal, rowData.value);
          ChangeParentAttr(mapExt.Tag1, 'FullDataDDL', result, mapExt.AtPara, props.rowIdx);
          break;
        case 'FullDataDtl':
          const resultData = await GetFullDataDtl(value, mapExt, props.refPKVal, rowData.value, props.data);
          if (resultData == null) break;
          ChangeParentAttr(mapExt.Tag1, 'FullDataDtl');
          break;
        case 'FullDataAth':
          const resultAthData = await GetFullDataAth(value, mapExt, props.refPKVal, rowData.value, props.data);
          if (resultAthData == null) break;
          ChangeParentAttr(mapExt.Tag1, 'FullDataAth');
          break;
        case 'BindFunction': //绑定函数
          await CommDoFunc('change', value);
          break;
        case 'RBAction': //联动其他控件
          if (mapExt?.DoWay == 0) break;
          if (mapExt?.DoWay === 'None') break;
          //清空之前的设置
          CleanAll(mapExt.FK_MapData, mapExt.AttrOfOper);
          //设置联动
          if (Array.isArray(value)) {
            value.forEach((item) => {
              SetEnable(mapExt.FK_MapData, mapExt.AttrOfOper, item, props.rowIdx);
            });
          } else SetEnable(mapExt.FK_MapData, mapExt.AttrOfOper, value, props.rowIdx);

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
            await ChangeParentAttr(mapExt.Tag, 'EnumHidItems', hideItems, rowData.value, props.rowIdx);
            break;
          }
          break;
        default:
          //message.error(curMapAttr.value.Name + '的扩展属性' + mapExt.ExtModel + '还未解析');
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
  const inputRef = ref(null);
  const FormatMoney = (value) => {
    if (value === '') return parseFloat(0).toFixed(curMapAttr.value['bit']);
    const valStr = parseFloat(value).toFixed(curMapAttr.value['bit']);
    const newValue = !valStr.includes('.') ? valStr : valStr.substring(0, valStr.indexOf('.'));
    let precisionVal = !valStr.includes('.') ? '0' : valStr.substring(valStr.indexOf('.') + 1);
    if (precisionVal.length < curMapAttr.value['bit']) {
      for (let i = precisionVal.length; i < curMapAttr.value['bit']; i++) precisionVal += '0';
    }
    return newValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + precisionVal;
  };
  const NumberORDateChange = async () => {
    if (curMapAttr.value.LGType != FieldTypeS.Normal) return;
    const isDate = isDateOrDateTime(curMapAttr.value);
    const mapExts = curMapAttr.value.mapExts || [];
    if (isDate && mapExts.length > 0) {
      for (const mapExt of mapExts) {
        switch (mapExt.ExtModel) {
          case 'DateFiledMaxMin': //对从表列求最大值最小值
            console.log({ dtlKey: mapExt.Tag1, mainKey: mapExt.AttrOfOper, computed: mapExt.Tag });
            emit('ChangeDtlData', { dtlKey: mapExt.Tag1, mainKey: mapExt.AttrOfOper, computed: mapExt.Tag, type: 'Date' });
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
              expression = expression.replace(regExp, rowData.value[key] || '0');
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
            } catch (e) {
              console.log(e);
            }
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
            console.log({ dtlKey: mapExt.Tag1, mainKey: mapExt.AttrOfOper, computed: mapExt.Tag });
            emit('ChangeDtlData', { dtlKey: mapExt.Tag1, mainKey: mapExt.AttrOfOper, computed: mapExt.Tag, type: 'Number' });
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
  const emit = defineEmits(['ChangeDtlData']);
  // watch(
  //   () => cloneDeep(rowData.value),
  //   async () => {
  //     await NumberORDateChange();
  //   },
  //   {
  //     immediate: true,
  //   },
  // );

  /********************************数值型的操作***************************************/
  /********************************日期时间型的操作************************************/
  /**
   * 日期时间弹窗
   */
  const onDateClickPop = () => {
    //const mapAttr = curMapAttr.value;
    if (curMapAttr.value.UIIsEnable === 0 || props.isReadonly == true) return;
    datePop.visible = true;
    datePop.dateType = curMapAttr.value['dateType'];
    datePop.columnsType = curMapAttr.value['columnsType'];
    disabledDate();
    let dateVal = rowData.value[curMapAttr.value.KeyOfEn] == '' ? dayjs(new Date()).format(curMapAttr.value.format) : rowData.value[curMapAttr.value.KeyOfEn];
    if (datePop.dateType === 'date') {
      datePop.currentDate = dateVal.split('-');
    } else if (datePop.dateType === 'time') {
      datePop.currentTime = dateVal.split(':');
    } else {
      const strs = dateVal.split(' ');
      if (strs.length > 0) datePop.currentDate = strs[0].split('-');
      if (strs.length > 1) datePop.currentTime = strs[1].split(':');
    }
    console.log(datePop);
  };
  const onConfirmDate = ({ selectedValues }) => {
    let val = '';
    if (datePop.dateType === 'date') val = selectedValues.join('-');
    else if (datePop.dateType === 'time') val = selectedValues.join(':');
    else val = `${datePop.currentDate.join('-')} ${datePop.currentTime.join(':')}`;
    rowData.value[curMapAttr.value.KeyOfEn] = val;
    datePop.visible = false;
  };
  const disabledDate = () => {
    // 不选择历史时间
    const mapExts = curMapAttr.value.mapExts || [];
    if (mapExts.length === 0) return;
    if (mapExts.length === 1 && mapExts[0].ExtModel === 'BindFunction') return;
    for (const mapExt of mapExts) {
      if (mapExt.ExtModel === 'DateFieldInputRole') {
        //不能选择历史时间
        if (parseInt(mapExt?.DoWay) === 1) {
          datePop.minDate = new Date(dayjs().year(), dayjs().month(), dayjs().date());
          return;
        }
        //不能小于开始时间
        if (parseInt(mapExt?.DoWay) === 2) {
          const compareDate = mapExt.Tag1; //比较时间
          const expersion = mapExt.Tag; //表达式
          const dateValue = dayjs(rowData.value[compareDate]);
          if (rowData.value[compareDate] === '') return;
          switch (expersion) {
            case 'GT': //大于
            case '>':
              datePop.minDate = new Date(dateValue.year(), dateValue.month(), dateValue.date() + 1);
              return;
            case 'GTE': //大于等于
            case '>=':
              datePop.minDate = new Date(dateValue.year(), dateValue.month(), dateValue.date());
              return;
            case 'IT': //小于
              datePop.maxDate = new Date(dateValue.year(), dateValue.month(), dateValue.date() - 1);
              return;
            case 'ITE': //小于等于
              datePop.maxDate = new Date(dateValue.year(), dateValue.month(), dateValue.date());
              return;
            case 'EQ': //等于
              datePop.maxDate = new Date(dateValue.year(), dateValue.month(), dateValue.date());
              datePop.minDate = new Date(dateValue.year(), dateValue.month(), dateValue.date());
              return;
            case 'NEQ': //不等于
              //datePop.minDate = new Date(dateValue.year(), dateValue.month(), dateValue.date() + 1);
              //datePop.maxDate = new Date(dateValue.year(), dateValue.month(), dateValue.date() - 1);
              return;
            default:
              showFailToast(mapExt.AttrOfOper + '时间限制条件' + expersion + '未解析');
          }
        }
      }
    }
    return;
  };

  /********************************日期时间型的操作************************************/

  //获取大块文本的说明
  const htmlContent = ref('');
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
      popModal.visible = true;
      popModal.modalType = 'link';
      popModal.params.Doc = curMapAttr.value.Tag;
      popModal.title = curMapAttr.value.Name;
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
          await entityFrm.FrmBodyBtnClick(curMapAttr.value.KeyOfEn, '');
        } else await FrmBodyBtnClick.FrmBodyBtnclick(mapAttr.FK_MapData, props.refPKVal, mapAttr.KeyOfEn, rowData.value);
      }
    } catch (e) {
      message.error(e as string);
    }
    //执行填充
    await DealMapExtBySelect(false, null);
  };

  const popCenter = reactive({
    visible: false,
    title: '',
    modalType: 'HandWriting',
    keyOfEn: '',
    ImgSrc: '',
  });
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
   * 弹窗打开签字版
   * @param curMapAttr
   * @param val
   * @constructor
   */
  const DoHandWrite = (mapAttr, val) => {
    //把路径转base64
    const filePath = '/api' + val.substring(val.indexOf('/DataUser'));
    if (val == '') {
      popCenter.visible = true;
      popCenter.keyOfEn = mapAttr.KeyOfEn;
      popCenter.modalType = 'HandWriting';
      popCenter.title = '签字版';
    } else {
      urlToBase64(filePath).then((base64) => {
        popCenter.visible = true;
        popCenter.ImgSrc = base64;
        popCenter.keyOfEn = mapAttr.KeyOfEn;
        popCenter.modalType = 'HandWriting';
        popCenter.title = '签字版';
      });
    }
  };

  const ChangeWriteImg = (val) => {
    rowData.value[popCenter.keyOfEn] = VITE_GLOB_API_URL + val.substring(val.indexOf('/DataUser'));
    popCenter.visible = false;
  };
  /**
   * 拨打电话
   */
  const telToLink = () => {
    return `tel:${rowData.value[curMapAttr.value.KeyOfEn]}`;
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
    /*const email = 'nayuanli@126.com';
  	const subject = 'Hello';
  	const body = 'This is the body of the email';

  	// 使用encodeURIComponent对邮件的内容进行编码
  	const encodedSubject = encodeURIComponent(subject);
  	const encodedBody = encodeURIComponent(body);

  	return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;*/
  };
  /**
   * 打开地址
   * @constructor
   */
  const OpenAddr = () => {
    const url = rowData.value[curMapAttr.value.KeyOfEn];
    windowOpen(url);
  };
  /**
   * 打开日历事件插件
   */
  const calendarToLink = () => {};
  const InitPage = async () => {
    if (!!curMapAttr.value.AtPara && [2, 3, 5, 8].includes(curMapAttr.value.MyDataType) && curMapAttr.value.LGType === FieldTypeS.Normal && props.isReadonly === false) {
      let num = GetPara(curMapAttr.value.AtPara, 'NumMax');
      if (!!num) numMax.value = parseFloat(num);
      num = GetPara(curMapAttr.value.AtPara, 'NumMin');
      if (!!num) numMin.value = parseFloat(num);
      await NumberORDateChange();
      if (isNumber(curMapAttr.value)) {
        if (!curMapAttr.value.rules) curMapAttr.value.rules = [];
        curMapAttr.value.rules.push({ validator: validateNumber, message: '请输入有效的正负数值' });
      }
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
          if (parseInt(mapExts[0]['IsLoadFull'] || 1) === 1) {
            const val = rowData.value[curMapAttr.value.KeyOfEn];
            const options = curMapAttr.value.ddl === undefined ? null : curMapAttr.value.ddl.filter((item) => item.value === val);
            await changeSelect(val, options != null && options.length > 0 ? options[0].text : null, true);
          }
        }
        return;
      }
      if (isDDL(curMapAttr.value)) {
        const val = rowData.value[curMapAttr.value.KeyOfEn];
        const options = curMapAttr.value.ddl === undefined ? null : curMapAttr.value.ddl.filter((item) => item.value === val);
        changeSelect(val, options != null && options.length > 0 ? options[0].text : null, true);
        return;
      }
    }
    if (isTextPop(curMapAttr.value) || isTextSelect(curMapAttr.value)) {
      const no = rowData.value[curMapAttr.value.KeyOfEn] || '';
      const text = rowData.value[curMapAttr.value.KeyOfEn + 'T'] || '';
      curMapAttr.value['eleDBs'] = [];
      if (!!no && !!text) {
        curMapAttr.value['eleDBs'] = text.split(',');
      }
    }
    if (isTextChoiceSearch(curMapAttr.value)) {
      const no = rowData.value[curMapAttr.value.KeyOfEn] || '';
      const text = rowData.value[curMapAttr.value.KeyOfEn + 'T'] || '';
      curMapAttr.value['eleDBs'] = [];
      if (!!no && !!text) {
        no.split(',').forEach((item, idx) => {
          curMapAttr.value['eleDBs'].push({
            value: item,
            label: text.split(',')[idx],
          });
        });
      }
    }
    //签批字段
    if (isSignCheck(curMapAttr.value) && props.isPageReadonly === false && nodeInfo != null) {
      const checkField = nodeInfo.CheckField;
      const keyOfEn = curMapAttr.value.KeyOfEn;

      if (checkField == keyOfEn) {
        const val = rowData.value[keyOfEn];
        if (val.includes(nodeInfo.NodeID + ',') == false) rowData.value[keyOfEn] = val + nodeInfo.NodeID + ',';
      }
    }
    if (curMapAttr.value.UIContralType === 60) {
      await GetBigText();
    }
    //判断是不是存在小范围单选，小范围多选
    if (curMapAttr.value.mapExts) {
      let data = curMapAttr.value.mapExts.filter((item) => item.ExtModel === 'MultipleChoiceSmall' || item.ExtModel === 'SingleChoiceSmall');
      if (data.length > 0) {
        curMapAttr.value['ddl'] = await GetDataTableOfTBChoice(data[0], props.refPKVal);
        curMapAttr.value['type'] = 'select';
        curMapAttr.value['mode'] = '';
        if (data[0].ExtModel === 'MultipleChoiceSmall') {
          curMapAttr.value['mode'] = 'multiple';
          rowData.value[curMapAttr.value.KeyOfEn] = !!rowData.value[curMapAttr.value.KeyOfEn] ? rowData.value[curMapAttr.value.KeyOfEn].split(',') : [];
        }
      }
    }

    if (curMapAttr.value.LGType === FieldTypeS.Enum && curMapAttr.value.UIContralType === UIContralType.CheckBok) {
      // if (Array.isArray(rowData.value[curMapAttr.value.KeyOfEn]) == false) {
      // }
      // //如果mapAttr中ddl集合不为空时
      // let isStringEnum = false;
      // if (curMapAttr.value['ddl'] && curMapAttr.value['ddl'].length != 0 && typeof curMapAttr.value['ddl'][0].value === 'string') isStringEnum = true;
      // if (isStringEnum === false)
      //   rowData.value[curMapAttr.value.KeyOfEn] = rowData.value[curMapAttr.value.KeyOfEn]
      //     .toString()
      //     .split(',')
      //     .map((item) => item * 1);
      // else rowData.value[curMapAttr.value.KeyOfEn] = rowData.value[curMapAttr.value.KeyOfEn].toString().split(',');
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
    }
    //附件数量
    if (curMapAttr.value.UIContralType === 6) {
      athNum.value = rowData.value[curMapAttr.value.KeyOfEn] || 0;
    }
  };
  InitPage();
  //附件预览二次弹窗通过传值判断Frm表单是否显示滚动条

  // 从URL加载参数
  const loadQueryArgs = () => {
    const route = useRoute();
    const query = route.query;
    const qKeys = Object.keys(query);
    const { mapAttr } = props;
    if (isDDL(mapAttr as MapAttrExt) || isRadio(mapAttr as MapAttrExt) || (mapAttr.type === 'select' && qKeys.includes(mapAttr.KeyOfEn))) {
      // 如果URL存在参数并且当前RowData没有参数值，则赋值
      if (!!query[mapAttr.KeyOfEn] && !rowData.value[mapAttr.KeyOfEn]) {
        rowData.value[mapAttr.KeyOfEn] = query[mapAttr.KeyOfEn];
        const label = mapAttr.ddl?.filter((item) => item.value == query[mapAttr.KeyOfEn])?.text;
        if (label) {
          rowData.value[mapAttr.KeyOfEn + 'T'] = query[mapAttr.KeyOfEn + 'T'];
          rowData.value[mapAttr.KeyOfEn + 'Text'] = query[mapAttr.KeyOfEn + 'Text'];
        }
      }
    }
  };
  const AthViewShow = ref();
  onMounted(() => {
    Event.on('modalShow', (data: any) => {
      AthViewShow.value = data;
    });
    // 从地址栏读取参数
    loadQueryArgs();
  });
  onUnmounted(() => {
    Event.off('modalShow');
  });
  //保存审核组件
  const instance = getCurrentInstance();
  const WorkCheckSave = async (isSaveOnly) => {
    let refW = instance?.refs['workCheck'] as InstanceType<typeof WorkCheck>;
    if (Array.isArray(refW)) refW = refW[0];
    if (!!refW && typeof refW?.WorkCheckSave === 'function') {
      return await refW.WorkCheckSave(isSaveOnly);
    }
    return false;
  };

  //字段校验
  defineExpose({ TextPopOK, WorkCheckSave });
</script>

<style lang="less" scoped>
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

  .van-switch {
    margin-left: calc(100% - 62px);
  }

  .pop_intput_div {
    line-height: 32px;
    min-height: 32px;
    /*height: auto;*/
    width: calc(100% - 46px);
    border: 1px solid #ccc;
  }

  :deep(.van-cell__value) {
    display: inline;
    font-size: 16px;
  }

  :deep(.van-field__control:disabled) {
    color: #999999 !important;
    -webkit-text-fill-color: #999999;
  }

  :deep(.van-field__button) {
    display: flex;
    align-items: center;
  }
  .van-nav-bar--fixed {
    background-color: #4356ff;
    color: #fff;
    z-index: 99;
  }
  :deep(.van-nav-bar__left .van-icon) {
    color: #fff;
    font-size: 20px;
    font-weight: 700;
  }
  :deep(.van-nav-bar__title) {
    color: #fff;
  }
  //宁波需要增加2个像素
  .van-cell {
    font-size: 16px;
  }
</style>
