(function (root) {
  const DIGRAPHS = [
    ['shch', 'щ'],
    ['yo', 'ё'],
    ['zh', 'ж'],
    ['kh', 'х'],
    ['ts', 'ц'],
    ['ch', 'ч'],
    ['sh', 'ш'],
    ['yu', 'ю'],
    ['ya', 'я'],
    ['ye', 'е'],
    ['yy', 'ый']
  ];
  const CYR_VOWELS = 'аеёиоуыэюя';
  const LETTERS = {
    a: 'а', b: 'б', v: 'в', g: 'г', d: 'д', e: 'е', z: 'з', i: 'и', j: 'й',
    k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', r: 'р', s: 'с', t: 'т',
    u: 'у', f: 'ф', h: 'х', x: 'кс', "'": 'ь'
  };
  const ROWS = [
    ['й', 'ц', 'у', 'к', 'е', 'н', 'г', 'ш', 'щ', 'з', 'х'],
    ['ф', 'ы', 'в', 'а', 'п', 'р', 'о', 'л', 'д', 'ж', 'э'],
    ['я', 'ч', 'с', 'м', 'и', 'т', 'ь', 'б', 'ю', 'ъ', 'ё']
  ];

  function latinToCyrillic(input) {
    let rest = String(input || '').toLowerCase();
    let out = '';
    while (rest.length) {
      const ch = rest[0];
      if (ch === ' ' || ch === '-') {
        out += ch;
        rest = rest.slice(1);
        continue;
      }
      let matched = false;
      for (let i = 0; i < DIGRAPHS.length; i += 1) {
        const pair = DIGRAPHS[i];
        if (rest.indexOf(pair[0]) === 0) {
          out += pair[1];
          rest = rest.slice(pair[0].length);
          matched = true;
          break;
        }
      }
      if (matched) continue;
      if (ch === 'y') {
        const prev = out[out.length - 1] || '';
        out += CYR_VOWELS.indexOf(prev) >= 0 ? 'й' : 'ы';
      } else if (LETTERS[ch]) out += LETTERS[ch];
      rest = rest.slice(1);
    }
    return out;
  }

  function keyboardHtml() {
    const rows = ROWS.map(function (row) {
      return '<div class="key-row">' + row.map(function (key) {
        return '<button type="button" class="key" data-action="key" data-key="' + key + '">' + key + '</button>';
      }).join('') + '</div>';
    }).join('');
    return '<div class="keys" aria-label="Teclado cirílico">' + rows +
      '<div class="key-row key-row-wide">' +
      '<button type="button" class="key key-wide" data-action="key" data-key=" ">\u00a0espacio\u00a0</button>' +
      '<button type="button" class="key key-wide" data-action="key" data-key="back">borrar</button>' +
      '</div></div>';
  }

  root.RusoCyr = {
    latinToCyrillic: latinToCyrillic,
    keyboardHtml: keyboardHtml,
    rows: ROWS
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
