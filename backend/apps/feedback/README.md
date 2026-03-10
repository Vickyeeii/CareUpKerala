# Feedback & Ratings Module

## Purpose
Allows NRI users to submit post-service feedback and ratings for completed bookings. Enables Admin users to view all feedback for service quality analysis.

## Feedback vs Complaints

### Feedback
- **Purpose**: Post-service evaluation and rating
- **Timing**: After booking completion
- **Nature**: Constructive assessment of service quality
- **Scope**: Overall experience rating (1-5 stars) + optional comments
- **Action**: Used for quality improvement and analytics
- **Visibility**: NRI views own, Admin views all

### Complaints
- **Purpose**: Report issues or problems during service
- **Timing**: During or after service (any booking status)
- **Nature**: Problem-focused, requires resolution
- **Scope**: Specific issue with title, description, and status tracking
- **Action**: Requires admin investigation and response
- **Visibility**: NRI views own, Admin manages all with status updates

## Why Feedback Is Immutable
- **Data Integrity**: Preserves authentic user sentiment at time of submission
- **Analytics Accuracy**: Historical ratings remain unchanged for trend analysis
- **Audit Trail**: Maintains reliable record of service quality over time
- **Prevents Gaming**: Users cannot repeatedly change ratings
- **Best Practice**: Standard in review systems (similar to app store reviews)

## One-Feedback-Per-Booking Rule
- Each booking can receive exactly one feedback submission
- Enforced via unique constraint on booking_id
- Prevents duplicate ratings that could skew analytics
- Encourages thoughtful, comprehensive feedback
- If user wants to add more input, they can use the complaints module

## Workflow
1. NRI user completes a booking (status = "completed")
2. NRI user submits feedback with rating (1-5) and optional comment
3. System validates booking ownership and completion status
4. Feedback is permanently stored (immutable)
5. Admin can view all feedback for analysis

## API Endpoints
- `POST /feedback` - NRI submits feedback for completed booking
- `GET /feedback/me` - NRI views own feedback history
- `GET /feedback` - Admin views all feedback

## Database Design
- Unique constraint on booking_id ensures one feedback per booking
- No foreign key to nri_users table (follows Notification/Complaint pattern)
- Rating validation enforced at both schema (Pydantic) and service layers
