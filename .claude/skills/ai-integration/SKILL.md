---
name: ai-integration
description: Use this skill when the conversation requires integrating AI services (such as image analysis, text generation, intelligent recognition, etc.) to generate integration code based on AI gateway or API
---

# AI Integration

## Before Starting - Supabase Integration Check

**CRITICAL**: AI Integration requires Supabase as the backend (uses Supabase Edge Functions). Always check Supabase integration status before proceeding:


**Step 1: Check Supabase Integration**

Check if Supabase is already integrated:
- Look for `src/lib/supabase.ts` file
- Check `.env` file for Supabase environment variables:
  - `VITE_SUPABASE_PROJECT_ID`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_URL`

**Step 2: Handle Based on Status**

**If Supabase is already integrated** (supabase.ts exists with valid configuration):
- ✓ Proceed with Resend integration
- Inform user: "✓ Supabase is integrated. Proceeding with Resend setup."

**If Supabase is NOT integrated** (no supabase.ts or missing environment variables):
- ❌ Stop immediately
- Inform user: "⚠️ Supabase integration is required before setting up Resend. Resend email functions run on Supabase Edge Functions."
- Suggest: "Please enable Supabase first by saying 'Enable Cloud' or use the supabase-integration skill."

---

## Overview
  
When users need to integrate AI functionality into their projects, use this skill to generate standardized AI service integration code. Supports multiple AI capabilities: vision recognition, text analysis, content generation, etc.

**Tech Stack:** Supabase Functions (Deno + TypeScript) + Supabase Client

**Generated Code Structure:**
- Backend: `supabase/functions/<function-name>/index.ts` (Supabase Edge Function)
- Frontend: Direct invocation using `supabase.functions.invoke()` or API (supports both standard and streaming responses)

**Core Principles:** Generate reliable, scalable, and maintainable AI integration code

**Announce at the start:** "I'm using the ai-integration skill to generate AI integration code for you."

## When to Use This Skill

```
Trigger Conditions (use if any are met):
- User explicitly mentions "AI analysis", "intelligent recognition", "image recognition"
- Need to call large language model APIs (GPT, Claude, Gemini, etc.)
- Need visual AI capabilities (OCR, object recognition, image analysis)
- Need text AI capabilities (translation, summarization, sentiment analysis)
- Need image generation capabilities (text-to-image, AI art generation) 🎨
- User asks "how to integrate AI"
```


## Model Selection Guide

**IMPORTANT:** Use `gemini-3-pro-image-preview` model for image generation, and `google/gemini-2.5-flash` model for text/image analysis.

## AI Integration Architecture Patterns

### 1. Backend API Pattern (Recommended for Production)

**Use Cases:**
- Need rate limiting and usage control
- Need data preprocessing or postprocessing
- Need caching or logging

**Architecture:**
```
Frontend → Backend API → AI Gateway/Service → AI Provider
```

### 2. Client Direct Connection Pattern

**Use Cases:**
- Prototyping or demos
- Scenarios requiring extremely high real-time performance

**Architecture:**
```
Frontend → AI Gateway/Service → AI Provider
```

## Standard Code Templates

### Backend API Endpoint Template (Supabase Functions)

**File Location:** `supabase/functions/<function-name>/index.ts`

Examples:
- `supabase/functions/ai-analysis/index.ts`
- `supabase/functions/ai-process/index.ts`
- `supabase/functions/ai-service/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// Request interface
interface AIRequest {
  input: string | object;
  options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const requestData: AIRequest = await req.json();

