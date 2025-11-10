<template>
  <!-- 加载动画 -->
  <!-- <div class="loading-overlay" id="loadingOverlay">
    <div class="loading-spinner"></div>
  </div> -->

  <!-- 登录成功提示 -->
  <div class="success-message" id="successMessage">
    <div class="success-icon">
      <i class="fas fa-check-circle"></i>
    </div>
    <div class="success-text">登录成功</div>
    <div class="success-subtext">正在进入系统...</div>
  </div>

  <!-- 粒子背景 -->
  <canvas id="particles-bg"></canvas>

  <!-- 背景图片 -->
  <img src="/resource/CompanyImgLogo/bg.jpg" alt="科技背景" class="bg-image" />

  <!-- 主容器 -->
  <div class="login-container">
    <!-- 登录卡片 -->
    <div class="login-card">
      <!-- 左侧信息区域 -->
      <div class="info-side">
        <div class="decorative-line"></div>

        <!-- Logo区域 -->
        <div class="logo-area">
          <img src="/resource/CompanyImgLogo/hsware.png" alt="TechFlow Logo" class="logo" />
          <div>
            <div class="logo-text">海深威管理系统</div>
            <div class="logo-subtext">快捷办公平台</div>
          </div>
        </div>

        <!-- 产品介绍 -->
        <div class="product-info">
          <h2 class="info-title">提升效率，简化工作流程</h2>
          <p class="info-description">
            驰骋低代码BPM 是一款专为现代企业打造的快捷办公平台，集成了大屏.报表.快速开发.OA组件.业务组件等多种功能，帮助团队提升工作效率，实现无缝协作。
          </p>

          <!-- 特性列表 -->
          <ul class="features-list">
            <li class="feature-item">
              <div class="feature-icon"> </div>
              <span>高效开发：表单生成，快速流程，功能多样</span>
            </li>
            <li class="feature-item">
              <div class="feature-icon"> </div>
              <span>安全可靠：多层加密，权限管理，数据保护</span>
            </li>
            <li class="feature-item">
              <div class="feature-icon"> </div>
              <span>数据分析：智能统计，可视化报表，决策支持</span>
            </li>
            <li class="feature-item">
              <div class="feature-icon"> </div>
              <span>灵活定制：模块化设计，按需配置，适应变化</span>
            </li>
            <li class="feature-item">
              <div class="feature-icon"> </div>
              <span>商务合作：18660153393 (同微信)</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 右侧登录表单区域 -->
      <div class="form-side">
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
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  body {
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background-color: #0a0e17;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* 粒子背景 */
  #particles-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
  }

  /* 主容器 */
  .login-container {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
  }

  /* 背景图片 */
  .bg-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 1;
    z-index: 1;
  }

  /* 登录卡片 */
  .login-card {
    position: relative;
    width: 100%;
    max-width: 1200px;
    height: 600px;
    background: rgba(15, 23, 42, 0.7);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    box-shadow: 0 0 50px rgba(0, 123, 255, 0.3);
    display: flex;
    overflow: hidden;
    border: 1px solid rgba(0, 123, 255, 0.2);
  }

  /* 左侧信息区域 */
  .info-side {
    position: relative;
    width: 55%;
    height: 100%;
    padding: 60px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: linear-gradient(135deg, rgba(0, 123, 255, 0.1) 0%, rgba(0, 123, 255, 0.01) 100%);
    border-right: 1px solid rgba(0, 123, 255, 0.2);
  }

  /* 装饰线条 */
  .decorative-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, #007bff, #00c6ff);
  }

  /* Logo区域 */
  .logo-area {
    display: flex;
    align-items: center;
    margin-bottom: 40px;
  }

  .logo {
    width: 60px;
    height: 60px;
    margin-right: 20px;
  }

  .logo-text {
    font-size: 28px;
    font-weight: 700;
    color: #ffffff;
  }

  .logo-subtext {
    font-size: 14px;
    color: #a0aec0;
    margin-top: 5px;
  }

  /* 产品介绍 */
  .product-info {
    margin-top: 40px;
  }

  .info-title {
    font-size: 32px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 20px;
    background: linear-gradient(90deg, #007bff, #00c6ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .info-description {
    font-size: 16px;
    color: #a0aec0;
    line-height: 1.8;
    margin-bottom: 30px;
  }

  /* 特性列表 */
  .features-list {
    list-style: none;
  }

  .feature-item {
    display: flex;
    align-items: center;
    margin-bottom: 15px;
    font-size: 14px;
    color: #a0aec0;
  }

  .feature-icon {
    width: 24px;
    height: 24px;
    margin-right: 10px;
    color: #007bff;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* 联系信息 */
  .contact-info {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid rgba(0, 123, 255, 0.1);
  }

  .contact-text {
    font-size: 14px;
    color: #a0aec0;
  }

  .contact-highlight {
    color: #00c6ff;
    font-weight: 500;
  }

  /* 右侧登录表单区域 */
  .form-side {
    width: 45%;
    height: 100%;
    padding: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .form-title {
    font-size: 24px;
    font-weight: 600;
    color: #ffffff;
    margin-bottom: 40px;
    text-align: center;
  }

  /* 登录表单 */
  .login-form {
    width: 100%;
  }

  .form-group {
    position: relative;
    margin-bottom: 25px;
  }

  .form-label {
    position: absolute;
    top: -10px;
    left: 15px;
    background-color: #0f172a;
    padding: 0 10px;
    font-size: 12px;
    color: #a0aec0;
    transition: all 0.3s ease;
  }

  .form-input {
    width: 100%;
    height: 50px;
    padding: 0 20px;
    background-color: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(0, 123, 255, 0.3);
    border-radius: 8px;
    color: #ffffff;
    font-size: 14px;
    transition: all 0.3s ease;
    outline: none;
  }

  .form-input:focus {
    border-color: #007bff;
    box-shadow: 0 0 15px rgba(0, 123, 255, 0.3);
  }

  .form-input:focus + .form-label {
    color: #007bff;
  }

  /* 密码可见性切换 */
  .toggle-password {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #a0aec0;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .toggle-password:hover {
    color: #007bff;
  }

  /* 记住我和忘记密码 */
  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
  }

  .remember-me {
    display: flex;
    align-items: center;
  }

  .remember-checkbox {
    width: 16px;
    height: 16px;
    margin-right: 8px;
    accent-color: #007bff;
  }

  .remember-label {
    font-size: 13px;
    color: #a0aec0;
  }

  .forgot-password {
    font-size: 13px;
    color: #007bff;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .forgot-password:hover {
    color: #00c6ff;
    text-decoration: underline;
  }

  /* 登录按钮 */
  .login-button {
    width: 100%;
    height: 50px;
    background: linear-gradient(90deg, #007bff, #00c6ff);
    border: none;
    border-radius: 8px;
    color: #ffffff;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
  }

  .login-button:hover {
    box-shadow: 0 0 20px rgba(0, 123, 255, 0.5);
    transform: translateY(-2px);
  }

  .login-button:active {
    transform: translateY(0);
  }

  /* 按钮内部动画 */
  .button-animation {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    animation: buttonShine 2s infinite;
  }

  @keyframes buttonShine {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  /* 分隔线 */
  .divider {
    display: flex;
    align-items: center;
    margin: 30px 0;
  }

  .divider-line {
    flex: 1;
    height: 1px;
    background-color: rgba(0, 123, 255, 0.2);
  }

  .divider-text {
    padding: 0 15px;
    font-size: 12px;
    color: #a0aec0;
  }

  /* 快捷登录按钮 */
  .social-login {
    display: flex;
    justify-content: space-between;
    gap: 15px;
  }

  .social-button {
    flex: 1;
    height: 45px;
    background-color: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(0, 123, 255, 0.3);
    border-radius: 8px;
    color: #ffffff;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
  }

  .social-button:hover {
    background-color: rgba(30, 41, 59, 0.8);
    border-color: #007bff;
  }

  .social-icon {
    font-size: 18px;
  }

  /* 底部链接 */
  .bottom-links {
    margin-top: 40px;
    text-align: center;
    font-size: 13px;
    color: #a0aec0;
  }

  .register-link {
    color: #007bff;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .register-link:hover {
    color: #00c6ff;
    text-decoration: underline;
  }

  /* 响应式设计 */
  @media (max-width: 992px) {
    .login-card {
      flex-direction: column;
      height: auto;
      max-height: 90vh;
      overflow-y: auto;
    }

    .info-side,
    .form-side {
      width: 100%;
      height: auto;
    }

    .info-side {
      padding: 40px;
      border-right: none;
      border-bottom: 1px solid rgba(0, 123, 255, 0.2);
    }

    .form-side {
      padding: 40px;
    }
  }

  @media (max-width: 576px) {
    .info-side,
    .form-side {
      padding: 20px;
    }

    .logo-text {
      font-size: 24px;
    }

    .info-title {
      font-size: 28px;
    }

    .form-title {
      font-size: 22px;
    }

    .social-login {
      flex-direction: column;
    }
  }

  /* 动画效果 */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .login-card {
    animation: fadeIn 0.5s ease forwards;
  }

  .info-side {
    animation: fadeIn 0.5s ease 0.2s forwards;
    opacity: 0;
  }

  .form-side {
    animation: fadeIn 0.5s ease 0.4s forwards;
    opacity: 0;
  }

  /* 加载动画 */
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(10, 14, 23, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    transition: opacity 0.5s ease;
  }

  .loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(0, 123, 255, 0.3);
    border-radius: 50%;
    border-top-color: #007bff;
    animation: spin 1s ease-in-out infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* 登录成功提示 */
  .success-message {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: rgba(15, 23, 42, 0.9);
    backdrop-filter: blur(10px);
    padding: 30px;
    border-radius: 10px;
    border: 1px solid rgba(0, 123, 255, 0.3);
    box-shadow: 0 0 30px rgba(0, 123, 255, 0.3);
    text-align: center;
    z-index: 9998;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .success-message.show {
    opacity: 1;
    visibility: visible;
  }

  .success-icon {
    font-size: 50px;
    color: #00c6ff;
    margin-bottom: 20px;
  }

  .success-text {
    font-size: 20px;
    color: #ffffff;
    margin-bottom: 10px;
  }

  .success-subtext {
    font-size: 14px;
    color: #a0aec0;
  }
</style>
