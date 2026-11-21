export const esc = (value: string | number | null | undefined) =>
  String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const when = (iso: string) => esc(iso.slice(0, 16).replace('T', ' ')) + ' UTC';

export const style = `
:root { color-scheme: light; --bg: #fff8e7; --ink: #0d3b36; --muted: #47605b; --card: #fff; --line: #cfc9b6; --track: #efe9d3; --accent: #1f8a70; }
* { box-sizing: border-box; }
body { margin: 0; padding: 0 0 64px; background: var(--bg); color: var(--ink); font: 16px/1.5 system-ui, -apple-system, 'Segoe UI', sans-serif; }
.bar { display: flex; flex-wrap: wrap; gap: 4px 24px; align-items: center; justify-content: space-between; padding: 12px 24px; background: var(--ink); color: var(--bg); }
.bar h1 { margin: 0; font-size: 1.125rem; }
.bar .who { margin: 0; font-size: .875rem; }
main { max-width: 1100px; margin: 0 auto; padding: 24px 16px 0; }
nav { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 16px; }
nav a, button { min-height: 44px; padding: 0 16px; border: 1.5px solid var(--ink); border-radius: 999px; background: transparent; color: var(--ink); font: inherit; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; cursor: pointer; }
nav a[aria-current='page'] { background: var(--ink); color: var(--bg); }
.card { margin: 0 0 16px; padding: 16px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); scroll-margin-top: 16px; }
.card:target { animation: lead-mark 2s ease-out 1; }
@keyframes lead-mark { from { box-shadow: 0 0 0 3px var(--accent); } to { box-shadow: 0 0 0 3px transparent; } }
@media (prefers-reduced-motion: reduce) { .card:target { animation: none; box-shadow: 0 0 0 3px var(--accent); } }
.ref { margin: 0 0 8px; font-weight: 700; letter-spacing: .04em; }
.find { display: flex; flex-wrap: wrap; gap: 8px; align-items: end; margin: 0 0 16px; }
.find input { min-height: 44px; min-width: min(100%, 280px); padding: 8px 12px; border: 1.5px solid var(--ink); border-radius: 8px; background: var(--card); color: var(--ink); font: inherit; }
.hint { display: block; margin-top: 4px; font-size: .85rem; }
.notice { margin: 0 0 16px; }
.card h2 { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin: 0; font-size: 1.1rem; }
.tag { display: inline-flex; align-items: center; min-height: 24px; padding: 0 8px; border-radius: 999px; font-size: .75rem; font-weight: 700; letter-spacing: .02em; line-height: 1; }
.tag-beta { background: var(--ink); color: var(--bg); }
.tag-enquiry { border: 1.5px solid var(--ink); background: transparent; color: var(--ink); }
.tag-chat { border: 1.5px dashed var(--ink); background: transparent; color: var(--ink); }
.tag-topic { border: 1.5px solid var(--accent); background: transparent; color: var(--ink); }
.tag-hint { border: 1.5px dotted var(--ink); background: transparent; color: var(--ink); font-weight: 600; }
.meta { margin: 0 0 12px; color: var(--muted); font-size: .9rem; }
dl { display: grid; grid-template-columns: max-content 1fr; gap: 4px 16px; margin: 0 0 12px; }
dt { font-weight: 600; }
dd { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
form.edit { display: grid; gap: 12px; }
form.edit label { display: grid; gap: 4px; font-weight: 600; font-size: .9rem; }
form.edit textarea { width: 100%; }
label { display: grid; gap: 4px; font-weight: 600; font-size: .9rem; }
select, textarea { font: inherit; color: inherit; background-color: var(--bg); border: 1.5px solid var(--ink); border-radius: 8px; padding: 8px; }
select { appearance: none; padding-right: 44px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none'%3E%3Cpath d='M3.5 6 L8 10.5 L12.5 6' stroke='%230d3b36' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; background-size: 16px 16px; }
textarea { min-width: min(100%, 420px); min-height: 44px; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
@media (max-width: 600px) { dl { grid-template-columns: 1fr; } }
.danger { margin-top: 20px; }
.danger summary { display: inline-flex; align-items: center; min-height: 44px; padding: 0 12px; border: 1px solid var(--line); border-radius: 999px; background: transparent; color: var(--ink); font-weight: 500; cursor: pointer; }
.danger p { margin: 12px 0; max-width: 62ch; }
.danger-actions { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.danger button, .danger a { min-height: 44px; padding: 0 12px; border: 1px solid var(--line); border-radius: 999px; background: transparent; color: var(--ink); font-weight: 500; text-decoration: none; }
.danger a { display: inline-flex; align-items: center; }
`;

