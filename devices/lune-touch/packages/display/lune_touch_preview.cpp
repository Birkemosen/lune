#include <lvgl.h>

// Your application's UI entry point
static void ui_init(void) {
    lv_obj_t *btn = lv_btn_create(lv_scr_act());
    lv_obj_center(btn);
    lv_obj_t *label = lv_label_create(btn);
    lv_label_set_text(label, "Lune Touch Preview");
}

#ifdef LVGL_LIVE_PREVIEW
// Gives the live preview tool a way to initialize your UI.
// Using extern "C" so the preview extension can locate the symbol without C++ name mangling.
extern "C" void lvgl_live_preview_init(void) {
    ui_init();
}
#endif
