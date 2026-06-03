const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper: crea el transporter de Gmail (reutilizado por ambas rutas)
function crearTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER, // marketingwoodtools@gmail.com (en Render)
            pass: process.env.EMAIL_PASS  // La clave de 16 letras de Google
        }
    });
}

/* =========================================================================
   RUTA 1 — FORMULARIO DE CONTACTO (consulta general)
   Se mantiene igual que antes. La usa formulario-mail.html.
   ========================================================================= */
app.post('/enviar-correo', async (req, res) => {
    const { nombre, email, telefono, empresa, mensaje } = req.body;

    const transporter = crearTransporter();

    const mailOptions = {
        from: `"${nombre} (Web WoodTools)" <${process.env.EMAIL_USER}>`,
        to: 'ventas@woodtools.com.ar',
        replyTo: email,
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
                <p style="background: #f8f8f8; padding: 15px; border-radius: 4px; white-space: pre-line;">${mensaje}</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Mensaje enviado con éxito' });
    } catch (error) {
        console.error('Error al enviar el correo (contacto):', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al enviar' });
    }
});

/* =========================================================================
   RUTA 2 — PEDIDO DE COTIZACIÓN (desde las páginas de producto)
   Plantilla propia, asunto propio. Recibe los datos del modal de producto.js
   ========================================================================= */
app.post('/enviar-cotizacion', async (req, res) => {
    const {
        nombre,
        email,
        telefono,
        esCliente,   // true | false
        cuit,        // string (solo si es cliente)
        producto,    // nombre del producto
        variante     // medida / variante elegida
    } = req.body;

    const transporter = crearTransporter();

    // Asunto diferenciado según sea cliente o primera consulta
    const tipo = esCliente ? 'Cliente' : 'Nuevo';
    const asunto = `COTIZACIÓN (${tipo}) - ${producto || 'Producto sin especificar'}`;

    // Bloque de estado del cliente (varía según corresponda)
    const bloqueCliente = esCliente
        ? `
            <p style="margin: 4px 0;"><strong>Estado:</strong>
                <span style="background:#e8f5e9; color:#1b5e20; padding:3px 8px; border-radius:4px; font-weight:bold;">CLIENTE EXISTENTE</span>
            </p>
            <p style="margin: 4px 0;"><strong>CUIT / CUIL:</strong> ${cuit || 'No ingresado'}</p>
          `
        : `
            <p style="margin: 4px 0;"><strong>Estado:</strong>
                <span style="background:#fff3e0; color:#e65100; padding:3px 8px; border-radius:4px; font-weight:bold;">NO ES CLIENTE — PRIMERA CONSULTA</span>
            </p>
          `;

    const mailOptions = {
        from: `"${nombre} (Cotización Web)" <${process.env.EMAIL_USER}>`,
        to: 'ventas@woodtools.com.ar',
        replyTo: email,
        subject: asunto,
        html: `
            <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; border: 1px solid #ddd; border-top: 4px solid #a41e22; border-radius: 5px; max-width: 600px;">
                <h2 style="color: #a41e22; margin-top: 0;">Nuevo pedido de cotización</h2>

                <div style="background:#a41e22; color:#fff; padding:14px 16px; border-radius:6px; margin-bottom:18px;">
                    <p style="margin:0; font-size:13px; opacity:0.85;">PRODUCTO SOLICITADO</p>
                    <p style="margin:4px 0 0; font-size:18px; font-weight:bold;">${producto || 'No especificado'}</p>
                    ${variante ? `<p style="margin:6px 0 0; font-size:14px;">Variante / medida: ${variante}</p>` : ''}
                </div>

                <h3 style="color:#a41e22; font-size:15px; margin-bottom:6px;">Datos del solicitante</h3>
                <p style="margin: 4px 0;"><strong>Nombre:</strong> ${nombre}</p>
                <p style="margin: 4px 0;"><strong>Email:</strong> ${email || 'No ingresado'}</p>
                <p style="margin: 4px 0;"><strong>Teléfono:</strong> ${telefono || 'No ingresado'}</p>

                <hr style="border: none; border-top: 1px solid #eee; margin: 16px 0;">
                ${bloqueCliente}
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Cotización enviada con éxito' });
    } catch (error) {
        console.error('Error al enviar el correo (cotización):', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al enviar' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de WoodTools activo en el puerto ${PORT}`);
});