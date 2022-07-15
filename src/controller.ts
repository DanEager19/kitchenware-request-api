import {Item, Reservation} from './model';

export class Controller {
    constructor() {}

    reserve(req: Reservation): String {
        const item: Item;
        if (item.isReserved) {
            return `Cannot Reserve. ${req.reservee} has ${req.item} until ${req.endDate}.`
        } else {
            item.isReserved = true;
            sendEmail("Reciept")
        }
        return "hi";
    }

    cancel() { 

    }

    showAllReservations() {

    }

    addItem() {

    }

    listAllItems() {

    }

    updateItem() {

    }

    remoteItem() {

    }
}