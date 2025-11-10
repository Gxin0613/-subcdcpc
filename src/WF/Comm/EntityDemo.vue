<template>
  <p>{{ '开发中' }}</p>
</template>
<script setup lang="ts"></script>
<style lang="less" scoped></style>

<!-- <template>
  <div class="p-4">
    <div class="card">
      <Card>
        <div class="title">Entity 使用示例</div>
        <div v-hl>
          <span style="font-size: 18px">1.初始化操作</span>
          <pre>
            <code id="initial-code">
              // 初始化执行代码如下：
              // 方式1：通过工厂模式拿到对应的类
              const entity = await ClassFactory.GetEn("{{ inputClassName }}")
              // 方式2： 通过类名直接创建
              const entity = new NodeEct();
              // 设置主键（可以理解为平时开发给接口传入的id）
              entity.SetPKVal("{{ entityPK }}")   // 或者直接new类名的时候传入，如 new NodeExt("{{ entityPK }}")
              // 需要先执行Init 异步方法， 保证后台在没有这个类的情况下能够成功创建
              await entity.Init()
              // 初始化后通过Retrieve方法取回数据
              await entity.Retrieve()
              // 点击下方初始化查看数据
            </code>
          </pre>
        </div>
        <Button style="margin-top: 12px" type="primary" @click="initEntity">执行初始化查看数据
        </Button>
        <pre v-if="afterInit" style="max-height: 300px;background-color: #f2f5f7">
            // 初始化后获取到的数据(Row)如下：
            {{ JSON.stringify(Object.fromEntries(entity.Row), null, 2) }}
          </pre>
        <Row :gutter="[16, 12]" style="margin-top: 12px;">
          <Col :span="12">
            <Input v-model:value="updateKey" placeholder="要更新的字段，如：HelpLab"></Input>
          </Col>
          <Col :span="12">
            <Input v-model:value="updateVal" placeholder="要更新的字段值, 如：帮助提示"></Input>
          </Col>
        </Row>
        <Button style="margin-top: 12px" type="primary" @click="UpdateEntity">更新数据 - EntityUpdate
        </Button>

      </Card>

    </div>
  </div>
</template>

<script lang="ts" setup>
import {Button, Row, Col, Card, Input} from 'ant-design-vue'
import {nextTick, onMounted, ref} from "vue";
import {Entity} from "/@/bp/en/Entity";
import {ClassFactory} from "/@/bp/da/ClassFactory";
import {Emp} from '/@/bp/port/Emp';
import { FrmAttachments } from '/@/bp/sys/FrmAttachment';
import BSEntity from '/@/utils/gener/BSEntity';
import { handler } from '/@/layouts/default/setting/handler';
import HttpHandler from '/@/utils/gener/HttpHandler';

/****************************************** 实体操作.  */
//实例化entity 的两个方式
// let enName = "TS.Port.Emp";
//  const myen = await ClassFactory.GetEn(enName); //通过string的类名称 - 实体实例化.

//  const en = new Emp(); // 直接new出来类名.
//  await en.Init(); //必须要有,这个方法与服务器进行一次通讯,并把map缓存到服务器上.

//  en.No = "zhangsan"; //给主键赋值.
//  let num = await en.RetrieveFromDBSources(); // 从数据库查询，返回Int类型影响行数.
//  if (num === 0) {
//   alert('没有查询到数据');
//   return;
// }

//  await en.Retrieve(); // 查询实体，如果查询不到则抛异常.
//  console.log("Name=" + en.Name + ",Tel=" + en.Tel);  //可以输出属性.

//  // 按照一个属性查询.
//  let num = await en.Retrieve("Name", "张三"); // 按照名字查询，返回影响的行数
//  if (num === 0) {
//   alert('没有查询到数据');
//   return;
// }

//  //执行更新.
//  en.Tel = "18988776674"; //设置属性.
//  await en.Update(); //执行更新.

