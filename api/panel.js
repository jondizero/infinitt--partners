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

function renderHTML(decks) {
  const sorted = [...decks].sort((a, b) => new Date(b.date) - new Date(a.date));
  const statusCounts = {};
  sorted.forEach(d => { const s = d.status || 'Pending'; statusCounts[s] = (statusCounts[s] || 0) + 1; });

  const statsHTML = `<div class="stat"><b>${sorted.length}</b> total decks</div>` +
    Object.entries(statusCounts).map(([s, c]) => `<div class="stat"><b>${c}</b> ${s.toLowerCase()}</div>`).join('');

  const rowsHTML = sorted.map(d => {
    const statusClass = (d.status || 'pending').toLowerCase();
    const dateFmt = new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `
    <tr>
      <td><div class="client-cell"><span class="swatch" style="background:${d.color || '#00ff94'};color:${d.color || '#00ff94'}"></span>${d.client}</div></td>
      <td><span class="date">${dateFmt}</span></td>
      <td><span class="status ${statusClass}">${d.status || 'Pending'}</span></td>
      <td><a class="open-link" href="/decks/${d.slug}/" target="_blank">Open →</a></td>
    </tr>`;
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
  .wrap{max-width:920px;margin:0 auto;padding:clamp(32px,6vw,80px) 24px}
  header{margin-bottom:44px}
  .kicker{font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin-bottom:14px;display:flex;align-items:center;gap:10px}
  .kicker::before{content:"";width:7px;height:7px;border-radius:50%;background:var(--accent);box-shadow:0 0 8px var(--accent)}
  h1{font-family:var(--display);font-weight:700;font-size:clamp(28px,4vw,40px);letter-spacing:-0.02em;margin-bottom:10px}
  header p{color:var(--ink-muted);font-size:15px}
  .stats{display:flex;gap:12px;margin:28px 0 8px;flex-wrap:wrap}
  .stat{font-family:var(--mono);font-size:13px;color:var(--ink-soft);border:1px solid var(--line);border-radius:100px;padding:8px 16px;background:var(--surface)}
  .stat b{color:var(--accent)}
  table{width:100%;border-collapse:collapse;margin-top:28px}
  thead th{text-align:left;font-family:var(--mono);font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--ink-muted);padding:0 14px 12px;font-weight:500}
  tbody tr{background:var(--surface);border-top:1px solid var(--line)}
  tbody tr:first-child{border-top:none}
  tbody tr:hover{background:var(--surface-2)}
  tbody td{padding:16px 14px;font-size:14.5px;vertical-align:middle}
  .client-cell{display:flex;align-items:center;gap:12px;font-family:var(--display);font-weight:600;font-size:15px}
  .swatch{width:12px;height:12px;border-radius:4px;flex-shrink:0;box-shadow:0 0 8px currentColor}
  .date{color:var(--ink-muted);font-family:var(--mono);font-size:13px}
  .status{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:11.5px;letter-spacing:.04em;padding:5px 12px;border-radius:100px;border:1px solid var(--line);color:var(--ink-soft)}
  .status.sent{color:var(--accent);border-color:var(--accent-soft);background:var(--accent-soft)}
  .status.replied{color:#5fb4ff;border-color:rgba(95,180,255,.15);background:rgba(95,180,255,.08)}
  .status.won{color:var(--accent);border-color:var(--accent-soft);background:var(--accent-soft)}
  .open-link{font-family:var(--mono);font-size:13px;color:var(--ink);text-decoration:none;display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line);padding:8px 14px;border-radius:100px}
  .open-link:hover{border-color:var(--accent);color:var(--accent)}
  footer{margin-top:40px;font-family:var(--mono);font-size:11.5px;color:var(--ink-muted);text-align:center}
  @media (max-width:640px){
    table, thead{display:none}
    tbody, tr, td{display:block;width:100%}
    tbody tr{border-radius:12px;padding:16px;margin-bottom:10px;border:1px solid var(--line)}
    tbody td{padding:6px 0;border:none!important}
    .open-link{margin-top:10px}
  }
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div class="kicker">INTERNAL · LOGGED IN</div>
    <h1>Audit Decks</h1>
    <p>Every funnel audit deck we've shipped, in one place.</p>
  </header>
  <div class="stats">${statsHTML}</div>
  <table>
    <thead><tr><th>Client</th><th>Date</th><th>Status</th><th></th></tr></thead>
    <tbody>${rowsHTML}</tbody>
  </table>
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
