export interface Item {
    id: number,
    name: string,
    inventory: number,
    holderId: number
}

export interface ItemRequest extends Express.Request{
    body: {
        id: number,
        name: string,
        inventory: number,
        holderId: number
    }
}

export interface Reservation {
    id: number,
    item: string, 
    //Email Address
    reservee: string,
    startDate: Date,
    endDate: Date,
    returned: boolean
}

export interface ReservationRequest extends Express.Request {
    body: {
        id: number,
        item: string, 
        reservee: string,
        startDate: Date,
        endDate: Date,
        returned: boolean
    }
}

export const createReservationTable = `
    CREATE TABLE IF NOT EXISTS reservations(
        ID SERIAL PRIMARY KEY,
        item TEXT,
        reservee TEXT,
        startDate DATE,
        endDate DATE,
        returned BOOLEAN
    );
`

export const createItemTable = `
    CREATE TABLE IF NOT EXISTS items(
        ID SERIAL PRIMARY KEY,
        name TEXT,
        inventory INT,
        holderID INT
    );
`