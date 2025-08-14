// Simple Bun server to serve the HTML demo
const server = Bun.serve({
  port: 3000,

  async fetch(req) {
    const url = new URL(req.url)

    // Serve the main HTML page
    if (url.pathname === '/' || url.pathname === '/index.html') {
      const html = await Bun.file('./index.html').text()
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      })
    }

    // Serve translation JSON files
    if (url.pathname.startsWith('/dist/i18n/') && url.pathname.endsWith('.json')) {
      try {
        const file = Bun.file(`.${url.pathname}`)
        const content = await file.text()
        return new Response(content, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        })
      }
      catch {
        return new Response('Translation file not found', { status: 404 })
      }
    }

    // Serve static files from dist
    if (url.pathname.startsWith('/dist/')) {
      try {
        const file = Bun.file(`.${url.pathname}`)
        return new Response(file)
      }
      catch {
        return new Response('File not found', { status: 404 })
      }
    }

    return new Response('Not found', { status: 404 })
  },
})

console.log(`🌐 Server running at http://localhost:${server.port}`)
console.log('📁 Serving translation files from dist/i18n/')
console.log('🔥 Hot reload enabled - changes will auto-refresh')
