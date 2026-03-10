

## Problem Analysis

Two issues found:

1. **Empty conversations flooding the dashboard**: `widget.js` calls `logWidgetLoad()` on every page load, which POSTs to `widget-config`. That endpoint creates a new `chatbot_conversations` row with no messages — just `{ origin, timestamp }`. Every visitor page load = one empty conversation record.

2. **Real chats not logging messages**: When `chatbot-response` later tries to update the conversation, the initial `conversation_data` is `{ origin, timestamp }` (no `messages` array). The code reads `conversation_data?.messages || []` which works, but the real issue is the `logWidgetLoad()` creates a conversation record *before* any chat happens, and then `chatbot-response` creates a *second* conversation with the same session_id if the upsert logic doesn't match correctly.

## Plan

### 1. Fix `widget-config` POST handler (stop creating empty conversations)
- Remove the `chatbot_conversations` insert from the POST handler in `widget-config/index.ts`
- Instead, only log to the `widget_requests` table (which is the proper analytics table for page loads)
- This stops the flood of empty conversation records

### 2. Fix `chatbot-response` conversation logging
- Ensure the conversation is created on the first message if it doesn't exist, with a proper `{ messages: [...] }` structure
- This is already mostly correct, but verify the upsert logic handles the case where `logWidgetLoad` previously created a row with mismatched `conversation_data`

### 3. Clean up existing empty conversations
- Run a one-time SQL cleanup to delete conversations with `message_count = 0` and no actual messages

### Files Changed
- `supabase/functions/widget-config/index.ts` — remove conversation insert from POST, log to `widget_requests` instead
- `supabase/functions/chatbot-response/index.ts` — no changes needed (already handles create/update correctly once duplicates stop)
- Database migration — delete existing empty conversations

