/** Kept in JS as well as the class, so the overflow check matches the render. */
export const MENU_WIDTH = 160
/** Smallest gap tolerated between the menu and the edge of the screen. */
export const EDGE_MARGIN = 8

/**
 * Whether a dropdown has to hang rightwards instead of its usual leftwards.
 *
 * It normally extends left from its button's right edge, which runs off the
 * screen when the button itself sits near the left of the viewport.
 */
export function shouldAlignLeft(
  buttonRight: number,
  menuWidth = MENU_WIDTH,
  margin = EDGE_MARGIN,
): boolean {
  return buttonRight - menuWidth < margin
}
