import type { SpecsResponse } from '../types';

export const fetchLaptopSpecs = async (laptopModel: string): Promise<SpecsResponse> => {
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

    const data = await response.json();

    if (!data || !Array.isArray(data.laptops)) {
        throw new Error("تم استلام بيانات غير صالحة. حاول استخدام اسم موديل أكثر تحديدًا.");
    }

    return data as SpecsResponse;

  } catch (error) {
    console.error("API proxy error:", error);
    if (error instanceof Error) {
       throw error;
    }
    throw new Error("حدث خطأ أثناء جلب المواصفات. الرجاء المحاولة مرة أخرى لاحقًا.");
  }
};
