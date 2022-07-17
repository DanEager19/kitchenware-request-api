import { Application } from "express";
import { Client } from "pg";
import { Controller } from './controller'; 

export const Routes = (client: Client, app: Application) => {
    const controller = new Controller(client);

    app.route('/reserve')
        .get(controller.showAllReservations)
        .post(controller.reserve)

    app.route('/return')
        .post(controller.return);
    
    app.route('/items')
        .get(controller.listAllItems)
        .post(controller.addItem)
        .put(controller.updateItem)
        .delete(controller.removeItem);
}