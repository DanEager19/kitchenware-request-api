import { 
    Item, 
    ReserveRequest, 
    ReturnRequest, 
    AddItemRequest, 
    UpdateItemRequest, 
    RemoveItemRequest  
} from './model';
import { Request, Response } from 'express';
import { Client } from 'pg';
import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';
dotenv.config();

export class Controller {
    private santizedString: RegExp = /^[a-zA-Z0-9., ]+$/;

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

    private returnTimer = async (time: number, email: string): Promise<void> => {
        const reservationReturned = await this.client.query('SELECT returned, ID FROM reservations ORDER BY ID DESC');
        await setTimeout(async () => {
            if (!reservationReturned.rows[0].returned) {
                const message = `Hi! <br> it seems you haven't returned the item in your possession yet!<br> Make sure you get it back to us ASAP!`
                await this.sendEmail(email, message)
                console.log(`[x] - Reservation with ID ${reservationReturned.rows[0].id} incomplete.`);
            }
        }, time);
        return;
    }

    private sendEmail = async (email: string, input: string): Promise<void> => {
        typeof(process.env.SENDGRID_API_KEY) === 'string' ? sgMail.setApiKey(process.env.SENDGRID_API_KEY) : console.log('[x] - API key not set!');

        const message = {
            to: email,
            from: 'dsucookinggardeningclub@gmail.com',
            subject: 'Reservation',
            html: input
        }
        
        await sgMail.send(message);
        console.log(`[+] - Email sent to ${email}.`)

        return;
    }

    public showAllReservations = async (req: Request, res: Response): Promise<void> => {
        await this.client.query('SELECT * FROM reservations WHERE returned=false ORDER BY ID ASC;', 
            (e: Error, result: any) => {
                if (e) {
                    res.status(500).send(e);
                    console.log(`[x] - ${e}`);
                    return;
                } else {
                    res.status(200).send(result.rows);
                    console.log('[~] - Sent all Reservations.');
                    return;
                }
            }
        );
        return;
    }

