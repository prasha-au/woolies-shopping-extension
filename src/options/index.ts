

const basicFields = ['woolworthsListId', 'keepClientEmail', 'keepClientPrivateKey', 'keepUserEmail', 'keepNoteId'] as const;

async function saveOptions() {
  const data: Record<string, unknown> = {};
  for (const field of basicFields) {
    data[field] = (document.getElementById(field) as HTMLInputElement)?.value ?? '';
  }
  data.keepTransformations = Object.fromEntries(
    ((document.getElementById('keepTransformations') as HTMLInputElement)?.value ?? '')
    .split('\n')
    .map((line) => line.split('|'))
    .filter(v => v?.length === 2)
  );
  await chrome.storage.sync.set(data);
}


async function restoreOptions() {
  function setFieldIfExists(elementId: string, value: string) {
    const el = document.getElementById(elementId) as (HTMLInputElement | HTMLTextAreaElement);
    if (el) {
      el.value = value;
    }
  }

  const data = await chrome.storage.sync.get();
  for (const key of basicFields) {
    setFieldIfExists(key, data[key] ?? '');
  }

  setFieldIfExists('keepTransformations', Object.entries(data.remap ?? {}).map(([k, v]) => `${k}|${v}`).join('\n'));
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save')?.addEventListener('click', saveOptions);
