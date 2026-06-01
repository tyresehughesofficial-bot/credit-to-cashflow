#!/usr/bin/env python3
"""Build a single self-contained HTML preview of the whole TRIAD T app.
Working sidebar navigation across every module + inline Edit mode."""
import base64, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
logo = "data:image/png;base64," + base64.b64encode(
    open(os.path.join(ROOT, "public/brand/tte-mark.png"), "rb").read()).decode()

ICON = {
"home":'<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
"dash":'<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',
"clap":'<path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/>',
"spark":'<path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"/>',
"bulb":'<path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/>',
"img":'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21"/>',
"palette":'<circle cx="13.5" cy="6.5" r=".8"/><circle cx="17.5" cy="10.5" r=".8"/><circle cx="8.5" cy="7.5" r=".8"/><circle cx="6.5" cy="12.5" r=".8"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.83-.44-1.12-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h1.99A5.55 5.55 0 0 0 22 11.55C22 6.01 17.5 2 12 2Z"/>',
"pentool":'<path d="m12 19 7-7 3 3-7 7-3-3z"/><path d="m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="m2 2 7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
"penline":'<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
"caps":'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 15h4M15 15h2M7 11h2M13 11h4"/>',
"align":'<line x1="21" x2="3" y1="6" y2="6"/><line x1="15" x2="3" y1="12" y2="12"/><line x1="17" x2="3" y1="18" y2="18"/>',
"click":'<path d="m9 9 5 12 1.8-5.2L21 14Z"/><path d="M7.2 2.2 8 5.1"/><path d="m5.1 7.2-2.9-.8"/><path d="M14 4.1 12 6"/><path d="m6 12-1.9 2"/>',
"kanban":'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 7v7M12 7v4M16 7v9"/>',
"news":'<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z"/>',
"cal":'<rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/><path d="M8 14h.01M12 14h.01M16 14h.01"/>',
"shield":'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="m9 12 2 2 4-4"/>',
"book":'<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>',
"gavel":'<path d="m14.5 12.5-8 8a2.12 2.12 0 1 1-3-3l8-8"/><path d="m16 16 6-6"/><path d="m8 8 6-6"/><path d="m9 7 8 8"/><path d="m21 11-8-8"/>',
"scale":'<path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>',
"landmark":'<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
"users":'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
"usercircle":'<circle cx="12" cy="12" r="10"/><path d="M18 20a6 6 0 0 0-12 0"/><circle cx="12" cy="10" r="4"/>',
"checks":'<path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8M13 12h8M13 18h8"/>',
"filewarn":'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M12 11v3M12 17h.01"/>',
"gauge":'<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
"building":'<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4M10 10h4M10 14h4"/>',
"wallet":'<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
"headph":'<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
"shieldalert":'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1Z"/><path d="M12 8v4M12 16h.01"/>',
"msg":'<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
"mail":'<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
"phone":'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
"bar":'<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
"line":'<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>',
"userplus":'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
"dollar":'<line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
"zap":'<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
"calclock":'<path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5"/><path d="M16 2v4M8 2v4M3 10h5"/><circle cx="17.5" cy="17.5" r="3.5"/><path d="M17.5 16v1.5l1 1"/>',
"flow":'<rect width="8" height="8" x="3" y="3" rx="2"/><path d="M7 11v4a2 2 0 0 0 2 2h4"/><rect width="8" height="8" x="13" y="13" rx="2"/>',
"scroll":'<path d="M15 12h-5M15 8h-5M19 17V5a2 2 0 0 0-2-2H4"/><path d="M8 21h12a2 2 0 0 0 2-2v-1a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1v1a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v2a1 1 0 0 0 1 1h3"/>',
"settings":'<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
"cog":'<circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
"plug":'<path d="M12 22v-5M9 8V2M15 8V2M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z"/>',
"search":'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/>',
}

