"""Render the case-study pages into work/*.html from the content below.

Edit the PROJECTS list, then run:  python tools/build_case_studies.py
The header icons are copied from index.html so every page stays in sync.
"""
import html
import pathlib
import re
import sys

ROOT = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "work"
OUT.mkdir(parents=True, exist_ok=True)
E = lambda s: html.escape(s, quote=False)

GH = "https://github.com/Sami-Shahid-001/"

PROJECTS = [
  # ------------------------------------------------------------------ FERRA
  dict(
    slug="ferra", num="01", private=True,
    palette=dict(accent="#2f4a35", warm="#5f8f67", surface="#e3ebdf", cream="#f1f7ed", muted="#7d9583"),
    title=["Ferra", "Voice AI", "Platform"],
    nav_title="Ferra Voice AI Platform",
    category="Professional work",
    visibility="Private repository · no client data, routes or screens published",
    lead="A no-code, white-label platform for AI phone agents, real-time voice on Deepgram, OpenAI and ElevenLabs, metered pay-as-you-go billing, and partner-branded sub-accounts that never reveal whose platform their clients are on.",
    description="Case study: Ferra, a white-label, multi-tenant AI voice-agent platform with real-time calls, provider failover, per-leg metering and partner branding.",
    specs=[
      ("Context", "Syntrova AI Solutions · Professional work"),
      ("Replaces", "Hand-stitching telephony, speech, LLM and billing vendors for every client"),
      ("Period", "May to July 2026"),
      ("Role", "AI Engineer: voice-agent workflows, LLM and voice API integration, pricing engine, tenancy"),
      ("Shape", "Marketing site, multi-tenant dashboard and a voice gateway"),
      ("Status", "Production platform · under active development"),
      ("Visibility", "Private repository · case study only"),
    ],
    covers=["Voice AI", "LLMs", "Real-time", "Billing", "Multi-tenancy", "Security"],
    stack=["Next.js", "TypeScript", "OpenAI", "Deepgram", "ElevenLabs", "WebSockets", "Server-Sent Events", "SQLite → PostgreSQL", "Zapier · Make · n8n"],
    links=[],
    sections=[
      ("The problem", [
        ("p", "Businesses wanted a phone line that never goes to voicemail, an agent that answers, qualifies, books and follows up. Building one means stitching together telephony, streaming speech-to-text, a language model, a voice, a knowledge base, a CRM and a billing model that charges for every second of all of it."),
        ("p", "Agencies wanted something one level up: to sell that capability to their own clients, under their own brand, at their own prices, without those clients ever learning which platform sits underneath."),
        ("p", "So Ferra had to be two products at once. A no-code builder simple enough for a dental clinic, and a white-label, multi-tenant platform strict enough that one partner’s client can never see, or be billed for, another’s."),
        ("chips", ["Platform", "Partners", "Clients", "Agents", "Calls", "Contacts", "Knowledge", "Billing", "Audit"]),
      ]),
      ("The voice loop", [
        ("p", "Every call is a loop of turns. Caller audio streams into speech-to-text; endpointing decides whether the caller has finished or only paused; the transcript goes to the language model with the agent’s prompt, tools and retrieved knowledge; the reply streams into text-to-speech and back down the line."),
        ("flow", [("Caller", "Phone · SMS · WhatsApp", ""), ("Speech-to-text", "Deepgram, streaming", ""), ("Endpointing", "Finished, or paused?", ""), ("LLM + tools", "OpenAI · knowledge · CRM", "acc"), ("Text-to-speech", "ElevenLabs, streamed", ""), ("Caller", "Barge-in aware", "ghost")], "One turn of a call"),
        ("p", "The hard part is not any single step, it is the latency budget across all of them. A pause that feels natural in a chat window feels broken on a phone. Barge-in matters as much as speed: when the caller interrupts, playback stops and the loop listens again instead of talking over them."),
        ("p", "My part was the agent workflows themselves, prompts, tool calls into CRMs and calendars, inbound and outbound call flows, and wiring the voice and LLM APIs to the platform’s REST endpoints so that a call could book an appointment, sync a contact and hand off to SMS or WhatsApp."),
      ]),
      ("Providers that fail over", [
        ("p", "Each agent version points at a routing profile: a primary provider and an ordered list of fallbacks. A router owns failover, circuit breaking and a cost ceiling; adapters own each provider’s wire format. Neither knows about the other’s concerns, so adding a provider never means touching the call orchestrator."),
        ("flow", [("Agent version", "What the client built", ""), ("Routing profile", "Primary + fallbacks", ""), ("Router", "Failover · circuit breaker · cost ceiling", "acc"), ("Adapter", "One per provider", "")], "Which provider answers"),
        ("p", "Credentials resolve through a vault in a fixed order, agent, then client, then partner, then the platform’s pooled keys. A partner can bring their own OpenAI or ElevenLabs account and every call on their tenants uses it; everyone else falls back to the pool."),
        ("flow", [("Agent", "Most specific", ""), ("Client", "", ""), ("Partner", "Bring your own key", ""), ("Platform pool", "Fallback", "ghost")], "Whose key pays for the call"),
      ]),
      ("White-label by Host header", [
        ("p", "The dashboard resolves branding from the request’s Host header. A partner who points app.theirbrand.com at the platform gets their own logo, colours and product name on every screen, and their clients never see the word Ferra."),
        ("p", "That single decision shaped the architecture. A partner’s domain cannot be a path under ferra.ai, and a framework’s base path is fixed at build time, so the marketing site and the product became separate applications on separate hostnames, sharing one session cookie on the parent domain."),
        ("table", (["", "Platform brand", "Partner brand"], [
          ["Hostname", "app.ferra.ai", "app.partnerbrand.com"],
          ["Logo, colours, name", "Ferra", "The partner’s own"],
          ["Link back to the marketing site", "Shown", "Not rendered"],
          ["Prices clients see", "Platform rates", "Rates the partner sets"],
        ], 2)),
        ("p", "The links between the two apps are deliberately asymmetric. Marketing links into the product generously; the product links back to marketing only for the platform’s own brand. On a partner’s domain that link is simply not rendered, one “Back to Ferra” would tell their clients whose platform they are on."),
      ]),
      ("Tenants that cannot see each other", [
        ("p", "Isolation is enforced by construction rather than by remembering to add a WHERE clause. Every tenant-scoped query goes through a scoped database builder bound to the caller’s resolved tenant; the tenant predicate is appended by the builder and cannot be omitted or overridden."),
        ("numbered", [
          "A row’s tenant is immutable, an update that tries to move it between tenants throws.",
          "Raw SQL against a tenant table must carry an explicit tenant token, or it does not run.",
          "A test fails the build if a new table with a tenant column is not registered with the guard.",
          "Asking for another tenant’s call by id returns 404, not 403, for you, the record does not exist.",
          "Permissions are re-read from the membership on every request rather than trusted from the token, so revoking access lands within a minute instead of when a token happens to expire.",
        ]),
      ]),
      ("Paying by the minute", [
        ("p", "Pricing is pay-as-you-go from a prepaid wallet. Every call is metered per leg, speech-to-text, language model and text-to-speech each carry their own usage and cost, so the call detail shows exactly where the money went, and a partner can set their own rates for their clients and keep the margin."),
        ("metrics", [("Per leg", "STT · LLM · TTS costed separately"), ("Wallet", "Prepaid, pay-as-you-go"), ("Rebilling", "Partners set client rates"), ("Signed", "Usage bound to a ticket")]),
        ("p", "Metering cannot be decided by the browser. The streaming test console reaches the voice agent through a small relay that holds no billing logic of its own: it forwards the session for authorisation and reports usage back to the dashboard, and each report is bound to a signed ticket issued at authorisation, so a turn cannot be billed to a different tenant."),
      ]),
      ("Knowledge, channels and integrations", [
        ("grid", [
          ("Knowledge", ["Document upload and chunking", "Hybrid retrieval with rank fusion", "A knowledge base per agent"]),
          ("Channels", ["Inbound and outbound voice", "SMS and WhatsApp follow-ups", "Appointment booking on calls"]),
          ("Integrations", ["8,000+ apps through Zapier, Make and n8n", "CRM contact sync", "REST API with scoped keys"]),
          ("Compliance", ["Consent and do-not-call checks per contact", "Hash-chained audit log", "Per-request content-security nonce"]),
        ]),
      ]),
      ("The affiliate programme", [
        ("p", "Research into the competitor Ferra was benchmarked against showed it had not built an affiliate programme at all, it resold a hosted one. Ferra’s was built in-house instead: affiliate accounts, an admin review queue, referral links and click tracking."),
        ("callout", ("Commission", "20% recurring, for the lifetime of every customer an affiliate refers.")),
        ("p", "Payouts are deliberately the last phase, gated on the billing integration, because commission arithmetic is only as trustworthy as the subscription events it is computed from."),
      ]),
      ("What the audit measured", [
        ("p", "The platform carries its own audit harness that signs in as every seeded role and walks the product. Its last recorded run: 64 checks, 59 passed, 5 warnings, none failed. Four of the warnings are correct behaviour, partner-only pages redirecting for a client admin, and the fifth is the live voice leg, which the harness does not exercise."),
        ("metrics", [("64", "Checks run"), ("59", "Passed"), ("0", "Failed"), ("335 ms", "p50 route time, dev server")]),
        ("p", "Those latencies are development-server numbers that include on-demand compilation. They are reported because they were measured, not because they represent production."),
      ]),
      ("What holds, and what does not", [
        ("p", "What holds: tenant isolation is enforced by construction and tested; provider failover and per-leg metering are real code paths with real traces; white-labelling survives every screen a client can reach."),
        ("p", "What does not, yet: the local build runs on SQLite with an application-level guard standing in for PostgreSQL row-level security; circuit breakers and concurrency caps live in one process rather than across nodes; and affiliate payouts wait on billing. The move to production infrastructure adds those beneath the same code paths rather than replacing them."),
      ]),
    ],
  ),
  # ------------------------------------------------------------- SAHULATKAR
  dict(
    slug="sahulatkar", num="02", private=True,
    palette=dict(accent="#471323", warm="#b0456e", surface="#efe5e9", cream="#f8f2f4", muted="#9a7d88"),
    title=["SahulatKar", "BNPL", "Platform"],
    nav_title="SahulatKar BNPL Platform",
    category="Private project",
    visibility="Private repositories · no customer data or screens published",
    lead="A vendor-agnostic, Shariah-compliant Buy Now, Pay Later platform for Pakistan. Paste any product link, get a Murabaha financing offer, and an agent completes the purchase on the merchant’s own site with a single-use virtual card. I built the three frontends people actually touch.",
    description="Case study: SahulatKar, a Shariah-compliant, vendor-agnostic BNPL platform, marketing funnel, customer portal and admin console built against a six-service backend.",
    specs=[
      ("Context", "Pre-launch FinTech startup · Pakistan"),
      ("Replaces", "Merchant-locked, interest-based instalment plans"),
      ("Period", "2026"),
      ("Role", "Frontend & product engineering: marketing site, customer portal, admin console"),
      ("Shape", "Three frontends over one gateway and six microservices"),
      ("Status", "Pre-launch · early-access signups open"),
      ("Visibility", "Private repositories · case study only"),
    ],
    covers=["FinTech", "Shariah compliance", "Frontend", "UX specs", "RBAC", "Performance"],
    stack=["Next.js 15", "React 19", "TypeScript", "Tailwind CSS v4", "Vite", "Python microservices", "PostgreSQL · TimescaleDB", "Redis"],
    links=[],
    sections=[
      ("The problem", [
        ("p", "Buy Now, Pay Later in Pakistan mostly works the way it does everywhere: a merchant integrates a provider, and you can only pay in instalments at the shops that did. Most conventional products also charge interest, which, for a large share of customers, rules them out entirely."),
        ("p", "SahulatKar set out to remove both limits at once. Vendor-agnostic: any product, from any online store, with no merchant integration. Shariah-compliant: financing structured as Murabaha, a disclosed cost-plus sale, rather than an interest-bearing loan."),
        ("chips", ["Any merchant", "No integration", "Murabaha", "Disclosed profit", "Virtual card", "Instalments"]),
      ]),
      ("How a purchase works", [
        ("p", "A customer pastes the link to a product. The platform extracts it, prices a Murabaha offer, runs identity and credit checks, and has the customer sign two contracts in order, an agency agreement, then the Murabaha sale itself. Only then is a single-use virtual card issued, and a browser agent on the backend completes checkout on the merchant’s own page."),
        ("flow", [("Product link", "Any online store", ""), ("Murabaha offer", "3 · 6 · 12 months", ""), ("KYC + credit", "Risk scoring, limits", ""), ("Two contracts", "Wakalah, then Murabaha", "acc"), ("Virtual card", "Single use", ""), ("Agent checkout", "On the merchant’s page", "ghost")], "From a pasted link to a placed order"),
        ("p", "Profit is disclosed rather than hidden in a rate: tiered at 2.5%, 7% and 12% for 3-, 6- and 12-month plans, targeting a consistent effective markup of roughly 4% a year."),
      ]),
      ("Six services, one door", [
        ("p", "Behind the frontends sit six independent services. Frontends talk to exactly one of them, the gateway, which owns authentication, KYC orchestration, the order lifecycle, contracts and the admin back office."),
        ("grid", [
          ("Gateway", ["The only public HTTP surface", "Auth, KYC, orders, contracts", "Admin back office and webhooks"]),
          ("Product service", ["URL to product extraction", "Murabaha pricing", "Autonomous checkout agent"]),
          ("Credit engine", ["Multi-layer risk scoring", "Credit limits and down payments", "Fraud and blacklist checks"]),
          ("Payments & ledger", ["Virtual cards, JazzCash, SafePay", "Double-entry bookkeeping", "Charity routing for late fees"]),
        ]),
        ("p", "That boundary mattered for frontend work more than anything else. Every screen I built had one contract to honour, a catalogue of 400 gateway endpoints, instead of six services’ worth of internal APIs."),
      ]),
      ("Shariah rules, enforced in code", [
        ("numbered", [
          "The agency agreement must be signed before the Murabaha contract can even be generated.",
          "Contracts disclose the cost price and the profit amount explicitly.",
          "Late fees are never revenue, they post to a charity liability and are disbursed, never recognised as income.",
          "Prohibited categories are blocked at order time, twice: in the gateway and again in product extraction.",
          "Interface copy never says “interest”, “APR” or “loan repayment” where “profit”, “Murabaha instalment” or “financing” is accurate.",
        ]),
        ("p", "The last rule is the one the frontend owns completely. In a financing product, the words on the screen are part of the agreement the customer believes they are making."),
      ]),
      ("The marketing site and early-access funnel", [
        ("p", "The first frontend had one job before the funding round: collect a thousand early-access signups. It is a Next.js 15 App Router site built mostly from server components, so almost no JavaScript ships for static content, with self-hosted fonts and no animation library at all. Every effect is a CSS keyframe or a scroll-driven view timeline."),
        ("grid", [
          ("Pages", ["Landing page with interactive phone mock-ups", "Five “Why SahulatKar” pillar pages", "About, contact and a legal hub"]),
          ("Funnel", ["Early-access signup", "One-time email verification", "A separate affiliate signup"]),
          ("Performance", ["Server components by default", "Zero-dependency animation", "Preloaded fonts, no layout shift"]),
          ("Goal", ["1,000 early-access signups", "Ahead of the funding round"]),
        ]),
      ]),
      ("The customer portal", [
        ("p", "The second frontend, SahulatKar Bazaar, is where a customer pastes a link, reviews an offer, signs and manages instalments. It was built against a stand-in gateway: a dependency-free Node process holding orders, carts and sessions in memory, deployed as one always-on service so the whole journey could be demonstrated before the real backend was."),
        ("flow", [("Customer portal", "Next.js", ""), ("Stand-in gateway", "Node · in-memory · one process", "acc"), ("Real gateway", "Swapped by one environment variable", "ghost")], "Building ahead of the backend"),
        ("p", "Building against a mock is only honest if the mock matches the contract. It was written from the same endpoint catalogue and the backend’s own integration guide, so replacing it with the real gateway is a configuration change, not a rewrite."),
      ]),
      ("The admin console", [
        ("p", "The third frontend is an operations console for a system that runs an autonomous agent buying real products on real websites, which fails in ways no human caused. Before building it, I rewrote its specification against reality: every screen grounded in the live gateway’s endpoints and nine backend audit documents, rather than a wishlist benchmarked from other BNPL products."),
        ("numbered", [
          "Twelve real admin roles, with every screen annotated for exactly who can see it and act on it.",
          "Backend gaps flagged screen by screen, the interface degrades gracefully instead of inventing data.",
          "“Live” views are honest about polling: there is no push channel for admin screens, so the UI says how fresh its numbers are.",
          "Placeholders look different from facts. In a fintech console, an operator mistaking a hard-coded figure for a real one is the worst failure mode.",
        ]),
        ("p", "The console itself is React, TypeScript and Vite, a dense, data-first interface closer to a bank’s back office than a marketing page."),
      ]),
      ("What the tests hold", [
        ("p", "The backend carries a genuine end-to-end test that brings up the whole stack, real PostgreSQL, real Redis, real networking and a real browser against a bundled mock merchant, and walks a customer from registration to a verified, balanced ledger entry with no mocking at all."),
        ("metrics", [("6", "Backend microservices"), ("400", "Gateway endpoints catalogued"), ("12", "Admin roles"), ("0", "Mocks in the end-to-end test")]),
        ("p", "It is the most reliable reference for exact request and response shapes across the platform, and the frontends were checked against it. Building it surfaced real bugs that no mocked test could have caught, including a connection-pooler incompatibility that could silently drop financial postings."),
      ]),
      ("What holds, and what does not", [
        ("p", "What holds: the three frontends are built against the real gateway contract, the Shariah wording rules are enforced in the interface, and the customer journey runs end to end against the stand-in gateway."),
        ("p", "What does not, yet: SahulatKar is pre-launch. The customer portal is demonstrated against a mock that resets on every restart; admin screens that sit on backend gaps degrade rather than act; and whether contracts’ Shariah-board validation is backed by a recorded approval process is an open question on the backend, not something a frontend can settle."),
      ]),
    ],
  ),
  # ------------------------------------------------------------ BRAIN TUMOR
  dict(
    slug="brain-tumor-mri", num="03", private=False,
    palette=dict(accent="#35222f", warm="#9b5f86", surface="#ebe3ea", cream="#f7f3f6", muted="#8f7a88"),
    title=["Brain Tumour", "MRI", "Classification"],
    nav_title="Brain Tumour MRI Classification",
    category="Deep learning",
    visibility="Public repositories · deployed with Streamlit",
    lead="Two models and one honest lesson. A custom CNN looked excellent on validation and generalised poorly; transfer learning closed part of that gap, from 63% to 74% on MRI scans neither model had seen.",
    description="Case study: four-class brain tumour MRI classification, a custom CNN baseline versus transfer learning, evaluated on unseen scans.",
    specs=[
      ("Context", "Independent deep-learning project"),
      ("Task", "Four-class MRI classification"),
      ("Period", "May 2026"),
      ("Role", "Everything: data, models, evaluation, deployment"),
      ("Shape", "Two repositories, one comparison"),
      ("Status", "Complete · deployed with Streamlit"),
      ("Visibility", "Public repositories"),
    ],
    covers=["Computer vision", "CNNs", "Transfer learning", "Evaluation", "Deployment"],
    stack=["Python", "TensorFlow", "Keras", "NumPy", "OpenCV", "Pillow", "Matplotlib", "Streamlit"],
    links=[("Transfer learning repo", GH + "brain-tumor-classification-mri-transfer-learning-cnn"), ("Custom CNN repo", GH + "brain-tumor-classification-mri-custom-cnn")],
    sections=[
      ("The problem", [
        ("p", "Classify a brain MRI scan into one of four classes: glioma, meningioma, pituitary tumour, or no tumour. Medical imaging datasets are small and uneven, which makes it easy to build a model that scores well on its own validation split and badly on anything else."),
        ("chips", ["Glioma", "Meningioma", "Pituitary", "No tumour"]),
        ("p", "So the goal was never just accuracy. It was accuracy on scans the model had genuinely never seen, and an honest account of where it fails."),
      ]),
      ("A custom CNN first", [
        ("p", "I started from scratch to understand what a CNN actually learns. Images were resized to 128×128, converted to RGB and normalised to the 0 to 1 range; the network grew to six convolution blocks with max pooling, global average pooling instead of flattening, a dense layer with 0.3 dropout and a four-way softmax, about 247,000 trainable parameters."),
        ("flow", [("MRI scan", "128×128 RGB, normalised", ""), ("6 conv blocks", "Conv2D + max pooling", "acc"), ("Global avg pool", "Instead of Flatten()", ""), ("Dense + dropout", "Dropout 0.3", ""), ("Softmax", "Four classes", "")], "The custom architecture"),
        ("p", "One detail is worth admitting: the network started with three blocks, and re-running notebook cells duplicated layers in memory, quietly producing a deeper model. Noticing that, and deciding deliberately what the architecture should be, was its own lesson."),
      ]),
      ("Where it broke", [
        ("metrics", [("92 to 93%", "Training accuracy"), ("89 to 90%", "Validation accuracy"), ("63%", "Unseen test accuracy"), ("Glioma", "Hardest class")]),
        ("p", "Validation accuracy said the model was nearly done. Unseen scans said otherwise: performance fell to about 63%, with glioma confused most often, its appearance overlaps with the other tumour types more than theirs overlap with each other."),
      ]),
      ("Transfer learning", [
        ("p", "Instead of learning edges, textures and shapes from a few thousand scans, the second model starts from a convolutional backbone pretrained on ImageNet and uses it as a feature extractor. Global average pooling, a dense layer, dropout and a softmax sit on top; then selected upper layers of the backbone are unfrozen and fine-tuned on MRI data."),
        ("flow", [("MRI scan", "Preprocessed", ""), ("Pretrained backbone", "Frozen feature extractor", ""), ("Fine-tuned top layers", "Adapted to MRI", "acc"), ("GAP + dense", "Dropout regularised", ""), ("Softmax", "Four classes", "")], "The transfer-learning architecture"),
      ]),
      ("Results", [
        ("table", (["Model", "Training", "Validation", "Unseen test"], [
          ["Custom CNN", "~92 to 93%", "~89 to 90%", "~63%"],
          ["Transfer learning", "~94 to 96%", "~90%", "~74%"],
        ], 1)),
        ("p", "The validation numbers are almost identical. The difference only appears on unseen data, which is exactly why it had to be measured there. An eleven-point improvement came from better features, not a better-looking validation curve."),
      ]),
      ("Deployment", [
        ("p", "Both models were deployed as Streamlit apps: upload a scan, get class probabilities back in real time. Testing in the app on real images exposed weaknesses that never showed up in the notebook, which is the main reason to deploy a learning project at all."),
      ]),
      ("What holds, and what does not", [
        ("p", "What holds: the improvement on unseen data is real and reproducible on that test set, and the comparison is like-for-like."),
        ("p", "What does not: 74% is not clinical-grade, glioma is still the weakest class, and the next steps are clear, a larger and more varied dataset, augmentation, hyperparameter search and saliency maps that show what the model is looking at. This is a learning project, not a diagnostic tool."),
      ]),
    ],
  ),
  # -------------------------------------------------------------- DATAPULSE
  dict(
    slug="datapulse", num="04", private=False,
    palette=dict(accent="#152634", warm="#3f7ea6", surface="#e2eaef", cream="#f4f7f9", muted="#6f8796"),
    title=["DataPulse", "Analytics", "Platform"],
    nav_title="DataPulse Analytics Platform",
    category="Data engineering",
    visibility="Public repository · team project",
    lead="A full-stack analytics platform that turns raw eCommerce CSVs into a cleaned PostgreSQL model, then into KPI dashboards and a sales-forecasting module, built iteratively by a team of three.",
    description="Case study: DataPulse, a data pipeline and analytics platform, ingestion, cleaning, PostgreSQL, KPI dashboards and forecasting.",
    specs=[
      ("Context", "Software engineering team project"),
      ("Team", "Samiullah Shahid, Rafey Mir, Umar Nadeem"),
      ("Period", "April 2026"),
      ("Role", "Co-developer: data pipeline and dashboards"),
      ("Shape", "Ingestion → transformation → dashboard → forecasting"),
      ("Status", "Iteration 3 (forecasting) in progress"),
      ("Visibility", "Public repository"),
    ],
    covers=["Data engineering", "Databases", "Analytics", "Visualisation", "Forecasting"],
    stack=["Python", "Pandas", "PostgreSQL", "Supabase", "Streamlit", "Plotly"],
    links=[("View repository", GH + "DataPulse-Analytics-Platform")],
    sections=[
      ("The problem", [
        ("p", "An export from an online store is not an answer. Business owners want to know revenue, orders, customers and average order value at a glance, and whether next month looks better or worse, without opening a spreadsheet."),
      ]),
      ("The pipeline", [
        ("flow", [("CSV upload", "Raw eCommerce data", ""), ("Ingestion", "Into the database", ""), ("Cleaning", "Types, gaps, duplicates", ""), ("PostgreSQL", "Supabase", "acc"), ("Dashboard", "KPIs and charts", ""), ("Forecasting", "ML module", "ghost")], "From file to insight"),
        ("p", "Data moves through four stages: ingestion from CSV into the database, transformation, cleaning and feature engineering, into an analysis-ready model, a dashboard layer of KPIs and charts on top, and a forecasting module that predicts sales. A monitoring view shows the state of the pipeline itself."),
      ]),
      ("The dashboard", [
        ("grid", [
          ("KPIs", ["Revenue", "Orders", "Customers", "Average order value"]),
          ("Charts", ["Area charts over time", "Category share pie charts", "Raw table exploration"]),
          ("Platform", ["User authentication", "Pipeline monitoring", "Interactive filters"]),
          ("Forecasting", ["ML-based sales forecast", "Planned and partly built"]),
        ]),
      ]),
      ("Built in iterations", [
        ("numbered", [
          "Iteration 1, UI and UX design, and the first implementation.",
          "Iteration 2, data pipeline and dashboard integration.",
          "Iteration 3, forecasting and advanced features, in progress.",
        ]),
        ("p", "Working iteratively meant every stage was usable before the next one started, a dashboard on real data before any forecasting, rather than everything arriving at once at the end."),
      ]),
      ("What holds, and what does not", [
        ("p", "What holds: the ingestion-to-dashboard path works on real data, and the KPIs are computed from the cleaned model rather than the raw file."),
        ("p", "What does not, yet: forecasting is partial, and the repository’s screenshots are still to be added."),
      ]),
    ],
  ),
  # --------------------------------------------------------------- RIDEFLOW
  dict(
    slug="rideflow", num="05", private=False,
    palette=dict(accent="#22282b", warm="#bd7433", surface="#e4e6e4", cream="#f6f3ef", muted="#8d9297"),
    title=["RideFlow", "Ride-Hailing", "Platform"],
    nav_title="RideFlow",
    category="Database systems",
    visibility="Public repository · runs locally on MySQL 8",
    lead="A multi-role ride-hailing platform where the business rules live in MySQL, triggers, stored procedures, views, scheduled events and grants, behind an Express API with JWT authentication.",
    description="Case study: RideFlow, a ride-hailing platform with business rules in MySQL triggers, procedures, views and events behind an Express + JWT API.",
    specs=[
      ("Context", "Database Systems capstone · FAST-NUCES"),
      ("Period", "May 2026"),
      ("Role", "Full-stack: schema, SQL, API and dashboards"),
      ("Shape", "Three dashboards over one relational core"),
      ("Status", "Complete · runs locally"),
      ("Visibility", "Public repository"),
    ],
    covers=["Databases", "SQL", "Backend", "Security", "Full-stack"],
    stack=["MySQL 8", "Node.js", "Express", "JWT", "HTML", "CSS", "JavaScript"],
    links=[("View repository", GH + "Ride-Flow-Web-App")],
    sections=[
      ("The problem", [
        ("p", "The capstone had to demonstrate advanced SQL, not CRUD. Ride-hailing is a good domain for that: it has money, state transitions, ratings, roles and time, rules that are safest when they live next to the data rather than in whichever API route happens to remember them."),
      ]),
      ("The shape", [
        ("flow", [("Rider", "Book, history, payments", ""), ("Driver", "Requests, earnings", ""), ("Admin", "Users, vehicles, reports", ""), ("Express API", "JWT + role guard · 30+ endpoints", "acc"), ("MySQL", "Where the rules live", "")], "Three roles, one core"),
        ("p", "Three dashboards share one Express API. A middleware verifies the JWT and guards each route by role; controllers stay thin because the database does the heavy lifting."),
      ]),
      ("Rules in the database", [
        ("grid", [
          ("7 triggers", ["Driver earnings", "Ratings", "Ride history", "Promo usage", "Driver status"]),
          ("Procedures", ["sp_calculate_fare", "sp_complete_ride", "sp_driver_earnings_summary"]),
          ("Views", ["ActiveRidesView", "TopDriversView", "DriverLeaderboardView"]),
          ("Events & access", ["Expire promos on a schedule", "Archive old rides", "Role-based GRANT / REVOKE"]),
        ]),
        ("p", "Because completing a ride is a stored procedure and its side effects are triggers, earnings, ratings and history update the same way no matter which route, or which future client, touches the data."),
      ]),
      ("What it delivers", [
        ("p", "Live dashboards per role, surge pricing, automatic suspensions, promo reports and twenty standalone query demonstrations, the project that finished as one of the strongest database submissions of its term."),
      ]),
      ("What holds, and what does not", [
        ("p", "What holds: the business rules are enforced whatever path writes the data, and access is restricted at the database level as well as in the API."),
        ("p", "What does not: it runs locally against MySQL with a vanilla HTML/CSS/JS front end, and payments are simulated rather than processed."),
      ]),
    ],
  ),
  # ------------------------------------------------------------ ONCOPREDICT
  dict(
    slug="oncopredict", num="06", private=False,
    palette=dict(accent="#232a4d", warm="#5d66b0", surface="#e6e8f1", cream="#f6f7fb", muted="#7c82a3"),
    title=["OncoPredict", "AI"],
    nav_title="OncoPredict AI",
    category="Machine learning",
    visibility="Public repository · live demo",
    lead="A breast-cancer diagnosis classifier made usable: a scikit-learn model behind a Flask API with consistent feature scaling, and a responsive JavaScript front end, deployed on Railway and Vercel.",
    description="Case study: OncoPredict AI, a breast-cancer classifier taken from notebook to Flask API and web app.",
    specs=[
      ("Context", "Independent machine-learning project"),
      ("Period", "December 2025"),
      ("Role", "Everything: model, API, front end, deployment"),
      ("Shape", "Notebook → API → web app"),
      ("Status", "Deployed"),
      ("Visibility", "Public repository"),
    ],
    covers=["Machine learning", "Healthcare data", "APIs", "Deployment"],
    stack=["Python", "Scikit-learn", "Pandas", "Flask", "JavaScript", "Railway", "Vercel"],
    links=[("View repository", GH + "Onco-PredictionAI"), ("Live demo", "https://logistic-regression-breast-cancer-d.vercel.app")],
    sections=[
      ("The problem", [
        ("p", "A trained model in a notebook helps nobody. The goal was to take a breast-cancer diagnosis classifier all the way to something a person can use, enter measurements, get a prediction, without the model behaving differently in production than it did in training."),
      ]),
      ("The model", [
        ("flow", [("30 features", "Tumour measurements", ""), ("StandardScaler", "Fit on training data", ""), ("Logistic regression", "Binary classifier", "acc"), ("Prediction", "Benign or malignant", "")], "Training pipeline"),
        ("p", "The dataset has thirty numeric features per tumour. After cleaning and exploratory analysis of their distributions, features were standardised and split 70/30 for training and testing, and a logistic-regression model was trained on the standardised inputs for numerical stability and faster convergence."),
      ]),
      ("From notebook to API", [
        ("flow", [("Web form", "JavaScript · Vercel", ""), ("Flask API", "Railway", "acc"), ("Same scaler", "No training/serving skew", ""), ("Model", "Real-time prediction", "")], "Serving path"),
        ("p", "The Flask API applies the same fitted scaler before every prediction, the easiest bug in this kind of project is training on scaled data and serving unscaled data. The front end posts features over REST and renders the result in real time."),
      ]),
      ("What holds, and what does not", [
        ("p", "What holds: the full path from notebook to a public web app, with consistent preprocessing on both sides."),
        ("p", "What does not: it is a teaching model, not a medical device, a single model with no calibration study or clinical validation behind it."),
      ]),
    ],
  ),
  # ----------------------------------------------------------- NN FROM SCRATCH
  dict(
    slug="neural-networks-from-scratch", num="07", private=False,
    palette=dict(accent="#232323", warm="#9a6840", surface="#ece7e2", cream="#f7f4f0", muted="#8b8178"),
    title=["Neural Networks", "from Scratch"],
    nav_title="Neural Networks from Scratch",
    category="Deep learning foundations",
    visibility="Public repositories",
    lead="Before leaning on frameworks, I wrote the maths myself. Three NumPy-only projects: multivariate linear regression with gradient descent, a dense network on spiral data, and an MNIST digit recogniser with full backpropagation, served through Streamlit.",
    description="Case study: neural networks and linear regression implemented from scratch in NumPy, forward pass, backpropagation, gradient descent and an MNIST app.",
    specs=[
      ("Context", "Self-directed study alongside Andrew Ng’s courses"),
      ("Period", "December 2025 to May 2026"),
      ("Role", "Everything"),
      ("Shape", "Three repositories, one progression"),
      ("Frameworks", "None, NumPy only"),
      ("Visibility", "Public repositories"),
    ],
    covers=["Linear algebra", "Calculus", "Optimisation", "Deep learning"],
    stack=["Python", "NumPy", "Pandas", "Matplotlib", "Streamlit", "Pickle"],
    links=[("MNIST ANN repo", GH + "MNIST-digit-recognizer-ANN"), ("Neural network repo", GH + "Neural-Network-From-Scratch"), ("Linear regression repo", GH + "Linear-Regression-From-Scratch")],
    sections=[
      ("Why from scratch", [
        ("p", "Frameworks hide exactly the parts that break: shapes, gradients, scaling, numerical stability. Writing them by hand once makes every later model easier to debug, because you know what the framework is doing on your behalf."),
      ]),
      ("Linear regression", [
        ("numbered", [
          "Generate a synthetic dataset with a known linear relationship plus noise.",
          "Normalise every feature, and the target, by mean and standard deviation.",
          "Compute the mean-squared-error cost for the current weights.",
          "Take the gradient and update the weights with gradient descent until the cost converges.",
        ]),
        ("p", "Multivariate regression first, because every later idea, a cost, its gradient, a learning rate, convergence, appears here in its simplest form."),
      ]),
      ("A dense network on spirals", [
        ("p", "Next, a multi-class classifier on a spiral dataset that no straight line can separate: dense layers, ReLU and softmax activations and categorical cross-entropy loss, each written first in raw Python and then vectorised with NumPy. The focus was forward-pass correctness, the foundation the backward pass is built on."),
      ]),
      ("MNIST with backpropagation", [
        ("flow", [("28×28 image", "Flattened to 784", ""), ("Hidden layer", "128 · ReLU", "acc"), ("Output layer", "10 · softmax", ""), ("Prediction", "Digit 0 to 9", "")], "784 → 128 → 10"),
        ("p", "Then the full loop on MNIST: 70,000 handwritten digits, 60,000 for training and 10,000 for testing. Forward propagation, backpropagation, cross-entropy loss, weight initialisation and gradient-descent updates are all manual matrix operations."),
        ("p", "The trained weights are serialised with pickle and served through a Streamlit app: upload a digit, see the prediction, an end-to-end machine-learning pipeline with no framework anywhere in it."),
      ]),
      ("What it taught", [
        ("numbered", [
          "Most bugs are shape bugs, print the shapes before you print anything else.",
          "Softmax and cross-entropy together have a beautifully simple gradient.",
          "Normalising inputs is the difference between converging and wandering.",
          "Logits, probabilities and predictions are three different things, and confusing them is easy.",
        ]),
      ]),
    ],
  ),
  # ---------------------------------------------------------------- N8N
  dict(
    slug="n8n-automation", num="08", private=False,
    palette=dict(accent="#3b2618", warm="#c4703a", surface="#efe6dd", cream="#f8f3ee", muted="#9a8574"),
    title=["n8n AI", "Automation", "Pipelines"],
    nav_title="n8n AI Automation Pipelines",
    category="AI automation",
    visibility="Client work · workflows not published",
    lead="Ten-plus production workflows that take repetitive work off people, content creation, inbox triage, customer support and knowledge retrieval, running reliably across multiple clients.",
    description="Case study: n8n and Make.com AI automation pipelines, content, email triage, support agents and Pinecone knowledge bases.",
    specs=[
      ("Context", "Freelance client work"),
      ("Period", "2025 to Present"),
      ("Role", "Design, build and maintenance"),
      ("Shape", "Trigger → AI agent → tools"),
      ("Status", "In production"),
      ("Certification", "NATE n8n Automation · August 2025"),
      ("Visibility", "Client workflows · not published"),
    ],
    covers=["Automation", "LLM agents", "Retrieval", "Integrations"],
    stack=["n8n", "Make.com", "OpenAI", "Pinecone", "REST APIs", "Webhooks"],
    links=[],
    sections=[
      ("The problem", [
        ("p", "Content creation, email triage and support replies were eating hours every day, and the same hours, in the same way, every day. Work that repetitive is exactly what should run without a person in the loop until a person is actually needed."),
      ]),
      ("The pattern", [
        ("flow", [("Trigger", "Webhook · schedule · inbox", ""), ("AI agent", "LLM with tools", "acc"), ("Tools", "Pinecone · email · LinkedIn · CRM", ""), ("Hand-off", "A person, when it matters", "ghost")], "How each pipeline is shaped"),
        ("p", "Almost every pipeline has the same skeleton: something happens, an agent with the right tools decides what to do about it, and the result lands where people already work, with a human hand-off wherever a mistake would be public or expensive."),
      ]),
      ("Four pipelines", [
        ("grid", [
          ("LinkedIn content creator", ["Drafts posts from a topic or source", "Keeps a consistent voice", "Queues them for review"]),
          ("Email filter & triage", ["Classifies incoming mail", "Routes and labels it", "Surfaces what needs a person"]),
          ("AI support agent", ["Answers common questions", "Grounded in the client’s own content", "Escalates what it can’t answer"]),
          ("Pinecone knowledge base", ["Ingests documents", "Embeds and indexes them", "Serves retrieval to the other agents"]),
        ]),
      ]),
      ("How they stay reliable", [
        ("numbered", [
          "Failed steps branch to an alert instead of stopping silently.",
          "Anything published under a client’s name passes a human approval step first.",
          "Credentials and knowledge stay scoped to each client.",
          "Agents answer from retrieved context, not from the model’s memory, wherever facts matter.",
        ]),
      ]),
      ("What holds, and what does not", [
        ("p", "What holds: the pipelines run in production for multiple clients, save hours every week, and the work earned the NATE n8n certification."),
        ("p", "What does not: client workflows are not published, so there are no screenshots here, and time saved is reported by clients rather than measured by me."),
      ]),
    ],
  ),
]

