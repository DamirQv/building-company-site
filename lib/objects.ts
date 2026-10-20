export type Project = {
  id: string;
  slug: string;
  title: string;
  beforeImage: string;
  afterImage: string;
  image?: string;
  area?: string;
  material?: string;
  workType?: string;
  city?: string;
  description?: string;
  duration?: string;
  district?: string;
  quote?: string;
  author?: string;
};

export const objects: Project[] = [
  {
    id: "almaty-finnblock-house",
    slug: "chastnyy-dom-v-almaty",
    title: "Частный дом в Алматы",
    beforeImage: "/project1.svg",
    afterImage: "/project2.svg",
    image: "/project2.svg",
    area: "150 м²",
    material: "FinnBlock",
    workType: "Строительство под ключ",
    city: "Алматы",
    description: "Просторный жилой дом в современном стиле с тёплым контуром, удобной планировкой и аккуратной отделкой.",
    duration: "6 месяцев",
    district: "Алматы",
    quote: "Дом получился очень комфортным и тёплым. Сроки выдержали, а все этапы были понятны и прозрачны.",
    author: "Марина П.",
  },
  {
    id: "kaskelek-gazoblock-house",
    slug: "dom-iz-gazobloka-v-kaskelene",
    title: "Дом из газоблока в Каскелене",
    beforeImage: "/project2.svg",
    afterImage: "/project1.svg",
    image: "/project1.svg",
    area: "145 м²",
    material: "Газоблок",
    workType: "Коробка + отделка",
    city: "Каскелен",
    description: "Дом для семьи с удобной планировкой и аккуратно выполненной наружной отделкой под спокойный современный стиль.",
    duration: "7 месяцев",
    district: "Каскелен",
    quote: "Смета не изменилась ни на одну тысячу. Камера на объекте — видел каждый день, что происходит.",
    author: "Алексей К.",
  },
  {
    id: "talgar-brick-house",
    slug: "kirpichnyy-dom-v-talgare",
    title: "Кирпичный дом в Талгаре",
    beforeImage: "/project1.svg",
    afterImage: "/project2.svg",
    image: "/project2.svg",
    area: "220 м²",
    material: "Кирпич",
    workType: "Строительство по проекту",
    city: "Талгар",
    description: "Прочный двухэтажный проект с капитальной конструкцией, качественной отделкой и продуманными инженерными решениями.",
    duration: "9 месяцев",
    district: "Талгар",
    quote: "Платили по актам за этап — удобно, не нужно отдавать всё сразу. Отчёты после каждого этапа помогали контролировать процесс.",
    author: "Данияр С.",
  },
  {
    id: "talgar-family-house",
    slug: "dom-pod-klyuch-v-talgare",
    title: "Дом под ключ в Талгаре",
    beforeImage: "/project2.svg",
    afterImage: "/project1.svg",
    image: "/project1.svg",
    area: "160 м²",
    material: "Газоблок",
    workType: "Под ключ",
    city: "Талгар",
    description: "Комплексная реализация с нуля: от геологии и фундамента до внешней и внутренней отделки под готовый объект.",
    duration: "8 месяцев",
    district: "Талгар",
    quote: "Заехали и жили — всё готово. Договор на каждый этап, никаких сюрпризов по деньгам.",
    author: "Сергей М.",
  },
];

export const builtObjects = objects;