    // Validate input
    if (!requestData.input) {
      return new Response(
        JSON.stringify({ error: "Missing required input parameter" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    console.log("Processing AI request...");

    // Call AI Gateway API
    const response = await fetch("https://www.needware.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: requestData.options?.model || "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a professional AI assistant. Provide accurate and helpful responses based on user needs."
          },
          {
            role: "user",
            content: typeof requestData.input === "string" 
              ? requestData.input 
              : JSON.stringify(requestData.input)
          }
        ],
        temperature: requestData.options?.temperature || 0.7,
        max_tokens: requestData.options?.maxTokens || 1000,
      }),
    });

    // Handle error responses
    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI service error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Request rate too high, please try again later" }),
          { 
            status: 429, 
            headers: { "Content-Type": "application/json", ...corsHeaders } 
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI service quota exhausted" }),
          { 
            status: 402, 
            headers: { "Content-Type": "application/json", ...corsHeaders } 
          }
        );
      }
      
      throw new Error(`AI processing failed: ${errorText}`);
    }

    // Parse AI response
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No AI response generated");
    }

    console.log("AI processing completed");

    return new Response(
      JSON.stringify({ 
        success: true,
        result: content,
        model: requestData.options?.model || "google/gemini-2.5-flash"
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error("Function execution error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
};

serve(handler);
```

### Frontend Usage Template (TypeScript)

**Prerequisites:** Supabase Client configured in `src/lib/supabase.ts`

```typescript
// src/lib/supabase.ts (if not already present)
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

**Direct Usage in React Component:**

```typescript
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function ImageAnalyzer() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const handleAnalyze = async (imageData: string) => {
    setIsAnalyzing(true);

    try {
      // Directly invoke Supabase Function
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: { 
          image: imageData,
          prompt: "Please analyze this image in detail"
        }
      });

      // Check invocation error
      if (error) {
        throw error;
      }

      // Check business error in response
      if (data?.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.analysis);
      toast.success("Analysis completed");
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ... component render
}
```

**Text Analysis Example:**

```typescript
const handleTextAnalysis = async (text: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-text-analysis', {
      body: { 
        text,
        analysisType: 'summary'
      }
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    // Use data.result
    console.log(data.result);
  } catch (error) {
    console.error("Text analysis error:", error);
  }
};
```

### Streaming Chat Template (Frontend)

**Use Case:** Real-time streaming responses for chat applications

**Type Definitions and Streaming Function:**

```typescript
// Define message type
export type Message = { 
  role: "user" | "assistant"; 
  content: string;
  id: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

export async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: Message[];
  onDelta: (deltaText: string) => void;
  onDone: () => void;
  onError: (error: string) => void;
}) {
  try {
    const resp = await fetch(CHAT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ 
        messages: messages.map(m => ({ role: m.role, content: m.content })) 
      }),
    });

    if (!resp.ok) {
      const errorData = await resp.json().catch(() => ({}));
      if (resp.status === 429) {
        onError(errorData.error || "Request rate too high, please try again later");
        return;
      }
      if (resp.status === 402) {
        onError(errorData.error || "Insufficient quota, please recharge to continue");
        return;
      }
      onError(errorData.error || "Connection failed, please retry");
      return;
    }

    if (!resp.body) {
      onError("Unable to get response stream");
      return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let textBuffer = "";
    let streamDone = false;

    while (!streamDone) {
      const { done, value } = await reader.read();
      if (done) break;
      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") {
          streamDone = true;
          break;
        }

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch {
          textBuffer = line + "\n" + textBuffer;
          break;
        }
      }
    }

    // Final flush
    if (textBuffer.trim()) {
      for (let raw of textBuffer.split("\n")) {
        if (!raw) continue;
        if (raw.endsWith("\r")) raw = raw.slice(0, -1);
        if (raw.startsWith(":") || raw.trim() === "") continue;
        if (!raw.startsWith("data: ")) continue;
        const jsonStr = raw.slice(6).trim();
        if (jsonStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content as string | undefined;
          if (content) onDelta(content);
        } catch { /* ignore */ }
      }
    }

    onDone();
  } catch (e) {
    console.error("Stream chat error:", e);
    onError("Network connection failed, please check your network and retry");
  }
}
```

**React Component Usage Example:**

```typescript
import { useState } from 'react';
import { streamChat, Message } from '@/lib/streamChat';
import { toast } from 'sonner';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentResponse, setCurrentResponse] = useState("");

  const handleSendMessage = async (userMessage: string) => {
    // Add user message
    const newMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: userMessage,
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Prepare assistant message placeholder
    const assistantMessageId = crypto.randomUUID();
    setCurrentResponse("");
    setIsStreaming(true);

    await streamChat({
      messages: [...messages, newMessage],
      onDelta: (deltaText) => {
        setCurrentResponse(prev => prev + deltaText);
      },
      onDone: () => {
        setMessages(prev => [...prev, {
          id: assistantMessageId,
          role: "assistant",
          content: currentResponse,
        }]);
        setCurrentResponse("");
        setIsStreaming(false);
      },
      onError: (error) => {
        toast.error(error);
        setIsStreaming(false);
        setCurrentResponse("");
      },
    });
  };

  // ... component render
}
```

### Image Generation Specialized Template

**CRITICAL: Use `gemini-3-pro-image-preview` model for image generation tasks.**

Use this template when users need to generate images from text descriptions.

**File Location:** `supabase/functions/generate-image/index.ts`

```typescript
// supabase/functions/generate-image/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// Request interface
interface ImageGenerationRequest {
  prompt: string;
  options?: {
    size?: string;
    quality?: string;
    style?: string;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const { prompt, options }: ImageGenerationRequest = await req.json();

    // Validate input
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "No prompt provided" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    console.log("Generating image with prompt:", prompt);

    // Call AI Gateway API with image generation model
    const response = await fetch("https://www.needware.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-3-pro-image-preview", // 🎨 Use image generation model
        messages: [
          {
            role: "system",
            content: "You are a professional image generation assistant. Generate high-quality images based on user descriptions."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI service error:", response.status, errorText);
      throw new Error(`Image generation failed: ${errorText}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      throw new Error("No image generated");
    }

    console.log("Image generation completed");

    return new Response(
      JSON.stringify({ 
        success: true,
        imageUrl: result, // Image URL or base64 data
        prompt: prompt,
        model: "gemini-3-pro-image-preview"
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error("Image generation error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
};

serve(handler);
```

**Frontend Usage Example:**

```typescript
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export function ImageGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { 
          prompt,
          options: {
            size: '1024x1024',
            quality: 'high'
          }
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setGeneratedImage(data.imageUrl);
      toast.success("图片生成成功！");
    } catch (error) {
      console.error("Image generation error:", error);
      toast.error(error instanceof Error ? error.message : "图片生成失败");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      {generatedImage && <img src={generatedImage} alt="Generated" />}
      {/* UI components */}
    </div>
  );
}
```

### Image Analysis Specialized Template

Use this template when users need image analysis functionality.

**File Location:** `supabase/functions/analyze-image/index.ts`

```typescript
// supabase/functions/analyze-image/index.ts
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

// Request interface
interface ImageAnalysisRequest {
  image: string;
  prompt?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const { image, prompt }: ImageAnalysisRequest = await req.json();

    // Validate input
    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        { 
          status: 400, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    console.log("Analyzing image...");

    // Call AI Gateway API
    const response = await fetch("https://www.needware.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash", // Model with vision support
        messages: [
          {
            role: "system",
            content: "You are a professional image analysis expert. Please analyze image content in detail and provide accurate descriptions."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt || "Please analyze the content of this image in detail"
              },
              {
                type: "image_url",
                image_url: {
                  url: image // Supports data:image/... or https://...
                }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI service error:", response.status, errorText);
      throw new Error(`Image analysis failed: ${errorText}`);
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    // Try to parse structured JSON from response
    let structuredResult;
    try {
      const jsonMatch = analysis.match(/```json\n?([\s\S]*?)\n?```/) || analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[1] || jsonMatch[0];
        structuredResult = JSON.parse(jsonStr);
      }
    } catch (parseError) {
      console.log("Response is not JSON format, returning raw text");
      structuredResult = { analysis };
    }

    console.log("Image analysis completed");

    return new Response(
      JSON.stringify({ 
        success: true,
        result: structuredResult || analysis,
        model: "google/gemini-2.5-flash"
      }),
      { 
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error("Image analysis error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      }
    );
  }
};

serve(handler);
```

## Implementation Checklist

When users request AI integration, follow these steps:

### Step 1: Requirements Analysis
- [ ] Confirm AI functionality type (image analysis/image generation/text/speech/other)
- [ ] If image generation: Use `gemini-3-pro-image-preview` model 🎨
- [ ] Confirm input/output formats
- [ ] Confirm if structured response is needed
- [ ] Confirm performance requirements (response time, concurrency)

### Step 2: Choose Architecture
- [ ] Backend API pattern ✅ Recommended (more secure)
- [ ] Client direct connection pattern

### Step 3: Choose AI Provider
- [ ] Needware AI Gateway (out-of-the-box, multi-model support)
- [ ] OpenAI (GPT series)
- [ ] Anthropic (Claude series)
- [ ] Google (Gemini series)
- [ ] Other custom APIs

### Step 4: Install Dependencies
If @supabase/supabase-js is not present, install it

**Install Supabase Client for Frontend:**
```bash
pnpm add @supabase/supabase-js
```

### Step 5: Implement Code
- [ ] Create Supabase Function (path: `supabase/functions/<function-name>/index.ts`)
- [ ] Create Supabase Client configuration (path: `src/lib/supabase.ts`)
- [ ] Use `supabase.functions.invoke()` directly in components
- [ ] Add error handling (check both `error` and `data.error`)
- [ ] Add request logging and monitoring

**Supabase Function Naming Convention:**
- Use kebab-case naming: `ai-service`, `ai-process`, `ai-handler`, etc.
- Function names should clearly express functionality
- Each feature gets its own independent function directory


## Best Practices

### Security
- ✅ Implement request rate limiting
- ✅ Validate and sanitize user input
- ✅ Add request size limits

### Cost Control
- ✅ Choose cost-effective models
- ✅ Optimize prompt length
- ✅ Limit max_tokens parameter
- ✅ Implement usage monitoring and alerts
- ✅ Consider using batch processing to reduce costs

## Error Handling Checklist

```typescript
// Standard error handling pattern
const handleAIError = (error: any, statusCode: number) => {
  const errorMap: Record<number, string> = {
    400: "Invalid request parameters",
    401: "Authentication failed",
    402: "Insufficient account balance or quota exhausted",
    403: "No permission to access this API",
    404: "API endpoint does not exist",
    429: "Too many requests, please try again later",
    500: "AI service internal error",
    503: "AI service temporarily unavailable",
  };

  return {
    error: errorMap[statusCode] || "Unknown error",
    statusCode,
    originalError: error?.message,
    timestamp: new Date().toISOString(),
  };
};
```

## When NOT to Use This Skill

❌ **Do not use in the following situations:**
- Simple frontend UI components (not involving AI)
- Pure data processing logic (no AI inference needed)
- Static content display
- User is just asking about AI concepts (just provide explanation)

## Final Reminders

**After completing AI integration, must:**
1. ✅ Test all error scenarios
2. ✅ Check response format correctness
3. ✅ Test edge cases (extra-long input, special characters, etc.)
4. ✅ Confirm smooth user experience
5. ✅ Add usage documentation and examples

**Remember: AI integration is not "set it and forget it", requires continuous monitoring and optimization.**