def sprite_from_index(project_root):
    """Reuse the icon sprite from index.html so the icons are byte-identical."""
    src = (project_root / "index.html").read_text(encoding="utf-8")
    m = re.search(r'<svg width="0" height="0".*?</svg>', src, re.S)
    sprite = m.group(0)
    lock = '  <symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" fill="none" stroke="currentColor" stroke-width="1.8"/></symbol>\n</svg>'
    return sprite[: -len("</svg>")] + lock


NAV = [("Home", "home"), ("About", "about"), ("Work", "work"), ("Services", "services"), ("Experience", "experience"), ("Education", "education"), ("Contact", "contact")]


def header():
    links = "\n".join(
        f'          <li class="intro-fade"><a href="../index.html#{sec}" class="nav-link{" is-active" if sec == "work" else ""}"><span class="nav-swap"><span class="nav-swap-in">{name}</span><span class="nav-swap-out" aria-hidden="true">{name}</span></span></a></li>'
        for name, sec in NAV
    )
    menu = "\n".join(f'      <li><a href="../index.html#{sec}"><span class="eyebrow">{i+1:02d}</span>{name}</a></li>' for i, (name, sec) in enumerate(NAV))
    return f"""<header class="site-header" data-tone="day">
  <div class="topbar">
    <div class="wrap">
      <div class="topbar-inner gutter intro-fade">
        <div class="topbar-left">
          <span class="avail"><span class="avail-dot"><span class="availability-halo"></span><span class="avail-core"></span></span><span class="avail-text">Available for new projects</span></span>
        </div>
        <div class="topbar-right">
          <span class="vsep" aria-hidden="true"></span>
          <ul class="icon-links">
            <li><a href="https://github.com/Sami-Shahid-001" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><svg><use href="#i-github"/></svg></a></li>
            <li><a href="https://www.linkedin.com/in/samiullah-shahid/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg><use href="#i-linkedin"/></svg></a></li>
            <li><a href="mailto:samishaee101@gmail.com" aria-label="Email"><svg><use href="#i-mail"/></svg></a></li>
          </ul>
          <span class="vsep" aria-hidden="true"></span>
        </div>
      </div>
    </div>
  </div>
  <div class="wrap">
    <div class="nav-box">
      <span class="nav-card" aria-hidden="true"></span>
      <nav class="nav gutter" aria-label="Primary">
        <div class="nav-left intro-fade">
          <a href="../index.html" class="brand">
            <img src="../assets/img/hero-logo.png" alt="" width="46" height="46" class="brand-mark">
            <span class="brand-sep" aria-hidden="true"></span>
            <span class="brand-text"><span class="brand-name">Samiullah Shahid</span><span class="brand-role">AI/ML Engineer &amp; Data Scientist</span></span>
            <span class="sr-only">home</span>
          </a>
        </div>
        <ul class="nav-links">
{links}
          <span class="nav-dot" aria-hidden="true"></span>
        </ul>
        <div class="nav-right intro-fade">
          <span class="cta-wrap">
            <span class="cta-glow" aria-hidden="true"></span>
            <a href="../index.html#contact" class="nav-cta">
              <span class="cta-sweep" aria-hidden="true"></span>
              <span class="nav-cta-label">Let’s Talk</span>
              <span class="nav-cta-icon" aria-hidden="true"><svg><use href="#i-arrow"/></svg></span>
            </a>
          </span>
          <button type="button" class="menu-btn" aria-expanded="false" aria-controls="site-menu">
            <span class="menu-btn-label">Menu</span>
            <span class="menu-plus" aria-hidden="true"><span></span><span></span></span>
          </button>
        </div>
      </nav>
      <span class="nav-progress" aria-hidden="true"><span></span></span>
    </div>
  </div>
</header>

<div class="menu-panel" id="site-menu" aria-hidden="true">
  <div class="menu-inner gutter">
    <p class="eyebrow menu-eyebrow">Navigate</p>
    <ul class="menu-links">
{menu}
    </ul>
    <div class="menu-foot">
      <a href="mailto:samishaee101@gmail.com" class="menu-mail">samishaee101@gmail.com</a>
      <ul class="pill-links">
        <li><a class="soc" href="https://github.com/Sami-Shahid-001" target="_blank" rel="noopener noreferrer"><svg><use href="#i-github"/></svg><span>GitHub</span></a></li>
        <li><a class="soc" href="https://www.linkedin.com/in/samiullah-shahid/" target="_blank" rel="noopener noreferrer"><svg><use href="#i-linkedin"/></svg><span>LinkedIn</span></a></li>
        <li><a class="soc" href="../assets/Samiullah_Shahid_CV.pdf" download><svg><use href="#i-file"/></svg><span>CV</span></a></li>
      </ul>
    </div>
  </div>
</div>"""


