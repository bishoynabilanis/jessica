/* Jessica — 60-second math challenge. Vanilla JS, no dependencies, no network. */
(function () {
  'use strict'

  var grade = document.body.getAttribute('data-grade') || 'prep-3'
  var gradeName = document.body.getAttribute('data-grade-name') || 'ثالثة إعدادي'
  var APP = 'https://bishoynabilanis.github.io/jessica/'

  var AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  function ar(value) {
    return String(value).replace(/[0-9]/g, function (d) {
      return AR_DIGITS[+d]
    })
  }
  function rnd(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  function pick(list) {
    return list[rnd(0, list.length - 1)]
  }

  function distractors(answer, count, spread, allowNegative) {
    var out = []
    var guard = 0
    while (out.length < count && guard++ < 200) {
      var delta = rnd(1, spread || 4) * (Math.random() < 0.5 ? -1 : 1)
      var candidate = answer + delta
      if (!allowNegative && candidate < 0) continue
      if (candidate === answer) continue
      if (out.indexOf(candidate) !== -1) continue
      out.push(candidate)
    }
    while (out.length < count) out.push(answer + out.length + 1)
    return out
  }

  function build(prompt, answer, wrongs, why, format) {
    return {
      q: prompt,
      answer: answer,
      wrongs: wrongs,
      why: why,
      format: format || ar,
    }
  }

  /* ---------- question banks, one generator per grade ---------- */

  var BANKS = {
    'primary-1': function () {
      var a = rnd(2, 9)
      var b = rnd(2, 9)
      if (Math.random() < 0.5) {
        var s = a + b
        return build('كم يساوي ' + ar(a) + ' + ' + ar(b) + ' ؟', s, distractors(s, 3, 3), ar(a) + ' + ' + ar(b) + ' = ' + ar(s))
      }
      if (b > a) {
        var t = a
        a = b
        b = t
      }
      var d = a - b
      return build('كم يساوي ' + ar(a) + ' − ' + ar(b) + ' ؟', d, distractors(d, 3, 3), ar(a) + ' − ' + ar(b) + ' = ' + ar(d))
    },
    'primary-2': function () {
      var kind = rnd(0, 2)
      if (kind === 0) {
        var a = rnd(15, 79)
        var b = rnd(11, 20)
        return build(ar(a) + ' + ' + ar(b) + ' = ؟', a + b, distractors(a + b, 3, 9), 'اجمع العشرات ثم الآحاد: ' + ar(a + b))
      }
      if (kind === 1) {
        var c = rnd(41, 99)
        var e = rnd(11, 40)
        return build(ar(c) + ' − ' + ar(e) + ' = ؟', c - e, distractors(c - e, 3, 9), 'اطرح الآحاد ثم العشرات: ' + ar(c - e))
      }
      var x = rnd(2, 5)
      var y = rnd(2, 5)
      return build(ar(x) + ' × ' + ar(y) + ' = ؟', x * y, distractors(x * y, 3, 3), ar(x) + ' × ' + ar(y) + ' = ' + ar(x * y))
    },
    'primary-3': function () {
      var kind = rnd(0, 2)
      if (kind === 0) {
        var a = rnd(3, 9)
        var b = rnd(3, 9)
        return build(ar(a) + ' × ' + ar(b) + ' = ؟', a * b, distractors(a * b, 3, 6), 'من جدول الضرب: ' + ar(a) + ' × ' + ar(b) + ' = ' + ar(a * b))
      }
      if (kind === 1) {
        var b2 = rnd(3, 9)
        var q = rnd(3, 9)
        var n = b2 * q
        return build(ar(n) + ' ÷ ' + ar(b2) + ' = ؟', q, distractors(q, 3, 3), ar(b2) + ' × ' + ar(q) + ' = ' + ar(n) + '، إذن القسمة = ' + ar(q))
      }
      var h = rnd(120, 480)
      var u = rnd(20, 90)
      return build(ar(h) + ' + ' + ar(u) + ' = ؟', h + u, distractors(h + u, 3, 20), 'اجمع الآحاد أولًا ثم العشرات والمئات: ' + ar(h + u))
    },
    'primary-4': function () {
      var kind = rnd(0, 2)
      if (kind === 0) {
        var a = rnd(12, 39)
        var b = rnd(3, 9)
        return build(ar(a) + ' × ' + ar(b) + ' = ؟', a * b, distractors(a * b, 3, 12), 'اضرب الآحاد ثم العشرات: ' + ar(a * b))
      }
      if (kind === 1) {
        var den = pick([5, 6, 7, 8, 9, 10])
        var n1 = rnd(1, den - 2)
        var n2 = rnd(1, den - n1)
        var sum = n1 + n2
        return build(
          ar(n1) + '/' + ar(den) + ' + ' + ar(n2) + '/' + ar(den) + ' = ؟',
          sum / den,
          [n1 / den, n2 / den, (sum + 1) / den],
          'المقام واحد، فنجمع البسط: ' + ar(n1) + ' + ' + ar(n2) + ' = ' + ar(sum) + '، الناتج ' + ar(sum) + '/' + ar(den),
          function (v) {
            return ar(Math.round(v * den)) + '/' + ar(den)
          },
        )
      }
      var w = rnd(4, 15)
      var h2 = rnd(3, 12)
      var p = 2 * (w + h2)
      return build(
        'مستطيل طوله ' + ar(w) + ' سم وعرضه ' + ar(h2) + ' سم. محيطه = ؟',
        p,
        distractors(p, 3, 6),
        'المحيط = ٢ × (الطول + العرض) = ٢ × ' + ar(w + h2) + ' = ' + ar(p) + ' سم',
      )
    },
    'primary-5': function () {
      var kind = rnd(0, 2)
      if (kind === 0) {
        var a = rnd(11, 89) / 10
        var b = rnd(11, 89) / 10
        var s = Math.round((a + b) * 10) / 10
        return build(
          ar(a.toFixed(1)) + ' + ' + ar(b.toFixed(1)) + ' = ؟',
          s,
          [Math.round((a + b + 0.1) * 10) / 10, Math.round((a + b - 0.1) * 10) / 10, Math.round((a + b + 1) * 10) / 10],
          'رتّب الفاصلة تحت الفاصلة: الناتج ' + ar(s.toFixed(1)),
          function (v) {
            return ar(v.toFixed(1))
          },
        )
      }
      if (kind === 1) {
        var pct = pick([10, 20, 25, 50, 75])
        var base = pick([40, 80, 120, 200, 240, 400])
        var ans = (pct / 100) * base
        return build(
          'كم يساوي ' + ar(pct) + '% من ' + ar(base) + ' ؟',
          ans,
          distractors(ans, 3, Math.max(4, Math.round(ans / 10))),
          ar(pct) + '% = ' + ar(pct) + '/١٠٠، والضرب في ' + ar(base) + ' يعطي ' + ar(ans),
        )
      }
      var w = rnd(4, 12)
      var h = rnd(3, 11)
      return build(
        'مساحة مستطيل طوله ' + ar(w) + ' سم وعرضه ' + ar(h) + ' سم = ؟',
        w * h,
        distractors(w * h, 3, 8),
        'المساحة = الطول × العرض = ' + ar(w * h) + ' سم²',
      )
    },
    'primary-6': function () {
      var kind = rnd(0, 3)
      if (kind === 0) {
        var pct = pick([5, 15, 20, 30, 40, 60])
        var base = pick([60, 120, 200, 300, 500, 800])
        var ans = (pct / 100) * base
        return build(
          ar(pct) + '% من ' + ar(base) + ' = ؟',
          ans,
          distractors(ans, 3, Math.max(5, Math.round(ans / 8))),
          ar(pct) + '% من ' + ar(base) + ' = ' + ar(pct) + '/١٠٠ × ' + ar(base) + ' = ' + ar(ans),
        )
      }
      if (kind === 1) {
        var parts = pick([2, 3, 4, 5])
        var unit = pick([10, 15, 20, 25, 40])
        var small = parts * unit
        var big = (parts + 1) * unit
        return build(
          'قسّمنا مبلغ بنسبة ' + ar(parts) + ' : ' + ar(parts + 1) + '، والنصيب الأصغر ' + ar(small) + ' جنيه. المبلغ الكلي = ؟',
          small + big,
          distractors(small + big, 3, unit * 2),
          'قيمة الجزء = ' + ar(small) + ' ÷ ' + ar(parts) + ' = ' + ar(unit) + '، والمجموع = ' + ar(small + big) + ' جنيه',
        )
      }
      if (kind === 2) {
        var nums = [rnd(10, 40), rnd(10, 40), rnd(10, 40), rnd(10, 40)]
        var sum = nums.reduce(function (x, y) {
          return x + y
        }, 0)
        if (sum % 4 !== 0) sum += 4 - (sum % 4)
        var avg = sum / 4
        return build(
          'متوسط الأعداد ' + nums.map(ar).join('، ') + ' = ؟',
          avg,
          distractors(avg, 3, 5),
          'المتوسط = مجموع الأعداد ÷ عددها = ' + ar(sum) + ' ÷ ٤ = ' + ar(avg),
        )
      }
      var a = rnd(2, 9)
      var b = rnd(2, 9)
      var c = rnd(2, 6)
      var ans2 = a + b * c
      return build(
        ar(a) + ' + ' + ar(b) + ' × ' + ar(c) + ' = ؟',
        ans2,
        distractors(ans2, 3, 6),
        'الضرب قبل الجمع: ' + ar(b) + ' × ' + ar(c) + ' = ' + ar(b * c) + '، ثم + ' + ar(a) + ' = ' + ar(ans2),
      )
    },
    'prep-1': function () {
      var kind = rnd(0, 3)
      if (kind === 0) {
        var a = rnd(-9, -2)
        var b = rnd(3, 12)
        var ans = a + b
        return build(ar(a) + ' + ' + ar(b) + ' = ؟', ans, distractors(ans, 3, 4, true), 'أضف ' + ar(b) + ' إلى ' + ar(a) + ' فتصل إلى ' + ar(ans))
      }
      if (kind === 1) {
        var x = rnd(2, 12)
        var b2 = rnd(2, 9)
        var c = x + b2
        return build('حل المعادلة: س + ' + ar(b2) + ' = ' + ar(c), x, distractors(x, 3, 3, true), 'اطرح ' + ar(b2) + ' من الطرفين: س = ' + ar(x))
      }
      if (kind === 2) {
        var base = pick([2, 3, 5, 10])
        var power = rnd(2, 3)
        var ans2 = Math.pow(base, power)
        return build(ar(base) + '^' + ar(power) + ' = ؟', ans2, distractors(ans2, 3, Math.max(3, Math.round(ans2 / 4))), ar(base) + ' مضروبة في نفسها ' + ar(power) + ' مرات = ' + ar(ans2))
      }
      var ang1 = rnd(30, 80)
      var ang2 = rnd(30, 80)
      var third = 180 - ang1 - ang2
      return build(
        'مثلث فيه زاويتان ' + ar(ang1) + '° و' + ar(ang2) + '°. الزاوية الثالثة = ؟',
        third,
        distractors(third, 3, 12),
        'مجموع زوايا المثلث ١٨٠°، إذن ١٨٠ − ' + ar(ang1 + ang2) + ' = ' + ar(third) + '°',
        function (v) {
          return ar(v) + '°'
        },
      )
    },
    'prep-2': function () {
      var kind = rnd(0, 3)
      if (kind === 0) {
        var a = rnd(2, 6)
        var b = rnd(2, 9)
        var c = rnd(1, 9)
        var ans = a * b + c
        return build(ar(a) + 'س + ' + ar(c) + ' عندما س = ' + ar(b) + ' = ؟', ans, distractors(ans, 3, 6), 'عوّض: ' + ar(a) + ' × ' + ar(b) + ' + ' + ar(c) + ' = ' + ar(ans))
      }
      if (kind === 1) {
        var root = rnd(4, 15)
        return build('√' + ar(root * root) + ' = ؟', root, distractors(root, 3, 3), ar(root) + ' × ' + ar(root) + ' = ' + ar(root * root))
      }
      if (kind === 2) {
        var tri = pick([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15]])
        var leg1 = tri[0]
        var leg2 = tri[1]
        return build(
          'مثلث قائم ضلعاه ' + ar(leg1) + ' سم و' + ar(leg2) + ' سم. الوتر = ؟',
          tri[2],
          distractors(tri[2], 3, 3),
          'فيثاغورس: ' + ar(leg1) + '² + ' + ar(leg2) + '² = ' + ar(leg1 * leg1 + leg2 * leg2) + '، والجذر = ' + ar(tri[2]),
        )
      }
      var x = rnd(2, 9)
      var a2 = rnd(2, 5)
      var b2 = rnd(1, 9)
      var c2 = a2 * x + b2
      return build('حل: ' + ar(a2) + 'س + ' + ar(b2) + ' = ' + ar(c2), x, distractors(x, 3, 3), 'اطرح ' + ar(b2) + ' ثم اقسم على ' + ar(a2) + ': س = ' + ar(x))
    },
    'prep-3': function () {
      var kind = rnd(0, 3)
      if (kind === 0) {
        var x = rnd(2, 9)
        var a = rnd(2, 5)
        var b = rnd(1, 9)
        var c = a * x + b
        return build('حل المعادلة: ' + ar(a) + 'س + ' + ar(b) + ' = ' + ar(c), x, distractors(x, 3, 3), 'اطرح ' + ar(b) + ' من الطرفين ثم اقسم على ' + ar(a) + ': س = ' + ar(x))
      }
      if (kind === 1) {
        var root = rnd(4, 14)
        return build('√' + ar(root * root) + ' = ؟', root, distractors(root, 3, 3), ar(root * root) + ' = ' + ar(root) + ' × ' + ar(root))
      }
      if (kind === 2) {
        var trig = pick([
          ['جا ٣٠°', 0.5, '١/٢'],
          ['جا ٩٠°', 1, '١'],
          ['جتا ٦٠°', 0.5, '١/٢'],
          ['جتا ٠°', 1, '١'],
        ])
        return build(trig[0] + ' = ؟', trig[1], [0, 0.75, 1.5], 'قيمة مشهورة في حساب المثلثات تساوي ' + trig[2], function () {
          return trig[2]
        })
      }
      var n1 = rnd(2, 6)
      var n2 = rnd(2, 6)
      var ans = n1 * n1 - n2 * n2
      return build(
        ar(n1) + '² − ' + ar(n2) + '² = ؟',
        ans,
        distractors(ans, 3, 6),
        'الفرق بين مربعين: (' + ar(n1) + ' − ' + ar(n2) + ')(' + ar(n1) + ' + ' + ar(n2) + ') = ' + ar(ans),
      )
    },
  }

  /* ---------- quiz engine ---------- */

  var TOTAL = 10
  var state = { index: 0, score: 0, questions: [], startedAt: 0, elapsed: 0, wrong: [], locked: false }

  var el = {
    stage: document.getElementById('quiz-stage'),
    start: document.getElementById('quiz-start'),
    startBtn: document.getElementById('quiz-start-btn'),
    play: document.getElementById('quiz-play'),
    result: document.getElementById('quiz-result'),
    counter: document.getElementById('quiz-counter'),
    timer: document.getElementById('quiz-timer'),
    bar: document.getElementById('quiz-bar'),
    prompt: document.getElementById('quiz-prompt'),
    choices: document.getElementById('quiz-choices'),
    feedback: document.getElementById('quiz-feedback'),
    next: document.getElementById('quiz-next'),
    score: document.getElementById('quiz-score'),
    time: document.getElementById('quiz-time'),
    tier: document.getElementById('quiz-tier'),
    review: document.getElementById('quiz-review'),
    share: document.getElementById('quiz-share'),
    copy: document.getElementById('quiz-copy'),
    retry: document.getElementById('quiz-retry'),
    best: document.getElementById('quiz-best'),
    card: document.getElementById('quiz-save-card'),
  }

  /* --- challenge links: /welcome/quiz/<grade>/?beat=8 --- */
  var params = new URLSearchParams(location.search)
  var challengeBeat = Math.max(0, Math.min(TOTAL, parseInt(params.get('beat') || '0', 10) || 0))
  var challengeFrom = (params.get('from') || '')
    .replace(/[^\p{L}\p{N} _-]/gu, '')
    .trim()
    .slice(0, 18)

  if (challengeBeat > 0 && el.start) {
    var challengeBanner = document.createElement('div')
    challengeBanner.className = 'quiz-challenge'
    challengeBanner.textContent =
      '🔥 ' + (challengeFrom || 'صاحبك') + ' جاب ' + ar(challengeBeat) + '/' + ar(TOTAL) + ' في الاختبار ده — تقدر تغلبه؟'
    el.start.insertBefore(challengeBanner, el.start.firstChild)
  }

  function makeQuestion() {
    var bank = BANKS[grade] || BANKS['prep-3']
    return bank()
  }

  function shuffle(list) {
    for (var i = list.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1))
      var tmp = list[i]
      list[i] = list[j]
      list[j] = tmp
    }
    return list
  }

  function formatTime(seconds) {
    var m = Math.floor(seconds / 60)
    var s = seconds % 60
    return ar(m) + ':' + (s < 10 ? '٠' : '') + ar(s)
  }

  function startQuiz() {
    var seen = []
    state = { index: 0, score: 0, questions: [], startedAt: Date.now(), elapsed: 0, wrong: [], locked: false }
    var guard = 0
    while (state.questions.length < TOTAL && guard++ < 400) {
      var q = makeQuestion()
      if (seen.indexOf(q.q) !== -1) continue
      seen.push(q.q)
      var values = shuffle([q.answer].concat(q.wrongs.slice(0, 3)))
      q.options = values.map(function (value) {
        return { value: value, label: q.format ? q.format(value) : ar(value), correct: value === q.answer }
      })
      state.questions.push(q)
    }
    el.start.hidden = true
    el.result.hidden = true
    el.play.hidden = false
    render()
  }

  function render() {
    var q = state.questions[state.index]
    state.locked = false
    el.counter.textContent = 'سؤال ' + ar(state.index + 1) + ' من ' + ar(TOTAL)
    el.bar.style.width = Math.round((state.index / TOTAL) * 100) + '%'
    el.prompt.textContent = q.q
    el.feedback.hidden = true
    el.feedback.className = 'quiz-feedback'
    el.next.hidden = true
    el.choices.innerHTML = ''
    q.options.forEach(function (option) {
      var button = document.createElement('button')
      button.type = 'button'
      button.className = 'quiz-choice'
      button.textContent = option.label
      button.dataset.correct = option.correct ? '1' : '0'
      button.addEventListener('click', function () {
        answer(button, option, q)
      })
      el.choices.appendChild(button)
    })
  }

  function answer(button, option, q) {
    if (state.locked) return
    state.locked = true
    var buttons = el.choices.querySelectorAll('.quiz-choice')
    Array.prototype.forEach.call(buttons, function (b) {
      b.disabled = true
      if (b.dataset.correct === '1') b.classList.add('is-correct')
    })
    if (option.correct) {
      state.score += 1
      button.classList.add('is-correct')
      el.feedback.className = 'quiz-feedback ok'
      el.feedback.textContent = 'صح ✅ ' + q.why
    } else {
      button.classList.add('is-wrong')
      state.wrong.push(q)
      el.feedback.className = 'quiz-feedback no'
      el.feedback.textContent = 'غلط ❌ الإجابة الصح: ' + (q.format ? q.format(q.answer) : ar(q.answer)) + ' — ' + q.why
    }
    el.feedback.hidden = false
    el.next.hidden = false
    el.next.textContent = state.index === TOTAL - 1 ? 'شوف نتيجتك' : 'السؤال التالي'
    el.next.focus({ preventScroll: true })
  }

  function next() {
    if (state.index === TOTAL - 1) return finish()
    state.index += 1
    render()
  }

  function finish() {
    state.elapsed = Math.max(1, Math.round((Date.now() - state.startedAt) / 1000))
    el.play.hidden = true
    el.result.hidden = false
    el.score.textContent = ar(state.score) + '/' + ar(TOTAL)
    el.time.textContent = formatTime(state.elapsed)
    var tier = state.score === TOTAL ? 'أسطورة رياضيات 🏆' : state.score >= 8 ? 'ممتاز 🔥' : state.score >= 6 ? 'كويس 👍 كمّل' : 'محتاج مراجعة 💪'
    el.tier.textContent = tier + ' — ' + gradeName
    el.bar.style.width = '100%'

    var best = 0
    try {
      best = Number(localStorage.getItem('jessica-quiz-' + grade) || 0)
      if (state.score > best) {
        localStorage.setItem('jessica-quiz-' + grade, String(state.score))
        best = state.score
      }
    } catch (err) {
      /* private mode */
    }
    if (best > 0) {
      el.best.textContent = 'أفضل نتيجة ليك في ' + gradeName + ': ' + ar(best) + '/' + ar(TOTAL)
      el.best.hidden = false
    }

    if (state.wrong.length) {
      el.review.hidden = false
      el.review.innerHTML =
        '<h3>راجع الغلطات دي</h3>' +
        state.wrong
          .map(function (q) {
            return '<div class="quiz-review-item"><strong>' + q.q + '</strong><span>' + (q.format ? q.format(q.answer) : ar(q.answer)) + ' — ' + q.why + '</span></div>'
          })
          .join('')
    } else {
      el.review.hidden = true
    }

    var url = location.origin + location.pathname
    var challengeUrl = url + '?beat=' + state.score
    var shareUrl = challengeBeat > 0 ? challengeUrl : url

    if (challengeBeat > 0) {
      var verdict = document.createElement('p')
      verdict.className = 'quiz-challenge-verdict'
      var rival = challengeFrom || 'صاحبك'
      var diff = state.score - challengeBeat
      if (diff > 0) {
        verdict.textContent = '💥 كسرت التحدي! ' + ar(state.score) + ' مقابل ' + ar(challengeBeat) + ' لـ' + rival
      } else if (diff === 0) {
        verdict.textContent = '🤝 تعادل ' + ar(state.score) + ' مقابل ' + ar(challengeBeat) + ' — إجابة واحدة كانت كفاية تغلبه'
      } else if (challengeBeat >= TOTAL) {
        verdict.textContent = '😅 ' + rival + ' جاب ' + ar(challengeBeat) + '/' + ar(TOTAL) + ' — التعادل هو أقصى حاجة توصلها'
      } else {
        verdict.textContent =
          'لسه محتاج ' + ar(challengeBeat - state.score + 1) + ' إجابة صح عشان تغلب ' + rival + ' (' + ar(challengeBeat) + '/' + ar(TOTAL) + ')'
      }
      el.score.insertAdjacentElement('afterend', verdict)
    }

    var text =
      'جبت ' + ar(state.score) + '/' + ar(TOTAL) + ' في اختبار رياضيات ' + gradeName + ' في ' + formatTime(state.elapsed) + ' ⏱️\n' +
      (challengeBeat > 0 ? 'تحدي مستمر — ' : '') + 'تقدر تجيب أكتر؟ جرّب الاختبار المجاني 👇\n' + shareUrl
    var encoded = encodeURIComponent(text)
    el.share.href = 'https://wa.me/?text=' + encoded
    el.copy.onclick = function () {
      if (navigator.clipboard) navigator.clipboard.writeText(text)
      el.copy.textContent = 'اتنسخ ✅'
    }
    if (el.card) el.card.onclick = function () {
      saveCard()
    }
    el.result.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function saveCard() {
    var canvas = document.createElement('canvas')
    canvas.width = 1080
    canvas.height = 1350
    var ctx = canvas.getContext('2d')
    var grad = ctx.createLinearGradient(0, 0, 1080, 1350)
    grad.addColorStop(0, '#080d1a')
    grad.addColorStop(0.55, '#0d1b2e')
    grad.addColorStop(1, '#08131d')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1080, 1350)

    ctx.fillStyle = 'rgba(46,230,197,0.10)'
    ctx.beginPath()
    ctx.arc(920, 170, 320, 0, Math.PI * 2)
    ctx.fill()

    ctx.direction = 'rtl'
    ctx.textAlign = 'center'
    ctx.fillStyle = '#2ee6c5'
    ctx.font = '800 46px Cairo, system-ui, sans-serif'
    ctx.fillText('Jessica', 540, 150)

    ctx.fillStyle = '#eef3ff'
    ctx.font = '700 42px Cairo, system-ui, sans-serif'
    ctx.fillText('اختبار رياضيات ' + gradeName, 540, 250)

    ctx.fillStyle = '#ffffff'
    ctx.font = '900 210px Cairo, system-ui, sans-serif'
    ctx.fillText(ar(state.score) + '/' + ar(TOTAL), 540, 560)

    ctx.fillStyle = '#98a6bf'
    ctx.font = '700 38px Cairo, system-ui, sans-serif'
    ctx.fillText('الوقت: ' + formatTime(state.elapsed), 540, 660)

    var tier = state.score === TOTAL ? 'أسطورة رياضيات 🏆' : state.score >= 8 ? 'ممتاز 🔥' : state.score >= 6 ? 'كويس 👍' : 'محتاج مراجعة 💪'
    ctx.fillStyle = '#ffd166'
    ctx.font = '800 54px Cairo, system-ui, sans-serif'
    ctx.fillText(tier, 540, 780)

    ctx.fillStyle = 'rgba(255,255,255,0.10)'
    ctx.fillRect(140, 860, 800, 2)

    ctx.fillStyle = '#eef3ff'
    ctx.font = '700 40px Cairo, system-ui, sans-serif'
    ctx.fillText('تقدر تجيب أكتر؟', 540, 960)
    ctx.fillStyle = '#2ee6c5'
    ctx.font = '700 34px Cairo, system-ui, sans-serif'
    ctx.fillText('bishoynabilanis.github.io/jessica', 540, 1030)

    ctx.fillStyle = '#98a6bf'
    ctx.font = '600 30px Cairo, system-ui, sans-serif'
    ctx.fillText('مجاني · بدون تسجيل · من كتب الوزارة', 540, 1120)

    var link = document.createElement('a')
    link.download = 'jessica-quiz-' + grade + '.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  if (el.startBtn) el.startBtn.addEventListener('click', startQuiz)
  if (el.next) el.next.addEventListener('click', next)
  if (el.retry)
    el.retry.addEventListener('click', function () {
      startQuiz()
    })

  window.setInterval(function () {
    if (el.play.hidden || !state.startedAt) return
    el.timer.textContent = formatTime(Math.round((Date.now() - state.startedAt) / 1000))
  }, 500)
})()
