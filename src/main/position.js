// Where the card window goes. Pure, so it can be tested without Electron.

const EDGE_GAP = 4;
// An auto-hidden taskbar is not excluded from workArea and can't be detected,
// so always keep clear of it. Windows 11 taskbar is 48px, Windows 10 is 40px.
const TASKBAR_RESERVE = 56;

function cardPosition({ bounds, workArea }, { width, height }, isMac) {
  const x = workArea.x + workArea.width - width - EDGE_GAP;
  if (isMac) return { x, y: workArea.y + EDGE_GAP }; // Under the menu bar clock.
  const workBottom = workArea.y + workArea.height - EDGE_GAP;
  const screenBottom = bounds.y + bounds.height - TASKBAR_RESERVE;
  return { x, y: Math.min(workBottom, screenBottom) - height };
}

module.exports = { cardPosition };
