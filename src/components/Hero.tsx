import { useEffect, useState } from "react"
import Icon from "@/components/ui/icon"

const FEATURED = [
  { title: "Клинок, рассекающий демонов", genre: "Сёнэн · Экшн", chapters: 207, rating: 9.8, cover: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=420&fit=crop" },
  { title: "Атака на Титанов", genre: "Тёмное фэнтези", chapters: 139, rating: 9.6, cover: "https://images.unsplash.com/photo-1559583985-c80d8ad9b29f?w=300&h=420&fit=crop" },
  { title: "Один удар", genre: "Экшн · Комедия", chapters: 180, rating: 9.5, cover: "https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=300&h=420&fit=crop" },
  { title: "Берсерк", genre: "Тёмное фэнтези", chapters: 364, rating: 9.9, cover: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=420&fit=crop" },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      <Icon name="Star" size={12} className="fill-current" style={{ color: "hsl(var(--gold))" }} />
      <span className="text-xs font-medium" style={{ color: "hsl(var(--gold))" }}>{rating}</span>
    </div>
  )
}

export function Hero() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center px-6 lg:px-12 pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 60% 50%, hsl(350 80% 55% / 0.08) 0%, transparent 70%), hsl(var(--midnight))" }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(hsl(var(--border)) 1px, transparent 1px)", backgroundSize: "40px 40px", opacity: 0.3 }} />

      <div className="relative z-10 max-w-7xl mx-auto w-full py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: Text */}
          <div>
            <p className={`text-xs tracking-[0.3em] uppercase mb-6 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ color: "hsl(var(--crimson))" }}>
              — Manga · Manhwa · Manhua
            </p>

            <h1 className={`font-serif text-5xl md:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight text-foreground mb-6 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              Удобно читать
              <span className="block italic" style={{ color: "hsl(var(--crimson))" }}>мангу по главам</span>
            </h1>

            <p className={`text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              Тысячи тайтлов — от классики до свежих новинок. Читайте онлайн, отслеживайте прогресс и публикуйте свои работы.
            </p>

            <div className={`flex flex-wrap gap-4 mb-12 transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              <a href="#catalog" className="inline-flex items-center gap-3 px-8 py-4 text-sm tracking-widest uppercase font-medium text-white transition-all duration-300 hover:opacity-90" style={{ background: "hsl(var(--crimson))" }}>
                Смотреть каталог
                <Icon name="ArrowRight" size={16} />
              </a>
              <a href="#new" className="inline-flex items-center gap-3 px-8 py-4 text-sm tracking-widest uppercase text-muted-foreground border border-border hover:border-foreground/40 hover:text-foreground transition-all duration-300">
                Новинки
              </a>
            </div>

            {/* Stats */}
            <div className={`flex gap-10 transition-all duration-700 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
              {[["12 000+", "тайтлов"], ["150 000+", "читателей"], ["500+", "авторов"]].map(([num, label]) => (
                <div key={label}>
                  <div className="font-serif text-2xl font-light" style={{ color: "hsl(var(--gold))" }}>{num}</div>
                  <div className="text-xs tracking-widest uppercase text-muted-foreground mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Featured covers */}
          <div className={`transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            <p className="text-xs tracking-[0.25em] uppercase text-muted-foreground mb-6">Популярное сейчас</p>
            <div className="grid grid-cols-2 gap-4">
              {FEATURED.map((manga, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="relative overflow-hidden aspect-[3/4] mb-3" style={{ borderRadius: "var(--radius)" }}>
                    <img src={manga.cover} alt={manga.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <StarRating rating={manga.rating} />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: "hsl(var(--crimson) / 0.15)" }}>
                      <div className="p-3 rounded-full" style={{ background: "hsl(var(--crimson))" }}>
                        <Icon name="BookOpen" size={18} className="text-white" />
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-medium text-foreground leading-tight mb-1 line-clamp-1">{manga.title}</h3>
                  <p className="text-xs text-muted-foreground">{manga.genre} · {manga.chapters} гл.</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-px h-12 bg-gradient-to-b from-transparent via-border to-transparent animate-pulse" />
      </div>
    </section>
  )
}