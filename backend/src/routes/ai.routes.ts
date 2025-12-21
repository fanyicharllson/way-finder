import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { validate } from '../middleware/validation.middleware';
import { aiChatSchema } from '../validators/ai-validators';

const router = Router();
const aiController = new AIController();


router.post('/chat', validate(aiChatSchema), (req, res) =>
  aiController.chat(req, res)
);


router.post('/recommend', (req, res) =>
  aiController.getRecommendation(req, res)
);

// Public travel tips
router.get('/tips', (req, res) =>
  aiController.getTravelTips(req, res)
);

export default router;
