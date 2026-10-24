// auto-auth.js
// 本地运行补丁：跳过使用须知页 + 注入开发者内置会话（123 / fake-token），绕过登录/注册系统。
// 原理：应用启动时会读取 localStorage 中的会话并调用 verify_account_session 校验；
// 其内置后门 verify("123","fake-token") 直接返回成功，无需访问远端服务器。
(function () {
  try {
    // 1) 自动同意使用须知（否则每次进入都先看到免责声明页）
    if (localStorage.getItem('noir_disclaimer_agreed') !== 'true') {
      localStorage.setItem('noir_disclaimer_agreed', 'true');
    }

    // 2) 注入会话，跳过登录/激活页
    var email = localStorage.getItem('auth_email');
    var token = localStorage.getItem('auth_session_token');
    if (!email || !token) {
      var now = String(Date.now());
      localStorage.setItem('auth_email', '123');
      localStorage.setItem('auth_session_token', 'fake-token');
      localStorage.setItem('auth_status', 'active');
      localStorage.setItem('auth_trial_expires_at', '9999999999999');
      localStorage.setItem('auth_approved_at', '9999999999999');
      localStorage.setItem('auth_last_verify_time', now);
    }
  } catch (e) {
    // 忽略异常，不影响应用本身启动
  }
})();
