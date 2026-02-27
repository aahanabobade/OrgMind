# data/company_data.py
# Synthetic dataset inspired by Google's engineering org
# People and relationships are fictional — team/project names are based on public knowledge

PEOPLE = [
    # Google Search
    {"id": "p1",  "name": "Sundar Pichai Jr.",     "role": "Engineering Manager",    "team_id": "t1"},
    {"id": "p2",  "name": "Priya Anand",           "role": "Senior Software Engineer","team_id": "t1"},
    {"id": "p3",  "name": "James O'Connor",        "role": "Software Engineer",      "team_id": "t1"},

    # Google Cloud
    {"id": "p4",  "name": "Wei Zhang",             "role": "Engineering Manager",    "team_id": "t2"},
    {"id": "p5",  "name": "Aisha Okafor",          "role": "Senior Software Engineer","team_id": "t2"},
    {"id": "p6",  "name": "Lucas Fernandez",       "role": "Software Engineer",      "team_id": "t2"},

    # Google DeepMind
    {"id": "p7",  "name": "Elena Sorokina",        "role": "Engineering Manager",    "team_id": "t3"},
    {"id": "p8",  "name": "Ravi Shankar",          "role": "Senior Research Engineer","team_id": "t3"},
    {"id": "p9",  "name": "Mei Lin",               "role": "Research Engineer",      "team_id": "t3"},

    # Android
    {"id": "p10", "name": "Marcus Johnson",        "role": "Engineering Manager",    "team_id": "t4"},
    {"id": "p11", "name": "Sofia Reyes",           "role": "Senior Software Engineer","team_id": "t4"},
    {"id": "p12", "name": "Thomas Müller",         "role": "Software Engineer",      "team_id": "t4"},

    # Security & Privacy
    {"id": "p13", "name": "Nadia Hassan",          "role": "Engineering Manager",    "team_id": "t5"},
    {"id": "p14", "name": "Chris Park",            "role": "Senior Security Engineer","team_id": "t5"},
    {"id": "p15", "name": "Ananya Bose",           "role": "Security Engineer",      "team_id": "t5"},
]

TEAMS = [
    {"id": "t1", "name": "Google Search",          "department": "Search & Assistant"},
    {"id": "t2", "name": "Google Cloud",           "department": "Cloud & Infrastructure"},
    {"id": "t3", "name": "Google DeepMind",        "department": "AI Research"},
    {"id": "t4", "name": "Android",                "department": "Platforms"},
    {"id": "t5", "name": "Security & Privacy",     "department": "Trust & Safety"},
]

PROJECTS = [
    {"id": "proj1",  "name": "Search Ranking",               "status": "active", "team_id": "t1"},
    {"id": "proj2",  "name": "Search Generative Experience", "status": "active", "team_id": "t1"},
    {"id": "proj3",  "name": "BigQuery",                     "status": "active", "team_id": "t2"},
    {"id": "proj4",  "name": "Google Kubernetes Engine",     "status": "active", "team_id": "t2"},
    {"id": "proj5",  "name": "Gemini",                       "status": "active", "team_id": "t3"},
    {"id": "proj6",  "name": "AlphaCode",                    "status": "active", "team_id": "t3"},
    {"id": "proj7",  "name": "Android Runtime",              "status": "active", "team_id": "t4"},
    {"id": "proj8",  "name": "Pixel OS",                     "status": "active", "team_id": "t4"},
    {"id": "proj9",  "name": "Project Zero",                 "status": "active", "team_id": "t5"},
    {"id": "proj10", "name": "Privacy Sandbox",              "status": "active", "team_id": "t5"},
]

MANAGES = [
    {"manager_id": "p1",  "report_id": "p2"},
    {"manager_id": "p1",  "report_id": "p3"},
    {"manager_id": "p4",  "report_id": "p5"},
    {"manager_id": "p4",  "report_id": "p6"},
    {"manager_id": "p7",  "report_id": "p8"},
    {"manager_id": "p7",  "report_id": "p9"},
    {"manager_id": "p10", "report_id": "p11"},
    {"manager_id": "p10", "report_id": "p12"},
    {"manager_id": "p13", "report_id": "p14"},
    {"manager_id": "p13", "report_id": "p15"},
]

