# Community Agent Dashboard — Design Spec

## Route
`/admin/community-agent`

## Auth
Hook `useAdminAuth()` — login modal si pas de token en sessionStorage.
Token envoyé via header `Authorization: Bearer <token>` sur chaque appel API.

## Layout

```
┌─────────────────────────────────────────────────────────┐
│ ← Back to site    Community Agent Dashboard    [Logout] │
├─────────────────────────────────────────────────────────┤
│ [Overview] [Automation] [Studio] [Config] [History] [Logs]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│                   (Tab Content)                          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- Pleine largeur `max-w-7xl mx-auto px-4 py-8`
- Tabs = pills horizontaux (style existant Analytics)
- Pas de sidebar (cohérence frontend React)

---

## Tab 1 — Overview

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ ● Status │ │ 24h Posts │ │ Queue    │ │ Uptime   │
│ RUNNING  │ │    12     │ │  3 pend  │ │  4h 23m  │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

┌─ Scheduler ─────────────────────────────────────┐
│ ● Active   Last: 14:23   Next: 15:00            │
│ Strategy: daily-stats     [Run Now] [Stop]       │
└─────────────────────────────────────────────────┘

┌─ Platforms ──────────┐  ┌─ Recent Activity ─────┐
│ 🟢 Telegram  auto    │  │ 14:23 twitter ✓ posted│
│ 🟢 Discord   auto    │  │ 14:01 reddit  ✗ 429   │
│ 🟡 Twitter   manual  │  │ 13:45 telegram ✓      │
│ ⚫ LinkedIn  off     │  │ 13:30 devto ✓ posted  │
│ 🟢 Reddit    auto    │  │ ...                   │
│ 🟢 Dev.to    auto    │  │                       │
│ ⚫ Farcaster off     │  │                       │
└──────────────────────┘  └───────────────────────┘
```

**Données** : `GET /admin/community-agent/health` + `GET /admin/community-agent/stats`
**Refresh** : polling 15s (comme dashboard HTML actuel)

---

## Tab 2 — Automation

```
┌─ Scheduler Control ─────────────────────────────┐
│ Status: ● Running          Interval: 60s        │
│ [Start] [Stop] [Run Now]                        │
│                                                  │
│ Schedule:                                        │
│ ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┐   │
│ │ Lun │ Mar │ Mer │ Jeu │ Ven │ Sam │ Dim │   │
│ │ 9,14│ 9,14│ 9,14│ 9,14│ 9,14│ 10  │ 10  │   │
│ └─────┴─────┴─────┴─────┴─────┴─────┴─────┘   │
└─────────────────────────────────────────────────┘

┌─ Content Queue ─────────────────────────────────┐
│ Filter: [All ▾] [Pending] [Published] [Failed]  │
│                                                  │
│ ┌───────────────────────────────────────────┐   │
│ │ #42 twitter  "New API: sentiment..."       │   │
│ │ ● pending    2026-02-22 15:00              │   │
│ │ [Approve] [Edit] [Delete]                  │   │
│ ├───────────────────────────────────────────┤   │
│ │ #41 reddit   "Weekly recap: 61 APIs..."    │   │
│ │ ● failed (retry 2/3)  14:01               │   │
│ │ [Retry] [Delete]                           │   │
│ └───────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘

┌─ Webhook ───────────────────────────────────────┐
│ Endpoint: POST /api/webhook/new-api             │
│ Last trigger: 2026-02-22 12:00                  │
│ Status: ● Connected                             │
└─────────────────────────────────────────────────┘
```

**Données** : `GET /admin/community-agent/scheduler` + `GET /admin/community-agent/queue`
**Actions** : `POST scheduler` (start/stop/run-now), `POST queue/:id/approve`, `DELETE queue/:id`

---

## Tab 3 — Studio (Content Creation)

```
┌─ Strategy ──────────────────────────────────────┐
│ [daily-stats] [weekly-recap] [new-api]          │
└─────────────────────────────────────────────────┘

┌─ Platform Selection ────────────────────────────┐
│ ☑ Telegram  ☑ Discord  ☐ Twitter  ☐ Reddit     │
│ ☐ Dev.to    ☐ LinkedIn ☐ Farcaster              │
└─────────────────────────────────────────────────┘

┌─ Preview ───────────────────────────────────────┐
│                                                  │
│ (Generated content preview — markdown rendered)  │
│                                                  │
│ [Generate Preview]                               │
└─────────────────────────────────────────────────┘

┌─ Actions ───────────────────────────────────────┐
│ [Add to Queue]  [Publish Now]                   │
└─────────────────────────────────────────────────┘
```

**Données** : `POST /admin/community-agent/preview` → affiche preview
**Actions** : `POST /admin/community-agent/publish`

---

## Tab 4 — Configuration

