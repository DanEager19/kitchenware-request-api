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
        ID int NOT NULL PRIMARY KEY AUTO_INCREMENT,
        item char,
        reservee char,
        startDate date,
        endDate date,
        returned boolean
    );
`

export const createItemTable = `
    CREATE TABLE IF NOT EXISTS items(
        ID int NOT NULL PRIMARY KEY AUTO_INCREMENT,
        name char,
        inventory int,
        holderID int
    );
`