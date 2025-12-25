# A2A Agent Route Implementation

This document explains how to use the A2A (Agent-to-Agent) route implementation in your Naija Weather Bros project.

## Overview

The A2A agent route provides a JSON-RPC 2.0 compliant interface for interacting with your Mastra agents. This allows external systems to communicate with your weather agent using a standardized protocol.

## Implementation Details

### Files Created/Modified

1. **`src/mastra/routes/a2a-agent-route.ts`** - The main A2A route implementation
2. **`src/mastra/index.ts`** - Updated to export the A2A route
3. **`src/server.ts`** - Integrated the A2A route into the Express server
4. **`src/test-a2a.js`** - Test file demonstrating usage
5. **`package.json`** - Added test script

### API Endpoint

```
POST /a2a/agent/:agentId
```

### Request Format

The route expects a JSON-RPC 2.0 request with the following structure:

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "generate",
  "params": {
    "message": {
      "role": "user",
      "parts": [{
        "kind": "text",
        "text": "What's the weather like in Lagos?"
      }],
      "messageId": "msg-123"
    },
    "taskId": "task-123",
    "contextId": "ctx-123"
  }
}
```

#### Alternative with Multiple Messages

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "generate",
  "params": {
    "messages": [
      {
        "role": "user",
        "parts": [{"kind": "text", "text": "Hi, how's the weather?"}],
        "messageId": "msg-1"
      },
      {
        "role": "agent",
        "parts": [{"kind": "text", "text": "The weather is sunny today!"}],
        "messageId": "msg-2"
      }
    ],
    "taskId": "task-456",
    "contextId": "ctx-456"
  }
}
```

### Response Format

The route returns a JSON-RPC 2.0 compliant response:

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": {
    "id": "task-123",
    "contextId": "ctx-123",
    "status": {
      "state": "completed",
      "timestamp": "2023-11-05T19:45:00.000Z",
      "message": {
        "messageId": "response-msg-id",
        "role": "agent",
        "parts": [{"kind": "text", "text": "Agent response here"}],
        "kind": "message"
      }
    },
    "artifacts": [
      {
        "artifactId": "artifact-uuid",
        "name": "weatherAgentResponse",
        "parts": [{"kind": "text", "text": "Agent response here"}]
      }
    ],
    "history": [
      {
        "kind": "message",
        "role": "user",
        "parts": [{"kind": "text", "text": "User message"}],
        "messageId": "user-msg-id",
        "taskId": "task-123"
      },
      {
        "kind": "message",
        "role": "agent",
        "parts": [{"kind": "text", "text": "Agent response"}],
        "messageId": "agent-msg-id",
        "taskId": "task-123"
      }
    ],
    "kind": "task"
  }
}
```

## Usage Examples

### 1. Start the Server

```bash
npm run server
```

The server will start on port 3000 and you'll see:
```
🌤️  Naija Weather Bros API server running on port 3000
🤖 A2A Agent route: http://localhost:3000/a2a/agent/weatherAgent
```

### 2. Test with the Provided Test Script

```bash
npm run test:a2a
```

This will run two test cases:
- Simple message interaction
- Conversation with history

### 3. Manual Testing with curl

```bash
curl -X POST http://localhost:3000/a2a/agent/weatherAgent \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": "test-123",
    "method": "generate",
    "params": {
      "message": {
        "role": "user",
        "parts": [{
          "kind": "text",
          "text": "What is the weather like in Lagos today?"
        }],
        "messageId": "msg-123"
      },
      "taskId": "task-123",
      "contextId": "ctx-123"
    }
  }'
```

## Error Handling

The route handles various error scenarios:

### Invalid JSON-RPC Format
```json
{
  "jsonrpc": "2.0",
  "id": null,
  "error": {
    "code": -32600,
    "message": "Invalid Request: jsonrpc must be \"2.0\" and id is required"
  }
}
```

### Agent Not Found
```json
{
  "jsonrpc": "2.0",
  "id": "request-id",
  "error": {
    "code": -32602,
    "message": "Agent 'unknownAgent' not found"
  }
}
```

### Internal Error
```json
{
  "jsonrpc": "2.0",
  "id": null,
  "error": {
    "code": -32603,
    "message": "Internal error",
    "data": {"details": "Error details here"}
  }
}
```

## Integration with Your Weather Agent

The A2A route is specifically configured to work with your `weatherAgent`. When you send requests to `/a2a/agent/weatherAgent`, it will:

1. Parse the JSON-RPC request
2. Convert A2A message format to Mastra's internal format
3. Execute the weather agent with the provided messages
4. Convert the agent's response back to A2A format
5. Include any tool results as artifacts
6. Maintain conversation history

## Benefits

1. **Standardized Interface**: JSON-RPC 2.0 provides a consistent way to interact with agents
2. **Agent-to-Agent Communication**: Enables different AI systems to communicate with your weather agent
3. **Tool Integration**: Automatically includes tool results in the response
4. **Conversation History**: Maintains context across multiple interactions
5. **Error Handling**: Comprehensive error reporting with standard error codes

## Next Steps

1. Test the route with various weather queries
2. Integrate with external systems that need to access your weather agent
3. Extend to support multiple agents if needed
4. Add authentication/authorization if required for production use