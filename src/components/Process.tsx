import { useEffect, useRef, useState } from "react"
import Icon from "@/components/ui/icon"

const STEPS = [
  {
    icon: "UserPlus",
    number: "01",
    title: "Регистрация",
    desc: "Создайте аккаунт автора — это бесплатно. Укажите псевдоним, жанр и загрузите аватар.",
  },
  {
    icon: "FolderPlus",
    number: "02",
    title: "Создание тайтла",
    desc: "Добавьте обложку, описание, теги жанра. Настройте расписание выхода глав.",
  },
  {
    icon: "Upload",
    number: "03",
    title: "Загрузка глав",
    desc: "Загружайте страницы в формате PNG или JPEG. Поддержка ZIP-архивов для быстрой загрузки.",
  },
  {
    icon: "TrendingUp",
    number: "04",
    title: "Рост аудитории",
    desc: "Читатели оценивают, комментируют и подписываются. Рейтинг растёт — вы в топе.",
  },
]

export function Process() {
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
    <section ref={sectionRef} id="authors" className="py-24 lg:py-32 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">

        <div className={`grid lg:grid-cols-2 gap-16 items-start transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

          {/* Left */}
          <div className="lg:sticky lg:top-24">
            <p className="text-xs tracking-[0.3em] uppercase mb-6" style={{ color: "hsl(var(--crimson))" }}>Для авторов</p>
            <h2 className="font-serif text-4xl md:text-5xl font-light leading-[1.1] text-foreground mb-6">
              Публикуй своё
              <span className="block italic" style={{ color: "hsl(var(--crimson))" }}>творчество</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-md">
              Личный кабинет автора — всё что нужно для публикации манги и манхвы. Статистика, комментарии и аудитория в одном месте.
            </p>

            <div className="p-6 border border-border" style={{ background: "hsl(var(--surface))", borderRadius: "var(--radius)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center" style={{ background: "hsl(var(--crimson) / 0.15)", borderRadius: "var(--radius)" }}>
                  <Icon name="BookMarked" size={18} style={{ color: "hsl(var(--crimson))" }} />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Кабинет автора</div>
                  <div className="text-xs text-muted-foreground">Полный контроль над тайтлами</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
                {[["Просмотры", "∞"], ["Главы", "Неограничено"], ["Тайтлы", "До 50"]].map(([label, val]) => (
                  <div key={label} className="text-center">
                    <div className="text-sm font-serif font-light" style={{ color: "hsl(var(--gold))" }}>{val}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <button className="mt-6 w-full py-4 text-sm tracking-widest uppercase font-medium text-white transition-all duration-300 hover:opacity-90" style={{ background: "hsl(var(--crimson))", borderRadius: "var(--radius)" }}>
              Стать автором — бесплатно
            </button>
          </div>

          {/* Right: Steps */}
          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`flex gap-5 p-6 border border-border hover:border-primary/40 transition-all duration-500 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
                style={{ transitionDelay: `${i * 120}ms`, background: "hsl(var(--surface))", borderRadius: "var(--radius)" }}
              >
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 flex items-center justify-center" style={{ background: "hsl(var(--crimson) / 0.15)", borderRadius: "var(--radius)" }}>
                    <Icon name={step.icon} size={18} style={{ color: "hsl(var(--crimson))" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-serif text-3xl font-light" style={{ color: "hsl(var(--border))" }}>{step.number}</span>
                    <h3 className="text-sm font-medium text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}