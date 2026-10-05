#!/usr/bin/env python3
"""Write the ESP-Web-Tools / ESPHome update manifest for a Lune V6 release.

The same file serves two consumers:

* ESP-Web-Tools (`builds[].parts`) for a first USB flash of the factory image.
* ESPHome's `update: platform: http_request` (`builds[].ota`), which matches
  `chipFamily` against its own variant, then downloads `ota.path` and verifies
  it against `ota.md5`.

`version` must match the firmware's project version exactly (the stamped
`firmware_version` from version.yaml, e.g. `v1.2.3`), because the device
compares the two strings to decide whether an update is available.

Usage:
    generate_manifest.py --version v1.2.3 \
        --ota-bin dist/lune-v6-v1.2.3.ota.bin \
        --output dist/manifest-lune-v6.json
"""

from __future__ import annotations

import argparse
import hashlib
import json
import pathlib
import re
import sys

NAME = "Lune V6"
CHIP_FAMILY = "ESP32-S3"
RELEASE_BASE = "https://github.com/birkemosen/lune/releases"
# `latest/download` keeps a published manifest valid for the newest release
# without rewriting older assets.
DOWNLOAD_BASE = f"{RELEASE_BASE}/latest/download"


def md5_of(path: pathlib.Path) -> str:
    digest = hashlib.md5()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def normalize_version(version: str) -> str:
    version = version.strip()
    if not re.fullmatch(r"v?\d+\.\d+\.\d+", version):
        raise SystemExit(f"invalid --version {version!r}; expected v1.2.3")
    return version if version.startswith("v") else f"v{version}"


def build_manifest(version: str, ota_bin: pathlib.Path, factory_name: str) -> dict:
    return {
        "name": NAME,
        "version": version,
        "builds": [
            {
                "chipFamily": CHIP_FAMILY,
                "ota": {
                    "md5": md5_of(ota_bin),
                    "path": f"{DOWNLOAD_BASE}/{ota_bin.name}",
                    "release_url": f"{RELEASE_BASE}/tag/{version}",
                },
                "parts": [
                    {
                        "path": f"{DOWNLOAD_BASE}/{factory_name}",
                        "offset": 0,
                    }
                ],
            }
        ],
    }


def main(argv: list[str]) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--version", required=True, help="release version, e.g. v1.2.3")
    parser.add_argument(
        "--ota-bin",
        required=True,
        type=pathlib.Path,
        help="path to the release .ota.bin (its file name is used in the manifest)",
    )
    parser.add_argument(
        "--factory-name",
        default=None,
        help="factory image file name (default: derived from --ota-bin)",
    )
    parser.add_argument(
        "--output",
        required=True,
        type=pathlib.Path,
        help="manifest output path",
    )
    args = parser.parse_args(argv[1:])

    ota_bin: pathlib.Path = args.ota_bin
    if not ota_bin.is_file():
        raise SystemExit(f"OTA image not found: {ota_bin}")

    version = normalize_version(args.version)
    factory_name = args.factory_name or ota_bin.name.replace(".ota.bin", ".factory.bin")

    manifest = build_manifest(version, ota_bin, factory_name)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(manifest, indent=2) + "\n")
    print(f"manifest {args.output} -> {version} ({manifest['builds'][0]['ota']['md5']})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
