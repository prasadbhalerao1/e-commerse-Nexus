import { Router } from 'express';
import { 
  deepHealthCheck, 
  reseedDatabase, 
  triggerCartRecoverySweep, 
  mockWebhookUpdate 
} from './systemControl.controller.js';
import { protect, restrictTo } from '../../common/middleware/auth.js';

const router = Router();

router.use(protect, restrictTo('superadmin', 'editor'));

router.get('/health', deepHealthCheck);
router.post('/seed', reseedDatabase);
router.post('/sweep', triggerCartRecoverySweep);
router.post('/webhook', mockWebhookUpdate);

export default router;
