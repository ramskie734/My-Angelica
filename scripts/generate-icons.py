"""Generate the My Angelica PWA icons (heart on lavender) without dependencies.

Run:  python3 scripts/generate-icons.py
Outputs into public/icons/: icon-192.png, icon-512.png,
apple-touch-icon.png (180x180) and maskable-512.png.

The PNGs are simple flat artwork kept in the repo so the PWA works out of the
box; replace them with your own branding any time (keep the same filenames).
"""
import struct
import zlib
from pathlib import Path

PINK = (236, 72, 153)
LAVENDER = (183, 159, 247)
WHITE = (255, 255, 255)


def heart_inside(x: float, y: float) -> bool:
    """Classic implicit heart curve, coordinates in [-1.5, 1.5]."""
    return (x * x + y * y - 1) ** 3 - x * x * y * y * y <= 0


def coverage(x: float, y: float, step: float) -> float:
    """Supersampled fraction of the pixel covered by the heart shape."""
    inside = 0
    samples = 0
    for dx in (0.25, 0.75):
        for dy in (0.25, 0.75):
            samples += 1
            if heart_inside(x - step * dx, y + step * dy):
                inside += 1
    return inside / samples


def blend(base, overlay, alpha):
    return tuple(round(base[i] * (1 - alpha) + overlay[i] * alpha) for i in range(3))


def rounded_outside(px: int, py: int, size: int, radius: int) -> bool:
    """True when the pixel falls outside the rounded-corner square."""
    corners = (
        (radius, radius),
        (size - radius, radius),
        (radius, size - radius),
        (size - radius, size - radius),
    )
    for cx, cy in corners:
        region_x = px < cx if cx < size / 2 else px >= cx
        region_y = py < cy if cy < size / 2 else py >= cy
        if region_x and region_y:
            if (px - cx) ** 2 + (py - cy) ** 2 > radius * radius:
                return True
    return False


def write_png(path: Path, pixels: list, size: int):
    """Minimal PNG writer (RGBA, no interlace)."""
    raw = b""
    for row in pixels:
        raw += b"\x00" + bytes(row)

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    path.write_bytes(png)


def make_icon(size: int, transparent: bool, scale: float = 1.0, path=None):
    """Render the heart icon at the given size."""
    radius = int(size * 0.22)
    step = 3.0 / size  # world units per pixel
    pixels = []
    for py in range(size):
        row = []
        for px in range(size):
            # Centered world coordinates.
            wx = (px / size - 0.5) * 3.0
            wy = (0.5 - py / size) * 3.0
            alpha_cov = coverage(wx * (1 / scale), wy * (1 / scale), step * (1 / scale))

            if transparent and rounded_outside(px, py, size, radius):
                row.extend((0, 0, 0, 0))
            else:
                color = blend(LAVENDER, PINK, alpha_cov)
                row.extend((*color, 255))
        pixels.append(row)

    write_png(path, pixels, size)


def main():
    out = Path(__file__).resolve().parent.parent / "public" / "icons"
    out.mkdir(parents=True, exist_ok=True)
    make_icon(192, True, path=out / "icon-192.png")
    make_icon(512, True, path=out / "icon-512.png")
    make_icon(180, False, path=out.parent.parent / "public" / "apple-touch-icon.png")
    # Maskable: full-bleed background with a smaller safe-zone heart.
    make_icon(512, False, scale=0.75, path=out / "maskable-512.png")
    print(f"Icons written to {out}")


if __name__ == "__main__":
    main()
