import { ReturnRequest } from "../model";
import { Response } from "express";
import { Client } from "pg";

export const returnItem = async (client: Client, req: ReturnRequest, res: Response): Promise<void> => { 
    const data = req.body;
    const item = await client.query('SELECT itemId, returned FROM reservations WHERE ID=$1', [data.id]);
    if (data.id === NaN) {
        res.status(403).send("ID porvided is not a number.");
        console.log('[x] - Someone just tried to input a non-number ID.')
    } else if (item.rows[0] === undefined) {
        res.status(403).send("Order ID cannot be null.");
        console.log(`[x] - Someone tried to return an item without a order id.`);
    } else if (item.rows[0].returned === true) {
        res.status(403).send("Item already returned!");
        console.log(`[x] - Reservation with ID ${data.id} tried to re-return item.`);
    } else {
        await client.query('UPDATE reservations SET returned=$1 WHERE ID=$2;', 
        [true, data.id],
        (e: Error, result: any) => {
            if (e) {
                res.status(500).send(e);
                console.log(`[x] - ${e}`);
                return;
            } else {
                res.status(200).send("Item successfully returned!");
                console.log(`[+] - Reservation with ID ${data.id} returned item.`);
                return;
            }
        }
        );
        await client.query('UPDATE items SET inventory=inventory + 1 WHERE ID=$1;', 
            [item.rows[0].itemid],
            (e: Error, result: any) => {
                if (e) {
                    console.log(`[x] - ${e}`);
                    return;
                } else {
                    console.log(`[+] - Reservation item inventory corrected.`);
                    return;
                }
            }
        )
    }
    return;
}
