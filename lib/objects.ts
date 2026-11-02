export type Project = {
  id: string;
  slug: string;
  title: string;
  area?: string;
  material?: string;
  workType?: string;
  city?: string;
  description?: string;
  duration?: string;
  district?: string;
};

export const objects: Project[] = [
  {
    id: "almaty-finnblock-house",
    slug: "chastnyy-dom-v-almaty",
    title: "Частный дом в Алматы",
    area: "150 м²",
    material: "FinnBlock",
    workType: "Строительство под ключ",
    city: "Алматы",
    description: "Просторный жилой дом в современном стиле с тёплым контуром, удобной планировкой и аккуратной отделкой.",
    duration: "6 месяцев",
    district: "Алматы",
  },
  {
    id: "kaskelek-gazoblock-house",
    slug: "dom-iz-gazobloka-v-kaskelene",
    title: "Дом из газоблока в Каскелене",
    area: "145 м²",
    material: "Газоблок",
    workType: "Коробка + отделка",
    city: "Каскелен",
    description: "Дом для семьи с удобной планировкой и аккуратно выполненной наружной отделкой под спокойный современный стиль.",
    duration: "7 месяцев",
    district: "Каскелен",
  },
  {
    id: "talgar-brick-house",
    slug: "kirpichnyy-dom-v-talgare",
    title: "Кирпичный дом в Талгаре",
    area: "220 м²",
    material: "Кирпич",
    workType: "Строительство по проекту",
    city: "Талгар",
    description: "Прочный двухэтажный проект с капитальной конструкцией, качественной отделкой и продуманными инженерными решениями.",
    duration: "9 месяцев",
    district: "Талгар",
  },
  {
    id: "talgar-family-house",
    slug: "dom-pod-klyuch-v-talgare",
    title: "Дом под ключ в Талгаре",
    area: "160 м²",
    material: "Газоблок",
    workType: "Под ключ",
    city: "Талгар",
    description: "Комплексная реализация с нуля: от геологии и фундамента до внешней и внутренней отделки под готовый объект.",
    duration: "8 месяцев",
    district: "Талгар",
  },
];
