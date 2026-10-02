import { Request, Response, NextFunction } from 'express';
import { askScholarshipAssistant } from '../services/ai/assistant.service';

export async function chat(req: Request, res: Response, next: NextFunction) {
  try {
    const { message, scholarship_id, conversation_history } = req.body;
    const response = await askScholarshipAssistant({
      message,
      scholarshipId: scholarship_id,
      history: conversation_history,
    });

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
}