# (label, key, slug)
SECTIONS = [
 ("Home","home",[("Command Center","dash","dashboard")]),
 ("Content System","clap",[("AI Content Engine","spark","content-engine"),("Idea Generation","bulb","idea-generation"),("Thumbnail Studio","img","thumbnail-studio"),("Motion Graphics Studio","clap","motion-graphics"),("Creative Center","palette","creative")]),
 ("Writing System","pentool",[("Script Writer","penline","script-writer"),("Caption Builder","caps","caption-builder"),("Description Builder","align","description-builder"),("CTA Generator","click","cta-generator")]),
 ("Content Operations","kanban",[("Content Pipeline","kanban","content-pipeline"),("News & Trend Center","news","trends"),("Content Calendar","cal","content-calendar")]),
 ("Credit System","shield",[("Credit Knowledge Center","book","knowledge"),("Dispute Strategy Builder","gavel","disputes"),("Bureau Intelligence","scale","bureaus"),("CFPB Center","landmark","cfpb")]),
 ("Client System","users",[("Client Command Center","users","clients"),("Client Profiles","usercircle","client-profiles"),("Round Tracking","checks","round-tracking"),("Negative Account Tracking","filewarn","negative-tracking")]),
 ("Funding System","landmark",[("Funding Engine","landmark","funding"),("Approval Readiness","gauge","approval-readiness"),("Business Funding","building","business-funding"),("Personal Funding","wallet","personal-funding")]),
 ("Sales System","headph",[("Sales Center","headph","sales"),("Objection Handling","shieldalert","objection-handling"),("SMS Templates","msg","sms-templates"),("Email Templates","mail","email-templates"),("Consultation Scripts","phone","consultation-scripts")]),
 ("Analytics","bar",[("Analytics Center","bar","analytics"),("Content Analytics","line","content-analytics"),("Lead Analytics","userplus","lead-analytics"),("Revenue Analytics","dollar","revenue-analytics")]),
 ("Automations","zap",[("Automations","zap","automations"),("Scheduled Tasks","calclock","scheduled-tasks"),("Workflow Builder","flow","workflow-builder")]),
 ("System","cog",[("Logs","scroll","logs"),("Settings","settings","settings"),("Profile","usercircle","profile"),("Integrations","plug","integrations")]),
]
DEFAULT_OPEN = {"Home","Content System","Credit System","Client System"}

def svg(key, cls="ic"):
    return f'<svg class="{cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{ICON.get(key,ICON["dash"])}</svg>'

# ---- helpers for panel content ----
def head(key,title,desc):
    return f'''<div class="phead"><div class="hi">{svg(key,"hic")}</div><div><h1 class="editable">{title}</h1><p class="editable">{desc}</p></div></div>'''

def metric(lab,val,delta,hint,up=True):
    d=f'<span class="delta {"up" if up else "down"}">{"&uarr;" if up else "&darr;"} {delta}</span>'
    return f'<div class="metric"><div class="lab editable">{lab}</div><div class="mrow"><span class="val editable">{val}</span>{d}</div><div class="hint editable">{hint}</div></div>'

def card(title,desc,body):
    return f'<div class="card"><div class="ch"><h3 class="editable">{title}</h3><p class="editable">{desc}</p></div><div class="cb">{body}</div></div>'

def area(gid,c1,d1,c2=None,d2=None):
    extra=f'<path d="{d2}Z" fill="url(#{gid}b)"/><path d="{d2}" fill="none" stroke="{c2}" stroke-width="2.5"/>' if d2 else ""
    g2=f'<linearGradient id="{gid}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="{c2}" stop-opacity=".35"/><stop offset="100%" stop-color="{c2}" stop-opacity="0"/></linearGradient>' if d2 else ""
    return f'''<svg viewBox="0 0 520 200" width="100%" height="200" preserveAspectRatio="none"><defs><linearGradient id="{gid}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="{c1}" stop-opacity=".5"/><stop offset="100%" stop-color="{c1}" stop-opacity="0"/></linearGradient>{g2}</defs>{extra}<path d="{d1}Z" fill="url(#{gid}a)"/><path d="{d1}" fill="none" stroke="{c1}" stroke-width="2.5"/></svg><div class="xax"><span>Dec</span><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span></div>'''

