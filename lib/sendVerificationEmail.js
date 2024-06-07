import sendEmail from "./sendEmail";

const sendVerificationEmail = async (email, verificationToken) => {
  const subject = "Verify your email address";
  const html = `
    <p>Please click the following link to verify your email address:</p>
    <a href="${process.env.SITE_URL}/verify-email?token=${verificationToken}">Verify Email</a>
  `;

  await sendEmail({ to: email, subject, html });
};

export default sendVerificationEmail;
