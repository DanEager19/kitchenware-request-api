export interface Item {
    id: number,
    name: string,
    description: string,
    inventory: number,
}

export interface ItemRequest extends Express.Request{
    params: {
        id: number
    },
    body: {
        id: number,
        name: string,
        description: string,
        inventory: number,
    }
}

export interface Reservation {
    id: number,
    item: string, 
    //Email Address
    email: string,
    startDate: Date,
    endDate: Date,
    returned: boolean
}

export interface ReservationRequest extends Express.Request {
    body: {
        id: number,
        item: string, 
        email: string,
        startDate?: Date,
        endDate?: Date,
        returned: boolean
    }
}

export const createReservationTable = `
    CREATE TABLE IF NOT EXISTS reservations(
        ID SERIAL PRIMARY KEY,
        item TEXT,
        email TEXT,
        startDate DATE,
        endDate DATE,
        returned BOOLEAN
    );
`

export const createItemTable = `
    CREATE TABLE IF NOT EXISTS items(
        ID SERIAL PRIMARY KEY,
        name TEXT,
        description TEXT,
        inventory INT
    );
`