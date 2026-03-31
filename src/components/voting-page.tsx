import { useState, useEffect } from "react"
import { useTheme } from "./theme-context"
import { themes } from "@/lib/themes"
import { cn } from "@/lib/utils"
import Icon from "@/components/ui/icon"

const CONTESTANTS_URL = "https://functions.poehali.dev/1e78b0d1-6ddf-4c8b-a99c-35c0892638e2"
const VOTE_URL = "https://functions.poehali.dev/00097a68-de18-4397-8e30-7f344e91e7d7"

const VOTE_START = new Date("2026-04-20T00:00:00+08:00")

interface Contestant {
  id: number
  full_name: string
  age: number
  city: string
  occupation: string
  about: string
  photo1_url: string | null
  photo2_url: string | null
  photo3_url: string | null
  nomination: string
  votes: number
}

export function VotingPage() {
  const { theme } = useTheme()
  const t = themes[theme]

  const [contestants, setContestants] = useState<Contestant[]>([])
  const [loading, setLoading] = useState(true)
  const [votedIds, setVotedIds] = useState<Set<number>>(new Set())
  const [votingContestant, setVotingContestant] = useState<number | null>(null)
  const [voteError, setVoteError] = useState<{ [id: number]: string }>({})
  const [filter, setFilter] = useState<"all" | "miss" | "mrs">("all")
  const [selected, setSelected] = useState<Contestant | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState(0)

  const isVotingOpen = new Date() >= VOTE_START
  const timeUntilVoting = VOTE_START.getTime() - Date.now()
  const daysLeft = Math.ceil(timeUntilVoting / (1000 * 60 * 60 * 24))

  useEffect(() => {
    fetch(CONTESTANTS_URL)
      .then((r) => r.json())
      .then((d) => setContestants(d.contestants || []))
      .finally(() => setLoading(false))
    const saved = localStorage.getItem("voted_contestants")
    if (saved) setVotedIds(new Set(JSON.parse(saved)))
  }, [])

  const handleVote = async (id: number) => {
    setVotingContestant(id)
    setVoteError((e) => ({ ...e, [id]: "" }))
    try {
      const res = await fetch(VOTE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contestant_id: id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Ошибка")
      const newVoted = new Set(votedIds).add(id)
      setVotedIds(newVoted)
      localStorage.setItem("voted_contestants", JSON.stringify([...newVoted]))
      setContestants((prev) =>
        prev.map((c) => (c.id === id ? { ...c, votes: data.votes } : c))
      )
      if (selected?.id === id) setSelected((s) => s ? { ...s, votes: data.votes } : s)
    } catch (err: unknown) {
      setVoteError((e) => ({
        ...e,
        [id]: err instanceof Error ? err.message : "Ошибка голосования",
      }))
    } finally {
      setVotingContestant(null)
    }
  }

  const filtered = contestants.filter((c) => {
    if (filter === "miss") return c.nomination === "miss"
    if (filter === "mrs") return c.nomination === "mrs"
    return true
  })

  const openCard = (c: Contestant) => {
    setSelected(c)
    setSelectedPhoto(0)
  }

  const getPhotos = (c: Contestant) =>
    [c.photo1_url, c.photo2_url, c.photo3_url].filter(Boolean) as string[]

  const cardClass = cn(
    "rounded-2xl border overflow-hidden transition-all duration-200 hover:scale-[1.02] cursor-pointer",
    t.card, t.border, t.shadow,
    theme === "neon" && "hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]",
    theme === "luxury" && "hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]",
    theme === "glass" && "bg-white/50 backdrop-blur-xl",
  )

  const btnClass = cn(
    "w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-200",
    "hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
    t.accent, t.accentForeground, t.fontClass,
    theme === "neon" && "shadow-[0_0_20px_rgba(34,211,238,0.4)]",
    theme === "luxury" && "shadow-[0_0_20px_rgba(251,191,36,0.3)]",
  )

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-20 gap-3", t.mutedForeground, t.fontClass)}>
        <Icon name="Loader2" size={24} className="animate-spin" />
        <span>Загружаем участниц...</span>
      </div>
    )
  }

  return (
    <div className="w-full flex flex-col gap-8">
      {/* Статус голосования */}
      {!isVotingOpen && (
        <div
          className={cn(
            "w-full p-5 rounded-2xl border text-center",
            t.muted, t.border, t.fontClass,
            theme === "neon" && "border-cyan-500/30",
            theme === "luxury" && "border-amber-500/30",
          )}
        >
          <div className="text-3xl mb-2">🗓️</div>
          <p className={cn("font-bold text-lg mb-1", t.foreground)}>
            Голосование откроется 20 апреля 2026
          </p>
          <p className={cn("text-sm", t.mutedForeground)}>
            {daysLeft > 0 ? `Осталось ${daysLeft} ${daysLeft === 1 ? "день" : daysLeft < 5 ? "дня" : "дней"}` : "Совсем скоро!"}
          </p>
        </div>
      )}

      {/* Фильтры */}
      {contestants.length > 0 && (
        <div className="flex gap-2 justify-center flex-wrap">
          {[
            { key: "all", label: "Все участницы" },
            { key: "miss", label: "Мисс интернет" },
            { key: "mrs", label: "Миссис интернет" },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key as typeof filter)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                t.fontClass,
                filter === f.key
                  ? cn(t.accent, t.accentForeground, "border-transparent")
                  : cn(t.muted, t.mutedForeground, t.border),
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Пустое состояние */}
      {contestants.length === 0 && (
        <div className={cn("text-center py-16", t.mutedForeground, t.fontClass)}>
          <div className="text-5xl mb-4">👑</div>
          <p className="text-lg font-medium">Заявки ещё не поданы</p>
          <p className="text-sm mt-2">Сбор заявок открыт до 20 апреля</p>
        </div>
      )}

      {/* Карточки участниц */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((c) => {
          const photos = getPhotos(c)
          const voted = votedIds.has(c.id)
          return (
            <div key={c.id} className={cardClass} onClick={() => openCard(c)}>
              {/* Фото */}
              <div className="relative aspect-[3/4] bg-black/10 overflow-hidden">
                {photos[0] ? (
                  <img src={photos[0]} alt={c.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className={cn("w-full h-full flex items-center justify-center", t.muted)}>
                    <Icon name="User" size={48} className={t.mutedForeground} />
                  </div>
                )}
                {/* Номинация */}
                <div
                  className={cn(
                    "absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold",
                    t.accent, t.accentForeground,
                  )}
                >
                  {c.nomination === "miss" ? "Мисс" : "Миссис"}
                </div>
                {/* Голоса */}
                {isVotingOpen && (
                  <div className="absolute top-3 right-3 bg-black/60 text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
                    <Icon name="Heart" size={11} />
                    {c.votes}
                  </div>
                )}
              </div>

              {/* Инфо */}
              <div className="p-4 flex flex-col gap-3">
                <div>
                  <p className={cn("font-bold text-base leading-tight", t.cardForeground, t.fontClass)}>
                    {c.full_name}
                  </p>
                  <p className={cn("text-xs mt-0.5", t.mutedForeground, t.fontClass)}>
                    {c.age} лет · {c.city}
                  </p>
                </div>

                {/* Кнопка голосования */}
                {isVotingOpen && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleVote(c.id) }}
                    disabled={voted || votingContestant === c.id}
                    className={cn(
                      btnClass,
                      voted && cn("opacity-100 cursor-default", t.muted, t.mutedForeground, "border", t.border),
                    )}
                  >
                    {votingContestant === c.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Icon name="Loader2" size={14} className="animate-spin" /> Голосуем...
                      </span>
                    ) : voted ? (
                      <span className="flex items-center justify-center gap-2">
                        <Icon name="CheckCircle2" size={14} /> Вы проголосовали
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Icon name="Heart" size={14} /> Голосовать
                      </span>
                    )}
                  </button>
                )}
                {voteError[c.id] && (
                  <p className="text-red-500 text-xs text-center">{voteError[c.id]}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Модальное окно участницы */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className={cn(
              "relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border",
              t.card, t.border, t.shadow,
              theme === "glass" && "bg-white/80 backdrop-blur-xl",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Закрыть */}
            <button
              onClick={() => setSelected(null)}
              className={cn(
                "absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center",
                t.muted, t.mutedForeground, "hover:opacity-80 transition",
              )}
            >
              <Icon name="X" size={16} />
            </button>

            {/* Фото галерея */}
            {(() => {
              const photos = getPhotos(selected)
              return photos.length > 0 ? (
                <div className="relative">
                  <img
                    src={photos[selectedPhoto]}
                    alt={selected.full_name}
                    className="w-full aspect-video object-cover rounded-t-2xl"
                  />
                  {photos.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                      {photos.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedPhoto(i)}
                          className={cn(
                            "w-2.5 h-2.5 rounded-full transition-all",
                            i === selectedPhoto ? "bg-white scale-125" : "bg-white/50",
                          )}
                        />
                      ))}
                    </div>
                  )}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedPhoto((p) => Math.max(0, p - 1))}
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                      >
                        <Icon name="ChevronLeft" size={18} />
                      </button>
                      <button
                        onClick={() => setSelectedPhoto((p) => Math.min(photos.length - 1, p + 1))}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                      >
                        <Icon name="ChevronRight" size={18} />
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div className={cn("w-full aspect-video rounded-t-2xl flex items-center justify-center", t.muted)}>
                  <Icon name="User" size={64} className={t.mutedForeground} />
                </div>
              )
            })()}

            {/* Данные */}
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div
                    className={cn(
                      "inline-block px-2.5 py-1 rounded-full text-xs font-bold mb-2",
                      t.accent, t.accentForeground,
                    )}
                  >
                    {selected.nomination === "miss" ? "Мисс интернет" : "Миссис интернет"}
                  </div>
                  <h2 className={cn("text-2xl font-bold", t.cardForeground, t.fontClass)}>
                    {selected.full_name}
                  </h2>
                  <p className={cn("text-sm mt-1", t.mutedForeground, t.fontClass)}>
                    {selected.age} лет · {selected.city}
                    {selected.occupation && ` · ${selected.occupation}`}
                  </p>
                </div>
                {isVotingOpen && (
                  <div className={cn("flex items-center gap-1.5 text-lg font-bold", t.cardForeground)}>
                    <Icon name="Heart" size={20} className={cn(
                      theme === "luxury" ? "text-amber-400" : theme === "neon" ? "text-cyan-400" : "text-pink-500"
                    )} />
                    {selected.votes}
                  </div>
                )}
              </div>

              {selected.about && (
                <p className={cn("text-sm leading-relaxed", t.mutedForeground, t.fontClass)}>
                  {selected.about}
                </p>
              )}

              {isVotingOpen && (
                <button
                  onClick={() => handleVote(selected.id)}
                  disabled={votedIds.has(selected.id) || votingContestant === selected.id}
                  className={cn(
                    btnClass,
                    votedIds.has(selected.id) && cn("opacity-100 cursor-default", t.muted, t.mutedForeground, "border", t.border),
                  )}
                >
                  {votingContestant === selected.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Icon name="Loader2" size={16} className="animate-spin" /> Голосуем...
                    </span>
                  ) : votedIds.has(selected.id) ? (
                    <span className="flex items-center justify-center gap-2">
                      <Icon name="CheckCircle2" size={16} /> Вы уже проголосовали
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Icon name="Heart" size={16} /> Проголосовать за участницу
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
