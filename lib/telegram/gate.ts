/**
 * Served (with HTTP 404) to any page request without a valid session.
 * Inside Telegram it exchanges initData for a session cookie and reloads;
 * everywhere else it is indistinguishable from a plain "not found" page.
 * No application code or data is delivered before authorization.
 */
const GATE_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow,noarchive">
<title>404</title>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
  html,body{margin:0;height:100%;background:#0b0b0f;color:#8b8b95;font:14px/1.4 system-ui,-apple-system,sans-serif}
  main{height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:24px;box-sizing:border-box}
  .spin{width:28px;height:28px;border-radius:50%;border:3px solid #26262e;border-top-color:#e50914;animation:s .8s linear infinite;margin:0 auto}
  @keyframes s{to{transform:rotate(360deg)}}
</style>
</head>
<body>
<main id="m"><div>404 · Not Found</div></main>
<script>
(function(){
  var tg = window.Telegram && window.Telegram.WebApp;
  var m = document.getElementById("m");
  if (!tg || !tg.initData) return;
  try { tg.ready(); tg.expand(); tg.setHeaderColor("#0b0b0f"); tg.setBackgroundColor("#0b0b0f"); } catch (e) {}
  var KEY = "tgc_gate_attempt";
  var last = Number(sessionStorage.getItem(KEY) || 0);
  if (Date.now() - last < 15000) {
    m.innerHTML = "<div>Unable to start a session.<br>Please enable cookies for this app and reopen it.</div>";
    return;
  }
  m.innerHTML = '<div class="spin"></div>';
  fetch("/api/auth", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ initData: tg.initData })
  }).then(function (r) {
    if (!r.ok) { m.innerHTML = "<div>404 · Not Found</div>"; return; }
    sessionStorage.setItem(KEY, String(Date.now()));
    location.replace(location.href);
  }).catch(function () { m.innerHTML = "<div>Network error. Reopen the app.</div>"; });
})();
</script>
</body>
</html>`;

export function gateResponse(): Response {
  return new Response(GATE_HTML, {
    status: 404,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store, private",
      "x-robots-tag": "noindex, nofollow, noarchive",
    },
  });
}
