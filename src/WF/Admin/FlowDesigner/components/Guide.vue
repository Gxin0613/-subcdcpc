<template>
  <div class="container-full">
    <div class="attrnode-bar-header">
      <strong>API </strong>
    </div>
    <div class="cs-content-box">
      <fieldset>
        <legend>{{ 'URL调用接口' }}</legend>
        <ol>
          <li>{{ 'ccbpm提供页面级的功能组件，这些功能组件在/WF/下面。' }}</li>
          <li>{{ '比如：发起、待办、抄送、查询。' }}</li>
          <li>{{ '这些功能可以以明文的方式传输调用。' }}</li>
          <li>{{ '他的安全性是需要系统调用登录方法才可以，调用以上的URL。' }}</li>
          <li>{{ '如何调用登录方法，请参考下面的API。' }}</li>
        </ol>
      </fieldset>
      <fieldset>
        <legend>{{ '菜单列表' }}</legend>
        <div class="cs-help">
          <ul>
            <li
              >流程发起: <span style="color: blue"><b> /WF/Start </b></span>{{ '获得当前操作员的流程发起的列表，每个操作员的权限不同能发起的流程列表也不同。' }}</li
            >
            <li id="TB_GZDB"
              >工作待办:<span style="color: blue"><b>/WF/Todolist</b></span
              >{{ '获得当前操作员的所有的待办列表，' }}<span style="color: blue"><b>/WF/Todolist?FK_Flow=009</b></span
              >{{ '当前操作员的指定流程的待办。' }}</li
            >
            <li id="TB_ZT"
              >在途:<span style="color: blue"><b>/WF/Runing</b></span
              >{{ '当前工作人员的所有在途,' }}<span style="color: blue"><b>/WF/Runing?FK_Flow =009</b></span
              >{{ '当前操作员的指定流程的在途。在途定义：一个操作员的参与的流程，但是流程还没有完成，就叫在途。' }}</li
            >
            <li
              >抄送: <span style="color: blue"><b>/WF/CC </b></span>{{ '抄送来的工作，当前人员没有处理权限，但是可以查看。' }}</li
            >
            <li
              >查询: <span style="color: blue"><b>/WF/Search </b></span>{{ '对完成或者未完成的流程进行查询。' }}</li
            >
          </ul>
        </div>
      </fieldset>
      <fieldset>
        <legend id="TB_LCFQ">{{ '流程列车制造主流程发起' }}</legend>
        <div class="cs-help">
          <ul>
            <li id="TB_FQURL"
              >发起URL:<span style="color: blue"><b> /WF/MyFlow?FK_Flow=009</b></span
              >{{ '，您可以把该URL 放入到自己的系统菜单里，或者列表里。' }}</li
            >
            <li>{{ '该页面组件名叫：“工作处理器”，该处理器可以接受很多参数，可以向工作处理器里传入很多参数，格式与约定请参考说明书。' }}</li>
          </ul>
        </div>
      </fieldset>
      <fieldset>
        <legend>{{ '工作待办' }}</legend>
        <div class="cs-help">
          <ul>
            <li id="TB_GZDB_DQ"
              >当前流程工作待办:<span style="color: blue"><b>/WF/Todolist?FK_Flow=009</b></span></li
            >
            <li id="TB_GZDB_SY">
              所有流程工作待办:<span style="color: blue"><b> /WF/Todolist </b></span>
            </li>
          </ul>
        </div>
      </fieldset>
      <fieldset>
        <legend>在途工作(也称为未完成)</legend>
        <div class="cs-help">
          <ul>
            <li id="TB_ZTGZ_DQ"
              >当前流程工作在途: <span style="color: blue"><b>/WF/Runing?FK_Flow= 009</b></span></li
            >
            <li
              >所有流程工作在途: <span style="color: blue"><b> /WF/Runing </b></span></li
            >
          </ul>
        </div>
      </fieldset>
    </div>
  </div>
</template>

<style lang="less" scoped>
  .container-full {
    padding: 10px 20px;
  }

  .attrnode-bar-header {
    padding: 5px 0 0;
    margin-bottom: 40px;
    border-bottom: 1px solid #f1f1f1;
    height: 40px;
    color: #009688;

    strong {
      line-height: 32px;
      padding-left: 15px;
      position: relative;
      font-size: 15px;
    }

    strong::before {
      width: 5px;
      height: 16px;
      content: '';
      background: #009688;
      border-radius: 3px;
      position: absolute;
      left: 3px;
      top: 4px;
    }
  }

  fieldset {
    padding: 0;
    margin: 0 0 0;
    font-size: 14px;
    border: 1px solid #eee;

    legend {
      font-size: 15px;
      font-weight: 700;
      border-bottom: none;
      width: calc(100% - 30px);
      margin-left: -1px;
      padding: 0 0 0 30px;
      background: #fafafa;
      line-height: 60px;
      height: 60px;
      border-left: 1px solid #eee;
      border-right: 1px solid #eee;
      cursor: pointer;
    }

    .cs-help,
    ol {
      padding: 20px 24px;
    }
  }
</style>
