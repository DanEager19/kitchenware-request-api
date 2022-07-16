import { Controller } from '../api/controller';

const controller = new Controller();

describe('GET /reserve', () => {
    it('Should return 200', async () => {
        expect(controller.showAllReservations(req, res))
    })
});