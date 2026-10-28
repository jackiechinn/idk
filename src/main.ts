import './amplitude.ts'
import './style.css'

// EXAMPLE DATA ONLY. Replace with exports from Business Central / ServiceNow.
type Account = { name: string; sector: string; revenue: number; directCost: number; budgetMargin: number; calls: number }
type Bid = { contract: string; bidMargin: number; actualMargin: number }

const period = 'P07 FY26 (October 2026)'
const accounts: Account[] = [
  { name: 'Retail customer A', sector: 'EPoS support', revenue: 412_300, directCost: 271_900, budgetMargin: 0.33, calls: 3_120 },
  { name: 'Hospitality customer B', sector: 'IT break-fix', revenue: 286_750, directCost: 204_600, budgetMargin: 0.31, calls: 2_480 },
  { name: 'Stadium customer C', sector: 'Event-day cover', revenue: 158_400, directCost: 98_200, budgetMargin: 0.36, calls: 640 },
  { name: 'EV charging customer D', sector: 'Charge point maintenance', revenue: 121_900, directCost: 96_300, budgetMargin: 0.27, calls: 1_150 },
  { name: 'Retail customer E', sector: 'Installs & rollouts', revenue: 98_600, directCost: 61_150, budgetMargin: 0.35, calls: 410 },
]
const bids: Bid[] = [
  { contract: 'Retail customer A · renewal 2025', bidMargin: 0.34, actualMargin: 0.341 },
  { contract: 'EV charging customer D · new 2026', bidMargin: 0.29, actualMargin: 0.21 },
  { contract: 'Stadium customer C · extension', bidMargin: 0.35, actualMargin: 0.38 },
]
// Share of direct cost by cost line; bars are these shares of the cost per call-out.
const costShares = [
  { line: 'Engineer labour', share: 0.51 },
  { line: 'Travel & mileage', share: 0.17 },
  { line: 'Parts & materials', share: 0.15 },
  { line: 'Subcontractors', share: 0.1 },
  { line: 'Service desk', share: 0.07 },
]
const kpiExtras = { ftf: 0.874, ftfPrior: 0.861, sla: 0.948, slaTarget: 0.95 }

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 })
const gbp2 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 })
const minus = (s: string) => s.replace('-', '−')
const money = (n: number) => minus(gbp.format(n))
const pct = (n: number) => `${(n * 100).toFixed(1)}%`
const signed = (s: string, n: number) => (n > 0 ? '+' : n < 0 ? '−' : '') + s
const pts = (n: number) => signed(`${Math.abs(n * 100).toFixed(1)} pts`, n)
const badge = (text: string, good: boolean) =>
  `<span class="vb ${good ? 'fav' : 'adv'}">${good ? '▲' : '▼'} ${text}</span>`

const totRev = accounts.reduce((s, a) => s + a.revenue, 0)
const totCost = accounts.reduce((s, a) => s + a.directCost, 0)
const totCalls = accounts.reduce((s, a) => s + a.calls, 0)
const totMargin = (totRev - totCost) / totRev
const budgetMargin = accounts.reduce((s, a) => s + a.budgetMargin * a.revenue, 0) / totRev
const cpc = totCost / totCalls

const accountRows = accounts
  .map((a) => {
    const m = (a.revenue - a.directCost) / a.revenue
    const v = m - a.budgetMargin
    return `<tr><td>${a.name}<div class="muted">${a.sector}</div></td>
      <td class="n">${money(a.revenue)}</td><td class="n">${money(a.directCost)}</td>
      <td class="n">${money(a.revenue - a.directCost)}</td><td class="n">${pct(m)}</td>
      <td class="n ${v >= 0 ? 'fav' : 'adv'}">${pts(v)}</td>
      <td class="n">${gbp2.format(a.directCost / a.calls)}</td></tr>`
  })
  .join('')

