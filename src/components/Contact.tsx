import { useEffect, useRef, useState } from "react"
import Icon from "@/components/ui/icon"

export function Contact() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.2 },
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="contact" className="py-24 lg:py-32 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto text-center">

        <div className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <p className="text-xs tracking-[0.3em] uppercase mb-6" style={{ color: "hsl(var(--crimson))" }}>Начни прямо сейчас</p>
          <h2 className="font-serif text-4xl md:text-6xl font-light leading-[1.1] text-foreground mb-6">
            Тысячи историй
            <span className="block italic" style={{ color: "hsl(var(--crimson))" }}>ждут тебя</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-xl mx-auto">
            Присоединяйся к сотням тысяч читателей. Регистрация бесплатная — начни читать за 30 секунд.
          </p>

          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <button className="group inline-flex items-center gap-3 px-10 py-5 text-sm tracking-widest uppercase font-medium text-white transition-all duration-300 hover:opacity-90" style={{ background: "hsl(var(--crimson))", borderRadius: "var(--radius)" }}>
              Начать читать
              <Icon name="ArrowRight" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="inline-flex items-center gap-3 px-10 py-5 text-sm tracking-widest uppercase text-muted-foreground border border-border hover:border-foreground/40 hover:text-foreground transition-all duration-300" style={{ borderRadius: "var(--radius)" }}>
              <Icon name="BookMarked" size={16} />
              Кабинет автора
            </button>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {[
              { icon: "Smartphone", label: "Мобильная версия", desc: "Читай с любого устройства" },
              { icon: "Bell", label: "Уведомления", desc: "Новые главы любимых тайтлов" },
              { icon: "Download", label: "Офлайн-режим", desc: "Скачивай и читай без сети" },
              { icon: "Zap", label: "Быстро", desc: "Без рекламы и задержек" },
            ].map((item, i) => (
              <div key={i} className="p-5 border border-border" style={{ background: "hsl(var(--surface))", borderRadius: "var(--radius)" }}>
                <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center" style={{ background: "hsl(var(--crimson) / 0.1)", borderRadius: "var(--radius)" }}>
                  <Icon name={item.icon} size={18} style={{ color: "hsl(var(--crimson))" }} />
                </div>
                <div className="text-xs font-medium text-foreground mb-1">{item.label}</div>
                <div className="text-xs text-muted-foreground leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
