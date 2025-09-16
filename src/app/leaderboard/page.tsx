'use client'

import { useEffect, useMemo, useRef, useState, useId } from 'react'
import Image from 'next/image'
import MobileShell from '@/components/MobileShell'
import Header from '@/components/Header'
import OverlayMenu from '@/components/OverlayMenu'
import { useAuthStore } from '@/store/authStore'
import api from '@/lib/axios'
import { isAxiosError } from 'axios'
import * as htmlToImage from 'html-to-image'

type TimespanUI = 'All Time' | 'Monthly'
const TIMESPAN_TO_QUERY: Record<TimespanUI, 'alltime' | 'monthly'> = {
  'All Time': 'alltime',
  Monthly: 'monthly',
}

type Row = {
  rank: number
  username: string
  profilePictureUrl: string | null
  points: number
  totalReps: number
  gender?: 'MALE' | 'FEMALE'
}

type LeaderboardResponse = {
  pagination: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
  }
  leaderboard: Row[]
}

function frameForPoints(points: number | null | undefined): string {
  const p = Math.max(0, Number(points ?? 0))
  if (p >= 6000) return '/images/f_legendary.png'
  if (p >= 3000) return '/images/f_warrior.png'
  if (p >= 1000) return '/images/f_challenger.png'
  return '/images/f_rookie.png'
}

const isIOS =
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' &&
      typeof document !== 'undefined' &&
      'ontouchend' in document))

