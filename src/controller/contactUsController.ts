import { NextFunction, Request, Response } from "express";
import { catchAsyncErrorHandler } from "../utils/CatchAsyncErrorHandler";
import { ErrorHandler } from "../middleware/errorHandler";
const nodemailer = require("nodemailer");

export const sendContactMessage = catchAsyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const { name, email, phoneNumber, message } = req.body;

        if (!name || !email || !phoneNumber || !message) {
            next(new ErrorHandler("All fields are required.", 400));
            return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return next(
                new ErrorHandler("Please enter a valid email address.", 400)
            );
        }

        if (phoneNumber.toString().length !== 10) {
            return next(
                new ErrorHandler("PhoneNumber must be 10 digits long.", 400)
            );
        }

        let transport = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"${name}" <${email}>`,
            to: process.env.MAIL_USER,
            subject: "📬 New Contact Form Submission",
            html: `
        <table width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f4f4; padding: 30px 0;">
            <tr>
                <td align="center">
                    <table width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.05); font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                        <tr>
                            <td style="background-color: #1976d2; color: #ffffff; padding: 24px 30px; border-top-left-radius: 10px; border-top-right-radius: 10px;">
                                <h2 style="margin: 0; font-weight: 600;">New Contact Form Message</h2>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 24px 30px;">
                                <p style="margin: 0 0 16px 0;"><strong>👤 Name:</strong> ${name}</p>
                                <p style="margin: 0 0 16px 0;"><strong>📧 Email:</strong> <a href="mailto:${email}" style="color: #1976d2;">${email}</a></p>
                                <p style="margin: 0 0 16px 0;"><strong>📞 Phone:</strong> ${phoneNumber}</p>
                                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 24px 0;" />
                                <p style="margin-bottom: 8px;"><strong>💬 Message:</strong></p>
                                <p style="background-color: #f9f9f9; padding: 16px; border-radius: 6px; border: 1px solid #ddd; white-space: pre-wrap; margin: 0;">${message}</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 16px 30px; text-align: center; font-size: 12px; color: #888;">
                                This message was sent via your website's contact form. <br>
                                <a href="mailto:${email}">Reply to ${name}</a>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    `,
        };

        transport.sendMail(mailOptions, function (error: Error) {
            if (error) {
                next(
                    new ErrorHandler(
                        "Failed to send email. Please try again later.",
                        500
                    )
                );
                return;
            } else {
                res.status(200).json({
                    success: true,
                    message: "Email sent successfully!",
                });
            }
        });
    }
);
