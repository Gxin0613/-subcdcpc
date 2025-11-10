<template>
  <div class="login-cont">
    <div class="login-container">
      <!-- 装饰元素 -->
      <div class="decoration decoration-1"></div>
      <div class="decoration decoration-2"></div>
      <div class="decoration decoration-3"></div>

      <!-- 左侧信息面板 -->
      <div class="info-panel">
        <div class="logo-container">
          <div class="logo">
            <span class="icon-code"></span>
          </div>
          <div class="logo-text">海深威低代码平台</div>
        </div>

        <h1 class="platform-title">海深威低代码BPM</h1>
        <p class="platform-subtitle">纯国产流程引擎与表单引擎中间件，提供全方位低代码开发解决方案</p>

        <div class="features">
          <div class="feature-item">
            <div class="feature-icon">
              <span class="icon-desktop"></span>
            </div>
            <span>大屏、报表、快速开发</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <span class="icon-cube"></span>
            </div>
            <span>OA组件、业务组件</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <span class="icon-vue"></span>
            </div>
            <span>Vue3 / Vue2 / React / TS</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <span class="icon-server"></span>
            </div>
            <span>SpringBoot / .NetCore</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <span class="icon-database"></span>
            </div>
            <span>Mysql / Oracle / PG等</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <span class="icon-microservices"></span>
            </div>
            <span>微服务 + Redis支持</span>
          </div>
        </div>

<!--        <div class="contact-info">-->
<!--          <p><span class="icon-phone"></span> 商务咨询：18660153393 (同微信)</p>-->
<!--          <p><span class="icon-envelope"></span> 邮箱：zhoupeng@ccbpm.cn</p>-->
<!--          <p><span class="icon-map"></span> 地址：济南.高新区.碧桂园凤凰中心A座1903</p>-->
<!--        </div>-->
      </div>

      <!-- 右侧登录面板 -->
      <div class="login-panel">
        <LoginForm loginType="Single" />
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
  import LoginForm from '/@/Portal/login/LoginForm.vue';
  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });
