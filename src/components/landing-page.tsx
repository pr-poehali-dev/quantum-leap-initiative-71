import { useState } from "react"
import { ThemedCountdown } from "./themed-countdown"
import { ThemeSwitcher } from "./theme-switcher"
import { useTheme } from "./theme-context"
import { themes, type ThemeMode } from "@/lib/themes"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowRight, Bell, Sparkles, Zap, Shield, Star } from "lucide-react"
import { ContestantForm } from "./contestant-form"

export function LandingPage() {
  const { theme } = useTheme()
  const themeConfig = themes[theme]

  const [targetDate, setTargetDate] = useState<Date>(() => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date
  })

  const [days, setDays] = useState("7")
  const [hours, setHours] = useState("0")
  const [minutes, setMinutes] = useState("0")
  const [seconds, setSeconds] = useState("0")
  const [email, setEmail] = useState("")
  const [showSettings, setShowSettings] = useState(false)

  const handleSetTimer = () => {
    const newTarget = new Date()
    newTarget.setDate(newTarget.getDate() + Number.parseInt(days || "0"))
    newTarget.setHours(newTarget.getHours() + Number.parseInt(hours || "0"))
    newTarget.setMinutes(newTarget.getMinutes() + Number.parseInt(minutes || "0"))
    newTarget.setSeconds(newTarget.getSeconds() + Number.parseInt(seconds || "0"))
    setTargetDate(newTarget)
    setShowSettings(false)
  }

  // Theme-specific content
  const content: Record<
    ThemeMode,
    {
      badge: string
      title: string
      highlight: string
      subtitle: string
      cta: string
      features: { icon: typeof Sparkles; text: string }[]
    }
  > = {
    "minimal-light": {
      badge: "Голосование открывается скоро",
      title: "МИСС И МИССИС",
      highlight: "интернет Забайкальский край",
      subtitle:
        "Поддержи самых ярких и красивых участниц конкурса! Голосование начнётся совсем скоро — не пропусти.",
      cta: "Уведомить о старте голосования",
      features: [
        { icon: Sparkles, text: "Честное голосование" },
        { icon: Star, text: "Открытый конкурс" },
        { icon: Shield, text: "Забайкальский край" },
      ],
    },
    dark: {
      badge: "Скоро старт",
      title: "МИСС И МИССИС",
      highlight: "интернет Забайкальский край",
      subtitle: "Голосуй за свою любимицу и помоги ей завоевать корону! Регистрируйся, чтобы не пропустить старт.",
      cta: "Зарегистрироваться на голосование",
      features: [
        { icon: Sparkles, text: "Честное голосование" },
        { icon: Star, text: "Открытый конкурс" },
        { icon: Shield, text: "Забайкальский край" },
      ],
    },
    retro: {
      badge: "Конкурс красоты",
      title: "МИСС И МИССИС",
      highlight: "интернет Забайкальский край",
      subtitle: "Традиции красоты и грации встречают современный формат. Поддержи свою участницу — голосование скоро!",
      cta: "Получить уведомление",
      features: [
        { icon: Sparkles, text: "Красота и грация" },
        { icon: Star, text: "Открытый конкурс" },
        { icon: Shield, text: "Забайкальский край" },
      ],
    },
    neon: {
      badge: "[ ГОЛОСОВАНИЕ СКОРО ]",
      title: "МИСС И МИССИС",
      highlight: "ЗАБАЙКАЛЬСКИЙ КРАЙ",
      subtitle: "Интернет-конкурс красоты нового формата. Голосуй за лучшую. Определи победительницу.",
      cta: "ПОЛУЧИТЬ УВЕДОМЛЕНИЕ",
      features: [
        { icon: Sparkles, text: "ЧЕСТНО" },
        { icon: Star, text: "ОТКРЫТО" },
        { icon: Shield, text: "ЗАБАЙКАЛЬЕ" },
      ],
    },
    monochrome: {
      badge: "Анонс конкурса",
      title: "МИСС И МИССИС",
      highlight: "интернет Забайкальский край",
      subtitle: "Элегантность. Красота. Характер. Поддержи достойную участницу в конкурсе красоты.",
      cta: "Получить уведомление о старте",
      features: [
        { icon: Sparkles, text: "Красота" },
        { icon: Star, text: "Грация" },
        { icon: Shield, text: "Забайкальский край" },
      ],
    },
    glass: {
      badge: "Конкурс красоты",
      title: "МИСС И МИССИС",
      highlight: "интернет Забайкальский край",
      subtitle: "Открытое интернет-голосование за самых красивых и ярких участниц Забайкальского края.",
      cta: "Уведомить о старте",
      features: [
        { icon: Sparkles, text: "Красота" },
        { icon: Star, text: "Открытое голосование" },
        { icon: Shield, text: "Забайкальский край" },
      ],
    },
    terminal: {
      badge: "> статус: ожидание_старта",
      title: "МИСС И МИССИС",
      highlight: "интернет Забайкальский край",
      subtitle: "// конкурс красоты. интернет-голосование. открытый формат. скоро...",
      cta: "$ подписаться --уведомление",
      features: [
        { icon: Sparkles, text: "--красота" },
        { icon: Star, text: "--голосование" },
        { icon: Shield, text: "--забайкалье" },
      ],
    },
    luxury: {
      badge: "Эксклюзивный конкурс красоты",
      title: "МИСС И МИССИС",
      highlight: "интернет Забайкальский край",
      subtitle:
        "Изысканность, красота и неповторимый характер. Голосуй за участницу, достойную короны.",
      cta: "Получить приглашение",
      features: [
        { icon: Sparkles, text: "Элегантность" },
        { icon: Star, text: "Корона" },
        { icon: Shield, text: "Забайкальский край" },
      ],
    },
  }

  const currentContent = content[theme]

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col transition-all duration-500 relative overflow-hidden",
        themeConfig.background,
      )}
    >
      {/* Subtle background decoration */}
      {theme === "neon" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
      )}
      {theme === "glass" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-300/30 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-pink-300/30 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>
      )}
      {theme === "luxury" && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 w-[800px] h-[400px] bg-gradient-to-r from-amber-500/5 via-yellow-500/10 to-amber-500/5 rounded-full blur-3xl -translate-x-1/2" />
        </div>
      )}

      {/* Header with Theme Switcher */}
      <header className="relative z-50 w-full">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center text-center justify-center">
          <ThemeSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 relative z-10">
        <div className="max-w-4xl w-full flex flex-col items-center gap-6 sm:gap-10">
          {/* Badge */}
          <div
            className={cn(
              "inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium border transition-all",
              themeConfig.muted,
              themeConfig.border,
              themeConfig.mutedForeground,
              themeConfig.fontClass,
              theme === "neon" && "shadow-[0_0_15px_rgba(34,211,238,0.3)] border-cyan-500/50",
              theme === "luxury" && "border-amber-500/30",
            )}
          >
            <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
            {currentContent.badge}
          </div>

          {/* Main Headline */}
          <div className="text-center space-y-3 sm:space-y-4">
            <h1
              className={cn(
                "text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-balance leading-[1.1]",
                themeConfig.foreground,
                themeConfig.fontClass,
              )}
            >
              {currentContent.title}{" "}
              <span
                className={cn(
                  "relative inline-block",
                  theme === "neon" && "text-cyan-400 [text-shadow:0_0_40px_rgba(34,211,238,0.6)]",
                  theme === "luxury" &&
                    "bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent",
                  theme === "glass" && "bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent",
                  theme === "retro" && "text-amber-700",
                  theme === "terminal" && "text-green-300",
                  (theme === "minimal-light" || theme === "monochrome" || theme === "dark") && themeConfig.foreground,
                )}
              >
                {currentContent.highlight}
              </span>
            </h1>
            <p
              className={cn(
                "text-base sm:text-lg md:text-xl max-w-2xl mx-auto text-pretty leading-relaxed px-2 sm:px-0",
                themeConfig.mutedForeground,
                themeConfig.fontClass,
              )}
            >
              {currentContent.subtitle}
            </p>
          </div>

          {/* Countdown Timer */}
          <div className="w-full flex flex-col items-center gap-2 sm:gap-3">
            <p
              className={cn(
                "text-xs sm:text-sm uppercase tracking-widest",
                themeConfig.mutedForeground,
                themeConfig.fontClass,
              )}
            >
              {theme === "terminal" ? "// время_до_голосования:" : "До старта голосования"}
            </p>
            <ThemedCountdown targetDate={targetDate} />
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                "text-xs underline-offset-4 hover:underline transition-all",
                themeConfig.mutedForeground,
                themeConfig.fontClass,
              )}
            >
              {theme === "terminal" ? "// modify_timer" : "Настроить таймер"}
            </button>
          </div>

          {/* Timer Settings (Collapsible) */}
          {showSettings && (
            <div
              className={cn(
                "flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl border transition-all duration-500 animate-in fade-in slide-in-from-top-2 w-full sm:w-auto",
                themeConfig.muted,
                themeConfig.border,
                theme === "neon" && "shadow-[0_0_30px_rgba(34,211,238,0.15)]",
                theme === "glass" && "backdrop-blur-xl bg-white/40",
              )}
            >
              <div className="grid grid-cols-4 gap-2 sm:flex sm:items-end sm:gap-3 sm:flex-wrap sm:justify-center w-full sm:w-auto">
                <div className="flex flex-col gap-1 sm:gap-1.5">
                  <Label htmlFor="days" className={cn("text-[10px] sm:text-xs", themeConfig.mutedForeground)}>
                    Дни
                  </Label>
                  <Input
                    id="days"
                    type="number"
                    min="0"
                    max="99"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className={cn(
                      "w-full sm:w-16 text-center text-sm",
                      themeConfig.card,
                      themeConfig.cardForeground,
                      themeConfig.border,
                      themeConfig.fontClass,
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1 sm:gap-1.5">
                  <Label htmlFor="hours" className={cn("text-[10px] sm:text-xs", themeConfig.mutedForeground)}>
                    Часы
                  </Label>
                  <Input
                    id="hours"
                    type="number"
                    min="0"
                    max="23"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className={cn(
                      "w-full sm:w-16 text-center text-sm",
                      themeConfig.card,
                      themeConfig.cardForeground,
                      themeConfig.border,
                      themeConfig.fontClass,
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1 sm:gap-1.5">
                  <Label htmlFor="minutes" className={cn("text-[10px] sm:text-xs", themeConfig.mutedForeground)}>
                    Мин
                  </Label>
                  <Input
                    id="minutes"
                    type="number"
                    min="0"
                    max="59"
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className={cn(
                      "w-full sm:w-16 text-center text-sm",
                      themeConfig.card,
                      themeConfig.cardForeground,
                      themeConfig.border,
                      themeConfig.fontClass,
                    )}
                  />
                </div>
                <div className="flex flex-col gap-1 sm:gap-1.5">
                  <Label htmlFor="seconds" className={cn("text-[10px] sm:text-xs", themeConfig.mutedForeground)}>
                    Сек
                  </Label>
                  <Input
                    id="seconds"
                    type="number"
                    min="0"
                    max="59"
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    className={cn(
                      "w-full sm:w-16 text-center text-sm",
                      themeConfig.card,
                      themeConfig.cardForeground,
                      themeConfig.border,
                      themeConfig.fontClass,
                    )}
                  />
                </div>
              </div>
              <button
                onClick={handleSetTimer}
                className={cn(
                  "w-full sm:w-auto px-5 py-2 rounded-lg font-medium transition-all duration-200",
                  "hover:scale-105 active:scale-95",
                  themeConfig.accent,
                  themeConfig.accentForeground,
                  themeConfig.fontClass,
                  theme === "neon" && "shadow-[0_0_20px_rgba(34,211,238,0.5)]",
                  theme === "luxury" && "shadow-[0_0_20px_rgba(251,191,36,0.3)]",
                )}
              >
                {theme === "terminal" ? "execute()" : "Задать"}
              </button>
            </div>
          )}

          {/* Email Signup */}
          <div
            className={cn(
              "w-full max-w-md flex flex-col gap-2 sm:gap-3 p-2 rounded-2xl border transition-all",
              themeConfig.muted,
              themeConfig.border,
              theme === "glass" && "backdrop-blur-xl bg-white/40",
              theme === "neon" && "shadow-[0_0_20px_rgba(34,211,238,0.1)]",
            )}
          >
            <Input
              type="email"
              placeholder={theme === "terminal" ? "your@email.sh" : "Ваш email для уведомления"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-sm sm:text-base",
                themeConfig.cardForeground,
                themeConfig.fontClass,
                "placeholder:opacity-50",
              )}
            />
            <button
              className={cn(
                "w-full px-4 sm:px-6 py-2.5 font-semibold transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base sm:py-1.5 rounded-lg",
                "hover:scale-[1.02] active:scale-[0.98]",
                themeConfig.accent,
                themeConfig.accentForeground,
                themeConfig.fontClass,
                theme === "neon" && "shadow-[0_0_25px_rgba(34,211,238,0.5)]",
                theme === "luxury" && "shadow-[0_0_25px_rgba(251,191,36,0.3)]",
              )}
            >
              {currentContent.cta}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Features */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-10 flex-wrap">
            {currentContent.features.map((feature, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm",
                  themeConfig.mutedForeground,
                  themeConfig.fontClass,
                )}
              >
                <feature.icon
                  className={cn(
                    "w-3.5 h-3.5 sm:w-4 sm:h-4",
                    theme === "neon" && "text-cyan-400",
                    theme === "luxury" && "text-amber-400",
                    theme === "glass" && "text-indigo-500",
                  )}
                />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Contestant Application Form */}
          <div
            className={cn(
              "w-full mt-4 sm:mt-6 p-6 sm:p-8 rounded-2xl border",
              themeConfig.card,
              themeConfig.border,
              theme === "glass" && "backdrop-blur-xl bg-white/40",
              theme === "neon" && "shadow-[0_0_30px_rgba(34,211,238,0.1)]",
              theme === "luxury" && "shadow-[0_0_30px_rgba(251,191,36,0.08)]",
            )}
          >
            <div className="text-center mb-6">
              <h2
                className={cn(
                  "text-xl sm:text-2xl font-bold mb-2",
                  themeConfig.foreground,
                  themeConfig.fontClass,
                )}
              >
                {theme === "terminal" ? "$ submit_application()" : "Подать заявку на участие"}
              </h2>
              <p className={cn("text-sm", themeConfig.mutedForeground, themeConfig.fontClass)}>
                {theme === "terminal"
                  ? "// заполните анкету и загрузите фотографии"
                  : "Заполните анкету и загрузите до 3 фотографий"}
              </p>
            </div>
            <ContestantForm />
          </div>

          {/* Social Proof */}
          <div
            className={cn(
              "flex flex-col sm:flex-row items-center gap-3 sm:gap-4 pt-4 sm:pt-6",
              themeConfig.mutedForeground,
              themeConfig.fontClass,
            )}
          >
            <div className="flex -space-x-2">
              {[
                "/professional-woman-headshot.png",
                "/young-man-portrait-smiling.jpg",
                "/asian-woman-professional-photo.jpg",
                "/bearded-man-headshot.png",
                "/smiling-black-woman-portrait.png",
              ].map((src, i) => (
                <img
                  key={i}
                  src={src || "/placeholder.svg"}
                  alt={`User ${i + 1}`}
                  className={cn(
                    "w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 object-cover",
                    theme === "dark" || theme === "neon" || theme === "terminal" || theme === "luxury"
                      ? "border-zinc-800"
                      : "border-white",
                  )}
                />
              ))}
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-0.5 sm:gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current",
                      theme === "luxury" && "text-amber-400",
                      theme === "neon" && "text-cyan-400",
                      theme === "retro" && "text-amber-600",
                      (theme === "minimal-light" ||
                        theme === "dark" ||
                        theme === "monochrome" ||
                        theme === "glass" ||
                        theme === "terminal") &&
                        "text-current",
                    )}
                  />
                ))}
              </div>
              <span className="text-[10px] sm:text-xs">
                {theme === "terminal" ? "// 1248 участников_ждут" : "Уже 1 248+ ждут голосования"}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={cn(
          "relative z-10 py-6 sm:py-8 text-center border-t px-4",
          themeConfig.border,
          themeConfig.mutedForeground,
          themeConfig.fontClass,
        )}
      >
        <p className="text-xs sm:text-sm">
          {theme === "terminal"
            ? "© 2026 // miss_mrs_internet_zabaykalsky_kray | конкурс --красоты"
            : "© 2026 МИСС И МИССИС интернет Забайкальский край · Конкурс красоты"}
        </p>
      </footer>
    </div>
  )
}