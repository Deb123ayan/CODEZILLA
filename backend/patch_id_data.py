"""
patch_id_data.py
──────────────────────────────────────────────────────────────────
Adds realistic aadhaar_number and pan_number to EVERY entry in
mock_platform_users.json that is missing them.

Aadhaar format : XXXX XXXX XXXX  (12 digits, seeded from pk so deterministic)
PAN format     : ABCDE1234F       (5 upper alpha + 4 digits + 1 upper alpha)
                  first 5 chars derived from the worker's name

Run from the backend directory:
    python patch_id_data.py
"""

import json, random, string, pathlib, re

SRC = pathlib.Path(__file__).parent / "mock_platform_users.json"

# ── helpers ──────────────────────────────────────────────────────────────────

def gen_aadhaar(pk: int) -> str:
    """Deterministic Aadhaar from pk seed, but looks random."""
    rng = random.Random(pk * 9_999_991 + 7)
    digits = "".join(str(rng.randint(0, 9)) for _ in range(12))
    return f"{digits[:4]} {digits[4:8]} {digits[8:]}"


def gen_pan(pk: int, name: str) -> str:
    """
    PAN: AAAAA1111A
     - First 5 chars: uppercased letters derived from name (padded with XXXXX)
     - Next 4 chars: digits seeded from pk
     - Last char  : letter seeded from pk
    """
    rng = random.Random(pk * 1_000_003 + 13)
    alpha_only = re.sub(r"[^a-zA-Z]", "", name).upper()
    first5 = (alpha_only + "XXXXX")[:5]
    digits4 = "".join(str(rng.randint(0, 9)) for _ in range(4))
    last = rng.choice(string.ascii_uppercase)
    return f"{first5}{digits4}{last}"


# ── main ─────────────────────────────────────────────────────────────────────

def main():
    data = json.loads(SRC.read_text(encoding="utf-8"))
    changed = 0
    for entry in data:
        if entry.get("model") != "users.mockplatformdata":
            continue
        pk     = entry["pk"]
        fields = entry["fields"]
        name   = fields.get("name", "X")

        if not fields.get("aadhaar_number"):
            fields["aadhaar_number"] = gen_aadhaar(pk)
            changed += 1

        if not fields.get("pan_number"):
            fields["pan_number"] = gen_pan(pk, name)
            changed += 1

    SRC.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"✅ Done — updated {changed} fields across {len(data)} entries.")


if __name__ == "__main__":
    main()