</script>
<style lang="less" scoped>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  }

  body {
    background-color: #f8fafc;
    color: #334155;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .login-cont {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .login-container {
    display: flex;
    width: 100%;
    max-width: 1200px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    overflow: hidden;
    min-height: 700px;
  }

  /* 左侧信息区域 */
  .info-panel {
    flex: 1;
    padding: 50px 40px;
    display: flex;
    flex-direction: column;
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    position: relative;
    overflow: hidden;
  }

  .logo-container {
    margin-bottom: 40px;
    display: flex;
    align-items: center;
  }

  .logo {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
  }

  .logo-text {
    font-size: 24px;
    font-weight: 700;
    color: #1e40af;
  }

  .platform-title {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 20px;
    line-height: 1.3;
    color: #1e293b;
  }

  .platform-subtitle {
    font-size: 16px;
    color: #64748b;
    margin-bottom: 40px;
    max-width: 90%;
    line-height: 1.6;
  }

  .features {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 40px;
  }

  .feature-item {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding: 12px 15px;
    background: rgba(255, 255, 255, 0.7);
    border-radius: 10px;
    transition: all 0.3s ease;
  }

  .feature-item:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  }

  .feature-icon {
    width: 36px;
    height: 36px;
    background: rgba(59, 130, 246, 0.1);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
  }

  .contact-info {
    margin-top: auto;
    padding: 20px;
    background: rgba(255, 255, 255, 0.8);
    border-radius: 12px;
    border-left: 4px solid #3b82f6;
  }

  .contact-info p {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    font-size: 15px;
  }

  /* 右侧登录表单区域 */
  .login-panel {
    width: 450px;
    padding: 60px 50px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    background: #fff;
  }

  .login-header {
    text-align: center;
    margin-bottom: 40px;
  }

  .login-header h2 {
    font-size: 28px;
    margin-bottom: 10px;
    color: #1e293b;
  }

  .login-header p {
    color: #64748b;
    font-size: 16px;
  }

  .login-form {
    width: 100%;
  }

  .form-group {
    margin-bottom: 25px;
    position: relative;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    color: #475569;
    font-size: 14px;
    font-weight: 500;
  }

  .form-control {
    width: 100%;
    padding: 15px 15px 15px 45px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    color: #334155;
    font-size: 16px;
    transition: all 0.3s;
  }

  .form-control:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    background: #fff;
  }

  .form-icon {
    position: absolute;
    left: 15px;
    top: 40px;
    color: #94a3b8;
  }

  .remember-forgot {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    font-size: 14px;
  }

  .remember-me {
    display: flex;
    align-items: center;
  }

  .remember-me input {
    margin-right: 8px;
    accent-color: #3b82f6;
  }

  .forgot-password {
    color: #3b82f6;
    text-decoration: none;
    transition: color 0.3s;
    font-weight: 500;
  }

  .forgot-password:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }

  .login-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
  }

  .login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(59, 130, 246, 0.4);
  }

  .divider {
    display: flex;
    align-items: center;
    margin: 30px 0;
    color: #94a3b8;
  }

  .divider::before,
  .divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e2e8f0;
  }

  .divider span {
    padding: 0 15px;
    font-size: 14px;
  }

  .social-login {
    display: flex;
    justify-content: center;
    gap: 20px;
  }

  .social-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #64748b;
    font-size: 20px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .social-btn:hover {
    transform: translateY(-3px);
    background: #3b82f6;
    color: white;
    box-shadow: 0 5px 15px rgba(59, 130, 246, 0.3);
  }

  .register-link {
    text-align: center;
    margin-top: 30px;
    font-size: 15px;
    color: #64748b;
  }

  .register-link a {
    color: #3b82f6;
    text-decoration: none;
    font-weight: 500;
  }

  .register-link a:hover {
    text-decoration: underline;
  }

  /* 装饰元素 */
  .decoration {
    position: absolute;
    z-index: 0;
  }

  .decoration-1 {
    top: 10%;
    right: 5%;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.1);
  }

  .decoration-2 {
    bottom: 15%;
    left: 10%;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.08);
  }

  .decoration-3 {
    top: 50%;
    left: 30%;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(59, 130, 246, 0.06);
  }

  /* 响应式设计 */
  @media (max-width: 1024px) {
    .login-container {
      flex-direction: column;
      max-width: 600px;
    }

    .login-panel {
      width: 100%;
      padding: 40px 30px;
    }

    .features {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .info-panel,
    .login-panel {
      padding: 30px 20px;
    }

    .platform-title {
      font-size: 26px;
    }

    .feature-item {
      padding: 10px;
    }
  }

  /* 图标字体替代方案 */
  .icon {
    display: inline-block;
    width: 1em;
    height: 1em;
    stroke-width: 0;
    stroke: currentColor;
    fill: currentColor;
  }

  .icon-user:before {
    content: '👤';
  }

  .icon-lock:before {
    content: '🔒';
  }

  .icon-phone:before {
    content: '📞';
  }

  .icon-envelope:before {
    content: '✉️';
  }

  .icon-map:before {
    content: '📍';
  }

  .icon-desktop:before {
    content: '💻';
  }

  .icon-cube:before {
    content: '📦';
  }

  .icon-vue:before {
    content: '⚡';
  }

  .icon-server:before {
    content: '🖥️';
  }

  .icon-database:before {
    content: '🗄️';
  }

  .icon-microservices:before {
    content: '🔗';
  }

  .icon-weixin:before {
    content: '💬';
  }

  .icon-qq:before {
    content: '🐧';
  }

  .icon-github:before {
    content: '🐙';
  }

  .icon-code:before {
    content: '</>';
    font-weight: bold;
    font-size: 18px;
    color: white;
  }
</style>
