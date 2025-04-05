// In your auth controller
const emailService = require('../services/email.service');

exports.sendPasswordReset = async (passwordResetObject) => {
    const subject = 'Password Reset Request';
    const html = `
      <p>Hello,</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="https://your-app/new-password/view?resetToken=${passwordResetObject.resetToken}">
        Reset Password
      </a>
    `;
    await exports.sendEmail(passwordResetObject.userEmail, subject, html);
  };

  exports.sendPasswordChangeEmail = async (user) => {
    const subject = 'Your Password Has Been Changed';
    const html = `
      <p>Hello ${user.name},</p>
      <p>Your password has been successfully changed. If you did not request this, please contact support.</p>
    `;
    await exports.sendEmail(user.email, subject, html);
  };



////////                      ////////  ///                            //////                             /////



// Password reset example
exports.requestPasswordReset = async (req, res) => {
  const resetToken = generateResetToken();
  await emailService.sendPasswordReset(req.user.email, resetToken);
  res.json({ message: 'Password reset email sent' });
};

// Registration example
exports.register = async (req, res) => {
  const user = await userService.create(req.body);
  const verificationToken = generateVerificationToken();

  // Non-blocking email send
  emailService.sendVerificationEmail(user, verificationToken)
    .catch(error => logger.error('Verification email failed', error));

  res.status(201).json({ message: 'Registration successful' });
};
