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
  business: "高端商务正装，深色西装，白色衬衫，领带",
  casual: "时尚休闲装，牛仔裤，简约T恤或休闲衬衫",
  street: "潮流街头风格，oversized卫衣，运动鞋，棒球帽",
  elegant: "优雅晚礼服，华丽典雅的正式礼服",
  sporty: "运动健身装，运动服，运动鞋",
  vintage: "复古风格服装，怀旧经典款式",
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

    const prompt = `Edit this photo: Change the person's clothing to ${styleDescription}.
Keep the person's face, skin tone, hair, pose, and expression exactly the same.
Only change the clothes and accessories.
Output the edited image directly.`;

    const response = await fetch("https://www.needware.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        modalities: ["text", "image"],
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
    console.log("AI response:", JSON.stringify(data).slice(0, 1000));

    let generatedImage: string | null = null;

    // Check for image in content_parts (Gemini format)
    const message = data.choices?.[0]?.message;

    if (message?.content_parts && Array.isArray(message.content_parts)) {
      for (const part of message.content_parts) {
        if (part.inline_data?.data) {
          const mimeType = part.inline_data.mime_type || "image/png";
          generatedImage = `data:${mimeType};base64,${part.inline_data.data}`;
          break;
        }
      }
    }

    // Check content array format
    if (!generatedImage && Array.isArray(message?.content)) {
      for (const item of message.content) {
        if (item.type === "image_url" && item.image_url?.url) {
          generatedImage = item.image_url.url;
          break;
        }
        if (item.type === "image" && item.data) {
          generatedImage = `data:image/png;base64,${item.data}`;
          break;
        }
        if (item.inline_data?.data) {
          const mimeType = item.inline_data.mime_type || "image/png";
          generatedImage = `data:${mimeType};base64,${item.inline_data.data}`;
          break;
        }
      }
    }

    // Check for base64 in content string
    if (!generatedImage && typeof message?.content === "string" && message.content) {
      if (message.content.startsWith("data:image")) {
        generatedImage = message.content;
      } else if (message.content.length > 1000 && /^[A-Za-z0-9+/=\s]+$/.test(message.content)) {
        generatedImage = `data:image/png;base64,${message.content.replace(/\s/g, '')}`;
      }
    }

    if (!generatedImage) {
      const reasoning = message?.reasoning;
      console.error("No image in response. Reasoning:", reasoning?.slice(0, 500));

      return new Response(
        JSON.stringify({
          error: "AI 正在处理但未能生成图片，请重试",
          debug: reasoning ? reasoning.slice(0, 100) : "无响应内容"
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
