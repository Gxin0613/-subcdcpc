import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';

// 查询列表
export function queryDeviceDetail(query) {
	return request({
		url: '/pcDevicedetail/loadList',
		method: 'get',
		params: query
	})
}

export function getDeviceDetail(id) {
	return request({
	  url: '/pcDevicedetail/getDeviceDetailById/' + id,
	  method: 'get'
	})
}
export function updateDeviceDetail(data) {
	return request({
		url: '/pcDevicedetail/updateDeviceDetail/',
		method: 'put',
		data: data
	})
}
export function deleteDeviceDetail(id) {
	return request({
		url: '/pcDevicedetail/deleteDeviceDetail/' + id,
		method: 'delete'

	})
}
export function addDeviceDetail(data) {
	return request({
		url: '/pcDevicedetail/insertDeviceDetail/',
		method: 'post',
		data: data
	})
}

export function reportTest(id) {
	return request({
		url: '/pcDevicedetail/reportTest?id='+id,
		method: 'get'
	})
}
//图片上传
export function ImagePhoto(data){
	return request({
		url: '/pcDevicedetail/ImagePhoto',
		method: 'post',
		data: data
	})
}
