export const getEnumsFieldUrl = (key: string, groupId: string, formId: string) => {
  let type = -1;
  if (key === 'enumsRadio') type = 3;
  if (key === 'enumsCheckbox') type = 2;
  if (key === 'enumsDropdown') type = 1;
  return `./SysEnumList.htm?EnName=GPN_NewDDL&FrmID=${formId}&GroupField=${groupId}&CtrlType=${type}&PageNo=SelectedEnum`;
};
