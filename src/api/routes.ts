import { Application } from "express";
import { Controller } from './controller'; 

export function Routes(app: Application) {
    const controller = new Controller;

    app.route('/reserve')
        .get(controller.showAllReservations)
        .post(controller.reserve)
        .delete(controller.cancel);

    app.route('/items')
        .get(controller.listAllItems)
        .post(controller.addItem);

    app.route('/items/:id')
        .put(controller.updateItem)
        .delete(controller.removeItem);
}