import { getSettings, saveSettings } from '../shared/storage';

const listEl = document.getElementById('exclusion-list') as HTMLUListElement;
const emptyMsg = document.getElementById('empty-message') as HTMLParagraphElement;
const newSiteInput = document.getElementById('new-site') as HTMLInputElement;
const addBtn = document.getElementById('add-site') as HTMLButtonElement;

async function render() {
  const settings = await getSettings();
  listEl.textContent = '';

  if (settings.exclusions.length === 0) {
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';
  for (const hostname of settings.exclusions) {
    const li = document.createElement('li');

    const span = document.createElement('span');
    span.textContent = hostname;
    li.appendChild(span);

    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', async () => {
      const current = await getSettings();
      await saveSettings({
        exclusions: current.exclusions.filter((h) => h !== hostname),
      });
      render();
    });
    li.appendChild(removeBtn);

    listEl.appendChild(li);
  }
}

addBtn.addEventListener('click', addSite);
newSiteInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addSite();
});

async function addSite() {
  const hostname = newSiteInput.value.trim().toLowerCase();
  if (!hostname) return;

  const settings = await getSettings();
  if (settings.exclusions.includes(hostname)) {
    newSiteInput.value = '';
    return;
  }

  await saveSettings({ exclusions: [...settings.exclusions, hostname] });
  newSiteInput.value = '';
  render();
}

render();