LINE1="M0,150 L104,135 L208,120 L312,95 L416,70 L520,45 L520,200 L0,200"
LINE1b="M0,178 L104,170 L208,166 L312,150 L416,138 L520,120"
LINE2="M0,160 L104,140 L208,150 L312,110 L416,90 L520,60 L520,200 L0,200"

def grid(*cards, cls="g2"):
    return f'<div class="grid {cls}">{"".join(cards)}</div>'

# ---- rich panels ----
PANELS={}

PANELS["dashboard"]=head("dash","Command Center","Your daily operating picture — content, leads, clients, and revenue at a glance.")+\
 '<div class="sec">Content Metrics</div>'+grid(
   metric("Posts Published","18","12.5%","this week"),metric("Total Reach","412K","28.4%","30-day"),
   metric("Engagement","6.8%","1.9%","avg / post"),metric("Saves + Shares","9.2K","34.1%","high-intent"),cls="g4")+\
 '<div class="sec">Revenue Metrics</div>'+grid(
   metric("MRR","$28,940","14.2%","recurring"),metric("Funding Commissions","$41,200","31.8%","this month"),
   metric("Total Revenue","$92,640","19.5%","this month"),metric("LTV : CAC","5.4x","8.0%","blended"),cls="g4")+\
 grid(card("Revenue Trend","Recurring vs. funding (6 months)",area("dash","#D4AF37",LINE1b,"#E6C65A",LINE2)),
      card("Today's Priorities","Open tasks across the team",
        '<div class="task"><div><b class="editable">Send Round 2 letters for Jasmine</b><small class="editable">due Jun 2</small></div><span class="tag th">high</span></div>'
        '<div class="task"><div><b class="editable">File CFPB complaint for Devon</b><small class="editable">due Jun 1</small></div><span class="tag tu">urgent</span></div>'
        '<div class="task"><div><b class="editable">Record 3 TOF reels</b><small class="editable">due Jun 4</small></div><span class="tag tm">medium</span></div>'))

def genform(label, fields, out_title, out_body):
    fs="".join(f'<label class="fld"><span class="editable">{f}</span><div class="inp editable">{v}</div></label>' for f,v in fields)
    return f'<div class="card"><div class="cb"><div class="formgrid">{fs}</div><button class="btn">{label}</button></div></div>'+card(out_title,"Editable output — tweak it inline",out_body)

PANELS["content-engine"]=head("spark","AI Content Engine","Generate TOF / MOF / BOF ideas, reels, carousels, captions & CTAs.")+\
 genform("✦ Generate Content",[("Funnel stage","TOF — Awareness"),("Format","Reel"),("Topic","Credit myths costing you money"),("Tone","Bold & educational")],
   "Generated Idea",
   '<div class="out editable"><b>Hook:</b> "The credit score lie banks pray you never figure out."<br/><br/><b>Angle:</b> Expose the 3 myths keeping scores low, then flip to the fix.<br/><br/><b>Caption:</b> Your score isn\'t broken — the system taught you wrong. Save this. 💳<br/><br/><b>CTA:</b> Comment "FIX" for the free credit roadmap.</div>')

PANELS["script-writer"]=head("penline","Script Writer","Reel, carousel and sales scripts plus captions.")+\
 genform("✦ Write Script",[("Type","Reel script (30s)"),("Topic","How to remove a collection"),("Audience","First-time clients"),("CTA","Book a free consult")],
   "Reel Script",
   '<div class="out editable"><b>[0-3s]</b> Stop paying collections before you read this.<br/><b>[3-10s]</b> Paying a collection can RESET the clock and tank your score.<br/><b>[10-20s]</b> Instead: request debt validation in writing first.<br/><b>[20-30s]</b> Want the exact letter? Book your free consult — link in bio.</div>')

