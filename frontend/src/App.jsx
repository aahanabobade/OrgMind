import { useState, useRef, useEffect } from "react"

const API = "http://127.0.0.1:8001"

// ─── Google Fonts ────────────────────────────────────────────
const fontLink = document.createElement("link")
fontLink.rel = "stylesheet"
fontLink.href = "https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;600;700&family=Google+Sans+Display:wght@400;500;700&family=Roboto:wght@300;400;500&family=Roboto+Mono:wght@400;500&display=swap"
document.head.appendChild(fontLink)

// ─── Data ─────────────────────────────────────────────────────
const ORG = {
  teams: [
    {
      id: "t1", name: "Google Search", dept: "Search & Assistant", color: "#1a73e8", emoji: "🔍",
      description: "Building the world's most powerful search engine with AI-augmented results.",
      members: [
        { name: "Sundar Pichai Jr.", role: "Eng Manager", avatar: "SP", email: "sundar.jr@google.com", location: "Mountain View" },
        { name: "Priya Anand", role: "Senior SWE", avatar: "PA", email: "priya.anand@google.com", location: "New York" },
        { name: "James O'Connor", role: "SWE", avatar: "JO", email: "james.oc@google.com", location: "London" },
      ],
      projects: [
        { name: "Search Ranking", status: "active", priority: "high" },
        { name: "Search Generative Experience", status: "active", priority: "high" },
      ]
    },
    {
      id: "t2", name: "Google Cloud", dept: "Cloud & Infra", color: "#fbbc04", emoji: "☁️",
      description: "Providing scalable cloud infrastructure and data tools for enterprises worldwide.",
      members: [
        { name: "Wei Zhang", role: "Eng Manager", avatar: "WZ", email: "wei.zhang@google.com", location: "Seattle" },
        { name: "Aisha Okafor", role: "Senior SWE", avatar: "AO", email: "aisha.o@google.com", location: "Nairobi" },
        { name: "Lucas Fernandez", role: "SWE", avatar: "LF", email: "lucas.f@google.com", location: "São Paulo" },
      ],
      projects: [
        { name: "BigQuery", status: "active", priority: "high" },
        { name: "Google Kubernetes Engine", status: "active", priority: "medium" },
      ]
    },
    {
      id: "t3", name: "Google DeepMind", dept: "AI Research", color: "#34a853", emoji: "🧠",
      description: "Advancing the state of AI to benefit humanity through groundbreaking research.",
      members: [
        { name: "Elena Sorokina", role: "Eng Manager", avatar: "ES", email: "elena.s@google.com", location: "London" },
        { name: "Ravi Shankar", role: "Sr Research Eng", avatar: "RS", email: "ravi.s@google.com", location: "Bangalore" },
        { name: "Mei Lin", role: "Research Eng", avatar: "ML", email: "mei.lin@google.com", location: "Tokyo" },
      ],
      projects: [
        { name: "Gemini", status: "active", priority: "high" },
        { name: "AlphaCode", status: "active", priority: "medium" },
      ]
    },
    {
      id: "t4", name: "Android", dept: "Platforms", color: "#ea4335", emoji: "📱",
      description: "Building the operating system that powers billions of devices worldwide.",
      members: [
        { name: "Marcus Johnson", role: "Eng Manager", avatar: "MJ", email: "marcus.j@google.com", location: "Mountain View" },
        { name: "Sofia Reyes", role: "Senior SWE", avatar: "SR", email: "sofia.r@google.com", location: "Madrid" },
        { name: "Thomas Müller", role: "SWE", avatar: "TM", email: "thomas.m@google.com", location: "Berlin" },
      ],
      projects: [
        { name: "Android Runtime", status: "active", priority: "high" },
        { name: "Pixel OS", status: "active", priority: "medium" },
      ]
    },
    {
      id: "t5", name: "Security & Privacy", dept: "Trust & Safety", color: "#9334e6", emoji: "🔐",
      description: "Keeping Google's products and users safe through proactive security research.",
      members: [
        { name: "Nadia Hassan", role: "Eng Manager", avatar: "NH", email: "nadia.h@google.com", location: "Mountain View" },
        { name: "Chris Park", role: "Sr Security Eng", avatar: "CP", email: "chris.p@google.com", location: "Seoul" },
        { name: "Ananya Bose", role: "Security Eng", avatar: "AB", email: "ananya.b@google.com", location: "Kolkata" },
      ],
      projects: [
        { name: "Project Zero", status: "active", priority: "high" },
        { name: "Privacy Sandbox", status: "active", priority: "high" },
      ]
    },
  ]
}

const SUGGESTIONS = [
  { icon: "", text: "Who leads Google DeepMind and what are they building?" },
  { icon: "", text: "Who owns Project Zero and what do they research?" },
  { icon: "", text: "Which team owns BigQuery and how does it work?" },
  { icon: "", text: "What has the Android team written about performance?" },
]

const STAGES = [
  { label: "Decomposing query",           sub: "Entity extraction",   icon: "⚙️" },
  { label: "Traversing knowledge graph",  sub: "Neo4j lookup",        icon: "◈" },
  { label: "Searching document vectors",  sub: "Pinecone retrieval",  icon: "⟡" },
  { label: "Fusing context + generating", sub: "GPT-4o synthesis",    icon: "✦" },
]

const NAV_TABS = [
  { id: "chat",     label: "Ask OrgMind",  icon: "💬" },
  { id: "teams",    label: "Our Teams",    icon: "◈"  },
  { id: "people",   label: "People",       icon: "👥" },
  { id: "projects", label: "Projects",     icon: "📁" },
]

// ─── Helpers ──────────────────────────────────────────────────
function avatarColor(name) {
  const colors = ["#1a73e8","#34a853","#ea4335","#fbbc04","#9334e6","#0097a7","#e91e63","#ff6d00"]
  let h = 0
  for (let c of name) h = (h * 31 + c.charCodeAt(0)) & 0xfffffff
  return colors[h % colors.length]
}

// ─── Avatar ───────────────────────────────────────────────────
function Avatar({ initials, name, size = 36 }) {
  const bg = avatarColor(name)
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: bg, display: "flex", alignItems: "center",
      justifyContent: "center", fontSize: size * 0.36,
      fontWeight: 600, color: "#fff", flexShrink: 0,
      fontFamily: "'Google Sans', sans-serif",
      letterSpacing: "-0.3px"
    }}>{initials}</div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status, priority }) {
  const colors = {
    active: { bg: "#e6f4ea", text: "#137333" },
    review: { bg: "#fce8e6", text: "#c5221f" },
    hold:   { bg: "#fef7e0", text: "#b05c00" },
  }
  const priorityColors = {
    high:   "#ea4335",
    medium: "#fbbc04",
    low:    "#34a853",
  }
  const s = colors[status] || colors.active
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: s.bg, color: s.text,
      padding: "2px 10px", borderRadius: "99px",
      fontSize: 11, fontWeight: 500,
      fontFamily: "'Roboto', sans-serif",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: priorityColors[priority] || priorityColors.medium, display: "inline-block" }} />
      {status}
    </span>
  )
}

