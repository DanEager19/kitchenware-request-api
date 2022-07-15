import {Item, ReservationRequest, createReservationTable, createItemTable} from './model';
import { Response } from 'express';
const { Client, Pool } = require('pg');

export class Controller {
    
    client = new Client();
    
    constructor() { 
        this.client.query(createReservationTable);
        this.client.query(createItemTable);
    }

    async reserve(req: ReservationRequest, res: Response) {
        const item: Item = await this.client.query('SELECT * FROM items WHERE name=$1', req.body.item);
        if (item.isReserved) {
            res.send(`Cannot Reserve. ${req.body.reservee} has ${req.body.item} until ${req.body.endDate}.`);
        } else {
            item.isReserved = true;
            await this.client.query('INSERT INTO reservations VALUES($1)', [])
            res.send('Success! Confirmation email sent.')
        }
    }

    async cancel() { 

    }

    async showAllReservations() {

    }

    async addItem() {

    }

    async listAllItems(req: ReservationRequest, res: Response) {
        const { items } = await this.client.query('SELECT * FROM items');
        res.json(items);
    }

    async updateItem() {

    }

    async removeItem() {

    }
}