export interface Item {
    id: number,
    name: string,
    description: string,
    inventory: number,
}

export interface ItemRequest extends Express.Request{
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