// ─── Pipeline Stages ──────────────────────────────────────────
function PipelineStages({ current, dark }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {STAGES.map((stage, i) => {
        const done   = i < current - 1
        const active = i === current - 1
        return (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 10,
            opacity: (!done && !active) ? 0.35 : 1,
            transition: "opacity 0.4s ease",
            animation: `stageIn 0.3s ease ${i * 60}ms both`
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: 6,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 600, flexShrink: 0,
              background: done ? "#1a73e8" : active ? "transparent" : "transparent",
              border: done ? "none" : `1.5px solid ${active ? "#1a73e8" : (dark ? "#3c4043" : "#dadce0")}`,
              color: done ? "#fff" : active ? "#1a73e8" : (dark ? "#5f6368" : "#9aa0a6"),
              boxShadow: active ? "0 0 0 4px rgba(26,115,232,0.12)" : "none",
              transition: "all 0.3s ease"
            }}>
              {done ? "✓" : stage.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "'Roboto Mono', monospace", fontSize: 12,
                color: done ? "#1a73e8" : active ? (dark ? "#e8eaed" : "#202124") : (dark ? "#5f6368" : "#9aa0a6"),
                fontWeight: active ? 500 : 400
              }}>{stage.label}</div>
              <div style={{
                fontFamily: "'Roboto Mono', monospace", fontSize: 10,
                color: dark ? "#5f6368" : "#9aa0a6", marginTop: 1
              }}>{stage.sub}</div>
            </div>
            {active && (
              <div style={{
                width: 14, height: 14, borderRadius: "50%",
                border: "2px solid rgba(26,115,232,0.2)",
                borderTopColor: "#1a73e8",
                animation: "spin 0.7s linear infinite",
                flexShrink: 0
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Chat Message ─────────────────────────────────────────────
function ChatMessage({ msg, dark }) {
  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", animation: "msgIn 0.3s cubic-bezier(.22,1,.36,1) both" }}>
        <div style={{
          maxWidth: 560, background: "#1a73e8", color: "#fff",
          borderRadius: "20px 20px 4px 20px",
          padding: "12px 18px", fontSize: 14, lineHeight: 1.65,
          fontFamily: "'Google Sans', sans-serif", fontWeight: 400,
          boxShadow: "0 2px 12px rgba(26,115,232,0.3)"
        }}>{msg.content}</div>
      </div>
    )
  }
  return (
    <div style={{ display: "flex", gap: 12, animation: "msgIn 0.3s cubic-bezier(.22,1,.36,1) both" }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: "linear-gradient(135deg, #4285f4, #1a73e8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 700, color: "#fff",
        fontFamily: "'Google Sans', sans-serif",
        boxShadow: "0 2px 8px rgba(26,115,232,0.25)",
        marginTop: 2
      }}>G</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 11, fontFamily: "'Roboto Mono', monospace",
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: dark ? "#5f6368" : "#9aa0a6", marginBottom: 6
        }}>OrgMind</div>
        <div style={{
          background: dark ? "#2d2e30" : "#fff",
          border: `1px solid ${dark ? "#3c4043" : "#e8eaed"}`,
          borderRadius: "4px 20px 20px 20px",
          padding: "14px 18px", fontSize: 14, lineHeight: 1.75,
          fontFamily: "'Google Sans', sans-serif", fontWeight: 400,
          color: dark ? "#e8eaed" : "#202124",
          whiteSpace: "pre-wrap",
          boxShadow: dark ? "none" : "0 1px 8px rgba(0,0,0,0.06)"
        }}>{msg.content}</div>
        {msg.debug && <DebugPanel debug={msg.debug} dark={dark} />}
      </div>
    </div>
  )
}

function ThinkingBubble({ stages, dark }) {
  return (
    <div style={{ display: "flex", gap: 12, animation: "msgIn 0.3s cubic-bezier(.22,1,.36,1) both" }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
        background: "linear-gradient(135deg, #4285f4, #1a73e8)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, fontWeight: 700, color: "#fff",
        fontFamily: "'Google Sans', sans-serif",
        animation: "pulseSoft 1.5s ease-in-out infinite"
      }}>G</div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 11, fontFamily: "'Roboto Mono', monospace",
          letterSpacing: "0.08em", textTransform: "uppercase",
          color: dark ? "#5f6368" : "#9aa0a6", marginBottom: 6
        }}>thinking…</div>
        <div style={{
          background: dark ? "#2d2e30" : "#fff",
          border: `1px solid ${dark ? "#3c4043" : "#e8eaed"}`,
          borderRadius: "4px 20px 20px 20px",
          padding: "14px 18px",
          boxShadow: dark ? "none" : "0 1px 8px rgba(0,0,0,0.06)"
        }}>
          <PipelineStages current={stages} dark={dark} />
        </div>
      </div>
    </div>
  )
}

// ─── Debug Panel ──────────────────────────────────────────────
function DebugPanel({ debug, dark }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{
      marginTop: 8, borderRadius: 10, overflow: "hidden",
      border: `1px solid ${dark ? "#3c4043" : "#e8eaed"}`,
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", textAlign: "left", padding: "8px 14px",
        display: "flex", alignItems: "center", gap: 8,
        fontFamily: "'Roboto Mono', monospace", fontSize: 10,
        letterSpacing: "0.1em", textTransform: "uppercase",
        color: dark ? "#5f6368" : "#9aa0a6", cursor: "pointer",
        background: "transparent", border: "none",
      }}>
        <span>{open ? "▼" : "▶"}</span>
        <span>Pipeline trace</span>
        <span style={{
          marginLeft: "auto", background: "#e8f0fe", color: "#1a73e8",
          padding: "2px 8px", borderRadius: "99px", fontSize: 9
        }}>{debug.documents?.length || 0} docs</span>
      </button>
      {open && (
        <div style={{
          padding: "10px 14px", borderTop: `1px solid ${dark ? "#3c4043" : "#e8eaed"}`,
          background: dark ? "#1e1e1e" : "#f8f9fa",
          fontFamily: "'Roboto Mono', monospace", fontSize: 11,
          display: "flex", flexDirection: "column", gap: 6
        }}>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ color: dark ? "#5f6368" : "#9aa0a6", minWidth: 60 }}>entities</span>
            <span style={{ color: "#1a73e8" }}>{debug.entities?.join(", ") || "—"}</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ color: dark ? "#5f6368" : "#9aa0a6", minWidth: 60 }}>topic</span>
            <span style={{ color: "#9334e6" }}>{debug.search_topic || "—"}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Teams Page ───────────────────────────────────────────────
