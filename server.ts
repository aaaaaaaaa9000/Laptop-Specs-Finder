import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Routes
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        modelName: {
          type: Type.STRING,
          description: 'الاسم الكامل والواضح لنسخة اللابتوب المحددة.',
        },
        specifications: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: {
                type: Type.STRING,
                description: 'اسم المواصفة باللغة العربية. مثال: المعالج, الذاكرة, دقة الشاشة',
              },
              value: {
                type: Type.STRING,
                description: 'قيمة المواصفة. مثال: Intel Core i9, 32GB, 3840x2400',
              },
            },
            required: ["name", "value"],
          },
        },
      },
      required: ["modelName", "specifications"],
    },
  };

  app.post("/api/specs", async (req, res) => {
    try {
      const { laptopModel } = req.body;
      if (!laptopModel || typeof laptopModel !== 'string' || !laptopModel.trim()) {
         res.status(400).json({ error: "الرجاء إدخال موديل لابتوب صحيح." });
         return;
      }
      const prompt = `
        ابحث عن المواصفات الفنية التفصيلية لجهاز اللابتوب من طراز "${laptopModel}".
        إذا كان هناك عدة نسخ أو تكوينات مختلفة لهذا الطراز (مثلاً بشاشات مختلفة أو معالجات مختلفة)، قم بإرجاع كل نسخة كعنصر منفصل في القائمة.
        لكل نسخة، قدم قائمة بالمواصفات الأساسية.
        
        الرجاء التركيز بشكل خاص وإعطاء الأولوية للمواصفات التالية المتعلقة بالشاشة لكل نسخة:
        - حجم الشاشة (بالبوصة)
        - دقة الشاشة (بالبكسل، مثال: 1920x1080)
        - معدل تحديث الشاشة (بالهرتز، مثال: 120Hz)
        - نوع لوحة الشاشة (مثال: OLED, IPS)
        - السطوع (بالـ nits)
        
        تجنب ذكر "نظام التشغيل" في المواصفات.

        قم بإرجاع النتائج بصيغة JSON بناءً على المخطط المحدد. يجب أن تكون النتيجة عبارة عن مصفوفة من الكائنات، حيث يمثل كل كائن نسخة مختلفة من اللابتوب.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });
      
      const jsonText = response.text?.trim() || "[]";
      let laptops = JSON.parse(jsonText);
      if (!Array.isArray(laptops)) laptops = [];
      res.json(laptops);
    } catch (error) {
      console.error("API error for specs:", error);
      res.status(500).json({ error: "Failed to fetch specs" });
    }
  });

  app.get("/api/hero-image", async (req, res) => {
    try {
      const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: 'A futuristic, abstract background with glowing circuit board patterns and data streams, in shades of deep blue and cyan, representing advanced technology and laptop specifications. Minimalist and sleek, 16:9 aspect ratio.',
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        res.json({ imageUrl: `data:image/jpeg;base64,${base64ImageBytes}` });
      } else {
        res.status(404).json({ error: "No image generated" });
      }
    } catch (error) {
      console.error("API error for hero image:", error);
      res.status(500).json({ error: "Failed to generate image" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
