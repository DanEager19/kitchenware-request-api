import {Item, ReservationRequest, createReservationTable, createItemTable, ItemRequest} from './model';
import { Response } from 'express';
import { Client } from 'pg';

export class Controller {
    
    client = new Client({
        user: 'user',
        host: 'localhost',
        database: 'api',
        password: 'Password1!',
        port: 5432,
    });

    constructor() { 
        this.client.connect();
        this.client.query(createReservationTable, (e: Error) =>{
            if (e) {
                console.log(`[ERROR] - ${e}`);
            } else {
                console.log('Created Reservations Table.')
            }
        });
        this.client.query(createItemTable,(e: Error) =>{
            if (e) {
                console.log(`[ERROR] - ${e}`);
            } else {
                console.log('Created Items Table.')
            }
        });
    }

    reserve = async (req: ReservationRequest, res: Response) => {
        const data = req.body;
        const item: Item = await this.client.query('SELECT * FROM items WHERE name=$1', data.item);
        if (item.inventory === 0) {
            res.send(`Cannot Reserve. Inventory of ${item.name} is currently 0-.`);
        } else {
            await this.client.query('UPDATE items SET inventory holderID=$1 WHERE holderID=$1;', [item.inventory--, data.id])
            await this.client.query(`INSERT INTO reservations(
                    item, 
                    reservee, 
                    startDate, 
                    endDate, 
                    returned
                ) VALUES($1, $2, $3, $4, $5);`, [
                data.item,
                data.reservee,
                data.startDate,
                data.endDate,
                false
                ]
            );
            res.send('Success! Confirmation email sent.');
        }
    }

    cancel = async (req: ReservationRequest, res: Response) =>{ 
        const data = req.body;
        const item: Item = await this.client.query('SELECT * FROM items WHERE name=$1;', [data.item]);
        await this.client.query('DELETE FROM reservations WHERE ID=$1;', [data.id]);
        await this.client.query('UPDATE items SET isReserved=false, holderID=0 WHERE holderID=$1;', [item.inventory++, data.id])
    }

    showAllReservations = async (req: ReservationRequest, res: Response) =>{

    }
    
    listAllItems = async (req: ItemRequest, res: Response) => {
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

    addItem = async (req: ItemRequest, res: Response) => {
        const data = req.body;
        await this.client.query(`INSERT INTO items(
                name,
                description,
                inventory,
                holderID
            ) VALUES ($1, $2, $3, $4);`, 
            [data.name, data.description, data.inventory, 0], (e: Error, result: any) => {
                if (e) {
                    res.send(e);
                    console.log(`[ERROR] - ${e}`);
                } else {
                    res.send(`Successfully added ${data.name} into items.`);
                    console.log(`[POST] - Added ${data.name} into items.`);       
                }     
            }
        );
    }

    updateItem = async (req: ItemRequest, res: Response) => {
        const data = req.body;
        await this.client.query(`UPDATE items SET name=$1, description=$2, inventory=$3 WHERE ID=$4;`, 
            [data.name, data.description, data.inventory, req.params.id],
            (e: Error, result: any) => {
                if(e) {
                    res.send(e);
                    console.log(`[ERROR]- ${e}`);
                } else {
                    res.send(`Successfully updated ${data.name} in items.`);
                    console.log(`[PUT] - Updated ${data.name} in items.`);
                }
            }
        );
    }

    removeItem = async (req: ItemRequest, res: Response) => {
        await this.client.query(`DELETE FROM items WHERE ID=$1;`,
            [req.params.id], 
            (e: Error, result: any) => {
                if (e) {
                    res.send(e);
                    console.log(`[ERROR] - ${e}`);
                } else {
                    res.send(`Successfully deleted item with ID ${req.params.id} from items.`);
                    console.log(`[DELETE] - Deleted item with ID ${req.params.id} from items.`);
                }
            }
        );
    }
}
