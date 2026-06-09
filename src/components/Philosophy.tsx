import { useEffect, useRef, useState } from "react"

const GENRES = [
  { name: "Сёнэн", count: "2 400+", emoji: "⚔️", desc: "Боевик, приключения, дружба" },
  { name: "Сёдзё", count: "1 800+", emoji: "🌸", desc: "Романтика, драма, чувства" },
  { name: "Сэйнэн", count: "1 200+", emoji: "🌑", desc: "Зрелые темы, психология" },
  { name: "Исэкай", count: "900+", emoji: "🌀", desc: "Другой мир, реинкарнация" },
  { name: "Романтика", count: "1 500+", emoji: "💫", desc: "Любовные линии, школьная жизнь" },
  { name: "Ужасы", count: "600+", emoji: "🔮", desc: "Мистика, триллер, хоррор" },
]

export function Philosophy() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.15 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="genres" className="py-24 lg:py-32 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">

        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-xs tracking-[0.3em] uppercase mb-4" style={{ color: "hsl(var(--crimson))" }}>Каталог жанров</p>
          <h2 className="font-serif text-4xl md:text-5xl font-light text-foreground mb-4">
            Найди своё
            <span className="italic" style={{ color: "hsl(var(--crimson))" }}> чтиво</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            От эпических сражений до нежной романтики — в каждом жанре тысячи историй, готовых захватить тебя с первой страницы.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {GENRES.map((genre, i) => (
            <div
              key={genre.name}
              className={`group cursor-pointer p-6 border border-border hover:border-primary/40 transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${i * 80}ms`, background: "hsl(var(--surface))", borderRadius: "var(--radius)" }}
            >
              <div className="text-3xl mb-4">{genre.emoji}</div>
              <h3 className="font-serif text-xl font-light text-foreground mb-1 group-hover:text-primary transition-colors duration-300">{genre.name}</h3>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{genre.desc}</p>
              <span className="text-xs tracking-widest uppercase" style={{ color: "hsl(var(--gold))" }}>{genre.count} тайтлов</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
