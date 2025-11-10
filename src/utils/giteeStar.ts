import axios from 'axios';
import { setCookie } from './storage';
import { getAppEnvConfig } from './env';

const client_id = 'fcdd750be6558b4e621817d1119c0b50233667a1ed9cf888a64504da54ee6dd4';
const client_secret = 'e928c5782985591896c18897c1cc6b5583fb3d4ab49f8712f5445ea2ada15b34';
const owner_name = 'opencc';
// const repo_names = ['JFlow', 'ccflow', 'CCFast', 'Ruoyi-CCFast'];
const repo_names = ['CCFast', 'JFlow', 'ccflow'];
const { VITE_GLOB_API_URL } = getAppEnvConfig();

//要将#替换为%23
function getRedirect_uri2() {
  const url = window.location.href;
  if (url.indexOf('localhost') > 0) {
    return 'http://localhost:3000/%23/login';
  } else if (url.indexOf('redirect=/WF/Comm/DataV') > 0) {
    return 'https://vue3.ccbpm.cn/%23/login?redirect=/WF/Comm/DataV';
  } else {
    return 'https://vue3.ccbpm.cn/%23/login';
  }
}

// import.meta.env.MODE === 'development' ? '/api/' : basePath;

function getRedirect_uri() {
  const url = window.location.href;
  if (url.indexOf('localhost') > 0) {
    return 'http://localhost:3000/#/login';
  } else if (url.indexOf('redirect=/WF/Comm/DataV') > 0) {
    return 'https://vue3.ccbpm.cn/#/login?redirect=/WF/Comm/DataV';
  } else {
    return 'https://vue3.ccbpm.cn/#/login';
  }
}

export function getGiteeUrl() {
  return 'https://gitee.com/oauth/authorize?client_id=' + client_id + '&redirect_uri=' + getRedirect_uri2() + '&response_type=code&scope=user_info';
}

export function getGiteeCode() {
  const regex = /code=([^&#]*)/;
  const match = window.location.href.match(regex);
  if (match) {
    const code = match[1];
    return code;
  } else {
    return null;
  }
}

export async function getAccess_token(gcode: string) {
  const formData = new URLSearchParams();
  formData.append('grant_type', 'authorization_code');
  formData.append('code', gcode);
  formData.append('client_id', client_id);
  formData.append('redirect_uri', getRedirect_uri());
  formData.append('client_secret', client_secret);
  let token = '';
  await axios.post(VITE_GLOB_API_URL + 'WF/API/GetGiteeToken', formData).then((response) => {
    if (response.data.access_token != undefined) {
      token = response.data.access_token;
    }
    setCookie('gitee_access_token', token, 365);
  });
  return token;
}

export async function checkGiteeStarred(access_token: string) {
  const repo_url = 'https://gitee.com/opencc/';
  const toStar = [];
  for (let i = 0; i < repo_names.length; i++) {
    const repo_name = repo_names[i];
    const formData = new URLSearchParams();
    formData.append('owner_name', owner_name);
    formData.append('repo_name', repo_name);
    formData.append('access_token', access_token);

    await axios.post(VITE_GLOB_API_URL + 'WF/API/CheckGiteeStarred', formData).then((response) => {
      if (response.data.statusCode === 204) {
        //点过star了
      } else {
        const item = {
          No: i,
          MC: repo_name,
          Url: repo_url + repo_name,
        };
        toStar.push(item);
      }
    });
  }
  if (toStar.length == 0) {
    setCookie('giteeStar', '1', 365);
  }
  return toStar;
}

export async function removeGiteeCode() {
  const url = window.location.href;
  const regex = /\?code=([^&#]*)/;
  const match = url.match(regex);
  if (match) {
    const code = match[0];
    return url.replace(code, '');
  } else {
    return '';
  }
}
