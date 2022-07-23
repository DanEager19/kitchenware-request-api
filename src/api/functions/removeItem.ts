import { Client } from "pg";
import { RemoveItemRequest } from "../model";
import { Response } from 'express';

export const removeItem = async (client: Client, req: RemoveItemRequest, res: Response): Promise<void> => {
    const data = req.body;
    if (data.id === null) {
        res.status(403).send(`Item ID cannot be null.`);
        console.log(`[x] - Someone tried to remove an item without an ID.`);
    } else if (data.id === NaN) {
        res.status(403).send("ID provided is not a number.");
        console.log('[x] - Someone just tried to input a non-number ID.')
    } else {
        const item = await client.query('SELECT * FROM items WHERE ID=$1', [data.id]);
        if (item.rows[0] === undefined) {
            res.status(404).send(`Item with ID ${data.id} Not Found.`);
            console.log(`[x] - Someone tried to remove an item that does not exist.`);
        } else {
            await client.query(`DELETE FROM items WHERE ID=$1;`,
                [data.id], 
                (e: Error, result: any) => {
                    if (e) {
                        res.status(500).send(e);
                        console.log(`[x] - ${e}`);
                        return;
                    } else {
                        res.status(200).send(`Successfully deleted item with ID ${data.id} from items.`);
                        console.log(`[-] - Deleted item with ID ${data.id} from items.`);
                        return;
                    }
                }
            );
        }
    }
    return;
}