export const extraStyle = `
main { max-width: 1280px; }
.layout { display: flex; flex-wrap: wrap; gap: 24px; align-items: flex-start; }
.side { flex: 0 0 220px; display: flex; flex-direction: column; gap: 6px; }
.side nav { flex-direction: column; align-items: stretch; margin: 0; gap: 6px; }
.side h2 { margin: 12px 8px 0; font-size: .75rem; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
.side h2:first-child { margin-top: 0; }
.side a { justify-content: flex-start; }
.content { flex: 999 1 560px; min-width: 0; }
.title { margin: 0 0 4px; font-size: 1.625rem; }
.sub { margin: 0 0 16px; color: var(--muted); font-size: .9rem; }
.kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 0 0 16px; }
.kpi { padding: 12px 16px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); }
.kpi .label { font-size: .8rem; color: var(--muted); }
.kpi .value { font-size: 1.875rem; font-weight: 700; line-height: 1.2; }
.kpi .note { font-size: .8rem; color: var(--muted); }
.grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; margin: 0 0 16px; }
.panel { padding: 16px 20px; border: 1px solid var(--line); border-radius: 12px; background: var(--card); margin: 0 0 16px; }
.grid2 .panel { margin: 0; }
.panel h2 { margin: 0 0 4px; font-size: 1.1rem; }
.panel p.sub { margin-bottom: 12px; }
.row { display: grid; grid-template-columns: minmax(90px, 40%) 1fr 36px; gap: 10px; align-items: center; margin: 0 0 8px; font-size: .9rem; }
.row b { text-align: right; }
.track { background: var(--track); border-radius: 6px; height: 16px; overflow: hidden; }
.fill { height: 16px; border-radius: 6px; background: var(--accent); }
.fill.dark { background: var(--ink); }
.donut-wrap { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
.donut { position: relative; flex: 0 0 140px; width: 140px; height: 140px; border-radius: 50%; }
.donut::after { content: ''; position: absolute; top: 34px; left: 34px; width: 72px; height: 72px; border-radius: 50%; background: var(--card); }
.legend { flex: 1 1 160px; display: flex; flex-direction: column; gap: 6px; font-size: .9rem; }
.legend div { display: flex; align-items: center; gap: 8px; }
.legend span.sw { flex: 0 0 12px; width: 12px; height: 12px; border-radius: 3px; }
.legend span.name { flex: 1; }
table.data { width: 100%; border-collapse: collapse; }
table.data th { text-align: left; font-size: .75rem; letter-spacing: .04em; text-transform: uppercase; color: var(--muted); padding: 8px 10px; border-bottom: 1.5px solid var(--ink); }
table.data td { padding: 10px; border-bottom: 1px solid var(--line); font-size: .9rem; vertical-align: top; }
.scroll { overflow-x: auto; }
.split { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-start; }
.split > .list { flex: 2 1 560px; min-width: 0; margin: 0; }
.split > .detail { flex: 1 1 320px; min-width: 0; margin: 0; }
table.data td.nowrap { white-space: nowrap; }
table.data a { display: inline-flex; align-items: center; min-height: 44px; padding: 0 12px; border: 1.5px solid var(--ink); border-radius: 999px; color: var(--ink); font-weight: 600; text-decoration: none; }
.turn { margin: 0 0 10px; padding: 10px 12px; border-radius: 10px; background: #f3efe0; }
.turn.sparky { background: #e6f2ea; color: #0d3b36; }
.turn b { display: block; font-size: .75rem; letter-spacing: .04em; text-transform: uppercase; }
.turn p { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 16px; }
.chips a { min-height: 44px; padding: 0 16px; border: 1.5px solid var(--ink); border-radius: 999px; color: var(--ink); text-decoration: none; font-weight: 600; display: inline-flex; align-items: center; }
.chips a[aria-current='page'] { background: var(--ink); color: var(--bg); }
.tag-flag { background: #f6dccb; color: #6b2d0c; }
.tag-done { background: var(--ink); color: var(--bg); }
.tag-quiet { border: 1.5px solid var(--ink); background: transparent; color: var(--ink); }
tr.picked { background: #fff3cf; color: #0d3b36; }
`;
