import { useEffect, useRef, useState } from "react"
import Icon from "@/components/ui/icon"

const NEW_TITLES = [
  { title: "Solo Leveling", chapters: 179, genre: "Фэнтези · Экшн", status: "Завершён", rating: 9.7, cover: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200&h=280&fit=crop", isNew: true },
  { title: "Tower of God", chapters: 600, genre: "Фэнтези · Приключения", status: "Онгоинг", rating: 9.4, cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=280&fit=crop", isNew: true },
  { title: "Chainsaw Man", chapters: 160, genre: "Тёмный экшн", status: "Онгоинг", rating: 9.5, cover: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=200&h=280&fit=crop", isNew: false },
  { title: "Vinland Saga", chapters: 200, genre: "Исторический", status: "Онгоинг", rating: 9.8, cover: "https://images.unsplash.com/photo-1580193769210-b8d1c049a7d9?w=200&h=280&fit=crop", isNew: false },
  { title: "Vagabond", chapters: 327, genre: "Исторический", status: "Хиатус", rating: 9.9, cover: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=280&fit=crop", isNew: false },
  { title: "Blue Lock", chapters: 260, genre: "Спортивный", status: "Онгоинг", rating: 9.2, cover: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=200&h=280&fit=crop", isNew: true },
]

const STATUS_COLORS: Record<string, string> = {
  "Завершён": "hsl(150 60% 45%)",
  "Онгоинг": "hsl(var(--crimson))",
  "Хиатус": "hsl(var(--gold))",
}

export function Services() {
  const [isVisible, setIsVisible] = useState(false)
  const [activeFilter, setActiveFilter] = useState("Все")
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  const filters = ["Все", "Манга", "Манхва", "Манхуа"]

  return (
    <section ref={sectionRef} id="new" className="py-24 lg:py-32 px-6 lg:px-12" style={{ background: "hsl(var(--midnight))" }}>
      <div className="max-w-7xl mx-auto">

        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div>
            <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "hsl(var(--crimson))" }}>Новинки</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground">
              Свежие
              <span className="italic" style={{ color: "hsl(var(--gold))" }}> тайтлы</span>
            </h2>
          </div>

          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className="px-4 py-2 text-xs tracking-widest uppercase transition-all duration-300"
                style={{
                  background: activeFilter === f ? "hsl(var(--crimson))" : "hsl(var(--surface))",
                  color: activeFilter === f ? "white" : "hsl(var(--muted-foreground))",
                  borderRadius: "var(--radius)",
                  border: `1px solid ${activeFilter === f ? "hsl(var(--crimson))" : "hsl(var(--border))"}`,
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {NEW_TITLES.map((manga, i) => (
            <div
              key={i}
              className={`group cursor-pointer transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="relative overflow-hidden aspect-[3/4] mb-3" style={{ borderRadius: "var(--radius)" }}>
                <img src={manga.cover} alt={manga.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

                {manga.isNew && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 text-xs font-medium text-white" style={{ background: "hsl(var(--crimson))", borderRadius: "3px" }}>
                    NEW
                  </div>
                )}

                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Icon name="Star" size={10} className="fill-current" style={{ color: "hsl(var(--gold))" }} />
                    <span className="text-xs" style={{ color: "hsl(var(--gold))" }}>{manga.rating}</span>
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: "hsl(0 0% 0% / 0.4)" }}>
                  <div className="p-3" style={{ background: "hsl(var(--crimson))", borderRadius: "50%" }}>
                    <Icon name="BookOpen" size={16} className="text-white" />
                  </div>
                </div>
              </div>

              <h3 className="text-sm font-medium text-foreground leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors duration-300">{manga.title}</h3>
              <p className="text-xs text-muted-foreground mb-1">{manga.genre}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: STATUS_COLORS[manga.status] }}>{manga.status}</span>
                <span className="text-xs text-muted-foreground">{manga.chapters} гл.</span>
              </div>
            </div>
          ))}
        </div>

        <div className={`text-center mt-12 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <a href="#catalog" className="inline-flex items-center gap-2 px-8 py-4 text-sm tracking-widest uppercase border border-border text-muted-foreground hover:border-primary hover:text-foreground transition-all duration-300">
            Весь каталог
            <Icon name="ArrowRight" size={16} />
          </a>
        </div>

      </div>
    </section>
  )
}