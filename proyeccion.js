// Proyección financiera y mapa de distancias de Casa Alameda. Todos los supuestos salen de config.js (window.ALAMEDA.modelo).
const C = window.ALAMEDA || {}, M = C.modelo || {};
const $ = s => document.querySelector(s);
const cop = n => '$' + Math.round(n).toLocaleString('es-CO'), mill = n => '$' + (n / 1e6).toLocaleString('es-CO', { maximumFractionDigits: n >= 1e9 ? 0 : 1 }) + ' M', pct = (n, d = 1) => (n * 100).toLocaleString('es-CO', { maximumFractionDigits: d }) + ' %';

// ---------- Proyección (renta mensual de consultorios + local)
// ---------- Presupuesto de obra (Google Sheets -> página)
const num = v => { let s = String(v ?? '').replace(/[$\s%]/g, ''); if (!s) return 0; if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.'); else if (/^-?\d+,\d+$/.test(s)) s = s.replace(',', '.'); else s = s.replace(/,/g, ''); return parseFloat(s) || 0; };
const csv = t => { const out = []; let row = [], f = '', q = false; for (let i = 0; i < t.length; i++) { const ch = t[i]; if (q) { if (ch === '"' && t[i + 1] === '"') { f += '"'; i++; } else if (ch === '"') q = false; else f += ch; } else if (ch === '"') q = true; else if (ch === ',') { row.push(f); f = ''; } else if (ch === '\n' || ch === '\r') { if (ch === '\r' && t[i + 1] === '\n') i++; row.push(f); out.push(row); row = []; f = ''; } else f += ch; } if (f || row.length) { row.push(f); out.push(row); } return out; };
const P = C.presupuesto || {}; let PRES = null;
async function cargarPresupuesto() {
  let filas = null, fuente = 'hoja';
  if (P.hoja) try {
    const r = await fetch(`https://docs.google.com/spreadsheets/d/${P.hoja}/gviz/tq?tqx=out:csv&gid=${P.gid || 0}&t=${Date.now()}`);
    if (r.ok) { const t = await r.text(); if (!/^\s*</.test(t)) { const [h, ...rs] = csv(t), ix = k => h.findIndex(x => x.trim().toLowerCase().startsWith(k)); const iC = ix('cap'), iI = ix('ít') >= 0 ? ix('ít') : ix('it'), iU = ix('uni'), iQ = ix('cant'), iV = ix('valor');
      filas = rs.filter(r => (r[iC] || '').trim()).map(r => ({ capitulo: r[iC].trim(), item: (r[iI] || '').trim(), unidad: (r[iU] || '').trim(), cantidad: num(r[iQ]), unitario: num(r[iV]) })); } }
  } catch (e) { console.warn('Hoja de presupuesto no disponible', e); }
  if (!filas || !filas.length) { fuente = 'respaldo'; try { filas = await (await fetch(P.respaldo || 'presupuesto.json')).json(); } catch { filas = []; } }
  const directo = filas.filter(f => f.unidad !== '%').reduce((s, f) => s + f.cantidad * f.unitario, 0);
  filas.forEach(f => f.subtotal = f.unidad === '%' ? directo * f.cantidad / 100 : f.cantidad * f.unitario);
  const total = filas.reduce((s, f) => s + f.subtotal, 0), caps = [];
  filas.forEach(f => { let c = caps.find(x => x.nombre === f.capitulo); if (!c) caps.push(c = { nombre: f.capitulo, items: [], total: 0 }); c.items.push(f); c.total += f.subtotal; });
  PRES = { filas, caps, total, fuente };
  if (total > 0) M.remodelacion = total;
  pintarPresupuesto();
}
function pintarPresupuesto() {
  const el = $('#pres-tabla'); if (!el || !PRES) return; const { caps, total, fuente } = PRES, mx = Math.max(...caps.map(c => c.total));
  el.innerHTML = caps.map((c, k) => `<tbody class="cap"><tr class="cap-row" data-k="${k}"><td><button aria-expanded="false">▸</button> <b>${c.nombre}</b></td><td class="num">${pct(c.total / total)}</td><td class="num barcell"><i style="width:${c.total / mx * 100}%"></i><span>${cop(c.total)}</span></td></tr>
    ${c.items.map(f => `<tr class="it hide" data-k="${k}"><td>${f.item}<small>${f.unidad === '%' ? f.cantidad + ' % del costo directo' : `${f.cantidad.toLocaleString('es-CO')} ${f.unidad} × ${cop(f.unitario)}`}</small></td><td></td><td class="num">${cop(f.subtotal)}</td></tr>`).join('')}</tbody>`).join('')
    + `<tbody><tr class="sub"><td><b>Total presupuesto de obra</b></td><td class="num"><b>100 %</b></td><td class="num"><b>${cop(total)}</b></td></tr></tbody>`;
  el.querySelectorAll('.cap-row').forEach(r => r.onclick = () => { const on = r.querySelector('button').getAttribute('aria-expanded') !== 'true'; r.querySelector('button').setAttribute('aria-expanded', on); r.querySelector('button').textContent = on ? '▾' : '▸'; el.querySelectorAll(`.it[data-k="${r.dataset.k}"]`).forEach(x => x.classList.toggle('hide', !on)); });
  if ($('#pres-total')) $('#pres-total').textContent = cop(total);
  if ($('#pres-fuente')) $('#pres-fuente').textContent = fuente === 'hoja' ? 'Datos leídos en vivo de la hoja de cálculo del proyecto.' : 'Mostrando la última versión guardada del presupuesto (la hoja de cálculo no respondió).';
}

const proyectar = () => { if (!$('#proyeccion') || !M.rentaConsultorio) return;
  M.costoTotal = M.compra + M.remodelacion; M.cuota1 = (M.pagoInicial + M.remodelacion) / M.participaciones;
  const bruto = e => (M.unidades * e.rentaConsultorio + e.rentaLocal) * 12, bruto1 = bruto(M), años = [...Array(10)].map((_, i) => {
    const b = bruto1 * (1 + M.crecimiento) ** i, noi = b * (1 - M.gastos); return { n: i + 1, bruto: b, gastos: b - noi, noi, valor: noi / M.capRate };
  });
  const a1 = años[0], a10 = años[9], acum = años.reduce((s, a) => s + a.noi, 0), costo = M.costoTotal, part = M.participaciones, aporte = costo / part;
  const tir = (() => { const f = r => -costo + años.reduce((s, a) => s + (a.noi + (a.n === 10 ? a.valor : 0)) / (1 + r) ** a.n, 0); let lo = 0, hi = 1; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; f(m) > 0 ? lo = m : hi = m; } return (lo + hi) / 2; })();
  $('#p-supuestos').innerHTML = [['Renta por consultorio', cop(M.rentaConsultorio) + '/mes', M.rentaFuente], ['Consultorios', M.unidades, 'de 10 a 15 m², con lavamanos'], ['Local en el antiguo garaje', cop(M.rentaLocal) + '/mes', M.localFuente],
    ['Vacancia y gastos', pct(M.gastos, 0), 'meses vacíos, servicios, aseo, recepción, predial y mantenimiento'], ['Aumento anual del arriendo', pct(M.crecimiento, 0), 'aplicado desde el año 2'], ['Tasa de capitalización', pct(M.capRate, 0), 'valor = ingreso neto anual ÷ tasa']]
    .map(([a, b, c]) => `<div><small>${a}</small><b>${b}</b><span>${c}</span></div>`).join('');
  $('#p-kpis').innerHTML = [['Renta bruta mensual · año 1', cop(a1.bruto / 12)], ['Ingreso neto mensual · año 1', cop(a1.noi / 12)], ['Neto mensual por participación', cop(a1.noi / 12 / part)],
    ['Rentabilidad neta sobre el costo · año 1', pct(a1.noi / costo)], ['Valor estimado de venta · año 10', mill(a10.valor)], ['TIR estimada a 10 años', pct(tir)]]
    .map(([a, b]) => `<div><small>${a}</small><b>${b}</b></div>`).join('');
  const mx = a10.valor;
  $('#p-tabla').innerHTML = años.map(a => `<tr><td>Año ${a.n}</td><td class="num">${cop(a.bruto)}</td><td class="num">${cop(a.gastos)}</td><td class="num"><b>${cop(a.noi)}</b></td><td class="num">${cop(a.noi / 12)}</td><td class="num">${cop(a.noi / part)}</td><td class="num">${pct(a.noi / costo)}</td>
    <td class="num barcell" title="Año ${a.n}: valor estimado ${cop(a.valor)}"><i style="width:${a.valor / mx * 100}%"></i><span>${mill(a.valor)}</span></td></tr>`).join('')
    + `<tr class="sub"><td><b>10 años</b></td><td class="num"><b>${cop(años.reduce((s, a) => s + a.bruto, 0))}</b></td><td class="num"><b>${cop(años.reduce((s, a) => s + a.gastos, 0))}</b></td><td class="num"><b>${cop(acum)}</b></td><td></td><td class="num"><b>${cop(acum / part)}</b></td><td></td><td></td></tr>`;
  $('#p-resumen').innerHTML = `Con estos supuestos, cada participación de <b>${cop(aporte)}</b> recibiría cerca de <b>${cop(a1.noi / 12 / part)} al mes</b> el primer año y <b>${cop(acum / part)}</b> acumulados en 10 años. Si la casa se vendiera al final del año 10 por <b>${cop(a10.valor)}</b> (ingreso neto de ese año ÷ ${pct(M.capRate, 0)}), a cada participación le corresponderían <b>${cop(a10.valor / part)}</b> adicionales: en total, <b>${((acum + a10.valor) / costo).toLocaleString('es-CO', { maximumFractionDigits: 1 })} veces</b> lo invertido.`;
  const esc = (M.escenarios || []).map(e => { const b = bruto(e), n = b * (1 - M.gastos), n10 = n * (1 + M.crecimiento) ** 9; return `<tr class="${e.base ? 'base' : ''}"><td>${e.nombre}</td><td class="num">${cop(e.rentaConsultorio)}</td><td class="num">${cop(e.rentaLocal)}</td><td class="num">${cop(b / 12)}</td><td class="num">${cop(n / 12)}</td><td class="num">${cop(n / 12 / part)}</td><td class="num">${pct(n / costo)}</td><td class="num">${mill(n10 / M.capRate)}</td></tr>`; });
  if ($('#p-escenarios')) $('#p-escenarios').innerHTML = esc.join('');
  const V = { aporte: cop(aporte), aporteM: mill(aporte), cuota1: cop(M.cuota1), cuota2: cop(aporte - M.cuota1), rent: pct(a1.noi / costo), costo: cop(costo), compra: cop(M.compra), pagoInicial: cop(M.pagoInicial), remod: cop(M.remodelacion), saldo: cop(M.compra - M.pagoInicial),
    primera: cop(M.pagoInicial + M.remodelacion), unidades: M.unidades, part: M.participaciones };
  document.querySelectorAll('[data-m]').forEach(el => { if (el.dataset.m in V) el.textContent = V[el.dataset.m]; });
};
cargarPresupuesto().then(proyectar, proyectar);

