#!/usr/bin/env python3
"""
blog_poster.py — Post a Markdown blog to WordPress, Ghost, Medium, or a custom API.

Usage:
    python blog_poster.py --platform wordpress --url https://yourblog.com \
                          --user admin --password secret

    python blog_poster.py --platform ghost --url https://yourblog.ghost.io \
                          --api-key YOUR_ADMIN_API_KEY

    python blog_poster.py --platform medium --token YOUR_INTEGRATION_TOKEN

    python blog_poster.py --platform custom --url https://api.yourblog.com/posts \
                          --token YOUR_BEARER_TOKEN

Environment variables (override CLI flags):
    BLOG_PLATFORM, BLOG_URL, BLOG_USER, BLOG_PASSWORD,
    BLOG_API_KEY, BLOG_TOKEN
"""

import argparse
import base64
import hashlib
import json
import os
import sys
import time
from pathlib import Path

try:
    import urllib.request as urlrequest
    import urllib.error as urlerror
except ImportError:
    print("Python 3.x required.")
    sys.exit(1)

# ── Default blog file ────────────────────────────────────────────────────────

BLOG_FILE = Path(__file__).parent / "blog" / "ai-agents-2026.md"

# ── Helpers ──────────────────────────────────────────────────────────────────

def read_blog(path: Path) -> dict:
    """Read the Markdown file and extract title + body."""
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    title = lines[0].lstrip("# ").strip() if lines else "Untitled"
    body = "\n".join(lines[1:]).strip()
    return {"title": title, "body": body, "raw": text}


def http_request(url: str, data: dict, headers: dict, method: str = "POST") -> dict:
    """Minimal HTTP JSON request — no third-party libraries required."""
    payload = json.dumps(data).encode("utf-8")
    req = urlrequest.Request(url, data=payload, headers=headers, method=method)
    try:
        with urlrequest.urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urlerror.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code}: {body}") from exc
    except urlerror.URLError as exc:
        raise RuntimeError(f"Network error: {exc.reason}") from exc


# ── Platform posters ─────────────────────────────────────────────────────────

def post_wordpress(blog: dict, url: str, user: str, password: str) -> str:
    """Publish via WordPress REST API (Application Passwords)."""
    token = base64.b64encode(f"{user}:{password}".encode()).decode()
    endpoint = url.rstrip("/") + "/wp-json/wp/v2/posts"
    headers = {
        "Authorization": f"Basic {token}",
        "Content-Type": "application/json",
    }
    payload = {
        "title": blog["title"],
        "content": blog["body"],
        "status": "publish",
        "format": "standard",
    }
    result = http_request(endpoint, payload, headers)
    return result.get("link", result.get("guid", {}).get("rendered", "unknown"))


def post_ghost(blog: dict, url: str, api_key: str) -> str:
    """Publish via Ghost Admin API."""
    # Ghost Admin API key format: id:secret
    try:
        key_id, secret = api_key.split(":")
    except ValueError:
        raise ValueError("Ghost API key must be in 'id:secret' format.")

    now = int(time.time())
    header = base64.urlsafe_b64encode(
        json.dumps({"alg": "HS256", "typ": "JWT", "kid": key_id}).encode()
    ).rstrip(b"=").decode()
    payload_jwt = base64.urlsafe_b64encode(
        json.dumps({"iat": now, "exp": now + 300, "aud": "/admin/"}).encode()
    ).rstrip(b"=").decode()

    import hmac
    sig = base64.urlsafe_b64encode(
        hmac.new(
            bytes.fromhex(secret),
            f"{header}.{payload_jwt}".encode(),
            hashlib.sha256,
        ).digest()
    ).rstrip(b"=").decode()

    jwt_token = f"{header}.{payload_jwt}.{sig}"
    endpoint = url.rstrip("/") + "/ghost/api/admin/posts/?source=markdown"
    headers = {
        "Authorization": f"Ghost {jwt_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "posts": [
            {
                "title": blog["title"],
                "markdown": blog["body"],
                "status": "published",
            }
        ]
    }
    result = http_request(endpoint, payload, headers)
    posts = result.get("posts", [{}])
    return posts[0].get("url", "unknown")


def post_medium(blog: dict, token: str) -> str:
    """Publish via Medium Integration Token API."""
    # Get the authenticated user's ID first
    me_req = urlrequest.Request(
        "https://api.medium.com/v1/me",
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    with urlrequest.urlopen(me_req, timeout=30) as resp:
        me = json.loads(resp.read().decode())
    user_id = me["data"]["id"]

    endpoint = f"https://api.medium.com/v1/users/{user_id}/posts"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    payload = {
        "title": blog["title"],
        "contentFormat": "markdown",
        "content": blog["raw"],
        "publishStatus": "public",
        "tags": ["AI", "technology", "2026"],
    }
    result = http_request(endpoint, payload, headers)
    return result.get("data", {}).get("url", "unknown")


def post_custom(blog: dict, url: str, token: str) -> str:
    """POST JSON to a custom API endpoint with Bearer auth."""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }
    payload = {
        "title": blog["title"],
        "body": blog["body"],
        "format": "markdown",
        "tags": ["AI", "technology", "trending"],
    }
    result = http_request(url, payload, headers)
    return result.get("url", result.get("id", "posted successfully"))


# ── CLI ──────────────────────────────────────────────────────────────────────

def build_parser():
    p = argparse.ArgumentParser(
        description="Post a Markdown blog to WordPress, Ghost, Medium, or a custom API."
    )
    p.add_argument(
        "--file", default=str(BLOG_FILE),
        help="Path to the Markdown blog file (default: blog/ai-agents-2026.md)"
    )
    p.add_argument(
        "--platform",
        default=os.getenv("BLOG_PLATFORM", "custom"),
        choices=["wordpress", "ghost", "medium", "custom"],
        help="Target blog platform",
    )
    p.add_argument("--url", default=os.getenv("BLOG_URL", ""), help="Blog base URL")
    p.add_argument("--user", default=os.getenv("BLOG_USER", ""), help="Username (WordPress)")
    p.add_argument("--password", default=os.getenv("BLOG_PASSWORD", ""), help="Password (WordPress)")
    p.add_argument("--api-key", default=os.getenv("BLOG_API_KEY", ""), help="Admin API key (Ghost)")
    p.add_argument("--token", default=os.getenv("BLOG_TOKEN", ""), help="Bearer / Integration token")
    return p


def main():
    parser = build_parser()
    args = parser.parse_args()

    blog_path = Path(args.file)
    if not blog_path.exists():
        print(f"ERROR: Blog file not found: {blog_path}", file=sys.stderr)
        sys.exit(1)

    blog = read_blog(blog_path)
    print(f'Posting: "{blog["title"]}" ({len(blog["raw"])} chars)')
    print(f"Platform: {args.platform}")

    try:
        if args.platform == "wordpress":
            if not (args.url and args.user and args.password):
                parser.error("WordPress requires --url, --user, and --password")
            post_url = post_wordpress(blog, args.url, args.user, args.password)

        elif args.platform == "ghost":
            if not (args.url and args.api_key):
                parser.error("Ghost requires --url and --api-key")
            post_url = post_ghost(blog, args.url, args.api_key)

        elif args.platform == "medium":
            if not args.token:
                parser.error("Medium requires --token")
            post_url = post_medium(blog, args.token)

        else:  # custom
            if not (args.url and args.token):
                parser.error("Custom platform requires --url and --token")
            post_url = post_custom(blog, args.url, args.token)

        print(f"SUCCESS — Post published at: {post_url}")

    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
