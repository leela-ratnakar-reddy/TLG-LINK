import re
from typing import Optional, Tuple
from urllib.parse import urlparse


def parse_user_agent(ua_string: Optional[str]) -> Tuple[str, str, str]:
    """
    Lightweight, deterministic user agent parser.
    Extracts (device, browser, os) without external network calls or heavy libraries.
    """
    if not ua_string:
        return "Unknown", "Unknown", "Unknown"

    ua = ua_string.lower()

    # 1. Device Type
    if "tablet" in ua or "ipad" in ua or ("android" in ua and "mobile" not in ua):
        device = "Tablet"
    elif "mobile" in ua or "iphone" in ua or "ipod" in ua or "android" in ua or "webos" in ua:
        device = "Mobile"
    else:
        device = "Desktop"

    # 2. Operating System
    if "iphone" in ua or "ipad" in ua or "ipod" in ua:
        os = "iOS"
    elif "windows" in ua:
        os = "Windows"
    elif "android" in ua:
        os = "Android"
    elif "macintosh" in ua or "mac os x" in ua:
        os = "macOS"
    elif "linux" in ua:
        os = "Linux"
    else:
        os = "Other"

    # 3. Browser
    if "edg/" in ua or "edge/" in ua:
        browser = "Edge"
    elif "opr/" in ua or "opera" in ua:
        browser = "Opera"
    elif "chrome/" in ua and "chromium" not in ua:
        browser = "Chrome"
    elif "firefox/" in ua:
        browser = "Firefox"
    elif "safari/" in ua and "chrome/" not in ua:
        browser = "Safari"
    else:
        browser = "Other"

    return device, browser, os


def clean_referrer(referrer: Optional[str]) -> Optional[str]:
    """
    Strips query parameters and paths for privacy.
    Preserves only domain/hostname (e.g., 'github.com', 'google.com', 't.co').
    """
    if not referrer:
        return None
    try:
        parsed = urlparse(referrer)
        if parsed.netloc:
            # Strip port and 'www.'
            netloc = parsed.netloc.split(":")[0].lower()
            if netloc.startswith("www."):
                netloc = netloc[4:]
            return netloc
        return None
    except Exception:
        return None
