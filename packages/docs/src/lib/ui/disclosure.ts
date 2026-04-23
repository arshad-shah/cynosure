type DisclosureState = 'open' | 'closed';

const TRIGGER_ATTR = 'data-disclosure-trigger';
const TARGET_ATTR = 'data-disclosure-target';
const STATE_ATTR = 'data-state';
const DISMISS_ESCAPE_ATTR = 'data-disclosure-dismiss-on-escape';

const openStack: HTMLElement[] = [];
let escapeBound = false;

function getState(el: HTMLElement): DisclosureState {
  return el.getAttribute(STATE_ATTR) === 'open' ? 'open' : 'closed';
}

function setState(trigger: HTMLElement, target: HTMLElement, state: DisclosureState): void {
  target.setAttribute(STATE_ATTR, state);
  trigger.setAttribute('aria-expanded', state === 'open' ? 'true' : 'false');
  if (state === 'open') {
    if (!openStack.includes(target)) openStack.push(target);
  } else {
    const idx = openStack.indexOf(target);
    if (idx >= 0) openStack.splice(idx, 1);
  }
}

function findTargetFor(trigger: HTMLElement): HTMLElement | null {
  const id = trigger.getAttribute(TRIGGER_ATTR);
  if (!id) return null;
  const target = document.querySelector<HTMLElement>(`[${TARGET_ATTR}="${CSS.escape(id)}"]`);
  return target;
}

function findTriggersFor(targetId: string): HTMLElement[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(`[${TRIGGER_ATTR}="${CSS.escape(targetId)}"]`),
  );
}

function onEscape(event: KeyboardEvent): void {
  if (event.key !== 'Escape') return;
  for (let i = openStack.length - 1; i >= 0; i--) {
    const target = openStack[i];
    if (!target) continue;
    if (target.hasAttribute(DISMISS_ESCAPE_ATTR)) {
      const id = target.getAttribute(TARGET_ATTR);
      const triggers = id ? findTriggersFor(id) : [];
      const trigger = triggers[0];
      if (trigger) {
        setState(trigger, target, 'closed');
      } else {
        target.setAttribute(STATE_ATTR, 'closed');
        openStack.splice(i, 1);
      }
      return;
    }
  }
}

export function initDisclosures(root: ParentNode = document): void {
  const triggers = root.querySelectorAll<HTMLElement>(`[${TRIGGER_ATTR}]`);
  for (const trigger of Array.from(triggers)) {
    if (trigger.dataset.disclosureBound === 'true') continue;
    trigger.dataset.disclosureBound = 'true';
    trigger.addEventListener('click', (event) => {
      const target = findTargetFor(trigger);
      if (!target) return;
      event.preventDefault();
      const next: DisclosureState = getState(target) === 'open' ? 'closed' : 'open';
      setState(trigger, target, next);
    });
  }

  if (!escapeBound && typeof document !== 'undefined') {
    document.addEventListener('keydown', onEscape);
    escapeBound = true;
  }
}
