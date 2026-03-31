import { useState, useRef } from "react"
import { useTheme } from "./theme-context"
import { themes } from "@/lib/themes"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Icon from "@/components/ui/icon"

const BACKEND_URL = "https://functions.poehali.dev/7cf6b3cb-1f71-4662-8c29-3c73faa8fee9"

interface PhotoSlot {
  file: File | null
  preview: string | null
  base64: string | null
}

export function ContestantForm() {
  const { theme } = useTheme()
  const t = themes[theme]

  const [form, setForm] = useState({
    full_name: "",
    age: "",
    city: "",
    occupation: "",
    about: "",
    phone: "",
    email: "",
    nomination: "miss",
  })

  const [photos, setPhotos] = useState<PhotoSlot[]>([
    { file: null, preview: null, base64: null },
    { file: null, preview: null, base64: null },
    { file: null, preview: null, base64: null },
  ])

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  const handlePhotoChange = (index: number, file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPhotos((prev) => {
        const updated = [...prev]
        updated[index] = { file, preview: result, base64: result }
        return updated
      })
    }
    reader.readAsDataURL(file)
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const updated = [...prev]
      updated[index] = { file: null, preview: null, base64: null }
      return updated
    })
    if (fileRefs[index].current) fileRefs[index].current!.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          age: Number(form.age),
          photos: photos.map((p) => p.base64).filter(Boolean),
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error || "Ошибка отправки")
      setSuccess(true)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ошибка отправки")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={cn("flex flex-col items-center gap-4 py-12 text-center", t.foreground, t.fontClass)}>
        <div className="text-5xl">👑</div>
        <h3 className="text-2xl font-bold">Заявка принята!</h3>
        <p className={cn("max-w-sm", t.mutedForeground)}>
          Мы получили вашу заявку и скоро свяжемся с вами. Удачи в конкурсе!
        </p>
      </div>
    )
  }

  const inputClass = cn(
    "w-full border rounded-lg px-3 py-2 text-sm transition-all",
    t.card, t.cardForeground, t.border, t.fontClass,
    "focus:outline-none focus:ring-2 focus:ring-offset-0",
    theme === "neon" && "focus:ring-cyan-500/50",
    theme === "luxury" && "focus:ring-amber-500/50",
    theme === "glass" && "focus:ring-indigo-500/50 bg-white/60",
    (theme === "minimal-light" || theme === "monochrome") && "focus:ring-gray-400/50",
    theme === "dark" && "focus:ring-zinc-500/50",
    theme === "retro" && "focus:ring-amber-600/50",
    theme === "terminal" && "focus:ring-green-500/50",
  )

  const labelClass = cn("text-xs font-medium mb-1 block", t.mutedForeground, t.fontClass)

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      {/* Номинация */}
      <div>
        <Label className={labelClass}>Номинация *</Label>
        <div className="flex gap-3">
          {[
            { value: "miss", label: "Мисс интернет" },
            { value: "mrs", label: "Миссис интернет" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, nomination: opt.value }))}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-all",
                t.fontClass,
                form.nomination === opt.value
                  ? cn(t.accent, t.accentForeground, "border-transparent", theme === "neon" && "shadow-[0_0_20px_rgba(34,211,238,0.4)]", theme === "luxury" && "shadow-[0_0_20px_rgba(251,191,36,0.3)]")
                  : cn(t.muted, t.mutedForeground, t.border),
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Личные данные */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label className={labelClass}>ФИО *</Label>
          <input
            className={inputClass}
            placeholder="Иванова Мария Сергеевна"
            value={form.full_name}
            onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label className={labelClass}>Возраст *</Label>
          <input
            className={inputClass}
            type="number"
            min="16"
            max="70"
            placeholder="25"
            value={form.age}
            onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label className={labelClass}>Город *</Label>
          <input
            className={inputClass}
            placeholder="Чита"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label className={labelClass}>Телефон *</Label>
          <input
            className={inputClass}
            type="tel"
            placeholder="+7 999 123-45-67"
            value={form.phone}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label className={labelClass}>Email *</Label>
          <input
            className={inputClass}
            type="email"
            placeholder="maria@example.com"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
        </div>
        <div className="sm:col-span-2">
          <Label className={labelClass}>Род деятельности</Label>
          <input
            className={inputClass}
            placeholder="Менеджер, предприниматель, студентка..."
            value={form.occupation}
            onChange={(e) => setForm((f) => ({ ...f, occupation: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <Label className={labelClass}>Немного о себе</Label>
          <textarea
            className={cn(inputClass, "resize-none h-24")}
            placeholder="Расскажите о своих увлечениях, мечтах, достижениях..."
            value={form.about}
            onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
          />
        </div>
      </div>

      {/* Фотографии */}
      <div>
        <Label className={labelClass}>Фотографии (до 3 штук)</Label>
        <div className="grid grid-cols-3 gap-3">
          {photos.map((photo, i) => (
            <div key={i} className="relative aspect-[3/4]">
              {photo.preview ? (
                <div className="relative w-full h-full">
                  <img
                    src={photo.preview}
                    alt={`Фото ${i + 1}`}
                    className={cn("w-full h-full object-cover rounded-xl border", t.border)}
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-all"
                  >
                    <Icon name="X" size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRefs[i].current?.click()}
                  className={cn(
                    "w-full h-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all hover:scale-[1.02]",
                    t.muted, t.border, t.mutedForeground,
                    theme === "neon" && "hover:border-cyan-500/60",
                    theme === "luxury" && "hover:border-amber-500/60",
                  )}
                >
                  <Icon name="Camera" size={22} />
                  <span className={cn("text-[11px]", t.fontClass)}>Фото {i + 1}</span>
                </button>
              )}
              <input
                ref={fileRefs[i]}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhotoChange(i, e.target.files?.[0] ?? null)}
              />
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-sm text-center">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full py-3 rounded-xl font-bold text-base transition-all duration-200",
          "hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
          t.accent, t.accentForeground, t.fontClass,
          theme === "neon" && "shadow-[0_0_30px_rgba(34,211,238,0.5)]",
          theme === "luxury" && "shadow-[0_0_30px_rgba(251,191,36,0.3)]",
        )}
      >
        {loading ? "Отправляем заявку..." : "Подать заявку на участие 👑"}
      </button>
    </form>
  )
}