WORKS_ON = [
    {"person_id": "p2",  "project_id": "proj1"},
    {"person_id": "p3",  "project_id": "proj2"},
    {"person_id": "p5",  "project_id": "proj3"},
    {"person_id": "p6",  "project_id": "proj4"},
    {"person_id": "p8",  "project_id": "proj5"},
    {"person_id": "p9",  "project_id": "proj6"},
    {"person_id": "p11", "project_id": "proj7"},
    {"person_id": "p12", "project_id": "proj8"},
    {"person_id": "p14", "project_id": "proj9"},
    {"person_id": "p15", "project_id": "proj10"},
]

DOCUMENTS = [
    {
        "id": "doc1",
        "title": "Search Ranking Infrastructure — Scale & Architecture",
        "author_id": "p1",
        "project_id": "proj1",
        "date": "2024-03-10",
        "content": """
        Google Search serves over 8.5 billion queries per day, requiring a ranking infrastructure
        that operates at a scale no other system on earth matches. The core ranking pipeline uses
        a multi-stage retrieval and scoring architecture: an inverted index lookup narrows candidates
        from trillions of documents to thousands, followed by a learned ranking model (LambdaRank)
        that scores and reorders results using 200+ signals including PageRank, query-document
        relevance, freshness, and user engagement signals collected from anonymised click data.
        The entire ranking pipeline must complete in under 200ms for 99% of queries globally.
        We use a distributed serving infrastructure across 30+ data centres worldwide, with requests
        routed to the nearest available cluster using Anycast DNS.
        Index freshness is maintained through a continuous crawl and indexing pipeline — breaking
        news can appear in results within minutes of publication via the Caffeine indexing system.
        """
    },
    {
        "id": "doc2",
        "title": "Search Generative Experience (SGE) — Design Principles",
        "author_id": "p2",
        "project_id": "proj2",
        "date": "2024-04-05",
        "content": """
        The Search Generative Experience integrates large language model outputs directly into
        the search results page, providing AI-generated summaries for complex queries before
        the traditional blue link results. SGE uses a retrieval-augmented generation (RAG)
        architecture — the LLM is grounded with live web results to reduce hallucination risk.
        A critical design constraint: SGE answers must be clearly attributed to source URLs,
        and users must be able to verify every factual claim against the cited sources.
        The system uses Gemini as the underlying LLM, fine-tuned on search-specific tasks.
        SGE is currently opt-in and deployed to Search Labs users in the US and India.
        Latency budget for SGE responses is 3 seconds maximum, requiring aggressive speculative
        decoding and caching of common query patterns at the generation layer.
        Safety filters run on all generated outputs before display to prevent misinformation.
        """
    },
    {
        "id": "doc3",
        "title": "BigQuery Architecture — Serverless Analytics at Scale",
        "author_id": "p4",
        "project_id": "proj3",
        "date": "2024-02-20",
        "content": """
        BigQuery is Google Cloud's serverless data warehouse, capable of running SQL queries
        over petabyte-scale datasets in seconds. The architecture separates storage from compute:
        data is stored in Colossus (Google's distributed filesystem) in a columnar format called
        Capacitor, and query execution is handled by Dremel — a massively parallel query engine
        that dynamically allocates compute slots across thousands of nodes per query.
        This separation means customers pay only for queries run, not idle compute capacity.
        BigQuery processes over 110 petabytes of customer data daily across all Google Cloud regions.
        Security model: all data is encrypted at rest using AES-256 and in transit via TLS 1.3.
        Column-level and row-level security policies allow fine-grained access control within tables.
        BigQuery Omni extends the platform to query data stored in AWS S3 and Azure ADLS
        without moving data, addressing multi-cloud analytics use cases from enterprise customers.
        """
    },
    {
        "id": "doc4",
        "title": "Gemini — Architecture and Multimodal Design",
        "author_id": "p7",
        "project_id": "proj5",
        "date": "2024-04-12",
        "content": """
        Gemini is Google DeepMind's flagship foundation model family, designed natively multimodal
        from the ground up — unlike prior models that were text-first with modalities bolted on.
        The architecture processes text, images, audio, video, and code within a unified transformer
        using a shared token space across modalities.
        Gemini Ultra achieves state-of-the-art performance on MMLU at 90.0%, surpassing human
        expert performance for the first time on a broad academic benchmark.
        Training was distributed across Google's TPU v5 pods using a custom JAX-based training stack.
        The model family has three tiers: Ultra (maximum capability, datacenter), Pro (balanced,
        API and Cloud), and Nano (on-device, runs on Pixel 8 with 4-bit quantisation).
        Safety and alignment uses RLHF combined with Constitutional AI-inspired techniques.
        Gemini powers SGE in Search, all Workspace AI features, and is available via the Gemini API
        on Google AI Studio and Vertex AI for third-party developers.
        """
    },
    {
        "id": "doc5",
        "title": "AlphaCode 2 — Competitive Programming at Expert Level",
        "author_id": "p8",
        "project_id": "proj6",
        "date": "2024-01-15",
        "content": """
        AlphaCode 2 is DeepMind's code generation system that achieved an estimated ranking
        in the top 15% of competitive programmers on Codeforces — a significant jump from
        AlphaCode 1 which ranked in the top 50%.
        The system combines a large code-specialised language model with a search and filtering
        pipeline: the model generates up to 1 million candidate solutions per problem, which are
        filtered using a learned scoring model trained on test case execution outcomes.
        Key insight: competitive programming requires deep algorithmic reasoning, not just code
        synthesis — AlphaCode 2 explicitly models problem decomposition before generating code.
        Training data includes public competitive programming submissions, GitHub code, and
        technical documentation, with careful deduplication to prevent test set leakage.
        The system is integrated into Gemini as a code reasoning capability and underpins
        the code execution features in Gemini Advanced.
        """
    },
    {
        "id": "doc6",
        "title": "Android Runtime (ART) — Performance Architecture",
        "author_id": "p10",
        "project_id": "proj7",
        "date": "2024-03-01",
        "content": """
        The Android Runtime is the managed runtime that executes all Android applications.
        ART replaced the older Dalvik runtime in Android 5.0 Lollipop, introducing Ahead-of-Time
        compilation that pre-compiles app bytecode to native machine code at install time.
        Android 14 introduces Profile-Guided Optimisation at scale: ART cloud profiles aggregate
        anonymised usage patterns across millions of devices to generate optimisation profiles
        that are pushed to new installs before the user even launches the app for the first time.
        This reduces app startup time by up to 30% on cold starts for popular applications.
        ART's garbage collector uses a concurrent, generational approach with very short pause
        times — critical for maintaining 60fps and 120fps rendering on modern Android hardware.
        The runtime enforces Android's security model: each app runs in an isolated process
        with SELinux mandatory access controls, preventing cross-app data access entirely.
        """
    },
    {
        "id": "doc7",
        "title": "Project Zero — Vulnerability Research Philosophy & Process",
        "author_id": "p13",
        "project_id": "proj9",
        "date": "2024-02-10",
        "content": """
        Project Zero is Google's elite security research team dedicated to finding zero-day
        vulnerabilities in software used by large numbers of people, regardless of vendor.
        The team's mandate is to make it harder for governments and criminal groups to exploit
        the digital infrastructure that billions of people depend on every day.
        Researchers independently discover vulnerabilities and follow a strict 90-day disclosure
        policy — vendors have 90 days to patch before Project Zero publishes details publicly,
        regardless of patch status. This has been controversial but effective in incentivising
        faster patching across the entire software industry.
        In 2023, Project Zero discovered and reported 58 zero-day vulnerabilities including
        critical bugs in iOS Safari, the Windows kernel, and popular VPN software.
        The team maintains a public bug tracker at bugs.chromium.org/p/project-zero.
        Research focus areas for 2024: memory safety in browser engines, baseband security
        in mobile chipsets, and AI model security including adversarial attacks and prompt injection.
        """
    },
    {
        "id": "doc8",
        "title": "Privacy Sandbox — Replacing Third-Party Cookies",
        "author_id": "p14",
        "project_id": "proj10",
        "date": "2024-04-20",
        "content": """
        Privacy Sandbox is Google's initiative to replace third-party cookies with privacy-preserving
        alternatives that still enable digital advertising without exposing individual user data.
        The core APIs: Topics API replaces interest-based targeting — the browser classifies browsing
        into roughly 350 topics locally and shares only 3 per ad request. Protected Audience API
        replaces remarketing — the auction runs locally in the browser using the FLEDGE protocol.
        Attribution Reporting API replaces conversion tracking with aggregated, noisy reports.
        All computation happens on-device — advertisers receive aggregate signals, never individual
        browsing histories. This is enforced by the browser architecture, not policy alone.
        The initiative has faced scrutiny from the UK Competition and Markets Authority (CMA),
        which required Google to consult with them before fully deprecating third-party cookies.
        Chrome began phasing out third-party cookies for 1% of users in January 2024 as a test,
        with full deprecation scheduled for Q3 2024 pending final CMA approval.
        """
    },
]