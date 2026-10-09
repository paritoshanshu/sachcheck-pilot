const tabs = [...document.querySelectorAll('.tab')];
const linkPanel = document.getElementById('link-panel');
const claimPanel = document.getElementById('claim-panel');
const linkInput = document.getElementById('link-input');
const claimInput = document.getElementById('claim-input');
const errorMessage = document.getElementById('error-message');
const result = document.getElementById('result');
const checkButton = document.getElementById('check-button');

function selectTab(tab) {
  const linkSelected = tab.id === 'link-tab';
  tabs.forEach((item) => {
    const selected = item === tab;
    item.classList.toggle('active', selected);
    item.setAttribute('aria-selected', String(selected));
  });
  linkPanel.classList.toggle('hidden', !linkSelected);
  claimPanel.classList.toggle('hidden', linkSelected);
  errorMessage.classList.remove('visible');
}
tabs.forEach((tab) => tab.addEventListener('click', () => selectTab(tab)));

document.getElementById('paste-button').addEventListener('click', async () => {
  try {
    linkInput.value = await navigator.clipboard.readText();
    linkInput.focus();
  } catch {
    linkInput.focus();
    errorMessage.textContent = 'Clipboard access is unavailable here. Paste your link into the box.';
    errorMessage.classList.add('visible');
  }
});

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

function renderSources(sources) {
  const list = document.getElementById('source-list');
  list.replaceChildren();
  if (!sources?.length) {
    const empty = document.createElement('p');
    empty.className = 'source-empty';
    empty.textContent = 'No matching sources came back from the configured providers.';
    list.append(empty);
    return;
  }
  sources.forEach((source) => {
    const url = safeUrl(source.url);
    if (!url) return;
    const item = document.createElement('div');
    item.className = 'source-item';
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    anchor.textContent = source.title || source.publisher || url;
    const detail = document.createElement('small');
    detail.textContent = [source.publisher, source.rating, source.date].filter(Boolean).join(' · ');
    item.append(anchor, detail);
    list.append(item);
  });
  if (!list.children.length) {
    const empty = document.createElement('p');
    empty.className = 'source-empty';
    empty.textContent = 'No safe source links were returned.';
    list.append(empty);
  }
}

const verdictNames = {
  supported: ['Supported by sources', '✓'],
  contradicted: ['Contradicted by sources', '×'],
  mixed: ['Mixed evidence', '±'],
  missing_context: ['Missing context', '…'],
  insufficient_evidence: ['Not enough evidence', '?'],
};

function showReview(data, originalValue, isLink) {
  document.getElementById('result-claim').textContent = originalValue;
  document.getElementById('claim-type').textContent = isLink ? 'LINK' : 'PASTED CLAIM';
  const [name, symbol] = verdictNames[data.verdict] || verdictNames.insufficient_evidence;
  document.getElementById('verdict-title').textContent = name;
  document.getElementById('verdict-icon').textContent = symbol;
  document.getElementById('verdict-explanation').textContent = data.explanation || 'No evidence summary was returned.';
  document.getElementById('confidence').textContent = `${(data.confidence || 'low').replace(/^./, (c) => c.toUpperCase())} confidence`;
  document.getElementById('corrected-context').textContent = data.correctedContext || 'No corrected context was established from the available evidence.';
  document.getElementById('safety-note').textContent = data.note || 'Open the sources and consider their date, publisher, and context before sharing.';
  renderSources(data.sources);
  const missing = [];
  if (!data.providers?.gemini) missing.push('Gemini is not configured.');
  else if (!data.providers?.geminiAnalysis) missing.push('Gemini could not complete this request.');
  if (!data.providers?.googleFactCheck) {
    missing.push(data.providers?.googleFactCheckConfigured
      ? (data.providerErrors?.googleFactCheck || 'Google Fact Check could not authenticate the configured key.')
      : 'Google Fact Check API key is not configured.');
  }
  if (data.providerErrors?.gdelt) missing.push(data.providerErrors.gdelt);
  if (missing.length) {
    const banner = document.getElementById('result-note');
    banner.querySelector('span:last-child').textContent = `${missing.join(' ')} Add provider keys in the server .env for fuller checks.`;
    banner.classList.remove('hidden');
  } else document.getElementById('result-note').classList.add('hidden');
  result.classList.remove('hidden');
}

checkButton.addEventListener('click', async () => {
  const isLink = !linkPanel.classList.contains('hidden');
  const field = isLink ? linkInput : claimInput;
  const value = field.value.trim();
  if (!value) {
    errorMessage.textContent = 'Add a public link or paste the claim you want to check.';
    errorMessage.classList.add('visible');
    field.focus();
    return;
  }
  if (isLink && !safeUrl(value)) {
    errorMessage.textContent = 'That doesn’t look like a complete link. Include https:// and try again.';
    errorMessage.classList.add('visible');
    field.focus();
    return;
  }
  errorMessage.classList.remove('visible');
  checkButton.disabled = true;
  checkButton.textContent = 'Searching sources…';
  document.getElementById('verdict-title').textContent = 'Checking sources…';
  document.getElementById('verdict-explanation').textContent = 'Looking for prior fact-checks and relevant reporting.';
  document.getElementById('source-list').innerHTML = '<p class="source-empty">Searching…</p>';
  result.classList.remove('hidden');
  result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  try {
    const response = await fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ claim: value, isUrl: isLink }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'The check could not be completed.');
    showReview(data, value, isLink);
  } catch (error) {
    document.getElementById('verdict-title').textContent = 'Check unavailable';
    document.getElementById('verdict-icon').textContent = '!';
    document.getElementById('verdict-explanation').textContent = error.message || 'Could not reach the verification server. Start it with node server.js.';
    document.getElementById('confidence').textContent = 'No rating';
    renderSources([]);
  } finally {
    checkButton.disabled = false;
    checkButton.innerHTML = 'Check this claim <span>→</span>';
  }
});

document.getElementById('close-result').addEventListener('click', () => result.classList.add('hidden'));
