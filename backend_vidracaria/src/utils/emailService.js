import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'amiltonfilho2301@gmail.com', // 🔒 e-mail que vai enviar
    pass: 'bkwk zxit xmsb hwrt',        // 🔑 use app password (não senha normal!)
  },
});

export const enviarEmail = async ({ to, subject, html }) => {
  return transporter.sendMail({
    from: '"Sistema Vidraçaria" <amiltonfilho2301@gmail.com>',
    to,
    subject,
    html,
  });
};
