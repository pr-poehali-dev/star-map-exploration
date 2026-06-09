import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiLogin, apiRegister, saveSession } from "@/lib/api"
import Icon from "@/components/ui/icon"

export default function Auth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = mode === "login"
      ? await apiLogin(email, password)
      : await apiRegister(email, password, username)

    setLoading(false)

    if (res.error) {
      setError(res.error)
      return
    }

    saveSession(res.token, res.role, res.username, res.user_id)

    if (res.role === "moderator") {
      navigate("/moderator")
    } else {
      navigate("/author")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "hsl(var(--midnight))" }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-center gap-1">
            <span className="font-serif text-3xl text-foreground">Манга</span>
            <span className="font-serif text-3xl" style={{ color: "hsl(var(--crimson))" }}>Джун</span>
          </a>
          <p className="text-sm text-muted-foreground mt-2">
            {mode === "login" ? "Войдите в свой кабинет" : "Создайте аккаунт автора"}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-8 border border-border" style={{ borderRadius: "var(--radius)" }}>
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError("") }}
              className="flex-1 py-3 text-sm tracking-widest uppercase transition-all duration-300"
              style={{
                background: mode === m ? "hsl(var(--crimson))" : "transparent",
                color: mode === m ? "white" : "hsl(var(--muted-foreground))",
                borderRadius: "var(--radius)",
              }}
            >
              {m === "login" ? "Вход" : "Регистрация"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">Псевдоним</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ваш псевдоним"
                required
                className="w-full px-4 py-3 text-sm bg-transparent border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                style={{ borderRadius: "var(--radius)" }}
              />
            </div>
          )}

          <div>
            <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 text-sm bg-transparent border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              style={{ borderRadius: "var(--radius)" }}
            />
          </div>

          <div>
            <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 text-sm bg-transparent border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
              style={{ borderRadius: "var(--radius)" }}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm" style={{ background: "hsl(var(--crimson) / 0.1)", borderRadius: "var(--radius)", color: "hsl(var(--crimson))" }}>
              <Icon name="AlertCircle" size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 text-sm tracking-widest uppercase font-medium text-white transition-all duration-300 hover:opacity-90 disabled:opacity-50 mt-2"
            style={{ background: "hsl(var(--crimson))", borderRadius: "var(--radius)" }}
          >
            {loading ? "Загрузка..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <a href="/" className="hover:text-foreground transition-colors">← На главную</a>
        </p>
      </div>
    </div>
  )
}
