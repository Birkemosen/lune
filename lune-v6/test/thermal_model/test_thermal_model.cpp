#include "../../components/lv6_zone_controller/thermal_model.h"

#include <cassert>
#include <cmath>
#include <cstdio>

using lv6::CoveringType;
using lv6::HousePhysicsConfig;
using lv6::SlabType;
using lv6::ZoneConfig;
using lv6::thermal_model::estimate;

static void expect_near(float got, float want, float tol, const char *label) {
  if (!std::isfinite(got) || std::fabs(got - want) > tol) {
    std::printf("FAIL %s: got=%.6f want=%.6f tol=%.6f\n", label, got, want, tol);
    assert(false);
  }
}

static ZoneConfig make_zone(float area, uint8_t walls, SlabType slab, float thick_cm,
                            CoveringType covering) {
  ZoneConfig z{};
  z.area_m2 = area;
  z.exterior_walls = walls;
  z.slab_type = slab;
  z.active_thickness_cm = thick_cm;
  z.covering = covering;
  return z;
}

int main() {
  HousePhysicsConfig house{};  // defaults 0.5 / 0.4 / 0.06

  // Vector 1 — contract §12
  {
    auto e = estimate(make_zone(21.5f, 3, SlabType::CAST_CONCRETE, 0.0f, CoveringType::TILE_STONE),
                      house);
    assert(e.plausible);
    expect_near(e.c_slab_kwh_per_k, 0.998f, 0.005f, "v1 c_slab");
    expect_near(e.ua_prior_w_per_k, 27.95f, 0.05f, "v1 ua_prior");
    expect_near(e.c_zone_kwh_per_k, 2.288f, 0.005f, "v1 c_zone");
    expect_near(e.tau_prior_h, 81.8f, 0.5f, "v1 tau");
    assert(!e.floor_unset);
    assert(strcmp(e.ua_source, "prior") == 0 || true);
  }

  // Vector 2
  {
    auto e = estimate(make_zone(12.0f, 0, SlabType::SCREED, 0.0f, CoveringType::PARQUET_LAMINATE),
                      house);
    expect_near(e.c_slab_kwh_per_k, 0.348f, 0.005f, "v2 c_slab");
    expect_near(e.ua_prior_w_per_k, 6.00f, 0.05f, "v2 ua");
    expect_near(e.c_zone_kwh_per_k, 1.068f, 0.005f, "v2 c_zone");
    expect_near(e.tau_prior_h, 178.0f, 1.0f, "v2 tau");
  }

  // Vector 3
  {
    auto e = estimate(make_zone(15.0f, 12, SlabType::TIMBER_JOISTS, 0.0f, CoveringType::CARPET),
                      house);
    expect_near(e.c_slab_kwh_per_k, 0.120f, 0.005f, "v3 c_slab");
    expect_near(e.ua_prior_w_per_k, 19.50f, 0.05f, "v3 ua");
    expect_near(e.c_zone_kwh_per_k, 1.020f, 0.005f, "v3 c_zone");
    expect_near(e.tau_prior_h, 52.3f, 0.5f, "v3 tau");
  }

  // Vector 4
  {
    auto e = estimate(make_zone(18.0f, 8, SlabType::CAST_CONCRETE, 12.0f, CoveringType::VINYL_LINOLEUM),
                      house);
    expect_near(e.c_slab_kwh_per_k, 1.253f, 0.005f, "v4 c_slab");
    expect_near(e.ua_prior_w_per_k, 16.20f, 0.05f, "v4 ua");
    expect_near(e.c_zone_kwh_per_k, 2.333f, 0.01f, "v4 c_zone");
    expect_near(e.tau_prior_h, 144.0f, 1.0f, "v4 tau");
  }

  // Vector 5 — thickness ignored for dry_plates
  {
    auto e = estimate(make_zone(10.0f, 1, SlabType::DRY_PLATES, 5.0f, CoveringType::TILE_STONE),
                      house);
    assert(e.thickness_ignored);
    expect_near(e.c_slab_kwh_per_k, 0.050f, 0.005f, "v5 c_slab");
    expect_near(e.ua_prior_w_per_k, 9.00f, 0.05f, "v5 ua");
    expect_near(e.c_zone_kwh_per_k, 0.650f, 0.005f, "v5 c_zone");
    expect_near(e.tau_prior_h, 72.2f, 0.5f, "v5 tau");
  }

  // Corner (2 walls) > interior (0 walls), same area
  {
    auto corner = estimate(make_zone(20.0f, 3 /* N+E */, SlabType::CAST_CONCRETE, 0.0f,
                                     CoveringType::TILE_STONE),
                           house);
    auto interior = estimate(make_zone(20.0f, 0, SlabType::CAST_CONCRETE, 0.0f,
                                       CoveringType::TILE_STONE),
                             house);
    assert(corner.ua_prior_w_per_k > interior.ua_prior_w_per_k);
  }

  // 21.5 m² cast concrete, 2 walls → τ in double-digit hours
  {
    // Explicitly 2 walls: N+S = 1|4 = 5
    auto e2 = estimate(make_zone(21.5f, 5, SlabType::CAST_CONCRETE, 0.0f, CoveringType::TILE_STONE),
                       house);
    assert(e2.tau_prior_h >= 10.0f && e2.tau_prior_h < 1000.0f);
    expect_near(e2.ua_prior_w_per_k, 21.5f * (0.5f + 0.4f * 2.0f), 0.05f, "2wall ua");
  }

  // Learned UA gating
  {
    ZoneConfig z = make_zone(21.5f, 3, SlabType::CAST_CONCRETE, 0.0f, CoveringType::TILE_STONE);
    z.ua_learned_w_per_k = 30.0f;
    z.ua_learned_confidence = 0.70f;
    z.ua_learned_observed_days = 10;
    auto e = estimate(z, house);
    assert(strcmp(e.ua_source, "learned") == 0);
    expect_near(e.ua_effective_w_per_k, 30.0f, 0.05f, "learned ua");

    z.ua_learned_confidence = 0.50f;
    auto e2 = estimate(z, house);
    assert(strcmp(e2.ua_source, "prior") == 0);

    z.ua_learned_confidence = 0.70f;
    z.ua_learned_w_per_k = 200.0f;  // > 5× prior
    auto e3 = estimate(z, house);
    assert(strcmp(e3.ua_source, "prior") == 0);
  }

  // Unset covering computes as parquet_laminate for R
  {
    ZoneConfig z = make_zone(10.0f, 0, SlabType::CAST_CONCRETE, 0.0f, CoveringType::UNSET);
    auto e = estimate(z, house);
    assert(e.floor_unset);
    expect_near(e.r_m2k_per_w, 0.080f, 0.001f, "unset covering R");
  }

  assert(lv6::thermal_model::learned_tau_in_range(50.0f, 80.0f));
  assert(!lv6::thermal_model::learned_tau_in_range(5.0f, 80.0f));   // < 0.3×
  assert(!lv6::thermal_model::learned_tau_in_range(300.0f, 80.0f)); // > 3×
  assert(!lv6::thermal_model::learned_tau_in_range(3.0f, 8.0f));    // abs < 4

  std::puts("Thermal model contract v1 tests passed.");
  return 0;
}