    public reserve = async (req: ReserveRequest, res: Response): Promise<void> => {
        const data = req.body;
        const email: RegExp = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
        if (data.itemId === null) {
            res.status(403).send(`Item ID cannot be null.`);
            console.log(`[x] - Someone tried to reserve an item without an ID.`);
        } else if (data.email === null) {
            res.status(403).send(`Email cannot be null.`);
            console.log(`[x] - Someone tried to reserve an item without an email.`);
        } else if (data.itemId === NaN) {
            res.status(403).send("ID provided is not a number.");
            console.log('[x] - Someone just tried to input a non-number ID.')
        } else if (!email.test(data.email)) {
            res.status(403).send("Email provided is invalid.");
            console.log('[x] - Someone just tried to input a bad email.')
        } else {
            const result = await this.client.query('SELECT * FROM items WHERE ID=$1', [data.itemId]);
            const item: Item = result.rows[0];
    
            if (item === undefined) {
                res.status(404).send(`Item with ID ${data.itemId} Not Found.`);
                console.log(`[x] - ${data.email} requested item that does not exist.`);
            } else if (item.inventory === 0) {
                res.status(403).send(`Cannot Reserve. Inventory of ${item.name} is currently 0.`);
                console.log(`[x] - ${data.email} tried to reserve ${item.name} whose inventory is currently 0.`);
            } else {
                const startDate: Date = new Date(), endDate: Date = new Date();
                const timerValue = 1209600000 + ((23 - startDate.getHours()) * 3600000);
    
                startDate.setDate(startDate.getDate() + 1);
                endDate.setDate(startDate.getDate() + 14);
    
                if (startDate.getDay() === 0 || startDate.getDay() === 6) {
                    res.status(403).send("Items cannot be picked up on weekends.");
                    console.log(`[x] - ${data.email} tried to pick up ${item.name} on the weekend.`);
                } else {
                    const message = `Hi!<br><br>You have <b>${item.name}</b> from ${startDate} to ${endDate}.<br> Talk to an officer about when you can pick it up.`
                    await this.sendEmail(data.email, message);
                    console.log(`[~] - ${data.email} has ${item.name} from ${startDate.toDateString()} until ${endDate.toDateString()}.`);
                    
                    await this.client.query('UPDATE items SET inventory=inventory - 1 WHERE ID=$1;', 
                        [item.id],
                        (e: Error, result: any) => {
                            if(e) {
                                res.status(500).send(e);
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
                            item.name,
                            data.email,
                            startDate,
                            endDate,
                            false
                        ], 
                        (e: Error, result: any) => {
                            if(e) {
                                res.status(500).send(e);
                                console.log(`[x] - ${e}`);
                                return;
                            } else {
                                console.log(`[+] - Reservation of ${item.name} for ${data.email} made.`);
                                res.status(201).send('Success! Confirmation email sent.');
                                return;
                            }
                        }
                    );
                    this.returnTimer(timerValue, data.email);
                }
            }
        }
        return;
    }

    public return = async (req: ReturnRequest, res: Response): Promise<void> => { 
        const data = req.body;
        const item = await this.client.query('SELECT itemId, returned FROM reservations WHERE ID=$1', [data.id]);
        if (data.id === NaN) {
            res.status(403).send("ID porvided is not a number.");
            console.log('[x] - Someone just tried to input a non-number ID.')
        } else if (item.rows[0] === undefined) {
            res.status(403).send("Order ID cannot be null.");
            console.log(`[x] - Someone tried to return an item without a order id.`);
        } else if (item.rows[0].returned === true) {
            res.status(403).send("Item already returned!");
            console.log(`[x] - Reservation with ID ${data.id} tried to re-return item.`);
        } else {
            await this.client.query('UPDATE reservations SET returned=$1 WHERE ID=$2;', 
            [true, data.id],
            (e: Error, result: any) => {
                if (e) {
                    res.status(500).send(e);
                    console.log(`[x] - ${e}`);
                    return;
                } else {
                    res.status(200).send("Item successfully returned!");
                    console.log(`[+] - Reservation with ID ${data.id} returned item.`);
                    return;
                }
            }
            );
            await this.client.query('UPDATE items SET inventory=inventory + 1 WHERE ID=$1;', 
                [item.rows[0].itemid],
                (e: Error, result: any) => {
                    if (e) {
                        console.log(`[x] - ${e}`);
                        return;
                    } else {
                        console.log(`[+] - Reservation item inventory corrected.`);
                        return;
                    }
                }
            )
        }
        return;
    }

    public listAllItems = async (req: Request, res: Response): Promise<void> => {
        await this.client.query('SELECT * FROM items ORDER BY ID ASC;', 
            (e: Error, result: any) => {
                if (e) {
                    res.status(500).send(e);
                    console.log(`[x] - ${e}`);
                    return;
                } else {
                    res.status(200).send(result.rows);
                    console.log('[~] - Sent all items.');
                    return;
                }
            }
        );   
        return;
    }

    public addItem = async (req: AddItemRequest, res: Response): Promise<void> => {
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
        } else if (!this.santizedString.test(data.name) || !this.santizedString.test(data.description) || data.inventory === NaN) {
            res.status(403).send(`Wuh-oh, Looks like you entered some bad characters! Try again!`);
            console.log(`[x] - Someone entered bad characters as input`);
        } else {
            await this.client.query(`INSERT INTO items(
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

    public updateItem = async (req: UpdateItemRequest, res: Response): Promise<void> => {
        const data = req.body;
        if (data.id === null) {
            res.status(403).send(`Item ID cannot be null.`);
            console.log(`[x] - Someone tried to update an item withpit an ID.`);
        } else if (!this.santizedString.test(data.name) || !this.santizedString.test(data.description) || data.inventory === NaN) {
            res.status(403).send(`Wuh-oh, Looks like you entered some bad characters! Try again!`);
            console.log(`[x] - Someone entered bad characters as input`);
        } else {
            const item = await this.client.query('SELECT * FROM items WHERE ID=$1', [data.id]);
            if (item.rows[0] === undefined) {
                res.status(404).send(`Item with ID ${data.id} Not Found.`);
                console.log(`[x] - Someone tried to update an item that does not exist.`);
            } else {
                const name = data.name ? data.name : item.rows[0].name;
                const description = data.description ? data.description : item.rows[0].description;
                const inventory = data.inventory ? data.inventory : item.rows[0].inventory;
                await this.client.query(`UPDATE items SET name=$1, description=$2, inventory=$3 WHERE ID=$4;`, 
                    [name, description, inventory, data.id],
                    (e: Error, result: any) => {
                        if(e) {
                            res.status(500).send(e);
                            console.log(`[x] - ${e}`);
                            return;
                        } else {
                            res.status(200).send(`Successfully updated ${name} in items.`);
                            console.log(`[+] - Updated ${name} in items.`);
                            return;
                        }
                    }
                );
            }
        }
        return;
    }

    public removeItem = async (req: RemoveItemRequest, res: Response): Promise<void> => {
        const data = req.body;
        if (data.id === null) {
            res.status(403).send(`Item ID cannot be null.`);
            console.log(`[x] - Someone tried to remove an item without an ID.`);
        } else if (data.id === NaN) {
            res.status(403).send("ID provided is not a number.");
            console.log('[x] - Someone just tried to input a non-number ID.')
        } else {
            const item = await this.client.query('SELECT * FROM items WHERE ID=$1', [data.id]);
            if (item.rows[0] === undefined) {
                res.status(404).send(`Item with ID ${data.id} Not Found.`);
                console.log(`[x] - Someone tried to remove an item that does not exist.`);
            } else {
                await this.client.query(`DELETE FROM items WHERE ID=$1;`,
                    [data.id], 
                    (e: Error, result: any) => {
                        if (e) {
                            res.status(500).send(e);
                            console.log(`[x] - ${e}`);
                            return;
                        } else {
                            res.status(200).send(`Successfully deleted item with ID ${data.id} from items.`);
                            console.log(`[-] - Deleted item with ID ${data.id} from items.`);
                            return;
                        }
                    }
                );
            }
        }
        return;
    }
}
