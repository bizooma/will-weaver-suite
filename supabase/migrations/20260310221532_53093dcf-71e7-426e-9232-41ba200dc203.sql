-- Clean up empty conversation records created by widget page loads
-- These have message_count = 0 and contain no actual messages
DELETE FROM chatbot_conversations WHERE message_count = 0;