const FALLBACK_DATA_URI =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
       <rect width="100%" height="100%" fill="black"/>
       <circle cx="100" cy="80" r="40" fill="#222"/>
       <rect x="50" y="130" width="100" height="40" rx="8" fill="#222"/>
     </svg>`
  )

function proxiedSrc(src?: string | null): string {
  if (!src) return ''
  if (typeof window !== 'undefined') {
    if (src.startsWith('/') || src.startsWith(window.location.origin))
      return src
  } else if (src.startsWith('/')) return src
  return `/api/img?u=${encodeURIComponent(src)}`
}

function SafeImg({
  src,
  alt,
  fallbackLocal = '/images/placeholder_male.png',
  ...rest
}: {
  src: string
  alt: string
  fallbackLocal?: string
} & React.ImgHTMLAttributes<HTMLImageElement>) {
  return (
    <img
      {...rest}
      src={proxiedSrc(src)}
      alt={alt}
      referrerPolicy="no-referrer"
      loading="eager"
      style={{ display: 'block', ...(rest.style || {}) }}
      onError={(e) => {
        const img = e.currentTarget
        if (!img.src.includes(fallbackLocal)) {
          img.src = fallbackLocal
        } else {
          img.src = FALLBACK_DATA_URI
        }
      }}
    />
  )
}

function useShareSrc(src?: string | null): string {
  const [out, setOut] = useState<string>('')
  useEffect(() => {
    let cancelled = false
    const run = async () => {
      if (!src) {
        setOut('')
        return
      }
      const url = proxiedSrc(src)
      if (!isIOS) {
        setOut(url)
        return
      }
      try {
        const res = await fetch(url, { cache: 'no-store' })
        const blob = await res.blob()
        const dataUrl: string = await new Promise((resolve, reject) => {
          const fr = new FileReader()
          fr.onloadend = () => resolve(fr.result as string)
          fr.onerror = reject
          fr.readAsDataURL(blob)
        })
        if (!cancelled) setOut(dataUrl)
      } catch {
        if (!cancelled) setOut(FALLBACK_DATA_URI)
      }
    }
    run()
    return () => {
      cancelled = true
    }
  }, [src])
  return out
}

function HexFrameAvatar({
  size = 88,
  src,
  points,
  rankBadge,
  gender,
  className = '',
  forShare = false,
}: {
  size?: number
  src?: string | null
  points?: number | null
  rankBadge?: 1 | 2 | 3
  gender?: 'MALE' | 'FEMALE'
  className?: string
  forShare?: boolean
}) {
  const HEX = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
  const inset = Math.round(size * 0.16)
  const frameSrc = frameForPoints(points)
  const genderPlaceholder =
    gender === 'FEMALE'
      ? '/images/placeholder_female.png'
      : '/images/placeholder_male.png'
  const photoSrc = src || genderPlaceholder

  const rawId = useId()
  const svgId = `hex-${rawId.replace(/:/g, '')}`
  const sharePhotoUrl =
    useShareSrc(forShare ? photoSrc : null) || genderPlaceholder

  if (forShare) {
    const inner = size - 2 * inset
    const x0 = inset
    const y0 = inset
    const pts = [
      [0.5, 0],
      [1, 0.25],
      [1, 0.75],
      [0.5, 1],
      [0, 0.75],
      [0, 0.25],
    ]
      .map(([fx, fy]) => `${x0 + fx * inner},${y0 + fy * inner}`)
      .join(' ')

    return (
      <div
        className={`relative inline-block ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'absolute', left: 0, top: 0 }}
        >
          <defs>
            <clipPath id={svgId}>
              <polygon points={pts} />
            </clipPath>
          </defs>
          <image
            href={sharePhotoUrl}
            x={x0}
            y={y0}
            width={inner}
            height={inner}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${svgId})`}
          />
        </svg>

        <SafeImg
          src={frameSrc}
          alt="frame"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />

        {rankBadge && (
          <div className="absolute -bottom-2 -left-2">
            <SafeImg
              src={`/images/${rankBadge}.png`}
              alt={`rank-${rankBadge}`}
              width={28}
              height={28}
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0"
        style={{ clipPath: HEX, padding: inset, boxSizing: 'border-box' }}
      >
        <div
          className="w-full h-full relative overflow-hidden"
          style={{ clipPath: HEX }}
        >
          <Image
            src={photoSrc}
            alt="avatar"
            fill
            sizes={`${size}px`}
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>
      <Image
        src={frameSrc}
        alt="frame"
        fill
        sizes={`${size}px`}
        style={{ objectFit: 'contain' }}
      />
      {rankBadge && (
        <div className="absolute -bottom-2 -left-2">
          <Image
            src={`/images/${rankBadge}.png`}
            alt={`rank-${rankBadge}`}
            width={28}
            height={28}
          />
        </div>
      )}
    </div>
  )
}

function waitForImages(root: HTMLElement): Promise<void> {
  const imgs = Array.from(root.querySelectorAll('img'))
  const pending = imgs
    .filter((img) => !img.complete)
    .map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener('load', () => resolve(), { once: true })
          img.addEventListener('error', () => resolve(), { once: true })
        })
    )
  return Promise.all(pending).then(() => undefined)
}
function canNativeShareFiles(files: File[]): boolean {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean
  }
  return typeof nav.canShare === 'function' ? nav.canShare({ files }) : false
}
function isShareAbort(err: unknown): boolean {
  const e = err as { name?: string; message?: string }
  const name = (e?.name || '').toLowerCase()
  const msg = (e?.message || '').toLowerCase()
  return (
    name === 'aborterror' || msg.includes('abort') || msg.includes('cancel')
  )
}

export default function LeaderboardPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [period, setPeriod] = useState<TimespanUI>('All Time')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const { user, isLoading, checkAuth } = useAuthStore()
  const isLoggedIn = !!user

  useEffect(() => {
    checkAuth({ allowRefresh: false })
  }, []) // eslint-disable-line

  useEffect(() => {
    const ctrl = new AbortController()
    ;(async () => {
      setLoading(true)
      setErrorMsg(null)
      try {
        const { data } = await api.get<LeaderboardResponse>('/leaderboard', {
          params: {
            timespan: TIMESPAN_TO_QUERY[period],
            page: 1,
            limit: 10,
          },
          signal: ctrl.signal,
          _skipAuthRefresh: true,
        })
        setRows(data.leaderboard)
      } catch (err) {
        if (isAxiosError(err) && err.code === 'ERR_CANCELED') return
        setErrorMsg(
          isAxiosError(err) ? err.message : 'Failed to load leaderboard.'
        )
      } finally {
        setLoading(false)
      }
    })()
    return () => ctrl.abort()
  }, [period])

  const podium = useMemo(() => rows.slice(0, 3), [rows])
  const tableRows = useMemo(
    () => (rows.length <= 3 ? rows.slice(0, 10) : rows.slice(3, 10)),
    [rows]
  )
  const isSelf = (u?: string | null) =>
    !!user?.username && !!u && u.toLowerCase() === user.username.toLowerCase()

  const guestMenu = [
    { label: 'Home', href: '/' },
    { label: 'Sign In', href: '/sign-in' },
    { label: 'Leaderboard', href: '/leaderboard' },
  ]
  const authMenu = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Profile', href: '/profile' },
    { label: 'Leaderboard', href: '/leaderboard' },
    { label: 'Logout', onClick: () => alert('Logout…') },
  ]
  const menuItems = isLoading ? [] : isLoggedIn ? authMenu : guestMenu

  const shareRef = useRef<HTMLDivElement>(null)

  const handleShare = async () => {
    const node = shareRef.current
    if (!node) return
    try {
      await waitForImages(node)
      const pxRatio = isIOS ? 2 : 3
      const dataUrl = await htmlToImage.toPng(node, {
        pixelRatio: pxRatio,
        backgroundColor: '#000000',
        cacheBust: true,
      })
      const res = await fetch(dataUrl)
      const blob = await res.blob()
      const file = new File([blob], `leaderboard-${period}.png`, {
        type: 'image/png',
      })

      const shareData: ShareData = {
        title: 'Leaderboard',
        text: `Physical Asia • ${period}`,
        files: [file],
      }

      const canShare =
        canNativeShareFiles([file]) && typeof navigator.share === 'function'
      if (canShare) {
        try {
          await navigator.share(shareData)
        } catch (err) {
          if (isShareAbort(err)) return
          const a = document.createElement('a')
          a.href = dataUrl
          a.download = file.name
          document.body.appendChild(a)
          a.click()
          a.remove()
        }
        return
      }

      const a = document.createElement('a')
      a.href = dataUrl
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      console.error('share error:', e)
      alert('Unable to generate the image to share.\n' + msg)
    }
  }

  return (
    <MobileShell
      header={<Header onMenu={() => setMenuOpen(true)} menuOpen={menuOpen} />}
    >
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src="/images/ball.png"
          alt=""
          fill
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'top' }}
          className="opacity-20"
          priority
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* ======== Capture area for share ======== */}
      <div ref={shareRef} className="relative z-10 w-full text-white px-4 pb-6">
        {/* Background duplication for share */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <SafeImg
            src="/images/ball.png"
            alt=""
            className="w-full h-full opacity-20"
            style={{ objectFit: 'cover', objectPosition: 'top' }}
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        {/* Logo */}
        <div className="w-full flex justify-center pt-2">
          <SafeImg
            src="/images/logo2.png"
            alt="unlock"
            width={205}
            height={73}
          />
        </div>

        {/* Title */}
        <h1 className="mt-4 text-center font-semibold text-red-500 text-[20px] tracking-widest">
          LEADERBOARD
        </h1>

        {/* Filters: All Time / Monthly */}
        <div className="grid grid-cols-2 gap-2 w-[320px] mx-auto mt-3">
          {(['All Time', 'Monthly'] as const).map((it) => {
            const active = period === it
            return (
              <button
                key={it}
                onClick={() => setPeriod(it)}
                className={`h-8 rounded-md text-[11px] font-heading tracking-wider border border-white/15 ${
                  active ? 'bg-red-600' : 'bg-black/40'
                }`}
              >
                {it.toUpperCase()}
              </button>
            )
          })}
        </div>

        {errorMsg && (
          <div className="w-[320px] mx-auto mt-3 p-2 rounded-md bg-red-500/20 border border-red-500 text-red-200 text-[12px]">
            {errorMsg}
          </div>
        )}

        {/* Podium + Table card */}
        <div className="w-[320px] mx-auto mt-3 p-3 rounded-xl bg-black/30 border border-white/10">
          {/* Podium */}
          <div className="flex items-end justify-center gap-6">
            {[podium[1], podium[0], podium[2]].map((p, idx) => {
              const size = idx === 1 ? 92 : 82
              const rank = (idx === 1 ? 1 : idx === 0 ? 2 : 3) as 1 | 2 | 3
              const shiftY = idx === 1 ? -12 : 20
              const display = Number(p?.points ?? 0)
              return (
                <div
                  key={rank}
                  className="grid justify-items-center gap-1"
                  style={{ transform: `translateY(${shiftY}px)` }}
                >
                  <HexFrameAvatar
                    size={size}
                    src={p?.profilePictureUrl}
                    points={p?.points ?? 0}
                    rankBadge={rank}
                    gender={p?.gender}
                    forShare
                  />
                  <div
                    className={`text-[10px] ${
                      isSelf(p?.username) ? 'text-red-500' : ''
                    } max-w-[92px] truncate`}
                    title={`@${p?.username ?? '-'}`}
                  >
                    @{p?.username ?? '-'}
                  </div>
                  <div className="text-[10px] opacity-90">
                    {display.toLocaleString('id-ID')}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Table */}
          <div className="mt-6 rounded-md overflow-hidden border border-white/10">
            <div className="grid grid-cols-[36px_1fr_70px_80px] bg-black/60 text-[10px] uppercase tracking-widest px-2 py-2">
              <div>Rank</div>
              <div>User</div>
              <div className="text-right pr-1">Total Rep</div>
              <div className="text-right pr-1">Total Points</div>
            </div>
            <div className="bg-black/30">
              {loading ? (
                <div className="px-2 py-3 text-[12px] opacity-80">Loading…</div>
              ) : (
                tableRows.map((r, idx) => {
                  const self = isSelf(r.username)
                  const base =
                    'grid grid-cols-[36px_1fr_70px_80px] text-[11px] px-2 py-1 border-t border-white/5'
                  return (
                    <div
                      key={`${r.rank}-${r.username}`}
                      className={`${base} ${
                        self ? 'bg-red-600 text-white' : ''
                      } ${idx === tableRows.length - 1 ? 'rounded-b-md' : ''}`}
                    >
                      <div>{String(r.rank).padStart(2, '0')}</div>
                      <div className={`min-w-0 ${self ? 'font-semibold' : ''}`}>
                        <span
                          className="block truncate"
                          title={`@${r.username}`}
                        >
                          @{r.username}
                        </span>
                      </div>

                      <div className="text-right pr-1">
                        {Number(r.totalReps || 0).toLocaleString('id-ID')}
                      </div>
                      <div className="text-right pr-1">
                        {Number(r.points || 0).toLocaleString('id-ID')}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share button */}
      <div className="relative z-10 w-[320px] mx-auto -mt-2 mb-6">
        <button
          className="w-full h-[40px] rounded-md font-heading tracking-wider bg-white text-black"
          onClick={handleShare}
        >
          SHARE TO SOCIAL MEDIA
        </button>
      </div>

      <OverlayMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={menuItems}
      />
    </MobileShell>
  )
}
