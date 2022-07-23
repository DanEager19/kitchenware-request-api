import { Client } from "pg";
import { sendEmail } from "./returnTimer";

 export const returnTimer = async (client: Client, time: number, email: string): Promise<void> => {
    const reservationReturned = await client.query('SELECT returned, ID FROM reservations ORDER BY ID DESC');
    await setTimeout(async () => {
        if (!reservationReturned.rows[0].returned) {
            const message = `Hi! <br> it seems you haven't returned the item in your possession yet!<br> Make sure you get it back to us ASAP!`
            await sendEmail(email, message)
            console.log(`[x] - Reservation with ID ${reservationReturned.rows[0].id} incomplete.`);
        }
    }, time);
    return;
}