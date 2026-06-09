import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Icon from "@/components/ui/icon"
import { getSession, clearSession } from "@/lib/api"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const session = getSession()

  function handleCabinet() {
    if (!session.token) { navigate("/auth"); return }
    navigate(session.role === "moderator" ? "/moderator" : "/author")
  }

  function handleLogout() {
    clearSession()
    navigate("/")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <nav className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <span className="font-serif text-2xl tracking-wide text-foreground">Манга</span>
            <span className="font-serif text-2xl tracking-wide" style={{ color: "hsl(var(--crimson))" }}>Джун</span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <a href="#new" className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
              Новинки
            </a>
            <a href="#catalog" className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
              Каталог
            </a>
            <a href="#genres" className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
              Жанры
            </a>
            <a href="#authors" className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
              Авторам
            </a>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {session.token ? (
              <>
                <button onClick={handleCabinet} className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
                  {session.username}
                </button>
                <button onClick={handleLogout} className="px-5 py-2 text-xs tracking-widest uppercase font-medium transition-all duration-300 hover:opacity-90" style={{ background: "hsl(var(--crimson))", color: "white" }}>
                  Выйти
                </button>
              </>
            ) : (
              <>
                <button onClick={() => navigate("/auth")} className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors duration-300">
                  Войти
                </button>
                <button onClick={() => navigate("/auth")} className="px-5 py-2 text-xs tracking-widest uppercase font-medium transition-all duration-300 hover:opacity-90" style={{ background: "hsl(var(--crimson))", color: "white" }}>
                  Кабинет
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden flex flex-col gap-1.5 p-2"
            aria-label="Открыть меню"
          >
            <span className={`block w-6 h-px bg-foreground transition-transform duration-300 ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-px bg-foreground transition-opacity duration-300 ${isMenuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-px bg-foreground transition-transform duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${isMenuOpen ? "max-h-64 pb-8" : "max-h-0"}`}>
          <div className="flex flex-col gap-6 pt-4">
            {["Новинки", "Каталог", "Жанры", "Авторам"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setIsMenuOpen(false)}
                className="text-sm tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}