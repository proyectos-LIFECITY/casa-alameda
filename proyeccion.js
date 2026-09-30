// Proyección financiera y mapa de distancias de Casa Alameda. Todos los supuestos salen de config.js (window.ALAMEDA.modelo).
const C = window.ALAMEDA || {}, M = C.modelo || {};
const $ = s => document.querySelector(s);
const cop = n => '$' + Math.round(n).toLocaleString('es-CO'), mill = n => '$' + (n / 1e6).toLocaleString('es-CO', { maximumFractionDigits: n >= 1e9 ? 0 : 1 }) + ' M', pct = (n, d = 1) => (n * 100).toLocaleString('es-CO', { maximumFractionDigits: d }) + ' %';

// ---------- Proyección
if ($('#proyeccion') && M.tarifaNoche) {
  const noches = 365 * M.ocupacion, bruto1 = M.unidades * M.tarifaNoche * noches, años = [...Array(10)].map((_, i) => {
    const bruto = bruto1 * (1 + M.crecimiento) ** i, noi = bruto * (1 - M.gastos); return { n: i + 1, bruto, gastos: bruto - noi, noi, valor: noi / M.capRate };
  });
  const a1 = años[0], a10 = años[9], acum = años.reduce((s, a) => s + a.noi, 0), costo = M.costoTotal, part = M.participaciones, aporte = costo / part;
  const tir = (() => { const f = r => -costo + años.reduce((s, a) => s + (a.noi + (a.n === 10 ? a.valor : 0)) / (1 + r) ** a.n, 0); let lo = 0, hi = 1; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; f(m) > 0 ? lo = m : hi = m; } return (lo + hi) / 2; })();
  $('#p-supuestos').innerHTML = [['Tarifa media por noche', cop(M.tarifaNoche), M.tarifaFuente], ['Ocupación', pct(M.ocupacion, 0), `${Math.round(noches)} noches al año por apartamento`], ['Gastos de operación', pct(M.gastos, 0), 'limpieza, lavandería, insumos, servicios, comisiones y administración'],
    ['Apartamentos', M.unidades, 'con cocina y baño privados'], ['Aumento anual de tarifas', pct(M.crecimiento, 0), 'aplicado desde el año 2'], ['Tasa de capitalización', pct(M.capRate, 0), 'valor = ingreso neto anual ÷ tasa']]
    .map(([a, b, c]) => `<div><small>${a}</small><b>${b}</b><span>${c}</span></div>`).join('');
  $('#p-kpis').innerHTML = [['Ingreso bruto mensual · año 1', cop(a1.bruto / 12)], ['Ingreso neto mensual · año 1', cop(a1.noi / 12)], ['Neto mensual por participación', cop(a1.noi / 12 / part)],
    ['Rentabilidad neta sobre el costo · año 1', pct(a1.noi / costo)], ['Valor estimado de venta · año 10', mill(a10.valor)], ['TIR estimada a 10 años', pct(tir)]]
    .map(([a, b]) => `<div><small>${a}</small><b>${b}</b></div>`).join('');
  const mx = a10.valor;
  $('#p-tabla').innerHTML = años.map(a => `<tr><td>Año ${a.n}</td><td class="num">${cop(a.bruto)}</td><td class="num">${cop(a.gastos)}</td><td class="num"><b>${cop(a.noi)}</b></td><td class="num">${cop(a.noi / 12)}</td><td class="num">${cop(a.noi / part)}</td><td class="num">${pct(a.noi / costo)}</td>
    <td class="num barcell" title="Año ${a.n}: valor estimado ${cop(a.valor)}"><i style="width:${a.valor / mx * 100}%"></i><span>${mill(a.valor)}</span></td></tr>`).join('')
    + `<tr class="sub"><td><b>10 años</b></td><td class="num"><b>${cop(años.reduce((s, a) => s + a.bruto, 0))}</b></td><td class="num"><b>${cop(años.reduce((s, a) => s + a.gastos, 0))}</b></td><td class="num"><b>${cop(acum)}</b></td><td></td><td class="num"><b>${cop(acum / part)}</b></td><td></td><td></td></tr>`;
  $('#p-resumen').innerHTML = `Con estos supuestos, cada participación de <b>${cop(aporte)}</b> recibiría cerca de <b>${cop(a1.noi / 12 / part)} al mes</b> el primer año y <b>${cop(acum / part)}</b> acumulados en 10 años. Si la casa se vendiera al final del año 10 por <b>${cop(a10.valor)}</b> (ingreso neto de ese año ÷ ${pct(M.capRate, 0)}), a cada participación le corresponderían <b>${cop(a10.valor / part)}</b> adicionales: en total, <b>${((acum + a10.valor) / costo).toLocaleString('es-CO', { maximumFractionDigits: 1 })} veces</b> lo invertido.`;
  const esc = (M.escenarios || []).map(e => { const b = M.unidades * e.tarifa * 365 * e.ocupacion, n = b * (1 - M.gastos), n10 = n * (1 + M.crecimiento) ** 9; return `<tr class="${e.base ? 'base' : ''}"><td>${e.nombre}</td><td class="num">${cop(e.tarifa)}</td><td class="num">${pct(e.ocupacion, 0)}</td><td class="num">${cop(b / 12)}</td><td class="num">${cop(n / 12)}</td><td class="num">${cop(n / 12 / part)}</td><td class="num">${pct(n / costo)}</td><td class="num">${mill(n10 / M.capRate)}</td></tr>`; });
  if ($('#p-escenarios')) $('#p-escenarios').innerHTML = esc.join('');
  document.querySelectorAll('[data-m]').forEach(el => el.textContent = ({ aporte: cop(aporte), cuota1: cop(M.cuota1), cuota2: cop(aporte - M.cuota1), rent: pct(a1.noi / costo), costo: cop(costo) })[el.dataset.m]);
}

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
