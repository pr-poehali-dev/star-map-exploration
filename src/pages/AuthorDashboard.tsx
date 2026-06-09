import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  apiGetTitles, apiCreateTitle, apiGetChapters, apiUploadChapter,
  apiGetComments, apiPostComment, getSession, clearSession
} from "@/lib/api"
import Icon from "@/components/ui/icon"

interface Title {
  id: number; title: string; description: string; genre: string
  genres: string; author_name: string; age_rating: string
  status: string; created_at: string
}
interface Chapter {
  id: number; chapter_number: number; chapter_title: string
  moderation_status: string; moderation_comment: string; created_at: string
}
interface Comment { id: number; username: string; content: string; created_at: string }

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  pending:  { label: "На проверке", color: "hsl(var(--gold))" },
  approved: { label: "Одобрено",    color: "hsl(150 60% 45%)" },
  rejected: { label: "Отклонено",   color: "hsl(var(--crimson))" },
}

const AGE_RATINGS = ["0+", "6+", "12+", "16+", "18+"]

const GENRES_LIST = [
  "Сёнэн", "Сёдзё", "Сэйнэн", "Дзёсэй", "Исэкай", "Романтика",
  "Экшн", "Фэнтези", "Комедия", "Драма", "Ужасы", "Спортивный",
  "Исторический", "Приключения", "Мистика", "Психологический"
]

