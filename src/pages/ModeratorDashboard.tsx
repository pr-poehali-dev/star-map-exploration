import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiGetModeration, apiModerate, getSession, clearSession } from "@/lib/api"
import Icon from "@/components/ui/icon"

interface ModerationChapter {
  id: number
  chapter_number: number
  chapter_title: string
  moderation_status: string
  created_at: string
  title_id: number
  title: string
  author_name: string
  page_count: number
  first_page: string | null
}

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "На проверке", color: "hsl(var(--gold))", bg: "hsl(var(--gold) / 0.1)" },
  approved: { label: "Одобрено", color: "hsl(150 60% 45%)", bg: "hsl(150 60% 45% / 0.1)" },
  rejected: { label: "Отклонено", color: "hsl(var(--crimson))", bg: "hsl(var(--crimson) / 0.1)" },
}

export default function ModeratorDashboard() {
  const navigate = useNavigate()
  const session = getSession()
  const [chapters, setChapters] = useState<ModerationChapter[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [selected, setSelected] = useState<ModerationChapter | null>(null)
  const [comment, setComment] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [actionSuccess, setActionSuccess] = useState("")

  useEffect(() => {
    if (!session.token || session.role !== "moderator") { navigate("/auth"); return }
    loadChapters()
  }, [])

  async function loadChapters() {
    setLoading(true)
    const res = await apiGetModeration()
    if (res.chapters) setChapters(res.chapters)
    setLoading(false)
  }

  async function handleAction(action: "approve" | "reject") {
    if (!selected) return
    setActionLoading(true)
    await apiModerate(selected.id, action, comment)
    setActionLoading(false)
    setActionSuccess(action === "approve" ? "approved" : "rejected")
    setComment("")
    await loadChapters()
    setTimeout(() => { setActionSuccess(""); setSelected(null) }, 1200)
  }

  function logout() { clearSession(); navigate("/") }

  const filtered = filter === "all" ? chapters : chapters.filter((c) => c.moderation_status === filter)
  const pendingCount = chapters.filter((c) => c.moderation_status === "pending").length

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--midnight))" }}>
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between" style={{ background: "hsl(var(--surface))" }}>
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-1">
            <span className="font-serif text-xl text-foreground">Манга</span>
            <span className="font-serif text-xl" style={{ color: "hsl(var(--crimson))" }}>Джун</span>
          </a>
          <span className="text-xs px-2 py-1 border border-border text-muted-foreground" style={{ borderRadius: "var(--radius)" }}>Модератор</span>
          {pendingCount > 0 && (
            <span className="text-xs px-2 py-1 text-white font-medium" style={{ background: "hsl(var(--crimson))", borderRadius: "999px" }}>
              {pendingCount} новых
            </span>
          )}
        </div>
        <button onClick={logout} className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
          <Icon name="LogOut" size={14} /> Выйти
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-serif text-3xl font-light text-foreground">Заявки на модерацию</h1>
          <button onClick={loadChapters} className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="RefreshCw" size={14} /> Обновить
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["pending", "all", "approved", "rejected"] as const).map((f) => {
            const labels = { pending: "На проверке", all: "Все", approved: "Одобренные", rejected: "Отклонённые" }
            return (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-2 text-xs tracking-widest uppercase transition-all duration-300"
                style={{
                  background: filter === f ? "hsl(var(--crimson))" : "hsl(var(--surface))",
                  color: filter === f ? "white" : "hsl(var(--muted-foreground))",
                  border: `1px solid ${filter === f ? "hsl(var(--crimson))" : "hsl(var(--border))"}`,
                  borderRadius: "var(--radius)",
                }}>{labels[f]}</button>
            )
          })}
        </div>

        {loading ? (
          <div className="text-center py-20 text-muted-foreground">Загрузка...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20" style={{ background: "hsl(var(--surface))", borderRadius: "var(--radius)", border: "1px solid hsl(var(--border))" }}>
            <Icon name="CheckCircle" size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">Заявок нет</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {filtered.map((ch) => {
              const s = STATUS_STYLE[ch.moderation_status] || STATUS_STYLE.pending
              const isSelected = selected?.id === ch.id
              return (
                <div
                  key={ch.id}
                  onClick={() => { setSelected(isSelected ? null : ch); setComment(""); setActionSuccess("") }}
                  className="cursor-pointer transition-all duration-300"
                  style={{
                    background: "hsl(var(--surface))",
                    border: `1px solid ${isSelected ? "hsl(var(--crimson))" : "hsl(var(--border))"}`,
                    borderRadius: "var(--radius)",
                  }}
                >
                  {/* Card top */}
                  <div className="flex gap-4 p-4">
                    {ch.first_page ? (
                      <img src={ch.first_page} alt="" className="w-16 h-20 object-cover flex-shrink-0" style={{ borderRadius: "var(--radius)" }} />
                    ) : (
                      <div className="w-16 h-20 flex-shrink-0 flex items-center justify-center border border-border" style={{ borderRadius: "var(--radius)" }}>
                        <Icon name="Image" size={20} className="text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-medium text-foreground truncate">{ch.title}</h3>
                        <span className="text-xs px-2 py-0.5 flex-shrink-0 font-medium" style={{ color: s.color, background: s.bg, borderRadius: "999px" }}>{s.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">Глава {ch.chapter_number}{ch.chapter_title ? ` — ${ch.chapter_title}` : ""}</p>
                      <p className="text-xs text-muted-foreground">Автор: <span className="text-foreground">{ch.author_name}</span></p>
                      <p className="text-xs text-muted-foreground mt-1">{ch.page_count} стр. · {new Date(ch.created_at).toLocaleDateString("ru")}</p>
                    </div>
                  </div>

                  {/* Action panel */}
                  {isSelected && ch.moderation_status === "pending" && (
                    <div className="border-t border-border p-4" onClick={(e) => e.stopPropagation()}>
                      {actionSuccess ? (
                        <div className="text-center py-3 text-sm font-medium" style={{ color: actionSuccess === "approved" ? "hsl(150 60% 45%)" : "hsl(var(--crimson))" }}>
                          {actionSuccess === "approved" ? "✓ Одобрено!" : "✗ Отклонено"}
                        </div>
                      ) : (
                        <>
                          <textarea
                            placeholder="Комментарий (необязательно при одобрении)"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 text-sm bg-transparent border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors mb-3"
                            style={{ borderRadius: "var(--radius)", resize: "none" }}
                          />
                          <div className="flex gap-3">
                            <button
                              onClick={() => handleAction("approve")}
                              disabled={actionLoading}
                              className="flex-1 py-3 text-sm tracking-widest uppercase text-white font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                              style={{ background: "hsl(150 60% 35%)", borderRadius: "var(--radius)" }}
                            >
                              <Icon name="Check" size={14} /> Одобрить
                            </button>
                            <button
                              onClick={() => handleAction("reject")}
                              disabled={actionLoading}
                              className="flex-1 py-3 text-sm tracking-widest uppercase text-white font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                              style={{ background: "hsl(var(--crimson))", borderRadius: "var(--radius)" }}
                            >
                              <Icon name="X" size={14} /> Отклонить
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {isSelected && ch.moderation_status !== "pending" && (
                    <div className="border-t border-border px-4 py-3">
                      <p className="text-xs text-muted-foreground">Решение уже принято: <span style={{ color: s.color }}>{s.label}</span></p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
