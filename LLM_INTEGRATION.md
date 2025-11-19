# LLM Integration with Anthropic Claude

Tally now uses **Anthropic Claude 3.5 Sonnet** for intelligent message parsing instead of rigid regex patterns.

## Why LLM-Powered?

**Before (Regex):**
- Limited to predefined patterns
- Can't understand context
- Struggles with natural variations
- No learning or adaptation

**After (Claude):**
- Understands natural language
- Context-aware across messages
- Handles complex sentences
- Learns from conversation flow
- Much more flexible and accurate

## Setup

### 1. Get API Key

Visit [https://console.anthropic.com/](https://console.anthropic.com/) and create an API key.

### 2. Configure Environment

Copy the example env file:
```bash
cp server/.env.example server/.env
```

Add your API key to `server/.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

### 3. Run the Server

```bash
npm run dev
```

The system will automatically use Claude for parsing when the API key is present.

## How It Works

### Intelligent Parsing

Claude analyzes each message using **structured output** (tool calling):

```typescript
{
  isTask: boolean,              // Is this work or conversation?
  confidence: number,           // 0.0-1.0 confidence score
  action: "create" | "update",  // What action to take
  taskTitle: string,            // Extracted task description
  assigneeNames: string[],      // Who's responsible
  deadline: string,             // Natural language deadline
  workflowType: string,         // Detected workflow
  batchItems: string[],         // Multiple items if batch operation
  metadata: object,             // Finance-specific data
  reasoning: string             // Why Claude classified it this way
}
```

### Context Awareness

Claude sees the last 5 messages for context:
```typescript
conversationContext: [
  "Alice: Generated invoice for TechCorp",
  "Bob: What was the amount?",
  "Alice: $25,000",
  "Bob: Ok, I'll follow up on payment"
]
```

This helps Claude understand:
- References to previous tasks
- Follow-up questions
- Multi-turn conversations
- Implied context

### Fallback Behavior

If the API key is missing or Claude fails:
- Falls back to deterministic regex parser
- Logs a warning
- System continues to work (degraded mode)

## Examples

### Conversational Understanding

**Input:**
```
"Can you help me track the Q4 invoices?"
```

**Claude's Analysis:**
```json
{
  "isTask": true,
  "confidence": 0.85,
  "action": "create",
  "taskTitle": "Track Q4 invoices",
  "workflowType": "invoice-generation",
  "reasoning": "User is requesting help with tracking invoices, which is a clear work task"
}
```

### Context Awareness

**Conversation:**
```
Alice: Generated invoice for TechCorp
Bob: What was the amount?
Alice: $25,000
```

Claude understands that "$25,000" refers to the TechCorp invoice from earlier.

### Batch Operations

**Input:**
```
"Need to reconcile payments for Acme, TechCorp, and GlobalCo"
```

**Claude's Analysis:**
```json
{
  "isTask": true,
  "confidence": 0.95,
  "batchItems": ["Acme", "TechCorp", "GlobalCo"],
  "reasoning": "Multiple companies mentioned in a batch operation"
}
```

### Natural Language Deadlines

**Input:**
```
"Finish the budget analysis by end of next week"
```

**Claude's Analysis:**
```json
{
  "deadline": "end of next week",  // Parsed by chrono-node
  "priority": "medium",
  "reasoning": "User specified a clear deadline"
}
```

## Cost Considerations

**Claude 3.5 Sonnet Pricing:**
- Input: $3 per million tokens
- Output: $15 per million tokens

**Typical Message:**
- Prompt: ~500 tokens
- Response: ~200 tokens
- **Cost per message: ~$0.004 (less than half a cent)**

**For a team of 10 people:**
- 500 messages/day = $2/day = $60/month
- Very reasonable for enterprise use

## Monitoring

The server logs Claude's reasoning:

```bash
LLM Parse Result: {
  isTaskWorthy: true,
  confidence: 0.95,
  reasoning: 'Message describes invoice generation work with specific customer'
}
```

Watch the logs to see how Claude interprets messages.

## Benefits

1. **Natural Conversation**: Users can speak naturally
2. **Context Understanding**: Follows conversation threads
3. **Flexible**: Handles variations and edge cases
4. **Learning**: Improves with better prompts
5. **Metadata Extraction**: Pulls out amounts, dates, customer names automatically
6. **Batch Detection**: Identifies multiple items in one message
7. **Priority/Urgency**: Detects importance from tone

## Future Enhancements

- **Few-shot learning**: Train on your team's specific patterns
- **Custom workflows**: Teach Claude your specific processes
- **Multi-language**: Support for non-English teams
- **Sentiment analysis**: Detect urgency from tone
- **Smart suggestions**: Claude recommends actions based on context

---

**The chat interface is now truly conversational, not just pattern matching.** 🚀
