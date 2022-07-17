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
    itemName: string,
    itemId: number, 
    email: string,
    returned: boolean
}

export interface ReservationRequest extends Express.Request {
    body: {
        id: number,
        itemName: string,
        itemId: number, 
        email: string,
        returned: boolean
    }
}

export const createReservationTable = `
    CREATE TEMP TABLE IF NOT EXISTS reservations(
        ID SERIAL PRIMARY KEY,
        itemName TEXT,
        itemId INT,
        email TEXT,
        startDate DATE,
        endDate DATE,
        returned BOOLEAN
    );
`

export const createItemTable = `
    CREATE TEMP TABLE IF NOT EXISTS items(
        ID SERIAL PRIMARY KEY,
        name TEXT,
        description TEXT,
        inventory INT
    );
`