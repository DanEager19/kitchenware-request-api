import { Application } from "express";
import { Controller } from './controller'; 

export function Routes(app: Application) {
    const controller = new Controller;
    
    app.route('/reserve')
        .get(controller.showAllReservations)
        .post(controller.reserve)
        .delete(controller.cancel);

    app.route('/item/:itemId')
        .get(controller.showAllReservations)
        .post(controller.addItem)
        .put(controller.updateItem)
        .delete(controller.removeItem);
}