//  let numResult = await en.Delete(); //删除实体.
//  if (numResult == 1) alert("删除成功.");

//  //給实体进行赋值.
//  myen.No = "lisi";
//  myen.Name = "李四";
//  myen.Tel="xxxxxx"; //与下面的赋值相等.
//  myen.Age=100;
//  myen.SetValByKey("Tel","111111");

//  if (await myen.IsExits() == false)
//  await myen.Insert();
//  else
//  await myen.Insert();

//  myen.Name = "xxxx";
//  num = await myen.Save();
//  if (num == 1) {
//   alert('保存成功.');
//   return;
// }

//  //获得该实体有多少字段?
//  let attrs = myen._enMap.Attrs;
//  attrs.forEach((f) => {
//   let key = f.Key;
//   let desc = f.Desc;
// })
 
 
//  let enName="TS.Sys.FrmAttachment";
// let handler=new HttpHandler("bp.wf.haasds.");
// handler.AddPara("xxx","xxx");
// handler.DoMethodReturnString("xxxxx");

//  let en=new BSEntity("TS.Port.Emp");
//  await en.Init();
//  en.No="xxx";
//  await en.Retrieve();
//  await en.hsoo
//  await en.Delete();
 
//  const db=await ClassFactory.GetEn(enName);
//  const dbs=await ClassFactory.GetEns(enName);


/****************************************** 集合的操作.  */
/**
 enName = "TS.Port.Emp";
 const ens = await ClassFactory.GetEns(enName); //可以进入该方法看看.
 await ens.Init(); //初始化.
 let ensNum = await ens.RetrieveAll(); //查询全部数据，并返回影响的数量.
 alert("查询出来" + ensNum + "笔数据.");

 //按照指定的字段查询.
 ensNum = await ens.Retrieve("FK_Dept", "1001");
 alert("部门编号=1001的数据有:" + ensNum + "条.");

 //按照指定的字段查询,并按照指定的字段排序.
 ensNum = await ens.Retrieve("FK_Dept", "1001", "Idx");


 //按多个条件查询, 并按照最后一个参数作为排序的条件.
 ensNum = await ens.Retrieve("FK_Dept", "1001", "XB", 1, "Idx"); //部门=1001 and XB=男的数据.
 //遍历这些数据.
 ens.forEach((en) => {
  let no = en.No;
  let name = en.Name;
  let tel = en.Tel;
})
 */


/*********************** 其他demo. */
const inputClassName = ref("TS.WF.Template.NodeExt")
const entityPK = ref("101")
const updateKey = ref("")
const updateVal = ref("")
const entity = ref<Entity>()
const afterInit = ref(false);

onMounted(() => {
  // hljs.highlightElement(document.getElementById("initial-code") as HTMLElement)
})

// 初始化Entity
const initEntity = async () => {
  // 类工厂拿到类
  entity.value = await ClassFactory.GetEn(inputClassName.value)
  entity.value?.setPKVal(entityPK.value)
  // 拿到Entity后首先要进行初始化，才能使后端创建成功类
  await entity.value?.Init()
  // 初始化后使用Retrieve方法拿到ID相关的数据
  await entity.value?.Retrieve()
  // 拿到的数据分为两部分，一部分是EnMap,用来描述数据类型，一部分是Row,用来装载后台的数据
  console.log("Map:", entity.value?._enMap, "Row:", entity.value?.Row)
  // Row 部分的数据为一个Map对象，不能直接使用，需要先转换成普通js对象
  console.log("转换后的Row:", Object.fromEntries(entity.value?.Row))
  afterInit.value = true
  await nextTick();

}

// 更新Entity
const UpdateEntity = async () => {
  entity.value?.SetValByKey(updateKey.value, updateVal.value)
  await entity.value?.Update()
}
</script>

<style lang="less" scoped>
.title {
  font-size: 32px;
}
</style> -->
