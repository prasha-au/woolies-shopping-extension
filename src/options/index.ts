

const fields = ['woolworthsListId', 'keepClientEmail', 'keepClientPrivateKey', 'keepUserEmail', 'keepNoteId'] as const;

async function saveOptions() {
  const data: Record<string, unknown> = {};
  for (const field of fields) {
    data[field] = (document.getElementById(field) as HTMLInputElement)?.value ?? '';
  }
  await chrome.storage.sync.set(data);
}


async function restoreOptions() {
  const data = await chrome.storage.sync.get(fields);
  for (const [key, value] of Object.entries(data)) {
    const el = document.getElementById(key) as HTMLInputElement;
    if (el) {
      el.value = value;
    }
  }
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save')?.addEventListener('click', saveOptions);