function TeamsPage({ dark }) {
  const [activeTeam, setActiveTeam] = useState(ORG.teams[0].id)
  const [filter, setFilter]         = useState("")

  const team = ORG.teams.find(t => t.id === activeTeam) || ORG.teams[0]
  const filteredList = ORG.teams.filter(t =>
    t.name.toLowerCase().includes(filter.toLowerCase()) ||
    t.dept.toLowerCase().includes(filter.toLowerCase())
  )

  const sectionLabel = {
    fontFamily: "'Roboto', sans-serif", fontSize: 10,
    letterSpacing: "0.14em", textTransform: "uppercase",
    color: dark ? "#5f6368" : "#9aa0a6", marginBottom: 12,
  }

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", animation: "pageIn 0.35s cubic-bezier(.22,1,.36,1) both" }}>

      {/* ── Left Panel: Team List ── */}
      <div style={{
        width: 268, flexShrink: 0, overflowY: "auto",
        padding: "24px 16px",
        borderRight: `1px solid ${dark ? "#3c4043" : "#e8eaed"}`,
        background: dark ? "#1e1e1e" : "#f8f9fa",
        display: "flex", flexDirection: "column", gap: 16,
      }}>
        <div>
          <div style={sectionLabel}>All Teams</div>
          {/* Search */}
          <div style={{ display:"flex", alignItems:"center", gap:8, background: dark?"#2d2e30":"#fff", borderRadius:10, padding:"8px 12px", border:`1px solid ${dark?"#3c4043":"#e8eaed"}`, marginBottom:12 }}>
            <span style={{ fontSize:13, color: dark?"#5f6368":"#9aa0a6" }}>🔍</span>
            <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search…"
              style={{ flex:1, background:"transparent", border:"none", outline:"none", fontFamily:"'Google Sans', sans-serif", fontSize:13, color: dark?"#e8eaed":"#202124" }} />
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
            {filteredList.map((t, i) => {
              const isActive = activeTeam === t.id
              return (
                <button key={t.id} onClick={() => setActiveTeam(t.id)}
                  style={{
                    display:"flex", alignItems:"center", gap:11, padding:"11px 13px",
                    borderRadius:12, border:"none", cursor:"pointer", textAlign:"left",
                    background: isActive ? (dark?"#2d2e30":"#fff") : "transparent",
                    boxShadow: isActive ? (dark?"none":`0 1px 6px rgba(0,0,0,0.07)`) : "none",
                    borderLeft: `3px solid ${isActive ? t.color : "transparent"}`,
                    transition:"all 0.18s ease",
                    animation: `cardIn 0.3s ease ${i*40}ms both`,
                  }}
                  onMouseEnter={e => { if(!isActive) e.currentTarget.style.background = dark?"#2d2e30":"#fff" }}
                  onMouseLeave={e => { if(!isActive) e.currentTarget.style.background = "transparent" }}
                >
                  <div style={{ width:36, height:36, borderRadius:10, background:t.color+"18", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{t.emoji}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"'Google Sans', sans-serif", fontSize:13, fontWeight: isActive?600:400, color: isActive?t.color:(dark?"#e8eaed":"#202124"), overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{t.name}</div>
                    <div style={{ fontFamily:"'Roboto', sans-serif", fontSize:10, color: dark?"#5f6368":"#9aa0a6", marginTop:1, letterSpacing:"0.04em" }}>{t.members.length} members · {t.projects.length} projects</div>
                  </div>
                  {isActive && <div style={{ width:6, height:6, borderRadius:"50%", background:t.color, flexShrink:0 }} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Dept breakdown */}
        <div style={{ borderTop:`1px solid ${dark?"#3c4043":"#e8eaed"}`, paddingTop:16 }}>
          <div style={sectionLabel}>Departments</div>
          {[...new Set(ORG.teams.map(t=>t.dept))].map((dept, i) => {
            const deptTeams = ORG.teams.filter(t=>t.dept===dept)
            return (
              <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 2px" }}>
                <span style={{ fontFamily:"'Google Sans', sans-serif", fontSize:12, color: dark?"#9aa0a6":"#5f6368" }}>{dept}</span>
                <span style={{ fontFamily:"'Roboto Mono', monospace", fontSize:10, color: dark?"#5f6368":"#9aa0a6", background: dark?"#2d2e30":"#f1f3f4", padding:"2px 7px", borderRadius:99 }}>{deptTeams.length}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Right Panel: Team Detail ── */}
      <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column" }}>

        {/* Hero banner */}
        <div style={{
          padding:"36px 44px 28px",
          background: dark
            ? `linear-gradient(135deg, ${team.color}18 0%, transparent 60%)`
            : `linear-gradient(135deg, ${team.color}10 0%, #fff 60%)`,
          borderBottom: `1px solid ${dark?"#3c4043":"#e8eaed"}`,
        }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:20, marginBottom:24 }}>
            <div style={{ width:64, height:64, borderRadius:18, background:team.color+"20", border:`2px solid ${team.color}30`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, flexShrink:0 }}>{team.emoji}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:6 }}>
                <h1 style={{ fontFamily:"'Google Sans Display', sans-serif", fontSize:30, fontWeight:600, color: dark?"#e8eaed":"#202124", lineHeight:1 }}>{team.name}</h1>
                <span style={{ fontFamily:"'Roboto', sans-serif", fontSize:11, letterSpacing:"0.08em", textTransform:"uppercase", color:team.color, background:team.color+"15", padding:"3px 10px", borderRadius:99 }}>{team.dept}</span>
              </div>
              <p style={{ fontFamily:"'Google Sans', sans-serif", fontSize:14, color: dark?"#9aa0a6":"#5f6368", lineHeight:1.6, maxWidth:560 }}>{team.description}</p>
            </div>
          </div>

          {/* Quick stats row */}
          <div style={{ display:"flex", gap:16 }}>
            {[
              { label:"Members", value:team.members.length, icon:"" },
              { label:"Projects", value:team.projects.length, icon:"" },
              { label:"Location", value:[...new Set(team.members.map(m=>m.location))].length+" cities", icon:"" },
            ].map((s,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", borderRadius:12, background: dark?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.03)", border:`1px solid ${dark?"#3c4043":"#e8eaed"}` }}>
                <span style={{ fontSize:16 }}>{s.icon}</span>
                <div>
                  <div style={{ fontFamily:"'Google Sans Display', sans-serif", fontSize:20, fontWeight:700, color:team.color, lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontFamily:"'Roboto', sans-serif", fontSize:11, color: dark?"#9aa0a6":"#5f6368", marginTop:1 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members + Projects */}
        <div style={{ padding:"32px 44px", display:"grid", gridTemplateColumns:"1fr 1fr", gap:32, flex:1 }}>

          {/* Members */}
          <div>
            <div style={{ ...sectionLabel, marginBottom:16 }}>Team Members</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {team.members.map((m, i) => (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:14,
                  padding:"14px 18px", borderRadius:14,
                  background: dark?"#2d2e30":"#fff",
                  border:`1px solid ${dark?"#3c4043":"#e8eaed"}`,
                  boxShadow: dark?"none":"0 1px 6px rgba(0,0,0,0.05)",
                  animation:`cardIn 0.3s ease ${i*60}ms both`,
                  transition:"all 0.18s ease",
                }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor=team.color; e.currentTarget.style.boxShadow=`0 4px 16px ${team.color}18` }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor=dark?"#3c4043":"#e8eaed"; e.currentTarget.style.boxShadow=dark?"none":"0 1px 6px rgba(0,0,0,0.05)" }}
                >
                  <Avatar initials={m.avatar} name={m.name} size={44} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:"'Google Sans', sans-serif", fontSize:14, fontWeight:600, color: dark?"#e8eaed":"#202124" }}>{m.name}</div>
                    <div style={{ fontFamily:"'Roboto', sans-serif", fontSize:12, color: dark?"#9aa0a6":"#5f6368", marginTop:2 }}>{m.role}</div>
                    <div style={{ fontFamily:"'Roboto', sans-serif", fontSize:11, color: dark?"#5f6368":"#9aa0a6", marginTop:3 }}>📍 {m.location} · ✉ {m.email}</div>
                  </div>
                  {i === 0 && <span style={{ fontFamily:"'Roboto', sans-serif", fontSize:10, letterSpacing:"0.06em", textTransform:"uppercase", color:team.color, background:team.color+"15", padding:"3px 8px", borderRadius:99, flexShrink:0 }}>Lead</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Projects + extra info */}
          <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
            <div>
              <div style={{ ...sectionLabel, marginBottom:16 }}>Active Projects</div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {team.projects.map((p, i) => (
                  <div key={i} style={{
                    padding:"16px 20px", borderRadius:14,
                    background: dark?"#2d2e30":"#fff",
                    border:`1px solid ${dark?"#3c4043":"#e8eaed"}`,
                    borderLeft:`4px solid ${team.color}`,
                    boxShadow: dark?"none":"0 1px 6px rgba(0,0,0,0.05)",
                    animation:`cardIn 0.3s ease ${i*80}ms both`,
                    transition:"all 0.18s ease",
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                  }}
                  onMouseEnter={e=>{ e.currentTarget.style.transform="translateX(4px)"; e.currentTarget.style.boxShadow=`0 4px 16px ${team.color}18` }}
                  onMouseLeave={e=>{ e.currentTarget.style.transform="translateX(0)"; e.currentTarget.style.boxShadow=dark?"none":"0 1px 6px rgba(0,0,0,0.05)" }}
                  >
                    <div>
                      <div style={{ fontFamily:"'Google Sans', sans-serif", fontSize:15, fontWeight:600, color: dark?"#e8eaed":"#202124", marginBottom:4 }}>{p.name}</div>
                      <div style={{ fontFamily:"'Roboto', sans-serif", fontSize:11, color:team.color, letterSpacing:"0.05em", textTransform:"uppercase" }}>{team.dept}</div>
                    </div>
                    <StatusBadge status={p.status} priority={p.priority} />
                  </div>
                ))}
              </div>
            </div>

            {/* Team at a glance card */}
            <div style={{
              padding:"20px 22px", borderRadius:16,
              background: dark?"#2d2e30":"#fff",
              border:`1px solid ${dark?"#3c4043":"#e8eaed"}`,
              boxShadow: dark?"none":"0 1px 6px rgba(0,0,0,0.05)",
            }}>
              <div style={{ ...sectionLabel }}>Team Locations</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                {[...new Set(team.members.map(m=>m.location))].map((loc,i)=>(
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 12px", borderRadius:99, background:team.color+"12", border:`1px solid ${team.color}30` }}>
                    <span style={{ fontSize:12 }}>📍</span>
                    <span style={{ fontFamily:"'Google Sans', sans-serif", fontSize:12, fontWeight:500, color:team.color }}>{loc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── People Page ──────────────────────────────────────────────
function PeoplePage({ dark }) {
  const [search, setSearch]         = useState("")
  const [activeTeam, setActiveTeam] = useState("all")
  const [selected, setSelected]     = useState(null)

  const allPeople = ORG.teams.flatMap(t =>
    t.members.map(m => ({ ...m, team: t.name, teamColor: t.color, teamEmoji: t.emoji, dept: t.dept }))
  )
  const filtered = allPeople.filter(p => {
    const matchSearch = [p.name, p.role, p.team].some(s => s.toLowerCase().includes(search.toLowerCase()))
    const matchTeam   = activeTeam === "all" || p.team === activeTeam
    return matchSearch && matchTeam
  })
  const locations = [...new Set(allPeople.map(p => p.location))]

  const panel = {
    width: 252, flexShrink: 0, overflowY: "auto",
    padding: "28px 18px",
    borderRight: `1px solid ${dark ? "#3c4043" : "#e8eaed"}`,
    background: dark ? "#1e1e1e" : "#f8f9fa",
    display: "flex", flexDirection: "column", gap: 28,
  }
  const sectionLabel = {
    fontFamily: "'Roboto', sans-serif", fontSize: 10,
    letterSpacing: "0.14em", textTransform: "uppercase",
    color: dark ? "#5f6368" : "#9aa0a6", marginBottom: 12,
  }

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", animation: "pageIn 0.35s cubic-bezier(.22,1,.36,1) both" }}>

      {/* ── Left Panel ── */}
      <div style={panel}>
        {/* Stats grid */}
        <div>
          <div style={sectionLabel}>Overview</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Total",  value: allPeople.length,  color: "#1a73e8" },
              { label: "Teams",  value: ORG.teams.length,  color: "#34a853" },
              { label: "Cities", value: locations.length,  color: "#fbbc04" },
              { label: "Shown",  value: filtered.length,   color: "#ea4335" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "12px 12px 10px", borderRadius: 12,
                background: dark ? "#2d2e30" : "#fff",
                border: `1px solid ${dark ? "#3c4043" : "#e8eaed"}`,
              }}>
                <div style={{ fontFamily: "'Google Sans Display', sans-serif", fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 11, color: dark ? "#9aa0a6" : "#5f6368", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team filter */}
        <div>
          <div style={sectionLabel}>Filter by Team</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { id: "all", name: "All Teams", emoji: "👥", color: "#1a73e8" },
              ...ORG.teams.map(t => ({ id: t.name, name: t.name, emoji: t.emoji, color: t.color }))
            ].map(t => {
              const isActive = activeTeam === t.id
              return (
                <button key={t.id} onClick={() => setActiveTeam(t.id)} style={{
                  display: "flex", alignItems: "center", gap: 9,
                  padding: "8px 11px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: isActive ? (dark ? "#2d2e30" : "#e8f0fe") : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = dark ? "#2d2e30" : "#f1f3f4" }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent" }}
                >
                  <span style={{ fontSize: 14 }}>{t.emoji}</span>
                  <span style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 13, fontWeight: isActive ? 600 : 400, color: isActive ? t.color : (dark ? "#9aa0a6" : "#5f6368"), flex: 1 }}>{t.name}</span>
                  {isActive && <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.color, flexShrink: 0 }} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Offices */}
        <div>
          <div style={sectionLabel}>Offices</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
            {locations.map((loc, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "5px 2px" }}>
                <span style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 12, color: dark ? "#9aa0a6" : "#5f6368" }}>📍 {loc}</span>
                <span style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 10, color: dark ? "#5f6368" : "#9aa0a6", background: dark ? "#2d2e30" : "#f1f3f4", padding: "2px 7px", borderRadius: 99 }}>
                  {allPeople.filter(p => p.location === loc).length}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 36px" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontFamily: "'Google Sans Display', sans-serif", fontSize: 28, fontWeight: 500, color: dark ? "#e8eaed" : "#202124" }}>People</h1>
            <p style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 13, color: dark ? "#9aa0a6" : "#5f6368", marginTop: 3 }}>
              Showing {filtered.length} of {allPeople.length} employees
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: dark ? "#2d2e30" : "#f1f3f4", borderRadius: 24, padding: "9px 18px", minWidth: 280 }}>
            <span style={{ fontSize: 15, color: dark ? "#9aa0a6" : "#5f6368" }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search people…"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "'Google Sans', sans-serif", fontSize: 14, color: dark ? "#e8eaed" : "#202124" }} />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: dark ? "#9aa0a6" : "#5f6368", fontSize: 14 }}>✕</button>}
          </div>
        </div>

        {/* Card grid — fills all available width */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 14 }}>
          {filtered.map((person, idx) => {
            const isSel = selected?.name === person.name
            return (
              <div key={idx} onClick={() => setSelected(isSel ? null : person)} style={{
                background: dark ? "#2d2e30" : "#fff",
                border: `1px solid ${isSel ? person.teamColor : (dark ? "#3c4043" : "#e8eaed")}`,
                borderRadius: 16, padding: "20px 18px", cursor: "pointer",
                transition: "all 0.2s cubic-bezier(.22,1,.36,1)",
                animation: `cardIn 0.3s ease ${idx * 30}ms both`,
                boxShadow: isSel ? `0 6px 24px ${person.teamColor}28` : (dark ? "none" : "0 1px 6px rgba(0,0,0,0.06)"),
                transform: isSel ? "translateY(-3px)" : "translateY(0)",
              }}
              onMouseEnter={e => { if (!isSel) { e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow=dark?"0 8px 28px rgba(0,0,0,0.35)":"0 8px 28px rgba(0,0,0,0.1)" }}}
              onMouseLeave={e => { if (!isSel) { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=dark?"none":"0 1px 6px rgba(0,0,0,0.06)" }}}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <Avatar initials={person.avatar} name={person.name} size={46} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 14, fontWeight: 600, color: dark ? "#e8eaed" : "#202124", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{person.name}</div>
                    <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: dark ? "#9aa0a6" : "#5f6368", marginTop: 1 }}>{person.role}</div>
                  </div>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: person.teamColor + "15", borderRadius: 99, padding: "3px 10px", marginBottom: 10 }}>
                  <span style={{ fontSize: 11 }}>{person.teamEmoji}</span>
                  <span style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 11, fontWeight: 600, color: person.teamColor }}>{person.team}</span>
                </div>
                <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: dark ? "#9aa0a6" : "#5f6368" }}>📍 {person.location}</div>
                <div style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 10, color: dark ? "#5f6368" : "#9aa0a6", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>✉ {person.email}</div>
              </div>
            )
          })}
        </div>

        {/* Expanded profile drawer */}
        {selected && (
          <div style={{
            marginTop: 20, padding: "28px 32px", borderRadius: 20,
            background: dark ? "#2d2e30" : "#fff",
            border: `2px solid ${selected.teamColor}`,
            boxShadow: `0 8px 40px ${selected.teamColor}22`,
            animation: "slideDown 0.28s cubic-bezier(.22,1,.36,1) both",
            display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: 28, alignItems: "start",
          }}>
            <Avatar initials={selected.avatar} name={selected.name} size={70} />
            <div>
              <h2 style={{ fontFamily: "'Google Sans Display', sans-serif", fontSize: 22, fontWeight: 600, color: dark ? "#e8eaed" : "#202124", marginBottom: 4 }}>{selected.name}</h2>
              <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 14, color: dark ? "#9aa0a6" : "#5f6368", marginBottom: 12 }}>{selected.role}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: selected.teamColor + "15", borderRadius: 99, padding: "5px 13px" }}>
                <span>{selected.teamEmoji}</span>
                <span style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 13, fontWeight: 600, color: selected.teamColor }}>{selected.team}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["📍","Location",selected.location],["✉","Email",selected.email],["🏢","Dept",selected.dept]].map(([icon,label,val]) => (
                <div key={label} style={{ display: "flex", gap: 10 }}>
                  <span style={{ fontSize: 15, marginTop: 1 }}>{icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: dark ? "#5f6368" : "#9aa0a6" }}>{label}</div>
                    <div style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 13, color: dark ? "#e8eaed" : "#202124", marginTop: 1 }}>{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Projects Page ────────────────────────────────────────────
function ProjectsPage({ dark }) {
  const [activeTeam, setActiveTeam]   = useState("all")
  const [view, setView]               = useState("board") // "board" | "list"
  const [hoveredProj, setHoveredProj] = useState(null)

  const allProjects = ORG.teams.flatMap(t =>
    t.projects.map(p => ({ ...p, team: t.name, teamColor: t.color, teamEmoji: t.emoji, dept: t.dept }))
  )
  const visibleTeams = activeTeam === "all"
    ? ORG.teams
    : ORG.teams.filter(t => t.name === activeTeam)

  const totalActive  = allProjects.filter(p => p.status === "active").length
  const totalHigh    = allProjects.filter(p => p.priority === "high").length

  const panel = {
    width: 252, flexShrink: 0, overflowY: "auto",
    padding: "28px 18px",
    borderRight: `1px solid ${dark ? "#3c4043" : "#e8eaed"}`,
    background: dark ? "#1e1e1e" : "#f8f9fa",
    display: "flex", flexDirection: "column", gap: 28,
  }
  const sectionLabel = {
    fontFamily: "'Roboto', sans-serif", fontSize: 10,
    letterSpacing: "0.14em", textTransform: "uppercase",
    color: dark ? "#5f6368" : "#9aa0a6", marginBottom: 12,
  }

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", animation: "pageIn 0.35s cubic-bezier(.22,1,.36,1) both" }}>

      {/* ── Left Panel ── */}
      <div style={panel}>
        {/* Stats */}
        <div>
          <div style={sectionLabel}>Overview</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { label: "Total",    value: allProjects.length, color: "#1a73e8" },
              { label: "Teams",    value: ORG.teams.length,   color: "#34a853" },
              { label: "Active",   value: totalActive,        color: "#fbbc04" },
              { label: "High Priority", value: totalHigh,          color: "#ea4335" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "12px 12px 10px", borderRadius: 12, background: dark ? "#2d2e30" : "#fff", border: `1px solid ${dark ? "#3c4043" : "#e8eaed"}` }}>
                <div style={{ fontFamily: "'Google Sans Display', sans-serif", fontSize: 26, fontWeight: 700, color: s.color, lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: 11, color: dark ? "#9aa0a6" : "#5f6368", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team filter */}
        <div>
          <div style={sectionLabel}>Filter by Team</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[{ id:"all", name:"All Teams", emoji:"📁", color:"#1a73e8" }, ...ORG.teams.map(t=>({ id:t.name, name:t.name, emoji:t.emoji, color:t.color }))].map(t => {
              const isActive = activeTeam === t.id
              return (
                <button key={t.id} onClick={() => setActiveTeam(t.id)} style={{
                  display:"flex", alignItems:"center", gap:9, padding:"8px 11px",
                  borderRadius:10, border:"none", cursor:"pointer",
                  background: isActive ? (dark ? "#2d2e30" : "#e8f0fe") : "transparent",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = dark ? "#2d2e30" : "#f1f3f4" }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent" }}
                >
                  <span style={{ fontSize: 14 }}>{t.emoji}</span>
                  <span style={{ fontFamily:"'Google Sans', sans-serif", fontSize:13, fontWeight: isActive?600:400, color: isActive?t.color:(dark?"#9aa0a6":"#5f6368"), flex:1 }}>{t.name}</span>
                  {isActive && <div style={{ width:6, height:6, borderRadius:"50%", background:t.color }} />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Priority legend */}
        <div>
          <div style={sectionLabel}>Priority</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[["#ea4335","High","Critical path items"],["#fbbc04","Medium","Standard delivery"],["#34a853","Low","Backlog"]].map(([color, label, sub]) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 2px" }}>
                <div style={{ width:10, height:10, borderRadius:"50%", background:color, flexShrink:0 }} />
                <div>
                  <div style={{ fontFamily:"'Google Sans', sans-serif", fontSize:12, fontWeight:500, color: dark?"#e8eaed":"#202124" }}>{label}</div>
                  <div style={{ fontFamily:"'Roboto', sans-serif", fontSize:10, color: dark?"#5f6368":"#9aa0a6" }}>{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 36px" }}>
        {/* Header row */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28, flexWrap:"wrap", gap:14 }}>
          <div>
            <h1 style={{ fontFamily:"'Google Sans Display', sans-serif", fontSize:28, fontWeight:500, color: dark?"#e8eaed":"#202124" }}>Projects</h1>
            <p style={{ fontFamily:"'Google Sans', sans-serif", fontSize:13, color: dark?"#9aa0a6":"#5f6368", marginTop:3 }}>
              {allProjects.length} projects · {ORG.teams.length} teams
            </p>
          </div>
          {/* View toggle */}
          <div style={{ display:"flex", gap:4, padding:4, borderRadius:10, background: dark?"#2d2e30":"#f1f3f4" }}>
            {[["board","⊞ Board"],["list","☰ List"]].map(([v,label]) => (
              <button key={v} onClick={() => setView(v)} style={{
                padding:"7px 16px", borderRadius:8, border:"none", cursor:"pointer",
                fontFamily:"'Google Sans', sans-serif", fontSize:13, fontWeight: view===v?600:400,
                background: view===v ? (dark?"#3c4043":"#fff") : "transparent",
                color: view===v ? (dark?"#e8eaed":"#202124") : (dark?"#9aa0a6":"#5f6368"),
                boxShadow: view===v ? (dark?"none":"0 1px 4px rgba(0,0,0,0.1)") : "none",
                transition:"all 0.15s",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Board View */}
        {view === "board" && (
          <div style={{ display:"flex", flexDirection:"column", gap:32 }}>
            {visibleTeams.map((team, ti) => (
              <div key={team.id} style={{ animation:`pageIn 0.3s ease ${ti*50}ms both` }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
                  <span style={{ fontSize:18 }}>{team.emoji}</span>
                  <span style={{ fontFamily:"'Google Sans', sans-serif", fontSize:16, fontWeight:600, color: dark?"#e8eaed":"#202124" }}>{team.name}</span>
                  <span style={{ fontFamily:"'Roboto', sans-serif", fontSize:11, color:team.color, letterSpacing:"0.06em", textTransform:"uppercase", marginLeft:4 }}>{team.dept}</span>
                  <div style={{ flex:1, height:1, background: dark?"#3c4043":"#e8eaed" }} />
                  <span style={{ fontFamily:"'Roboto Mono', monospace", fontSize:10, color: dark?"#5f6368":"#9aa0a6" }}>{team.projects.length} projects</span>
                </div>
                {/* Full-width project cards */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))", gap:14 }}>
                  {team.projects.map((proj, pi) => {
                    const key = `${team.id}-${pi}`
                    const isHovered = hoveredProj === key
                    return (
                      <div key={pi}
                        onMouseEnter={() => setHoveredProj(key)}
                        onMouseLeave={() => setHoveredProj(null)}
                        style={{
                          background: dark?"#2d2e30":"#fff",
                          border: `1px solid ${isHovered ? team.color : (dark?"#3c4043":"#e8eaed")}`,
                          borderTop: `3px solid ${team.color}`,
                          borderRadius: 14, padding:"18px 20px",
                          transition:"all 0.2s ease",
                          boxShadow: isHovered ? `0 6px 24px ${team.color}22` : (dark?"none":"0 1px 6px rgba(0,0,0,0.05)"),
                          transform: isHovered ? "translateY(-3px)" : "translateY(0)",
                          cursor:"default",
                        }}
                      >
                        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:10, marginBottom:14 }}>
                          <div style={{ fontFamily:"'Google Sans', sans-serif", fontSize:15, fontWeight:600, color: dark?"#e8eaed":"#202124", lineHeight:1.3 }}>{proj.name}</div>
                          <StatusBadge status={proj.status} priority={proj.priority} />
                        </div>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:team.color+"15", borderRadius:99, padding:"3px 9px" }}>
                            <span style={{ fontSize:11 }}>{team.emoji}</span>
                            <span style={{ fontFamily:"'Roboto', sans-serif", fontSize:10, fontWeight:600, color:team.color, letterSpacing:"0.04em" }}>{team.name}</span>
                          </div>
                          <div style={{ display:"flex", gap:"-8px" }}>
                            {team.members.slice(0,3).map((m,i) => (
                              <Avatar key={i} initials={m.avatar} name={m.name} size={24} />
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {/* Table header */}
            <div style={{
              display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr",
              padding:"10px 16px", borderRadius:10,
              background: dark?"#2d2e30":"#f8f9fa",
              border:`1px solid ${dark?"#3c4043":"#e8eaed"}`,
              marginBottom:6,
            }}>
              {["Project","Team","Priority","Status"].map(h => (
                <div key={h} style={{ fontFamily:"'Roboto', sans-serif", fontSize:11, letterSpacing:"0.1em", textTransform:"uppercase", color: dark?"#5f6368":"#9aa0a6" }}>{h}</div>
              ))}
            </div>
            {visibleTeams.flatMap(team =>
              team.projects.map((proj, pi) => (
                <div key={`${team.id}-${pi}`} style={{
                  display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr",
                  padding:"12px 16px", borderRadius:10, alignItems:"center",
                  background: dark?"#2d2e30":"#fff",
                  border:`1px solid ${dark?"#3c4043":"#e8eaed"}`,
                  transition:"all 0.15s",
                  boxShadow: dark?"none":"0 1px 4px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=team.color; e.currentTarget.style.boxShadow=`0 3px 12px ${team.color}18` }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=dark?"#3c4043":"#e8eaed"; e.currentTarget.style.boxShadow=dark?"none":"0 1px 4px rgba(0,0,0,0.04)" }}
                >
                  <div style={{ fontFamily:"'Google Sans', sans-serif", fontSize:14, fontWeight:500, color: dark?"#e8eaed":"#202124", display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:3, height:22, borderRadius:2, background:team.color, flexShrink:0 }} />
                    {proj.name}
                  </div>
                  <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:team.color+"15", borderRadius:99, padding:"3px 10px", width:"fit-content" }}>
                    <span style={{ fontSize:11 }}>{team.emoji}</span>
                    <span style={{ fontFamily:"'Google Sans', sans-serif", fontSize:11, fontWeight:600, color:team.color }}>{team.name}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <div style={{ width:7, height:7, borderRadius:"50%", background: proj.priority==="high"?"#ea4335":proj.priority==="medium"?"#fbbc04":"#34a853" }} />
                    <span style={{ fontFamily:"'Google Sans', sans-serif", fontSize:13, color: dark?"#9aa0a6":"#5f6368", textTransform:"capitalize" }}>{proj.priority}</span>
                  </div>
                  <StatusBadge status={proj.status} priority={proj.priority} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Chat Page ────────────────────────────────────────────────
function ChatPage({ dark }) {
  const [messages,  setMessages] = useState([])
  const [input,     setInput]    = useState("")
  const [loading,   setLoading]  = useState(false)
  const [stages,    setStages]   = useState(0)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function sendMessage(q) {
    const question = q || input
    if (!question.trim() || loading) return
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: question }])
    setLoading(true); setStages(1)
    setTimeout(() => setStages(2), 900)
    setTimeout(() => setStages(3), 2000)
    setTimeout(() => setStages(4), 3100)
    try {
      const res = await fetch(`${API}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      })
      const data = await res.json()
      setTimeout(() => {
        setLoading(false); setStages(0)
        setMessages(prev => [...prev, { role: "assistant", content: data.answer, debug: data.debug }])
      }, 400)
    } catch {
      setLoading(false); setStages(0)
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "⚠️ Could not reach the OrgMind API. Is the backend running on port 8001?",
      }])
    }
  }

  const isEmpty = messages.length === 0 && !loading

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", animation: "pageIn 0.35s cubic-bezier(.22,1,.36,1) both" }}>

      {/* Messages / Empty State */}
      <div style={{ flex: 1, overflowY: "auto", padding: isEmpty ? "0" : "32px 40px", display: "flex", flexDirection: "column", gap: 24 }}>
        {isEmpty ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 40px", gap: 32 }}>
            {/* Google-style logo */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
              <div style={{ display: "flex", gap: 0, animation: "logoIn 0.6s cubic-bezier(.22,1,.36,1) both" }}>
                {["O", "r", "g", "M", "i", "n", "d"].map((letter, i) => (
                  <span key={i} style={{
                    fontFamily: "'Google Sans Display', sans-serif",
                    fontSize: 52, fontWeight: 700, lineHeight: 1,
                    color: ["#4285f4","#ea4335","#fbbc04","#4285f4","#34a853","#ea4335","#4285f4"][i],
                    animation: `letterBounce 0.5s cubic-bezier(.22,1,.36,1) ${i * 60}ms both`
                  }}>{letter}</span>
                ))}
              </div>
              <p style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 18, fontWeight: 400, color: dark ? "#9aa0a6" : "#5f6368", textAlign: "center", maxWidth: 400, lineHeight: 1.5 }}>
                Ask anything about your company , teams, people, projects, docs
              </p>
            </div>

            {/* Suggestion chips */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", maxWidth: 600 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s.text)} style={{
                  display: "flex", alignItems: "flex-start", gap: 10, textAlign: "left",
                  padding: "14px 16px", borderRadius: 12,
                  background: dark ? "#2d2e30" : "#fff",
                  border: `1px solid ${dark ? "#3c4043" : "#e8eaed"}`,
                  cursor: "pointer", transition: "all 0.2s ease",
                  animation: `cardIn 0.4s ease ${i * 70}ms both`,
                  boxShadow: dark ? "none" : "0 1px 6px rgba(0,0,0,0.06)"
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#1a73e8"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(26,115,232,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = dark ? "#3c4043" : "#e8eaed"; e.currentTarget.style.boxShadow = dark ? "none" : "0 1px 6px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  <span style={{ fontSize: 18, flexShrink: 0 }}>{s.icon}</span>
                  <span style={{ fontFamily: "'Google Sans', sans-serif", fontSize: 13, color: dark ? "#9aa0a6" : "#5f6368", lineHeight: 1.5 }}>{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => <ChatMessage key={i} msg={msg} dark={dark} />)}
            {loading && <ThinkingBubble stages={stages} dark={dark} />}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input Bar */}
      <div style={{
        padding: "16px 40px 24px",
        background: dark ? "rgba(26,26,26,0.8)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(16px)",
        borderTop: `1px solid ${dark ? "#3c4043" : "#e8eaed"}`,
      }}>
        <form onSubmit={e => { e.preventDefault(); sendMessage() }} style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            background: dark ? "#2d2e30" : "#f1f3f4",
            borderRadius: 28, padding: "8px 8px 8px 20px",
            border: `1px solid ${dark ? "#3c4043" : "transparent"}`,
            transition: "all 0.3s ease",
          }}
          onFocus={e => { e.currentTarget.style.background = dark ? "#3c4043" : "#fff"; e.currentTarget.style.boxShadow = "0 1px 6px rgba(26,115,232,0.2), 0 0 0 3px rgba(26,115,232,0.08)"; e.currentTarget.style.borderColor = "#1a73e8"; }}
          onBlur={e => { e.currentTarget.style.background = dark ? "#2d2e30" : "#f1f3f4"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = dark ? "#3c4043" : "transparent"; }}
          >
            <span style={{ fontSize: 18, flexShrink: 0 }}>🔍</span>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask anything about the org…"
              style={{
                flex: 1, background: "transparent", border: "none", outline: "none",
                fontFamily: "'Google Sans', sans-serif", fontSize: 15,
                color: dark ? "#e8eaed" : "#202124",
                padding: "6px 0"
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                width: 40, height: 40, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                background: input.trim() && !loading ? "#1a73e8" : (dark ? "#3c4043" : "#e8eaed"),
                color: input.trim() && !loading ? "#fff" : (dark ? "#5f6368" : "#9aa0a6"),
                fontSize: 18, transition: "all 0.2s ease",
                transform: input.trim() && !loading ? "scale(1)" : "scale(0.9)"
              }}
            >↑</button>
          </div>
        </form>
        <p style={{
          textAlign: "center", marginTop: 10,
          fontFamily: "'Roboto Mono', monospace", fontSize: 10,
          letterSpacing: "0.1em", color: dark ? "#5f6368" : "#9aa0a6"
        }}>
          hybrid retrieval · knowledge graph + vector search
        </p>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────
export default function App() {
  const [tab,  setTab]  = useState("chat")
  const [dark, setDark] = useState(false)

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      background: dark ? "#1a1a1a" : "#fff",
      fontFamily: "'Google Sans', sans-serif",
      transition: "background 0.4s ease, color 0.4s ease",
      color: dark ? "#e8eaed" : "#202124"
    }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes msgIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pageIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes cardIn { from { opacity: 0; transform: translateY(10px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes stageIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes logoIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes letterBounce { 0% { opacity: 0; transform: translateY(20px) scale(0.8); } 60% { transform: translateY(-6px) scale(1.05); } 100% { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes pulseSoft { 0%,100% { box-shadow: 0 0 0 0 rgba(26,115,232,0.3); } 50% { box-shadow: 0 0 0 6px rgba(26,115,232,0); } }
        @keyframes tabIndicator { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #dadce0; border-radius: 3px; }
        input::placeholder { color: inherit; opacity: 0.5; }
      `}</style>

      {/* ── Top Navigation ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center",
        padding: "0 24px",
        height: 64,
        background: dark ? "rgba(26,26,26,0.95)" : "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${dark ? "#3c4043" : "#e8eaed"}`,
        boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.08)"
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 32 }}>
          {["O","r","g","M","i","n","d"].map((l, i) => (
            <span key={i} style={{
              fontFamily: "'Google Sans Display', sans-serif",
              fontSize: 22, fontWeight: 700, lineHeight: 1,
              color: ["#4285f4","#ea4335","#fbbc04","#4285f4","#34a853","#ea4335","#4285f4"][i],
            }}>{l}</span>
          ))}
        </div>

        {/* Nav Tabs */}
        <nav style={{ display: "flex", alignItems: "stretch", gap: 0, flex: 1, height: "100%" }}>
          {NAV_TABS.map(t => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "0 18px", border: "none",
                background: "transparent",
                color: active ? "#1a73e8" : (dark ? "#9aa0a6" : "#5f6368"),
                fontFamily: "'Google Sans', sans-serif", fontSize: 14, fontWeight: active ? 600 : 400,
                cursor: "pointer", transition: "color 0.2s ease",
                position: "relative",
                borderBottom: active ? "3px solid #1a73e8" : "3px solid transparent",
                marginBottom: "-1px",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = dark ? "#e8eaed" : "#202124"; e.currentTarget.style.borderBottomColor = dark ? "#5f6368" : "#dadce0"; }}}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = dark ? "#9aa0a6" : "#5f6368"; e.currentTarget.style.borderBottomColor = "transparent"; }}}
              >
                <span style={{ fontSize: 15 }}>{t.icon}</span>
                {t.label}
              </button>
            )
          })}
        </nav>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {["Neo4j", "Pinecone", "GPT-4o"].map(label => (
            <span key={label} style={{
              fontFamily: "'Roboto Mono', monospace", fontSize: 10,
              letterSpacing: "0.08em", padding: "4px 10px", borderRadius: 99,
              border: `1px solid ${dark ? "#3c4043" : "#e8eaed"}`,
              color: dark ? "#5f6368" : "#9aa0a6"
            }}>{label}</span>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 8px" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34a853", boxShadow: "0 0 6px #34a85388", animation: "pulseSoft 2s ease-in-out infinite" }} />
            <span style={{ fontFamily: "'Roboto', sans-serif", fontSize: 12, color: dark ? "#5f6368" : "#9aa0a6" }}>live</span>
          </div>
          <button onClick={() => setDark(!dark)} style={{
            width: 40, height: 22, borderRadius: 99, border: "none", position: "relative",
            background: dark ? "#4285f4" : "#e8eaed", cursor: "pointer", transition: "background 0.3s ease"
          }}>
            <div style={{
              position: "absolute", top: 3, left: dark ? 21 : 3,
              width: 16, height: 16, borderRadius: "50%", background: "#fff",
              transition: "left 0.3s cubic-bezier(.34,1.56,.64,1)",
              boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 9
            }}>{dark ? "☽" : "☀"}</div>
          </button>
        </div>
      </header>

      {/* ── Page Content ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {tab === "chat"     && <ChatPage     dark={dark} />}
        {tab === "teams"    && <TeamsPage    dark={dark} />}
        {tab === "people"   && <PeoplePage   dark={dark} />}
        {tab === "projects" && <ProjectsPage dark={dark} />}
      </div>
    </div>
  )
}