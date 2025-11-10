import request from '/@/WF/Admin/FoolFormDesigner/utils/hswRequest';
// import { praseStrEmpty } from "@/utils/jeethink";

// 查询用户列表
export function checkMainVo(query) {
	return request({
		url: '/pcCheckMain/queryCheck',
		method: 'get',
		params: query
	})
}
// // 查询用户列表
// export function userByUserName(query) {
// 	return request({
// 		url: '/system/user/selectByWhere',
// 		method: 'get',
// 		params: query
// 	})
// }
// 查询用户详细
// export function getfactory(id) {
// 	return request({
// 		url: '/factory/queryById?id=' + praseStrEmpty(id),
// 		method: 'get'
// 	})
// }

// 新增用户
export function addCheckMain(data) {
	return request({
		url: '/check/add',
		method: 'post',
		data: data
	})
}


// 修改用户}
export function updateCheckMain(data) {
	return request({
		url: '/check/update/',
		method: 'put',
		data: data
	})
}


// 删除用户
export function delfactory(id) {
	return request({
		url: '/check/delete?id=' + praseStrEmpty(id),
		method: 'get'
	})
}


// 删除
export function deleteCheckMain(id) {
  return request({
    url: '/pcCheckMain/delete?id=' + praseStrEmpty(id),
    method: 'post'
  })
}