export default function AuthorDashboard() {
  const navigate = useNavigate()
  const session = getSession()
  const [titles, setTitles] = useState<Title[]>([])
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [view, setView] = useState<"titles" | "new-title" | "chapters" | "upload-chapter">("titles")

  const [newTitle, setNewTitle] = useState({
    title: "", description: "", genre: "", genres: "", author_name: "", age_rating: "12+"
  })
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [titleLoading, setTitleLoading] = useState(false)
  const [titleError, setTitleError] = useState("")

  const [chapterNum, setChapterNum] = useState("")
  const [chapterTitle, setChapterTitle] = useState("")
  const [pages, setPages] = useState<{ filename: string; data: string; preview: string }[]>([])
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [expandedChapter, setExpandedChapter] = useState<number | null>(null)
  const [commentsMap, setCommentsMap] = useState<Record<number, Comment[]>>({})
  const [commentText, setCommentText] = useState("")
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    if (!session.token || session.role !== "author") { navigate("/auth"); return }
    loadTitles()
  }, [])

  async function loadTitles() {
    const res = await apiGetTitles()
    if (res.titles) setTitles(res.titles)
  }

  async function loadChapters(titleId: number) {
    const res = await apiGetChapters(titleId)
    if (res.chapters) setChapters(res.chapters)
  }

  async function loadComments(chapterId: number) {
    if (commentsMap[chapterId]) return
    const res = await apiGetComments(chapterId)
    if (res.comments) setCommentsMap(prev => ({ ...prev, [chapterId]: res.comments }))
  }

  function toggleChapter(chapterId: number) {
    if (expandedChapter === chapterId) {
      setExpandedChapter(null)
    } else {
      setExpandedChapter(chapterId)
      loadComments(chapterId)
    }
    setCommentText("")
  }

  async function handlePostComment(chapterId: number) {
    if (!commentText.trim()) return
    setCommentLoading(true)
    const res = await apiPostComment(chapterId, commentText)
    setCommentLoading(false)
    if (res.error) return
    setCommentsMap(prev => ({
      ...prev,
      [chapterId]: [...(prev[chapterId] || []), res]
    }))
    setCommentText("")
  }

  function toggleGenre(g: string) {
    setSelectedGenres(prev => {
      const next = prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
      setNewTitle(t => ({ ...t, genres: next.join(", "), genre: next[0] || "" }))
      return next
    })
  }

  async function handleCreateTitle(e: React.FormEvent) {
    e.preventDefault()
    setTitleError(""); setTitleLoading(true)
    const res = await apiCreateTitle({ ...newTitle, genres: selectedGenres.join(", "), genre: selectedGenres[0] || "" })
    setTitleLoading(false)
    if (res.error) { setTitleError(res.error); return }
    setNewTitle({ title: "", description: "", genre: "", genres: "", author_name: "", age_rating: "12+" })
    setSelectedGenres([])
    await loadTitles()
    setView("titles")
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const results: { filename: string; data: string; preview: string }[] = []
    for (const file of files) {
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve((reader.result as string).split(",")[1])
        reader.readAsDataURL(file)
      })
      results.push({ filename: file.name, data: base64, preview: URL.createObjectURL(file) })
    }
    setPages(prev => [...prev, ...results])
  }

  async function handleUploadChapter(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedTitle || pages.length === 0) { setUploadError("Добавьте хотя бы одну страницу"); return }
    setUploadError(""); setUploadLoading(true); setUploadSuccess(false)
    const res = await apiUploadChapter({
      title_id: selectedTitle.id,
      chapter_number: parseInt(chapterNum),
      chapter_title: chapterTitle,
      pages: pages.map(({ filename, data }) => ({ filename, data })),
    })
    setUploadLoading(false)
    if (res.error) { setUploadError(res.error); return }
    setUploadSuccess(true)
    setChapterNum(""); setChapterTitle(""); setPages([])
    await loadChapters(selectedTitle.id)
    setTimeout(() => { setUploadSuccess(false); setView("chapters") }, 1500)
  }

  function logout() { clearSession(); navigate("/") }

  const inputCls = "w-full px-4 py-3 text-sm bg-transparent border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
  const cardStyle = { background: "hsl(var(--surface))", borderRadius: "var(--radius)", border: "1px solid hsl(var(--border))" }

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--midnight))" }}>
      <header className="border-b border-border px-6 py-4 flex items-center justify-between" style={{ background: "hsl(var(--surface))" }}>
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-1">
            <span className="font-serif text-xl text-foreground">Манга</span>
            <span className="font-serif text-xl" style={{ color: "hsl(var(--crimson))" }}>Джун</span>
          </a>
          <span className="text-xs text-muted-foreground px-2 py-1 border border-border" style={{ borderRadius: "var(--radius)" }}>Кабинет автора</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:block">{session.username}</span>
          <button onClick={logout} className="text-xs tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
            <Icon name="LogOut" size={14} /> Выйти
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Titles list */}
        {view === "titles" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h1 className="font-serif text-3xl font-light text-foreground">Мои тайтлы</h1>
              <button onClick={() => setView("new-title")} className="flex items-center gap-2 px-5 py-3 text-xs tracking-widest uppercase text-white hover:opacity-90" style={{ background: "hsl(var(--crimson))", borderRadius: "var(--radius)" }}>
                <Icon name="Plus" size={14} /> Новый тайтл
              </button>
            </div>
            {titles.length === 0 ? (
              <div className="text-center py-20" style={cardStyle}>
                <Icon name="BookOpen" size={40} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">У вас пока нет тайтлов</p>
                <button onClick={() => setView("new-title")} className="px-6 py-3 text-sm tracking-widest uppercase text-white" style={{ background: "hsl(var(--crimson))", borderRadius: "var(--radius)" }}>
                  Создать первый
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {titles.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-5 cursor-pointer hover:border-primary/40 transition-all duration-300" style={cardStyle}
                    onClick={() => { setSelectedTitle(t); loadChapters(t.id); setView("chapters") }}>
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-1">{t.title}</h3>
                      <div className="flex items-center gap-3 flex-wrap">
                        {t.author_name && <span className="text-xs text-muted-foreground">✍️ {t.author_name}</span>}
                        {t.genres && <span className="text-xs text-muted-foreground">{t.genres}</span>}
                        {t.age_rating && (
                          <span className="text-xs px-2 py-0.5 border border-border" style={{ borderRadius: "999px", color: t.age_rating === "18+" ? "hsl(var(--crimson))" : "hsl(var(--muted-foreground))" }}>
                            {t.age_rating}
                          </span>
                        )}
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* New title form */}
        {view === "new-title" && (
          <div className="max-w-lg">
            <button onClick={() => setView("titles")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <Icon name="ArrowLeft" size={16} /> Назад
            </button>
            <h1 className="font-serif text-3xl font-light text-foreground mb-8">Новый тайтл</h1>
            <form onSubmit={handleCreateTitle} className="space-y-5">

              <div>
                <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">Название манги *</label>
                <input className={inputCls} style={{ borderRadius: "var(--radius)" }} placeholder="Название произведения" value={newTitle.title} onChange={(e) => setNewTitle({ ...newTitle, title: e.target.value })} required />
              </div>

              <div>
                <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">Имя автора / создателя *</label>
                <input className={inputCls} style={{ borderRadius: "var(--radius)" }} placeholder="Например: Кэнтаро Миура" value={newTitle.author_name} onChange={(e) => setNewTitle({ ...newTitle, author_name: e.target.value })} required />
              </div>

              <div>
                <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-3">Жанры</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES_LIST.map((g) => (
                    <button
                      key={g} type="button"
                      onClick={() => toggleGenre(g)}
                      className="px-3 py-1.5 text-xs transition-all duration-200"
                      style={{
                        borderRadius: "999px",
                        border: `1px solid ${selectedGenres.includes(g) ? "hsl(var(--crimson))" : "hsl(var(--border))"}`,
                        background: selectedGenres.includes(g) ? "hsl(var(--crimson) / 0.15)" : "transparent",
                        color: selectedGenres.includes(g) ? "hsl(var(--crimson))" : "hsl(var(--muted-foreground))",
                      }}
                    >{g}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-3">Возрастное ограничение</label>
                <div className="flex gap-2">
                  {AGE_RATINGS.map((r) => (
                    <button
                      key={r} type="button"
                      onClick={() => setNewTitle({ ...newTitle, age_rating: r })}
                      className="px-4 py-2 text-sm font-medium transition-all duration-200"
                      style={{
                        borderRadius: "var(--radius)",
                        border: `1px solid ${newTitle.age_rating === r ? (r === "18+" ? "hsl(var(--crimson))" : "hsl(var(--primary))") : "hsl(var(--border))"}`,
                        background: newTitle.age_rating === r ? (r === "18+" ? "hsl(var(--crimson) / 0.15)" : "hsl(var(--primary) / 0.15)") : "transparent",
                        color: newTitle.age_rating === r ? (r === "18+" ? "hsl(var(--crimson))" : "hsl(var(--primary))") : "hsl(var(--muted-foreground))",
                      }}
                    >{r}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">Описание</label>
                <textarea className={inputCls} style={{ borderRadius: "var(--radius)", resize: "none" }} rows={4} placeholder="Краткое описание сюжета..." value={newTitle.description} onChange={(e) => setNewTitle({ ...newTitle, description: e.target.value })} />
              </div>

              {titleError && <div className="text-sm p-3" style={{ background: "hsl(var(--crimson) / 0.1)", color: "hsl(var(--crimson))", borderRadius: "var(--radius)" }}>{titleError}</div>}
              <button type="submit" disabled={titleLoading} className="w-full py-4 text-sm tracking-widest uppercase text-white hover:opacity-90 disabled:opacity-50" style={{ background: "hsl(var(--crimson))", borderRadius: "var(--radius)" }}>
                {titleLoading ? "Создаём..." : "Создать тайтл"}
              </button>
            </form>
          </div>
        )}

        {/* Chapters list */}
        {view === "chapters" && selectedTitle && (
          <div>
            <button onClick={() => setView("titles")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <Icon name="ArrowLeft" size={16} /> Мои тайтлы
            </button>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="font-serif text-3xl font-light text-foreground">{selectedTitle.title}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {selectedTitle.author_name && <span className="text-sm text-muted-foreground">✍️ {selectedTitle.author_name}</span>}
                  {selectedTitle.genres && <span className="text-xs text-muted-foreground">{selectedTitle.genres}</span>}
                  {selectedTitle.age_rating && (
                    <span className="text-xs px-2 py-0.5 border border-border" style={{ borderRadius: "999px", color: selectedTitle.age_rating === "18+" ? "hsl(var(--crimson))" : "hsl(var(--muted-foreground))" }}>
                      {selectedTitle.age_rating}
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => { setView("upload-chapter"); setUploadSuccess(false) }} className="flex items-center gap-2 px-5 py-3 text-xs tracking-widest uppercase text-white hover:opacity-90 flex-shrink-0" style={{ background: "hsl(var(--crimson))", borderRadius: "var(--radius)" }}>
                <Icon name="Upload" size={14} /> Загрузить главу
              </button>
            </div>

            <div className="mt-8 space-y-3">
              {chapters.length === 0 ? (
                <div className="text-center py-16" style={cardStyle}>
                  <Icon name="FileImage" size={36} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-muted-foreground">Глав пока нет — загрузите первую</p>
                </div>
              ) : chapters.map((ch) => {
                const s = STATUS_LABEL[ch.moderation_status] || STATUS_LABEL.pending
                const isOpen = expandedChapter === ch.id
                const chComments = commentsMap[ch.id] || []
                return (
                  <div key={ch.id} style={cardStyle}>
                    <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => toggleChapter(ch.id)}>
                      <div>
                        <span className="text-sm font-medium text-foreground">Глава {ch.chapter_number}</span>
                        {ch.chapter_title && <span className="text-sm text-muted-foreground ml-2">— {ch.chapter_title}</span>}
                        {ch.moderation_comment && ch.moderation_status === "rejected" && (
                          <p className="text-xs mt-1" style={{ color: "hsl(var(--crimson))" }}>Причина: {ch.moderation_comment}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-medium" style={{ color: s.color }}>{s.label}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Icon name="MessageSquare" size={13} />
                          <span>{chComments.length}</span>
                        </div>
                        <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground" />
                      </div>
                    </div>

                    {isOpen && (
                      <div className="border-t border-border px-4 pb-4 pt-4">
                        <p className="text-xs tracking-widest uppercase text-muted-foreground mb-4">Комментарии</p>
                        {chComments.length === 0 ? (
                          <p className="text-sm text-muted-foreground mb-4">Комментариев пока нет</p>
                        ) : (
                          <div className="space-y-3 mb-4">
                            {chComments.map((c) => (
                              <div key={c.id} className="flex gap-3">
                                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium text-white" style={{ background: "hsl(var(--crimson) / 0.7)" }}>
                                  {c.username[0]?.toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-medium text-foreground">{c.username}</span>
                                    <span className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleDateString("ru")}</span>
                                  </div>
                                  <p className="text-sm text-muted-foreground leading-relaxed">{c.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {session.token && (
                          <div className="flex gap-3">
                            <input
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="Написать комментарий..."
                              className="flex-1 px-3 py-2 text-sm bg-transparent border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                              style={{ borderRadius: "var(--radius)" }}
                              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handlePostComment(ch.id) } }}
                            />
                            <button
                              onClick={() => handlePostComment(ch.id)}
                              disabled={commentLoading || !commentText.trim()}
                              className="px-4 py-2 text-xs text-white disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-1"
                              style={{ background: "hsl(var(--crimson))", borderRadius: "var(--radius)" }}
                            >
                              <Icon name="Send" size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Upload chapter */}
        {view === "upload-chapter" && selectedTitle && (
          <div className="max-w-2xl">
            <button onClick={() => setView("chapters")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
              <Icon name="ArrowLeft" size={16} /> Назад к главам
            </button>
            <h1 className="font-serif text-3xl font-light text-foreground mb-2">Загрузить главу</h1>
            <p className="text-sm text-muted-foreground mb-8">Тайтл: <span className="text-foreground">{selectedTitle.title}</span></p>
            <form onSubmit={handleUploadChapter} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">Номер главы *</label>
                  <input type="number" min="1" className={inputCls} style={{ borderRadius: "var(--radius)" }} placeholder="1" value={chapterNum} onChange={(e) => setChapterNum(e.target.value)} required />
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-2">Название (необязательно)</label>
                  <input className={inputCls} style={{ borderRadius: "var(--radius)" }} placeholder="Пробуждение" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase text-muted-foreground block mb-3">Страницы (PNG / JPG)</label>
                <div className="border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer p-8 text-center" style={{ borderRadius: "var(--radius)" }} onClick={() => fileInputRef.current?.click()}>
                  <Icon name="ImagePlus" size={32} className="mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Нажмите или перетащите файлы</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG — несколько файлов сразу</p>
                  <input ref={fileInputRef} type="file" multiple accept="image/png,image/jpeg" className="hidden" onChange={handleFileSelect} />
                </div>
                {pages.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-muted-foreground">{pages.length} страниц выбрано</span>
                      <button type="button" onClick={() => setPages([])} className="text-xs" style={{ color: "hsl(var(--crimson))" }}>Очистить</button>
                    </div>
                    <div className="grid grid-cols-6 gap-2">
                      {pages.map((p, i) => (
                        <div key={i} className="relative aspect-[3/4] overflow-hidden" style={{ borderRadius: "var(--radius)" }}>
                          <img src={p.preview} className="w-full h-full object-cover" alt={`page ${i + 1}`} />
                          <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-white py-0.5" style={{ background: "rgba(0,0,0,0.6)" }}>{i + 1}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {uploadError && <div className="text-sm p-3" style={{ background: "hsl(var(--crimson) / 0.1)", color: "hsl(var(--crimson))", borderRadius: "var(--radius)" }}>{uploadError}</div>}
              {uploadSuccess && <div className="text-sm p-3" style={{ background: "hsl(150 60% 45% / 0.1)", color: "hsl(150 60% 45%)", borderRadius: "var(--radius)" }}>Глава отправлена на модерацию!</div>}
              <button type="submit" disabled={uploadLoading || pages.length === 0} className="w-full py-4 text-sm tracking-widest uppercase text-white hover:opacity-90 disabled:opacity-50" style={{ background: "hsl(var(--crimson))", borderRadius: "var(--radius)" }}>
                {uploadLoading ? "Загружаем..." : "Отправить на модерацию"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
