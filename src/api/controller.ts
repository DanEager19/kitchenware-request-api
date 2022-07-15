import {Item, ReservationRequest, createReservationTable, createItemTable, ItemRequest} from './model';
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
                console.log(`[ERROR] - ${e}`);
                return;
            } else {
                console.log('Created Reservations Table.')
            }
        });

        this.client.query(createItemTable,(e: Error, result: any) =>{
            if (e) {
                console.log(`[ERROR] - ${e}`);
                return;
            } else {
                console.log('Created Items Table.')
            }
        });
    }

    public reserve = async (req: ReservationRequest, res: Response) => {
        const data = req.body;
        const result = await this.client.query('SELECT * FROM items WHERE name=$1', [data.item]);
        const item: Item = result.rows[0];

        if (item === undefined) {
            res.status(404).send(`${data.item} Not Found.`);
            console.log(`[ERROR] - ${data.email} requested item that does not exist.`);
            return;
        }

        if (item.inventory === 0) {
            res.send(`Cannot Reserve. Inventory of ${item.name} is currently 0.`);
        } else {
            const inventory = item.inventory - 1;

            await this.client.query('UPDATE items SET inventory=$1 WHERE ID=$2;', 
                [inventory, item.id],
                (e: Error, result: any) => {
                    if(e) {
                        res.status(400).send(e);
                        console.log(`[ERROR] - ${e}`);
                        return;
                    } else {
                        console.log(`[POST] - Inventory for ${item.name} updated to ${inventory}`)
                    }
                }
            );

            await this.client.query(`INSERT INTO reservations(
                    item, 
                    email, 
                    startDate, 
                    endDate, 
                    returned
                ) VALUES($1, $2, $3, $4, $5);`, [
                    data.item,
                    data.email,
                    data.startDate,
                    data.endDate,
                    false
                ], 
                (e: Error, result: any) => {
                    if(e) {
                        res.status(400).send(e);
                        console.log(`[ERROR] - ${e}`);
                        return;
                    } else {
                        console.log(`[POST] - Reservation of ${item.name} for ${data.email} made.`)
                        res.send('Success! Confirmation email sent.');
                        return;
                    }
                }
            );
        }
    }
/*
    return = async (req: ReservationRequest, res: Response) => {

    }
    cancel = async (req: ReservationRequest, res: Response) => { 
        const data = req.body;
        await this.client.query('SELECT * FROM items WHERE name=$1;', [data.item]);
        const item: Item; 
        await this.client.query('DELETE FROM reservations WHERE ID=$1;', [data.id]);
        await this.client.query('UPDATE items SET isReserved=false, holderID=0 WHERE holderID=$1;', [item.inventory++, data.id])
    }

    showAllReservations = async (req: ReservationRequest, res: Response) =>{

    }
    */
    public listAllItems = async (req: ItemRequest, res: Response) => {
        await this.client.query('SELECT * FROM items ORDER BY ID ASC;', 
            (e: Error, result: any) => {
                if (e) {
                    res.send(e);
                    console.log(`[ERROR] - ${e}`);
                    return;
                } else {
                    res.send(result.rows);
                    console.log('[GET] - Sent all items.');
                }
            }
        );
        
    }

    public addItem = async (req: ItemRequest, res: Response) => {
        const data = req.body;
        await this.client.query(`INSERT INTO items(
                name,
                description,
                inventory
            ) VALUES ($1, $2, $3);`, 
            [data.name, data.description, data.inventory], (e: Error, result: any) => {
                if (e) {
                    res.status(400).send(e);
                    console.log(`[ERROR] - ${e}`);
                    return;
                } else {
                    res.send(`Successfully added ${data.name} into items.`);
                    console.log(`[POST] - Added ${data.name} into items.`);       
                }     
            }
        );
    }

    public updateItem = async (req: ItemRequest, res: Response) => {
        const data = req.body;
        await this.client.query(`UPDATE items SET name=$1, description=$2, inventory=$3 WHERE ID=$4;`, 
            [data.name, data.description, data.inventory, data.id],
            (e: Error, result: any) => {
                if(e) {
                    res.send(e);
                    console.log(`[ERROR] - ${e}`);
                    return;
                } else {
                    res.send(`Successfully updated ${data.name} in items.`);
                    console.log(`[PUT] - Updated ${data.name} in items.`);
                }
            }
        );
    }

    public removeItem = async (req: ItemRequest, res: Response) => {
        await this.client.query(`DELETE FROM items WHERE ID=$1;`,
            [req.params.id], 
            (e: Error, result: any) => {
                if (e) {
                    res.send(e);
                    console.log(`[ERROR] - ${e}`);
                    return;
                } else {
                    res.send(`Successfully deleted item with ID ${req.params.id} from items.`);
                    console.log(`[DELETE] - Deleted item with ID ${req.params.id} from items.`);
                }
            }
        );
    }
}
