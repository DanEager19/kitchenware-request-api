import { Item, ReservationRequest, createReservationTable, createItemTable, ItemRequest } from './model';
import { Response } from 'express';
import { Client } from 'pg';
import { email, password } from '../auth.json';
let nodemailer = require('nodemailer');

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

        this.client.query(createReservationTable, (e: Error, result: any) => {
            if (e) {
                console.log(`[x] - ${e}`);
                return;
            } else {
                console.log('[+] - Created Reservations Table.');
            }
        });

        this.client.query(createItemTable,(e: Error, result: any) => {
            if (e) {
                console.log(`[x] - ${e}`);
                return;
            } else {
                console.log('[+] - Created Items Table.');
            }
        });
    }

    private returnTimer = async (time: number): Promise<void> => {
        const reservationReturned = await this.client.query('SELECT returned, ID FROM reservations ORDER BY ID DESC');
        await setTimeout(() => {
            if (!reservationReturned.rows[0].returned) {
                console.log(`[x] - Reservation with ID ${reservationReturned.rows[0].id} incomplete.`);
            }
        }, time);
        return;
    }

    private sendEmail = async (userEmail: string, title: string, msg: string ): Promise<void> => {
        const transporter = nodemailer.createTransort({
            service: 'gmail',
            auth: {
                user: email,
                pass: password,
            }
        });
    
        const mailOptions = {
            from: email,
            to: userEmail,
            subject: title,
            text: msg
        }
    
        await transporter.sendMail(mailOptions, (e: Error, info: any) => {
            if (e) {
                console.log(`[x] - ${e}`);
                return;
            } else {
                console.log('[~] - Reminder email sent.');
                return;
            }
        });
    }

    public showAllReservations = async (req: ReservationRequest, res: Response): Promise<void> => {
        await this.client.query('SELECT * FROM reservations ORDER BY ID ASC;', 
            (e: Error, result: any) => {
                if (e) {
                    res.status(400).send(e);
                    console.log(`[x] - ${e}`);
                    return;
                } else {
                    res.status(200).send(result.rows);
                    console.log('[~] - Sent all Reservations.');
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
            res.status(404).send(`{data.itemName} Not Found.`);
            console.log(`[x] - ${data.email} requested item that does not exist.`);
            return;
        }

        if (item.inventory === 0) {
            res.status(403).send(`Cannot Reserve. Inventory of ${data.itemName} is currently 0.`);
            console.log(`[x] - ${data.email} tried to reserve ${data.itemName} whose inventory is currently 0.`);
            return;
        } else {
            const startDate: Date = new Date(), endDate: Date = new Date();
            const timerValue = 1209600000 + ((23 - startDate.getHours()) * 3600000);

            startDate.setDate(startDate.getDate() + 1);
            endDate.setDate(startDate.getDate() + 14);

            if(startDate.getDay() === 0 || startDate.getDay() === 6) {
                res.status(403).send("Items cannot be picked up on weekends.");
                console.log(`[x] - ${data.email} tried to pick up ${data.itemName} on the weekend.`);
                return;
            } else {
                console.log(`[~] - ${data.email} has ${data.itemName} from ${startDate.toDateString()} until ${endDate.toDateString()}.`);
                
                await this.client.query('UPDATE items SET inventory=inventory - 1 WHERE ID=$1;', 
                    [item.id],
                    (e: Error, result: any) => {
                        if(e) {
                            res.status(400).send(e);
                            console.log(`[x] - ${e}`);
                            return;
                        } else {
                            console.log(`[+] - Inventory for ${item.name} updated.`)
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
                        startDate,
                        endDate,
                        false
                    ], 
                    (e: Error, result: any) => {
                        if(e) {
                            res.status(400).send(e);
                            console.log(`[x] - ${e}`);
                            return;
                        } else {
                            console.log(`[+] - Reservation of ${item.name} for ${data.email} made.`);
                            res.status(201).send('Success! Confirmation email sent.');
                            return;
                        }
                    }
                );

                this.returnTimer(timerValue);
            }
        }
    }

    public return = async (req: ReservationRequest, res: Response): Promise<void> => { 
        const data = req.body;
        await this.client.query('UPDATE reservations SET returned=$1 WHERE ID=$2;', 
            [true, data.id],
            (e: Error, result: any) => {
                if (e) {
                    res.status(400).send(e);
                    console.log(`[x] - ${e}`);
                    return;
                } else {
                    res.status(200).send("Item successfully returned!");
                    console.log(`[+] - Reservation with ID ${data.id} returned item.`);
                    return;
                }
            }
        );
        await this.client.query('UPDATE items SET inventory=inventory + 1 WHERE name=$1;', 
            [data.itemId],
            (e: Error, result: any) => {
                if (e) {
                    res.status(400).send(e);
                    console.log(`[x] - ${e}`);
                    return;
                } else {
                    console.log(`[+] - Reservation item inventory corrected.`);
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
                    console.log(`[x] -  ${e}`);
                    return;
                } else {
                    res.status(200).send(result.rows);
                    console.log('[~] - Sent all items.');
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

    public updateItem = async (req: ItemRequest, res: Response): Promise<void> => {
        const data = req.body;
        await this.client.query(`UPDATE items SET name=$1, description=$2, inventory=$3 WHERE ID=$4;`, 
            [data.name, data.description, data.inventory, data.id],
            (e: Error, result: any) => {
                if(e) {
                    res.status(400).send(e);
                    console.log(`[x] - ${e}`);
                    return;
                } else {
                    res.status(200).send(`Successfully updated ${data.name} in items.`);
                    console.log(`[+] - Updated ${data.name} in items.`);
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
                    console.log(`[x] - ${e}`);
                    return;
                } else {
                    res.status(200).send(`Successfully deleted item with ID ${req.body.id} from items.`);
                    console.log(`[-] - Deleted item with ID ${req.body.id} from items.`);
                    return;
                }
             }
        );
    }
}
