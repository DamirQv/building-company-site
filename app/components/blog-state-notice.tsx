export function BlogStateNotice({ unavailable = false }: { unavailable?: boolean }) {
  return (
    <div
      role={unavailable ? "alert" : "status"}
      className={`rounded-2xl border px-6 py-8 text-sm leading-7 ${
        unavailable
          ? "border-amber-200 bg-amber-50 text-amber-950"
          : "border-slate-200 bg-white text-slate-600"
      }`}
    >
      {unavailable
        ? "Не удалось загрузить публикации из Bitrix24. Обновите страницу или попробуйте позже."
        : "Опубликованных материалов пока нет. Когда публикация перейдёт на соответствующий этап в Bitrix24, она появится здесь."}
    </div>
  );
}