// ---------- Mapa de distancias (Leaflet + OpenStreetMap)
const mapEl = $('#mapa');
if (mapEl && C.mapa && window.L) {
  const hav = (a, b) => { const R = 6371000, r = Math.PI / 180, dLa = (b[0] - a[0]) * r, dLo = (b[1] - a[1]) * r, x = Math.sin(dLa / 2) ** 2 + Math.cos(a[0] * r) * Math.cos(b[0] * r) * Math.sin(dLo / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };
  const casa = C.mapa.casa, map = L.map(mapEl, { scrollWheelZoom: false }), fmt = d => d < 1000 ? Math.round(d / 10) * 10 + ' m' : (d / 1000).toLocaleString('es-CO', { maximumFractionDigits: 1 }) + ' km';
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
  const pin = (c, t) => L.divIcon({ className: '', html: `<div class="pin" style="background:${c}">${t}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] });
  L.marker(casa, { icon: pin('#b5562f', '★'), zIndexOffset: 1000 }).addTo(map).bindTooltip(C.nombre || 'La casa', { permanent: true, direction: 'top', offset: [0, -14], className: 'tip casa' });
  const pts = [casa], rows = C.mapa.lugares.map((p, i) => {
    const d = hav(casa, p.pos), andando = d * 1.3 / 80, carro = Math.max(3, d * 1.4 / 1000 / 22 * 60); pts.push(p.pos);
    L.polyline([casa, p.pos], { color: '#2a4a2b', weight: 2, dashArray: '6 6', opacity: .7 }).addTo(map);
    L.marker(p.pos, { icon: pin('#2a4a2b', i + 1) }).addTo(map).bindTooltip(`${p.nombre} · ${fmt(d)}`, { direction: 'top', offset: [0, -14], className: 'tip' });
    return `<li><span class="pin" style="background:#2a4a2b">${i + 1}</span><div><b>${p.nombre}</b><small>${p.nota}</small></div><em>${fmt(d)}<small>${d < 1500 ? '≈ ' + Math.round(andando) + ' min a pie' : '≈ ' + Math.round(carro) + ' min en carro'}</small></em></li>`;
  });
  map.fitBounds(pts, { padding: [40, 40] }); $('#mapa-lista').innerHTML = rows.join('');
}
