"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = __importDefault(require("../utils/logger"));
const dotenv_1 = __importDefault(require("dotenv"));
const messages_1 = require("../constants/messages");
dotenv_1.default.config();
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});
/**
 * Build the OTP email HTML template — matches the HomeCare design.
 */
const buildOtpEmailHtml = (name, otp) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HomeCare – OTP Verification</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0"
          style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e1e1e1;">

          <!-- Header / Logo -->
          <tr>
            <td align="center" style="padding:28px 40px 20px;">
              <img 
                src="cid:logo" 
                alt="HomeCare Logo" 
                style="max-width:180px;height:auto;display:block;margin:0 auto;"
              />
              <hr style="border:none;border-bottom:1px solid #ddd;margin-top:18px;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 40px 30px;">

              <h2 style="font-size:20px;color:#222;margin:0 0 16px;">Verification Code</h2>

              <p style="font-size:15px;color:#444;margin:0 0 8px;">
                Hello <strong>${name}</strong>,
              </p>
              <p style="font-size:14px;color:#555;margin:0 0 24px;">
                Use the following verification code to complete your HomeCare login or signup process.
              </p>

              <!-- OTP Box – blue left border -->
              <div style="background-color:#f4f8ff;border-left:4px solid #4A90E2;padding:20px;text-align:center;margin-bottom:24px;">
                <p style="margin:0;font-size:36px;font-weight:bold;letter-spacing:12px;color:#4A90E2;
                           font-family:'Courier New',monospace;">
                  ${otp}
                </p>
              </div>

              <!-- Security Notice – amber left border -->
              <div style="background-color:#fff9f2;border-left:4px solid #f5a623;padding:15px;margin-bottom:28px;">
                <p style="margin:0;font-size:14px;color:#555;">
                  <strong style="color:#f5a623;">Security Notice:</strong>
                  For your protection, this code will expire in exactly
                  <strong style="color:#f5a623;">10 minutes</strong>.
                  Do not share this OTP with anyone.
                </p>
              </div>

              <p style="font-size:13px;color:#888;margin:0 0 6px;">
                If you did not request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f9f9f9;padding:18px 40px;border-top:1px solid #eee;text-align:center;">
              <p style="margin:0;font-size:12px;color:#aaa;">
                &copy; 2026 HomeCare. All rights reserved.
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#bbb;">
                This is an automated message, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
/**
 * Send OTP verification email to a customer.
 */
const sendOtpEmail = (email, name, otp) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const info = yield transporter.sendMail({
            from: `HomeCare <${process.env.SMTP_FROM}>`,
            to: email,
            subject: "Your OTP Verification Code – HomeCare",
            html: buildOtpEmailHtml(name, otp),
            attachments: fs_1.default.existsSync(path_1.default.join(__dirname, "../assets/logo.png"))
                ? [
                    {
                        filename: "logo.png",
                        path: path_1.default.join(__dirname, "../assets/logo.png"),
                        cid: "logo",
                    },
                ]
                : [],
        });
        logger_1.default.debug(`OTP email sent to ${email}: ${info.messageId}`);
    }
    catch (error) {
        logger_1.default.error(`Failed to send OTP email to ${email}:`, error);
        throw new Error(messages_1.MESSAGES.COMMON.FAILED_TO_SEND_OTP);
    }
});
exports.sendOtpEmail = sendOtpEmail;
