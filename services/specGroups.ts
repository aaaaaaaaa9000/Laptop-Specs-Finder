import type { Laptop, Specification } from '../types';

export interface SpecGroup {
  title: string;
  highlight: boolean;
  specs: Specification[];
}

const pick = (entries: [string, string | undefined][]): Specification[] =>
  entries
    .filter((entry): entry is [string, string] => !!entry[1]?.trim())
    .map(([name, value]) => ({ name, value }));

// Fixed Arabic labels keyed by schema field, so grouping/highlighting never depends on model wording.
export const toSpecGroups = (laptop: Laptop): SpecGroup[] => {
  const d = laptop.display ?? {};
  const groups: SpecGroup[] = [
    {
      title: 'الشاشة',
      highlight: true,
      specs: pick([
        ['حجم الشاشة', d.size],
        ['دقة الشاشة', d.resolution],
        ['معدل التحديث', d.refreshRate],
        ['نوع اللوحة', d.panelType],
        ['السطوع', d.brightness],
        ['التغطية اللونية', d.colorGamut],
        ['شاشة لمس', d.touch],
      ]),
    },
    {
      title: 'الأداء',
      highlight: false,
      specs: pick([
        ['المعالج', laptop.cpu],
        ['كرت الشاشة', laptop.gpu],
        ['الذاكرة (RAM)', laptop.ram],
        ['التخزين', laptop.storage],
      ]),
    },
    {
      title: 'عام',
      highlight: false,
      specs: pick([
        ['رقم القطعة', laptop.partNumber],
        ['سنة الإصدار', laptop.releaseYear],
        ['البطارية', laptop.battery],
        ['الوزن', laptop.weight],
        ['المنافذ', laptop.ports],
        ['الكاميرا', laptop.webcam],
        ['محرك الأقراص (DVD)', laptop.opticalDrive],
      ]),
    },
    {
      title: 'مواصفات أخرى',
      highlight: false,
      specs: (laptop.extraSpecs ?? []).filter(s => s.name?.trim() && s.value?.trim()),
    },
  ];
  return groups.filter(g => g.specs.length > 0);
};

export const formatLaptopAsText = (laptop: Laptop): string =>
  [
    laptop.modelName,
    ...toSpecGroups(laptop).flatMap(g => ['', `${g.title}:`, ...g.specs.map(s => `- ${s.name}: ${s.value}`)]),
  ].join('\n');
