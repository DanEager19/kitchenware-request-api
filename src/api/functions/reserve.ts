import { Client } from "pg";
import {  Response } from 'express';
import { Item, ReserveRequest } from "../model";
import { returnTimer } from "./returnTimer";
import { sendEmail } from "./sendEmail";

export const reserve = async (client: Client, req: ReserveRequest, res: Response): Promise<void> => {
    const data = req.body;
    const email: RegExp = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
    if (data.itemId === null) {
        res.status(403).send(`Item ID cannot be null.`);
        console.log(`[x] - Someone tried to reserve an item without an ID.`);
    } else if (data.email === null) {
        res.status(403).send(`Email cannot be null.`);
        console.log(`[x] - Someone tried to reserve an item without an email.`);
    } else if (data.itemId === NaN) {
        res.status(403).send("ID provided is not a number.");
        console.log('[x] - Someone just tried to input a non-number ID.')
    } else if (!email.test(data.email)) {
        res.status(403).send("Email provided is invalid.");
        console.log('[x] - Someone just tried to input a bad email.')
    } else {
        const result = await client.query('SELECT * FROM items WHERE ID=$1', [data.itemId]);
        const item: Item = result.rows[0];

        if (item === undefined) {
            res.status(404).send(`Item with ID ${data.itemId} Not Found.`);
            console.log(`[x] - ${data.email} requested item that does not exist.`);
        } else if (item.inventory === 0) {
            res.status(403).send(`Cannot Reserve. Inventory of ${item.name} is currently 0.`);
            console.log(`[x] - ${data.email} tried to reserve ${item.name} whose inventory is currently 0.`);
        } else {
            const startDate: Date = new Date(), endDate: Date = new Date();
            const timerValue = 1209600000 + ((23 - startDate.getHours()) * 3600000);

            startDate.setDate(startDate.getDate() + 1);
            endDate.setDate(startDate.getDate() + 14);

            if (startDate.getDay() === 0 || startDate.getDay() === 6) {
                res.status(403).send("Items cannot be picked up on weekends.");
                console.log(`[x] - ${data.email} tried to pick up ${item.name} on the weekend.`);
            } else {
                const message = `Hi!<br><br>You have <b>${item.name}</b> from ${startDate} to ${endDate}.<br> Talk to an officer about when you can pick it up.`
                await sendEmail(data.email, message);
                console.log(`[~] - ${data.email} has ${item.name} from ${startDate.toDateString()} until ${endDate.toDateString()}.`);
                
                await client.query('UPDATE items SET inventory=inventory - 1 WHERE ID=$1;', 
                    [item.id],
                    (e: Error, result: any) => {
                        if(e) {
                            res.status(500).send(e);
                            console.log(`[x] - ${e}`);
                            return;
                        } else {
                            console.log(`[+] - Inventory for ${item.name} updated.`)
                        }
                    }
                );
                await client.query(`INSERT INTO reservations(
                        itemId, 
                        itemName,
                        email, 
                        startDate, 
                        endDate, 
                        returned
                    ) VALUES($1, $2, $3, $4, $5, $6);`, [
                        data.itemId,
                        item.name,
                        data.email,
                        startDate,
                        endDate,
                        false
                    ], 
                    (e: Error, result: any) => {
                        if(e) {
                            res.status(500).send(e);
                            console.log(`[x] - ${e}`);
                            return;
                        } else {
                            console.log(`[+] - Reservation of ${item.name} for ${data.email} made.`);
                            res.status(201).send('Success! Confirmation email sent.');
                            return;
                        }
                    }
                );
                returnTimer(client, timerValue, data.email);
            }
        }
    }
    return;
}