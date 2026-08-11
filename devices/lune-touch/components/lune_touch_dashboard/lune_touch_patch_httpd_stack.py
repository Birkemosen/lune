"""Increase ESP-IDF HTTP server stack for the Lune Touch dashboard."""

from pathlib import Path


Import("env")

project_dir = Path(env.subst("$PROJECT_DIR"))
source = project_dir / "src/esphome/components/web_server_idf/web_server_idf.cpp"
text = source.read_text(encoding="utf-8")

default_line = "  config.stack_size = config.stack_size + 256;"
safe_line = "  config.stack_size = 16384;"

if default_line in text:
    source.write_text(text.replace(default_line, safe_line, 1), encoding="utf-8")
elif safe_line not in text:
    raise RuntimeError(f"Unexpected ESPHome HTTP server source; cannot size {source}")