PANELS["disputes"]=head("gavel","Dispute Strategy Builder","Bureau strategies, letters, call scripts & CFPB escalations.")+\
 genform("✦ Build Strategy",[("Bureau","Experian"),("Item type","Collection — Medical"),("Round","Round 2"),("Strategy","Metro 2 / FCRA 611")],
   "Dispute Letter",
   '<div class="out editable">Re: Formal Dispute — Account #XXXX<br/><br/>Per FCRA §611, I dispute the accuracy of the above account. The data furnisher must verify Metro 2 compliance, including DOFD and payment history. Absent complete verification, delete this item within 30 days.<br/><br/>Sincerely,<br/>[Client Name]</div>')

PANELS["funding"]=head("landmark","Funding Engine","Readiness analyzer, personal & business credit, approval scoring.")+\
 grid(
  card("Approval Readiness","Live score from the analyzer",
   '<div class="ring"><svg width="150" height="150" viewBox="0 0 42 42"><circle cx="21" cy="21" r="15.9" fill="none" stroke="#23201a" stroke-width="5"/><circle cx="21" cy="21" r="15.9" fill="none" stroke="#D4AF37" stroke-width="5" stroke-dasharray="78 22" stroke-dashoffset="25" stroke-linecap="round"/></svg><div class="ringc"><b class="editable">78</b><small class="editable">Ready</small></div></div>'),
  card("Readiness Factors","What lenders see",
   '<div class="bars">'+''.join(f'<div class="brow"><span class="editable">{n}</span><div class="track"><i style="width:{w}%"></i></div></div>' for n,w in [("Utilization",82),("Payment History",94),("Credit Age",61),("Inquiries",70),("Business Credit",45)])+'</div>'),cls="g3")

def table(cols,rows):
    th="".join(f'<th class="editable">{c}</th>' for c in cols)
    tr="".join("<tr>"+"".join(f'<td class="editable">{c}</td>' for c in r)+"</tr>" for r in rows)
    return f'<div class="card"><div class="cb"><table class="tbl"><thead><tr>{th}</tr></thead><tbody>{tr}</tbody></table></div></div>'

PANELS["clients"]=head("users","Client Command Center","Profiles, rounds, bureaus, negatives, scores & escalations.")+\
 grid(metric("Active Clients","87","9.0%","in program"),metric("Avg Score Gain","+72","6.4%","since enroll"),
      metric("Items Removed","1,243","14.7%","all bureaus"),metric("Retention","92%","2.1%","6-month"),cls="g4")+\
 table(["Client","Stage","Score","Round","Status"],
   [["Marcus Greene","Active","742","R3","On track"],["Jasmine Carter","Active","631","R2","Letters out"],
    ["Devon Brooks","Escalation","668","R4","CFPB filed"],["Sofia Ramirez","Onboarding","—","R1","Consult done"]])

PANELS["hooks"]=head("spark","Viral Hook Library","Save, categorize, search & tag hooks by psychology type.")+\
 grid(*[card(t,f'<span class="chip">{p}</span>','<div class="hooktext editable">'+h+'</div>') for t,p,h in [
   ("Curiosity Gap","Curiosity","The credit score lie banks pray you never figure out."),
   ("Loss Aversion","Fear","Every month you wait is costing you $400 in interest."),
   ("Authority","Trust","I removed 1,243 negative items last year. Here's how."),
   ("Social Proof","Belonging","87 clients crossed 700 this quarter. You're next."),
   ("Pattern Interrupt","Surprise","Stop paying your collections. Seriously. Read this."),
   ("Future Pacing","Desire","Picture approval emails instead of denial letters."),]],cls="g3")

PANELS["knowledge"]=head("book","Credit Knowledge Center","FCRA, FDCPA, Metro 2 & CFPB knowledge base with AI assistant.")+\
 '<div class="card"><div class="cb"><div class="searchbar"><span>'+svg("search","ic")+'</span><div class="inp editable">Ask: How long can a collection report?</div><button class="btn sm">Ask AI</button></div></div></div>'+\
 grid(*[card(t,s,'<div class="editable" style="color:var(--dim);font-size:13px">'+b+'</div>') for t,s,b in [
   ("FCRA §605","Reporting limits","Most negative items report up to 7 years; Chapter 7 bankruptcy up to 10."),
   ("FDCPA","Collector conduct","Collectors must validate debt on written request within 5 days of contact."),
   ("Metro 2","Furnisher format","Data must be reported in Metro 2 — mismatches are grounds for deletion."),
   ("CFPB","Escalation path","File a complaint when a bureau fails to investigate within 30 days."),]],cls="g2")

