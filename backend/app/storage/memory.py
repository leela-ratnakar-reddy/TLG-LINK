from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
import threading
from typing import Dict, List, Optional

from app.models.url import ClickEvent, URLItem
from app.storage.base import BaseURLRepository


class InMemoryURLRepository(BaseURLRepository):
    """
    Thread-safe in-memory repository for V1 privacy-first architecture.
    Maintains dual O(1) indices (by code and by private analytics token)
    and stores click events per link without raw IP addresses.
    """

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._urls_by_code: Dict[str, URLItem] = {}
        self._urls_by_token: Dict[str, URLItem] = {}
        self._clicks_by_code: Dict[str, List[ClickEvent]] = defaultdict(list)

    def create(self, item: URLItem) -> URLItem:
        with self._lock:
            self._urls_by_code[item.short_code] = item
            self._urls_by_token[item.analytics_token] = item
            # Initialize empty click list
            if item.short_code not in self._clicks_by_code:
                self._clicks_by_code[item.short_code] = []
            return item

    def get_by_code(self, short_code: str) -> Optional[URLItem]:
        with self._lock:
            return self._urls_by_code.get(short_code)

    def get_by_token(self, analytics_token: str) -> Optional[URLItem]:
        with self._lock:
            return self._urls_by_token.get(analytics_token)

    def record_click(self, short_code: str, event: ClickEvent) -> Optional[URLItem]:
        with self._lock:
            item = self._urls_by_code.get(short_code)
            if not item:
                return None
            if item.is_expired:
                return item

            item.click_count += 1
            self._clicks_by_code[short_code].append(event)
            return item

    def delete_by_token(self, analytics_token: str) -> bool:
        with self._lock:
            item = self._urls_by_token.get(analytics_token)
            if not item:
                return False

            short_code = item.short_code
            if short_code in self._urls_by_code:
                del self._urls_by_code[short_code]
            if analytics_token in self._urls_by_token:
                del self._urls_by_token[analytics_token]
            if short_code in self._clicks_by_code:
                del self._clicks_by_code[short_code]

            return True

    def exists(self, short_code: str) -> bool:
        with self._lock:
            return short_code in self._urls_by_code

    def get_link_analytics(self, analytics_token: str) -> Optional[dict]:
        with self._lock:
            item = self._urls_by_token.get(analytics_token)
            if not item:
                return None

            clicks = self._clicks_by_code.get(item.short_code, [])
            now_utc = datetime.now(timezone.utc)

            cutoff_24h = now_utc - timedelta(hours=24)
            cutoff_7d = now_utc - timedelta(days=7)
            cutoff_30d = now_utc - timedelta(days=30)

            total_clicks = len(clicks)
            clicks_today = sum(1 for c in clicks if c.timestamp >= cutoff_24h)
            clicks_7d = sum(1 for c in clicks if c.timestamp >= cutoff_7d)
            clicks_30d = sum(1 for c in clicks if c.timestamp >= cutoff_30d)

            # Timeline aggregation
            daily_counts: Dict[str, int] = defaultdict(int)
            for c in clicks:
                day_str = c.timestamp.strftime("%Y-%m-%d")
                daily_counts[day_str] += 1

            timeline = [
                {"date": d, "clicks": count}
                for d, count in sorted(daily_counts.items())
            ]

            # Categorical breakdown helper
            def _build_breakdown(counter: Counter, default_label: str = "Direct") -> List[dict]:
                if not counter:
                    return []
                total = sum(counter.values())
                result = []
                for label, count in counter.most_common():
                    pct = round((count / total) * 100, 1) if total > 0 else 0.0
                    display_label = label if label else default_label
                    result.append({"label": display_label, "count": count, "percentage": pct})
                return result

            device_counter = Counter(c.device for c in clicks if c.device)
            browser_counter = Counter(c.browser for c in clicks if c.browser)
            os_counter = Counter(c.os for c in clicks if c.os)
            referrer_counter = Counter(c.referrer for c in clicks if c.referrer)
            # Count direct if referrer is None
            direct_count = sum(1 for c in clicks if not c.referrer)
            if direct_count > 0:
                referrer_counter["Direct"] = direct_count

            # Recent activity (last 20 events, newest first)
            recent_clicks = sorted(clicks, key=lambda c: c.timestamp, reverse=True)[:20]
            recent_activity = [
                {
                    "timestamp": c.timestamp,
                    "device": c.device,
                    "browser": c.browser,
                    "os": c.os,
                    "referrer": c.referrer or "Direct",
                }
                for c in recent_clicks
            ]

            return {
                "short_code": item.short_code,
                "original_url": item.original_url,
                "created_at": item.created_at,
                "expires_at": item.expires_at,
                "is_expired": item.is_expired,
                "total_clicks": total_clicks,
                "clicks_today": clicks_today,
                "clicks_7d": clicks_7d,
                "clicks_30d": clicks_30d,
                "timeline": timeline,
                "devices": _build_breakdown(device_counter, "Unknown"),
                "browsers": _build_breakdown(browser_counter, "Unknown"),
                "operating_systems": _build_breakdown(os_counter, "Unknown"),
                "referrers": _build_breakdown(referrer_counter, "Direct"),
                "recent_activity": recent_activity,
            }

    def clear(self) -> None:
        """Helper for test suites to reset repository state."""
        with self._lock:
            self._urls_by_code.clear()
            self._urls_by_token.clear()
            self._clicks_by_code.clear()
