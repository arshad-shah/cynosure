/**
 * Hostile host CSS: what real host apps ship. Cynosure must render identically underneath it.
 * Includes the control-affecting rules of Tailwind CSS preflight v3/v4 verbatim (MIT, © Tailwind Labs), including
 * the v3 `[type='button']` background reset, plus deliberately aggressive globals. Appended after Cynosure CSS.
 */
export const hostileHostCss = `
*,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb;margin:0;padding:0}
html{line-height:1.5;-webkit-text-size-adjust:100%;tab-size:4;font-family:ui-sans-serif,system-ui,sans-serif}
button,input,select,textarea{font-family:inherit;font-feature-settings:inherit;font-size:100%;font-weight:inherit;line-height:inherit;letter-spacing:inherit;color:inherit;margin:0;padding:0;background-color:transparent;border-radius:0}
button,[role=button]{cursor:pointer;text-transform:none;background-image:none;appearance:button}
button,[type='button'],[type='reset'],[type='submit']{-webkit-appearance:button;background-color:transparent;background-image:none}
img,svg,video,canvas{display:block;vertical-align:middle;max-width:100%;height:auto}
*{box-sizing:content-box!important;font-size:19px;line-height:3;letter-spacing:.2em}
button{background:red;border:5px solid lime;padding:20px;border-radius:0;height:auto;min-height:0}
svg{width:100px;height:100px}
span,div{font-weight:900;text-transform:uppercase}
*{color:rgb(255,0,0)}
`;

/** Computed values of `props` on the first `selector` match, with and without hostile CSS on the page. */
export function computeUnderHostileHost(root: ParentNode, selector: string, props: readonly string[]) {
  const target = root.querySelector(selector);
  if (!target) throw new Error(`No element matches ${selector}`);
  const read = () => Object.fromEntries(props.map((p) => [p, getComputedStyle(target).getPropertyValue(p)]));
  const clean = read();
  const style = document.createElement("style");
  style.textContent = hostileHostCss;
  document.head.append(style);
  try {
    return { clean, hostile: read() };
  } finally {
    style.remove();
  }
}