const bidRows = bids
  .map((b) => {
    const v = b.actualMargin - b.bidMargin
    return `<tr><td>${b.contract}</td><td class="n">${pct(b.bidMargin)}</td>
      <td class="n">${pct(b.actualMargin)}</td><td class="n">${badge(pts(v), v >= 0)}</td></tr>`
  })
  .join('')

const costToServe = costShares.map((c) => ({ line: c.line, value: c.share * cpc }))
const maxCts = Math.max(...costToServe.map((c) => c.value))
const ctsTotal = costToServe.reduce((s, c) => s + c.value, 0)
const ctsRows = costToServe
  .map(
    (c) => `<div class="bar-row"><span>${c.line}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${(c.value / maxCts) * 100}%"></div></div>
      <span class="n" style="font-family:var(--mono)">${gbp2.format(c.value)}</span></div>`,
  )
  .join('')

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<header class="header">
  <div>
    <div class="label">Commercial performance</div>
    <h1>Customer profitability</h1>
    <p class="muted">${period} · prepared for the Commercial Director</p>
  </div>
  <div class="actions"><button class="btn" type="button">Change period</button><button class="btn primary" type="button">Export pack</button></div>
</header>

<p class="banner">Example data. Customer names and figures are illustrative, not real.</p>

<section class="kpis">
  <div class="kpi"><div class="label">Revenue</div><div class="kpi-value">${money(totRev)}</div>
    <div class="kpi-foot">${totCalls.toLocaleString('en-GB')} call-outs</div></div>
  <div class="kpi"><div class="label">Gross margin</div><div class="kpi-value">${pct(totMargin)}</div>
    <div class="kpi-foot">${badge(pts(totMargin - budgetMargin), totMargin >= budgetMargin)} vs budget ${pct(budgetMargin)}</div></div>
  <div class="kpi"><div class="label">Cost per call-out</div><div class="kpi-value">${gbp2.format(cpc)}</div>
    <div class="kpi-foot">direct cost ÷ call-outs</div></div>
  <div class="kpi"><div class="label">First-time fix</div><div class="kpi-value">${pct(kpiExtras.ftf)}</div>
    <div class="kpi-foot">${badge(pts(kpiExtras.ftf - kpiExtras.ftfPrior), kpiExtras.ftf >= kpiExtras.ftfPrior)} vs P06</div></div>
  <div class="kpi"><div class="label">SLA attainment</div><div class="kpi-value">${pct(kpiExtras.sla)}</div>
    <div class="kpi-foot">${badge(pts(kpiExtras.sla - kpiExtras.slaTarget), kpiExtras.sla >= kpiExtras.slaTarget)} vs ${pct(kpiExtras.slaTarget)} target</div></div>
</section>

<section class="section">
  <h2>Customer P&amp;L</h2>
  <div class="panel"><table>
    <tr><th class="label">Customer</th><th class="label n">Revenue</th><th class="label n">Direct cost</th><th class="label n">Margin £</th><th class="label n">Margin %</th><th class="label n">vs budget</th><th class="label n">Cost / call-out</th></tr>
    ${accountRows}
    <tr class="total"><td>Total</td><td class="n">${money(totRev)}</td><td class="n">${money(totCost)}</td><td class="n">${money(totRev - totCost)}</td><td class="n">${pct(totMargin)}</td>
      <td class="n ${totMargin >= budgetMargin ? 'fav' : 'adv'}">${pts(totMargin - budgetMargin)}</td><td class="n">${gbp2.format(cpc)}</td></tr>
  </table></div>
</section>

<div class="grid-2">
  <section class="section">
    <h2>Bid forecast vs actual</h2>
    <div class="panel"><table>
      <tr><th class="label">Contract</th><th class="label n">Bid margin</th><th class="label n">Actual</th><th class="label n">Variance</th></tr>
      ${bidRows}
    </table></div>
  </section>
  <section class="section">
    <h2>Cost to serve per call-out</h2>
    <div class="panel bars">${ctsRows}
      <p class="muted">Total ${gbp2.format(ctsTotal)} per call-out, all customers</p></div>
  </section>
</div>
`
