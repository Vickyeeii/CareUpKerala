# Notifications Module

## Purpose
In-app notification system that stores notification records for NRI users and Admins. Allows users to view their notifications and mark them as read.

## Features
- Store notifications with title, message, and optional related entity references
- Users can view their own notifications (filtered by user_id and role)
- Users can mark notifications as read
- Notifications are ordered by creation time (newest first)

## Read/Unread Logic
- All notifications start with `is_read = false`
- Users can mark individual notifications as read via PUT endpoint
- Users can only mark their own notifications as read
- The `is_read` flag is the only mutable field

## Storage Design
Notifications are stored in the database rather than pushed in real-time because:
- Provides persistent notification history
- Users can view notifications at any time
- Simpler implementation without WebSocket/SSE complexity
- Supports future features like notification preferences and filtering

## Access Control
- **NRI**: View own notifications, mark as read
- **Admin**: View own notifications, mark as read
- **Companion**: No access
- **Guest**: No access

## Internal Use
The `create_notification()` service function is for internal use only. Other modules (bookings, payments, care_feed) can call it to generate notifications for users.

## API Endpoints
- `GET /notifications` - Get all notifications for current user
- `PUT /notifications/{notification_id}/read` - Mark notification as read

## Database Design
No foreign key constraints to user tables (similar to RefreshToken pattern) to avoid polymorphic FK complexity across multiple user types.
