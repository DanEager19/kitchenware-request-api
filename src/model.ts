export interface Item {
    id: Number,
    name: String,
    isReserved: Boolean,
    holderID: String
}
export interface Reservation {
    id: Number,
    item: String, 
    reservee: String,
    startDate: Date,
    endDate: Date,
    returned: Boolean
}