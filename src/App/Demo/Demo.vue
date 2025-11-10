<template xmlns:value="">
  <div style="display: flex; justify-content: center; align-items: center; margin-top: 10px">
    <Card>
      <Form ref="refState" :model="formState" style="width: 60vw" :label-col="{ style: { width: '150px' } }" :wrapper-col="{ span: 12 }">
        <Row gutter="24">
          <Col span=12 key=0/>
            <FormItem label="发文种类:" name="fwzl" >
              <Select defaultValue="--请选择--" style="width: 100px" >
                <option value="--请选择--"></option>
                <option value="种类1"> 0 </option>
                <option value="种类2">1</option>
              </Select>
            </FormItem>
          </Col>
          <Col span=12 key=0/>
            <FormItem label="发文编号:" name="fwbh" >
              <Select defaultValue="--请选择--" style="width: 100px" >
                <option value="--请选择--"></option>
                <option value="种类1"> 0 </option>
                <option value="种类2">1</option>
              </Select>
              [2024] <Input style="width: 60px" />号
            </FormItem>
          </Col>
        </Row>
        <Row gutter="24">
          <Col span=12 key=0/>
            <FormItem label="拟稿人部门:" name="fwzl" >
              系统管理员 港珠澳项目部
            </FormItem>
          </Col>
          <Col span=12 key=0/>
            <FormItem label="拟稿日期:" name="fwbh" >
              <DatePicker  />
            </FormItem>
          </Col>
        </Row>
        <Row gutter="24">
          <Col span=12 key=0/>
            <FormItem label="正文紧急程度:" name="fwzl" >
              <Select defaultValue="平件" style="width: 100px" >
                <option value="平件"></option>
                <option value="种类1"> 0 </option>
                <option value="种类2">1</option>
              </Select>
            </FormItem>
          </Col>
          <Col span=12 key=0/>
            <FormItem label="办理紧急程度:" name="fwbh" >
              <Select defaultValue="平件" style="width: 100px" >
                <option value="平件"></option>
                <option value="种类1"> 0 </option>
                <option value="种类2">1</option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row gutter="24">
          <Col span=12 key=0/>
            <FormItem label="密集:" name="fwzl" >
              <Select defaultValue="普通" style="width: 100px" >
                <option value="普通"></option>
                <option value="种类1"> 0 </option>
                <option value="种类2">1</option>
              </Select>
            </FormItem>
          </Col>
          <Col span=12 key=0/>
            <FormItem label="所属业务:" name="fwbh" >
              <Select defaultValue="--请选择--" style="width: 100px" >
                <option value="--请选择--"></option>
                <option value="种类1"> 0 </option>
                <option value="种类2">1</option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row gutter="24">
          <Col span=12 key=0/>
            <FormItem label="是否回复:" name="fwzl" >
              <Select defaultValue="--请选择--" style="width: 100px" >
                <option value="--请选择--"></option>
                <option value="种类1"> 0 </option>
                <option value="种类2">1</option>
              </Select>
            </FormItem>
          </Col>
          <Col span=12 key=0/>
            <FormItem label="是否内部文件:" name="fwbh" >
              <Select defaultValue="否" style="width: 100px" >
                <option value="否"></option>
                <option value="种类1"> 0 </option>
                <option value="种类2">1</option>
              </Select>
            </FormItem>
          </Col>
        </Row>
        <Row gutter="24">
          <Col span=24 key=0/>
            <FormItem label="文件标题:" name="fwzl" >
              <Input style="width: 150%" />
            </FormItem>
          </Col>
        </Row>
        <Row gutter="24">
          <Col span=24 key=0/>
            <FormItem label="主题词:" name="fwzl" >
              <Input style="width: 150%" />
            </FormItem>
          </Col>
        </Row>
        <Row gutter="24">
          <Col span=24 key=0/>
            <FormItem label="主送单位:" name="fwzl" >
              <Input style="width: 150%" />
            </FormItem>
          </Col>
        </Row>
        <Row gutter="24">
          <Col span=24 key=0/>
            <FormItem label="抄送单位:" name="fwzl" >
              <Input style="width: 150%" />
            </FormItem>
          </Col>
        </Row>
        <Row gutter="24">
          <Col span=12 key=0/>
            <FormItem label="发文日期:" name="fwbh" >
              <DatePicker  />
            </FormItem>
          </Col>
          <Col span=12 key=0/>
            <FormItem label="校正人:" name="fwzl" >
              <Input style="width: 50%" />
            </FormItem>
          </Col>
        </Row>
        <Row gutter="24">
          <Col span=24 key=0/>
            <FormItem label="备注:" name="fwzl" >
              <Input style="width: 150%" />
            </FormItem>
          </Col>
        </Row>
        <Row gutter="24">
          <Col span=12 key=0/>
            <FormItem label="正文:" name="fwbh" >
              <Input style="width: 100%" />
            </FormItem>
          </Col>
          <Col span=12 key=0/>
            <FormItem label="回复收文:" name="fwzl" >
              <Input style="width: 100%" />
            </FormItem>
          </Col>
        </Row>
        <Row gutter="24">
          <Col span=24 key=0/>
            <FormItem label="附件:" name="fwzl" >
              <Upload >
                <Button >浏览</Button>
              </Upload>
            </FormItem>
          </Col>
        </Row>
      </Form>
    </Card>
  </div>
</template>
<!--嵌入式表单 相同域的组件例子-->
<script setup lang="ts">
import {Form, FormItem, Input, Button, Card, Upload, Row, Col, Select, DatePicker, message} from 'ant-design-vue';
import { reactive, shallowRef } from 'vue';

const formState = reactive({});
// eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
 const Save = () => {
  //数据获取
  console.log('内部vue文件', formState)
  return true;
 };

// window.Save = Save;
  defineExpose({ Save });

</script>
