console.log('Woolies shopping extension loaded.');




async function onImport() {
  console.log('===== importing ====');
  const response = await chrome.runtime.sendMessage({ action: 'importFromKeep' });
  if (!response.success) {
    alert('Unable to import from Keep.');
  } else {
    window.location.reload();
  }
}


function onInit() {
  console.log('oninit');

  const observer = new MutationObserver((mutationList) => {

    const sidecartMutation = mutationList.find(m => m.target.nodeName === 'WOW-SIDE-CART-PANEL');
    if (!sidecartMutation) {
      return;
    }

    const addition = document.createElement('div');
    addition.style.padding = '5px';

    const btn = document.createElement('button');
    btn.innerHTML = 'Import From Keep';
    btn.className = 'button button--primary';
    btn.onclick = onImport;
    addition.append(btn);

    document.getElementsByTagName('wow-side-cart-panel')[0].getElementsByClassName('panel-heading')[0].append(addition);
  });


  observer.observe(document.body, { childList: true, subtree: true })

}


if (document.readyState !== 'loading') {
  onInit();
} else {
  document.addEventListener('DOMContentLoaded', onInit);
}

