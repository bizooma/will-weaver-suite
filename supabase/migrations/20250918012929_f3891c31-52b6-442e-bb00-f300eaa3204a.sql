-- Update the embed code for the Amicus Edge chatbot with the correct domain and ID
UPDATE chatbots 
SET embed_code = '<!-- Amicus Edge Chatbot Widget -->
<script 
  src="https://fmcgsxdtyvssvwtxufll.supabase.co/widget.js" 
  data-amicus-chatbot-id="84d4c795-cebb-44e5-8543-8fd59f0f73d9"
  async>
</script>'
WHERE id = '84d4c795-cebb-44e5-8543-8fd59f0f73d9';