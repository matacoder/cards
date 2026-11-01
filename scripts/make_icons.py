"""Generate tray icons (card glyph) as PNG without external deps."""
import struct
import sys
import zlib
from pathlib import Path


def png(path, size, rgba):
    def px(x, y):
        s = size / 16
        # Card outline: rounded rect from (1,3) to (15,13), split line at y=8, right column at x=11.
        fx, fy = x / s, y / s
        inside = 1 <= fx < 15 and 3 <= fy < 13
        inner = 2.2 <= fx < 13.8 and 4.2 <= fy < 11.8
        corner = (fx < 2 or fx >= 14) and (fy < 4 or fy >= 12)
        border = inside and not inner and not corner
        split = 2 <= fx < 10.5 and 7.4 <= fy < 8.6
        column = 10.4 <= fx < 11.6 and 4 <= fy < 12
        return rgba if (border or split or column) else (0, 0, 0, 0)

    raw = b"".join(b"\x00" + b"".join(bytes(px(x, y)) for x in range(size)) for y in range(size))

    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    Path(path).write_bytes(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b""))


out = Path(sys.argv[1])
png(out / "trayTemplate.png", 16, (0, 0, 0, 255))
png(out / "trayTemplate@2x.png", 32, (0, 0, 0, 255))
png(out / "tray.png", 32, (31, 157, 85, 255))
