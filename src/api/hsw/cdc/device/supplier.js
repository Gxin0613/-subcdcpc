import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';
// import { praseStrEmpty } from "@/utils/jeethink";

// 查询用户列表
export function querySupplier(query) {
	return request({
		url: '/manufacturer/list',
		method: 'get',
		params: query
	})
}
export function addSupplier(data) {
	return request({
		url: '/manufacturer',
		method: 'post',
		data: data
	})
}
// 修改用户
export function updateSupplier(data) {
	return request({
		url: '/manufacturer',
		method: 'put',
		data: data
	})
}
// 删除用户
export function delSupplier(id) {
	return request({
		url: '/manufacturer/' + praseStrEmpty(id),
		method: 'delete'
	})
}

export function getSupplier(id) {
	return request({
		url: '/manufacturer/' + praseStrEmpty(id),
		method: 'get'
	})
}
export function ImagePhoto(data){
	return request({
		url: '/pcsupplier/ImagePhoto',
		method: 'post',
		data: data
	})
}

