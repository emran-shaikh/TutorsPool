import { Router, Request, Response } from 'express';
import { aiChatService } from '../services/aiChatService';

const router = Router();

/**
 * POST /api/ai-chat/message
 * Get AI response for user message
 */
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { userId, message, conversationId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Message is required and must be a string',
      });
    }

    // Use userId from auth or generate anonymous ID
    const effectiveUserId = userId || `anonymous_${Date.now()}`;

    const response = await aiChatService.getResponse(
      effectiveUserId,
      message,
      conversationId
    );

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      error: 'Failed to get AI response',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * DELETE /api/ai-chat/conversation/:conversationId
 * Clear conversation history
 */
router.delete('/conversation/:conversationId', (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    aiChatService.clearConversation(conversationId);

    res.json({
      success: true,
      message: 'Conversation cleared',
    });
  } catch (error) {
    console.error('Clear Conversation Error:', error);
    res.status(500).json({
      error: 'Failed to clear conversation',
    });
  }
});

/**
 * GET /api/ai-chat/history/:conversationId
 * Get conversation history
 */
router.get('/history/:conversationId', (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const history = aiChatService.getConversationHistory(conversationId);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Get History Error:', error);
    res.status(500).json({
      error: 'Failed to get conversation history',
    });
  }
});

export default router;

