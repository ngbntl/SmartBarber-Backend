export const MESSAGE = {
  //auth
  ACCOUNT_REGISTER_SUCCESS: 'auth.account_register_success',
  ACCOUNT_LOGIN_FAILED: 'auth.account_login_failed',
  ACCOUNT_NOT_EXISTED: 'auth.account_not_existed',
  ACCOUNT_CONFIRMED: 'auth.account_confirmed',
  ACCOUNT_VERIFY_FAILED: 'auth.account_verify_failed',
  ACCOUNT_NOT_ACTIVATED: 'auth.account_not_activated',
  ACCOUNT_RESET_PASSWORD_FAILED: 'auth.account_reset_password_failed',
  FORBIDDEN: 'auth.forbidden ',
  ACCOUNT_INCORRECT_PASSWORD: 'auth.account_incorrect_password',
  ACCOUNT_CHANGE_PASSWORD_SUCCESS: 'auth.account_change_password_success',
  ACCOUNT_CHANGE_PASSWORD_FAILED: 'auth.account_change_password_failed',
  ACCOUNT_LOCKED: 'auth.account_locked',
  ACCOUNT_INACTIVE: 'auth.account_inactive',

  //token
  INVALID_OR_EXPIRED_TOKEN: 'token.invalid_or_expired_token',

  //otp
  INVALID_OR_EXPIRED_OTP: 'otp.otp_expired',
  OTP_INCORRECT: 'otp.otp_incorrect',
  OTP_NOT_FOUND: 'otp.otp_not_found',

  //user
  USER_NOT_FOUND: 'user.user_notfound',
  EMAIL_EXISTED: 'user.email_existed',
  EMAIL_NOT_EXIST: 'user.email_not_exist',
  UPDATE_USER_SUCCESS: 'user.update_success',
  UPDATE_USER_FAIL: 'user.update_user_failed',
  SOFT_DELETE_SUCCESS: 'user.soft_delete_user_success',
  SOFT_DELETE_FAIL: 'user.soft_delete_user_fail',
  HARD_DELETE_USER_SUCCESS: 'user.hard_delete_success',
  HARD_DELETE_USER_FAIL: 'user.hard_delete_fail',

  //file
  FILES_UPLOADED_SUCCESS: 'file.upload_success',
  FILES_NOT_FOUND: 'file.not_found',
  DELETE_FILE_SUCCESS: 'file.delete_success',
  DELETE_FILE_FAILED: 'file.delete_failed',
  DELETE_ALL_FILES_SUCCESS: 'file.delete_success',
  DOWNLOAD_FILES_FAILED: 'file.download_failed',

  //contact
  SEND_CONTACT_SUCCESS: 'contact.send_contact_success',

  //feedback
  FEEDBACK_UPLOADED_SUCCESS: 'feedback.upload_success',
  FEEDBACK_FILE_UPLOADED_FAILED: 'feedback.file_upload_failed',
  FEEDBACK_NOT_FOUND: 'feedback.not_found',
  UPDATE_STATUS_FEEDBACK_SUCCESS: 'feedback.update_status_success',

  //appointment
  APPOINTMENT_NOT_FOUND: 'appointment.not_found',
  APPOINTMENT_DATE_IN_PAST: 'appointment.date_in_past',
  CREATE_APPOINTMENT_SUCCESS: 'appointment.create_success',
  TIME_SLOT_CONFLICT: 'appointment.time_slot_conflict',
  //branch
  BRANCH_NOT_FOUND: 'branch.not_found',

  //stylist
  STYLIST_NOT_FOUND: 'stylist.not_found',
  STYLIST_NOT_BELONG_TO_BRANCH: 'stylist.not_belong_to_branch',
  STYLIST_CREATE_SUCCESS: 'stylist.create_success',
};

// mail footer
export const MAIL_FOOTER = (language: string) => {
  const footers: Record<string, string> = {
    vi: `
      Trân trọng, <br><br>
      SmartBarber <br>`,
    en: `
      Best regards, <br><br>
      SmartBarber <br>`,
    ja: `
      敬具, <br><br>
      SmartBarber <br>`,
  };

  return footers[language] || '';
};

