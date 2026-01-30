import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface VirtualTryOnRequest {
  image: string;
  style: string;
  customPrompt?: string;
}

const stylePrompts: Record<string, string> = {
  business: "穿着高端商务正装，深色西装，白色衬衫，领带",
  casual: "穿着时尚休闲装，牛仔裤，简约T恤或休闲衬衫",
  street: "穿着潮流街头风格，oversized卫衣，运动鞋，棒球帽",
  elegant: "穿着优雅晚礼服，华丽典雅的正式礼服",
  sporty: "穿着运动健身装，运动服，运动鞋",
  vintage: "穿着复古风格服装，怀旧经典款式",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders
    });
  }

  try {
    const { image, style, customPrompt }: VirtualTryOnRequest = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: "请上传图片" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!style) {
      return new Response(
        JSON.stringify({ error: "请选择服装风格" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Processing virtual try-on request, style:", style);

    const styleDescription = stylePrompts[style] || customPrompt || "时尚现代的服装";

    const prompt = `请根据这张人物照片，生成一张该人物${styleDescription}的全新图片。

要求：
1. 保持人物面部特征、肤色、发型完全一致
2. 只改变服装和配饰
3. 保持自然的姿势和表情
4. 服装要符合人物体型，穿着效果自然
5. 整体风格协调，光线和背景要与原图和谐
6. 生成高质量、逼真的换装效果图

请直接生成图片，不需要文字说明。`;

    const response = await fetch("https://www.needware.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: image
              }
            ]
          }
        ],
        temperature: 0.8,
        max_tokens: 8192,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI service error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "请求过于频繁，请稍后再试" }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 服务配额已用尽" }),
          { status: 402, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Parse error message
      let errorMessage = "AI 服务暂时不可用";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
      } catch {
        if (errorText) errorMessage = errorText.slice(0, 200);
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const data = await response.json();
    console.log("AI response structure:", JSON.stringify(data, null, 2).slice(0, 500));

    // Extract image from various possible response formats
    let generatedImage: string | null = null;

    // Format 1: content_parts with inline_data (Gemini native format)
    const contentParts = data.choices?.[0]?.message?.content_parts;
    if (contentParts && Array.isArray(contentParts)) {
      for (const part of contentParts) {
        if (part.inline_data?.data) {
          const mimeType = part.inline_data.mime_type || "image/png";
          generatedImage = `data:${mimeType};base64,${part.inline_data.data}`;
          break;
        }
        if (part.type === "image" && part.data) {
          generatedImage = `data:image/png;base64,${part.data}`;
          break;
        }
      }
    }

    // Format 2: content as array (OpenAI compatible format)
    const content = data.choices?.[0]?.message?.content;
    if (!generatedImage && Array.isArray(content)) {
      for (const item of content) {
        if (item.type === "image_url" && item.image_url?.url) {
          generatedImage = item.image_url.url;
          break;
        }
        if (item.type === "image" && item.data) {
          generatedImage = `data:image/png;base64,${item.data}`;
          break;
        }
      }
    }

    // Format 3: content as base64 string directly
    if (!generatedImage && typeof content === "string") {
      if (content.startsWith("data:image")) {
        generatedImage = content;
      } else if (content.match(/^[A-Za-z0-9+/=]+$/)) {
        // Looks like base64
        generatedImage = `data:image/png;base64,${content}`;
      }
    }

    if (!generatedImage) {
      console.error("Could not extract image from response:", JSON.stringify(data).slice(0, 1000));
      return new Response(
        JSON.stringify({
          error: "AI 未能生成图片，请重试或尝试其他照片",
          debug: typeof content === "string" ? content.slice(0, 200) : "No text content"
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Virtual try-on completed successfully");

    return new Response(
      JSON.stringify({
        success: true,
        image: generatedImage,
        style: style
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: any) {
    console.error("Virtual try-on error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "换装失败，请重试" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
