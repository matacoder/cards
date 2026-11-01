//! Where the card window goes. Pure, so it can be tested without a window.

#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Rect {
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
}

const EDGE_GAP: f64 = 4.0;
/// An auto-hidden taskbar is not excluded from the work area and can't be detected,
/// so always keep clear of it. Windows 11 taskbar is 48px, Windows 10 is 40px.
const TASKBAR_RESERVE: f64 = 56.0;

/// All values are in logical pixels. Returns the window's top-left corner.
pub fn card_position(bounds: Rect, work: Rect, size: (f64, f64), is_mac: bool) -> (f64, f64) {
    let x = work.x + work.width - size.0 - EDGE_GAP;
    if is_mac {
        return (x, work.y + EDGE_GAP); // Under the menu bar clock.
    }
    let work_bottom = work.y + work.height - EDGE_GAP;
    let screen_bottom = bounds.y + bounds.height - TASKBAR_RESERVE;
    (x, work_bottom.min(screen_bottom) - size.1)
}

#[cfg(test)]
mod tests {
    use super::*;

    const SIZE: (f64, f64) = (400.0, 136.0);
    const SCREEN: Rect = Rect { x: 0.0, y: 0.0, width: 1920.0, height: 1080.0 };

    #[test]
    fn auto_hidden_taskbar_stays_clear() {
        let (_, y) = card_position(SCREEN, SCREEN, SIZE, false);
        assert_eq!(y + SIZE.1, 1080.0 - 56.0);
    }

    #[test]
    fn visible_taskbar_stays_clear() {
        let work = Rect { height: 1032.0, ..SCREEN };
        let (_, y) = card_position(SCREEN, work, SIZE, false);
        assert!(y + SIZE.1 <= 1032.0);
    }

    #[test]
    fn tall_taskbar_uses_work_area() {
        let work = Rect { height: 980.0, ..SCREEN };
        let (_, y) = card_position(SCREEN, work, SIZE, false);
        assert_eq!(y + SIZE.1, 976.0);
    }

    #[test]
    fn second_display_offset() {
        let second = Rect { x: 1920.0, y: 200.0, width: 1280.0, height: 720.0 };
        assert_eq!(card_position(second, second, SIZE, false), (2796.0, 728.0));
    }

    #[test]
    fn mac_is_under_the_menu_bar() {
        let work = Rect { y: 25.0, height: 1055.0, ..SCREEN };
        assert_eq!(card_position(SCREEN, work, SIZE, true), (1516.0, 29.0));
    }
}
