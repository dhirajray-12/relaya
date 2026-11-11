// Writes static HTML for the public marketing pages after `vite build`:
//   dist/<path>.html   the page's content in #root, with its own title, description,
//                      canonical URL, Open Graph tags and structured data
//   dist/sitemap.xml
// IIS serves /<path> from <path>.html when that file exists (see web.config), and the
// app takes over in the browser. Run by `npm run build`.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const web = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(web, 'dist')
const ssr = join(web, 'dist-ssr')
const { render, paths, PAGES, SITE, fullTitle, faqs } = await import(pathToFileURL(join(ssr, 'prerender.js')).href)

const template = readFileSync(join(dist, 'index.html'), 'utf8')
const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// JSON inside <script>: "</" can't close the tag.
const json = (v) => JSON.stringify(v).replace(/</g, '\\u003c')

const org = { '@type': 'Organization', name: 'Relaya', url: SITE, logo: `${SITE}/logo.jpg`, email: 'info@relaya.sbs' }

function structuredData(path, m) {
  const url = SITE + path
  const parts = path.split('/').filter(Boolean)
  const crumbs = {
    '@type': 'BreadcrumbList',
    // Home, then each ancestor that is a page of its own (/integrations alone is not).
    itemListElement: ['/', ...parts.map((_, i) => '/' + parts.slice(0, i + 1).join('/')).filter((p) => PAGES[p])].map((p, i) => ({
      '@type': 'ListItem', position: i + 1, name: p === '/' ? 'Home' : PAGES[p].title, item: SITE + p,
    })),
  }
  const graph = [org, crumbs]
  if (m.article) {
    graph.push({
      '@type': 'BlogPosting', headline: m.title, description: m.description, url, mainEntityOfPage: url,
      datePublished: m.article.published, dateModified: m.article.modified, author: { '@type': 'Organization', name: 'Relaya' }, publisher: org, image: `${SITE}/logo.jpg`,
    })
  }
  if (faqs[path]) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqs[path].map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
    })
  }
  return { '@context': 'https://schema.org', '@graph': graph }
}

function page(path) {
  const m = PAGES[path]
  const title = fullTitle(m)
  const url = SITE + path
  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${esc(m.description)}" />`)
    .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${esc(title)}" />`)
    .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${esc(m.description)}" />`)
    .replace(/<meta property="og:image" content="\/logo\.jpg"[^>]*>/, `<meta property="og:image" content="${SITE}/logo.jpg" />`)
  const head = [
    `<link rel="canonical" href="${url}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="${m.article ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="Relaya" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<script type="application/ld+json">${json(structuredData(path, m))}</script>`,
  ].join('\n    ')
  html = html.replace('</head>', `    ${head}\n  </head>`)
  return html.replace('<div id="root"></div>', `<div id="root">${render(path)}</div>`)
}

for (const path of paths) {
  if (!PAGES[path]?.prerender) continue
  const file = join(dist, path.slice(1) + '.html')
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, page(path))
}

// Sitemap: the landing page, every marketing page, and the other public pages.
const today = new Date().toISOString().slice(0, 10)
const urls = ['/', ...paths, '/security', '/status', '/terms', '/privacy']
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((p) => `  <url><loc>${SITE}${p === '/' ? '/' : p}</loc><lastmod>${PAGES[p]?.article?.modified ?? today}</lastmod></url>`).join('\n')}
</urlset>
`
writeFileSync(join(dist, 'sitemap.xml'), sitemap)
rmSync(ssr, { recursive: true, force: true })
console.log(`prerendered ${paths.length} pages, sitemap with ${urls.length} URLs`)
