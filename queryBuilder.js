'use strict';

/**
 * Соответствие languageId редактора → человекочитаемое имя языка.
 * Используется как структура данных Map.
 * @type {Map<string, string>}
 */
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

/** Максимальная длина кода в URL (ограничение браузера). */
const MAX_CODE_LENGTH = 1800;

/**
 * Собирает русскоязычный промпт «поясни код» и URL Google AI Mode.
 *
 * @param {string} selectedText выделенный фрагмент
 * @param {string} languageId идентификатор языка VS Code
 * @returns {{ url: string, query: string, note: string }}
 */
function buildAiModeUrl(selectedText, languageId) {
  let code = String(selectedText).replace(/\r\n/g, '\n').trim();
  let note = '';

  if (code.length > MAX_CODE_LENGTH) {
    code = code.slice(0, MAX_CODE_LENGTH);
    note = 'код обрезан для URL';
  }

  const languageLabel = LANGUAGE_LABELS.get(languageId) || languageId || 'код';

  const query =
    `Поясни этот код на русском языке простыми словами: что он делает, ` +
    `как работает по шагам и на что обратить внимание. Язык: ${languageLabel}.\n\n` +
    code;

  // udm=50 — параметр Google Search, включающий AI Mode (не Gemini-приложение)
  const params = new URLSearchParams({
    q: query,
    udm: '50',
    hl: 'ru'
  });

  const url = `https://www.google.com/search?${params.toString()}`;
  return { url, query, note };
}

/**
 * Очередь фиксированного размера для истории последних запросов.
 */
class SearchHistory {
  /**
   * @param {number} limit максимальное число записей
   */
  constructor(limit) {
    this._limit = limit;
    /** @type {{ queryPreview: string, languageId: string, at: string }[]} */
    this._items = [];
  }

  /**
   * Добавляет запись; при переполнении удаляет самую старую (FIFO).
   * @param {{ queryPreview: string, languageId: string, at: string }} entry
   */
  push(entry) {
    this._items.push(entry);
    while (this._items.length > this._limit) {
      this._items.shift();
    }
  }

  /**
   * @returns {number} текущее число записей в истории
   */
  size() {
    return this._items.length;
  }

  /**
   * @returns {{ queryPreview: string, languageId: string, at: string }[]} копия истории
   */
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
