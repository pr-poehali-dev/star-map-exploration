export function Footer() {
  const links = {
    "Читателям": ["Каталог", "Новинки", "Топ рейтинга", "По жанрам", "Случайный тайтл"],
    "Авторам": ["Кабинет автора", "Загрузить мангу", "Правила публикации", "Монетизация"],
    "Платформа": ["О нас", "Правила сайта", "Поддержка", "API для авторов"],
  }

  return (
    <footer className="py-16 px-6 lg:px-12 border-t border-border" style={{ background: "hsl(var(--midnight))" }}>
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-1 mb-4">
              <span className="font-serif text-2xl text-foreground">Манга</span>
              <span className="font-serif text-2xl" style={{ color: "hsl(var(--crimson))" }}>Дом</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              Лучшая платформа для чтения манги, манхвы и манхуа на русском языке.
            </p>
            <div className="flex gap-3">
              {["Telegram", "VK", "Discord"].map((s) => (
                <button key={s} className="px-3 py-1.5 text-xs text-muted-foreground border border-border hover:border-foreground/40 hover:text-foreground transition-all duration-300" style={{ borderRadius: "var(--radius)" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-xs tracking-[0.2em] uppercase text-foreground font-medium mb-5">{category}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-border">
          <p className="text-xs text-muted-foreground">© 2025 МангаДом. Все права защищены.</p>
          <p className="text-xs text-muted-foreground">Сделано с любовью к аниме и манге</p>
        </div>

      </div>
    </footer>
  )
}
