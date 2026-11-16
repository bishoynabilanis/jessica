/* Jessica — the English 60-second maths test. Vanilla JS, no network, no account. */
(function () {
  'use strict'

  var rnd = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
  var pick = function (list) {
    return list[rnd(0, list.length - 1)]
  }

  function distractors(answer, count, spread, allowNegative) {
    var out = []
    var guard = 0
    while (out.length < count && guard++ < 300) {
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

  function q(prompt, answer, wrongs, why, format) {
    return { q: prompt, answer: answer, wrongs: wrongs, why: why, format: format || String }
  }

  var round1 = function (value) {
    return Math.round(value * 10) / 10
  }

  /* ---------- one generator per grade ---------- */

  var BANKS = {
    'primary-1': [
      function () {
        var a = rnd(2, 9), b = rnd(2, 9)
        return q(a + ' + ' + b + ' = ?', a + b, distractors(a + b, 3, 3), a + ' + ' + b + ' = ' + (a + b))
      },
      function () {
        var a = rnd(5, 18), b = rnd(1, a - 1)
        return q(a + ' − ' + b + ' = ?', a - b, distractors(a - b, 3, 3), a + ' − ' + b + ' = ' + (a - b))
      },
      function () {
        var a = rnd(1, 10), b = rnd(1, 10 - a)
        return q('What number fills the gap? ' + a + ' + ▢ = 10', 10 - a, distractors(10 - a, 3, 2), a + ' + ' + (10 - a) + ' = 10')
      },
    ],
    'primary-2': [
      function () {
        var a = rnd(15, 79), b = rnd(11, 20)
        return q(a + ' + ' + b + ' = ?', a + b, distractors(a + b, 3, 9), 'Add the tens, then the units: ' + (a + b))
      },
      function () {
        var a = rnd(41, 99), b = rnd(11, 40)
        return q(a + ' − ' + b + ' = ?', a - b, distractors(a - b, 3, 9), 'Subtract the units, then the tens: ' + (a - b))
      },
      function () {
        var a = rnd(2, 5), b = rnd(2, 5)
        return q(a + ' × ' + b + ' = ?', a * b, distractors(a * b, 3, 3), a + ' × ' + b + ' = ' + (a * b))
      },
    ],
    'primary-3': [
      function () {
        var a = rnd(3, 9), b = rnd(3, 9)
        return q(a + ' × ' + b + ' = ?', a * b, distractors(a * b, 3, 6), 'From the times table: ' + a + ' × ' + b + ' = ' + (a * b))
      },
      function () {
        var b = rnd(3, 9), quotient = rnd(3, 9), n = b * quotient
        return q(n + ' ÷ ' + b + ' = ?', quotient, distractors(quotient, 3, 3), b + ' × ' + quotient + ' = ' + n + ', so the quotient is ' + quotient)
      },
      function () {
        var a = rnd(120, 480), b = rnd(20, 90)
        return q(a + ' + ' + b + ' = ?', a + b, distractors(a + b, 3, 20), 'Add the units first, then tens and hundreds: ' + (a + b))
      },
    ],
    'primary-4': [
      function () {
        var a = rnd(12, 39), b = rnd(3, 9)
        return q(a + ' × ' + b + ' = ?', a * b, distractors(a * b, 3, 12), 'Multiply the units, then the tens: ' + (a * b))
      },
      function () {
        var den = pick([5, 6, 7, 8, 9, 10])
        var n1 = rnd(1, den - 2)
        var n2 = rnd(1, den - n1)
        var sum = n1 + n2
        return q(
          n1 + '/' + den + ' + ' + n2 + '/' + den + ' = ?',
          sum / den,
          [n1 / den, n2 / den, (sum + 1) / den],
          'The denominators match, so add the numerators: ' + n1 + ' + ' + n2 + ' = ' + sum + ', giving ' + sum + '/' + den,
          function (value) {
            return Math.round(value * den) + '/' + den
          },
        )
      },
      function () {
        var w = rnd(4, 15), h = rnd(3, 12), p = 2 * (w + h)
        return q('A rectangle is ' + w + ' cm by ' + h + ' cm. What is its perimeter?', p, distractors(p, 3, 6), 'Perimeter = 2 × (' + w + ' + ' + h + ') = ' + p + ' cm')
      },
    ],
    'primary-5': [
      function () {
        var a = rnd(11, 89) / 10, b = rnd(11, 89) / 10
        var s = round1(a + b)
        return q(a.toFixed(1) + ' + ' + b.toFixed(1) + ' = ?', s, [round1(a + b + 0.1), round1(a + b - 0.1), round1(a + b + 1)], 'Line up the decimal points: the answer is ' + s.toFixed(1), function (v) { return v.toFixed(1) })
      },
      function () {
        var w = rnd(4, 12), h = rnd(3, 9), area = w * h
        return q('A rectangle is ' + w + ' cm by ' + h + ' cm. What is its area?', area, distractors(area, 3, 8), 'Area = length × width = ' + w + ' × ' + h + ' = ' + area + ' cm²')
      },
      function () {
        var whole = rnd(20, 90), part = rnd(2, 9) * 10
        var percent = (part / whole) * 100
        var answer = Math.round(percent)
        return q('What is ' + part + ' out of ' + whole + ' as a percentage (rounded)?', answer, distractors(answer, 3, 6), part + ' ÷ ' + whole + ' × 100 ≈ ' + answer + '%', function (v) { return v + '%' })
      },
    ],
    'primary-6': [
      function () {
        var price = rnd(80, 400), percent = pick([10, 20, 25, 50])
        var off = Math.round((price * percent) / 100)
        return q('A book costs ' + price + ' EGP with ' + percent + '% off. How much is the discount?', off, distractors(off, 3, 12), percent + '% of ' + price + ' = ' + off + ' EGP')
      },
      function () {
        var a = rnd(2, 6), b = rnd(2, 6), c = rnd(2, 6)
        return q('Simplify the ratio ' + a * 2 + ' : ' + b * 2, a + ':' + b, [b + ':' + a, a + 1 + ':' + b, a + ':' + (b + 1)], 'Divide both sides by 2 to get ' + a + ' : ' + b, null)
      },
      function () {
        var base = rnd(4, 12), height = rnd(4, 10)
        return q('A triangle has a base of ' + base + ' cm and a height of ' + height + ' cm. What is its area?', (base * height) / 2, distractors((base * height) / 2, 3, 6), 'Area = ½ × ' + base + ' × ' + height + ' = ' + (base * height) / 2 + ' cm²')
      },
    ],
    'prep-1': [
      function () {
        var a = rnd(2, 12), b = rnd(2, 12)
        return q('(−' + a + ') + ' + b + ' = ?', b - a, distractors(b - a, 3, 4, true), 'The bigger number keeps its sign: ' + b + ' − ' + a + ' = ' + (b - a), null)
      },
      function () {
        var x = rnd(2, 9), a = rnd(2, 6), b = rnd(1, 20)
        return q(a + 'x + ' + b + ' = ' + (a * x + b) + '. What is x?', x, distractors(x, 3, 2), 'Subtract ' + b + ', then divide by ' + a + ': x = ' + x, null)
      },
      function () {
        var total = rnd(40, 120), ratio = pick([2, 3, 4, 5])
        var share = total / (ratio + 1)
        return q('Split ' + total + ' EGP between two friends in the ratio 1 : ' + ratio + '. What is the smaller share?', share, distractors(share, 3, 6), total + ' ÷ ' + (ratio + 1) + ' = ' + share + ' EGP')
      },
    ],
    'prep-2': [
      function () {
        var x = rnd(2, 8), a = rnd(2, 5), b = rnd(3, 15)
        return q('Solve: ' + a + '(x + ' + b + ') = ' + a * (x + b), x, distractors(x, 3, 2), 'Divide by ' + a + ' then subtract ' + b + ': x = ' + x, null)
      },
      function () {
        var a = rnd(2, 6), b = rnd(2, 6)
        return q(a + '² + ' + b + '² = ?', a * a + b * b, distractors(a * a + b * b, 3, 5), a + '² = ' + a * a + ' and ' + b + '² = ' + b * b + ', so the total is ' + (a * a + b * b))
      },
      function () {
        var a = rnd(3, 9), b = rnd(4, 12)
        var c = Math.sqrt(a * a + b * b)
        var answer = Math.round(c * 10) / 10
        return q('A right triangle has legs ' + a + ' cm and ' + b + ' cm. How long is the hypotenuse (1 decimal)?', answer, [round1(answer + 0.7), round1(answer - 0.8), round1(answer + 2)], 'c² = ' + a * a + ' + ' + b * b + ' = ' + (a * a + b * b) + ', so c ≈ ' + answer, function (v) { return v.toFixed(1) })
      },
    ],
    'prep-3': [
      function () {
        var x = rnd(2, 9), a = rnd(2, 6), b = rnd(2, 12)
        return q(a + 'x − ' + b + ' = ' + (a * x - b) + '. What is x?', x, distractors(x, 3, 2), 'Add ' + b + ' then divide by ' + a + ': x = ' + x, null)
      },
      function () {
        var values = []
        var base = rnd(4, 12)
        for (var i = 0; i < 4; i++) values.push(base + rnd(-2, 2))
        var mean = values.reduce(function (sum, v) { return sum + v }, 0) / 4
        var answer = Math.round(mean * 10) / 10
        return q('Four marks: ' + values.join(', ') + '. What is the mean (1 decimal)?', answer, [round1(answer + 0.5), round1(answer - 0.6), round1(answer + 1.2)], 'Sum them and divide by 4: ' + answer, function (v) { return v.toFixed(1) })
      },
      function () {
        var base = rnd(2, 5), power = rnd(2, 3), root = pick([4, 9, 16, 25, 36, 49, 64, 81])
        var answer = Math.pow(base, power) + Math.sqrt(root)
        return q(base + '^' + power + ' + √' + root + ' = ?', answer, distractors(answer, 3, 5), base + '^' + power + ' = ' + Math.pow(base, power) + ' and √' + root + ' = ' + Math.sqrt(root) + ', total ' + answer)
      },
    ],
  }

  var GRADES = {
    'primary-1': 'Primary 1',
    'primary-2': 'Primary 2',
    'primary-3': 'Primary 3',
    'primary-4': 'Primary 4',
    'primary-5': 'Primary 5',
    'primary-6': 'Primary 6',
    'prep-1': 'Preparatory 1',
    'prep-2': 'Preparatory 2',
    'prep-3': 'Preparatory 3',
  }

  var TOTAL = 10
  var state = { grade: 'primary-4', questions: [], index: 0, score: 0, answers: [], startedAt: 0 }

  function buildQuestions(grade) {
    var generators = BANKS[grade] || BANKS['primary-4']
    var built = []
    var seen = []
    var guard = 0
    while (built.length < TOTAL && guard++ < 400) {
      var item = pick(generators)()
      if (seen.indexOf(item.q) !== -1) continue
      seen.push(item.q)
      var options = [item.answer].concat(item.wrongs).map(function (value) {
        return { value: value, label: (item.format || String)(value) }
      })
      // shuffle
      for (var i = options.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var tmp = options[i]
        options[i] = options[j]
        options[j] = tmp
      }
      item.options = options
      built.push(item)
    }
    return built
  }

  var el = {
    setup: document.getElementById('quiz-setup'),
    grade: document.getElementById('quiz-grade'),
    start: document.getElementById('quiz-start'),
    panel: document.getElementById('quiz-panel'),
    counter: document.getElementById('quiz-counter'),
    prompt: document.getElementById('quiz-prompt'),
    choices: document.getElementById('quiz-choices'),
    feedback: document.getElementById('quiz-feedback'),
    next: document.getElementById('quiz-next'),
    result: document.getElementById('quiz-result'),
    score: document.getElementById('quiz-score'),
    review: document.getElementById('quiz-review'),
    again: document.getElementById('quiz-again'),
  }

  if (!el.start || !el.panel) return

  function start() {
    state.grade = el.grade && el.grade.value ? el.grade.value : 'primary-4'
    state.questions = buildQuestions(state.grade)
    state.index = 0
    state.score = 0
    state.answers = []
    state.startedAt = Date.now()
    el.setup.hidden = true
    el.result.hidden = true
    el.panel.hidden = false
    render()
  }

  function render() {
    var item = state.questions[state.index]
    if (!item) return finish()
    el.counter.textContent = 'Question ' + (state.index + 1) + ' of ' + TOTAL + ' · ' + (GRADES[state.grade] || '')
    el.prompt.textContent = item.q
    el.feedback.hidden = true
    el.feedback.textContent = ''
    el.next.hidden = true
    el.choices.innerHTML = ''
    item.options.forEach(function (option, optionIndex) {
      var button = document.createElement('button')
      button.type = 'button'
      button.className = 'choice'
      button.textContent = option.label
      button.addEventListener('click', function () {
        answer(optionIndex)
      })
      el.choices.appendChild(button)
    })
  }

  function answer(optionIndex) {
    var item = state.questions[state.index]
    if (!item || item.answered) return
    item.answered = true
    var chosen = item.options[optionIndex]
    var correct = chosen.value === item.answer
    if (correct) state.score++
    state.answers.push({ item: item, chosen: chosen, correct: correct })

    Array.prototype.forEach.call(el.choices.children, function (button, index) {
      button.disabled = true
      var value = item.options[index].value
      if (value === item.answer) button.classList.add('is-correct')
      else if (index === optionIndex) button.classList.add('is-wrong')
    })

    el.feedback.hidden = false
    el.feedback.className = 'feedback ' + (correct ? 'ok' : 'no')
    el.feedback.textContent = correct
      ? 'Correct — ' + item.why
      : 'Not quite. The answer is ' + (item.format || String)(item.answer) + ' — ' + item.why
    el.next.hidden = false
    el.next.textContent = state.index === TOTAL - 1 ? 'See my result' : 'Next question'
  }

  function finish() {
    el.panel.hidden = true
    el.result.hidden = false
    el.score.textContent = state.score + ' / ' + TOTAL
    var seconds = Math.max(1, Math.round((Date.now() - state.startedAt) / 1000))
    el.review.innerHTML = ''
    var wall = document.createElement('p')
    wall.className = 'review-head'
    wall.textContent = 'You finished in ' + seconds + ' seconds.'
    el.review.appendChild(wall)
    state.answers.forEach(function (entry, index) {
      var row = document.createElement('div')
      row.className = 'review-row ' + (entry.correct ? 'ok' : 'no')
      var title = document.createElement('p')
      title.className = 'review-q'
      title.textContent = (index + 1) + '. ' + entry.item.q
      var line = document.createElement('p')
      line.className = 'review-a'
      line.textContent = entry.correct
        ? 'Your answer: ' + entry.chosen.label + ' ✓'
        : 'Your answer: ' + entry.chosen.label + ' · correct: ' + (entry.item.format || String)(entry.item.answer)
      var why = document.createElement('p')
      why.className = 'review-why'
      why.textContent = entry.item.why
      row.appendChild(title)
      row.appendChild(line)
      row.appendChild(why)
      el.review.appendChild(row)
    })
    try {
      window.localStorage.setItem('jessica-quiz-last', JSON.stringify({ grade: state.grade, score: state.score, total: TOTAL, at: Date.now() }))
    } catch (error) {
      /* private mode */
    }
    el.result.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  el.start.addEventListener('click', start)
  el.next.addEventListener('click', function () {
    state.index++
    render()
  })
  el.again.addEventListener('click', function () {
    el.setup.hidden = false
    el.result.hidden = true
  })

  if (el.grade) {
    try {
      var last = JSON.parse(window.localStorage.getItem('jessica-quiz-last') || 'null')
      if (last && last.grade && GRADES[last.grade]) el.grade.value = last.grade
    } catch (error) {
      /* ignore */
    }
  }
})()
