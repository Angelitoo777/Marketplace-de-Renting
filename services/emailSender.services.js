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

export const rentalStartedTemplate = (userName, productName, startDate) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin:auto; border:1px solid #eee; border-radius:8px; padding:20px;">
      <h2 style="color:#2c7a7b;">¡Tu renta ha comenzado!</h2>
      <p>Hola <strong>${userName}</strong>,</p>
      <p>Te confirmamos que la renta del producto <strong>${productName}</strong> ha iniciado correctamente.</p>
      <p><strong>Fecha de inicio:</strong> ${startDate}</p>
      <p>Disfruta de tu producto durante el periodo contratado. Recuerda cuidarlo para evitar cargos adicionales.</p>
      <hr>
      <p style="font-size:14px; color:#555;">Gracias por confiar en <strong>Marketplace Renting</strong>.</p>
    </div>
  `
}

export const rentalEndedTemplate = (userName, productName, endDate) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin:auto; border:1px solid #eee; border-radius:8px; padding:20px;">
      <h2 style="color:#2b6cb0;">Tu renta ha finalizado</h2>
      <p>Hola <strong>${userName}</strong>,</p>
      <p>El periodo de renta del producto <strong>${productName}</strong> ha finalizado el día <strong>${endDate}</strong>.</p>
      <p>Gracias por usar nuestro servicio. Esperamos verte pronto en otra renta.</p>
      <hr>
      <p style="font-size:14px; color:#555;">El equipo de <strong>Marketplace Renting</strong>.</p>
    </div>
  `
}

export const rentalCancelledTemplate = (userName, productName, startDate) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin:auto; border:1px solid #eee; border-radius:8px; padding:20px;">
      <h2 style="color:#c53030;">Renta cancelada automáticamente</h2>
      <p>Hola <strong>${userName}</strong>,</p>
      <p>La renta del producto <strong>${productName}</strong> programada para iniciar el <strong>${startDate}</strong> ha sido cancelada automáticamente debido a falta de pago.</p>
      <p>Si deseas reprogramarla o realizar una nueva renta, puedes hacerlo desde tu cuenta.</p>
      <hr>
      <p style="font-size:14px; color:#555;">Gracias por elegir <strong>Marketplace Renting</strong>.</p>
    </div>
  `
}
