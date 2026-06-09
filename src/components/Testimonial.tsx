import { useEffect, useRef, useState } from "react"
import Icon from "@/components/ui/icon"

const TOP_TITLES = [
  { rank: 1, title: "Vagabond", author: "Такэхико Иноуэ", rating: 9.9, votes: "48 200", genre: "Исторический", cover: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=80&h=110&fit=crop" },
  { rank: 2, title: "Vinland Saga", author: "Макото Юкимура", rating: 9.8, votes: "41 500", genre: "Исторический", cover: "https://images.unsplash.com/photo-1580193769210-b8d1c049a7d9?w=80&h=110&fit=crop" },
  { rank: 3, title: "Berserk", author: "Кэнтаро Миура", rating: 9.9, votes: "62 800", genre: "Тёмное фэнтези", cover: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=80&h=110&fit=crop" },
  { rank: 4, title: "Solo Leveling", author: "Чугён", rating: 9.7, votes: "55 100", genre: "Фэнтези", cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=80&h=110&fit=crop" },
  { rank: 5, title: "Chainsaw Man", author: "Тацуки Фудзимото", rating: 9.5, votes: "38 400", genre: "Тёмный экшн", cover: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=80&h=110&fit=crop" },
]

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating / 2)
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Icon key={i} name="Star" size={12} className={i < full ? "fill-current" : ""} style={{ color: "hsl(var(--gold))" }} />
      ))}
    </div>
  )
}

export function Testimonial() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="catalog" className="py-24 lg:py-32 px-6 lg:px-12" style={{ background: "hsl(var(--midnight))" }}>
      <div className="max-w-7xl mx-auto">

        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "hsl(var(--gold))" }}>Топ рейтинга</p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground">
            Лучшие
            <span className="italic" style={{ color: "hsl(var(--gold))" }}> по оценкам</span>
          </h2>
        </div>

        <div className={`space-y-3 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {TOP_TITLES.map((manga, i) => (
            <div
              key={i}
              className="group flex items-center gap-5 p-4 border border-border hover:border-primary/40 cursor-pointer transition-all duration-300"
              style={{ background: "hsl(var(--surface))", borderRadius: "var(--radius)" }}
            >
              {/* Rank */}
              <div className="w-8 text-center flex-shrink-0">
                <span
                  className="font-serif text-2xl font-light"
                  style={{ color: manga.rank <= 3 ? "hsl(var(--gold))" : "hsl(var(--border))" }}
                >
                  {manga.rank}
                </span>
              </div>

              {/* Cover */}
              <div className="flex-shrink-0 w-12 h-16 overflow-hidden" style={{ borderRadius: "var(--radius)" }}>
                <img src={manga.cover} alt={manga.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-300 truncate">{manga.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{manga.author} · {manga.genre}</p>
              </div>

              {/* Rating */}
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <Stars rating={manga.rating} />
                  <span className="text-sm font-medium" style={{ color: "hsl(var(--gold))" }}>{manga.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">{manga.votes} голосов</p>
              </div>

              {/* Read button */}
              <div className="flex-shrink-0 hidden md:block">
                <div className="px-4 py-2 text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white" style={{ background: "hsl(var(--crimson))", borderRadius: "var(--radius)" }}>
                  Читать
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={`grid md:grid-cols-3 gap-6 mt-16 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          {[
            { icon: "Trophy", label: "Система рейтингов", desc: "Оценивайте от 1 до 10, влияйте на топ-листы" },
            { icon: "MessageSquare", label: "Комментарии", desc: "Обсуждайте главы с сообществом читателей" },
            { icon: "Bookmark", label: "Закладки", desc: "Сохраняйте тайтлы и не теряйте прогресс" },
          ].map((item, i) => (
            <div key={i} className="p-6 border border-border text-center" style={{ background: "hsl(var(--surface))", borderRadius: "var(--radius)" }}>
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center" style={{ background: "hsl(var(--crimson) / 0.1)", borderRadius: "50%" }}>
                <Icon name={item.icon} size={20} style={{ color: "hsl(var(--crimson))" }} />
              </div>
              <h3 className="text-sm font-medium text-foreground mb-2">{item.label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
