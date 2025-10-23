/* eslint-disable @typescript-eslint/no-var-requires */
type Transporter = {
    sendMail: (options: Record<string, unknown>) => Promise<unknown>;
};

let nodemailer: any = null;

try {
    nodemailer = require("nodemailer");
} catch (err) {
    nodemailer = null;
}

const isMailConfigured = () => {
    return Boolean(
        process.env.MAIL_HOST &&
            process.env.MAIL_PORT &&
            process.env.MAIL_USER &&
            process.env.MAIL_PASS,
    );
};

let cachedTransporter: Transporter | null | undefined;

async function getTransporter(): Promise<Transporter | null> {
    if (cachedTransporter !== undefined) {
        return cachedTransporter;
    }

    if (!isMailConfigured()) {
        cachedTransporter = null;
        console.warn(
            "[EmailService] Configuracion de correo incompleta. Se omitira el envio y se registrara el enlace en consola.",
        );
        return cachedTransporter;
    }

    if (!nodemailer) {
        cachedTransporter = null;
        console.error(
            "[EmailService] nodemailer no esta disponible. Ejecute `npm install nodemailer` para habilitar el envio real.",
        );
        return cachedTransporter;
    }

    const transport = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT || 587),
        secure: process.env.MAIL_SECURE === "true",
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });

    cachedTransporter = transport;
    return cachedTransporter;
}

export class EmailService {
    static async sendPasswordReset(to: string, resetLink: string) {
        const transporter = await getTransporter();

        const subject = "Recuperacion de contrasena";
        const text = [
            "Hola,",
            "",
            "Recibimos una solicitud para restablecer tu contrasena.",
            "Puedes continuar desde el siguiente enlace:",
            resetLink,
            "",
            "Si no solicitaste este proceso, puedes ignorar este mensaje.",
        ].join("\n");

        const html = [
            "<p>Hola,</p>",
            "<p>Recibimos una solicitud para restablecer tu contrasena.</p>",
            `<p>Puedes continuar desde el siguiente enlace: <a href="${resetLink}" target="_blank" rel="noopener">${resetLink}</a></p>`,
            "<p>Si no solicitaste este proceso, puedes ignorar este mensaje.</p>",
        ].join("");

        if (!transporter) {
            console.info(`[EmailService] Envio de correo omitido. Link de recuperacion para ${to}: ${resetLink}`);
            return;
        }

        const from = process.env.MAIL_FROM || process.env.MAIL_USER;

        await transporter.sendMail({
            to,
            from,
            subject,
            text,
            html,
        });
    }
}

