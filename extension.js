const vscode = require('vscode');
const { buildAiModeUrl, SearchHistory } = require('./queryBuilder');

let history;

// Запуск расширения: вешаем команду на Ctrl+Alt+G
function activate(context) {
  history = new SearchHistory(10);

  const disposable = vscode.commands.registerCommand(
    'googleAiMode.search',
    searchSelectionInAiMode
  );

  context.subscriptions.push(disposable);
}

// Берём выделенный текст и открываем Google AI Mode
async function searchSelectionInAiMode() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage('Открой файл и выдели текст');
    return;
  }

  let text = editor.document.getText(editor.selection).trim();
  if (!text) {
    const range = editor.document.getWordRangeAtPosition(editor.selection.active);
    text = range ? editor.document.getText(range).trim() : '';
  }

  if (!text) {
    vscode.window.showInformationMessage('Сначала выдели строчки кода');
    return;
  }

  const languageId = editor.document.languageId;
  const { url, note } = buildAiModeUrl(text, languageId);

  history.push({
    preview: text.slice(0, 80),
    languageId,
    at: new Date().toISOString()
  });

  const opened = await vscode.env.openExternal(vscode.Uri.parse(url));
  if (!opened) {
    vscode.window.showErrorMessage('Не удалось открыть браузер');
    return;
  }

  vscode.window.setStatusBarMessage(
    `Запрос отправлен` + (note ? ` (${note})` : '') + `. В истории: ${history.size()}`,
    4000
  );
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
