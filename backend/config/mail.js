const nodemailer = require("nodemailer");

const host = process.env.SMTP_HOST || "smtp.gmail.com";
const isGmail = host.includes("gmail") || (process.env.SMTP_USER || "").endsWith("@gmail.com");

const transportConfig = isGmail
  ? {
      service: "gmail",
      auth: {
        user: (process.env.SMTP_USER || "").trim(),
        pass: (process.env.SMTP_PASS || "").replace(/\s+/g, ""),
      },
    }
  : {
      host: host,
      port: Number(process.env.SMTP_PORT) || 465,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: (process.env.SMTP_USER || "").trim(),
        pass: (process.env.SMTP_PASS || "").replace(/\s+/g, ""),
      },
      tls: {
        rejectUnauthorized: false,
      },
    };

const transporter = nodemailer.createTransport(transportConfig);

const sendMail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });
    console.log("Email sent successfully to:", to, "MessageId:", info?.messageId);
    return info;
  } catch (error) {
    console.error("Failed to send email to:", to, "Error:", error.message);
    return null;
  }
};

module.exports = { sendMail };