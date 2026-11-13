# PROJECT_PROGRESS

## 2026-11-13 — Подготовка публикации через GitHub

- По разрешению владельца подготовлен пакет для `origin/main`: строгая проверка всех шести тарифов, явный резервный источник, серверное подтверждение изменившейся цены, журнал повторных запросов, mock-тесты и круглый favicon с прозрачными углами. Исходник `public/favicon_logo.jpeg` сохранён; новый ICO содержит размеры 16/32/48/64/256 px.
- Финальные проверки перед commit: `npm run build`, `npm run lint`, 25 тестов pricing/sitemap и `git diff --check` прошли. Перед подготовкой пакета локальная main и origin/main совпадали на e3b583d. Секреты и серверные файлы не включаются.
- Последняя проверка реального CSV из локальной production-конфигурации: HTTP 200, text/csv, 133 байта, все три материала и шесть тарифов приняты новым парсером без fallback. Совпадение с окружением PM2 на сервере не подтверждено: SSH-аутентификация недоступна.
- Перед ручным запуском на сервере: проверить чистоту рабочей копии и origin/main; выполнить fast-forward обновление; проверить пользователя и cwd PM2, доступ этого пользователя к созданию/чтению/записи `.data/lead-requests` и сохранность каталога между обновлениями. Не менять серверный env; зависимости в этом пакете не менялись. После успешного build перезапустить PM2 и проверить сайт/логи без реальных тестовых заявок.
- Известное ограничение: защита дублей действует для одного request_id при общем сохранном журнале. Обновление страницы создаёт новый ID; повторная отправка после потери ответа может создать вторую сделку — подтверждено отдельным mock, где CRM и файловая система находились полностью в памяти. Полной защиты от повторов после перезагрузки страницы пакет не заявляет.
- Commit и push разрешены владельцем для этого пакета. Публикацию на сервере владелец выполняет самостоятельно; deploy и команды на production в рамках подготовки не выполнялись.

## 2026-11-11 — Пакет №1: контакты, репутация и sitemap

- Добавлены lib/contacts.ts и общий ContactPhones: три подтверждённых номера с городами в Header, mobile-menu, Footer, на главной, /kontakty, /astana и /o-kompanii. На странице Астаны местный номер показан первым.
- Карточка WhatsApp на /kontakty ведёт на существующий номер с тегом S-KONTAKTY. Старые S-FOOTER и S-FLOAT и текст сообщения сохранены. Квиз не редактировался.
- Добавлены ссылка на /astana и ссылки на подтверждённый профиль 2GIS на главной, /otzyvy и /kontakty. Пять записей отзывов и исходные URL сохранены; общий TestimonialCard убрал дублирование и пустые области видеокарточек. Рейтинг и AggregateRating не добавлялись.
- Sitemap сохраняет статические URL при ошибке новостей и пишет безопасную классификацию ошибки в серверный лог. Статическим страницам не назначается выдуманный lastModified; у статей используется доступная валидная дата источника.
- Проверки: npm run build прошёл; ESLint затронутых файлов и git diff --check прошли. Четыре изолированных теста tests/sitemap.test.mjs прошли: нормальные публикации/даты, пустой ответ, тайм-аут, неожиданная ошибка с защитой от раскрытия секретов.
- Локальный production HTML: /, /kontakty, /astana, /o-kompanii и /otzyvy отвечают 200; три tel присутствуют в Header/Footer и контактных блоках. На главной и /otzyvy по пять отзывов с исходными URL. /sitemap.xml отвечает 200, содержит 19 статических URL без объектов и без lastmod при пустом новостном наборе.
- /obekty, /obekty/, четыре прежних slug, /obekty/unknown-slug, /proekty и /proekty/ по-прежнему отвечают 404 с noindex без canonical.
- Не подтверждены визуальные проверки 360/390/768/1280, открытие mobile-menu и квиза кликом: browser access host недоступен. Проверены исходники адаптивных классов и итоговый HTTP/HTML; недоступность сторонних Instagram/2GIS не позволяет подтвердить воспроизведение внешнего контента.
- Цифры, гарантии, сроки, цены, адреса, график, юридические сведения и SEO metadata не изменялись. Контент lib/content.ts, формы, калькулятор, Google Sheets и Bitrix24 в этом пакете не редактировались. Commit, push и deploy не выполнялись.

## 2026-11-11 — Временное отключение раздела объектов

Раздел «Построенные объекты» временно полностью отключён по решению владельца. Маршруты /obekty и /proekty возвращают 404. Исходные данные и изображения сохранены для возможного восстановления. Не восстанавливать раздел без отдельного согласования.

