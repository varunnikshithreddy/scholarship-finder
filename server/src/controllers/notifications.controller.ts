import { Request, Response, NextFunction } from 'express';
import * as notifService from '../services/notifications.service';

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const list = await notifService.getNotifications(req.user!.id);
    res.json({
      success: true,
      data: list,
    });
  } catch (error) {
    next(error);
  }
}

export async function markRead(req: Request, res: Response, next: NextFunction) {
  try {
    await notifService.markNotificationRead(req.user!.id, req.params.id);
    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
}

export async function markAllRead(req: Request, res: Response, next: NextFunction) {
  try {
    await notifService.markAllNotificationsRead(req.user!.id);
    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
}

export async function getPreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const prefs = await notifService.getNotificationPreferences(req.user!.id);
    res.json({
      success: true,
      data: prefs,
    });
  } catch (error) {
    next(error);
  }
}

export async function updatePreferences(req: Request, res: Response, next: NextFunction) {
  try {
    const updated = await notifService.updateNotificationPreferences(req.user!.id, req.body);
    res.json({
      success: true,
      data: updated,
      message: 'Notification preferences updated',
    });
  } catch (error) {
    next(error);
  }
}
