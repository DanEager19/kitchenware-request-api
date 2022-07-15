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
        req.body.returned = false;
        const data = req.body;
        const item: Item = await this.client.query('SELECT * FROM items WHERE name=$1', data.item);
        if (item.isReserved) {
            //should use the item type
            res.send(`Cannot Reserve. ${data.reservee} has ${data.item} until ${data.endDate}.`);
        } else {
            await this.client.query('UPDATE items SET isReserved=true, holderID=$1 WHERE holderID=$1;', [data.id, data.id])
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
                data.returned
            ])
            res.send('Success! Confirmation email sent.')
        }
    }

    cancel = async (req: ReservationRequest, res: Response) =>{ 
        const data = req.body;
        const item: Item = await this.client.query('SELECT * FROM items WHERE name=$1;', [data.item]);
        await this.client.query('DELETE FROM reservations WHERE ID=$1;', [data.id]);
        await this.client.query('UPDATE items SET isReserved=false, holderID=$1 WHERE holderID=$2;', [data.id, 0])
    }

    showAllReservations = async (req: ReservationRequest, res: Response) =>{

    }

    addItem = async (req: ItemRequest, res: Response) => {

    }

    listAllItems = async (req: ItemRequest, res: Response) => {
        const { items } = await this.client.query('SELECT * FROM items');
        res.json(items);
    }

    updateItem = async (req: ItemRequest, res: Response) => {

    }

    removeItem = async (req: ItemRequest, res: Response) => {

    }
}