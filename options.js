const STORAGE_KEY = 'customJsSites';
let editingIndex = -1;

const formTitle = document.getElementById('form-title');
const urlPatternInput = document.getElementById('url-pattern');
const customCodeInput = document.getElementById('custom-code');
const saveButton = document.getElementById('save-button');
const cancelButton = document.getElementById('cancel-button');
const entryForm = document.getElementById('entry-form');
const entriesContainer = document.getElementById('entries');

function loadEntries() {
  chrome.storage.sync.get({ [STORAGE_KEY]: [] }, (data) => {
    renderEntries(data[STORAGE_KEY]);
  });
}

function saveEntries(entries) {
  chrome.storage.sync.set({ [STORAGE_KEY]: entries }, () => {
    loadEntries();
    resetForm();
  });
}

function renderEntries(entries) {
  entriesContainer.innerHTML = '';
  if (!entries || entries.length === 0) {
    entriesContainer.innerHTML = '<div class="empty-state">No entries saved yet.</div>';
    return;
  }

  entries.forEach((entry, index) => {
    const card = document.createElement('div');
    card.className = 'entry-card';

    const header = document.createElement('div');
    header.className = 'card-header';

    const pattern = document.createElement('span');
    pattern.textContent = entry.urlPattern;
    header.appendChild(pattern);

    const actions = document.createElement('div');
    actions.className = 'entry-actions';

    const editButton = document.createElement('button');
    editButton.textContent = 'Edit';
    editButton.addEventListener('click', () => startEditingEntry(index, entry));

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete';
    deleteButton.addEventListener('click', () => deleteEntry(index));

    actions.appendChild(editButton);
    actions.appendChild(deleteButton);
    header.appendChild(actions);

    const codeBlock = document.createElement('pre');
    codeBlock.textContent = entry.code.trim() || '// Empty script';

    card.appendChild(header);
    card.appendChild(codeBlock);
    entriesContainer.appendChild(card);
  });
}

function startEditingEntry(index, entry) {
  editingIndex = index;
  formTitle.textContent = 'Edit entry';
  saveButton.textContent = 'Update entry';
  urlPatternInput.value = entry.urlPattern;
  customCodeInput.value = entry.code;
}

function resetForm() {
  editingIndex = -1;
  formTitle.textContent = 'Add new entry';
  saveButton.textContent = 'Save entry';
  urlPatternInput.value = '';
  customCodeInput.value = '';
}

function deleteEntry(index) {
  chrome.storage.sync.get({ [STORAGE_KEY]: [] }, (data) => {
    const entries = data[STORAGE_KEY] || [];
    entries.splice(index, 1);
    saveEntries(entries);
  });
}

entryForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const urlPattern = urlPatternInput.value.trim();
  const code = customCodeInput.value.trim();
  if (!urlPattern || !code) return;

  chrome.storage.sync.get({ [STORAGE_KEY]: [] }, (data) => {
    const entries = data[STORAGE_KEY] || [];
    const newEntry = { urlPattern, code };

    if (editingIndex >= 0 && editingIndex < entries.length) {
      entries[editingIndex] = newEntry;
    } else {
      entries.push(newEntry);
    }

    saveEntries(entries);
  });
});

cancelButton.addEventListener('click', resetForm);

document.addEventListener('DOMContentLoaded', loadEntries);
