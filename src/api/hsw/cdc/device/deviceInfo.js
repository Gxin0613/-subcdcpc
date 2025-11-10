import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';
import { praseStrEmpty } from "/@/views/hsw/utils/jeethink.js";

// 查询折旧率列表
export function queryDeviceInfo(query) {
	return request({
		url: '/pcdeviceInfo/rate',
		method: 'get',
		params: query
	})
}
// 导出操作日志
export function exportDeviceInfo(query) {
	return request({
	  url: '/pcdeviceInfo/export',
	  method: 'get',
	  params: query
	})
  }
//导出固定资产
export function exportExcel(query){
	return request({
		url:'/pcdeviceInfo/exportExcel',
		method:'get',
		params:query
	})
}
  // 导出操作日志
export function exportDevice(query) {
	return request({
	  url: '/pcdeviceInfo/exportDevice',
	  method: 'post',
	  params: query
	})
  }
// 查询资产列表
export function queryDeviceInfoManage(query) {
	return request({
		url: '/pcdeviceInfo/loadList',
		method: 'get',
		params: query
	})
}
// 查询二级分类 js文件
export function getPositionOptions(deptId) {
	return request({
	  url: '/pcdeviceInfo/getPositionOptions/'+deptId,
	  method: 'get'
	})
}
// 查询公司数据详细
export function getDeviceInfo(id) {
	return request({
	  url: '/pcdeviceInfo/' + id,
	  method: 'get'
	})
}
export function updateDeviceInfo(data) {
	return request({
		url: '/pcdeviceInfo/updatedeviceInfo/',
		method: 'put',
		data: data
	})
}
export function deleteDeviceInfo(id) {
	return request({
		url: '/pcdeviceInfo/' + id,
		method: 'delete'

	})
}
export function addDeviceInfo(data) {
	return request({
		url: '/pcdeviceInfo/',
		method: 'post',
		data: data
	})
}
export function reportWarehousing(id) {
	return request({
		url: '/report/reportWarehousing?id='+id,
		method: 'get'
	})
}

export function ys(id) {
	return request({
		url: '/report/ys?id='+id,
		method: 'get'
	})
}

export function tp(id) {
	return request({
		url: '/report/tp?id='+id,
		method: 'get'
	})
}
export function ck(id) {
	return request({
		url: '/report/ck?id='+id,
		method: 'get'
	})
}
export function dy(id) {
	return request({
		url: '/report/reportBarCode?id='+id,
		method: 'post'
	})
}

export function findPrintNum(ids){
	return request({
		url:'/pcdeviceInfo/findPrintNum',
		method:'get',
		params:ids
	})
}
//打印状态
export function updatePrintStatus(data) {
  return request({
    url: '/pcdeviceInfo/updatePrintStatus',
    method: 'put',
    data: data
  })
}

//打印芯片
export function chipPrint(ids) {
  return request({
    url: '/pcdeviceInfo/chipPrint?ids=' + ids,
    method: 'post',
  })
}

// 修改审核状态
export function updateProcessStatus(data) {
  return request({
    url: '/pcdeviceInfo/updateProcessStatus/',
    method: 'put',
    data: data
  })
}



