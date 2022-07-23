import { Client } from "pg";
import { UpdateItemRequest } from "../model";
import { Response } from 'express';

export const updateItem = async (client: Client, req: UpdateItemRequest, res: Response): Promise<void> => {
    const santizedString: RegExp = /^[a-zA-Z0-9., ]+$/;
    const data = req.body;
    
    if (data.id === null) {
        res.status(403).send(`Item ID cannot be null.`);
        console.log(`[x] - Someone tried to update an item withpit an ID.`);
    } else if (!santizedString.test(data.name) || !santizedString.test(data.description) || data.inventory === NaN) {
        res.status(403).send(`Wuh-oh, Looks like you entered some bad characters! Try again!`);
        console.log(`[x] - Someone entered bad characters as input`);
    } else {
        const item = await client.query('SELECT * FROM items WHERE ID=$1', [data.id]);
        if (item.rows[0] === undefined) {
            res.status(404).send(`Item with ID ${data.id} Not Found.`);
            console.log(`[x] - Someone tried to update an item that does not exist.`);
        } else {
            const name = data.name ? data.name : item.rows[0].name;
            const description = data.description ? data.description : item.rows[0].description;
            const inventory = data.inventory ? data.inventory : item.rows[0].inventory;
            await client.query(`UPDATE items SET name=$1, description=$2, inventory=$3 WHERE ID=$4;`, 
                [name, description, inventory, data.id],
                (e: Error, result: any) => {
                    if(e) {
                        res.status(500).send(e);
                        console.log(`[x] - ${e}`);
                        return;
                    } else {
                        res.status(200).send(`Successfully updated ${name} in items.`);
                        console.log(`[+] - Updated ${name} in items.`);
                        return;
                    }
                }
            );
        }
    }
    return;
}