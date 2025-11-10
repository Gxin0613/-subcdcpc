import { UnwrapNestedRefs } from 'vue';
import { UserRegedit } from '/@/bp/sys/UserRegedit';
import HttpHandler from '/@/utils/gener/HttpHandler';

export const resetUserRegedit = async (userRegedit: UnwrapNestedRefs<UserRegedit>, urId, userId, classId) => {
  userRegedit.MyPK = urId;
  userRegedit.SearchKey = '';
  userRegedit.AtPara = '';
  userRegedit.DTFrom = '';
  userRegedit.DTTo = '';
  userRegedit.FK_Emp = userId;
  userRegedit.CfgKey = 'SearchAttrs';
  userRegedit.Vals = '';
  userRegedit.FK_MapData = classId;
  userRegedit.OrderBy = '';
  userRegedit.OrderWay = '';
  await userRegedit.Save();
};

export const fetchTableData = async (classId, pageIdx, pageSize, ur: UnwrapNestedRefs<UserRegedit>) => {
  //查询集合
  const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
  handler.AddPara('EnsName', classId);
  handler.AddPara('PageIdx', pageIdx);
  handler.AddPara('PageSize', pageSize);
  const data = await handler.DoMethodReturnJson<Recordable>('Search_SearchIt');
  await ur.Retrieve();
  const totalSize = parseInt(ur.RecCount);
  return {
    items: data.DT,
    total: totalSize,
  };
};