def footer():
    links = "\n".join(f'          <li><a href="../index.html#{sec}">{name}<span aria-hidden="true"></span></a></li>' for name, sec in NAV)
    return f"""<footer class="site-footer on-night" data-tone="night">
  <div class="gutter footer-inner">
    <div class="footer-rule" aria-hidden="true"></div>
    <div class="footer-top">
      <nav aria-label="Footer">
        <ul class="footer-links">
{links}
        </ul>
      </nav>
      <ul class="pill-links pill-links-night">
        <li><a class="soc" href="https://github.com/Sami-Shahid-001" target="_blank" rel="noopener noreferrer"><svg><use href="#i-github"/></svg><span>GitHub</span></a></li>
        <li><a class="soc" href="https://www.linkedin.com/in/samiullah-shahid/" target="_blank" rel="noopener noreferrer"><svg><use href="#i-linkedin"/></svg><span>LinkedIn</span></a></li>
        <li><a class="soc" href="mailto:samishaee101@gmail.com"><svg><use href="#i-mail"/></svg><span>Email</span></a></li>
      </ul>
    </div>
    <div class="footer-name" aria-hidden="true">
      <p class="name-line name-outline-night footer-line">SAMIULLAH</p>
      <p class="name-line name-solid-night footer-line">SHAHID</p>
    </div>
    <div class="footer-credits">
      <p>Designed &amp; Built by Samiullah Shahid</p>
      <p>© <span data-year>2026</span></p>
    </div>
  </div>
</footer>"""


