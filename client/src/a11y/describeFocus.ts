const ROLE_FROM_TAG: Record<string, string> = {
  BUTTON: 'button',
  A: 'link',
  INPUT: 'input',
  SELECT: 'combobox',
  TEXTAREA: 'textbox',
  H1: 'heading',
  H2: 'heading',
  H3: 'heading',
  H4: 'heading',
  SUMMARY: 'button',
  IMG: 'image'
};

function labelFromId(id: string | null): string {
  if (!id || typeof document === 'undefined') return '';
  const parts = id.split(/\s+/).map((piece) => document.getElementById(piece)?.textContent?.trim() || '').filter(Boolean);
  return parts.join(' ');
}

function accessibleName(el: HTMLElement): string {
  const ariaLabel = el.getAttribute('aria-label')?.trim();
  if (ariaLabel) return ariaLabel;
  const labelledBy = labelFromId(el.getAttribute('aria-labelledby'));
  if (labelledBy) return labelledBy;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    const id = el.getAttribute('id');
    if (id) {
      const safeId = id.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
      const forLabel = document.querySelector(`label[for="${safeId}"]`)?.textContent?.trim();
      if (forLabel) return forLabel;
    }
    const wrapping = el.closest('label')?.textContent?.trim();
    if (wrapping) return wrapping.slice(0, 120);
    if (el.getAttribute('placeholder')) return el.getAttribute('placeholder') || '';
  }
  if (el instanceof HTMLImageElement) {
    return el.alt?.trim() || 'Image without alternative text';
  }
  const text = (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
  if (text) return text.slice(0, 140);
  return el.getAttribute('title')?.trim() || 'Unnamed control';
}

function roleName(el: HTMLElement): string {
  const explicit = el.getAttribute('role')?.trim();
  if (explicit) return explicit;
  if (el instanceof HTMLInputElement) {
    if (el.type === 'checkbox') return 'checkbox';
    if (el.type === 'radio') return 'radio';
    if (el.type === 'submit' || el.type === 'button') return 'button';
    return 'textbox';
  }
  return ROLE_FROM_TAG[el.tagName] || el.tagName.toLowerCase();
}

function stateParts(el: HTMLElement): string[] {
  const parts: string[] = [];
  if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') parts.push('disabled');
  const pressed = el.getAttribute('aria-pressed');
  if (pressed === 'true') parts.push('pressed');
  if (pressed === 'false') parts.push('not pressed');
  const expanded = el.getAttribute('aria-expanded');
  if (expanded === 'true') parts.push('expanded');
  if (expanded === 'false') parts.push('collapsed');
  const selected = el.getAttribute('aria-selected');
  if (selected === 'true') parts.push('selected');
  if (selected === 'false') parts.push('not selected');
  if (el instanceof HTMLInputElement && (el.type === 'checkbox' || el.type === 'radio')) {
    parts.push(el.checked ? 'checked' : 'not checked');
  }
  if (el.getAttribute('aria-current')) parts.push(`current ${el.getAttribute('aria-current')}`);
  return parts;
}

function activationHint(role: string, el: HTMLElement): string {
  if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') {
    return 'It cannot be activated right now.';
  }
  if (role === 'button' || el.tagName === 'BUTTON') return 'Activating it runs that action.';
  if (role === 'link' || el.tagName === 'A') return 'Activating it follows the link or opens that destination.';
  if (role === 'tab') return 'Activating it shows that tab panel.';
  if (role === 'checkbox') return 'Activating it toggles the choice.';
  if (role === 'radio') return 'Activating it selects that option.';
  if (role === 'textbox' || role === 'combobox' || role === 'searchbox') return 'You can type into it.';
  if (role === 'heading') return 'It marks a section. It is not a control.';
  return '';
}

/** Concise description of the currently focused element for ConceptLens guidance. */
export function describeFocusedElement(el: Element | null | undefined): string {
  if (!el || !(el instanceof HTMLElement)) {
    return 'Nothing in the page has keyboard focus yet. Press Tab to move to a control.';
  }
  if (el === document.body || el === document.documentElement) {
    return 'Focus is on the page body. Press Tab to reach a control.';
  }
  const name = accessibleName(el);
  const role = roleName(el);
  const states = stateParts(el);
  const hint = activationHint(role, el);
  const stateText = states.length ? ` State: ${states.join(', ')}.` : '';
  const hintText = hint ? ` ${hint}` : '';
  return `${name}. Role: ${role}.${stateText}${hintText}`.replace(/\s+/g, ' ').trim();
}
