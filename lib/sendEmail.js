// lib/sendEmail.js
import nodemailer from "nodemailer";

const sendEmail = async ({ to, subject, html }) => {
  try {
    // Replace these with your actual email credentials or environment variables
    const user = "mhhridoy7462@gmail.com";
    const pass = "vtct vfyg xpum xztm";

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use secure TLS connection
      auth: {
        user,
        pass,
      },
    });

    await transporter.sendMail({
      from: '<no-reply@yourapp.com>',
      to,
      subject,
      html,
    });

    console.log("Email sent");
  } catch (err) {
    console.error("Error sending email:", err);
  }
};

export default sendEmail;
