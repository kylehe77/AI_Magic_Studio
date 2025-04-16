const nodemailer = require('nodemailer');
const BASE_URL = process.env.REACT_APP_URL;
// emailService.js
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // 或 587（使用TLS）
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER, // 完整的 Gmail 地址
    pass: process.env.EMAIL_PASSWORD // 应用专用密码
  }
});

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${BASE_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify your email address',
    html: `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; padding: 30px; background: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="https://aimagic.studio/logo.png" alt="AI Magic Studio" style="height: 50px;">
  </div>
  <h2 style="color: #2c3e50; margin-bottom: 25px;">请验证您的邮箱地址</h2>
  <p style="font-size: 16px; line-height: 1.6; color: #34495e; margin-bottom: 25px;">
    感谢您注册 AI Magic Studio！请点击下方按钮完成邮箱验证：
  </p>
  <div style="text-align: center; margin: 30px 0;">
    <a href="${verificationUrl}" 
       style="display: inline-block; padding: 12px 35px; 
              background-color: #3498db; color: #ffffff; 
              text-decoration: none; border-radius: 5px;
              font-size: 16px; transition: background-color 0.3s;">
      立即验证
    </a>
  </div>
  <p style="font-size: 14px; color: #7f8c8d; line-height: 1.6;">
    如果按钮无法点击，请复制以下链接到浏览器地址栏：<br>
    <a href="${verificationUrl}" style="color: #3498db; word-break: break-all; text-decoration: none;">
      ${verificationUrl}
    </a>
  </p>
  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
    <p style="font-size: 12px; color: #95a5a6;">
      此邮件由 AI Magic Studio 系统自动发送，请勿直接回复。<br>
      如果您未进行此操作，请忽略本邮件或联系 
      <a href="mailto:support@aimagic.studio" style="color: #3498db;">客服支持</a>。
    </p>
  </div>
</div>
`
  });
};

module.exports = {
  sendVerificationEmail
};