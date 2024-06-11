import sendEmail from "./sendEmail";

const sendVerificationEmail = async (email, verificationToken) => {
  const subject = "Verify Your Email Address";
  const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify-email?token=${verificationToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2>Verify Your Email Address</h2>
      <p>Thank you for signing up. Please click the link below to verify your email address:</p>
      <p><a href="${verificationLink}" style="color: #1a73e8;">Verify Email</a></p>
      <p>If you did not sign up for this account, please disregard this email.</p>
      <br>
      <p>Best regards,</p>
      <p>Vercel Inc</p>
    </div>
  `;

  await sendEmail({ to: email, subject, html });
};

export default sendVerificationEmail;