PANELS["creative"]=head("palette","Creative Center","Thumbnail, ChatGPT, Firefly & Rich Cinema X prompt generators.")+\
 genform("✦ Generate Prompt",[("Engine","Rich Cinema X"),("Subject","Confident founder, gold suit"),("Mood","Luxury, cinematic"),("Aspect","9:16")],
   "Image Prompt",
   '<div class="out editable">Cinematic portrait of a confident Black entrepreneur in a tailored gold-accented suit, dramatic rim lighting, dark luxury office, shallow depth of field, 35mm, ultra-detailed, editorial finance magazine cover, 9:16.</div>')

PANELS["sales"]=head("headph","Sales Center","Objection handling, templates & consultation scripts.")+\
 grid(*[card(t,"Tap to copy in the real app",'<div class="out editable" style="font-size:13px">'+b+'</div>') for t,b in [
   ('Objection: "It\'s too expensive"','I hear you. What\'s actually expensive is staying stuck — denials, high rates, lost approvals. This pays for itself with one approval. Want the plan that fits your budget?'),
   ("SMS: Re-engage","Hey {{first}}, still want that 700+ score before Q4? I have 2 spots this week. Want one?"),
   ("Email: Consult follow-up","Subject: Your credit roadmap is ready\\n\\nGreat talking today — here's the plan to remove those 3 items and prep you for funding…"),
   ("Consultation Close","So based on everything — removing the collections and prepping you for funding — does it make sense to get started today?"),]],cls="g2")

def generic(title,key,desc):
    return head(key,title,desc)+grid(
      card(title+" is online","Wired into the Command Center",
        '<div class="chk"><span>✓</span> <span class="editable">Connected to navigation &amp; search</span></div>'
        '<div class="chk"><span>✓</span> <span class="editable">Inherits the black-and-gold design system</span></div>'
        '<div class="chk"><span>✓</span> <span class="editable">Ready for Supabase data + AI wiring</span></div>'),
      card("What's next","Bring this module to full power",
        '<div class="steps">'+''.join(f'<div class="step"><i>{i+1}</i><span class="editable">{s}</span></div>' for i,s in enumerate(["Define the data model","Connect Supabase tables","Wire AI generation"]))+'</div>'),cls="g3")

# build sidebar + panels
groups=[]; panels=[]; first=True
for label,sicon,items in SECTIONS:
    op="open" if label in DEFAULT_OPEN else ""
    exp=[];rail=[]
    for name,ic,slug in items:
        act="active" if (slug=="dashboard") else ""
        exp.append(f'<a class="item {act}" data-go="{slug}" title="{name}"><span class="bar"></span>{svg(ic)}<span class="lbl editable">{name}</span></a>')
        rail.append(f'<a class="item {act}" data-go="{slug}" title="{name}"><span class="bar"></span>{svg(ic)}</a>')
        body=PANELS.get(slug) or generic(name,ic,"This module is part of the TRIAD T Command Center.")
        panels.append(f'<section class="panel {"active" if slug=="dashboard" else ""}" id="p-{slug}">{body}</section>')
    groups.append(f'''<div class="group {op}"><button class="ghead" onclick="tg(this)"><span class="gname editable">{label}</span><svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button><div class="gwrap"><div class="ginner">{''.join(exp)}</div></div><div class="crail">{''.join(rail)}</div></div>''')

TEMPLATE=open(os.path.join(ROOT,"scripts/app_preview_template.html")).read()
out=TEMPLATE.replace("__LOGO__",logo).replace("__GROUPS__","\n".join(groups)).replace("__PANELS__","\n".join(panels))
open(os.path.join(ROOT,"app-preview.html"),"w").write(out)
print("app-preview.html", len(out),"bytes;", len(panels),"panels")
