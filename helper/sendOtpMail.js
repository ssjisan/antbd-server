// helpers/sendOtpMail.js

const sendOtpMail = (otp) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your OTP Code</title>
</head>
<body style="margin: 0; padding: 24px; font-family: Arial, sans-serif; background-color: #f4f4f9; color: #333333;">

    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 20px auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        
        <tr>
            <td bgcolor="#9E1CC4" style="padding: 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 0.5px;">
                    Your OTP Code
                </h1>
            </td>
        </tr>

        <tr>
            <td style="padding: 30px 24px;">
                <p style="margin: 0 0 20px 0; font-size: 16px;">Hello,</p>

                <p style="margin: 0 0 30px 0; font-size: 15px; color: #555;">
                    Your One-Time Password (OTP) for verification is:
                </p>

                <table width="100%">
                    <tr>
                        <td align="center" style="padding: 18px; background: #f4f5f9; border-radius: 8px;">
                            <span style="font-size: 32px; font-weight: bold; color: #9E1CC4; letter-spacing: 4px;">
                                ${otp}
                            </span>
                        </td>
                    </tr>
                </table>

                <p style="margin: 30px 0 15px 0; font-size: 14px; color: #555;">
                    This OTP is valid for <strong>90 Seconds</strong>. Please do not share this code with anyone.
                </p>

                <p style="margin: 0; font-size: 14px; color: #777;">
                    If you didn't request this code, please ignore this email.
                </p>

                <p style="margin-top: 20px; font-size: 14px; color: #555;">
                    Thank you for using our service!
                </p>
            </td>
        </tr>

        <tr>
            <td bgcolor="#f4f5f9" style="padding: 15px; text-align: center; border-top: 1px solid #eaeaee;">
                <p style="margin: 0; font-size: 12px; color: #777;">
                    &copy; 2026 CodeSenate. All rights reserved.
                </p>
            </td>
        </tr>

    </table>

</body>
</html>
  `;
};

module.exports = sendOtpMail;
