/* Chemical Weight — shared engine. Classic script, exposes window.Chem. */
var Chem = (function () {
  "use strict";

  /* IUPAC abridged standard atomic weights: [atomic number, weight] */
  var AW = {
    H:[1,1.008],He:[2,4.0026],Li:[3,6.94],Be:[4,9.0122],B:[5,10.81],C:[6,12.011],
    N:[7,14.007],O:[8,15.999],F:[9,18.998],Ne:[10,20.180],Na:[11,22.990],Mg:[12,24.305],
    Al:[13,26.982],Si:[14,28.085],P:[15,30.974],S:[16,32.06],Cl:[17,35.45],Ar:[18,39.95],
    K:[19,39.098],Ca:[20,40.078],Sc:[21,44.956],Ti:[22,47.867],V:[23,50.942],Cr:[24,51.996],
    Mn:[25,54.938],Fe:[26,55.845],Co:[27,58.933],Ni:[28,58.693],Cu:[29,63.546],Zn:[30,65.38],
    Ga:[31,69.723],Ge:[32,72.630],As:[33,74.922],Se:[34,78.971],Br:[35,79.904],Kr:[36,83.798],
    Rb:[37,85.468],Sr:[38,87.62],Y:[39,88.906],Zr:[40,91.224],Nb:[41,92.906],Mo:[42,95.95],
    Ru:[44,101.07],Rh:[45,102.91],Pd:[46,106.42],Ag:[47,107.87],Cd:[48,112.41],In:[49,114.82],
    Sn:[50,118.71],Sb:[51,121.76],Te:[52,127.60],I:[53,126.90],Xe:[54,131.29],Cs:[55,132.91],
    Ba:[56,137.33],La:[57,138.91],Ce:[58,140.12],Pr:[59,140.91],Nd:[60,144.24],Sm:[62,150.36],
    Eu:[63,151.96],Gd:[64,157.25],Tb:[65,158.93],Dy:[66,162.50],Ho:[67,164.93],Er:[68,167.26],
    Tm:[69,168.93],Yb:[70,173.05],Lu:[71,174.97],Hf:[72,178.49],Ta:[73,180.95],W:[74,183.84],
    Re:[75,186.21],Os:[76,190.23],Ir:[77,192.22],Pt:[78,195.08],Au:[79,196.97],Hg:[80,200.59],
    Tl:[81,204.38],Pb:[82,207.2],Bi:[83,208.98],Th:[90,232.04],Pa:[91,231.04],U:[92,238.03]
  };
  /* elements with no standard atomic weight — named so the refusal is specific */
  var NO_WEIGHT = {Tc:1,Pm:1,Po:1,At:1,Rn:1,Fr:1,Ra:1,Ac:1,Np:1,Pu:1,Am:1,Cm:1,Bk:1,Cf:1,Es:1};

  var ENAME = {
    H:'Hydrogen',He:'Helium',Li:'Lithium',B:'Boron',C:'Carbon',N:'Nitrogen',O:'Oxygen',
    F:'Fluorine',Na:'Sodium',Mg:'Magnesium',Al:'Aluminium',Si:'Silicon',P:'Phosphorus',
    S:'Sulfur',Cl:'Chlorine',K:'Potassium',Ca:'Calcium',Ti:'Titanium',Cr:'Chromium',
    Mn:'Manganese',Fe:'Iron',Co:'Cobalt',Ni:'Nickel',Cu:'Copper',Zn:'Zinc',Br:'Bromine',
    Ag:'Silver',Sn:'Tin',I:'Iodine',Ba:'Barium',Pt:'Platinum',Au:'Gold',Hg:'Mercury',Pb:'Lead'
  };
  /* CPK colours — the convention used in physical molecular models */
  var CPK = {
    H:'#ffffff',C:'#2f2f2f',N:'#2f5ff0',O:'#ee1c1c',S:'#e8d325',P:'#ff8000',
    Cl:'#1fd41f',F:'#86dc4e',Br:'#a62929',I:'#8c008c',Na:'#ab5cf2',K:'#8f40d4',
    Mg:'#78e000',Ca:'#3bdc00',Fe:'#e06633',Cu:'#c88033',Zn:'#7d80b0',Mn:'#9c7ac7',
    Al:'#bfa6a6',Si:'#f0c8a0',Ti:'#bfc2c7',Ni:'#50d050',Ag:'#c0c0c0',Au:'#ffd123',
    Ba:'#00c900',Pb:'#575961',Sn:'#668080',B:'#ffb5b5',He:'#d9ffff',Li:'#cc80ff'
  };

  /* compound library. q = query strings; several entries may share one query (ambiguous name). */
  var LIB = [
    {n:'Water', f:'H2O', form:'', q:['water','dihydrogen monoxide','h2o']},
    {n:'Sodium chloride', f:'NaCl', form:'', q:['sodium chloride','table salt','halite','rock salt']},
    {n:'Sodium bicarbonate', f:'NaHCO3', form:'', q:['sodium bicarbonate','baking soda','sodium hydrogen carbonate','bicarbonate of soda']},
    {n:'Sodium carbonate', f:'Na2CO3', form:'anhydrous', q:['sodium carbonate','washing soda','soda ash']},
    {n:'Sodium carbonate decahydrate', f:'Na2CO3.10H2O', form:'decahydrate', q:['washing soda','sodium carbonate decahydrate']},
    {n:'Carbon dioxide', f:'CO2', form:'', q:['carbon dioxide','dry ice']},
    {n:'Ammonia', f:'NH3', form:'', q:['ammonia']},
    {n:'Methane', f:'CH4', form:'', q:['methane','natural gas (main component)']},
    {n:'Glucose', f:'C6H12O6', form:'', q:['glucose','dextrose','blood sugar','grape sugar']},
    {n:'Fructose', f:'C6H12O6', form:'', q:['fructose','fruit sugar','levulose']},
    {n:'Sucrose', f:'C12H22O11', form:'', q:['sucrose','table sugar','cane sugar','saccharose']},
    {n:'Lactose', f:'C12H22O11', form:'', q:['lactose','milk sugar']},
    {n:'Ethanol', f:'C2H5OH', form:'', q:['ethanol','ethyl alcohol','grain alcohol','drinking alcohol']},
    {n:'Methanol', f:'CH3OH', form:'', q:['methanol','methyl alcohol','wood alcohol']},
    {n:'Aspirin', f:'C9H8O4', form:'free acid', q:['aspirin','acetylsalicylic acid','asa']},
    {n:'Caffeine', f:'C8H10N4O2', form:'', q:['caffeine','theine']},
    {n:'Ascorbic acid', f:'C6H8O6', form:'', q:['ascorbic acid','vitamin c']},
    {n:'Acetic acid', f:'CH3COOH', form:'', q:['acetic acid','ethanoic acid','vinegar acid']},
    {n:'Sulfuric acid', f:'H2SO4', form:'', q:['sulfuric acid','sulphuric acid','oil of vitriol']},
    {n:'Nitric acid', f:'HNO3', form:'', q:['nitric acid','aqua fortis']},
    {n:'Hydrochloric acid', f:'HCl', form:'', q:['hydrochloric acid','muriatic acid','hydrogen chloride']},
    {n:'Sodium hydroxide', f:'NaOH', form:'', q:['sodium hydroxide','caustic soda','lye']},
    {n:'Potassium hydroxide', f:'KOH', form:'', q:['potassium hydroxide','caustic potash']},
    {n:'Calcium carbonate', f:'CaCO3', form:'', q:['calcium carbonate','limestone','chalk','calcite','marble']},
    {n:'Calcium hydroxide', f:'Ca(OH)2', form:'', q:['calcium hydroxide','slaked lime','hydrated lime','pickling lime']},
    {n:'Calcium oxide', f:'CaO', form:'', q:['calcium oxide','quicklime','burnt lime']},
    {n:'Potassium permanganate', f:'KMnO4', form:'', q:['potassium permanganate','condys crystals']},
    {n:'Copper(II) sulfate', f:'CuSO4', form:'anhydrous', q:['copper sulfate','copper sulphate','cupric sulfate','copper(ii) sulfate']},
    {n:'Copper(II) sulfate pentahydrate', f:'CuSO4.5H2O', form:'pentahydrate', q:['copper sulfate','copper sulphate','copper sulfate pentahydrate','blue vitriol','bluestone']},
    {n:'Magnesium sulfate', f:'MgSO4', form:'anhydrous', q:['magnesium sulfate','magnesium sulphate']},
    {n:'Magnesium sulfate heptahydrate', f:'MgSO4.7H2O', form:'heptahydrate', q:['magnesium sulfate','epsom salt','epsom salts']},
    {n:'Sodium sulfate', f:'Na2SO4', form:'anhydrous', q:['sodium sulfate','sodium sulphate','salt cake']},
    {n:'Sodium sulfate decahydrate', f:'Na2SO4.10H2O', form:'decahydrate', q:['sodium sulfate','glaubers salt','glauber salt']},
    {n:'Ammonium sulfate', f:'(NH4)2SO4', form:'', q:['ammonium sulfate','ammonium sulphate']},
    {n:'Ammonium nitrate', f:'NH4NO3', form:'', q:['ammonium nitrate']},
    {n:'Urea', f:'CO(NH2)2', form:'', q:['urea','carbamide']},
    {n:'Potassium ferrocyanide', f:'K4[Fe(CN)6]', form:'', q:['potassium ferrocyanide','potassium hexacyanoferrate(ii)','yellow prussiate of potash']},
    {n:'Iron(III) oxide', f:'Fe2O3', form:'', q:['iron(iii) oxide','iron oxide','ferric oxide','rust','hematite']},
    {n:'Aluminium sulfate', f:'Al2(SO4)3', form:'anhydrous', q:['aluminium sulfate','aluminum sulfate','alum (papermakers)']},
    {n:'Calcium chloride', f:'CaCl2', form:'anhydrous', q:['calcium chloride']},
    {n:'Silver nitrate', f:'AgNO3', form:'', q:['silver nitrate','lunar caustic']},
    {n:'Hydrogen peroxide', f:'H2O2', form:'', q:['hydrogen peroxide']},
    {n:'Benzene', f:'C6H6', form:'', q:['benzene']},
    {n:'Acetone', f:'C3H6O', form:'', q:['acetone','propanone','dimethyl ketone']},
    {n:'Glycerol', f:'C3H8O3', form:'', q:['glycerol','glycerine','glycerin']},
    {n:'Citric acid', f:'C6H8O7', form:'anhydrous', q:['citric acid']},
    {n:'Sodium acetate', f:'CH3COONa', form:'anhydrous', q:['sodium acetate']},
    {n:'Ethyl acetate', f:'CH3COOC2H5', form:'', q:['ethyl acetate']},
    {n:'Potassium nitrate', f:'KNO3', form:'', q:['potassium nitrate','saltpetre','saltpeter','nitre']},
    {n:'Zinc sulfate heptahydrate', f:'ZnSO4.7H2O', form:'heptahydrate', q:['zinc sulfate','white vitriol']},
    {n:'Sodium thiosulfate pentahydrate', f:'Na2S2O3.5H2O', form:'pentahydrate', q:['sodium thiosulfate','hypo','photographers hypo']}
  ];

  /* category words and mixtures: there is no single molecular weight */
  var MIXTURES = {
    'gasoline':'a mixture of hydrocarbons','petrol':'a mixture of hydrocarbons',
    'diesel':'a mixture of hydrocarbons','kerosene':'a mixture of hydrocarbons',
    'starch':'a polymer of variable chain length','cellulose':'a polymer of variable chain length',
    'protein':'a class of molecules, each with its own weight','dna':'a polymer of variable length',
    'steel':'an alloy','brass':'an alloy','bronze':'an alloy','air':'a mixture of gases',
    'milk':'a mixture','honey':'a mixture','butter':'a mixture','wood':'a mixture',
    'cement':'a mixture','soap':'a mixture of salts','glass':'a mixture of oxides',
    'sugar':'a category — try sucrose, glucose or fructose',
    'alcohol':'a category — try ethanol or methanol',
    'salt':'a category — try sodium chloride',
    'vitamin':'a category — try ascorbic acid for vitamin C',
    'oil':'a category and usually a mixture',
    'plastic':'a category of polymers','gas':'a category','acid':'a category','base':'a category'
  };

  /* ---------- parser ---------- */
  var OPEN = {'(':')','[':']','{':'}'};

  function parseGroup(s, i, close) {
    var counts = {};
    while (i < s.length) {
      var ch = s[i];
      if (close && ch === close) { return [counts, i + 1]; }
      if (ch === ')' || ch === ']' || ch === '}') {
        throw new Error('Closing "' + ch + '" with nothing open, at position ' + (i + 1) + '.');
      }
      if (OPEN[ch]) {
        var r = parseGroup(s, i + 1, OPEN[ch]);
        var sub = r[0], j = r[1], num = '';
        while (j < s.length && /[0-9]/.test(s[j])) { num += s[j++]; }
        var m = num ? parseInt(num, 10) : 1;
        if (m === 0) { throw new Error('A group multiplier of 0 is not a formula.'); }
        for (var k in sub) { counts[k] = (counts[k] || 0) + sub[k] * m; }
        i = j; continue;
      }
      if (/\s/.test(ch)) { i++; continue; }
      if (/[A-Z]/.test(ch)) {
        var el = ch; i++;
        if (i < s.length && /[a-z]/.test(s[i])) { el += s[i++]; }
        if (NO_WEIGHT[el]) {
          throw new Error(el + ' has no standard atomic weight, so it has no single molar mass.');
        }
        if (!AW[el]) {
          var hint = (el.length === 2 && AW[el[0]] && AW[el[1].toUpperCase()])
            ? ' Did you mean ' + el[0] + ' + ' + el[1].toUpperCase() + '? A capital starts a new element.'
            : '';
          throw new Error('"' + el + '" is not an element symbol.' + hint);
        }
        var n = '';
        while (i < s.length && /[0-9]/.test(s[i])) { n += s[i++]; }
        var c = n ? parseInt(n, 10) : 1;
        if (c === 0) { throw new Error('An atom count of 0 is not a formula.'); }
        counts[el] = (counts[el] || 0) + c;
        continue;
      }
      if (/[a-z]/.test(ch)) {
        throw new Error('"' + ch + '" is lowercase with no element before it. Element symbols start with a capital.');
      }
      throw new Error('"' + ch + '" is not valid in a formula.');
    }
    if (close) { throw new Error('A bracket was opened and never closed.'); }
    return [counts, i];
  }

  function hillOrder(counts) {
    var keys = Object.keys(counts);
    if (keys.indexOf('C') === -1) { return keys.sort(); }
    var rest = keys.filter(function (k) { return k !== 'C' && k !== 'H'; }).sort();
    var head = ['C'];
    if (keys.indexOf('H') !== -1) { head.push('H'); }
    return head.concat(rest);
  }

  function lookupName(raw) {
    var q = String(raw || '').trim().toLowerCase().replace(/\s+/g, ' ');
    if (!q) { return []; }
    var hits = LIB.filter(function (e) { return e.q.indexOf(q) !== -1; });
    if (hits.length) { return hits; }
    var loose = q.replace(/[^a-z0-9]/g, '');
    return LIB.filter(function (e) {
      return e.q.some(function (s) { return s.replace(/[^a-z0-9]/g, '') === loose; });
    });
  }

  function analyse(raw) {
    var input = String(raw == null ? '' : raw).trim();
    if (!input) { throw new Error('Enter a formula to calculate.'); }

    var lookedUp = null;
    var hits = lookupName(input);
    if (hits.length) { lookedUp = input; input = hits[0].f; }

    var src = input.replace(/·|•|∙|\*/g, '.');
    var parts = src.split('.').filter(function (p) { return p.trim() !== ''; });
    if (!parts.length) { throw new Error('Enter a formula to calculate.'); }

    var total = {}, hadGroup = /[\(\[\{]/.test(src), hadHydrate = parts.length > 1;
    parts.forEach(function (part, idx) {
      var mult = 1, core = part.trim();
      var lead = core.match(/^([0-9]+)(.+)$/);
      if (idx > 0 && lead) { mult = parseInt(lead[1], 10); core = lead[2]; }
      else if (idx === 0 && lead) {
        throw new Error('A formula cannot start with a number. Reaction coefficients are not part of the weight.');
      }
      var counts = parseGroup(core, 0, null)[0];
      for (var k in counts) { total[k] = (total[k] || 0) + counts[k] * mult; }
    });

    var order = hillOrder(total), mw = 0, atoms = 0;
    var rows = order.map(function (el) {
      var w = AW[el][1], n = total[el], sub = w * n;
      mw += sub; atoms += n;
      return { el: el, z: AW[el][0], aw: w, n: n, sub: sub };
    });
    rows.forEach(function (r) { r.pct = r.sub / mw * 100; });

    var expanded = order.map(function (el) {
      return el + (total[el] > 1 ? total[el] : '');
    }).join('');

    return {
      input: input, lookedUp: lookedUp, rows: rows, mw: mw, atoms: atoms,
      counts: total, expanded: expanded, expandedNeeded: (hadGroup || hadHydrate)
    };
  }

  /* ---------- helpers ---------- */
  function fx(n, d) { return Number(n).toFixed(d); }
  function f2(n) { return fx(n, 2); }
  function f3(n) { return fx(n, 3); }
  /* significant-figure format for values that span many orders of magnitude */
  function sig(n, s) {
    if (!isFinite(n)) { return '—'; }
    if (n === 0) { return '0'; }
    var a = Math.abs(n);
    if (a >= 1e6 || a < 1e-4) { return n.toExponential((s || 4) - 1); }
    var d = Math.max(0, (s || 4) - 1 - Math.floor(Math.log10(a)));
    return Number(n.toFixed(Math.min(d, 10))).toString();
  }
  function gcd(a, b) { return b ? gcd(b, a % b) : a; }

  var reduced = false;
  try { reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text != null) { n.textContent = text; }
    return n;
  }
  function clear(node) { if (node) { while (node.firstChild) { node.removeChild(node.firstChild); } } }
  function stagger(node, cls, i, step) {
    if (reduced) { return; }
    node.style.animationDelay = (i * step) + 'ms';
    node.classList.add(cls);
  }

  var timers = {};
  function countTo(node, target, animate, decimals) {
    if (!node) { return; }
    var d = decimals == null ? 3 : decimals;
    var id = node.id || 'anon';
    if (timers[id]) { cancelAnimationFrame(timers[id]); timers[id] = null; }
    if (!animate || reduced || !isFinite(target)) { node.textContent = isFinite(target) ? fx(target, d) : '—'; return; }
    var t0 = null, dur = 520;
    function frame(ts) {
      if (t0 === null) { t0 = ts; }
      var p = Math.min(1, (ts - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      node.textContent = fx(target * e, d);
      if (p < 1) { timers[id] = requestAnimationFrame(frame); }
      else { node.textContent = fx(target, d); timers[id] = null; }
    }
    timers[id] = requestAnimationFrame(frame);
  }

  /* ---------- shared renderers ---------- */
  function renderSteps(node, a, animate) {
    clear(node);
    var items = [
      ['Expand the formula',
        a.expandedNeeded ? a.input + '  →  ' + a.expanded
                         : a.input + '  — no brackets or hydrate, read as written'],
      ['Count the atoms',
        a.rows.map(function (r) { return r.el + ' ' + r.n; }).join('   ') +
          '   — ' + a.atoms + ' atom' + (a.atoms === 1 ? '' : 's')],
      ['Multiply by each atomic weight',
        a.rows.map(function (r) { return r.el + ': ' + r.n + ' × ' + r.aw + ' = ' + f3(r.sub); }).join('\n')],
      ['Add the subtotals',
        a.rows.map(function (r) { return f3(r.sub); }).join(' + ') + ' = ' + f3(a.mw) + ' g/mol']
    ];
    items.forEach(function (pair, i) {
      var li = el('li'), d = el('div');
      d.appendChild(el('span', 'what', pair[0]));
      d.appendChild(el('span', 'how' + (i === 3 ? ' sum' : ''), pair[1]));
      li.appendChild(d);
      stagger(li, 'anim-rise', i, 70);
      node.appendChild(li);
    });
  }

  function tile(r) {
    var t = el('div', 'tile');
    t.appendChild(el('span', 'z', String(r.z)));
    t.appendChild(el('span', 'sym', r.el));
    t.appendChild(el('span', 'aw', String(r.aw)));
    return t;
  }

  /* opts: {sample: grams of sample to show per element, totalNode, pctNode} */
  function renderRows(node, a, animate, opts) {
    opts = opts || {};
    clear(node);
    var fills = [];
    a.rows.forEach(function (r, i) {
      var row = el('div', 'row');
      row.appendChild(tile(r));
      var body = el('div', 'body');
      var line = el('div', 'line');
      line.appendChild(el('span', 'name', (ENAME[r.el] || r.el) + ' × ' + r.n));
      line.appendChild(el('span', 'math',
        opts.sample != null ? sig(a.rows[i].pct / 100 * opts.sample, 5) + ' g' : f3(r.sub) + ' g'));
      body.appendChild(line);
      var track = el('div', 'track'), fill = el('div', 'fill');
      track.appendChild(fill); body.appendChild(track);
      fills.push([fill, r.pct]);
      body.appendChild(el('div', 'pct', f2(r.pct) + '% by mass'
        + (opts.sample != null ? '  ·  ' + f3(r.sub) + ' g/mol' : '')));
      row.appendChild(body);
      stagger(row, 'anim-rise', i, 60);
      node.appendChild(row);
    });
    if (opts.totalNode) {
      opts.totalNode.textContent = a.rows.length + ' element' + (a.rows.length === 1 ? '' : 's') + ', ' + a.atoms + ' atoms';
    }
    if (opts.pctNode) {
      var sum = a.rows.reduce(function (s, r) { return s + r.pct; }, 0);
      opts.pctNode.textContent = opts.sample != null
        ? sig(opts.sample, 6) + ' g total'
        : f2(sum) + '%';
    }
    function paint() { fills.forEach(function (p) { p[0].style.width = p[1] + '%'; }); }
    if (animate && !reduced) { requestAnimationFrame(function () { requestAnimationFrame(paint); }); }
    else { paint(); }
  }

  var MAX_ATOMS = 90;
  function renderAtoms(atomsNode, legendNode, a, animate) {
    clear(atomsNode); clear(legendNode);
    var list = [];
    a.rows.forEach(function (r) { for (var i = 0; i < r.n; i++) { list.push(r); } });
    var shown = list.slice(0, MAX_ATOMS);
    var maxAw = a.rows.reduce(function (m, r) { return Math.max(m, r.aw); }, 1);
    shown.forEach(function (r, i) {
      var size = 15 + Math.pow(r.aw / maxAw, 1 / 3) * 17;
      var d = el('div', 'atom', r.el);
      d.style.width = size + 'px'; d.style.height = size + 'px';
      d.style.background = CPK[r.el] || '#b9c0c7';
      d.style.fontSize = Math.max(7, size * 0.36) + 'px';
      if (size < 19) { d.textContent = ''; d.title = r.el; }
      stagger(d, 'anim-pop', i, 14);
      if (!reduced) {
        d.classList.add('float');
        d.style.animationDelay = (i * 14) + 'ms, ' + (i * 55 % 1700) + 'ms';
      }
      atomsNode.appendChild(d);
    });
    if (list.length > shown.length) {
      var more = el('div', null, '+' + (list.length - shown.length) + ' more');
      more.style.font = '0.82rem var(--font-mono)';
      more.style.color = 'var(--ink-faint)';
      more.style.alignSelf = 'center';
      atomsNode.appendChild(more);
    }
    if (legendNode) {
      a.rows.forEach(function (r) {
        var s = el('span'), i2 = el('i');
        i2.style.background = CPK[r.el] || '#b9c0c7';
        s.appendChild(i2);
        s.appendChild(document.createTextNode(
          r.el + ' ' + r.n + ' (' + f2(r.n / a.atoms * 100) + '% of atoms, ' + f2(r.pct) + '% of mass)'));
        legendNode.appendChild(s);
      });
    }
  }

  /* error helper for a .readout block */
  function fail(readout, bigNode, msg, extraNodes) {
    readout.classList.add('bad');
    bigNode.textContent = msg;
    (extraNodes || []).forEach(function (n) { if (n) { n.textContent = ''; } });
    return null;
  }

  return {
    AW: AW, NO_WEIGHT: NO_WEIGHT, ENAME: ENAME, CPK: CPK, LIB: LIB, MIXTURES: MIXTURES,
    analyse: analyse, lookupName: lookupName, hillOrder: hillOrder,
    fx: fx, f2: f2, f3: f3, sig: sig, gcd: gcd, reduced: reduced,
    el: el, clear: clear, stagger: stagger, countTo: countTo, tile: tile,
    renderSteps: renderSteps, renderRows: renderRows, renderAtoms: renderAtoms, fail: fail
  };
})();
