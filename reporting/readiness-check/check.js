/* Reporting readiness check: scores the twelve answers in the browser.

   The page works without this file: the questions and the email fields are
   plain form controls and the form posts natively. With it, the visitor sees
   a level, a score out of 24 and the three lowest-scoring questions by their
   gap names before leaving an email.

   All wording lives in the page markup. Each question is a fieldset.rc-q with
   data-q (its number) and data-gap (its gap name); each level is a row in
   table.rc-key with data-min, data-max and data-line. A new question set is
   a new page of markup, with no change here. */

(function () {
  var form = document.getElementById('readiness-form');
  if (!form) return;

  var questions = Array.prototype.slice.call(form.querySelectorAll('.rc-q'));
  var go = form.querySelector('[data-go]');
  var see = form.querySelector('[data-see]');
  var count = form.querySelector('[data-count]');
  var result = form.querySelector('[data-result]');
  var send = document.getElementById('readiness-send');
  var levelEl = form.querySelector('[data-level]');
  var scoreEl = form.querySelector('[data-score]');
  var lineEl = form.querySelector('[data-line]');
  var gapsHead = form.querySelector('[data-gaps-head]');
  var gapsEl = form.querySelector('[data-gaps]');
  var levels = Array.prototype.slice.call(form.querySelectorAll('.rc-key tr'));
  var shown = false;

  // With scripting on, the result comes before the email fields.
  go.hidden = false;
  send.hidden = true;

  function points(q) {
    var picked = q.querySelector('input:checked');
    return picked ? parseInt(picked.value, 10) : null;
  }

  function answered() {
    return questions.filter(function (q) { return points(q) !== null; }).length;
  }

  function render() {
    var total = 0;
    var rows = questions.map(function (q, i) {
      var p = points(q);
      total += p;
      return { n: q.getAttribute('data-q'), gap: q.getAttribute('data-gap'), cost: q.getAttribute('data-cost') || '', p: p, i: i };
    });

    // The three lowest-scoring questions that lost points; ties go to the earlier question.
    var gaps = rows.filter(function (r) { return r.p < 2; })
      .sort(function (a, b) { return a.p - b.p || a.i - b.i; })
      .slice(0, 3);

    var level = '';
    levels.forEach(function (row) {
      var on = total >= +row.getAttribute('data-min') && total <= +row.getAttribute('data-max');
      if (on) {
        row.setAttribute('aria-current', 'true');
        level = row.querySelector('th').textContent;
        lineEl.textContent = row.getAttribute('data-line');
      } else {
        row.removeAttribute('aria-current');
      }
    });

    levelEl.textContent = level;
    scoreEl.textContent = total;

    gapsEl.textContent = '';
    gaps.forEach(function (g) {
      var li = document.createElement('li');
      li.className = 'build';
      var box = document.createElement('div');
      var from = document.createElement('span');
      from.className = 'proof-state';
      from.textContent = 'question ' + g.n;
      var name = document.createElement('h4');
      name.className = 'rc-gap';
      name.textContent = g.gap;
      box.appendChild(from);
      box.appendChild(name);
      // One sentence on what the gap usually costs an agency, once he has said
      // it: data-cost on the question's fieldset. Until then the name stands alone.
      if (g.cost) {
        var cost = document.createElement('p');
        cost.textContent = g.cost;
        box.appendChild(cost);
      }
      li.appendChild(box);
      gapsEl.appendChild(li);
    });

    gapsHead.hidden = gaps.length === 0;
    gapsEl.hidden = gaps.length === 0;
    gapsHead.textContent = gaps.length === 3 ? 'Your three biggest gaps'
      : gaps.length === 1 ? 'Your biggest gap' : 'Your biggest gaps';

    form.elements['score'].value = total;
    form.elements['level'].value = level;
    form.elements['gaps'].value = gaps.map(function (g) { return g.n + '. ' + g.gap; }).join('; ');
  }

  form.addEventListener('change', function (event) {
    if (!event.target.matches('.rc-q input')) return;
    var q = event.target.closest('.rc-q');
    q.querySelector('.rc-need').hidden = true;
    count.textContent = answered();
    if (shown) render();
  });

  see.addEventListener('click', function () {
    var missing = questions.filter(function (q) { return points(q) === null; });
    if (missing.length) {
      missing.forEach(function (q) { q.querySelector('.rc-need').hidden = false; });
      missing[0].scrollIntoView({ block: 'center' });
      missing[0].querySelector('input').focus({ preventScroll: true });
      return;
    }
    render();
    shown = true;
    result.hidden = false;
    send.hidden = false;
    levelEl.scrollIntoView({ block: 'start' });
    levelEl.focus({ preventScroll: true });
  });

  count.textContent = answered();
})();
