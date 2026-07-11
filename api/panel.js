// api/panel.js
// Vercel Serverless Function — painel interno protegido por usuário/senha (HTTP Basic Auth).
//
// EDITE SÓ O ARRAY "DECKS" ABAIXO toda vez que um deck novo for gerado.
// O resto do arquivo não precisa mudar.
const DECKS = [
  { client: "GAR Capital", slug: "gar-capital", date: "2026-07-08", color: "#00ff94", status: "Sent" }
];

function checkAuth(req) {
  const header = req.headers['authorization'] || '';
  const [scheme, encoded] = header.split(' ');
  if (scheme !== 'Basic' || !encoded) return false;
  const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
  const sep = decoded.indexOf(':');
  const user = decoded.slice(0, sep);
  const pass = decoded.slice(sep + 1);
  return user === process.env.PANEL_USER && pass === process.env.PANEL_PASS;
}

function initials(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function renderHTML(decks) {
  const sorted = [...decks].sort((a, b) => new Date(b.date) - new Date(a.date));
  const statusCounts = {};
  sorted.forEach(d => { const s = d.status || 'Pending'; statusCounts[s] = (statusCounts[s] || 0) + 1; });

  const statsHTML = `<div class="stat"><b>${sorted.length}</b> total decks</div>` +
    Object.entries(statusCounts).map(([s, c]) => `<div class="stat"><b>${c}</b> ${s.toLowerCase()}</div>`).join('');

  const cardsHTML = sorted.map(d => {
    const color = d.color || '#00ff94';
    const statusClass = (d.status || 'pending').toLowerCase();
    const dateFmt = new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `
    <a class="card" href="/decks/${d.slug}/" target="_blank">
      <div class="cover" style="--c:${color}">
        <div class="cover-glow"></div>
        <div class="cover-kicker">FUNNEL AUDIT</div>
        <div class="cover-name">${d.client}</div>
        <div class="cover-mono">${initials(d.client)}</div>
      </div>
      <div class="card-body">
        <div class="card-top">
          <span class="client-name">${d.client}</span>
          <span class="status ${statusClass}">${d.status || 'Pending'}</span>
        </div>
        <div class="card-bottom">
          <span class="date">${dateFmt}</span>
          <span class="open-link">Open →</span>
        </div>
      </div>
    </a>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Audit Decks — Panel</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#050506;--surface:#0d0e10;--surface-2:#141519;
    --ink:#f2f4f3;--ink-soft:#b9c1c3;--ink-muted:#767f82;--line:rgba(255,255,255,0.09);
    --accent:#00ff94;--accent-soft:rgba(0,255,148,0.1);
    --display:'Space Grotesk',sans-serif;--mono:'JetBrains Mono',monospace;--sans:'Inter',sans-serif;
  }
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:var(--sans);background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;min-height:100vh}
  .wrap{max-width:1100px;margin:0 auto;padding:clamp(32px,6vw,80px) 24px}
  header{margin-bottom:36px}
  .kicker{font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:14px;display:flex;align-items:center;gap:10px}
  .kicker::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px var(--accent)}
  h1{font-family:var(--display);font-weight:700;font-size:clamp(28px,4vw,40px);letter-spacing:-0.02em;margin-bottom:10px}
  header p{color:var(--ink-muted);font-size:15px}
  .stats{display:flex;gap:12px;margin:24px 0 8px;flex-wrap:wrap}
  .stat{font-family:var(--mono);font-size:13px;color:var(--ink-soft);border:1px solid var(--line);border-radius:100px;padding:8px 16px;background:var(--surface)}
  .stat b{color:var(--accent)}

  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;margin-top:32px}
  .card{
    display:block;text-decoration:none;color:inherit;
    background:var(--surface);border:1px solid var(--line);border-radius:16px;overflow:hidden;
    transition:transform .18s cubic-bezier(.16,1,.3,1),border-color .18s;
  }
  .card:hover{transform:translateY(-4px);border-color:var(--c,var(--accent))}

  .cover{
    position:relative;aspect-ratio:16/10;background:#0a0a0b;overflow:hidden;
    display:flex;flex-direction:column;justify-content:space-between;padding:18px;
  }
  .cover-glow{
    position:absolute;inset:-40% -20% auto auto;width:70%;aspect-ratio:1;
    background:radial-gradient(circle, var(--c) 0%, transparent 70%);
    opacity:.35;filter:blur(10px);
  }
  .cover-kicker{position:relative;font-family:var(--mono);font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--c);z-index:1}
  .cover-name{position:relative;font-family:var(--display);font-weight:700;font-size:19px;line-height:1.15;color:#fff;z-index:1;max-width:80%}
  .cover-mono{position:relative;align-self:flex-end;font-family:var(--mono);font-size:11px;color:rgba(255,255,255,.35);z-index:1;border:1px solid rgba(255,255,255,.15);border-radius:100px;padding:4px 10px}

  .card-body{padding:16px}
  .card-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
  .client-name{font-family:var(--display);font-weight:600;font-size:14.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .status{flex-shrink:0;font-family:var(--mono);font-size:10px;letter-spacing:.04em;padding:4px 10px;border-radius:100px;border:1px solid var(--line);color:var(--ink-soft)}
  .status.sent{color:var(--accent);border-color:var(--accent-soft);background:var(--accent-soft)}
  .status.replied{color:#5fb4ff;border-color:rgba(95,180,255,.15);background:rgba(95,180,255,.08)}
  .status.won{color:var(--accent);border-color:var(--accent-soft);background:var(--accent-soft)}

  .card-bottom{display:flex;align-items:center;justify-content:space-between;font-family:var(--mono);font-size:11.5px;color:var(--ink-muted)}
  .open-link{color:var(--ink-soft);transition:color .15s}
  .card:hover .open-link{color:var(--accent)}

  footer{margin-top:40px;font-family:var(--mono);font-size:11.5px;color:var(--ink-muted);text-align:center}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="kicker">INTERNAL · LOGGED IN</div>
    <h1>Audit Decks</h1>
    <p>Every funnel audit deck we've shipped, in one place.</p>
    <div class="stats">${statsHTML}</div>
  </header>
  <div class="grid">${cardsHTML}</div>
  <footer>Edit the DECKS array in api/panel.js to add a new entry.</footer>
</div>
</body>
</html>`;
}

export default function handler(req, res) {
  if (!checkAuth(req)) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Audit Decks Panel"');
    res.status(401).send('Authentication required.');
    return;
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(renderHTML(DECKS));
}
