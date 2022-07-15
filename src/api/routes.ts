import { Application } from "express";
import controller = require('./controller');

export function Routes(app: Application) {
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