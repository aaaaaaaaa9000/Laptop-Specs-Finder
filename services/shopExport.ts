import type { Laptop } from '../types';

// The store's "add laptop" page (n8n workflow); it reads these fields from the query string.
export const SHOP_ADD_URL = 'https://n8n.aaaaaaaaa9000.cloud/webhook/eastsound-laptop-app';

export interface ShopFields {
  model: string;
  cpu: string;
  storage: string;
  ram: string;
  vga: string;
  screen: string;
  refresh: string;
  device_type: string;
  webcam: string;
  dvd: string;
  vendor: string;
}

const clean = (v?: string) =>
  (v ?? '').replace(/[®™]/g, '').replace(/\s+/g, ' ').trim();

const withoutParens = (v: string) => v.replace(/\s*\([^)]*\)/g, '').trim();

const isNegative = (v: string) => /^(no|none|n\/a|not|without)\b|لا يوجد|بدون|غير متوفر|^لا\b/i.test(v.trim());

const VENDORS: [RegExp, string][] = [
  [/\bhp\b|hewlett|elitebook|probook|zbook|pavilion|envy|omen|spectre/i, 'HP'],
  [/\bdell\b|latitude|precision|inspiron|vostro|xps|alienware/i, 'Dell'],
  [/lenovo|thinkpad|ideapad|thinkbook|yoga|legion/i, 'Lenovo'],
  [/asus|zenbook|vivobook|\brog\b|tuf gaming|expertbook/i, 'Asus'],
  [/acer|aspire|swift|predator|travelmate|nitro/i, 'Acer'],
  [/apple|macbook/i, 'Apple'],
  [/\bmsi\b/i, 'MSI'],
  [/dynabook/i, 'Dynabook'],
];

const WORKSTATION_MODEL = /zbook|precision|thinkpad\s+p\d|\bcelsius\b|\bmsi\s+w[sef]\d/i;
const WORKSTATION_GPU = /quadro|\brtx\s*a\d{3,4}|\b(nvidia\s+)?t\d{3,4}\b|\brtx\s*\d{4}\s*ada|firepro|radeon\s+pro/i;

// "512GB PCIe NVMe SSD + 1TB HDD" -> "ssd 512 n.v + hdd 1tb" (the store's convention).
export const formatStorage = (raw?: string): string => {
  const text = clean(raw);
  if (!text) return '';
  const parts = text.split(/\s*(?:\+|,|\band\b|\/)\s*/i).filter(Boolean);
  const out = parts.map(part => {
    const size = part.match(/(\d+(?:\.\d+)?)\s*(TB|GB|T|G)\b/i);
    if (!size) return null;
    const amount = /^t/i.test(size[2]) ? `${size[1]}tb` : size[1];
    if (/\bhdd\b|hard\s*disk|rpm/i.test(part)) return `hdd ${amount}`;
    if (/emmc/i.test(part)) return `emmc ${amount}`;
    const suffix = /nvme|pcie/i.test(part) ? ' n.v' : /m\.?2/i.test(part) ? ' m.2' : '';
    return `ssd ${amount}${suffix}`;
  });
  return out.every(Boolean) ? out.join(' + ') : text;
};

// "16GB DDR5-5200" -> "16 DDR5"
export const formatRam = (raw?: string): string => {
  const text = clean(raw);
  const size = text.match(/(\d+)\s*GB/i);
  if (!size) return text;
  const type = text.match(/\b(LP)?DDR\d[A-Z]?\b/i);
  return type ? `${size[1]} ${type[0].toUpperCase()}` : size[1];
};

const isTouch = (laptop: Laptop) => {
  const t = clean(laptop.display?.touch);
  return !!t && !isNegative(t) && /yes|true|نعم|touch|لمس|✓/i.test(t);
};

// 15.6" -> "15.6 Led", touch screens -> "15.6 tuch" (the store's spelling).
export const formatScreen = (laptop: Laptop): string => {
  const size = clean(laptop.display?.size).match(/\d+(?:\.\d+)?/);
  if (!size) return '';
  return `${Number(size[0]).toFixed(1)} ${isTouch(laptop) ? 'tuch' : 'Led'}`;
};

// The store's "refresh" column holds resolution, rate and panel: "1920x1080-60Hz-IPS".
export const formatRefresh = (laptop: Laptop): string => {
  const d = laptop.display ?? {};
  const res = clean(d.resolution).match(/(\d{3,4})\s*[x×*]\s*(\d{3,4})/i);
  const hz = clean(d.refreshRate).match(/(\d{2,3})\s*Hz/i);
  const panel = clean(d.panelType).match(/\b(IPS|OLED|TN|VA|Mini-LED)\b/i);
  return [res && `${res[1]}x${res[2]}`, hz && `${hz[1]}Hz`, panel && panel[1].toUpperCase()].filter(Boolean).join('-');
};

const formatCpu = (raw?: string) => withoutParens(clean(raw)).replace(/\s+(processor|cpu)$/i, '');

const formatGpu = (raw?: string) => clean(raw).replace(/[.,;]+$/, '');

const formatModel = (laptop: Laptop) => {
  const name = clean(laptop.modelName);
  const pn = clean(laptop.partNumber);
  // Drop a "(PARTNUMBER)" suffix; the store title is the model name.
  return pn ? name.replace(new RegExp(`\\s*\\(${pn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\)`, 'i'), '').trim() : name;
};

const detectVendor = (laptop: Laptop) => VENDORS.find(([re]) => re.test(laptop.modelName))?.[1] ?? '';

// Workstation/touch are the store's three device categories; anything else is left for the user to pick.
const detectDeviceType = (laptop: Laptop) => {
  const workstation = WORKSTATION_MODEL.test(laptop.modelName) || WORKSTATION_GPU.test(laptop.gpu ?? '');
  const touch = isTouch(laptop);
  if (workstation && touch) return 'work station touch';
  if (workstation) return 'work station';
  if (touch) return 'touch';
  return '';
};

const detectWebcam = (laptop: Laptop) => {
  const v = clean(laptop.webcam);
  if (!v) return '';
  return isNegative(v) ? 'NO CAM' : 'CAM';
};

const detectDvd = (laptop: Laptop) => {
  const v = clean(laptop.opticalDrive);
  if (!v) return '';
  if (isNegative(v)) return 'NO DVD';
  return /dvd|optical|blu-?ray|cd/i.test(v) ? 'DVD' : '';
};

export const toShopFields = (laptop: Laptop): ShopFields => ({
  model: formatModel(laptop),
  cpu: formatCpu(laptop.cpu),
  storage: formatStorage(laptop.storage),
  ram: formatRam(laptop.ram),
  vga: formatGpu(laptop.gpu),
  screen: formatScreen(laptop),
  refresh: formatRefresh(laptop),
  device_type: detectDeviceType(laptop),
  webcam: detectWebcam(laptop),
  dvd: detectDvd(laptop),
  vendor: detectVendor(laptop),
});

export const shopAddUrl = (laptop: Laptop): string => {
  const params = new URLSearchParams();
  Object.entries(toShopFields(laptop)).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  params.set('from', 'specs-finder');
  return `${SHOP_ADD_URL}?${params.toString()}`;
};
