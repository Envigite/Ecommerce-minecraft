import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const EmailService = {
  sendContactAutoReply: async (userEmail: string, userName: string) => {
    try {
      const emailSignature = `
        <hr style="margin:24px 0;" />
        <p style="font-size:14px; margin:0;">
          <strong>Fashion't Park</strong><br />
          Soporte y Atención al Cliente<br />
          🌐 <a href="https://www.fashiontpark.store/">fashiontpark.store</a>
        </p>
        <p style="font-size:12px; color:#888; margin-top:8px;">
          Este es un mensaje automático, por favor no respondas a este correo.
        </p>
      `;
      const { data, error } = await resend.emails.send({
        from: `Fashion't Park <${process.env.RESEND_FROM_EMAIL}>`,
        to: [userEmail],
        subject: '¡Hemos recibido tu mensaje! 💎',
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h1>Hola ${userName} 👋</h1>
            <p>Gracias por contactar al soporte de <strong>Fashion't Park</strong>.</p>
            <p>Nuestros administradores (o quizás un Golem de Hierro) ya han recibido tu solicitud y la están revisando.</p>
            <p>Te responderemos lo antes posible a este mismo correo.</p>
            ${emailSignature}
          </div>
        `,
      });

      if (error) {
        console.error('Error enviando email Resend:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Error interno EmailService:', err);
      return false;
    }
  },
};