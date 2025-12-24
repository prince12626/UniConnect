import { sendMail } from "../nodemailer/sendmail.nodemailer.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });
};

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res
                .status(400)
                .json({ message: "All fields are required", success: false });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isVerified) {
            return res
                .status(400)
                .json({ message: "User already exists", success: false });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = Date.now() + 15 * 60 * 1000;
        let user;
        const hashedPassword = await bcrypt.hash(password, 10);
        if (existingUser) {
            existingUser.otp = otp;
            existingUser.otpExpiresAt = otpExpiresAt;
            user = await existingUser.save();
        } else {
            user = await User.create({
                name,
                email,
                password: hashedPassword,
                otp,
                otpExpiresAt,
            });
        }

        await sendMail(
            email,
            "Verify your account",
            `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Your Account</title>
</head>
<body style="
  margin: 0;
  padding: 0;
  background-color: #0f131e;
  font-family: Arial, Helvetica, sans-serif;
">

  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding: 40px 10px;">
        
        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" style="
          max-width: 420px;
          background-color: #ffffff;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.25);
        ">
          
          <!-- Header -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #4f46e5, #7c3aed);
              padding: 24px;
              text-align: center;
              color: #ffffff;
            ">
              <h1 style="margin: 0; font-size: 22px;">UniConnect</h1>
              <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">
                Verify your email address
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 28px; color: #1f2937;">
              <p style="margin: 0 0 12px; font-size: 14px;">
                Hi <strong>${name}</strong>,
              </p>

              <p style="margin: 0 0 18px; font-size: 14px; line-height: 1.6;">
                Thanks for joining <strong>UniConnect</strong> 🎉  
                Use the OTP below to verify your account.
              </p>

              <!-- OTP Box -->
              <div style="
                background-color: #f3f4f6;
                border: 1px dashed #4f46e5;
                border-radius: 10px;
                padding: 16px;
                text-align: center;
                margin-bottom: 20px;
              ">
                <span style="
                  font-size: 28px;
                  font-weight: bold;
                  letter-spacing: 6px;
                  color: #4f46e5;
                ">
                  ${otp}
                </span>
              </div>

              <p style="margin: 0 0 8px; font-size: 13px; color: #374151;">
                ⏱ This OTP is valid for <strong>15 minutes</strong>.
              </p>

              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                If you didn’t request this, you can safely ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              padding: 16px;
              text-align: center;
              background-color: #f9fafb;
              font-size: 11px;
              color: #9ca3af;
            ">
              © ${new Date().getFullYear()} UniConnect. All rights reserved.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`
        );

        return res.status(201).json({
            message:
                "OTP sent to email. Please verify to complete registration.",
            success: true,
            user,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Registration failed",
            error: error.message,
            success: false,
        });
    }
};

export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: "Email and OTP are required",
                success: false,
            });
        }

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user || user.otp !== otp || user.otpExpiresAt < Date.now()) {
            return res.status(400).json({
                message: "Invalid or expired OTP",
                success: false,
            });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpiresAt = undefined;
        await user.save();

        const token = generateToken(user._id.toString());

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Account verified successfully",
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("VERIFY OTP ERROR:", error);
        return res.status(500).json({
            message: "Verification failed",
            success: false,
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
                success: false,
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase().trim(),
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,
            });
        }

        if (!user.isVerified) {
            return res.status(401).json({
                message: "Please verify your email first",
                success: false,
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid credentials",
                success: false,
            });
        }

        const token = generateToken(user._id.toString());

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 24 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            message: "Login successful",
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({
            message: "Login failed",
            success: false,
        });
    }
};