def block(kind, data):
    if kind == "p":
        return f"<p>{E(data)}</p>"
    if kind == "chips":
        return '<div class="fig fig-chips reveal-up">' + "".join(f"<span>{E(c)}</span>" for c in data) + "</div>"
    if kind == "flow":
        nodes, caption = data
        parts = []
        for i, (label, sub, cls) in enumerate(nodes):
            if i:
                parts.append('<span class="flow-arrow" aria-hidden="true"></span>')
            sm = f"<small>{E(sub)}</small>" if sub else ""
            parts.append(f'<div class="flow-node {cls}"><b>{E(label)}</b>{sm}</div>')
        return f'<figure class="fig reveal-up"><div class="fig-flow">{"".join(parts)}</div><figcaption class="fig-caption">{E(caption)}</figcaption></figure>'
    if kind == "grid":
        cards = "".join(
            f'<div class="fig-card"><p class="eyebrow">{E(t)}</p><ul>{"".join(f"<li>{E(i)}</li>" for i in items)}</ul></div>' for t, items in data
        )
        return f'<div class="fig fig-grid reveal-up">{cards}</div>'
    if kind == "numbered":
        return '<ol class="fig fig-numbered reveal-up">' + "".join(f"<li>{E(i)}</li>" for i in data) + "</ol>"
    if kind == "metrics":
        return '<div class="fig fig-metrics reveal-up">' + "".join(f'<div class="fig-metric"><b>{E(v)}</b><span>{E(l)}</span></div>' for v, l in data) + "</div>"
    if kind == "callout":
        eb, text = data
        return f'<div class="fig fig-callout reveal-up"><p class="eyebrow">{E(eb)}</p><p>{E(text)}</p></div>'
    if kind == "table":
        heads, rows, hl = data
        th = "".join(f"<th>{E(h)}</th>" for h in heads)
        hl_attr = ' class="hl"'
        trs = "".join("<tr" + (hl_attr if r_i == hl else "") + ">" + "".join(f"<td>{E(c)}</td>" for c in row) + "</tr>" for r_i, row in enumerate(rows))
        return f'<div class="fig fig-table-wrap reveal-up"><table class="fig-table"><thead><tr>{th}</tr></thead><tbody>{trs}</tbody></table></div>'
    raise ValueError(kind)