// confirm register
export const formatOtp = (otp: string) => otp.split('').join(' ');

export const CONFIRM_REGISTER = (
  language: string,
  fullName: string,
  otp: string, // Thay confirm_url bằng mã OTP
) => {
  const formattedOtp = formatOtp(otp);
  const titles: Record<string, string> = {
    vi: 'Xác thực tài khoản',
    en: 'Account Verification',
    ja: 'アカウント認証',
  };

  const content: Record<string, string> = {
    vi: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color:rgb(0, 0, 0); text-align: center;">Xác thực tài khoản</h2>
        <p>Xin chào <strong>${fullName},</strong></p>
        <p>Cảm ơn bạn đã đăng ký tài khoản <strong>SmartBarber</strong>.</p>
        <p>Đây là mã OTP của bạn:</p>
        <div style="text-align: center; font-size: 24px; font-weight: bold; color:rgb(0, 0, 0); padding: 10px; background: #f0f0f0; border-radius: 5px;">
          ${formattedOtp}
        </div>
        <p style="color: red;">Mã OTP có hiệu lực trong vòng 5 phút.</p>
        <hr>
        <p style="text-align: center; color: #888;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>
        ${MAIL_FOOTER(language)}
      </div>
    `,
    en: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">Account Verification</h2>
        <p>Hello <strong>${fullName},</strong></p>
        <p>Thank you for signing up for <strong>SmartBarber</strong>.</p>
        <p>Your OTP code is:</p>
        <div style="text-align: center; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px; background: #f0f0f0; border-radius: 5px;">
          ${otp}
        </div>
        <p style="color: red;">This OTP is valid for 5 minutes.</p>
        <hr>
        <p style="text-align: center; color: #888;">If you did not request this, please ignore this email.</p>
        ${MAIL_FOOTER(language)}
      </div>
    `,
    ja: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #4CAF50; text-align: center;">アカウント認証</h2>
        <p>こんにちは <strong>${fullName}</strong> 様,</p>
        <p><strong>SmartBarber</strong> にご登録いただきありがとうございます。</p>
        <p>あなたの OTP コードは：</p>
        <div style="text-align: center; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px; background: #f0f0f0; border-radius: 5px;">
          ${otp}
        </div>
        <p style="color: red;">この OTP は5分間有効です。</p>
        <hr>
        <p style="text-align: center; color: #888;">このリクエストを行っていない場合は、このメールを無視してください。</p>
        ${MAIL_FOOTER(language)}
      </div>
    `,
  };

  return { titles: titles[language] || '', content: content[language] || '' };
};

// reset password
export const RESET_PASSWORD = (
  language: string,
  fullName: string,
  confirm_url: string,
) => {
  const titles: Record<string, string> = {
    vi: 'Xác nhận đặt lại mật khẩu tài khoản',
    en: 'Password Reset Confirmation',
    ja: 'パスワードリセット確認',
  };
  const content: Record<string, string> = {
    vi: `
      Xin chào <strong>${fullName}</strong>,<br><br>
      Cảm ơn bạn đã quan tâm và sử dụng <strong>InWEB - Giải pháp toàn diện cho thiết kế CAD ở trên web.</strong><br><br>
      Chúng tôi xin xác nhận đã nhận được yêu cầu về việc lấy lại mật khẩu cho tài khoản của bạn.<br>
      Để thiết lập lại mật khẩu, bạn vui lòng nhấn vào liên kết sau đây để đặt lại mật khẩu mới:<br>
      <a href="${confirm_url}" target="_blank">Link đặt mật khẩu mới</a><br><br>
      Liên kết này sẽ hết hạn trong vòng 15 phút. Nếu bạn không nhấp vào liên kết trong thời gian này, bạn sẽ cần phải yêu cầu đặt lại mật khẩu mới.<br><br>
      ${MAIL_FOOTER(language)}
    `,
    en: `
      Hello <strong>${fullName}</strong>,<br><br> 
      Thank you for using InWEB - a comprehensive solution for CAD design on the web.<br><br> 
      We have received your password reset request for your account.<br> 
      To reset your password, please click the link below and set a new password:<br> 
      <a href="${confirm_url}" target="_blank">New Password Setup Link</a><br><br> 
      This link is valid for 15 minutes. If you do not click the link within this time, you will need to request a new password reset.<br><br>
      ${MAIL_FOOTER(language)}
    `,
    ja: `
      こんにちは <strong>${fullName}</strong> 様,<br><br>
      InWEB - Web上でのCAD設計のための包括的ソリューションをご利用いただきありがとうございます。<br><br>
      お客様のアカウントのパスワードリセットリクエストを受け付けましたことを確認いたします。<br>
      パスワードをリセットするために、以下のリンクをクリックして新しいパスワードを設定してください：<br>
      <a href="${confirm_url}" target="_blank">新しいパスワード設定リンク</a><br><br>
      このリンクは15分間有効です。この時間内にリンクをクリックしなかった場合、新たにパスワードリセットをリクエストする必要があります。<br><br>
      ${MAIL_FOOTER(language)}
    `,
  };

  return { titles: titles[language] || '', content: content[language] || '' };
};

export const CONFIRM_REGISTER_BY_ADMIN = (
  language: string,
  fullName: string,
  email: string,
  password: string,
) => {
  const titles: Record<string, string> = {
    vi: 'Thông báo tài khoản',
    en: 'Account Notification',
    ja: 'アカウント通知',
  };
  const content: Record<string, string> = {
    vi: `
      Chào mừng <strong>${fullName},</strong> đến với <strong>SmartBarber </strong><br><br>
      Chúng tôi đã tạo tài khoản cho bạn với các thông tin đăng nhập dưới đây:
      <ul>
        <li><strong>Tài khoản:</strong> ${email}</li>
        <li><strong>Mật khẩu:</strong> ${password}</li>
      </ul>
      Bạn có thể sử dụng tài khoản này để đăng nhập vào hệ thống.<br><br>
      ${MAIL_FOOTER(language)}
    `,
    en: `
      Hello <strong>${fullName}</strong>,<br><br> 
      Welcome to <strong>SmartBarber</strong>.<br><br> 
      We have created an account for you. Please find your login details below:<br>
      <ul>
        <li><strong>Account:</strong> ${email}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      You can use this account to log into the system.<br><br> 
      ${MAIL_FOOTER(language)}
    `,
    ja: `
    こんにちは <strong>${fullName}</strong> 様、
    <strong>SmartBarber<br><br>
    お客様のためにアカウントを作成いたしました。以下のログイン情報をご確認ください：
    <ul> 
      <li><strong>アカウント：</strong> ${email}</li> 
      <li><strong>パスワード：</strong> ${password}</li> 
    </ul> このアカウントを使用してシステムにログインできます。<br><br> 
    ${MAIL_FOOTER(language)}
  `,
  };

  return { titles: titles[language] || '', content: content[language] || '' };
};

export const CONTACT_INFO_EMAIL = (
  fullName: string,
  email: string,
  phone: string,
  message: string,
  language: string,
) => {
  const titles: Record<string, string> = {
    vi: 'Thông tin liên hệ mới',
    en: '',
    ja: '',
  };
  const content: Record<string, string> = {
    vi: `
      <strong>${fullName}</strong> đã gửi thông tin liên hệ.<br>
      Email: ${email}<br>
      Số điện thoại: ${phone}<br>
      Tin nhắn: ${message}<br><br>
      Vui lòng kiểm tra và phản hồi lại sớm nhất.<br><br>
      ${MAIL_FOOTER(language)}
    `,
    en: ``,
    ja: ``,
  };

  return { titles: titles[language] || '', content: content[language] || '' };
};

export const PROJECT_COMMON = (language: string): string => {
  const nameProjectCommon: Record<string, string> = {
    vi: `Dự án mẫu`,
    en: `Sample project`,
    ja: `サンプルプロジェクト`,
  };
  return nameProjectCommon[language] || '';
};
