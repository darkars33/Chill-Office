/** True when a keystroke belongs to a form field and should not trigger shortcuts. */
export function isTypingTarget(target) {
  const tag = target?.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable === true
}
