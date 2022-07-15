import { Item, ReservationRequest, createReservationTable, createItemTable, ItemRequest } from './model';
import { Response } from 'express';
import { Client } from 'pg';

export class Controller {

    private client = new Client({
        user: 'user',
        host: 'localhost',
        database: 'api',
        password: 'Password1!',
        port: 5432,
    });

    public constructor() { 
        this.client.connect();

        this.client.query(createReservationTable, (e: Error, result: any) =>{
            if (e) {
                console.log(`[400] ${e}`);
                return;
            } else {
                console.log('Created Reservations Table.')
            }
        });

        this.client.query(createItemTable,(e: Error, result: any) =>{
            if (e) {
                console.log(`[400] ${e}`);
                return;
            } else {
                console.log('Created Items Table.')
            }
        });
    }

    public showAllReservations = async (req: ReservationRequest, res: Response): Promise<void> => {
        await this.client.query('SELECT * FROM reservations ORDER BY ID ASC;', 
            (e: Error, result: any) => {
                if (e) {
                    res.status(400).send(e);
                    console.log(`[400] ${e}`);
                    return;
                } else {
                    res.status(200).send(result.rows);
                    console.log('[200] Sent all Reservations.');
                    return;
                }
            }
        );   
    }

    public reserve = async (req: ReservationRequest, res: Response): Promise<void> => {
        const data = req.body;
        const result = await this.client.query('SELECT * FROM items WHERE ID=$1', [data.itemId]);
        const item: Item = result.rows[0];

        if (item === undefined) {
            res.status(404).send(`${data.itemName} Not Found.`);
            console.log(`[404] ${data.email} requested item that does not exist.`);
            return;
        }

        if (item.inventory === 0) {
            res.status(403).send(`Cannot Reserve. Inventory of ${data.itemName} is currently 0.`);
            console.log(`[403] ${data.email} tried to reserve ${data.itemName} whose inventory is currently 0.`)
            return;
        } else {
            await this.client.query('UPDATE items SET inventory=inventory - 1 WHERE ID=$1;', 
                [item.id],
                (e: Error, result: any) => {
                    if(e) {
                        res.status(400).send(e);
                        console.log(`[400] ${e}`);
                        return;
                    } else {
                        console.log(`[200] Inventory for ${item.name} updated.`)
                    }
                }
            );
            await this.client.query(`INSERT INTO reservations(
                    itemId, 
                    itemName,
                    email, 
                    startDate, 
                    endDate, 
                    returned
                ) VALUES($1, $2, $3, $4, $5, $6);`, [
                    data.itemId,
                    data.itemName,
                    data.email,
                    data.startDate,
                    data.endDate,
                    false
                ], 
                (e: Error, result: any) => {
                    if(e) {
                        res.status(400).send(e);
                        console.log(`[400] ${e}`);
                        return;
                    } else {
                        console.log(`[201] Reservation of ${item.name} for ${data.email} made.`);
                        res.status(201).send('Success! Confirmation email sent.');
                        return;
                    }
                }
            );
        }
    }

    public return = async (req: ReservationRequest, res: Response): Promise<void> => { 
        const data = req.body;
        await this.client.query('UPDATE reservations SET returned=$1 WHERE ID=$2;', 
            [true, data.id],
            (e: Error, result: any) => {
                if (e) {
                    res.status(400).send(e);
                    console.log(`[400] ${e}`);
                    return;
                } else {
                    res.status(200).send("Item successfully returned!");
                    console.log(`[200] Reservation with ID ${data.id} returned item.`);
                    return;
                }
            }
        );
        await this.client.query('UPDATE items SET inventory=inventory + 1 WHERE name=$1;', 
            [data.itemId],
            (e: Error, result: any) => {
                if (e) {
                    res.status(400).send(e);
                    console.log(`[400] ${e}`);
                    return;
                } else {
                    console.log(`[200] Reservation item inventory corrected.`);
                    return;
                }
            }
        )
    }

    public listAllItems = async (req: ItemRequest, res: Response): Promise<void> => {
        await this.client.query('SELECT * FROM items ORDER BY ID ASC;', 
            (e: Error, result: any) => {
                if (e) {
                    res.status(400).send(e);
                    console.log(`[400] ${e}`);
                    return;
                } else {
                    res.status(200).send(result.rows);
                    console.log('[200] Sent all items.');
                    return;
                }
            }
        );   
    }

    public addItem = async (req: ItemRequest, res: Response): Promise<void> => {
        const data = req.body;
        await this.client.query(`INSERT INTO items(
                name,
                description,
                inventory
            ) VALUES ($1, $2, $3);`, 
            [data.name, data.description, data.inventory], (e: Error, result: any) => {
                if (e) {
                    res.status(400).send(e);
                    console.log(`[400] - ${e}`);
                    return;
                } else {
                    res.status(201).send(`Successfully added ${data.name} into items.`);
                    console.log(`[201] Added ${data.name} into items.`);
                    return;       
                }     
            }
        );
    }

    public updateItem = async (req: ItemRequest, res: Response): Promise<void> => {
        const data = req.body;
        await this.client.query(`UPDATE items SET name=$1, description=$2, inventory=$3 WHERE ID=$4;`, 
            [data.name, data.description, data.inventory, data.id],
            (e: Error, result: any) => {
                if(e) {
                    res.status(400).send(e);
                    console.log(`[400] ${e}`);
                    return;
                } else {
                    res.status(200).send(`Successfully updated ${data.name} in items.`);
                    console.log(`[200] Updated ${data.name} in items.`);
                    return;
                }
            }
        );
    }

    public removeItem = async (req: ItemRequest, res: Response): Promise<void> => {
        await this.client.query(`DELETE FROM items WHERE ID=$1;`,
            [req.body.id], 
            (e: Error, result: any) => {
                if (e) {
                    res.status(400).send(e);
                    console.log(`[400] ${e}`);
                    return;
                } else {
                    res.status(200).send(`Successfully deleted item with ID ${req.body.id} from items.`);
                    console.log(`[200] Deleted item with ID ${req.body.id} from items.`);
                    return;
                }
             }
        );
    }
}
