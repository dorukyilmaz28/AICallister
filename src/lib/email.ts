// Nodemailer ile Gmail/Outlook SMTP kullanımı
import nodemailer from 'nodemailer';

// SMTP transporter oluştur
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER, // Gmail adresiniz
    pass: process.env.SMTP_PASSWORD, // Gmail App Password
  },
});

// Transporter'ı test et (opsiyonel)
if (process.env.NODE_ENV === 'development') {
  transporter.verify(function (error, success) {
    if (error) {
      console.log('SMTP connection error:', error);
    } else {
      console.log('SMTP server is ready to send emails');
    }
  });
}

export async function sendVerificationEmail(email: string, token: string, name: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'CallisterAI <noreply@callisterai.com>',
    to: email,
    subject: 'CallisterAI - Email Doğrulama',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Doğrulama</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">CallisterAI</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Email Adresinizi Doğrulayın</h2>
            <p>Merhaba <strong>${name}</strong>,</p>
            <p>CallisterAI'e hoş geldiniz! Hesabınızı aktif etmek için aşağıdaki butona tıklayarak email adresinizi doğrulayın:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Email Adresini Doğrula</a>
            </div>
            <p style="color: #666; font-size: 14px;">Eğer buton çalışmıyorsa, aşağıdaki linki tarayıcınıza kopyalayıp yapıştırın:</p>
            <p style="color: #667eea; font-size: 12px; word-break: break-all;">${verificationUrl}</p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">Bu link 24 saat geçerlidir.</p>
            <p style="color: #666; font-size: 14px;">Eğer bu email'i siz talep etmediyseniz, lütfen görmezden gelin.</p>
          </div>
          <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            <p>© ${new Date().getFullYear()} CallisterAI. Tüm hakları saklıdır.</p>
          </div>
        </body>
      </html>
    `,
    text: `
      CallisterAI - Email Doğrulama

      Merhaba ${name},

      CallisterAI'e hoş geldiniz! Hesabınızı aktif etmek için aşağıdaki linke tıklayarak email adresinizi doğrulayın:

      ${verificationUrl}

      Bu link 24 saat geçerlidir.

      Eğer bu email'i siz talep etmediyseniz, lütfen görmezden gelin.

      © ${new Date().getFullYear()} CallisterAI
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email sending error:', error);
    throw error;
  }
}
