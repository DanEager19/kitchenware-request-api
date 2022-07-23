import { Client } from 'pg';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();

import { AddItemRequest, RemoveItemRequest, ReserveRequest, ReturnRequest, UpdateItemRequest } from './model';
import { addItem } from './functions/addItem';
import { updateItem } from './functions/updateItem';
import { removeItem } from './functions/removeItem';
import { listAllItems } from './functions/listAllItems';
import { reserve } from './functions/reserve';
import { returnItem } from './functions/returnItem';
import { showAllReservations } from './functions/showAllReservations';

export class Controller {


    private client: Client = new Client({
        user: process.env.POSTGRES_USER,
        host: process.env.POSTGRES_HOST,
        database: process.env.POSTGRES_DATABASE,
        password: process.env.POSTGRES_PASSWORD,
        port: 5432
    })
    
    public constructor() {
        this.client.connect()
        this.client.query(`
            CREATE TABLE IF NOT EXISTS reservations(
                ID SERIAL PRIMARY KEY,
                itemName TEXT,
                itemId INT,
                email TEXT,
                startDate DATE,
                endDate DATE,
                returned BOOLEAN
            );`, 
        (e: Error, result: any) => {
            if (e) {
                console.log(`[x] - ${e}`);
                return;
            } else {
                console.log('[+] - Created Reservations Table.');
                return;
            }
        });

        this.client.query(`
            CREATE TABLE IF NOT EXISTS items(
                ID SERIAL PRIMARY KEY,
                name TEXT,
                description TEXT,
                inventory INT
            );`,
            (e: Error, result: any) => {
                if (e) {
                    console.log(`[x] - ${e}`);
                    return;
                } else {
                    console.log('[+] - Created Items Table.');
                    return;
                }
            }
        );
        return;
    }

    public listAllItems = (req: Request, res: Response) => listAllItems(this.client, req, res);
 
    public addItem = (req: AddItemRequest, res: Response) => addItem(this.client, req, res);
    
    public updateItem = (req: UpdateItemRequest, res: Response) => updateItem(this.client, req, res);
    
    public removeItem = (req: RemoveItemRequest, res: Response) => removeItem(this.client, req, res);

    public reserve = (req: ReserveRequest, res: Response) => reserve(this.client, req, res);
    
    public return = (req: ReturnRequest, res: Response) => returnItem(this.client, req, res);
    
    public showAllReservations = (req: Request, res: Response) => showAllReservations(this.client, req, res);    
}
