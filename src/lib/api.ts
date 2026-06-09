const URLS = {
  auth: "https://functions.poehali.dev/1cc068cb-a758-49e8-98e2-0cf22a359f8c",
  titles: "https://functions.poehali.dev/bede76d5-c690-428d-9070-a03d9ee809bb",
  chapters: "https://functions.poehali.dev/5910e0a9-26f5-47ca-ae3b-b0f2d979caba",
  moderation: "https://functions.poehali.dev/f5f197dd-58ed-4b85-93a1-4e8a4b80805b",
}

function getToken() {
  return localStorage.getItem("manga_token") || ""
}

function authHeaders() {
  return { "Content-Type": "application/json", "X-Auth-Token": getToken() }
}

export async function apiRegister(email: string, password: string, username: string) {
  const r = await fetch(`${URLS.auth}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, username }),
  })
  return r.json()
}

export async function apiLogin(email: string, password: string) {
  const r = await fetch(`${URLS.auth}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  return r.json()
}

export async function apiMe() {
  const r = await fetch(`${URLS.auth}/me`, { headers: authHeaders() })
  return r.json()
}

export async function apiGetTitles() {
  const r = await fetch(URLS.titles, { headers: authHeaders() })
  return r.json()
}

export async function apiCreateTitle(data: { title: string; description: string; genre: string }) {
  const r = await fetch(URLS.titles, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return r.json()
}

export async function apiGetChapters(title_id: number) {
  const r = await fetch(`${URLS.chapters}?title_id=${title_id}`, { headers: authHeaders() })
  return r.json()
}

export async function apiUploadChapter(data: {
  title_id: number
  chapter_number: number
  chapter_title: string
  pages: { filename: string; data: string }[]
}) {
  const r = await fetch(URLS.chapters, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  })
  return r.json()
}

export async function apiGetModeration() {
  const r = await fetch(URLS.moderation, { headers: authHeaders() })
  return r.json()
}

export async function apiModerate(chapter_id: number, action: "approve" | "reject", comment: string) {
  const r = await fetch(URLS.moderation, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ chapter_id, action, comment }),
  })
  return r.json()
}

export function saveSession(token: string, role: string, username: string, user_id: number) {
  localStorage.setItem("manga_token", token)
  localStorage.setItem("manga_role", role)
  localStorage.setItem("manga_username", username)
  localStorage.setItem("manga_user_id", String(user_id))
}

export function getSession() {
  return {
    token: localStorage.getItem("manga_token"),
    role: localStorage.getItem("manga_role"),
    username: localStorage.getItem("manga_username"),
    user_id: localStorage.getItem("manga_user_id"),
  }
}

export function clearSession() {
  localStorage.removeItem("manga_token")
  localStorage.removeItem("manga_role")
  localStorage.removeItem("manga_username")
  localStorage.removeItem("manga_user_id")
}
