import type { Laptop } from '../types';

export const fetchLaptopSpecs = async (laptopModel: string): Promise<Laptop[]> => {
  if (!laptopModel.trim()) {
    throw new Error("الرجاء إدخال موديل لابتوب صحيح.");
  }
  try {
    const response = await fetch('/api/specs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ laptopModel })
    });
    
    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "حدث خطأ أثناء جلب المواصفات. الرجاء المحاولة مرة أخرى لاحقًا.");
    }
    
    const laptops = await response.json();

    if (!Array.isArray(laptops) || laptops.length === 0) {
        throw new Error("تم استلام بيانات غير صالحة. حاول استخدام اسم موديل أكثر تحديدًا.");
    }
    
    return laptops as Laptop[];

  } catch (error) {
    console.error("API proxy error:", error);
    if (error instanceof Error) {
       throw error;
    }
    throw new Error("حدث خطأ أثناء جلب المواصفات. الرجاء المحاولة مرة أخرى لاحقًا.");
  }
};
