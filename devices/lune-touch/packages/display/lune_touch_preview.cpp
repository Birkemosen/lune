#include <lvgl.h>
#include <string>

namespace {

constexpr uint32_t black = 0x000000;
constexpr uint32_t surface = 0x1C1C1C;
constexpr uint32_t elevated = 0x2C2C2C;
constexpr uint32_t separator = 0x383838;
constexpr uint32_t secondary = 0x8E8E8E;
constexpr uint32_t orange = 0xFF9F0A;
constexpr uint32_t green = 0x32D74B;
constexpr uint32_t blue = 0xFFFFFF;
constexpr uint32_t purple = 0x8E8E8E;

lv_obj_t *make_label(lv_obj_t *parent, const char *text, int32_t x, int32_t y,
                                         int32_t width, int32_t height, uint32_t color,
                                         lv_text_align_t align = LV_TEXT_ALIGN_LEFT) {
    lv_obj_t *label = lv_label_create(parent);
    lv_label_set_text(label, text);
    lv_obj_set_pos(label, x, y);
    lv_obj_set_size(label, width, height);
    lv_obj_set_style_text_color(label, lv_color_hex(color), LV_PART_MAIN);
    lv_obj_set_style_text_align(label, align, LV_PART_MAIN);
    lv_obj_set_style_text_font(label, LV_FONT_DEFAULT, LV_PART_MAIN);
    lv_label_set_long_mode(label, LV_LABEL_LONG_MODE_CLIP);
    return label;
}

lv_obj_t *make_button(lv_obj_t *parent, const char *text, int32_t x, int32_t y,
                                            int32_t width, int32_t height, uint32_t color) {
    lv_obj_t *button = lv_button_create(parent);
    lv_obj_set_pos(button, x, y);
    lv_obj_set_size(button, width, height);
    lv_obj_set_style_bg_color(button, lv_color_hex(color), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(button, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_border_width(button, 1, LV_PART_MAIN);
    lv_obj_set_style_border_color(button, lv_color_hex(separator), LV_PART_MAIN);
    lv_obj_set_style_radius(button, 12, LV_PART_MAIN);
    lv_obj_t *label = make_label(button, text, 0, 0, width, height, 0xFFFFFF,
                                                             LV_TEXT_ALIGN_CENTER);
    lv_obj_center(label);
    return button;
}

void add_zone_card(lv_obj_t *parent, int32_t x, int32_t y, const char *zone,
                                     const char *room, const char *temperature,
                                     const char *setpoint, uint32_t status_color) {
    lv_obj_t *card = lv_obj_create(parent);
    lv_obj_set_pos(card, x, y);
    lv_obj_set_size(card, 134, 108);
    lv_obj_set_style_bg_color(card, lv_color_hex(elevated), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(card, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_border_color(card, lv_color_hex(separator), LV_PART_MAIN);
    lv_obj_set_style_border_width(card, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(card, 12, LV_PART_MAIN);
    lv_obj_set_style_pad_all(card, 0, LV_PART_MAIN);
    lv_obj_clear_flag(card, LV_OBJ_FLAG_SCROLLABLE);

    lv_obj_t *stripe = lv_obj_create(card);
    lv_obj_set_pos(stripe, 110, 12);
    lv_obj_set_size(stripe, 10, 10);
    lv_obj_set_style_bg_color(stripe, lv_color_hex(status_color), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(stripe, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_radius(stripe, LV_RADIUS_CIRCLE, LV_PART_MAIN);
    lv_obj_set_style_border_width(stripe, 0, LV_PART_MAIN);

    make_label(card, zone, 14, 10, 92, 18, secondary);
    make_label(card, room, 14, 28, 92, 20, 0xFFFFFF);
    make_label(card, temperature, 14, 52, 92, 24, blue);
    make_label(card, setpoint, 14, 80, 92, 18, purple);

    lv_obj_t *bar = lv_bar_create(card);
    lv_obj_set_pos(bar, 110, 28);
    lv_obj_set_size(bar, 10, 68);
    lv_bar_set_range(bar, 0, 100);
    lv_bar_set_value(bar, 62, LV_ANIM_OFF);
    lv_obj_set_style_bg_color(bar, lv_color_hex(separator), LV_PART_MAIN);
    lv_obj_set_style_bg_color(bar, lv_color_hex(status_color), LV_PART_INDICATOR);
    lv_obj_set_style_radius(bar, 5, LV_PART_MAIN);
    lv_obj_set_style_radius(bar, 5, LV_PART_INDICATOR);
}

// The current Lune Touch dashboard layout, sized for the 1024x600 panel.
static void ui_init(void) {
    lv_obj_t *screen = lv_screen_active();
    lv_obj_set_style_bg_color(screen, lv_color_hex(black), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(screen, LV_OPA_COVER, LV_PART_MAIN);

    lv_obj_t *accent = lv_obj_create(screen);
    lv_obj_set_size(accent, 5, 600);
    lv_obj_set_style_bg_color(accent, lv_color_hex(orange), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(accent, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_border_width(accent, 0, LV_PART_MAIN);

    make_label(screen, "Lune Touch", 18, 12, 146, 28, orange);
    make_label(screen, "House status  |  4 manifolds online", 174, 15, 476, 24,
                         0xFFFFFF);
    make_label(screen, "Live", 660, 15, 96, 24, green, LV_TEXT_ALIGN_RIGHT);
    make_button(screen, "<", 778, 4, 44, 44, surface);
    make_label(screen, "1 / 2", 830, 15, 96, 24, secondary, LV_TEXT_ALIGN_CENTER);
    make_button(screen, ">", 934, 4, 44, 44, surface);

    lv_obj_t *separator_line = lv_obj_create(screen);
    lv_obj_set_pos(separator_line, 0, 51);
    lv_obj_set_size(separator_line, 1024, 1);
    lv_obj_set_style_bg_color(separator_line, lv_color_hex(elevated), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(separator_line, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_border_width(separator_line, 0, LV_PART_MAIN);

    make_label(screen, "MANIFOLD", 36, 60, 120, 20, secondary);
    make_label(screen, "ZONES (Z1-Z6)", 176, 60, 808, 20, secondary);

    const char *rooms[6] = {"Living room", "Kitchen", "Bedroom", "Bath", "Office", "Hall"};
    const char *temps[6] = {"21.3 C", "20.8 C", "20.4 C", "22.0 C", "19.9 C", "21.1 C"};
    const char *targets[6] = {"-> 22.0 C", "-> 21.0 C", "-> 21.0 C", "-> 22.0 C", "-> 20.0 C", "-> 21.5 C"};
    const uint32_t colors[6] = {orange, orange, green, green, secondary, orange};
    for (int manifold = 0; manifold < 4; manifold++) {
        const int32_t y = 82 + manifold * 112;
        lv_obj_t *card = lv_obj_create(screen);
        lv_obj_set_pos(card, 20, y);
        lv_obj_set_size(card, 984, 108);
        lv_obj_set_style_bg_color(card, lv_color_hex(surface), LV_PART_MAIN);
        lv_obj_set_style_bg_opa(card, LV_OPA_COVER, LV_PART_MAIN);
        lv_obj_set_style_border_color(card, lv_color_hex(separator), LV_PART_MAIN);
        lv_obj_set_style_border_width(card, 1, LV_PART_MAIN);
        lv_obj_set_style_radius(card, 14, LV_PART_MAIN);
        lv_obj_set_style_pad_all(card, 0, LV_PART_MAIN);
        lv_obj_clear_flag(card, LV_OBJ_FLAG_SCROLLABLE);
        make_label(card, manifold == 0 ? "UFH-A" : "Not connected", 16, 42, 120,
                             24, 0xFFFFFF);
        for (int zone = 0; zone < 6; zone++)
            add_zone_card(card, 148 + zone * 138, 0, ("Z" + std::to_string(zone + 1)).c_str(),
                                        rooms[zone], temps[zone], targets[zone], colors[zone]);
    }

    lv_obj_t *status = lv_obj_create(screen);
    lv_obj_set_pos(status, 20, 542);
    lv_obj_set_size(status, 984, 50);
    lv_obj_set_style_bg_color(status, lv_color_hex(surface), LV_PART_MAIN);
    lv_obj_set_style_bg_opa(status, LV_OPA_COVER, LV_PART_MAIN);
    lv_obj_set_style_border_color(status, lv_color_hex(separator), LV_PART_MAIN);
    lv_obj_set_style_border_width(status, 1, LV_PART_MAIN);
    lv_obj_set_style_radius(status, 14, LV_PART_MAIN);
    make_label(status, "Heat source", 18, 15, 88, 20, orange);
    make_label(status, "On | sent 34.1 C | confirmed 33.8 C", 112, 13, 350, 24, secondary);
    make_label(status, "Forecast", 494, 15, 72, 20, purple);
    make_label(status, "Clear skies | preload ready", 576, 13, 388, 24, 0xFFFFFF);
}

}  // namespace

#ifdef LVGL_LIVE_PREVIEW
// Gives the live preview tool a way to initialize your UI.
// Using extern "C" so the preview extension can locate the symbol without C++ name mangling.
extern "C" void lvgl_live_preview_init(void) {
    ui_init();
}
#endif
