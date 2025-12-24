import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASS,
    },
});

export const sendMail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: `UniConnect <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
        });

        console.log("📨 Mail sent:", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Mail error:", error);
        throw error;
    }
};
