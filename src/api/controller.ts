import {Item, ReservationRequest, createReservationTable, createItemTable, ItemRequest} from './model';
import { Response } from 'express';
const { Client, Pool } = require('pg');

export class Controller {
    
    client = new Client();
    
    constructor() { 
        this.client.query(createReservationTable);
        this.client.query(createItemTable);
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
        const { items } = await this.client.query('SELECT * FROM items', 
            (e: Error) => {
                if (e) {
                    res.send(e);
                    console.log(`[ERROR] - ${e}`);
                } else {
                    res.json(items);
                    console.log('[GET] - Sent all items.');
                }
            }
        );
    }

    addItem = async (req: ItemRequest, res: Response) => {
        const data = req.body;
        await this.client.query(`INSERT INTO items(
                name,
                inventory,
                holderID
            ) VALUES ($1, $2, $3);`, 
            [data.name, data.inventory,0], (e: Error) => {
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
        await this.client.query(`UPDATE items SET name=$1, inventory=$2 WHERE ID=$3`, 
            [data.name, data.inventory, data.id],
            (e: Error) => {
                if(e) {
                    res.send(e);
                    console.log(`[ERROR] - ${e}`);
                } else {
                    res.send(`Successfully updated ${data.name} in items.`);
                    console.log(`[PUT] - Updated ${data.name} in items.`);
                }
            }
        );
    }

    removeItem = async (req: ItemRequest, res: Response) => {
        const data = req.body;
        await this.client.query(`DELETE FROM items where ID=$1`,
            [data.id], 
            (e: Error) => {
                if (e) {
                    res.send(e);
                    console.log(`[ERROR] - ${e}`);
                } else {
                    res.send(`Successfully deleted ${data.name} from items.`);
                    console.log(`[DELETE] - Deleted ${data.name} from items.`);
                }
            }
        );
    }
}
