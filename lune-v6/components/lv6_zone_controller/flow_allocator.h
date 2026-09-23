#pragma once

#include <algorithm>
#include <cmath>
#include <cstdint>

// Continuous flow allocator for heatpump mode (A4).
//
 // Under roughly constant total manifold flow, each enabled zone gets a share of
 // opening proportional to its energy debt. Shares sum to 1. Kv is a relative
 // orifice model from commutation-learned travel (seed: pos^1.5).
namespace lv6::flow_allocator {

static constexpr uint8_t MAX_ZONES = 6;
static constexpr float DEBT_FLOOR_KWH = 0.01f;
static constexpr float DEBT_CAP_KWH = 8.0f;  ///< ~rolling 6–24 h of typical UA·ΔT

struct ZoneSample {
  bool enabled{false};
  float ua_w_per_k{0.0f};
  float temp_c{NAN};
  float setpoint_c{NAN};
  float max_opening_pct{100.0f};
  float learned_open_ripples{0.0f};  ///< 0 → use analytic Kv prior
};

struct State {
  float debt_kwh[MAX_ZONES]{};
  float loop_share[MAX_ZONES]{};     ///< Σ = 1 over enabled
  float opening_pct[MAX_ZONES]{};
  float relative_kv[MAX_ZONES]{};
};

/// Relative Kv at opening percent. Analytic prior: orifice ~ pos^1.5.
/// When learned ripples are available the same shape is used — absolute scale
/// cancels when shares are normalised.
inline float kv_at_pct(float opening_pct, float /*learned_open_ripples*/ = 0.0f) {
  const float x = std::clamp(opening_pct, 0.0f, 100.0f) / 100.0f;
  // Valve authority is poor below ~30 % — flatten the low end so the allocator
  // does not park loops in the dead zone unless debt is near zero.
  if (x < 0.30f)
    return 0.30f * std::pow(std::max(x / 0.30f, 0.0f), 1.5f);
  return std::pow(x, 1.5f);
}

inline void update_debt(State &st, const ZoneSample samples[MAX_ZONES], float dt_h) {
  if (!(dt_h > 0.0f) || !std::isfinite(dt_h))
    return;
  for (uint8_t i = 0; i < MAX_ZONES; i++) {
    if (!samples[i].enabled || !std::isfinite(samples[i].temp_c) ||
        !std::isfinite(samples[i].setpoint_c) || !(samples[i].ua_w_per_k > 0.0f))
      continue;
    const float err_c = samples[i].setpoint_c - samples[i].temp_c;
    // debt += UA·err·dt  (W·K/K · h → Wh → kWh)
    st.debt_kwh[i] += (samples[i].ua_w_per_k * err_c * dt_h) / 1000.0f;
    // Delivered heat estimate from share × rough manifold power is applied by
    // the caller when measured thermal_kw is available (Touch B4). Until then
    // debt alone drives shares.
    st.debt_kwh[i] = std::clamp(st.debt_kwh[i], -DEBT_CAP_KWH, DEBT_CAP_KWH);
  }
}

/// Credit delivered energy (kWh) against debt after a cycle with measured/estimated delivery.
inline void credit_delivered(State &st, uint8_t zone, float delivered_kwh) {
  if (zone >= MAX_ZONES || !std::isfinite(delivered_kwh))
    return;
  st.debt_kwh[zone] -= delivered_kwh;
  st.debt_kwh[zone] = std::clamp(st.debt_kwh[zone], -DEBT_CAP_KWH, DEBT_CAP_KWH);
}

/// Allocate loop shares from positive debt. Negative debt (pre-buffer absorb) gets a floor share.
inline void allocate_shares(State &st, const ZoneSample samples[MAX_ZONES]) {
  float weight[MAX_ZONES]{};
  float sum = 0.0f;
  uint8_t n = 0;
  for (uint8_t i = 0; i < MAX_ZONES; i++) {
    st.loop_share[i] = 0.0f;
    if (!samples[i].enabled)
      continue;
    n++;
    // Softplus-ish: negative debt still keeps a trickle so absorb loops stay open.
    // Debt already embeds UA·err·dt, so do not multiply by UA again.
    const float d = st.debt_kwh[i];
    weight[i] = (d > 0.0f) ? (d + DEBT_FLOOR_KWH) : (DEBT_FLOOR_KWH * 0.25f);
    sum += weight[i];
  }
  if (n == 0 || !(sum > 0.0f))
    return;
  for (uint8_t i = 0; i < MAX_ZONES; i++) {
    if (!samples[i].enabled)
      continue;
    st.loop_share[i] = weight[i] / sum;
  }
}

/// Map shares → openings under a target total opening, inverted through Kv.
inline void shares_to_openings(State &st, const ZoneSample samples[MAX_ZONES],
                               float target_total_opening_pct) {
  const float target = std::clamp(target_total_opening_pct, 0.0f, 600.0f);
  // First pass: opening ∝ share, then correct by relative Kv so low-authority
  // openings get a bump toward the linearised flow target.
  float raw_sum = 0.0f;
  for (uint8_t i = 0; i < MAX_ZONES; i++) {
    if (!samples[i].enabled) {
      st.opening_pct[i] = 0.0f;
      st.relative_kv[i] = 0.0f;
      continue;
    }
    float open = st.loop_share[i] * target;
    open = std::clamp(open, 0.0f, samples[i].max_opening_pct);
    st.opening_pct[i] = open;
    st.relative_kv[i] = kv_at_pct(open, samples[i].learned_open_ripples);
    raw_sum += open;
  }
  if (!(raw_sum > 0.01f) || !(target > 0.01f))
    return;
  // Scale to hit target total (respecting per-zone max).
  const float scale = target / raw_sum;
  float scaled_sum = 0.0f;
  for (uint8_t i = 0; i < MAX_ZONES; i++) {
    if (!samples[i].enabled)
      continue;
    st.opening_pct[i] =
        std::clamp(st.opening_pct[i] * scale, 0.0f, samples[i].max_opening_pct);
    st.relative_kv[i] = kv_at_pct(st.opening_pct[i], samples[i].learned_open_ripples);
    scaled_sum += st.opening_pct[i];
  }
  (void) scaled_sum;
}

/// One control step: update debt → shares → openings.
inline void step(State &st, const ZoneSample samples[MAX_ZONES], float dt_h,
                 float target_total_opening_pct) {
  update_debt(st, samples, dt_h);
  allocate_shares(st, samples);
  shares_to_openings(st, samples, target_total_opening_pct);
}

}  // namespace lv6::flow_allocator
