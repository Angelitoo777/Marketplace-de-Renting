import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

export const sendMailPayment = async (to, subject, html) => {
  const mailOptions = {
    from: `"Marketplace de Renting" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log(`Correo enviado a ${to}`)
  } catch (error) {
    console.error(`Error al enviar el correo a ${to}:`, error)
  }
}

export const rentalSuccessTemplate = (userName, productName, rentalId) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>¡Pago Confirmado! Tu renta está en camino.</h2>
      <p>Hola ${userName},</p>
      <p>Hemos recibido exitosamente tu pago para la renta del producto: <strong>${productName}</strong>.</p>
      <p>Tu producto ha sido reservado y estamos preparando todo para la entrega.</p>
      <p><strong>ID de tu Renta:</strong> ${rentalId}</p>
      <hr>
      <p>Gracias por confiar en Marketplace de Renting.</p>
    </div>
  `
}

export const rentalFailedTemplate = (userName, productName) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Hubo un problema con tu pago</h2>
      <p>Hola ${userName},</p>
      <p>Lamentablemente, no pudimos procesar el pago para la renta del producto: <strong>${productName}</strong>.</p>
      <p>Por favor, revisa tu método de pago e inténtalo de nuevo. El producto ha sido liberado y está disponible para otros usuarios.</p>
      <p>Si el problema persiste, contacta a nuestro soporte.</p>
      <hr>
      <p>Atentamente,<br>El equipo de Marketplace de Renting.</p>
    </div>
  `
}
