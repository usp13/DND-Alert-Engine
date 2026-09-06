dnd-alert-engine/
├── app/
│   ├── layout.tsx                         # Root layout (dark theme, fonts)
│   ├── page.tsx                           # Redirect to /dashboard
│   ├── globals.css                        # Tailwind + CSS variables
│   ├── (auth)/
│   │   ├── login/page.tsx                 # Login (email + password)
│   │   └── signup/page.tsx                # Signup (OTP → set password → create firm)
│   ├── (protected)/
│   │   ├── layout.tsx                     # Sidebar layout for authenticated pages
│   │   ├── dashboard/page.tsx             # Main container dashboard
│   │   ├── containers/
│   │   │   ├── add/page.tsx               # Add container (manual + PDF drag-drop)
│   │   │   └── bulk/page.tsx              # Bulk Excel upload
│   │   ├── reports/page.tsx               # Monthly savings report + charts
│   │   ├── rules/page.tsx                 # Shipping line rules + D&D calculator + prefix directory
│   │   └── settings/page.tsx              # Firm settings, notification phones
│   └── api/
│       ├── containers/route.ts            # GET, POST, PATCH, DELETE containers
│       ├── alerts/
│       │   ├── check/route.ts             # CRON: scan containers, identify alerts
│       │   └── send/route.ts              # Send WhatsApp via Gupshup
│       ├── webhook/
│       │   └── gupshup/route.ts           # Incoming WhatsApp messages + PDFs
│       ├── import/
│       │   ├── pdf/route.ts               # Web PDF upload → Gemini extract
│       │   └── confirm/route.ts           # Confirm & bulk insert after review
│       ├── reports/generate/route.ts      # Monthly report aggregation
│       └── cron/route.ts                  # Vercel CRON entry point
├── components/
│   ├── ui/                                # shadcn/ui components (auto-generated)
│   ├── dashboard/
│   │   ├── ContainerTable.tsx             # Sortable/filterable data table
│   │   ├── ContainerRow.tsx               # Expandable row with timeline
│   │   ├── StatusBadge.tsx                # Green/Yellow/Red/Black indicator
│   │   ├── StatsCards.tsx                 # Top-level stat cards
│   │   └── CountdownTimer.tsx             # Live countdown to LFD
│   ├── containers/
│   │   ├── AddContainerForm.tsx           # Manual form with line dropdown
│   │   ├── ShippingLineCard.tsx           # Rules preview on line selection
│   │   └── BulkUploadZone.tsx             # Excel drag-drop
│   ├── import/
│   │   ├── PDFDropzone.tsx                # Drag-drop PDF upload zone
│   │   ├── ExtractionPreview.tsx          # Editable review table
│   │   ├── ImportHistoryTable.tsx         # Past imports log
│   │   └── WhatsAppBotCard.tsx            # Bot info + QR code
│   ├── reports/
│   │   ├── SavingsChart.tsx               # Recharts BarChart
│   │   ├── LineBreakdown.tsx              # PieChart (D&D by line)
│   │   └── ReportStats.tsx                # Summary stat cards
│   ├── rules/
│   │   ├── RulesTable.tsx                 # All shipping line rules
│   │   ├── DDCalculator.tsx               # Interactive D&D cost calculator
│   │   └── PrefixDirectory.tsx            # Container prefix lookup
│   ├── layout/
│   │   ├── Sidebar.tsx                    # Left sidebar navigation
│   │   ├── TopBar.tsx                     # Top bar + firm name
│   │   └── NotificationBell.tsx           # Alert notification indicator
│   └── whatsapp/
│       └── AlertPreview.tsx               # WhatsApp message preview cards
├── lib/
│   ├── supabase.ts                        # Supabase client (browser)
│   ├── supabase-server.ts                 # Supabase client (server/API routes)
│   ├── shipping-rules.ts                  # Shipping line rules reference
│   ├── container-prefixes.ts              # Prefix → line mapping + validation
│   ├── lfd-calculator.ts                  # LFD calculation logic
│   ├── dd-calculator.ts                   # D&D charge calculation (slab rates)
│   ├── alert-engine.ts                    # Alert checking + sending logic
│   ├── pdf-import-engine.ts               # Core PDF extraction + insert
│   ├── gupshup.ts                         # Gupshup WhatsApp API wrapper
│   └── utils.ts                           # Date/INR formatters, helpers
├── types/index.ts                         # All TypeScript interfaces
├── middleware.ts                          # Auth middleware
├── vercel.json                            # CRON configuration
├── .env.local                             # Environment variables
├── tailwind.config.ts
├── tsconfig.json
└── package.json