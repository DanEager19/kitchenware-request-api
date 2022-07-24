import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();

export const sendEmail = async (email: string, input: string): Promise<void> => {
    typeof(process.env.SENDGRID_API_KEY) === 'string' ? sgMail.setApiKey(process.env.SENDGRID_API_KEY) : console.log('[x] - API key not set!');

    const message = {
        to: email,
        from: 'dsucookinggardeningclub@gmail.com',
        subject: 'Reservation',
        html: input
    }
    
    await sgMail.send(message);
    console.log(`[+] - Email sent to ${email}.`)

    return;
}