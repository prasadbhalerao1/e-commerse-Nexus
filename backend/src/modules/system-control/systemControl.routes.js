import { Router } from 'express';
import { 
  deepHealthCheck, 
  reseedDatabase, 
  triggerCartRecoverySweep, 
  mockWebhookUpdate 
} from './systemControl.controller.js';

const router = Router();

router.get('/health', deepHealthCheck);
router.post('/seed', reseedDatabase);
router.post('/sweep', triggerCartRecoverySweep);
router.post('/webhook', mockWebhookUpdate);

export default router;
