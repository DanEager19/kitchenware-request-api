import {Item, ReservationRequest} from './model';
import { Response } from 'express';

export function reserve(req: ReservationRequest, res: Response): String {
    const item: Item;
    if (item.isReserved) {
        res.send(`Cannot Reserve. ${req.body.reservee} has ${req.body.item} until ${req.body.endDate}.`);
    } else {
        item.isReserved = true;

    }
    return "hi";
}

export function cancel() { 

}

export function showAllReservations() {

}

export function addItem() {

}

export function listAllItems() {

}

export function updateItem() {

}

export function removeItem() {

}