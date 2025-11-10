
#### 调用方法 - 集合操作

- 打开单个实体表单
http://ccbpm.cn/Port?DoWhat=SerachDict&FrmID=xxxxx&Token=yyy;

- 统计分析
http://ccbpm.cn/Port?DoWhat=GroupDict&FrmID=xxxxx&Token=yyy;


#### 调用方法 - 实体操作
- 打开单个实体表单: 1.没有此数据就新增一笔数据,有就打开.  2. 有就查询出来.
http://ccbpm.cn/Port?DoWhat=MyDict&BillNo=xxxxx&FrmID=xxxxx&Token=xxxx;

- 可选参数: 只读控制
&IsReadonly=0 可编辑.
&IsReadonly=1 只读.

- 可选参数: 默认值控制
&Tel=xxxx&Addr=xxxxx  格式: &字段名1=字段值1&字段名2=字段值2

