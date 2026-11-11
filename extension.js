const vscode = require('vscode');
const { buildAiModeUrl, SearchHistory } = require('./queryBuilder');

/** @type {SearchHistory} */
let history;

/**
 * Точка входа расширения VS Code.
 * Регистрирует команду поиска выделенного кода в Google AI Mode.
 *
 * @param {vscode.ExtensionContext} context контекст расширения
 */
function activate(context) {
  history = new SearchHistory(10);

  const disposable = vscode.commands.registerCommand(
    'googleAiMode.search',
    searchSelectionInAiMode
  );

  context.subscriptions.push(disposable);
}

/**
 * Берёт выделение (или слово под курсором), собирает запрос на пояснение
 * и открывает Google AI Mode (`udm=50`) в системном браузере.
 */
async function searchSelectionInAiMode() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage('Google AI Mode: откройте файл и выделите текст');
    return;
  }

  let text = editor.document.getText(editor.selection).trim();
  if (!text) {
    const range = editor.document.getWordRangeAtPosition(editor.selection.active);
    text = range ? editor.document.getText(range).trim() : '';
  }

  if (!text) {
    vscode.window.showInformationMessage('Google AI Mode: сначала выделите строчки кода');
    return;
  }

  const languageId = editor.document.languageId;
  const { url, query, note } = buildAiModeUrl(text, languageId);

  history.push({
    queryPreview: query.slice(0, 120),
    languageId,
    at: new Date().toISOString()
  });

  const opened = await vscode.env.openExternal(vscode.Uri.parse(url));
  if (!opened) {
    vscode.window.showErrorMessage('Google AI Mode: не удалось открыть браузер');
    return;
  }

  vscode.window.setStatusBarMessage(
    `Google AI Mode: запрос отправлен (история: ${history.size()})${note ? ' · ' + note : ''}`,
    5000
  );
}

/**
 * Вызывается при выгрузке расширения.
 */
function deactivate() {}

module.exports = {
  activate,
  deactivate
};
