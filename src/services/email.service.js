const nodemailer = require('nodemailer');
const { emailConfig } = require('../config/vars');
const logger = require('../config/logger'); // Assuming you have a logger utility

// Create transporter with configuration
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  auth: {
    user: emailConfig.username,
    pass: emailConfig.password,
  },
});

// Verify transporter connection
const verifyTransporterConnection = () => {
  transporter.verify((error, success) => {
    if (error) {
      logger.error(`Email connection failed: ${error.message}`);
    } else {
      logger.info('Email server is ready to send messages');
    }
  });
};

verifyTransporterConnection();


exports.sendEmail = async (to, subject, html) => {
  try {
    // Validate required parameters
    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, or html');
    }

    const mailOptions = {
      from: emailConfig.fromEmail,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log info about the sent email
    logger.info(`Email sent successfully: ${info.messageId}`);
  } catch (error) {
    logger.error(`Error sending email: ${error.message}`);
    throw new Error('Failed to send email');
  }
};


///////////////////////////////////////////
// // Externalize email sending
// async function sendVerificationEmail(user) {
//   try {
// const resetToken = await PasswordResetToken.generate(user);
// const verificationLink = `${process.env.APP_URL}/verify-email?token=${resetToken.token}&userId=${user.id}`;

//     await sendEmail({
//       to: user.email,
//       subject: 'Verify Your Email',
//       template: 'email-verification',
//       context: {
//         name: user.firstName,
//         link: verificationLink,
//         expiry: '24 hours'
//       }
//     });
//   } catch (emailError) {
//     logger.error('Failed to send verification email', {
//       userId: user.id,
//       error: emailError.message
//     });
//     // Don't throw - email failure shouldn't fail registration
//   }
// }
