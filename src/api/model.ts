export interface Item {
    id: Number,
    name: String,
    isReserved: Boolean,
    holderId: String
}

export interface ItemRequest extends Express.Request{
    body: {
        id: Number,
        name: String,
        isReserved: Boolean,
        holderId: String
    }
}

export interface Reservation {
    id: Number,
    item: String, 
    //Email Address
    reservee: String,
    startDate: Date,
    endDate: Date,
    returned: Boolean
}

export interface ReservationRequest extends Express.Request {
    body: {
        id: Number,
        item: String, 
        reservee: String,
        startDate: Date,
        endDate: Date,
        returned: Boolean
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
        isReserved boolean,
        holderID int
    );
`