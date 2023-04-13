import { Test, TestingModule } from '@nestjs/testing';

import { BullModule } from '@nestjs/bull';

import { NodemailerService, QUEUE_EMAIL } from './nodemailer.service';

describe('NodemailerService', () => {
    let service: NodemailerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                BullModule.registerQueue({
                    name: QUEUE_EMAIL,
                }),
            ],
            providers: [NodemailerService],
        }).compile();

        service = module.get<NodemailerService>(NodemailerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