- Удалены маршруты каталога и деталей, компонент объектов главной, активная связка builtObjects, запись sitemap и редирект /proekty. Отключены ссылка article.objectLink и breadcrumbs/JSON-LD для отключённых адресов.
- Проверки: итоговый npm run build и git diff --check прошли. На локальной production-сборке /obekty, четыре прежних slug, /obekty/unknown-slug, /proekty и /proekty/ возвращают прямой HTTP 404 с noindex, без canonical и BreadcrumbList. Также проверены /obekty/ и неизвестный маршрут: 404.
- Главная, /blog, /materialy, /materialy/doma-iz-finnblock, /kontakty, /uslugi и /sitemap.xml отвечают 200; ссылок на отключённые маршруты в проверенном HTML нет. Блок объектов отсутствует, секция quiz сохранена. Sitemap не содержит отключённых адресов.
- Для прямого 404 адресов со слешем автоматическая нормализация заменена эквивалентным правилом для остальных маршрутов; /kontakty/ по-прежнему возвращает 308. Breadcrumbs скрыты также для системного пути /_not-found.
- Первый build обнаружил устаревшие ссылки в сгенерированном .next/dev/types; очищен только этот кэш, повторные сборки успешны.
- Визуальная проверка desktop/mobile и открытие квиза кликом не подтверждены: browser host недоступен, а Computer Use остановлен из-за невозможности надёжно определить URL Chrome. Телефоны, формы, pricing/Google Sheets и Bitrix24 не редактировались; тестовые заявки не отправлялись.
- Commit, push и deploy не выполнялись.

## 2026-11-05 - Phone number for Astana

- Initial state: the two Almaty numbers were not consistently displayed in the Header, mobile menu, home contact block, Footer, and contacts page; the Astana number was absent.
- Changes: added the third, labeled phone line `Астана: +7 771 400 94 00` and ensured all three numbers use `tel:` links in the Header, mobile menu, home contact block, Footer, and contacts page. The existing Almaty numbers were retained.
- Changed files: `app/components/site-shell.tsx`, `app/page.tsx`, `app/kontakty/page.tsx`, `PROJECT_PROGRESS.md`.
- Verification: `npm run build` passed. Rendered `/` and `/kontakty` HTML each contain all three expected `tel:` links. Desktop and mobile Header contact blocks are separated with `lg:flex` and `lg:hidden` respectively.
- Commit, push, and deploy: not performed.

## 2026-11-04 - Task 2: og:url

- Initial audit finding: `og:url` was reported as using the former `https://dombuilding.kz` domain.
- Cause found in the current source: none. `lib/seo.ts` has one shared URL value for `alternates.canonical` and `openGraph.url`, with `https://standardstroy.kz` as the origin. No `dombuilding.kz` reference remains in application, library, public, or progress files.
- Changes: no application SEO code required modification; the current shared implementation already guarantees matching canonical and `og:url` for indexed pages. This progress entry was added.
- HTML verification: `/`, `/astana`, `/obekty`, `/obekty/chastnyy-dom-v-almaty`, `/materialy/doma-iz-gazobloka`, `/uslugi/proektirovanie`, and `/blog` each returned identical self-canonical and `og:url` values on `https://standardstroy.kz`. `/blog/unconfirmed-slug` returned 404 with no canonical or `og:url` and `noindex` robots metadata.
- Build: `npm run build` passed on Next.js 16.2.12, including TypeScript and static-page generation.
- Remaining verification: a live published dynamic blog article remains unavailable from the current source; after publication, confirm its rendered `og:url` is `https://standardstroy.kz/blog/[real-slug]` and matches canonical.
- Commit, push, and deploy: not performed.

## 2026-11-04 - Final `/blog/[slug]` verification

- No real published article was available from the current publication source.
- The metadata implementation was reviewed: a found article passes its actual `article.slug` to `createPageMetadata`, producing `https://standardstroy.kz/blog/[slug]` without `noindex` robots metadata.
- The missing-slug branch now explicitly returns `noindex, follow` without a canonical, then the page returns 404.
- The unavailable-source branch also returns `noindex, follow` without a canonical.
- A repeat production build with `npm run build` succeeded (Next.js 16.2.12, TypeScript and static-page generation completed).
- An isolated local Bitrix mock did not modify files, CRM, `.env.local` or production, but its child Next.js process was not available for an HTTP request in this execution environment. One live HTML check remains after a real article is published.
- Final-step changed files: `app/blog/[slug]/page.tsx`, `PROJECT_PROGRESS.md`. No commit or deploy was performed.

## 2026-11-04 — Задача №1: canonical

