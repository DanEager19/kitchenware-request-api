import { Request, Response } from 'express';
import { Client } from 'pg';

export const showAllReservations = async (client: Client, req: Request, res: Response): Promise<void> => {
    await client.query('SELECT * FROM reservations WHERE returned=false ORDER BY ID ASC;', 
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