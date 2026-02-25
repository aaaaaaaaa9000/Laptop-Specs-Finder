import { GoogleGenAI, Type } from "@google/genai";
import type { Laptop } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      modelName: {
        type: Type.STRING,
        description: 'الاسم الكامل والواضح لنسخة اللابتوب المحددة. مثال: "Dell XPS 15 9530 with OLED Display"',
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


export const fetchLaptopSpecs = async (laptopModel: string): Promise<Laptop[]> => {
  if (!laptopModel.trim()) {
    throw new Error("الرجاء إدخال موديل لابتوب صحيح.");
  }
  try {
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
    
    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("لم يتمكن الذكاء الاصطناعي من العثور على مواصفات لهذا الطراز. الرجاء التأكد من صحة الاسم والمحاولة مرة أخرى.");
    }
    
    const laptops = JSON.parse(jsonText);

    if (!Array.isArray(laptops) || laptops.length === 0) {
        throw new Error("تم استلام بيانات غير صالحة. حاول استخدام اسم موديل أكثر تحديدًا.");
    }
    
    return laptops as Laptop[];

  } catch (error) {
    console.error("Gemini API Error:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
       throw new Error("حدث خطأ في الاتصال بالخادم. مفتاح API غير صالح.");
    }
    throw new Error("حدث خطأ أثناء جلب المواصفات. الرجاء المحاولة مرة أخرى لاحقًا.");
  }
};
