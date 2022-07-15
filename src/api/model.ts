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