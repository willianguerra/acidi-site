/* ACIDI · site demonstrativo. Sem dependências; nada é enviado ou armazenado. */
(function (root) {
  'use strict';

  // ---------- lógica pura (testada em testes/logica.test.js) ----------

  function isoLocal(d) {
    var m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  // Retorna a mensagem de erro do primeiro critério que falhar, ou '' se o valor for válido.
  function validate(rules, value, todayIso, label) {
    var v = (value || '').trim();
    if (rules.indexOf('required') > -1 && !v) return 'Preencha o campo ' + label + '.';
    if (!v) return '';
    if (rules.indexOf('email') > -1 && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Informe um e-mail válido, como nome@empresa.com.br.';
    if (rules.indexOf('phone') > -1) {
      var digits = v.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 13) return 'Informe o telefone com DDD, como (47) 3333-8786.';
    }
    if (rules.indexOf('date-future') > -1) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return 'Informe uma data válida.';
      if (v < todayIso) return 'Escolha uma data a partir de hoje.';
    }
    var min = /min(\d+)/.exec(rules);
    if (min && v.length < +min[1]) return 'Escreva pelo menos ' + min[1] + ' caracteres.';
    return '';
  }

  // Separa eventos (com .date em AAAA-MM-DD) em próximos (crescente) e arquivo (decrescente).
  function splitEvents(events, todayIso) {
    var up = [], past = [];
    events.forEach(function (e) { (e.date >= todayIso ? up : past).push(e); });
    up.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    past.sort(function (a, b) { return a.date > b.date ? -1 : 1; });
    return { upcoming: up, past: past };
  }

  var api = { validate: validate, splitEvents: splitEvents, isoLocal: isoLocal };
  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }

  // ---------- interface ----------
  var doc = root.document, today = isoLocal(new Date());

  // Menus suspensos do desktop
  var dds = [].slice.call(doc.querySelectorAll('nav.main .dd > button'));
  function panelOf(b) { return doc.getElementById(b.getAttribute('aria-controls')); }
  function closeAll(except) {
    dds.forEach(function (b) { if (b !== except) { b.setAttribute('aria-expanded', 'false'); panelOf(b).hidden = true; } });
  }
  dds.forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = b.getAttribute('aria-expanded') === 'true';
      closeAll(b);
      b.setAttribute('aria-expanded', String(!open));
      panelOf(b).hidden = open;
    });
    panelOf(b).addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeAll(); b.focus(); }
    });
  });
  doc.addEventListener('click', function (e) { if (!e.target.closest('nav.main .dd')) closeAll(); });
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      var openBtn = dds.filter(function (b) { return b.getAttribute('aria-expanded') === 'true'; })[0];
      if (openBtn) { closeAll(); openBtn.focus(); }
    }
  });
  doc.addEventListener('focusin', function (e) { if (!e.target.closest('nav.main .dd')) closeAll(); });

  // Menu móvel em <dialog> modal
  var sheet = doc.getElementById('menu-movel'), burger = doc.querySelector('header.site .burger');
  if (sheet && burger && sheet.showModal) {
    burger.addEventListener('click', function () {
      sheet.showModal(); burger.setAttribute('aria-expanded', 'true');
    });
    sheet.addEventListener('close', function () { burger.setAttribute('aria-expanded', 'false'); burger.focus(); });
    sheet.addEventListener('click', function (e) {
      if (e.target === sheet || e.target.closest('[data-fechar]')) sheet.close();
      var a = e.target.closest('a[href^="#"]');
      if (a) sheet.close();
    });
  }

  // Agenda: próximos x arquivo pela data de hoje
  [].forEach.call(doc.querySelectorAll('[data-agenda]'), function (box) {
    var items = [].slice.call(box.querySelectorAll('[data-date]'));
    var s = splitEvents(items.map(function (el) { return { date: el.getAttribute('data-date'), el: el }; }), today);
    var upList = box.querySelector('[data-upcoming]'), pastList = box.querySelector('[data-past]'), empty = box.querySelector('[data-empty]');
    s.upcoming.forEach(function (e) { e.el.hidden = !upList; if (upList) upList.appendChild(e.el); });
    s.past.forEach(function (e) { e.el.hidden = !pastList; if (pastList) pastList.appendChild(e.el); });
    if (upList) upList.hidden = !s.upcoming.length;
    if (empty) empty.hidden = !!s.upcoming.length;
    var count = box.querySelector('[data-past-count]');
    if (count) count.textContent = s.past.length;
  });

  // Formulários demonstrativos
  [].forEach.call(doc.querySelectorAll('form.demo'), function (form) {
    var summary = form.querySelector('.err-summary'), done = form.querySelector('.done');
    var fields = [].slice.call(form.querySelectorAll('[data-rules]'));
    fields.forEach(function (f) {
      if (/date-future/.test(f.getAttribute('data-rules'))) f.min = today;
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') check(f); });
      f.addEventListener('blur', function () { if (f.value) check(f); });
    });
    function check(f) {
      var label = f.getAttribute('data-label') || 'este campo';
      var value = f.type === 'checkbox' ? (f.checked ? 'sim' : '') : f.value;
      var msg = validate(f.getAttribute('data-rules'), value, today, label);
      var err = doc.getElementById(f.id + '-erro');
      f.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg;
      return msg;
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      done.hidden = true;
      var problems = [];
      fields.forEach(function (f) { var m = check(f); if (m) problems.push({ f: f, m: m }); });
      if (problems.length) {
        summary.innerHTML = '<h2>Corrija ' + (problems.length === 1 ? '1 campo' : problems.length + ' campos') + ' para concluir a demonstração</h2><ul>' +
          problems.map(function (p) { return '<li><a href="#' + p.f.id + '">' + p.m + '</a></li>'; }).join('') + '</ul>';
        summary.hidden = false;
        summary.focus();
        return;
      }
      summary.hidden = true;
      done.hidden = false;
      done.focus();
    });
    summary.addEventListener('click', function (e) {
      var a = e.target.closest('a'); if (!a) return;
      e.preventDefault(); var t = doc.getElementById(a.getAttribute('href').slice(1)); if (t) t.focus();
    });
  });

  var reduzido = root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IO = root.IntersectionObserver;

  // Composições que se desenham uma vez ao entrar na tela (atuação, fechamento). Sem IO ou com movimento reduzido: estado final.
  var anims = [].slice.call(doc.querySelectorAll('[data-anim]'));
  if (reduzido || !IO) anims.forEach(function (el) { el.classList.add('on'); });
  else {
    var io = new IO(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
    }, { threshold: 0.35 });
    anims.forEach(function (el) { io.observe(el); });
  }

  // Barra fixa do celular: escondida enquanto uma chamada de associação [data-cta] está visível
  var ctas = [].slice.call(doc.querySelectorAll('[data-cta]'));
  if (ctas.length && IO) {
    var vis = new Set();
    var ioc = new IO(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) vis.add(e.target); else vis.delete(e.target); });
      doc.body.classList.toggle('cta-vis', vis.size > 0);
    });
    ctas.forEach(function (el) { ioc.observe(el); });
  }

  // Serviços da home: desktop = lista + painel único; celular = lista expansível (um aberto por vez)
  var estreito = root.matchMedia('(max-width: 760px)');
  [].forEach.call(doc.querySelectorAll('[data-svx]'), function (box) {
    var btns = [].slice.call(box.querySelectorAll('.svx-b')), mark = box.querySelector('.svx-mark'), atual = -1;
    function painel(b) { return doc.getElementById(b.getAttribute('aria-controls')); }
    function marcar() {
      if (atual < 0 || estreito.matches) return;
      var b = btns[atual];
      box.style.setProperty('--cw', b.offsetWidth + 'px');
      mark.style.setProperty('--y', b.parentNode.offsetTop + 'px');
      mark.style.setProperty('--h', b.offsetHeight + 'px');
    }
    function escolher(i) {
      if (i === atual) {
        if (!estreito.matches) return;
        i = -1; // no celular, tocar no item aberto fecha
      }
      box.setAttribute('data-dir', i < atual ? 'up' : 'down');
      btns.forEach(function (b, k) {
        var p = painel(b), on = k === i;
        b.setAttribute('aria-expanded', String(on));
        p.classList.toggle('on', on);
        p.inert = !on;
      });
      atual = i;
      marcar();
    }
    btns.forEach(function (b, k) {
      b.addEventListener('click', function () { escolher(k); });
      b.addEventListener('keydown', function (e) {
        var alvo = { ArrowDown: k + 1, ArrowUp: k - 1, Home: 0, End: btns.length - 1 }[e.key];
        if (alvo === undefined) return;
        e.preventDefault();
        btns[(alvo + btns.length) % btns.length].focus();
      });
    });
    function modo() {
      if (!estreito.matches && atual < 0) escolher(0); else marcar();
    }
    escolher(estreito.matches ? -1 : 0);
    if (estreito.addEventListener) estreito.addEventListener('change', modo);
    root.addEventListener('resize', marcar);
    // ativa as transições só depois do primeiro estado, para não animar o carregamento
    root.requestAnimationFrame(function () { box.classList.add('pronto'); marcar(); });
  });

  // Galeria do auditório: troca só por ação da pessoa (miniatura, botões ou setas)
  [].forEach.call(doc.querySelectorAll('[data-gv]'), function (gv) {
    var main = gv.querySelector('.gv-main img'), th = [].slice.call(gv.querySelectorAll('.gv-th a'));
    var cont = gv.querySelector('.gv-c b'), txt = gv.querySelector('.gv-t'), nav = gv.querySelector('.gv-nav'), i = 0;
    function ver(k) {
      i = (k + th.length) % th.length;
      var a = th[i], img = a.querySelector('img');
      th.forEach(function (t) { t.removeAttribute('aria-current'); });
      a.setAttribute('aria-current', 'true');
      function trocar() {
        main.src = a.getAttribute('href'); main.alt = img.alt; main.style.objectPosition = a.getAttribute('data-pos');
        cont.textContent = i + 1; txt.textContent = img.alt;
        main.classList.remove('troca');
      }
      if (reduzido) return trocar();
      main.classList.add('troca');
      setTimeout(trocar, 160);
    }
    nav.hidden = false;
    th.forEach(function (a, k) { a.addEventListener('click', function (e) { e.preventDefault(); ver(k); }); });
    gv.querySelector('.gv-prev').addEventListener('click', function () { ver(i - 1); });
    gv.querySelector('.gv-next').addEventListener('click', function () { ver(i + 1); });
    gv.addEventListener('keydown', function (e) {
      if (e.target.closest('.gv-th, .gv-nav') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault(); ver(i + (e.key === 'ArrowRight' ? 1 : -1));
      }
    });
  });
})(typeof window !== 'undefined' ? window : this);
