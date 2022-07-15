import {Item, ReservationRequest, createReservationTable, createItemTable} from './model';
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
            res.send(`Cannot Reserve. ${data.reservee} has ${data.item} until ${data.endDate}.`);
        } else {
            item.isReserved = true;
            await this.client.query('INSERT INTO reservations VALUES($1, $2, $3, $4, $5)', [
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

    }

    showAllReservations = async (req: ReservationRequest, res: Response) =>{

    }

    addItem = async (req: ReservationRequest, res: Response) => {

    }

    listAllItems = async (req: ReservationRequest, res: Response) => {
        const { items } = await this.client.query('SELECT * FROM items');
        res.json(items);
    }

    updateItem = async (req: ReservationRequest, res: Response) => {

    }

    removeItem= async (req: ReservationRequest, res: Response) => {

    }
}