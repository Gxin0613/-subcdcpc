import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';
import { praseStrEmpty } from "@/utils/jeethink";

// 查询资产列表
export function queryDeviceFix(query) {
	return request({
		url: '/pcDeviceFix/loadList',
		method: 'get',
		params: query
	})
}
// 查询公司数据详细
export function getDeviceFix(id) {
	return request({
	  url: '/pcDeviceFix/getDeviceFixById/' + id,
	  method: 'get'
	})
}
export function updateDeviceFix(data) {
	return request({
		url: '/pcDeviceFix/updateDeviceFix/',
		method: 'put',
		data: data
	})
}
export function deleteDeviceFix(id) {
	return request({
		url: '/pcDeviceFix/deleteDeviceFix/' + id,
		method: 'delete'

	})
}
export function addDeviceFix(data) {
	return request({
		url: '/pcDeviceFix/insertDeviceFix/',
		method: 'post',
		data: data
	})
}
export function ImagePhoto(data){
	return request({
		url: '/pcDeviceFix/ImagePhoto',
		method: 'post',
		data: data
	})
}
export function getImagePhoto(id){
	return request({
		url: '/pcDeviceFix/getImagePhoto/'+id,
		method: 'get',
	})
}
