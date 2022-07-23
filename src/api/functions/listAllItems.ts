import { Request, Response } from 'express';
import { Client } from 'pg';

export const listAllItems = async (client: Client, req: Request, res: Response): Promise<void> => {
    await client.query('SELECT * FROM items ORDER BY ID ASC;', 
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