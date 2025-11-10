// 试验方法步骤表
import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';

// 查询试验方法步骤表列表
export function listStep(query) {
  return request({
    url: '/cdc/step/list',
    method: 'get',
    params: query
  })
}

// 查询试验方法步骤表详细
export function getStep(id) {
  return request({
    url: '/cdc/step/' + id,
    method: 'get'
  })
}

// 新增试验方法步骤表
export function addStep(data) {
  return request({
    url: '/cdc/step',
    method: 'post',
    data: data
  })
}

// 修改试验方法步骤表
export function updateStep(data) {
  return request({
    url: '/cdc/step',
    method: 'put',
    data: data
  })
}

// 删除试验方法步骤表
export function delStep(id) {
  return request({
    url: '/cdc/step/' + id,
    method: 'delete'
  })
}

// 导出试验方法步骤表
export function exportStep(query) {
  return request({
    url: '/cdc/step/export',
    method: 'get',
    params: query
  })
}

// 下载试验方法步骤表导入模板
export function importTemplate() {
  return request({
    url: '/cdc/step/importTemplate',
    method: 'get'
  })
}

// 查询设备列表
// export function queryDeviceInfoManage(query) {
// 	return request({
// 		url: '/pcdeviceInfo/loadList',
// 		method: 'get',
// 		params: query
// 	})
// }

// 新增设备
export function saveStepDevice(data) {
  return request({
    url: '/cdc/step/device/saveStepDevice',
    method: 'post',
    data: data
  })
}

// 设备删除
export function deleteStepDevice(data) {
  return request({
    url: '/cdc/step/device/deleteStepDevice',
    method: 'post',
    data: data
  })
}

// 修改获取设备id
export function getDevByStepId(query) {
	return request({
		url: '/cdc/step/device/getDevByStepId',
		method: 'get',
		params: query
	})
}

//新增步骤变量
export function addVariable(data) {
  return request({
    url: '/cdc/variable',
    method: 'post',
    data: data
  })
}

// 修改步骤变量
export function updateVariable(data) {
  return request({
    url: '/cdc/variable',
    method: 'put',
    data: data
  })
}

// 根据步骤id获取步骤变量表列表
export function getVarByStepId(query) {
	return request({
		url: '/cdc/variable/getVarByStepId',
		method: 'get',
		params: query
	})
}

// 获取步骤变量表详细信息
export function getVariabledetails(id) {
	return request({
		url: '/cdc/variable/'+id,
		method: 'get',
	})
}

// 删除步骤变量表
export function delVariable(id) {
  return request({
    url: '/cdc/variable/' + id,
    method: 'delete'
  })
}
//上窜
export function upload(data) {
  return request({
    url: '/cdc/step/upload',
    method: 'post',
    data:data
  })
}
//下载
export function download(fileName) {
  return request({
    url: '/cdc/step/download?fileName=' + fileName,
    method: 'get',
    responseType: 'blob',
  })
}
