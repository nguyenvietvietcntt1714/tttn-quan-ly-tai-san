"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const tickets_service_1 = require("./tickets.service");
describe('TicketsService', () => {
    let service;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [tickets_service_1.TicketsService],
        }).compile();
        service = module.get(tickets_service_1.TicketsService);
    });
    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
//# sourceMappingURL=tickets.service.spec.js.map