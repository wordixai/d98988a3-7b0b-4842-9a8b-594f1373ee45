import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

interface VirtualTryOnRequest {
  image: string; // base64 image
  style: string; // clothing style
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
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    if (!style) {
      return new Response(
        JSON.stringify({ error: "请选择服装风格" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    console.log("Processing virtual try-on request, style:", style);

    const styleDescription = stylePrompts[style] || customPrompt || "时尚现代的服装";

    const prompt = `基于这张人物照片，生成一张该人物${styleDescription}的全新图片。
要求：
1. 保持人物面部特征、肤色、发型完全一致
2. 只改变服装和配饰
3. 保持自然的姿势和表情
4. 服装要符合人物体型，穿着效果自然
5. 整体风格协调，光线和背景要与原图和谐
6. 生成高质量、逼真的换装效果图`;

    const response = await fetch("https://www.needware.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemini-3-pro-image-preview",
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
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        temperature: 0.8,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI service error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "请求过于频繁，请稍后再试" }),
          {
            status: 429,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI 服务配额已用尽" }),
          {
            status: 402,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          }
        );
      }

      throw new Error(`换装生成失败: ${errorText}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      throw new Error("未能生成换装效果");
    }

    // Extract image from response
    let generatedImage = result;

    // If result contains inline_data, extract the base64 image
    if (data.choices?.[0]?.message?.content_parts) {
      const imagePart = data.choices[0].message.content_parts.find(
        (part: any) => part.type === "image" || part.inline_data
      );
      if (imagePart?.inline_data) {
        generatedImage = `data:${imagePart.inline_data.mime_type};base64,${imagePart.inline_data.data}`;
      }
    }

    console.log("Virtual try-on completed");

    return new Response(
      JSON.stringify({
        success: true,
        image: generatedImage,
        style: style,
        model: "gemini-3-pro-image-preview"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error("Virtual try-on error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "换装失败，请重试" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

serve(handler);
