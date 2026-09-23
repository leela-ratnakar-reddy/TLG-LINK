import secrets
import string

# 62 URL-safe characters: [a-zA-Z0-9]
ALPHABET = string.ascii_letters + string.digits


def generate_short_code(length: int = 7) -> str:
    """
    Generate a cryptographically secure, random, URL-safe short code.
    Length defaults to 7 characters, providing 62^7 (~3.5 trillion) combinations.
    """
    if length < 4 or length > 16:
        raise ValueError("Short code length must be between 4 and 16 characters.")
    return "".join(secrets.choice(ALPHABET) for _ in range(length))


def generate_analytics_token() -> str:
    """
    Generate a cryptographically secure, random private analytics token.
    Uses 32 bytes of secure entropy (43 URL-safe characters).
    Never derived from short_code, original URL, timestamp, or user info.
    """
    return secrets.token_urlsafe(32)
