import { NextRequest, NextResponse } from "next/server"

// Allowed domains for image proxy (security measure)
const ALLOWED_DOMAINS = [
  "d2kqew3hn5wphn.cloudfront.net",
  "localhost",
]

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 })
  }

  try {
    const parsedUrl = new URL(url)

    // Security check: only allow specific domains
    if (!ALLOWED_DOMAINS.includes(parsedUrl.hostname)) {
      return NextResponse.json({ error: "Domain not allowed" }, { status: 403 })
    }

    const response = await fetch(url, {
      headers: {
        "Accept": "image/*",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get("content-type") || "image/jpeg"
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("Image proxy error:", error)
    return NextResponse.json({ error: "Failed to proxy image" }, { status: 500 })
  }
}
