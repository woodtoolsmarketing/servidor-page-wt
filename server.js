const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta que recibe los datos del formulario HTML
app.post('/enviar-correo', async (req, res) => {
    const { nombre, email, telefono, empresa, mensaje } = req.body;

    // 1. Nos conectamos al Gmail de Marketing (El Cartero)
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // Acá pondremos marketingwoodtools@gmail.com en Render
            pass: process.env.EMAIL_PASS  // La clave de 16 letras de Google
        }
    });

    // 2. Armamos el correo y lo mandamos a VENTAS
    const mailOptions = {
        from: `"${nombre} (Web WoodTools)" <${process.env.EMAIL_USER}>`,
        to: 'ventas@woodtools.com.ar', // DESTINO FINAL: La bandeja de ventas
        replyTo: email, // Para responderle directo al cliente
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de WoodTools activo en el puerto ${PORT}`);
});