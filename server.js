const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors()); // Permite que tu página web se conecte sin bloqueos de seguridad
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta que recibe los datos de tu formulario HTML
app.post('/enviar-correo', async (req, res) => {
    const { nombre, email, telefono, empresa, mensaje } = req.body;

    // 1. Configuramos tu cuenta de Gmail (de donde sale el mail)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Tu correo: ventas@woodtools.com.ar
            pass: process.env.EMAIL_PASS  // Contraseña de aplicación de Google
        }
    });

    // 2. Armamos cómo se va a ver el correo en tu bandeja de entrada
    const mailOptions = {
        from: `"${nombre} (Web WoodTools)" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // El mail llega a tu misma casilla
        replyTo: email, // Si le das "Responder" en Gmail, le responde al cliente
        subject: `Nueva consulta Web: ${empresa || nombre}`,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #ddd; border-top: 4px solid #a41e22; border-radius: 5px;">
                <h2 style="color: #a41e22;">Nueva consulta desde la web</h2>
                <p><strong>Nombre:</strong> ${nombre}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Teléfono:</strong> ${telefono || 'No ingresado'}</p>
                <p><strong>Empresa:</strong> ${empresa || 'No ingresada'}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                <p><strong>Mensaje:</strong></p>
                <p style="background: #f8f8f8; padding: 15px; border-radius: 4px;">${mensaje}</p>
            </div>
        `
    };

    // 3. Enviamos el correo
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Mensaje enviado con éxito' });
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al enviar' });
    }
});

// Iniciamos el servidor en el puerto que nos asigne Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de WoodTools activo en el puerto ${PORT}`);
});