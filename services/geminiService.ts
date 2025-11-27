import { GoogleGenAI, Type } from "@google/genai";
import { PoseResponse } from "../types";

// Helper function to get the client with the correct key (User provided > Env provided)
const getGenAIClient = () => {
  const userKey = localStorage.getItem('user_gemini_api_key');
  // If user provided a key, use it. Otherwise fall back to the environment variable.
  const apiKey = userKey || process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API Key is missing. Please set it in Settings or environment variables.");
  }
  
  return new GoogleGenAI({ apiKey });
};

export const generatePoseIdeas = async (productName: string, context: string, modelType: string): Promise<PoseResponse> => {
  const contextPrompt = context.trim() 
    ? `設定的情境風格為: "${context}"` 
    : `設定的情境風格為: "專業商業攝影棚 (Clean Professional Studio)"`;

  const modelPrompt = modelType.trim()
    ? `指定的模特兒特徵為: "${modelType}" (請確保所有姿勢都符合此模特兒設定)`
    : `模特兒設定: 由你決定最適合該產品的模特兒 (請保持連貫性)`;

  const prompt = `
    你是一位世界級的時尚攝影師與創意總監。
    現在有一位網紅明星接到了 "${productName}" 的代言。
    ${contextPrompt}。
    ${modelPrompt}。
    
    請提供 9 個不同的、專業的、且具有吸睛效果的擺拍姿勢建議。
    
    【極重要規則：場景與人物絕對一致性】
    你必須想像自己正處於一個真實的拍攝現場，所有 9 張照片都是在「同一個時間、同一個地點、由同一位模特兒」連續拍攝的。
    1. 首先，請定義一段「統一的環境視覺描述 (environmentDescription)」，包含光線、背景顏色、材質。這段描述將用於生成圖片背景。
    2. 嚴格禁止切換場景：如果情境是「咖啡廳」，所有 9 個動作都必須在該咖啡廳內完成。絕不能出現「捷運」、「戶外」等其他無關地點。
    
    【語言要求】
    **所有輸出的文字內容（包含 title, description, environmentDescription, props）都必須使用通順、優美的「繁體中文」撰寫。**

    【姿勢多樣性要求】
    在上述「單一場景」限制下，請發揮創意提供 9 種變化：
    - 運用場景中的不同道具。
    - 改變構圖（特寫手部拿產品、半身、全身）。
    - 改變肢體語言（放鬆、動態、與鏡頭互動）。
    - 請考慮產品的物理大小，確保動作合理。

    請以 JSON 格式回傳，結構如下：
    - environmentDescription: (String) 場景的統一視覺描述。
    - modelDescription: (String) 模特兒的視覺描述。
    - poses: (Array) 9 個姿勢物件。
      - props: (Array of Strings) 針對該鏡頭，列出 5-8 項「具體拍攝準備清單」，務必詳細包含：
         1. 模特兒身上的服裝細節 (Wardrobe/Outfit) - 例如: "米色針織露肩毛衣"
         2. 配件飾品 (Accessories) - 例如: "極簡細金項鍊"
         3. 場景道具 (Props) - 例如: "大理石紋托盤", "乾燥尤加利葉"
  `;

  try {
    const ai = getGenAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            environmentDescription: { type: Type.STRING },
            modelDescription: { type: Type.STRING },
            poses: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  tips: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  },
                  props: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "List of 5-8 detailed items including wardrobe, accessories, and props"
                  },
                  angle: { type: Type.STRING }
                },
                required: ["title", "description", "tips", "angle", "props"]
              }
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as PoseResponse;
    }
    throw new Error("No text returned from Gemini");
  } catch (error) {
    console.error("Error generating pose ideas:", error);
    throw error;
  }
};

export const generatePoseImage = async (productName: string, poseDescription: string, environmentDescription: string, modelDescription: string): Promise<string> => {
  // Use the generated environment description to anchor the visual consistency
  const backgroundPrompt = environmentDescription || "Clean Professional Studio, Neutral Background";
  const modelPrompt = modelDescription || "An attractive influencer model";
  
  const prompt = `
    Commercial Product Photography, Storyboard Sketch Style.
    Subject: ${modelPrompt} posing with a product: ${productName}.
    
    Action/Pose (Context logic): ${poseDescription}.
    
    CRITICAL - SCENE CONSISTENCY:
    The background and lighting MUST match this description exactly: ${backgroundPrompt}.
    (Note: The description might be in Traditional Chinese, please translate it internally to generate the correct visual context).
    Do not add random elements. Keep the scene consistent.
    
    Style: Minimalist, clean, high-key lighting, photorealistic. 
    Aspect Ratio: Square 1:1.
    
    Safety Guidelines:
    - Safe for work.
    - No nudity, no revealing clothing.
    - Commercial friendly.
  `;

  try {
    const ai = getGenAIClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    // Explicitly throw error if no image data is found, 
    // this triggers the catch block in App.tsx and shows the Retry button.
    throw new Error("No image data returned from API"); 
    
  } catch (error) {
    console.error("Error generating pose image:", error);
    throw error; // Propagate error to trigger retry UI
  }
};