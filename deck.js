(function () {
  const D = window.DECK_DATA || {};
  const S = D.summary || {};

  const COLORS = {
    Coupang: '#ff4d5e',
    Danawa: '#38bdf8',
    NaverShopping: '#03c75a'
  };
  const krw = (n) => (n == null ? '-' : Number(n).toLocaleString('ko-KR') + '원');

  function get(path) {
    return path.split('.').reduce((o, k) => (o ? o[k] : undefined), D);
  }

  /* ---------- static text ---------- */
  function fillStatic() {
    const d = D.generatedAt ? new Date(D.generatedAt) : new Date();
    const dateStr = d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('title-meta', `수집 상품 ${D.itemCount}개 · 채널 3곳 · ${dateStr}`);
    set('gen-date', dateStr);

    const stats = S.sourceStats || [];
    const setHTML = (id, v) => { const el = document.getElementById(id); if (el) el.innerHTML = v; };

    const byAvg = [...stats].filter(s => s.avg).sort((a, b) => a.avg - b.avg);
    const loAvg = byAvg[0], hiAvg = byAvg[byAvg.length - 1];
    if (hiAvg && loAvg) {
      setHTML('avg-message', `가장 비싼 채널은 <b>${labelOf(hiAvg.source)}</b> ${krw(hiAvg.avg)}, 가장 저렴한 채널은 <b>${labelOf(loAvg.source)}</b> ${krw(loAvg.avg)} — 채널만 바꿔도 평균 <b>${krw(hiAvg.avg - loAvg.avg)}</b> 차이.`);
    }

    const maxBrandCount = (S.brands && S.brands[0]) ? S.brands[0].count : 0;
    const tied = (S.brands || []).filter(b => b.count === maxBrandCount);
    if (tied.length) {
      setHTML('brand-message', `검색 상위에서 <b>${tied.map(b => b.brand).join(' · ')}</b>가 각 <b>${maxBrandCount}회</b>로 가장 자주 반복 등장했습니다.`);
    }

    const m = D.methodology || {};
    const mEl = document.getElementById('method-note');
    if (mEl && m.note) {
      mEl.innerHTML = `<span class="mtag">방법론</span>판매처 원본 <b>${m.originalCount}</b>건 중 단백질과 무관한 <b>${m.excludedCount}</b>건을 제외하고, 최종 <b>${m.analysisCount}</b>건(가격 확인 ${m.pricedCount}건)으로 분석했습니다. ${m.criteria || ''}`;
    }

    // source links
    const searchQ = encodeURIComponent('프로틴');
    const links = {
      'src-coupang': [`https://www.coupang.com/np/search?q=${searchQ}`, stats.find(s => s.source === 'Coupang')],
      'src-danawa': [`https://search.danawa.com/dsearch.php?query=${searchQ}`, stats.find(s => s.source === 'Danawa')],
      'src-naver': [`https://search.naver.com/search.naver?where=nexearch&query=${searchQ}`, stats.find(s => s.source === 'NaverShopping')]
    };
    Object.entries(links).forEach(([id, [url, st]]) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.href = url;
      el.querySelector('span').textContent = st ? `평균 ${krw(st.avg)}` : '수집';
    });

    // image fallbacks: remove <img> if missing -> keep CSS art
    document.querySelectorAll('[data-img]').forEach((el) => {
      const src = el.dataset.img;
      const img = new Image();
      img.onload = () => { el.style.backgroundImage = `url('${src}')`; el.classList.add('has-img'); };
      img.src = src;
    });
  }

  /* ---------- source bars (overview) ---------- */
  function buildSourceBars() {
    const wrap = document.getElementById('overview-source-bars');
    if (!wrap) return;
    const max = Math.max(...(S.sourceStats || []).map(s => s.totalListed), 1);
    wrap.innerHTML = (S.sourceStats || []).map(s => `
      <div class="sbar" data-count="${s.totalListed}">
        <b><span class="ch-dot ${chDot(s.source)}"></span>${labelOf(s.source)}</b>
        <div class="track"><div class="fill ${fillClass(s.source)}" data-w="${(s.totalListed / max) * 100}"></div></div>
        <span class="val">${s.totalListed}개</span>
      </div>`).join('');
  }
  const labelOf = (s) => ({ Coupang: '쿠팡', Danawa: '다나와', NaverShopping: '네이버쇼핑' }[s] || s);
  const fillClass = (s) => ({ Coupang: 'fill-cp', Danawa: 'fill-dn', NaverShopping: 'fill-nv' }[s] || '');
  const chDot = (s) => ({ Coupang: 'ch-cp', Danawa: 'ch-dn', NaverShopping: 'ch-nv' }[s] || '');

  /* ---------- cleaning flow (원본 → 제외 → 분석) ---------- */
  function buildCleanFlow() {
    const el = document.getElementById('clean-flow');
    if (!el) return;
    const m = D.methodology || {};
    if (!m.originalCount) { el.style.display = 'none'; return; }
    el.innerHTML = `
      <div class="cf-node"><b>${m.originalCount}</b><span>원본 수집</span></div>
      <span class="cf-arrow">→</span>
      <div class="cf-node cf-drop"><b>−${m.excludedCount}</b><span>무관 항목 제외</span></div>
      <span class="cf-arrow">→</span>
      <div class="cf-node cf-final"><b>${m.analysisCount}</b><span>최종 분석</span></div>
      <span class="cf-note">가격 확인 ${m.pricedCount}건 · 단백질 무관·반려동물용 제외</span>`;
  }

  /* ---------- insights (visual statements) ---------- */
  function buildInsights() {
    const grid = document.getElementById('insight-grid');
    if (!grid) return;
    const cheap = S.cheapest, pricey = S.priciest, mr = S.mostReviewed;
    const byAvg = [...(S.sourceStats || [])].filter(s => s.avg).sort((a, b) => a.avg - b.avg);
    const loAvg = byAvg[0], hiAvg = byAvg[byAvg.length - 1];
    const top = (S.brands && S.brands[0]) || null;

    const spread = (cheap && pricey) ? Math.round(((pricey.price - cheap.price) / cheap.price) * 100) : null;
    const gap = (hiAvg && loAvg) ? hiAvg.avg - loAvg.avg : null;

    const cards = [];
    if (spread != null) cards.push({
      metric: `${spread}%`, label: '가격 양극화',
      detail: `${krw(cheap.price)} ~ ${krw(pricey.price)} · 최저 “${esc(cheap.name)}”`
    });
    if (gap != null) cards.push({
      metric: krw(gap), label: '채널 단가 차',
      detail: `${labelOf(hiAvg.source)} ${krw(hiAvg.avg)} vs ${labelOf(loAvg.source)} ${krw(loAvg.avg)}`
    });
    if (top) cards.push({
      metric: `${top.count}회`, label: '브랜드 쏠림',
      detail: `“${esc(top.brand)}” 최다 반복 노출 · 평균 ${krw(top.avg)}`
    });
    if (mr) cards.push({
      metric: Number(mr.reviews).toLocaleString('ko-KR'), label: '검증된 인기',
      detail: `“${esc(mr.name)}” 리뷰 수 1위`
    });

    grid.innerHTML = cards.map((c, i) => `
      <div class="insight-card">
        <span class="i-idx">0${i + 1}</span>
        <div class="i-metric">${c.metric}</div>
        <div class="i-label">${c.label}</div>
        <div class="i-detail">${c.detail}</div>
      </div>`).join('');
  }

  /* ---------- leaderboards ---------- */
  function buildBoards() {
    const items = D.items || [];
    const cheap = [...items].filter(i => i.price > 0).sort((a, b) => a.price - b.price).slice(0, 5);
    const rev = [...items].filter(i => i.reviews).sort((a, b) => b.reviews - a.reviews).slice(0, 5);

    const cheapEl = document.getElementById('cheap-list');
    if (cheapEl) cheapEl.innerHTML = cheap.map((it, i) => rankLi(i, it.name, krw(it.price), it.price, it.source)).join('');
    const revEl = document.getElementById('review-list');
    const maxRev = Math.max(...rev.map(r => r.reviews), 1);
    if (revEl) revEl.innerHTML = rev.map((it, i) => rankLi(i, it.name, Number(it.reviews).toLocaleString('ko-KR') + '개', (it.reviews / maxRev) * 100, it.source)).join('');
  }
  function rankLi(i, name, val, w, source) {
    return `<li><div class="rl-fill" data-w="${w}"></div>
      <div class="rl-row"><span class="rl-name"><span class="rank-badge">${i + 1}</span><span class="rl-dot ${chDot(source)}"></span>${esc(name)}</span>
      <span class="rl-val">${val}</span></div></li>`;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- bucket legend ---------- */
  const BUCKET_COLORS = ['#38bdf8', '#5eead4', '#b6ff3d', '#fbbf24', '#ff4d5e'];
  const BUCKET_RANGES = [[0, 20000], [20000, 30000], [30000, 40000], [40000, 60000], [60000, Infinity]];
  function medianBucketIndex(med) {
    if (med == null) return -1;
    return BUCKET_RANGES.findIndex(([lo, hi]) => med >= lo && med < hi);
  }
  function buildBucketLegend() {
    const el = document.getElementById('bucket-legend');
    if (!el) return;
    const medIdx = medianBucketIndex(S.medianPrice);
    el.innerHTML = (S.priceBuckets || []).map((b, i) =>
      `<li class="${i === medIdx ? 'is-median' : ''}">
        <span><span class="swatch" style="background:${BUCKET_COLORS[i % BUCKET_COLORS.length]}"></span>${b.label}${i === medIdx ? '<span class="tag-median">중앙값</span>' : ''}</span>
        <span class="num">${b.count}개</span>
      </li>`
    ).join('');
  }

  /* ---------- count-up ---------- */
  function runCounts(section) {
    section.querySelectorAll('[data-num]').forEach(el => {
      let target = null, decimals = 0, suffix = '';
      const card = el.closest('[data-count]');
      const idEl = el.closest('[data-count-id]');
      if (idEl) {
        const which = idEl.getAttribute('data-count-id');
        target = which === 'min' ? (S.cheapest && S.cheapest.price) : (S.priciest && S.priciest.price);
      } else if (card && card.hasAttribute('data-count')) {
        target = get(card.getAttribute('data-count'));
      } else if (el.hasAttribute('data-count')) {
        target = get(el.getAttribute('data-count'));
      }
      const host = idEl || card || el;
      decimals = Number(host?.getAttribute('data-decimals') || 0);
      suffix = host?.getAttribute('data-suffix') || '';
      if (target == null || isNaN(Number(target))) { el.textContent = '-'; return; }
      animate(el, 0, Number(target), 1100, decimals, suffix);
    });
  }
  function animate(el, from, to, dur, decimals, suffix) {
    const start = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      const v = from + (to - from) * e;
      el.textContent = (decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString('ko-KR')) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- range bar ---------- */
  function runRange() {
    const cheap = S.cheapest, pricey = S.priciest;
    if (!cheap || !pricey) return;
    const min = cheap.price, max = pricey.price, med = S.medianPrice;
    const minL = document.getElementById('range-min-lbl');
    const maxL = document.getElementById('range-max-lbl');
    const fill = document.getElementById('range-fill');
    const marker = document.getElementById('range-median');
    if (minL) minL.textContent = '최저 ' + krw(min);
    if (maxL) maxL.textContent = '최고 ' + krw(max);
    if (fill) requestAnimationFrame(() => { fill.style.transform = 'scaleX(1)'; });
    if (marker) {
      const pct = ((med - min) / (max - min)) * 100;
      marker.style.left = (8 + pct * 0.84) + '%';
    }
  }

  /* ---------- charts ---------- */
  const chartRegistry = {};
  let created = {};

  function baseOptions(extra) {
    return Object.assign({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1100, easing: 'easeOutQuart' },
      plugins: {
        legend: { labels: { color: '#95a2c4', font: { family: 'Pretendard' } } },
        tooltip: {
          backgroundColor: 'rgba(10,14,26,.95)', borderColor: 'rgba(255,255,255,.1)', borderWidth: 1,
          titleColor: '#eef3ff', bodyColor: '#cfd9f5', padding: 12, cornerRadius: 10
        }
      },
      scales: {
        x: { ticks: { color: '#95a2c4' }, grid: { color: 'rgba(255,255,255,.06)' } },
        y: { ticks: { color: '#95a2c4' }, grid: { color: 'rgba(255,255,255,.06)' } }
      }
    }, extra || {});
  }

  const avgValueLabels = {
    id: 'avgValueLabels',
    afterDatasetsDraw(chart) {
      const { ctx } = chart;
      ctx.save();
      ctx.fillStyle = '#eef3ff';
      ctx.font = '700 14px Pretendard, sans-serif';
      ctx.textAlign = 'center';
      chart.getDatasetMeta(0).data.forEach((bar, i) => {
        ctx.fillText(krw(chart.data.datasets[0].data[i]), bar.x, bar.y - 10);
      });
      ctx.restore();
    }
  };

  function makeChart(id) {
    if (created[id]) return;
    const el = document.getElementById(id);
    if (!el) return;
    const stats = S.sourceStats || [];
    const labels = stats.map(s => labelOf(s.source));
    const colors = stats.map(s => COLORS[s.source]);

    if (id === 'chart-avg') {
      created[id] = new Chart(el, {
        type: 'bar',
        plugins: [avgValueLabels],
        data: {
          labels,
          datasets: [{
            label: '평균가(원)', data: stats.map(s => s.avg),
            backgroundColor: colors.map(c => c + 'cc'), borderColor: colors, borderWidth: 1.5,
            borderRadius: 12, maxBarThickness: 90
          }]
        },
        options: baseOptions({
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c) => ' 평균 ' + krw(c.raw) }, backgroundColor: 'rgba(10,14,26,.95)', padding: 12, cornerRadius: 10, titleColor: '#fff', bodyColor: '#cfd9f5' }
          },
          scales: {
            x: { ticks: { color: '#cfd9f5', font: { size: 15, weight: '600' } }, grid: { display: false } },
            y: { ticks: { color: '#95a2c4', callback: v => (v / 10000) + '만' }, grid: { color: 'rgba(255,255,255,.06)' } }
          }
        })
      });
    }

    if (id === 'chart-range') {
      const medians = stats.map(s => s.median);
      const medianMarker = {
        id: 'medianMarker',
        afterDatasetsDraw(chart) {
          const { ctx, scales } = chart;
          ctx.save();
          medians.forEach((m, i) => {
            if (m == null) return;
            const px = scales.x.getPixelForValue(m);
            const py = scales.y.getPixelForValue(i);
            ctx.beginPath();
            ctx.arc(px, py, 7, 0, Math.PI * 2);
            ctx.fillStyle = '#b6ff3d';
            ctx.strokeStyle = 'rgba(7,10,18,.9)';
            ctx.lineWidth = 3;
            ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#b6ff3d';
            ctx.font = '700 11px Pretendard, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('중앙값', px, py - 13);
          });
          ctx.restore();
        }
      };
      created[id] = new Chart(el, {
        type: 'bar',
        plugins: [medianMarker],
        data: {
          labels,
          datasets: [{
            label: '가격 레인지',
            data: stats.map(s => [s.min, s.max]),
            backgroundColor: colors.map(c => c + '99'),
            borderColor: colors,
            borderWidth: 1.5,
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 46,
            barPercentage: .6
          }]
        },
        options: baseOptions({
          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (c) => ` ${krw(c.raw[0])} ~ ${krw(c.raw[1])}` },
              backgroundColor: 'rgba(10,14,26,.95)', padding: 12, cornerRadius: 10, titleColor: '#fff', bodyColor: '#cfd9f5'
            }
          },
          scales: {
            x: { ticks: { color: '#95a2c4', callback: v => (v / 10000) + '만' }, grid: { color: 'rgba(255,255,255,.06)' } },
            y: { ticks: { color: '#cfd9f5', font: { weight: '600' } }, grid: { display: false } }
          }
        })
      });
    }

    if (id === 'chart-bucket') {
      const center = {
        id: 'centerText',
        afterDraw(chart) {
          const { ctx, chartArea } = chart;
          ctx.save();
          const cx = (chartArea.left + chartArea.right) / 2;
          const cy = (chartArea.top + chartArea.bottom) / 2;
          ctx.textAlign = 'center';
          ctx.fillStyle = '#eef3ff';
          ctx.font = '800 34px Pretendard, sans-serif';
          ctx.fillText(String(D.pricedCount), cx, cy - 2);
          ctx.fillStyle = '#95a2c4';
          ctx.font = '500 13px Pretendard, sans-serif';
          ctx.fillText('가격 확인 상품', cx, cy + 22);
          ctx.restore();
        }
      };
      created[id] = new Chart(el, {
        type: 'doughnut',
        plugins: [center],
        data: {
          labels: (S.priceBuckets || []).map(b => b.label),
          datasets: [{
            data: (S.priceBuckets || []).map(b => b.count),
            backgroundColor: BUCKET_COLORS, borderColor: 'rgba(10,14,26,.9)', borderWidth: 3,
            hoverOffset: 10
          }]
        },
        options: baseOptions({
          cutout: '58%',
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c) => ` ${c.label}: ${c.raw}개` }, backgroundColor: 'rgba(10,14,26,.95)', padding: 12, cornerRadius: 10, titleColor: '#fff', bodyColor: '#cfd9f5' }
          }
        })
      });
    }

    if (id === 'chart-brand') {
      const brands = (S.brands || []).slice(0, 8);
      created[id] = new Chart(el, {
        type: 'bar',
        data: {
          labels: brands.map(b => b.brand),
          datasets: [{
            label: '노출 수', data: brands.map(b => b.count),
            backgroundColor: brands.map((_, i) => `hsla(${90 + i * 26}, 90%, 60%, .85)`),
            borderRadius: 10, maxBarThickness: 26
          }]
        },
        options: baseOptions({
          indexAxis: 'y',
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: { label: (c) => ` ${c.raw}회 · 평균 ${krw((S.brands[c.dataIndex] || {}).avg)}` }, backgroundColor: 'rgba(10,14,26,.95)', padding: 12, cornerRadius: 10, titleColor: '#fff', bodyColor: '#cfd9f5' }
          },
          scales: {
            x: { ticks: { color: '#95a2c4', precision: 0 }, grid: { color: 'rgba(255,255,255,.06)' } },
            y: { ticks: { color: '#cfd9f5', font: { weight: '600' } }, grid: { display: false } }
          }
        })
      });
    }

    if (id === 'chart-scatter') {
      const rated = (D.items || []).filter(i => i.rating && i.reviews);
      const bySrc = {};
      rated.forEach(i => { (bySrc[i.source] = bySrc[i.source] || []).push(i); });
      created[id] = new Chart(el, {
        type: 'bubble',
        data: {
          datasets: Object.keys(bySrc).map(src => ({
            label: labelOf(src),
            data: bySrc[src].map(i => ({ x: i.reviews, y: i.rating, r: Math.max(6, 5 + (i.rating - 4) * 12), _n: i.name })),
            backgroundColor: COLORS[src] + 'aa',
            borderColor: COLORS[src],
            borderWidth: 1.5
          }))
        },
        options: baseOptions({
          plugins: {
            legend: { labels: { color: '#cfd9f5' } },
            tooltip: {
              callbacks: { label: (c) => [` ${c.raw._n}`, ` 리뷰 ${Number(c.raw.x).toLocaleString('ko-KR')} · 평점 ${c.raw.y}`] },
              backgroundColor: 'rgba(10,14,26,.95)', padding: 12, cornerRadius: 10, titleColor: '#fff', bodyColor: '#cfd9f5'
            }
          },
          scales: {
            x: { type: 'logarithmic', title: { display: true, text: '리뷰 수(로그)', color: '#95a2c4' }, ticks: { color: '#95a2c4' }, grid: { color: 'rgba(255,255,255,.06)' } },
            y: { min: 3.5, max: 5.1, title: { display: true, text: '평점', color: '#95a2c4' }, ticks: { color: '#95a2c4' }, grid: { color: 'rgba(255,255,255,.06)' } }
          }
        })
      });
    }
  }

  function initChartsIn(section) {
    section.querySelectorAll('canvas').forEach(c => makeChart(c.id));
    // trigger bar fills in this section
    section.querySelectorAll('.fill[data-w], .rl-fill[data-w]').forEach(f => {
      requestAnimationFrame(() => { f.style.width = f.dataset.w + '%'; });
    });
  }
  function destroyChartsIn(section) {
    section.querySelectorAll('canvas').forEach(c => {
      if (created[c.id]) { created[c.id].destroy(); delete created[c.id]; }
    });
    section.querySelectorAll('.fill[data-w], .rl-fill[data-w]').forEach(f => { f.style.width = '0'; });
  }

  /* ---------- anime.js enhancements ---------- */
  function hasAnime() { return typeof anime === 'function'; }

  function animateTitleArt() {
    if (!hasAnime()) return;
    const path = document.getElementById('chain-path');
    if (path) {
      path.style.strokeDashoffset = '1200';
      anime({ targets: path, strokeDashoffset: [1200, 0], duration: 1700, easing: 'easeInOutQuad' });
    }
    const nodes = document.querySelectorAll('#chain-nodes circle');
    if (nodes.length) {
      anime.remove(nodes);
      anime({ targets: nodes, opacity: [0, 1], scale: [0, 1], duration: 700, easing: 'easeOutBack', delay: anime.stagger(130, { start: 500 }) });
    }
  }

  function staggerList(section, selector) {
    if (!hasAnime()) return;
    const els = section.querySelectorAll(selector);
    if (!els.length) return;
    anime.remove(els);
    anime({ targets: els, translateX: [28, 0], opacity: [0, 1], duration: 620, easing: 'easeOutCubic', delay: anime.stagger(70) });
  }

  function animateSection(section) {
    if (!section) return;
    const kind = section.dataset ? section.dataset.slide : null;
    if (kind === 'title') animateTitleArt();
    if (kind === 'board') staggerList(section, '.rank-list li');
    if (kind === 'insight') staggerList(section, '.insight-card');
  }

  /* ---------- init ---------- */
  fillStatic();
  buildCleanFlow();
  buildSourceBars();
  buildBoards();
  buildInsights();
  buildBucketLegend();

  Chart.defaults.font.family = 'Pretendard, sans-serif';
  Chart.defaults.color = '#95a2c4';

  const deck = new Reveal({
    hash: true,
    controls: true,
    progress: true,
    center: false,
    transition: 'slide',
    transitionSpeed: 'slow',
    backgroundTransition: 'fade',
    width: 1280,
    height: 720,
    margin: 0.02
  });

  deck.initialize().then(() => {
    const cur = deck.getCurrentSlide();
    runCounts(cur); runRange(); initChartsIn(cur); animateSection(cur);

    deck.on('slidechanged', (e) => {
      if (e.previousSlide) destroyChartsIn(e.previousSlide);
      runCounts(e.currentSlide); runRange(); initChartsIn(e.currentSlide); animateSection(e.currentSlide);
    });
  });

  // expose for debugging
  window.__deck = deck;
})();
