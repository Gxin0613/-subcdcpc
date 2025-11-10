import request from '../utils/request';

export function searchEmps(keyword: string) {
  return request.get<null, Array<{ No: string; Name: string;Email: string; DeptName: string }>>('/WF/InnerForVue/Search_Emps', {
    params: {
      keyword,
    },
  });
}