def slug_id(i, title):
    return f"s{i+1:02d}-" + re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")


def page(p, nxt, sprite):
    pal = p["palette"]
    style = f'--p-accent:{pal["accent"]};--p-warm:{pal["warm"]};--p-surface:{pal["surface"]};--p-cream:{pal["cream"]};--p-muted:{pal["muted"]}'
    title_lines = "\n".join(f'          <span class="line"><span class="line-inner">{E(t)}</span></span>' for t in p["title"])
    specs = "\n".join(f'          <div class="case-spec case-intro"><dt>{E(k)}</dt><dd>{E(v)}</dd></div>' for k, v in p["specs"])
    covers = "".join(f"<li><i></i><span>{E(c)}</span></li>" for c in p["covers"])
    stack = "".join(f'<li><span class="tech-pill">{E(s)}</span></li>' for s in p["stack"])
    badge = '<span class="private-badge case-intro"><svg><use href="#i-lock"/></svg>Private work</span>' if p["private"] else '<span class="private-badge case-intro"><svg><use href="#i-github"/></svg>Open source</span>'
    links = ""
    if p["links"]:
        btns = []
        for i, (label, href) in enumerate(p["links"]):
            cls = "btn btn-dark" if i == 0 else "btn btn-outline"
            icon = '<svg class="btn-lead-icon"><use href="#i-github"/></svg>' if "github.com" in href else ""
            btns.append(f'<a class="{cls}" href="{href}" target="_blank" rel="noopener noreferrer">{icon}<span>{E(label)}</span><svg><use href="#i-arrow"/></svg></a>')
        links = f'<div class="case-links case-intro">{"".join(btns)}</div>'
    elif p["private"]:
        links = '<div class="case-links case-intro"><a class="btn btn-dark" href="mailto:samishaee101@gmail.com?subject=' + E(p["nav_title"]).replace(" ", "%20") + '"><span>Ask me about this project</span><svg><use href="#i-arrow"/></svg></a></div>'

    toc = "\n".join(
        f'            <li><a href="#{slug_id(i, t)}"><span class="eyebrow">{i+1:02d}</span><span>{E(t)}</span></a></li>' for i, (t, _) in enumerate(p["sections"])
    )
    secs = []
    for i, (t, blocks) in enumerate(p["sections"]):
        body = "\n            ".join(block(b[0], b[1] if len(b) == 2 else b[1:]) for b in blocks)
        secs.append(f"""        <section class="case-sec" id="{slug_id(i, t)}">
          <span class="case-bleed" aria-hidden="true"></span>
          <p class="eyebrow sec-num reveal-up">{i+1:02d}<i></i></p>
          <h2 class="sec-title reveal-up">{E(t)}</h2>
          <div class="sec-content">
            {body}
          </div>
        </section>""")
    sections = "\n".join(secs)
    page_title = f'{p["nav_title"]} | Samiullah Shahid'

    return f"""<!doctype html>
<html lang="en" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{E(page_title)}</title>
<meta name="description" content="{html.escape(p['description'])}">
<meta name="theme-color" content="#e4e3df">
<meta property="og:title" content="{html.escape(page_title)}">
<meta property="og:description" content="{html.escape(p['description'])}">
<link rel="icon" href="../assets/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="../assets/img/favicon-48.png" sizes="48x48" type="image/png">
<link rel="apple-touch-icon" href="../assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@300..800&family=Geist+Mono:wght@400..600&display=swap">
<link rel="stylesheet" href="../assets/css/style.css?v=20261027c">
<link rel="stylesheet" href="../assets/css/case.css?v=20261027c">
<script>document.documentElement.classList.replace('no-js','js');</script>
</head>
<body class="page-case" style="{style}">

{sprite}

{header()}

<div class="shell">
<main>
  <section class="case-hero gutter" data-tone="day">
    <a class="case-back case-intro" href="../index.html#work"><span><svg><use href="#i-arrow"/></svg></span>Back to Selected Work</a>
    <div class="case-hero-grid">
      <div>
        <div class="case-meta case-intro">
          <span class="case-num">{p["num"]}</span>
          <span class="eyebrow">{E(p["category"])}</span>
          <span class="case-meta-line" aria-hidden="true"></span>
          {badge}
        </div>
        <h1 class="case-title">
{title_lines}
        </h1>
        <p class="case-lead case-intro">{E(p["lead"])}</p>
        <p class="eyebrow muted case-intro" style="margin-top:1.25rem">{E(p["visibility"])}</p>
        {links}
      </div>
      <dl class="case-specs">
{specs}
      </dl>
    </div>
  </section>

  <div class="case-band" data-tone="day">
    <div class="gutter">
      <p class="eyebrow">Covers</p>
      <ol class="covers"><span class="covers-line" aria-hidden="true"></span>{covers}</ol>
      <div class="stack-row">
        <p class="eyebrow">Stack</p>
        <ul class="work-tags">{stack}</ul>
      </div>
    </div>
  </div>

  <div class="case-body gutter" data-tone="day">
    <aside class="case-toc" aria-label="On this page">
      <div class="case-toc-inner">
        <p class="eyebrow">On this page</p>
        <ol>
{toc}
        </ol>
      </div>
    </aside>
    <div class="case-sections">
{sections}
    </div>
  </div>

  <section class="case-next on-night" data-tone="night">
    <div class="gutter case-next-inner">
      <div class="chapter-row reveal-row">
        <span class="eyebrow accent">Next</span>
        <span class="eyebrow night-muted">Case study {nxt["num"]}</span>
        <span class="chapter-line" aria-hidden="true"></span>
      </div>
      <a class="next-link reveal-up" href="{nxt["slug"]}.html">
        <span class="next-title"><span>{E(nxt["nav_title"])}</span><span class="next-arrow" aria-hidden="true"><svg><use href="#i-arrow"/></svg></span></span>
        <p class="next-sub">{E(nxt["lead"])}</p>
      </a>
      <div class="next-foot">
        <a class="btn btn-night-ghost" href="../index.html#work"><span>All selected work</span></a>
        <a class="btn btn-light" href="../index.html#contact"><span>Start a Conversation</span><svg><use href="#i-arrow"/></svg></a>
      </div>
    </div>
  </section>
</main>

{footer()}
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js" defer></script>
<script src="../assets/js/site.js?v=20261027c" defer></script>
<script src="../assets/js/case.js?v=20261027c" defer></script>
</body>
</html>
"""


sprite = sprite_from_index(ROOT)
for i, p in enumerate(PROJECTS):
    nxt = PROJECTS[(i + 1) % len(PROJECTS)]
    (OUT / f'{p["slug"]}.html').write_text(page(p, nxt, sprite), encoding="utf-8")
    print("wrote", p["slug"])
