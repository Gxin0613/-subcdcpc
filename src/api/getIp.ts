import axios from 'axios';

export async function getUserIP() {
  try {
    const response = await fetch('https://api64.ipify.org?format=json');
    const data = await response.json();
    return data.ip; // 返回用户的IP地址
  } catch (error) {
    console.error('用户ip获取失败:', error);
    return null;
  }
}

export async function getLocationFromIP(ip: string) {
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,as&lang=zh-CN`);
    return response.data;
  } catch (error) {
    console.error('获取ip地址失败.');
    throw error;
  }
}
