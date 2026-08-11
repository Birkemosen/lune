import csv
import io
import importlib.util
from pathlib import Path
import unittest


MODULE_PATH = (
    Path(__file__).parents[2]
    / "hardware/lune-v6-rev3.1-lean/analyze_rev31_trace.py"
)
SPEC = importlib.util.spec_from_file_location("analyze_rev31_trace", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)


HEADER = [
    "t_ms", "motion_count", "current_ma", "adc_current_raw", "drive_on",
    "bemf_raw_a", "bemf_raw_b", "bemf_differential_raw",
    "bemf_separation_us", "bemf_valid", "bemf_moving",
    "invalid_bemf_samples",
]


def trace(rows):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(HEADER)
    writer.writerows(rows)
    output.seek(0)
    return output


class Rev31TraceAnalysisTest(unittest.TestCase):
    def test_reports_separated_motion_and_stopped_populations(self):
        rows = []
        for index in range(10):
            moving = index < 6
            diff = 90 + index if moving else 10 + index
            rows.append([index * 20, index if moving else 6, 20 + index, 65535,
                         1, 1000, 1000 + diff, diff, 18, 1, int(moving), 0])
        report = MODULE.analyze(MODULE.parse_rows(trace(rows)))
        self.assertEqual(report["samples"], 10)
        self.assertEqual(report["sample_period_ms"]["median"], 20)
        self.assertGreater(report["bemf"]["separation_margin_raw"], 0)
        self.assertEqual(report["warnings"], [])

    def test_flags_invalid_timing_and_missing_motion(self):
        rows = [
            [0, 0, 18, 65535, 1, 1000, 1005, 5, 55, 0, 0, 3],
            [20, 0, 19, 65535, 1, 1000, 1006, 6, 56, 0, 0, 3],
        ]
        report = MODULE.analyze(MODULE.parse_rows(trace(rows)))
        self.assertIn("trace contains invalid BEMF sample pairs", report["warnings"])
        self.assertIn("firmware sensor-fault threshold was reached", report["warnings"])
        self.assertIn("no qualified motion was observed", report["warnings"])
        self.assertIn("A/B sample separation exceeded the prototype 50 us limit", report["warnings"])

    def test_rejects_non_monotonic_time(self):
        rows = [
            [20, 1, 20, 65535, 1, 1000, 1100, 100, 18, 1, 1, 0],
            [10, 2, 20, 65535, 1, 1000, 1100, 100, 18, 1, 1, 0],
        ]
        with self.assertRaisesRegex(ValueError, "non-monotonic"):
            MODULE.parse_rows(trace(rows))


if __name__ == "__main__":
    unittest.main()
