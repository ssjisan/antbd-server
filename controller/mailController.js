const { transporter } = require("../helper/mailer.js");

const sendMail = async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const result = await transporter.sendMail({
      from: `"Admin Panel" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html: `
        <div style="font-family: Arial; padding:10px">
          <h2>${subject}</h2>
          <p>${message}</p>
        </div>
      `,
    });

    return res.json({ success: true, messageId: result.messageId });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Email sending failed",
      error: error.message,
    });
  }
};

module.exports = sendMail;