- Исходное состояние: `metadataBase` уже задан как `https://standardstroy.kz`; главная, статические страницы и существующие динамические объекты, материалы, услуги и статьи формировали self-canonical через `createPageMetadata`.
- Обнаруженная проблема: при недоступности источника публикаций маршрут `/blog/[slug]` формировал canonical из запрошенного slug, хотя существование статьи не было подтверждено.
- Изменённые файлы: `app/blog/[slug]/page.tsx`, `PROJECT_PROGRESS.md`.
- Выполненные исправления: для временно недоступной публикации сохранён `noindex, follow`, но canonical больше не создаётся. Для подтверждённых страниц canonical по-прежнему строится по фактическому slug на `https://standardstroy.kz` без query-параметров и hash.
- Результаты проверок: production HTML проверен локально. Self-canonical подтверждён для `/`, `/astana`, `/obekty`, `/obekty/chastnyy-dom-v-almaty`, `/materialy/doma-iz-gazobloka`, `/uslugi/proektirovanie` и `/blog`. Canonical для существующих страниц не содержит query-параметров: это отдельно подтверждено для `/astana?utm_source=test`, `/obekty/chastnyy-dom-v-almaty?utm_source=test` и `/materialy/doma-iz-gazobloka?utm_source=test`. Несуществующие `/blog/definitely-missing`, `/materialy/definitely-missing`, `/uslugi/definitely-missing` и `/obekty/definitely-missing` возвращают 404 без canonical.
- Результат `npm run build`: успешно; Next.js 16.2.12 завершил компиляцию, TypeScript, сбор данных и генерацию статических страниц.
- Что осталось сделать: не удалось проверить canonical опубликованной динамической статьи `/blog/[slug]`, потому что текущий источник публикаций вернул пустой или недоступный набор. Ветка временной недоступности источника проверена кодом: она теперь `noindex, follow` без canonical.
- Commit и deploy: не выполнялись.

## 2026-11-11 — Согласованность актуальных тарифов и заявки

- Причина: резервные тарифы могли отображаться без предупреждения; неполная таблица смешивалась с резервом; повторное получение цен при отправке могло молча менять сумму заявки.
- `lib/pricing.ts`: внешний CSV/XLSX принимается только целиком — три материала и шесть положительных тарифов. Отсутствующие значения, дубли строк/столбцов, неоднозначные заголовки и повреждённые CSV отклоняются. Источник и код ошибки сохраняются в результате. Приоритет переменных и тайм-аут 10 секунд сохранены. Диагностика различает timeout/network/http/invalid_format/incomplete/duplicate/invalid_rate без URL и секретов.
- Резервные значения DEFAULT_PRICING не изменены; они используются только для отображения с явным предупреждением в квизе, сравнении материалов, /astana, /materialy и /materialy/[slug].
- API квиза заново проверяет источник при каждой отправке/подтверждении. Недоступный или невалидный источник: HTTP 503, без CRM-запросов. Отличающаяся ставка/сумма или резервный источник клиента: HTTP 409 с новой ценой, без CRM-запросов. Пользователь видит новую сумму и подтверждает её отдельным нажатием; повторное изменение требует нового подтверждения.
- Формула Math.round(площадь × тариф), города, материалы, диапазон площади и прежние поля CRM сохранены. В CRM передаются только серверные значения.
- Защита повторной отправки: стабильный request_id квиза, атомарная блокировка и результат в `.data/lead-requests` вне .next, включая параллельные PM2 workers и перезапуск на одном сервере. Каталог исключён из git. При неопределённом результате CRM повтор не создаёт новую заявку; нужна ручная сверка с CRM. Каталог должен быть доступен PM2 для записи и сохраняться между обновлениями; для нескольких серверов потребуется общее хранилище. Повтор с новым request_id (например, после полного обновления страницы) считается новой заявкой.
- Изменённые/добавленные файлы: `.gitignore`, `lib/pricing.ts`, `lib/lead-idempotency.ts`, `app/api/lead/route.ts`, `app/components/lead-quiz.tsx`, `app/components/pricing-notice.tsx`, `app/components/materials-comparison.tsx`, `app/page.tsx`, `app/astana/page.tsx`, `app/materialy/page.tsx`, `app/materialy/[slug]/page.tsx`, `tests/pricing.test.mjs`, `PROJECT_PROGRESS.md`.
- Проверки: production build и ESLint успешны. `node --test tests/pricing.test.mjs tests/sitemap.test.mjs`: 25/25 успешно (21 pricing + 4 существующих sitemap). Проверены шесть тарифов CSV/XLSX, неполная/дублированная/повреждённая таблица, сетевой тайм-аут через mock, смена цены и повторное подтверждение, параллельные повторы и перезапуск, неопределённый ответ CRM, прежняя формула и CRM payload. Все CRM-запросы изолированы mock; реальные заявки не отправлялись.
- Локальная production-сборка с изолированным HTTP-источником: `/`, `/astana`, `/materialy`, `/materialy/doma-iz-finnblock` возвращают 200; предупреждение отсутствует при полном наборе и присутствует при неполном наборе. `git diff --check` успешен.
- Осталось: проверить полноту реальной production-таблицы (HTTP 200 сам по себе её не подтверждает), права/сохранность каталога журнала на сервере и пользовательский сценарий в браузере после согласованной публикации. Визуальное взаимодействие браузером в этой проверке не выполнялось. Причина сетевых ETIMEDOUT на Hoster.kz этими изменениями не устраняется; сбой теперь явный и не приводит к отправке резервной суммы.
- `.env.local`, коммерческие резервные значения, SEO, контакты и зависимости не изменялись. Commit, push, deploy не выполнялись.
