"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const tickets_controller_1 = require("./tickets.controller");
describe('TicketsController', () => {
    let controller;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            controllers: [tickets_controller_1.TicketsController],
        }).compile();
        controller = module.get(tickets_controller_1.TicketsController);
    });
    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
//# sourceMappingURL=tickets.controller.spec.js.map