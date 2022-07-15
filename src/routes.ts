import { Application } from "express";

export function Routes(app: Application) {
    app.route('/reserve')
        .get()
        .post()
    app.route('/cancel')
        .post()
}