<template>
  <div>
    <div v-if="ifshow == 0">
      <div class="bor">
        {{ title }}
      </div>
      <ul>
        <li class="li_row titles">
          <div class="li_item order">{{ '序' }}</div>
          <div class="li_item title">{{ '类型' }}</div>
          <div class="li_item description"
            >{{ '表达式'
            }}<Dropdown :trigger="['click']">
              <Button class="btnsize ant-dropdown-link" type="primary" size="small" ghost @click.prevent> <plus-circle-outlined />{{ '新建条件' }}</Button>
              <template #overlay>
                <Menu @click="options">
                  <MenuItem v-for="(item, index) in datas" :key="index">
                    <a href="javascript:;">{{ item.content }}</a>
                  </MenuItem>
                </Menu>
              </template>
            </Dropdown>
            <Dropdown :trigger="['click']">
              <Button class="btnsize ant-dropdown-link" type="primary" size="small" ghost @click.prevent> <plus-circle-outlined />{{ '插入运算符' }}</Button>
              <template #overlay>
                <Menu @click="operators">
                  <MenuItem v-for="(item, index) in operator" :key="index">
                    <a href="javascript:;">{{ item.label }}</a>
                  </MenuItem>
                </Menu>
              </template>
            </Dropdown>
          </div>
          <div class="li_item option">{{ '操作' }}</div>
        </li>
        <li
          class="li_row"
          v-for="(item, index) in condsRef"
          :key="index"
          draggable="true"
          @dragstart="drag($event, index)"
          @drop="drop($event, index)"
          @dragover="allowDrop($event)"
        >
          <div class="li_item order">{{ item.Idx }}</div>
          <div class="li_item title">
            {{ item.DataFromText }}
          </div>
          <div class="li_item description suspended" @click="EditCond(item.DataFromText, item.MyPK, item.DataFrom, index)">
            {{ item.Note }}
          </div>
          <div class="li_item option">
            <Button class="btnsize" type="primary" ghost size="small" @click="Delete(item.MyPK, index)"> <delete-outlined />{{ '删除' }}</Button>
          </div>
        </li>
      </ul>
      <div class="msg">{{ hint }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { Dropdown, Button, Menu, MenuItem, MenuProps } from 'ant-design-vue';
  import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons-vue';
  import { Cond, Conds } from './Cond';
  import { Direction } from './Direction';
  import HttpHandler from '/@/utils/gener/HttpHandler';
  import { ref, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  const props = defineProps({
    params: {
      type: Object,
      default: () => {
        return {
          nodeID: '',
          FK_Node: '',
        };
      },
    },
  });

  const nodeID = props.params.NodeID;
  const toNodeID = props.params.ToNodeID;
  const condType = props.params.CondType;
  const flowNo = props.params.FlowNo;
  const mypk = ref('');
  const router = useRouter();
  const ifshow = ref('0');
  const hint = ref('');
  const datas = [
    { id: 1, content: '按表单条件计算' },
    { id: 2, content: '按已选择的独立表单条件计算' },
    { id: 3, content: '按指定操作员的角色条件' },
    { id: 4, content: '按指定操作员的部门条件' },
    { id: 5, content: '按SQL条件计算' },
    { id: 6, content: '按SQL模板条件计算' },
    { id: 7, content: '按开发者参数计算' },
    { id: 8, content: '按Url条件计算' },
    { id: 9, content: '按WebApi返回值' },
    { id: 10, content: '按审核组件的立场计算' },
  ];
  const operator = [
    {
      label: '( 左括号',
      value: '(',
    },
    {
      value: ')',
      label: ') 右括号',
    },
    {
      label: 'AND并且',
      value: 'AND',
    },
    {
      label: 'OR或者',
      value: 'OR',
    },
  ];
  const title = ref('');
  const condsRef = ref<Array<Cond>>([]);
  // 点击条件菜单
  const options: MenuProps['onClick'] = ({ key }) => {
    mypk.value = '';
    ifshow.value = key + 1;
  };
  // 点击运算符菜单
  const operators: MenuProps['onClick'] = async ({ key }) => {
    const radomNum = parseInt(Math.random() * 1000) + 1;

    const en = new Cond();
    await en.Init();

    //生成一个随机数添加到运算符的主键中
    en.CondType = condType; //条件类型.
    en.DataFrom = 100; //运算符.
    en.DataFromText = '运算符';

    en.FK_Flow = flowNo;
    en.FK_Node = nodeID;
    en.ToNodeID = toNodeID;
    en.FK_Operator = operator[key].value; //都赋值，以免用错.
    en.OperatorValue = operator[key].value; //都赋值，以免用错.
    en.Idx = 100;
    en.MyPK = flowNo + '_' + nodeID + '_' + radomNum;
    en.Note = en.OperatorValue;
    await en.Insert();

    //增加到集合里面.
    condsRef.value.push(Object.fromEntries(en.Row));
    await MoveItem(cycle(condsRef.value));
    await CondCheck();
  };

  // 子组件返回事件
  function Back() {
    ifshow.value = '0';
  }

  function cycle(conds) {
    let datas = [];
    conds.forEach((element) => {
      datas.push(element.MyPK);
    });
    return datas.join(',');
  }

  async function Init() {
    // CondType=2&FK_Flow=001&FK_MainNode=101&FK_Node=101&ToNode=107
    // props.params.xxx
    // MyPK
    const dir = new Direction(props.params.MyPK);
    await dir.Init();
    await dir.Retrieve();
    const dirData = Object.fromEntries(dir.Row);
    //0. 查询数据,获得所有的条件.
    const conds = new Conds();
    await conds.Init();
    await conds.Retrieve('FK_Node', dir.Node, 'ToNodeID', dir.ToNode, 'CondType', condType, 'Idx');
    //输出条件类型.
    // 方向条件.
    if (condType == 0) title.value = '节点完成条件';
    if (condType == 1) title.value = '流程完成条件';
    if (condType == 2) title.value = '到达节点' + dirData.ToNode + ' ' + dirData.ToNodeName + '的方向条件';
    if (condType == 3) title.value = '子流程启动条件';
    condsRef.value = conds;
    //1. Todo: 显示列表. MyPK, ToNode.
  }

  //删除条件.
  /**
   * try{
   *   // 先执行后端删除
   *   [].splice()
   *   // 检查条件
   * }catch(e){
   * }
   */
  // 删除
  async function Delete(mypk, i) {
    try {
      // todo: 用 antd 展示提示框
      if (window.confirm('确定要删除吗?') == false) return;
      const cond = new Cond(mypk);
      await cond.Init(); // promise
      await cond.Delete();
      // 前端删除
      condsRef.value.splice(i, 1);
      // 执行条件检查
      await MoveItem(cycle(condsRef.value));
      await CondCheck();
    } catch (e: any) {
      console.error(e.toString());
    }
  }

  /**
   * 修改条件.
   */
  async function EditCond(Note: string, myPK: string, dataFrom: number, index: number) {
    if (Note != '运算符') {
      //数据类型
      if (dataFrom == 0) {
        //表单字段
        mypk.value = myPK;
        ifshow.value = '1';
      } else if (dataFrom == 1) {
        ('独立表单');
        //独立表单.
        url = '/src/WF/Admin/Cond2020/GPN_Cond/CondByFrm?MyPK=' + myPK;
      } else if (dataFrom == 2) {
        // url = '按角色';
        mypk.value = myPK;
        ifshow.value = '3';
      } else if (dataFrom == 3) {
        // url = '按部门';
        mypk.value = myPK;
        ifshow.value = '4';
      } else if (dataFrom == 4) {
        // url = '按SQL';
        mypk.value = myPK;
        ifshow.value = '5';
      } else if (dataFrom == 5) {
        // url = '按SQL模板';
        mypk.value = myPK;
        ifshow.value = '6';
      } else if (dataFrom == 6) {
        url = '按参数';
      } else if (dataFrom == 7) {
        // url = '按URL';
        mypk.value = myPK;
        ifshow.value = '8';
      } else if (dataFrom == 8) {
        // url = '按WebApi返回值';
        mypk.value = myPK;
        ifshow.value = '9';
      } else if (dataFrom == 9) {
        url = '按审核组件立场';
      } else if (dataFrom == 100) {
        url = '运算符';
        return;
      } else {
        url = '没有判断的表达式:' + dataFrom;
      }
    } else {
      console.log('运算符不能修改');
    }
  }

  const route = useRoute();
  // 这个方法是拖动以后执行，告诉后台条件变化了
  //组成一个字符串, 格式为: 900,001,003
  async function MoveItem(myPKs) {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_Cond2020');
    handler.AddPara('MyPKs', myPKs);
    await handler.DoMethodReturnString('List_Move');
    await CondCheck();
  }

  // 如果收到拖动回调以后就调用这个方法进行检查，用于显示下方的是否符合条件
  // 检查条件是否正确
  async function CondCheck() {
   // debugger;
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_Cond2020');
    handler.AddPara('FK_Node', nodeID);
    handler.AddPara('ToNodeID', toNodeID);
    handler.AddPara('CondType', condType);

    let data = await handler.DoMethodReturnString('List_DoCheck');
    hint.value = data;
    // alert(data);

    // todo: 显示检查信息.
    // $('#msg').html(data);
    //this.msg="";
  }

  function drag(event, index) {
    event.dataTransfer.setData('index', index);
  }

  // 拖动之后
  async function drop(event, index) {
    event.preventDefault();
    let startIndex = parseInt(event.dataTransfer.getData('index'));
    let currentIndex = parseInt(index);
    if (startIndex - currentIndex > 0) {
      condsRef.value.splice(currentIndex, 0, condsRef.value[startIndex]);
      condsRef.value.splice(startIndex + 1, 1);
      await MoveItem(cycle(condsRef.value));
      await CondCheck();
    } else if (startIndex - currentIndex < 0) {
      condsRef.value.splice(currentIndex + 1, 0, condsRef.value[startIndex]);
      condsRef.value.splice(startIndex, 1);
      await MoveItem(cycle(condsRef.value));
      await CondCheck();
    } else {
      console.log('什么也不用做');
    }
  }

  function allowDrop(event) {
    event.preventDefault();
  }

  watch(ifshow, async (newV, oldV) => {
    if (newV == 0) {
      await Init();
      await MoveItem(cycle(condsRef.value));
      await CondCheck();
      console.log(condsRef.value);
    }
  });
  onMounted(async () => {
    await Init();
    await MoveItem(cycle(condsRef.value));
    await CondCheck();
  });
</script>
<style lang="less" scoped>
  .bor {
    font-weight: 900;
    background-color: #f2f2f2;
  }

  .li_row {
    display: flex;
    height: 40px;
    line-height: 40px;
    justify-content: space-around;

    div {
      text-align: center;
      border: 1px solid #eeeeee;
    }
  }

  .titles {
    background-color: #f7f7f7;
  }

  .li_row .order {
    width: 1px;
    flex-grow: 1;
  }

  .li_row .title {
    width: 1px;
    flex-grow: 2;
  }

  .li_row .description {
    width: 1px;
    flex-grow: 6;
  }

  .li_row .option {
    width: 1px;
    flex-grow: 1;
  }

  .btnsize {
    font-size: 12px;
    margin: 0 10px;
  }

  .suspended:hover {
    color: grey;
  }
</style>
