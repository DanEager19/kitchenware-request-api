import { Response } from 'express';
import { Client } from 'pg';
import { AddItemRequest } from '../model';

export const addItem = async (client: Client, req: AddItemRequest, res: Response): Promise<void> => {
    const santizedString: RegExp = /^[a-zA-Z0-9., ]+$/;
    const data = req.body;
    
    if (data.name === null) {
        res.status(403).send(`Item name cannot be null.`);
        console.log(`[x] - Someone tried to register an item without a name.`);
    } else if (data.description === null) {
        res.status(403).send(`Item description cannot be null.`);
        console.log(`[x] - Someone tried to register an item without a description.`);
    } else if (data.inventory === null) {
        res.status(403).send(`Item inventory cannot be null.`);
        console.log(`[x] - Someone tried to register an item without a inventory.`);
    } else if (!santizedString.test(data.name) || !santizedString.test(data.description) || data.inventory === NaN) {
        res.status(403).send(`Wuh-oh, Looks like you entered some bad characters! Try again!`);
        console.log(`[x] - Someone entered bad characters as input`);
    } else {
        await client.query(`INSERT INTO items(
                name,
                description,
                inventory
            ) VALUES ($1, $2, $3);`, 
            [data.name, data.description, data.inventory], (e: Error, result: any) => {
                if (e) {
                    res.status(500).send(e);
                    console.log(`[x] - ${e}`);
                    return;
                } else {
                    res.status(201).send(`Successfully added ${data.name} into items.`);
                    console.log(`[+] - Added ${data.name} into items.`);
                    return;       
                }     
            }
        );
    }
    return;
}