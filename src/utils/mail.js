import Mailgen from 'mailgen';
import nodemailer from 'nodemailer'

const sendEmail = async (options) => {
    const mailGenerator = new Mailgen({
        theme: "default",
        product: {
            name: "Task Manager",
            link: "https://taskmanagelink.com"
        }
    })

    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent);
    const emailHtml = mailGenerator.generate(options.mailgenContent);

    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,
        port: process.env.MAILTRAP_SMTP_PORT,
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,
            pass: process.env.MAILTRAP_SMTP_PASSWORD
        }
    })

    const mail = {
        from: "patilvaibhu1656@gmail.com",
        to: options.email,
        subject: options.subject,
        text: emailTextual,
        html: emailHtml
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("Email Service Failed", error)
    }
}

const emailVerificationMailgenContent = (username, verificationUrl) => {
    return {
        body: {
            name: username,
            intro: "Welcome to our app we are exited to have you onboard.",
            action: {
                instructions: 'To Verify your email please click on the following button',
                button: {
                    color: "#22BC66",
                    text: "Verify Your Email",
                    link: verificationUrl
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help"
        }
    }
}

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    return {
        body: {
            name: username,
            intro: "We got a request to reset the password of your account",
            action: {
                instructions: 'To Reset you password, click on the following button below',
                button: {
                    color: "#ce2f37",
                    text: "Reset Password",
                    link: passwordResetUrl
                },
            },
            outro: "Need help, or have questions? Just reply to this email, we'd love to help"
        }
    }
}

export {emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail}