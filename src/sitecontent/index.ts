console.log('Woolies shopping extension loaded.');


async function onImport() {
  const response = await chrome.runtime.sendMessage({ action: 'importFromKeep' });
  if (!response.success) {
    alert('Unable to import from Keep.');
  } else {
    window.location.reload();
  }
}


function onInit() {
  const template = document.createElement('template');
  template.innerHTML = `
<div id="keep-to-woolies" style="position: fixed; bottom:5px; left: 5px; z-index: 2147483647;">
  <button class="button button--primary">Import From Keep</button>
</div>
`.trim();
  const btn = template.content.querySelector('button') as HTMLButtonElement;
  btn.onclick = async () => {
    btn.innerText = 'Importing...';
    await onImport();
    btn.innerText = 'Import From Keep';
  };
  document.body.append(template.content.firstChild as ChildNode);
}

onInit();
