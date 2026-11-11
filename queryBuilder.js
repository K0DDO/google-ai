'use strict';

// Язык файла → нормальное название
const LANGUAGE_LABELS = new Map([
  ['javascript', 'JavaScript'],
  ['typescript', 'TypeScript'],
  ['python', 'Python'],
  ['java', 'Java'],
  ['c', 'C'],
  ['cpp', 'C++'],
  ['csharp', 'C#'],
  ['go', 'Go'],
  ['rust', 'Rust'],
  ['php', 'PHP'],
  ['html', 'HTML'],
  ['css', 'CSS'],
  ['json', 'JSON']
]);

const MAX_CODE_LENGTH = 1800;

// Собираем текст запроса и ссылку на Google AI Mode
function buildAiModeUrl(selectedText, languageId) {
  let code = String(selectedText).replace(/\r\n/g, '\n').trim();
  let note = '';

  if (code.length > MAX_CODE_LENGTH) {
    code = code.slice(0, MAX_CODE_LENGTH);
    note = 'код обрезан';
  }

  const lang = LANGUAGE_LABELS.get(languageId) || languageId || 'код';

  const query =
    `Поясни этот код на русском простыми словами: что делает, ` +
    `как работает и на что смотреть. Язык: ${lang}.\n\n` +
    code;

  // udm=50 включает AI Mode в обычном Google Search
  const params = new URLSearchParams({
    q: query,
    udm: '50',
    hl: 'ru'
  });

  return {
    url: `https://www.google.com/search?${params.toString()}`,
    query,
    note
  };
}

// Короткая история последних запросов
class SearchHistory {
  constructor(limit) {
    this._limit = limit;
    this._items = [];
  }

  push(entry) {
    this._items.push(entry);
    while (this._items.length > this._limit) {
      this._items.shift();
    }
  }

  size() {
    return this._items.length;
  }

  list() {
    return this._items.slice();
  }
}

module.exports = {
  buildAiModeUrl,
  SearchHistory,
  LANGUAGE_LABELS,
  MAX_CODE_LENGTH
};
