#pragma once
#include <cstdint>
#include <cstdio>
#include <cstring>

namespace hv6_authority {
static constexpr uint32_t DEFAULT_LEASE_MS = 90000;
static constexpr uint32_t MIN_LEASE_MS = 30000;
static constexpr uint32_t MAX_LEASE_MS = 120000;
static constexpr uint32_t RECOVERY_STABLE_MS = 120000;
enum class State : uint8_t { NO_PUBLISHER, NORMAL_TOUCH, TOUCH_DEGRADED, V6_FALLBACK_PENDING, V6_FALLBACK_ACTIVE, TOUCH_RECOVERY_PENDING, AUTHORITY_CONFLICT };
enum class Result : uint8_t { GRANTED, RENEWED, PENDING, AUTH_REQUIRED, INVALID, IDENTITY_MISMATCH, REPLAYED, CONFLICT };
struct Request { const char *installation_id{}; const char *coordinator_id{}; const char *lease_id{}; uint32_t sequence{}; uint32_t issued_ms{}; uint32_t duration_ms{DEFAULT_LEASE_MS}; bool degraded{}; };
struct Snapshot { State state{State::NO_PUBLISHER}; bool touch_lease_active{}; uint32_t lease_generation{}; uint32_t expires_at_ms{}; uint32_t remaining_ms{}; char installation_id[32]{}; char coordinator_id[32]{}; char lease_id[32]{}; char last_reason[32]{"boot"}; };
inline const char *state_name(State s) { switch (s) { case State::NORMAL_TOUCH:return "touch_normal"; case State::TOUCH_DEGRADED:return "touch_degraded"; case State::V6_FALLBACK_PENDING:return "v6_fallback_pending"; case State::V6_FALLBACK_ACTIVE:return "v6_fallback_active"; case State::TOUCH_RECOVERY_PENDING:return "touch_recovery_pending"; case State::AUTHORITY_CONFLICT:return "conflict"; default:return "no_publisher"; } }
inline const char *result_name(Result r) { switch (r) { case Result::GRANTED:return "granted"; case Result::RENEWED:return "renewed"; case Result::PENDING:return "recovery_pending"; case Result::AUTH_REQUIRED:return "auth_required"; case Result::INVALID:return "invalid"; case Result::IDENTITY_MISMATCH:return "identity_mismatch"; case Result::REPLAYED:return "replayed"; default:return "conflict"; } }
class Lease {
 public:
  void configure(const char *i, const char *c) { bool changed=std::strcmp(installation_,i?i:"")||std::strcmp(coordinator_,c?c:""); copy_(installation_,sizeof installation_,i); copy_(coordinator_,sizeof coordinator_,c); if(changed&&active_) reset_after_boot(); }
  void reset_after_boot() { active_=false; expires_=generation_=sequence_=recovery_=0; lease_id_[0]='\0'; state_=State::NO_PUBLISHER; copy_(reason_,sizeof reason_,"boot_no_lease"); }
  Result acquire_or_renew(const Request &r,bool auth,uint32_t now) { expire_if_needed(now); if(!auth)return reject_(Result::AUTH_REQUIRED,"auth_required"); if(!valid_(r))return reject_(Result::INVALID,"invalid_lease"); if(!installation_[0]||!coordinator_[0])return reject_(Result::IDENTITY_MISMATCH,"identity_unconfigured"); if(std::strcmp(installation_,r.installation_id)||std::strcmp(coordinator_,r.coordinator_id))return reject_(Result::IDENTITY_MISMATCH,"identity_mismatch"); if(r.sequence<=sequence_)return reject_(Result::REPLAYED,"replayed_sequence"); if(state_==State::AUTHORITY_CONFLICT)return reject_(Result::CONFLICT,"conflict_latched"); if(state_==State::V6_FALLBACK_ACTIVE||state_==State::TOUCH_RECOVERY_PENDING){ if(!recovery_){recovery_=now;state_=State::TOUCH_RECOVERY_PENDING;return reject_(Result::PENDING,"recovery_stabilizing");} if((int32_t)(now-recovery_)<static_cast<int32_t>(RECOVERY_STABLE_MS))return reject_(Result::PENDING,"recovery_stabilizing"); } if(active_&&std::strcmp(lease_id_,r.lease_id)){state_=State::AUTHORITY_CONFLICT;copy_(reason_,sizeof reason_,"conflicting_lease");return Result::CONFLICT;} bool renewal=active_; active_=true; state_=r.degraded?State::TOUCH_DEGRADED:State::NORMAL_TOUCH; sequence_=r.sequence; generation_++; expires_=now+r.duration_ms; recovery_=0; copy_(lease_id_,sizeof lease_id_,r.lease_id); copy_(reason_,sizeof reason_,renewal?"lease_renewed":"lease_granted"); return renewal?Result::RENEWED:Result::GRANTED; }
  void expire_if_needed(uint32_t now) { if(active_&&(int32_t)(now-expires_)>=0){active_=false;state_=State::V6_FALLBACK_PENDING;copy_(reason_,sizeof reason_,"lease_expired");} }
  bool touch_lease_active(uint32_t now) { expire_if_needed(now); return active_ && state_ != State::AUTHORITY_CONFLICT; }
  bool activate_fallback_if_due(uint32_t now, bool leader) { expire_if_needed(now); if (!leader || state_ != State::V6_FALLBACK_PENDING || (int32_t)(now-expires_) < 30000) return false; state_ = State::V6_FALLBACK_ACTIVE; copy_(reason_, sizeof reason_, "lease_guard_elapsed"); return true; }
  Snapshot snapshot(uint32_t now) { expire_if_needed(now); Snapshot s{}; s.state=state_;s.touch_lease_active=active_;s.lease_generation=generation_;s.expires_at_ms=expires_;s.remaining_ms=active_?expires_-now:0;copy_(s.installation_id,sizeof s.installation_id,installation_);copy_(s.coordinator_id,sizeof s.coordinator_id,coordinator_);copy_(s.lease_id,sizeof s.lease_id,lease_id_);copy_(s.last_reason,sizeof s.last_reason,reason_);return s; }
 private:
  static void copy_(char *o,size_t n,const char *v){if(n)std::snprintf(o,n,"%s",v?v:"");}
  static bool valid_(const Request&r){return r.installation_id&&r.installation_id[0]&&r.coordinator_id&&r.coordinator_id[0]&&r.lease_id&&r.lease_id[0]&&r.sequence&&r.duration_ms>=MIN_LEASE_MS&&r.duration_ms<=MAX_LEASE_MS;}
  Result reject_(Result r,const char *why){copy_(reason_,sizeof reason_,why);return r;}
  char installation_[32]{},coordinator_[32]{},lease_id_[32]{},reason_[32]{"boot"}; State state_{State::NO_PUBLISHER}; bool active_{}; uint32_t generation_{},sequence_{},expires_{},recovery_{};
};
}