```
┌─ Platform Settings ─────────────────────────────┐
│ ┌─ Telegram ────────────────────────────────┐   │
│ │ Enabled: [toggle ON]  Auto-publish: [ON]  │   │
│ │ Bot Token: ●●●●●●●●abc  Channel: @x402   │   │
│ │ [Test Connection]  ● OK                   │   │
│ └───────────────────────────────────────────┘   │
│ ┌─ Discord ─────────────────────────────────┐   │
│ │ Enabled: [toggle ON]  Auto-publish: [ON]  │   │
│ │ Webhook: ●●●●●●●●xyz                     │   │
│ │ [Test Connection]  ● OK                   │   │
│ └───────────────────────────────────────────┘   │
│ ... (repeat per platform)                       │
└─────────────────────────────────────────────────┘

┌─ Content Settings ──────────────────────────────┐
│ Default language: [EN ▾]                        │
│ Max length: [280]                               │
│ Include hashtags: [toggle ON]                   │
│ Mention @x402bazaar: [toggle ON]                │
└─────────────────────────────────────────────────┘

┌─ Schedule Settings ─────────────────────────────┐
│ Posts per day: [3]                              │
│ Active hours: [09:00] - [22:00]                 │
│ Timezone: [Europe/Paris ▾]                      │
└─────────────────────────────────────────────────┘
```

**Données** : `GET /admin/community-agent/settings` (credentials redacted par l'agent)
**Actions** : `POST /admin/community-agent/settings`, `GET /admin/community-agent/settings/test/:platform`

---

## Tab 5 — History

```
┌─ Filters ───────────────────────────────────────┐
│ Platform: [All ▾]  Status: [All ▾]  Date: [▾]  │
└─────────────────────────────────────────────────┘

┌─ Publication History ───────────────────────────┐
│ 2026-02-22 14:23  twitter   ✓ published         │
│   "x402 Bazaar daily stats: 61 APIs, 142..."    │
│                                                  │
│ 2026-02-22 14:01  reddit    ✗ failed (429)      │
│   "Weekly recap: New APIs this week..."          │
│   [Retry]                                        │
│                                                  │
│ 2026-02-22 13:45  telegram  ✓ published         │
│   "New API alert: /api/sentiment now live..."    │
│                                                  │
│ [Load More]                                      │
└─────────────────────────────────────────────────┘
```

**Données** : `GET /admin/community-agent/history`

---

## Tab 6 — Logs

```
┌─ Filters ───────────────────────────────────────┐
│ Level: [All ▾]  Search: [____________]          │
└─────────────────────────────────────────────────┘

┌─ Activity Logs ─────────────────────────────────┐
│ 14:23:01 [INFO]  Published to twitter #42       │
│ 14:22:58 [INFO]  Content generated: daily-stats │
│ 14:01:03 [ERROR] Reddit API 429 rate limited    │
│ 14:01:00 [INFO]  Attempting publish reddit #41  │
│ 13:45:12 [INFO]  Published to telegram #40      │
│ 13:00:00 [INFO]  Scheduler tick — no posts due  │
│ ...                                              │
│ [Load More]                                      │
└─────────────────────────────────────────────────┘
```

**Données** : `GET /admin/community-agent/logs`

---

## Composants React à créer

```
src/pages/AdminCommunityAgent.tsx        — Page principale + tabs
src/hooks/useAdminAuth.ts                — Auth hook (sessionStorage)
src/components/community-agent/
  OverviewTab.tsx                         — KPIs + scheduler + platforms + activity
  AutomationTab.tsx                       — Scheduler + queue + webhook
  StudioTab.tsx                           — Content creation + preview + publish
  ConfigTab.tsx                           — Platform & content settings
  HistoryTab.tsx                          — Publication history filtrable
  LogsTab.tsx                             — Activity logs filtrable
  StatCard.tsx                            — Réutilisable (icon, label, value, color)
  PlatformBadge.tsx                       — Icon + nom + status dot
  QueueItem.tsx                           — Item de queue avec actions
  StatusIndicator.tsx                     — Dot animé (green/yellow/red/gray)
```

## Patterns UI

- **Cards** : `glass-card rounded-xl p-6`
- **Grids** : `grid grid-cols-2 lg:grid-cols-4 gap-4`
- **Badges status** : `bg-[color]/10 text-[color] px-2 py-0.5 rounded-full text-xs`
- **Boutons primaires** : `gradient-btn px-4 py-2 rounded-lg`
- **Boutons secondaires** : `glass-card px-4 py-2 rounded-lg hover:bg-white/10`
- **Toggles** : checkbox stylisé ou switch custom
- **Tabs** : pills avec `bg-[#FF9900]/20 text-[#FF9900]` actif, `text-gray-400` inactif
- **Refresh** : `setInterval` 15s sur Overview, manuel ailleurs
- **Loading** : skeleton shimmer sur les cards

## API Mapping

| Tab | Endpoints | Polling |
|-----|-----------|---------|
| Overview | health, stats | 15s |
| Automation | scheduler, queue | non |
| Studio | preview, publish | non |
| Config | settings, settings/test/:p | non |
| History | history | non |
| Logs | logs | non |

## Login Flow

1. User navigue vers `/admin/community-agent`
2. `useAdminAuth` check sessionStorage pour token
3. Si absent → modal login (input token + submit)
4. Token stocké en sessionStorage
5. Chaque fetch inclut `Authorization: Bearer <token>`
6. 401/403 → clear token, re-afficher modal
