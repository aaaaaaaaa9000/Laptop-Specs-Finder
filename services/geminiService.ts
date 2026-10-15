import type { IdentifyResponse, SpecsResponse } from '../types';

const MAX_IMAGE_DIMENSION = 2000;

const postJson = async (url: string, body: unknown, fallbackError: string) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || fallbackError);
  }
  return response.json();
};

export const fetchLaptopSpecs = async (laptopModel: string, refresh = false): Promise<SpecsResponse> => {
  if (!laptopModel.trim()) {
    throw new Error("الرجاء إدخال موديل لابتوب صحيح.");
  }
  try {
    const data = await postJson('/api/specs', { laptopModel, refresh }, "حدث خطأ أثناء جلب المواصفات. الرجاء المحاولة مرة أخرى لاحقًا.");

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

// Phone photos are several MB; scale down to keep the upload small while the label text stays readable.
const imageToJpegBase64 = async (file: File): Promise<string> => {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("تعذّر فتح الصورة. جرّب صورة بصيغة JPEG أو PNG.");
  }
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
};

export const identifyLaptopFromImage = async (file: File): Promise<IdentifyResponse> => {
  const image = await imageToJpegBase64(file);
  return postJson('/api/identify', { image, mimeType: 'image/jpeg' }, "تعذّر قراءة الصورة. الرجاء المحاولة مرة أخرى بصورة أوضح.");
};
