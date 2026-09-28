# Evidencia completa de fechas

Consulta inicial literal: noticias Nicaragua hoy. Prueba final en /api/chat: noticias de Nicaragua hoy.

La API incluye date e iso_date. Fecha de publicación no verifica fecha del evento. 55 tests pasaron. La prueba final devuelve solo publicaciones del día local, sin atribuir el día al evento; en esta ejecución no se recuperaron cuerpos de artículos y se avisó explícitamente.

## verification/dates/01-provider-raw.json

```json
{
  "search_metadata": {
    "id": "6abaf7bfff3b7a8929b14f34",
    "status": "Success",
    "json_endpoint": "https://serpapi.com/searches/fU7f4afyZ2yo7g2QlTVWtgieqpsLcvUG4IETUQvNrg8/6abaf7bfff3b7a8929b14f34.json",
    "markdown_endpoint": "https://serpapi.com/searches/fU7f4afyZ2yo7g2QlTVWtgieqpsLcvUG4IETUQvNrg8/6abaf7bfff3b7a8929b14f34.md",
    "created_at": "2026-09-28 23:26:55 UTC",
    "processed_at": "2026-09-28 23:26:55 UTC",
    "google_news_url": "https://news.google.com/search?q=noticias+Nicaragua+hoy&hl=es&gl=NI",
    "raw_html_file": "https://serpapi.com/searches/fU7f4afyZ2yo7g2QlTVWtgieqpsLcvUG4IETUQvNrg8/6abaf7bfff3b7a8929b14f34.html",
    "total_time_taken": 0.69
  },
  "search_parameters": {
    "engine": "google_news",
    "gl": "ni",
    "hl": "es",
    "q": "noticias Nicaragua hoy"
  },
  "news_results": [
    {
      "position": 1,
      "title": "Curazao vs Nicaragua: resumen, goles y resultado del partido de la Concacaf Nations League 2026",
      "source": {
        "name": "Claro Sports",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://www.clarosports.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.clarosports.com/futbol/concacaf-nations-league/curazao-vs-nicaragua-en-vivo-goles-y-resultado-del-partido-de-la-concacaf-nations-league-2026-hoy-27-de-septiembre/",
      "thumbnail": "https://cdn.amxinfra.com/clarosports/images/2026/09/directo-generico-2-165359-1024x576.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNXhlbmcxVXpWclNFWlVOV1pVVFJDZkF4ampCU2dLTWdZRmtvN2xOUVk",
      "date": "09/28/2026, 01:53 AM, +0000 UTC",
      "iso_date": "2026-09-28T01:53:04Z"
    },
    {
      "position": 2,
      "title": "Nicaragua: Muerte de Brooklyn Rivera bajo custodia estatal debe ser investigada con prontitud y de manera efectiva e independiente",
      "source": {
        "name": "Amnesty International",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.amnesty.org&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.amnesty.org/es/latest/news/2026/06/nicaragua-muerte-de-brooklyn-rivera-bajo-custodia-estatal-debe-ser-investigada-con-prontitud-y-de-manera-efectiva-e-independiente/",
      "thumbnail": "https://www.amnesty.org/es/wp-content/uploads/sites/4/2026/06/Copia-de-Copia-de-Brooklyn-2-1468x710.png",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVFTMjFGZVhGdVZFeEhUVGd3VFJDQkF4aWNCaWdLTWdhQklaeFNFUXM",
      "date": "06/01/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-06-01T07:00:00Z"
    },
    {
      "position": 3,
      "title": "EE.UU. advierte a Daniel Ortega que no se quedará \"de brazos cruzados\" ante el anuncio de que no habrá más elecciones en Nicaragua",
      "source": {
        "name": "BBC",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.bbc.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Leire Ventas"
        ]
      },
      "link": "https://www.bbc.com/mundo/articles/c980ljw9e3ro",
      "thumbnail": "https://ichef.bbci.co.uk/news/1024/branded_mundo/3f4e/live/cc7800d0-853a-11f1-ab57-69b83adbeeff.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNWlTM0psYjBKVWRWaHNVRFYwVFJDZkF4ampCU2dLTWdZQllKQkhLZ2c",
      "date": "07/21/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-07-21T07:00:00Z"
    },
    {
      "position": 4,
      "title": "Curazao destrozó a Nicaragua y la deja agonizando en la Nations League",
      "source": {
        "name": "Diez.HN",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.diez.hn&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.diez.hn/centroamerica/curazao-nicaragua-nations-league-goles-paliza-partido-bacuna-PH32177190",
      "thumbnail": "https://www.diez.hn/binrepository/900x675/0c0/0d0/none/3014757/QPQQ/untitled-design_15713392_20260927202501.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNHhjbU4zU0daWk0xVlNiRUZvVFJEZ0F4aUFCU2dLTWdZWkJaeXVHUW8",
      "date": "09/28/2026, 01:50 AM, +0000 UTC",
      "iso_date": "2026-09-28T01:50:57Z"
    },
    {
      "position": 5,
      "title": "Clima hoy en Managua, Nicaragua: el pronóstico del tiempo para este lunes 28 septiembre de 2026",
      "source": {
        "name": "Clarín",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.clarin.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.clarin.com/informacion-general/clima-hoy-managua-nicaragua-pronostico-tiempo-lunes-28-septiembre-2026_0_XiyEKG9jO5.html",
      "thumbnail": "https://www.clarin.com/img/2025/04/30/FDp8zU61M_1200x630__1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNDBaRmRLUkdsa09VdGlVbTVGVFJDUkF4ajhCU2dLTWdhaG9Jck50UVU",
      "date": "09/28/2026, 03:35 AM, +0000 UTC",
      "iso_date": "2026-09-28T03:35:25Z"
    },
    {
      "position": 6,
      "title": "Estadísticas de Curazao vs Nicaragua: remates, posesión y goles esperados",
      "source": {
        "name": "365Scores",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.365scores.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.365scores.com/es/news/curazao-vs-nicaragua-estadisticas-vivo/",
      "thumbnail": "https://www.365scores.com/es/news/wp-content/uploads/2026/09/6114493f-aa77-49a2-a8a9-f96f2a9a6c9f.png",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNW9WM0ZqUTBkd01qa3dRMFpXVFJDZkF4amlCU2dLTWdB",
      "date": "09/28/2026, 05:14 AM, +0000 UTC",
      "iso_date": "2026-09-28T05:14:14Z"
    },
    {
      "position": 7,
      "title": "Estrecho de Ormuz, lluvia negra, Nicaragua, satélites... Las noticias del martes",
      "source": {
        "name": "UN News",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://news.un.org&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://news.un.org/es/story/2026/03/1541225",
      "thumbnail": "https://global.unitednations.entermediadb.net/assets/mediadb/services/module/asset/downloads/preset/Libraries/Production%20Library/15-11-2022_Unsplash_oil-rig.jpg/image1170x530cropped.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNVNVek5OTlZSVVltMXhkMjEyVFJEMUFoaTNCaWdLTWdrSkE0U21qbXBjOVFB",
      "date": "03/10/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-03-10T07:00:00Z"
    },
    {
      "position": 8,
      "title": "Nicaragua: el oro que sostiene al régimen y lo aísla del mundo",
      "source": {
        "name": "IPS Agencia de Noticias",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://ipsnoticias.net&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://ipsnoticias.net/2026/08/nicaragua-el-oro-que-sostiene-al-regimen-y-lo-aisla-del-mundo/",
      "thumbnail": "https://ipsnoticias.net/wp-content/uploads/2026/08/Nicaragua-y-su-oro-1-400x300.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVJVRk5wT1RBM2VrUXhZV2x3VFJDc0FoaVFBeWdLTWdZSm9aYkd0Z1k",
      "date": "08/25/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-08-25T07:00:00Z"
    },
    {
      "position": 9,
      "title": "Cómo funciona la red trasnacional de espionaje y acoso a opositores del gobierno de Ortega y Murillo en Nicaragua, según la ONU",
      "source": {
        "name": "BBC",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.bbc.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Felipe Llambias"
        ]
      },
      "link": "https://www.bbc.com/mundo/articles/cvg80dv88rgo",
      "thumbnail": "https://ichef.bbci.co.uk/news/1024/branded_mundo/8787/live/161a1e60-23d6-11f1-92f6-6d3dbba93239.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNHdaRlJRWXpaWU5qUlRTbUptVFJDZkF4ampCU2dLTWdZVkZJVE5sUVE",
      "date": "03/20/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-03-20T07:00:00Z"
    },
    {
      "position": 10,
      "title": "Nicaragua celebra 47 años de la Revolución Sandinista",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2026/07/19/nicaragua-celebra-47-anos-de-la-revolucion-sandinista/",
      "thumbnail": "https://www.prensa-latina.cu/wp-content/uploads/2026/07/revolucion-sandinista-1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUtkRWgwTWpkcE9HSmFhMlpNVFJEQ0F4aXBCU2dLTWdZQklvUklFZ28",
      "date": "07/19/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-07-19T07:00:00Z"
    },
    {
      "position": 11,
      "title": "Dólar hoy en Nicaragua: precio y cotización de la divisa este domingo 27 de septiembre de 2026",
      "source": {
        "name": "Clarín",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.clarin.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.clarin.com/economia/dolar-hoy-en-nicaragua-precio-y-cotizacion-de-la-divisa-este-domingo-27-de-septiembre-de-2026_0_8Myd2sAV3e.html",
      "thumbnail": "https://www.clarin.com/img/2020/02/03/XTufI4c7_1200x630__1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVVUVFpVY1hwdGNVdDVlazAwVFJDUkF4ajhCU2dLTWdZVkpJcVB2UVU",
      "date": "09/27/2026, 10:40 AM, +0000 UTC",
      "iso_date": "2026-09-27T10:40:10Z"
    },
    {
      "position": 12,
      "title": "La mala noticia que le dio EE. UU. a Daniel Ortega tras anunciar que eliminará las elecciones en Nicaragua",
      "source": {
        "name": "Revista Semana",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.semana.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.semana.com/mundo/articulo/la-mala-noticia-que-le-dio-ee-uu-a-daniel-ortega-tras-anunciar-que-eliminara-las-elecciones-en-nicaragua/202621/",
      "thumbnail": "https://www.semana.com/resizer/v2/CM7A7AZULRAOJFUMADVVAJX2FE.jpg?auth=d1f73ec13b6554aedb6dda1312212cd8b23f524126b29bb50a3dc34c231bbc10&smart=true&quality=75&width=1280&height=1280",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNHlUbEZFZDNrNE5VZFpTSE55VFJDcUJCaXFCQ2dLTWdZVlJwZ3BvZ2c",
      "date": "07/21/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-07-21T07:00:00Z"
    },
    {
      "position": 13,
      "title": "Las noticias más relevantes de Nicaragua (17 al 23 de mayo)",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/05/23/nacionales/3703076-ultimas-noticias-nicaragua-hoy-canasta-basica",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2026/02/DSC_0778-1200x675.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNHhhbk5VWVVoSFMzSktjMXBSVFJDZkF4ampCU2dLTWdtQkFZWkdQU055TGdJ",
      "date": "05/23/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-23T07:00:00Z"
    },
    {
      "position": 14,
      "title": "Qué queda de la oposición dentro de Nicaragua y por qué Daniel Ortega quiere abolir las elecciones",
      "source": {
        "name": "BBC",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.bbc.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Atahualpa Amerise"
        ]
      },
      "link": "https://www.bbc.com/mundo/articles/clyez7yv4vvo",
      "thumbnail": "https://ichef.bbci.co.uk/news/1024/branded_mundo/2184/live/baee5190-879a-11f1-9d55-0b6742729f5d.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNVhUR2hKVDJGUWVGZFVabkpTVFJDZkF4ampCU2dLTWdrQlk1QXlLZWpRandF",
      "date": "07/24/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-07-24T07:00:00Z"
    },
    {
      "position": 15,
      "title": "Nicaragua expresa solidaridad a pueblo colombiano tras fuerte sismo",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2026/08/10/nicaragua-expresa-solidaridad-a-pueblo-colombiano-tras-fuerte-sismo/",
      "thumbnail": "https://www.prensa-latina.cu/wp-content/uploads/2026/08/terremoto2-1-2.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNVRWMmxCV1RWWFVVWlhPVWs1VFJDWEF4anlCU2dLTWdB",
      "date": "08/10/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-08-10T07:00:00Z"
    },
    {
      "position": 16,
      "title": "Huracán Melissa, Nicaragua, Sudán, Gaza… Las noticias del jueves",
      "source": {
        "name": "UN News",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://news.un.org&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://news.un.org/es/story/2025/10/1540658",
      "thumbnail": "https://global.unitednations.entermediadb.net/assets/mediadb/services/module/asset/downloads/preset/Libraries/Production%20Library/30-10-2025_UNESCO_Jamaica.jpg/image1170x530cropped.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVdhV2RwV1VkalVrUlpTV1l5VFJEMUFoaTNCaWdLTWdaVk1JQlpTQU0",
      "date": "10/30/2025, 07:00 AM, +0000 UTC",
      "iso_date": "2025-10-30T07:00:00Z"
    },
    {
      "position": 17,
      "title": "Euro hoy en Nicaragua: precio y cotización de la divisa este domingo 27 de septiembre de 2026",
      "source": {
        "name": "Clarín",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.clarin.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.clarin.com/economia/euro-hoy-en-nicaragua-precio-y-cotizacion-de-la-divisa-este-domingo-27-de-septiembre-de-2026_0_HJb36RBn64.html",
      "thumbnail": "https://www.clarin.com/img/2018/12/27/h_JN2Am_3_1200x630__1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iMkNnNWFjR0ZtWW5SRVFuUXplV1pTVFJDUkF4ajhCU2dLTWdzQkFZSUlsU1F0MlBqVTJB",
      "date": "09/27/2026, 10:45 AM, +0000 UTC",
      "iso_date": "2026-09-27T10:45:10Z"
    },
    {
      "position": 18,
      "title": "Liberan decenas de presos políticos en Nicaragua, en aparente respuesta a solicitud de EE.UU.",
      "source": {
        "name": "BBC",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.bbc.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Rafael Rojas Abuchaibe"
        ]
      },
      "link": "https://www.bbc.com/mundo/articles/cd0y2yj8l0no",
      "thumbnail": "https://ichef.bbci.co.uk/news/1024/branded_mundo/6185/live/f7d00520-ee68-11f0-9e38-cf6cd344f06b.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNUZUbDluZUZWNmRGbFVabU4zVFJDZkF4ampCU2dLTWdrQklJd0txcWU1eGdJ",
      "date": "01/10/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-01-10T08:00:00Z"
    },
    {
      "position": 19,
      "title": "Cubanos residentes en Nicaragua condenan ataque de EE.UU. a Venezuela",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2026/01/03/cubanos-residentes-en-nicaragua-condenan-ataque-de-ee-uu-a-venezuela/",
      "date": "01/03/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-01-03T08:00:00Z"
    },
    {
      "position": 20,
      "title": "\"Ha entrado en una fase de paranoia\": cuál está siendo la reacción del gobierno de Ortega y Murillo en Nicaragua a la captura de Maduro",
      "source": {
        "name": "BBC",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.bbc.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Atahualpa Amerise"
        ]
      },
      "link": "https://www.bbc.com/mundo/articles/crrnqg18lqqo",
      "thumbnail": "https://ichef.bbci.co.uk/news/1024/branded_mundo/9560/live/4dc10810-f235-11f0-b0c7-71b671ae4961.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNWFOMVprVW5aVVdUUlZRWFZoVFJDZkF4ampCU2dLTWdhbFJZYnNKUWc",
      "date": "01/19/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-01-19T08:00:00Z"
    },
    {
      "position": 21,
      "title": "Nicaragua condena todas formas de guerra y clama por la paz",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2026/03/01/nicaragua-condena-todas-formas-de-guerra-y-clama-por-la-paz/",
      "date": "03/01/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-03-01T08:00:00Z"
    },
    {
      "position": 22,
      "title": "Nicaragua: Expertos de la ONU instan a la comunidad internacional a pasar de la observación a la acción",
      "source": {
        "name": "UN News",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://news.un.org&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://news.un.org/es/story/2025/10/1540657",
      "thumbnail": "https://global.unitednations.entermediadb.net/assets/mediadb/services/module/asset/downloads/preset/Libraries/Production%20Library/28-05-2021_FAO_Nicaragua.jpg/image1170x530cropped.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iJ0NnNTZTVmt0VUhrM1NWSmZWMkZvVFJEMUFoaTNCaWdLTWdPQmdndw",
      "date": "10/30/2025, 07:00 AM, +0000 UTC",
      "iso_date": "2025-10-30T07:00:00Z"
    },
    {
      "position": 23,
      "title": "Conmemoran en Nicaragua aniversario 73 del asalto al Moncada",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2026/07/26/conmemoran-en-nicaragua-aniversario-73-del-asalto-al-moncada/",
      "thumbnail": "https://www.prensa-latina.cu/wp-content/uploads/2026/07/nicaragua-asamblea-cuba-1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUtUSEJSTWtGc1FXUnlXVXRzVFJDMkF4aThCU2dLTWdZTkVJS05xUVE",
      "date": "07/26/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-07-26T07:00:00Z"
    },
    {
      "position": 24,
      "title": "El Arzobispo de Miami y el subsecretario de Estado de EE.UU., preocupados por la Iglesia en Nicaragua en Semana Santa",
      "source": {
        "name": "ACI Prensa",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.aciprensa.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Walter Sánchez Silva"
        ]
      },
      "link": "https://www.aciprensa.com/noticias/123733/semana-santa-2026-nicaragua-al-centro-de-la-preocupacion-del-arzobispo-de-miami-y-el-subsecretario-de-estado-de-eeuu",
      "thumbnail": "https://res.cloudinary.com/ewtn/image/upload/ewtn-news/es/imagespp/arzobispo-wenski-31032026-1775073265?w=900&h=500",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUJNRkptVjB4MmJqRkdhM2x2VFJDMkF4aTlCU2dLTWdhdE5KNnVtUWs",
      "date": "03/31/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-03-31T07:00:00Z"
    },
    {
      "position": 25,
      "title": "Copresidentes de Nicaragua condenan agresión militar contra Venezuela",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2026/01/03/copresidentes-de-nicaragua-condenan-agresion-militar-contra-venezuela/",
      "thumbnail": "https://www.prensa-latina.cu/wp-content/uploads/2026/01/venezuela-nicaragua-telef-1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNXNOM1l3WkRSWE9IbFVhM1ZUVFJDMkF4aTlCU2dLTWdB",
      "date": "01/03/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-01-03T08:00:00Z"
    },
    {
      "position": 26,
      "title": "Obispo Báez de Nicaragua: Los “ladrones y bandidos” de hoy son los poderosos que roban la libertad",
      "source": {
        "name": "ACI Prensa",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.aciprensa.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Walter Sánchez Silva"
        ]
      },
      "link": "https://www.aciprensa.com/noticias/124583/obispo-baez-de-nicaragua-los-ladrones-y-bandidos-de-hoy-son-los-poderosos-que-roban-la-libertad",
      "thumbnail": "https://res.cloudinary.com/ewtn/image/upload/ewtn-news/es/imagespp/silvio-baez-domingo-del-buen-pastor-26042026-1777321174?w=900&h=500",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNTZhRlZEU1VRd1lWVmplV2cwVFJDMkF4aTlCU2dLTWdZOUpKUlJIUWs",
      "date": "04/27/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-27T07:00:00Z"
    },
    {
      "position": 27,
      "title": "Estas son las noticias más importantes de Nicaragua para este 22 de abril",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua-para-este-22-de-abril/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/04/4-205.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNDRaRlF3WkU0eFJtMWhSa0ZTVFJDZkF4ampCU2dLTWdZQklvVHhWQU0",
      "date": "04/22/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-22T07:00:00Z"
    },
    {
      "position": 28,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 22 de mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-22-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/4-220.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVZOSGhLWlRac1YwVTNVMmhHVFJDZkF4ampCU2dLTWdhbFJJeXVJUWs",
      "date": "05/22/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-22T07:00:00Z"
    },
    {
      "position": 29,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 18 de mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-18-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/4-166.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNDFVV2MzWmtwT1ZXNVdOMUptVFJDZkF4ampCU2dLTWdB",
      "date": "05/18/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-18T07:00:00Z"
    },
    {
      "position": 30,
      "title": "Daniel Ortega no dijo que estaba destruyendo la prensa libre, dijo que estaba combatiendo la desinformación",
      "source": {
        "name": "TV Azteca",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tvazteca.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tvazteca.com/aztecanoticias/el-dictador-daniel-ortega-dijo-que-estaba-combatiendo-la-desinformacion-y-hoy-nicaragua-no-tiene-prensa-libre/",
      "thumbnail": "https://tvazteca.brightspotcdn.com/dims4/default/b671351/2147483647/strip/true/crop/1168x720+0+0/resize/1200x740!/format/jpg/quality/90/?url=https%3A%2F%2Ftv-azteca-production-tv-azteca.s3.us-west-2.amazonaws.com%2Fbrightspot%2F8e%2Fbb%2Fedb08eb041ddb3580f75f798b071%2Fdictador-daniel-ortega-dijo-que-estaba-combatiendo-la-desinformacion.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNHdORE15WnkxalpYcHFkMDVNVFJDekF4akJCU2dLTWdhSkk1TGtsZ28",
      "date": "08/12/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-08-12T07:00:00Z"
    },
    {
      "position": 31,
      "title": "Diario La Prensa de Nicaragua cumple 100 años con su redacción en el exilio",
      "source": {
        "name": "Confidencial Nicaragua",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://confidencial.digital&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://confidencial.digital/nacion/diario-la-prensa-de-nicaragua-cumple-100-anos-con-su-redaccion-en-el-exilio/",
      "thumbnail": "https://confidencial.digital/wp-content/uploads/2024/05/Ultima-portada-La-Prensa-768x497.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVlTblp3TkdFMlduZEhTR0ZuVFJDOUF4aXdCU2dLTWdhaFU1UnJLUWM",
      "date": "03/02/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-03-02T08:00:00Z"
    },
    {
      "position": 32,
      "title": "La dictadura de Daniel Ortega consolida a Nicaragua como “la Corea del Norte” de las Américas",
      "source": {
        "name": "infobae.com",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.infobae.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Fabián Medina Sánchez"
        ]
      },
      "link": "https://www.infobae.com/nicaragua/2026/04/11/la-dictadura-de-daniel-ortega-consolida-a-nicaragua-como-la-corea-del-norte-de-las-americas/",
      "thumbnail": "https://www.infobae.com/resizer/v2/D3GEVHG6JNBIRBEGRK24PHSKG4.jpg?auth=49322258e99c8b4dea1a919ef989ccb6f3a251eeecc7f94c8e2c4e5e9d280387&smart=true&width=1200&height=675&quality=85",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNTJaMlkwY2pWVVVXaFFRbGhwVFJDZkF4ampCU2dLTWdhUk1weUhJZ2s",
      "date": "04/11/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-11T07:00:00Z"
    },
    {
      "position": 33,
      "title": "Hoy las reinas del Caribe se enfrentan a Nicaragua",
      "source": {
        "name": "Remolacha",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://remolacha.net&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://remolacha.net/2026/09/hoy-las-reinas-del-caribe-se-enfrentan-a-nicaragua/",
      "thumbnail": "https://i0.wp.com/remolacha.net/wp-content/uploads/2026/08/Reinas-del-Caribe-2-scaled.png?fit=2560%2C1436&ssl=1",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iMkNnNWxjMVJsWVRCME5EbEhaMkYyVFJDZkF4amtCU2dLTWdzQk1JNk1MS2ZJcEJwVHFn",
      "date": "09/11/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-09-11T07:00:00Z"
    },
    {
      "position": 34,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 03 de Junio",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-03-de-junio/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/06/4-24.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iMkNnNTRkbGw2ZEVoeVdVNHdjVFV3VFJDZkF4ampCU2dLTWdzQkVvYjBpS3VacHRxUVBR",
      "date": "06/03/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-06-03T07:00:00Z"
    },
    {
      "position": 35,
      "title": "Nicaragua aprueba ingreso y salida de tropas para cooperación",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2026/05/29/nicaragua-aprueba-ingreso-y-salida-de-tropas-para-cooperacion/",
      "thumbnail": "https://www.prensa-latina.cu/wp-content/uploads/2026/05/parlamento-nicaragua-1-2-1-1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iMkNnNVdUSGxpYldwa1NFdERhbEpUVFJERUF4aW5CU2dLTWdzQkVJREZ0R0pUYXlyMlBB",
      "date": "05/29/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-29T07:00:00Z"
    },
    {
      "position": 36,
      "title": "Senado ruso ratifica acuerdo de cooperación militar con Nicaragua",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2026/04/29/senado-ruso-ratifica-acuerdo-de-cooperacion-militar-con-nicaragua/",
      "thumbnail": "https://www.prensa-latina.cu/wp-content/uploads/2026/04/Nicaragua-y-Rusia-696x490-1-1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNXFNelU0YldSeFIyMDVNbnAyVFJEUkF4aVVCU2dLTWdrUkVvZ0dxcVZVUndJ",
      "date": "04/29/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-29T07:00:00Z"
    },
    {
      "position": 37,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 25 de mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-25-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/4-242.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNTRkSFUxU0RGRGFXOHhZVTVOVFJDZkF4ampCU2dLTWdtQjRJakUwcVJNTkFF",
      "date": "05/25/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-25T07:00:00Z"
    },
    {
      "position": 38,
      "title": "Nicaragua libera presos políticos en el 19 aniversario del Gobierno en medio de la presión de EE.UU.",
      "source": {
        "name": "RTVE.es",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.rtve.es&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.rtve.es/noticias/20260110/nicaragua-libera-presos-politicos-19-aniversario-del-gobierno-medio-presion-eeuu/16889767.shtml",
      "thumbnail": "https://img2.rtve.es/n/16889767?w=1600",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUhOVWRNU3pkcVpUQXdSRFpLVFJDZkF4amlCU2dLTWdZQlFKUlBIUWs",
      "date": "01/11/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-01-11T08:00:00Z"
    },
    {
      "position": 39,
      "title": "Cubanos en Nicaragua instan a redoblar solidaridad con la isla",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2026/02/05/cubanos-en-nicaragua-instan-a-redoblar-solidaridad-con-la-isla/",
      "thumbnail": "https://www.prensa-latina.cu/wp-content/uploads/2026/02/Cuba-Nicaragua-banderas-1-1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNW1VVUUxZUV0SVVYaFpiMmh1VFJEZ0F4aUFCU2dLTWdrQmNaRFZ0Q2E1clFF",
      "date": "02/05/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-02-05T08:00:00Z"
    },
    {
      "position": 40,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 14 de mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-14-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/4-131.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUVhbk5IVTFaNVdUWldOamgwVFJDZkF4ampCU2dLTWdhQlVJUWxYUUk",
      "date": "05/14/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-14T07:00:00Z"
    },
    {
      "position": 41,
      "title": "Resumen de las noticias principales del 17 de Marzo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/resumen-de-las-noticias-principales-del-17-de-marzo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/03/1-526.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNDVUWE15UWxwNVdrZDBXa1puVFJDZkF4ampCU2dLTWdB",
      "date": "03/17/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-03-17T07:00:00Z"
    },
    {
      "position": 42,
      "title": "Partidos de hoy, lunes 15 de junio, en la Copa Mundial 2026: ¿a qué hora son y dónde verlos en Nicaragua?",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/06/15/deportes/3716469-partidos-de-hoy-lunes-15-de-junio-en-la-copa-mundial-2026-a-que-hora-son-y-donde-verlos-en-nicaragua",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2026/06/Pedri-Ferran.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNTJaRzE2VEhoSWJqVlNWRGRDVFJDMUF4aTlCU2dLTWdhZEpKQ3JtUWs",
      "date": "06/15/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-06-15T07:00:00Z"
    },
    {
      "position": 43,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 05 de Junio",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-05-de-junio/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/06/4-55.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNVNVbUYwU1RGMVlWbFllbFF3VFJDZkF4ampCU2dLTWdB",
      "date": "06/05/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-06-05T07:00:00Z"
    },
    {
      "position": 44,
      "title": "Leones en vilo: Nicaragua espera su milagro en Caracas",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2026/02/11/leones-en-vilo-nicaragua-espera-su-milagro-en-caracas/",
      "thumbnail": "https://www.prensa-latina.cu/wp-content/uploads/2026/02/Leones-Caracas-1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNWtZVlZxU0VaalRsWjJRbGRTVFJERUF4aW1CU2dLTWdB",
      "date": "02/11/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-02-11T08:00:00Z"
    },
    {
      "position": 45,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 04 de Junio",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-04-de-junio/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/06/4-43.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNWhPR2xIZGxocFIyRkRhamd5VFJDZkF4ampCU2dLTWdrQmdJU1FVQ081OVFB",
      "date": "06/04/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-06-04T07:00:00Z"
    },
    {
      "position": 46,
      "title": "Estas son las noticias más importantes de Nicaragua para este 21de abril",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua-para-este-21de-abril/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/04/4-190.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVZRVGhEWTA1SFJUaGlPWHBTVFJDZkF4ampCU2dLTWdZQkVvalZFQXM",
      "date": "04/21/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-21T07:00:00Z"
    },
    {
      "position": 47,
      "title": "Gobierno habría facilitado residencia en Nicaragua a Carlos Ramón González, hoy prófugo; Petro lo niega",
      "source": {
        "name": "es-us.noticias.yahoo.com",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://es-us.noticias.yahoo.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://es-us.noticias.yahoo.com/gobierno-habr%C3%ADa-facilitado-residencia-nicaragua-213500151.html",
      "thumbnail": "https://s.yimg.com/lo/mysterio/api/76ff2842d48cb7d356f47587f40cfbb71c9af587aba0f35546151e2d37862064/lightyear_networkapi/resizefill_w960%3Bquality_80%3Bformat_webp/https%3A%2F%2Fmedia.zenfs.com%2Fes%2Fvalora_628%2F452819cf8d10064e2058160c2d2d5705",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iJ0NnNDNkMUp1UTI5RVJFMUVORFU0VFJDbkF4alZCU2dLTWdNQmxSUQ",
      "date": "08/14/2025, 07:00 AM, +0000 UTC",
      "iso_date": "2025-08-14T07:00:00Z"
    },
    {
      "position": 48,
      "title": "Nicaragua libera “decenas” de presos tras presión de EE.UU.: Lo de Venezuela desató “el temor en la tiranía”",
      "source": {
        "name": "ACI Prensa",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.aciprensa.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Walter Sánchez Silva"
        ]
      },
      "link": "https://www.aciprensa.com/noticias/120905/dictadura-de-nicaragua-libera-presos-politicos-tras-presion-de-eeuu",
      "thumbnail": "https://res.cloudinary.com/ewtn/image/upload/ewtn-news/es/imagespp/daniel-ortega-dictador-de-nicaragua-10012026-1768082612?w=900&h=500",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUpkVGxXVVRocFREWkhTbGRTVFJDMkF4aTlCU2dLTWdZcFJJS09xUVE",
      "date": "01/10/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-01-10T08:00:00Z"
    },
    {
      "position": 49,
      "title": "Diputados destacan avances de Nicaragua en importantes sectores",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2026/01/13/diputados-destacan-avances-de-nicaragua-en-importantes-sectores/",
      "thumbnail": "https://www.prensa-latina.cu/wp-content/uploads/2026/01/FOTO-1-NICARAGUA-PARLAMENTO1-1-1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNWljMlZGVUZjMldrWlNkVkZsVFJERUF4aW5CU2dLTWdrQklJSXJyV09wOHdB",
      "date": "01/13/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-01-13T08:00:00Z"
    },
    {
      "position": 50,
      "title": "Fuerte temblor de magnitud 5,2 sacudió Nicaragua en la mañana de este 26 de junio",
      "source": {
        "name": "Noticias Caracol",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.noticiascaracol.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.noticiascaracol.com/mundo/fuerte-temblor-de-magnitud-5-2-sacudio-nicaragua-en-la-manana-de-este-26-de-junio-so35",
      "thumbnail": "https://caracoltv.brightspotcdn.com/dims4/default/6c0f956/2147483647/strip/true/crop/1280x720+0+0/resize/1280x720!/format/webp/quality/75/?url=https%3A%2F%2Fcaracol-brightspot.s3.us-west-2.amazonaws.com%2Fdb%2Fbf%2Fd522df31495dafce6495f6e543d4%2Fnicaragua.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iJ0NnNXJURVpsVFVKRGRsTnZkVlp3VFJDZkF4ampCU2dLTWdNQkZSZw",
      "date": "06/26/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-06-26T07:00:00Z"
    },
    {
      "position": 51,
      "title": "Estas son las noticias más importantes de Nicaragua para este 05 de Mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua-para-este-05-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/1-78.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNW5aVmxQZGxOcmNteHhOSGd6VFJDZkF4ampCU2dLTWdhQmNvWW5XUU0",
      "date": "05/05/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-05T07:00:00Z"
    },
    {
      "position": 52,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 01 de Junio",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-01-de-junio/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/06/4-1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNXBiR2hNUVZkZlIyWXRabEZsVFJDZkF4ampCU2dLTWdB",
      "date": "06/01/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-06-01T07:00:00Z"
    },
    {
      "position": 53,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 28 de mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-28-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/4-283.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUlaREppTXpRMFlXNDNlVmR3VFJDZkF4ampCU2dLTWdhQjRJckV6QVE",
      "date": "05/28/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-28T07:00:00Z"
    },
    {
      "position": 54,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 27 de mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-27-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/4-267.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNXFOa3BsTTJFd1JsaFBaMmhyVFJDZkF4ampCU2dLTWdB",
      "date": "05/27/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-27T07:00:00Z"
    },
    {
      "position": 55,
      "title": "Estas son las noticias más importantes de Nicaragua",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/04/4-80.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNURUa0Z1ZW1aUE0xSXplV0V4VFJDZkF4ampCU2dLTWdB",
      "date": "04/10/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-10T07:00:00Z"
    },
    {
      "position": 56,
      "title": "Estas son las noticias más importantes de Nicaragua para este 08 de Mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua-para-este-08-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/4-70.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNVlkSFJNTVdkc1ZUQk1lazQxVFJDZkF4ampCU2dLTWdB",
      "date": "05/08/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-08T07:00:00Z"
    },
    {
      "position": 57,
      "title": "Estas son las noticias más importantes de Nicaragua para este 29 de abril",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua-para-este-29-de-abril/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/04/1-704.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNXRabTF0ZUdwNWVIQXlkV3cxVFJDZkF4ampCU2dLTWdB",
      "date": "04/29/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-29T07:00:00Z"
    },
    {
      "position": 58,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 20 de mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-20-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/4-194.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNXBlblpmU2xoTlVuTktkVEpzVFJDZkF4ampCU2dLTWdB",
      "date": "05/20/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-20T07:00:00Z"
    },
    {
      "position": 59,
      "title": "Te presentamos las noticias más relevantes de Nicaragua hoy, 20 de febrero",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/te-presentamos-las-noticias-mas-relevantes-de-nicaragua-hoy-20-de-febrero/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/02/1-683.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNUlPRTlHV2tWNk1UVnVVWGhLVFJDZkF4ampCU2dLTWdB",
      "date": "02/20/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-02-20T08:00:00Z"
    },
    {
      "position": 60,
      "title": "Estas son las noticias más importantes de Nicaragua para este 06 de Mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua-para-este-06-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/1-110.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNUVOVkl4Y1RVeWVWUjBaVzlYVFJDZkF4ampCU2dLTWdB",
      "date": "05/06/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-06T07:00:00Z"
    },
    {
      "position": 61,
      "title": "Estas son las noticias más importantes de Nicaragua este Martes 07 de abril de 2026",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua-este-martes-07-de-abril-de-2026/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/04/4-61.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNDRObkJsVDAwd01WaFdPRGd0VFJDZkF4ampCU2dLTWdB",
      "date": "04/08/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-08T07:00:00Z"
    },
    {
      "position": 62,
      "title": "Resumen de las noticias principales del 26 de Febrero",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/resumen-de-las-noticias-principales-del-26-de-febrero/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/02/3-425.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNHRVSHBuU0d0YU4xbEpWVjlJVFJDZkF4ampCU2dLTWdB",
      "date": "02/26/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-02-26T08:00:00Z"
    },
    {
      "position": 63,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 21 de mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-21-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/Plantilla-Youtube-TN8-1-2.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNWxTazlYYmtnMFkyeG1jMFUyVFJDZkF4ampCU2dLTWdB",
      "date": "05/21/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-21T07:00:00Z"
    },
    {
      "position": 64,
      "title": "Nicaragua ratificó hermandad y solidaridad con Venezuela",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2025/12/11/nicaragua-ratifico-hermandad-y-solidaridad-con-venezuela/",
      "thumbnail": "https://www.prensa-latina.cu/wp-content/uploads/2025/12/Venezuela-Nicaragua-Banderas-1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNXBNVGRKVmxsNVdWbG5MWE51VFJEZ0F4aUFCU2dLTWdZQmNJN0d3Z1k",
      "date": "12/11/2025, 08:00 AM, +0000 UTC",
      "iso_date": "2025-12-11T08:00:00Z"
    },
    {
      "position": 65,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 02 de Junio",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-02-de-junio/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/06/4-12.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUJTVkU1TTE5MFlYa3dRVTFSVFJDZkF4ampCU2dLTWdZQmNJYUgwQU0",
      "date": "06/02/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-06-02T07:00:00Z"
    },
    {
      "position": 66,
      "title": "Las noticias más destacadas de Nicaragua esta semana (5 al 10 de abril)",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/04/11/nacionales/3672036-noticias-destacadas-nicaragua-abril",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2018/10/03121445/ROTONDA-GRUAS-FSLN-9.jpeg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNWxRM2gzWVVobFJHeHRYMjl4VFJEQ0F4aXBCU2dLTWdZSlVKQUhNUVk",
      "date": "04/11/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-11T07:00:00Z"
    },
    {
      "position": 67,
      "title": "Resumen de las noticias principales del 16 de Marzo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/resumen-de-las-noticias-principales-del-16-de-marzo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/03/651240180_1394055102765221_5299902972495690161_n.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNWlaRGxTYm5OcWVUUk5iMVpsVFJDZkF4ampCU2dLTWdZQjBZYlZPQU0",
      "date": "03/16/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-03-16T07:00:00Z"
    },
    {
      "position": 68,
      "title": "Estas son las noticias más importantes de Nicaragua este Miércoles 08 de abril de 2026",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua-este-miercoles-08-de-abril-de-2026/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/04/4-71.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNXFVRVpxZW5CRFJHSjRSVkp5VFJDZkF4ampCU2dLTWdB",
      "date": "04/09/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-09T07:00:00Z"
    },
    {
      "position": 69,
      "title": "Estas son las noticias más importantes de Nicaragua para este 11 de Mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua-para-este-11-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/3-125.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNDRZemhPU0ZKVE5rcHZlbEExVFJDZkF4ampCU2dLTWdrQllZVFNWS09oMXdB",
      "date": "05/11/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-11T07:00:00Z"
    },
    {
      "position": 70,
      "title": "Estas son las noticias más importantes de Nicaragua para este 30 de abril",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua-para-este-30-de-abril/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/04/1-737.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNUVaWGxqTVRkclFrczNaME5uVFJDZkF4ampCU2dLTWdB",
      "date": "04/30/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-30T07:00:00Z"
    },
    {
      "position": 71,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 15 de mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-15-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/1-372.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNUhSbkJvT1RFd1ptMUVkVGxwVFJDZkF4ampCU2dLTWdB",
      "date": "05/15/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-15T07:00:00Z"
    },
    {
      "position": 72,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 13 de mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-13-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/4-111.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNDNUMHRoYlRkd1NtMVViRlZEVFJDZkF4ampCU2dLTWdB",
      "date": "05/13/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-13T07:00:00Z"
    },
    {
      "position": 73,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 19 de mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-19-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/4-177.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNUNSVUpKVVhSNGF6VlJSakJhVFJDZkF4ampCU2dLTWdB",
      "date": "05/19/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-19T07:00:00Z"
    },
    {
      "position": 74,
      "title": "Se registra sismo de 5.9 en Nicaragua",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/08/12/nacionales/3760751-se-registra-sismo-de-5-9-en-nicaragua",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2026/08/Sismo-Nicaragua.png",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUVWbGxIWDJJNVpHVjBTRkJLVFJDZkF4ampCU2dLTWdhRkFvSkpnUW8",
      "date": "08/12/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-08-12T07:00:00Z"
    },
    {
      "position": 75,
      "title": "Estas son las noticias más importantes de Nicaragua para este 04 de Mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua-para-este-04-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/1-52.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNU5lakYxUzFsZk5YSmZkRGhHVFJDZkF4ampCU2dLTWdB",
      "date": "05/04/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-04T07:00:00Z"
    },
    {
      "position": 76,
      "title": "Estas son las noticias más importantes de Nicaragua para este 17 de abril",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua-para-este-17de-abril/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/04/4-155.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNTVWVGh3V2pCSk5FRnhaV2gwVFJDZkF4ampCU2dLTWdB",
      "date": "04/17/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-17T07:00:00Z"
    },
    {
      "position": 77,
      "title": "Estas son las noticias más importantes de Nicaragua para este 23 de abril",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua-para-este-23-de-abril/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/04/1-570.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNUhSbk5aYm5scGNVMTJiMkpzVFJDZkF4ampCU2dLTWdB",
      "date": "04/23/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-23T07:00:00Z"
    },
    {
      "position": 78,
      "title": "Nicaragua abandona la Unesco en protesta por el premio al diario 'La Prensa'",
      "source": {
        "name": "France 24",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.france24.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.france24.com/es/am%C3%A9rica-latina/20250504-nicaragua-abandona-la-unesco-en-protesta-por-el-premio-al-diario-la-prensa",
      "thumbnail": "https://s.france24.com/media/display/acc59444-10c1-11f0-a199-005056a90284/w:1024/p:16x9/000_33PD6V3.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNVRWMHBqZFhGRGMzaHpiSGwyVFJDZkF4ampCU2dLTWdrQk1aU1hwQ2lpaGdJ",
      "date": "05/04/2025, 07:00 AM, +0000 UTC",
      "iso_date": "2025-05-04T07:00:00Z"
    },
    {
      "position": 79,
      "title": "EE. UU. destaca el testimonio de LA PRENSA y todo su equipo para informar a Nicaragua",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/03/02/politica/3641696-ee-uu-destaca-el-testimonio-de-la-prensa-y-todo-su-equipo-para-informar-a-nicaragua",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2026/03/100-Anos-de-LA-PRENSA.jpeg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNHlhblowYUZSemRVOXJUVE13VFJDdEF4akxCU2dLTWdrQkFJQ3AwYUt3cEFJ",
      "date": "03/02/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-03-02T08:00:00Z"
    },
    {
      "position": 80,
      "title": "Estas son las noticias más importantes de Nicaragua para este 16 de abril",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua-para-este-16-de-abril/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/04/1-374.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNTVOa1JKUmxCMVZuTlZlRWxpVFJDZkF4ampCU2dLTWdB",
      "date": "04/16/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-16T07:00:00Z"
    },
    {
      "position": 81,
      "title": "Clima en Nicaragua: pronóstico del tiempo para este miércoles 5 de agosto",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/08/05/nacionales/3754713-clima-nicaragua-pronostico-tiempo-hoy",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2026/08/pronostico-del-tiempo-clima-en-Nicaragua-temperaturas-1200x675.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iJ0NnNU5lWFJmUVhSUE9UaERUblYwVFJDZkF4ampCU2dLTWdNMVJBVQ",
      "date": "08/05/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-08-05T07:00:00Z"
    },
    {
      "position": 82,
      "title": "Estas con las noticias más importantes de Nicaragua",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-con-las-noticias-mas-importantes-de-nicaragua/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/04/4-95.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNU5MV1l5U0c0MllXY3pNRFZJVFJDZkF4ampCU2dLTWdB",
      "date": "04/13/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-13T07:00:00Z"
    },
    {
      "position": 83,
      "title": "Estas son las noticias más importantes de Nicaragua para este 27 de abril",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua-para-este-27-de-abril/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/04/4-240.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNVRMV0ZTWDJWblpucEJjbDlFVFJDZkF4ampCU2dLTWdrQklJaENsS3FRaXdJ",
      "date": "04/27/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-27T07:00:00Z"
    },
    {
      "position": 84,
      "title": "Nicaragua autoritaria: el modelo que alarma al mundo hoy - La Verdad Noticias",
      "source": {
        "name": "laverdadnoticias.com",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://laverdadnoticias.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://laverdadnoticias.com/ultimas-noticias/mundo/nicaragua-autoritaria",
      "thumbnail": "https://i0.wp.com/laverdadnoticias.com/wp-content/uploads/2026/04/Nicaragua-autoritaria-el-modelo-que-alarma-al-mundo-hoy.webp?fit=1200%2C900&ssl=1",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNWFMVVpMYUdGc1ZITkxhekZ1VFJEZ0F4aUFCU2dLTWdrRlFaN2xJdWtsWndJ",
      "date": "04/11/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-04-11T07:00:00Z"
    },
    {
      "position": 85,
      "title": "Estas son las noticias más importantes de Nicaragua para este 07 de Mayo",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-mas-importantes-de-nicaragua-para-este-07-de-mayo/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/05/4-59.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNWpNa1kxTWtscVdtUnZlakUzVFJDZkF4ampCU2dLTWdB",
      "date": "05/07/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-05-07T07:00:00Z"
    },
    {
      "position": 86,
      "title": "Nicaragua proyecta más de 300 megavatios con energía renovable",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2026/02/03/nicaragua-proyecta-mas-de-300-megavatios-con-energia-renovable/",
      "thumbnail": "https://www.prensa-latina.cu/wp-content/uploads/2026/02/Salvador-Mansell-1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNTRiRGh0U3pGQ1lWQXdOazlaVFJEZ0F4al9CQ2dLTWdhbFJwb01JZ2s",
      "date": "02/03/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-02-03T08:00:00Z"
    },
    {
      "position": 87,
      "title": "Canales TV para mirar juego de Venezuela vs. Nicaragua EN VIVO GRATIS por el Clásico Mundial de Béisbol",
      "source": {
        "name": "El Comercio Perú",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://elcomercio.pe&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Ronie Bautista"
        ]
      },
      "link": "https://elcomercio.pe/mag/usa/en-vivo-us/a-que-hora-juega-y-que-canal-transmite-venezuela-vs-nicaragua-en-vivo-hoy-por-el-clasico-mundial-de-beisbol-2026-en-eeuu-canales-tv-nnda-nnrt-noticia/",
      "thumbnail": "https://i.ytimg.com/vi/gzULR5XZJr8/hqdefault.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNHhiblIxZFdkc2NFODNOa3hHVFJEb0FoamdBeWdLTWdrQmNaYmtyaWM5S1FJ",
      "date": "03/09/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-03-09T07:00:00Z"
    },
    {
      "position": 88,
      "title": "Hoy por hoy: No olvidemos a Nicaragua del 25 de junio de 2026",
      "source": {
        "name": "prensa.com",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa.com/opinion/hoy-por-hoy-no-olvidemos-a-nicaragua/",
      "date": "06/25/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-06-25T07:00:00Z"
    },
    {
      "position": 89,
      "title": "Nicaragua cierra 2025 con avance récord en infraestructura vial",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2025/12/26/nicaragua-cierra-2025-con-avance-record-en-infraestructura-vial/",
      "thumbnail": "https://www.prensa-latina.cu/wp-content/uploads/2025/12/nicaragua-infraestructura-vial-1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUNRakYwYW05eFUxSlpkVzVwVFJDdUF4akpCU2dLTWdZZFU0SEw0UUE",
      "date": "12/26/2025, 08:00 AM, +0000 UTC",
      "iso_date": "2025-12-26T08:00:00Z"
    },
    {
      "position": 90,
      "title": "Nicaragua: ‘Si la libertad de prensa se apaga, quedamos todos a oscuras’, dice director de La Prensa",
      "source": {
        "name": "RFI",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.rfi.fr&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Yesica Brumec"
        ]
      },
      "link": "https://www.rfi.fr/es/programas/noticias-de-am%C3%A9rica/20250503-nicaragua-si-la-libertad-de-prensa-se-apaga-quedamos-todos-a-oscuras-dice-director-de-la-prensa",
      "thumbnail": "https://s.rfi.fr/media/display/e11c1dd8-06be-11f0-9972-005056a90284/w:1024/p:16x9/6b78fb5c1e33ab047e6776ba8f6107de244dd1f0.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNXVTek5sTnpJM1VubFNNMnRxVFJDZkF4ampCU2dLTWdB",
      "date": "05/03/2025, 07:00 AM, +0000 UTC",
      "iso_date": "2025-05-03T07:00:00Z"
    },
    {
      "position": 91,
      "title": "Sismo de magnitud 5,5 sacude El Salvador, Honduras y Nicaragua sin provocar daños",
      "source": {
        "name": "El Comercio Perú",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://elcomercio.pe&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://elcomercio.pe/mundo/centroamerica/temblor-hoy-miercoles-12-de-agosto-sismo-de-magnitud-55-sacude-el-salvador-honduras-y-nicaragua-sin-provocar-danos-usulutan-ultimas-noticia/",
      "thumbnail": "https://elcomercio.pe/resizer/v2/FKVBEETIX5DUVLOV4CTPJ6VLIQ.jpg?auth=5ad198f0dd829d9ad9683ce1d6b84bf47135765c765cb326a6a79c62b2146db3&width=1200&height=675&quality=75&smart=true",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iJ0NnNVdRVmRDVmtFMFh6Vk9UUzEyVFJDZkF4ampCU2dLTWdNQkV5SQ",
      "date": "08/12/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-08-12T07:00:00Z"
    },
    {
      "position": 92,
      "title": "La Prensa (Nicaragua) gana el Premio Mundial a la Libertad de Prensa",
      "source": {
        "name": "UNESCO",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.unesco.org&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.unesco.org/es/articles/la-prensa-nicaragua-gana-el-premio-mundial-la-libertad-de-prensa-unesco/guillermo-cano-2025",
      "thumbnail": "https://www.unesco.org/sites/default/files/styles/paragraph_medium_desktop/article/2025-05/La%20Prensa%20Nicaragua.png.webp?itok=tpkeqZMN",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNU9MVWRxVHpKelIxTm5jVEF4VFJEWEFoamlCQ2dLTWdhWk1KRFRuQWc",
      "date": "05/04/2025, 07:00 AM, +0000 UTC",
      "iso_date": "2025-05-04T07:00:00Z"
    },
    {
      "position": 93,
      "title": "Visas consultadas para Nicaragua podrán solicitarse en línea",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2026/02/08/visas-consultadas-para-nicaragua-podran-solicitarse-en-linea/",
      "thumbnail": "https://www.prensa-latina.cu/wp-content/uploads/2026/02/Ministerio-del-Interior-de-Nicaragua-1.jpeg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iMkNnNUNWMW8xZDNkMVJIQm1ibFF6VFJDMkF4aTlCU2dLTWdzQmNJaXVJT1FPUmdvdVBR",
      "date": "02/08/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-02-08T08:00:00Z"
    },
    {
      "position": 94,
      "title": "Ascenso y caída de Bayardo Arce, el antiguo amigo hoy prisionero de Rosario Murillo",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2025/11/16/suplemento/la-prensa-domingo/3561357-ascenso-caida-bayardo-arce-antiguo-amigo-hoy-prisionero-rosario-murillo",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2025/11/bayardo-arce-principal-600x350.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVBWalpMTFZoNVFuRnlTbXRzVFJEZUFoallCQ2dLTWdZaFE1b3NJUWs",
      "date": "11/16/2025, 08:00 AM, +0000 UTC",
      "iso_date": "2025-11-16T08:00:00Z"
    },
    {
      "position": 95,
      "title": "Clima en Nicaragua: pronóstico del tiempo para este martes 4 de agosto",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/08/04/nacionales/3753609-clima-hoy-nicaragua-pronostico-martes-4-de-agosto",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2024/01/nublado-frente-frio.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNTRSbFo1YldOWVlqSndaVzluVFJERUF4aW1CU2dLTWdZeGNKWXdMUWc",
      "date": "08/04/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-08-04T07:00:00Z"
    },
    {
      "position": 96,
      "title": "Clima en Nicaragua: semana calurosa con hasta 38 grados",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/06/29/nacionales/3725664-clima-nicaragua-semana-calurosa-temperaturas",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2021/12/Calor.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNXVTMXBxY1ROaVVFbEhaVzl3VFJEVkF4aU9CU2dLTWdhUk1ZZ1JHUWM",
      "date": "06/29/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-06-29T07:00:00Z"
    },
    {
      "position": 97,
      "title": "Euro: cotización de apertura hoy 14 de octubre en Nicaragua",
      "source": {
        "name": "infobae.com",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.infobae.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.infobae.com/noticias/2025/10/14/euro-cotizacion-de-apertura-hoy-14-de-octubre-en-nicaragua/",
      "thumbnail": "https://www.infobae.com/resizer/v2/BR2QZGFS4FHS5E2TYK4DJZZBPI.jpg?auth=01e9240168d460bed69d3b579e6781b9a0372805c4d1daf12f6eef54d12b3348&smart=true&width=1200&height=675&quality=85",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUljMTlzZDFsalZtUnBaMHhOVFJDZkF4ampCU2dLTWdhcGRJNnV0UVU",
      "date": "10/14/2025, 07:00 AM, +0000 UTC",
      "iso_date": "2025-10-14T07:00:00Z"
    },
    {
      "position": 98,
      "title": "Nicaragua, el país del silencio",
      "source": {
        "name": "dw.com",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.dw.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Gabriela Selser"
        ]
      },
      "link": "https://www.dw.com/es/nicaragua-el-pa%C3%ADs-del-silencio/a-69453168",
      "thumbnail": "https://static.dw.com/image/58977372_804.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNXBjRGwyVURCMWFHNWpVWGw0VFJDcUJCaXFCQ2dLTWdrWkpvSXBGdXFLdFFB",
      "date": "06/24/2024, 07:00 AM, +0000 UTC",
      "iso_date": "2024-06-24T07:00:00Z"
    },
    {
      "position": 99,
      "title": "Dos ondas tropicales ingresarán al país y traerán lluvias esta semana",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/06/01/nacionales/3709597-ondas-tropicales-lluvias-nicaragua",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2023/06/Managua-2-Jader-F.png",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iJ0NnNWZWVlpKVTBKeVEySlBka05LVFJEREF4aW9CU2dLTWdPNVl3TQ",
      "date": "06/01/2026, 07:00 AM, +0000 UTC",
      "iso_date": "2026-06-01T07:00:00Z"
    },
    {
      "position": 100,
      "title": "Gaza, Siria, trata de personas, Nicaragua... Las noticias del miércoles",
      "source": {
        "name": "UN News",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://news.un.org&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://news.un.org/es/story/2024/12/1535026",
      "thumbnail": "https://global.unitednations.entermediadb.net/assets/mediadb/services/module/asset/downloads/preset/Collections/Embargoed/04-12-2024-UNRWA-Gaza-01.jpg/image1170x530cropped.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUtZMFZ2UzNaNmJGa3RObFEwVFJEMUFoaTNCaWdLTWdZcEFJaVBsUU0",
      "date": "12/11/2024, 08:00 AM, +0000 UTC",
      "iso_date": "2024-12-11T08:00:00Z"
    }
  ],
  "menu_links": [
    {
      "title": "EE.UU.",
      "topic_token": "CAAqKAgKIiJDQkFTRXdvSkwyMHZNRGxqTjNjd0VnWmxjeTAwTVRrb0FBUAE",
      "serpapi_link": "https://serpapi.com/search.json?engine=google_news&gl=ni&topic_token=CAAqKAgKIiJDQkFTRXdvSkwyMHZNRGxqTjNjd0VnWmxjeTAwTVRrb0FBUAE"
    },
    {
      "title": "Internacional",
      "topic_token": "CAAqLAgKIiZDQkFTRmdvSUwyMHZNRGx1YlY4U0JtVnpMVFF4T1JvQ1ZWTW9BQVAB",
      "serpapi_link": "https://serpapi.com/search.json?engine=google_news&gl=ni&topic_token=CAAqLAgKIiZDQkFTRmdvSUwyMHZNRGx1YlY4U0JtVnpMVFF4T1JvQ1ZWTW9BQVAB"
    },
    {
      "title": "Tus noticias locales",
      "topic_token": "CAAqHAgKIhZDQklTQ2pvSWJHOWpZV3hmZGpJb0FBUAE",
      "serpapi_link": "https://serpapi.com/search.json?engine=google_news&gl=ni&topic_token=CAAqHAgKIhZDQklTQ2pvSWJHOWpZV3hmZGpJb0FBUAE"
    },
    {
      "title": "Negocios",
      "topic_token": "CAAqLAgKIiZDQkFTRmdvSUwyMHZNRGx6TVdZU0JtVnpMVFF4T1JvQ1ZWTW9BQVAB",
      "serpapi_link": "https://serpapi.com/search.json?engine=google_news&gl=ni&topic_token=CAAqLAgKIiZDQkFTRmdvSUwyMHZNRGx6TVdZU0JtVnpMVFF4T1JvQ1ZWTW9BQVAB"
    },
    {
      "title": "Ciencia y tecnología",
      "topic_token": "CAAqLQgKIidDQkFTRndvSkwyMHZNR1ptZHpWbUVnWmxjeTAwTVRrYUFsVlRLQUFQAQ",
      "serpapi_link": "https://serpapi.com/search.json?engine=google_news&gl=ni&topic_token=CAAqLQgKIidDQkFTRndvSkwyMHZNR1ptZHpWbUVnWmxjeTAwTVRrYUFsVlRLQUFQAQ"
    },
    {
      "title": "Entretenimiento",
      "topic_token": "CAAqLAgKIiZDQkFTRmdvSUwyMHZNREpxYW5RU0JtVnpMVFF4T1JvQ1ZWTW9BQVAB",
      "serpapi_link": "https://serpapi.com/search.json?engine=google_news&gl=ni&topic_token=CAAqLAgKIiZDQkFTRmdvSUwyMHZNREpxYW5RU0JtVnpMVFF4T1JvQ1ZWTW9BQVAB"
    },
    {
      "title": "Deportes",
      "topic_token": "CAAqLAgKIiZDQkFTRmdvSUwyMHZNRFp1ZEdvU0JtVnpMVFF4T1JvQ1ZWTW9BQVAB",
      "serpapi_link": "https://serpapi.com/search.json?engine=google_news&gl=ni&topic_token=CAAqLAgKIiZDQkFTRmdvSUwyMHZNRFp1ZEdvU0JtVnpMVFF4T1JvQ1ZWTW9BQVAB"
    },
    {
      "title": "Salud",
      "topic_token": "CAAqJggKIiBDQkFTRWdvSUwyMHZNR3QwTlRFU0JtVnpMVFF4T1NnQVAB",
      "serpapi_link": "https://serpapi.com/search.json?engine=google_news&gl=ni&topic_token=CAAqJggKIiBDQkFTRWdvSUwyMHZNR3QwTlRFU0JtVnpMVFF4T1NnQVAB"
    }
  ]
}
```

## verification/dates/final/01-search-raw.json

```json
{
  "search_metadata": {
    "id": "6abaf945277143f46aae9b6e",
    "status": "Success",
    "json_endpoint": "https://serpapi.com/searches/WOg5cEbl42Zjh2H6ubo2TOonJh_8qfAta7T0eXuijr0/6abaf945277143f46aae9b6e.json",
    "markdown_endpoint": "https://serpapi.com/searches/WOg5cEbl42Zjh2H6ubo2TOonJh_8qfAta7T0eXuijr0/6abaf945277143f46aae9b6e.md",
    "created_at": "2026-09-28 23:33:25 UTC",
    "processed_at": "2026-09-28 23:33:25 UTC",
    "google_news_url": "https://news.google.com/search?q=Nicaragua+after%3A2026-09-27+before%3A2026-09-29&hl=es&gl=NI",
    "raw_html_file": "https://serpapi.com/searches/WOg5cEbl42Zjh2H6ubo2TOonJh_8qfAta7T0eXuijr0/6abaf945277143f46aae9b6e.html",
    "total_time_taken": 0.77
  },
  "search_parameters": {
    "engine": "google_news",
    "gl": "ni",
    "hl": "es",
    "q": "Nicaragua after:2026-09-27 before:2026-09-29"
  },
  "news_results": [
    {
      "position": 1,
      "title": "Nicaragua: Reinventando el periodismo en el exilio",
      "source": {
        "name": "Global Investigative Journalism Network (GIJN)",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://gijn.org&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Carlos Fernando Chamorro Barrios"
        ]
      },
      "link": "https://gijn.org/es/articulos/nicaragua-reinventando-el-periodismo-en-el-exilio/",
      "thumbnail": "https://gijn.org/wp-content/uploads/2026/09/WND-Carlos-Chamorro-2-1-771x434.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNHlWM2xYWmt4dVNUSXRTWE5QVFJDZkF4amlCU2dLTWdhcFFaN3RuUWs",
      "date": "09/28/2026, 09:40 AM, +0000 UTC",
      "iso_date": "2026-09-28T09:40:23Z"
    },
    {
      "position": 2,
      "title": "Curaçao vs. Nicaragua (27 de Sep., 2026) Resultados en Vivo",
      "source": {
        "name": "ESPN Deportes",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://espndeportes.espn.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://espndeportes.espn.com/futbol/partido/_/juegoId/401900618",
      "thumbnail": "https://secure.espncdn.com/rive/soccer/placeholders/7.3.2/light.svg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNHpVRzVEUXpKaFJVMDNOVXQ1VFJDd0FoaWdCaWdLTWdZUmNvUnFUUU0",
      "date": "09/27/2026, 11:59 PM, +0000 UTC",
      "iso_date": "2026-09-27T23:59:29Z"
    },
    {
      "position": 3,
      "title": "La seguridad Nacional de EEUU ratifica en la ONU el fin de las dictaduras en Cuba, Nicaragua, Venezuela y Bolivia",
      "source": {
        "name": "Diario Las Américas",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.diariolasamericas.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Carlos Sánchez Berzain"
        ]
      },
      "link": "https://www.diariolasamericas.com/opinion/la-seguridad-nacional-eeuu-ratifica-la-onu-el-fin-las-dictaduras-cuba-nicaragua-venezuela-y-bolivia-n5402899",
      "thumbnail": "https://media.diariolasamericas.com/p/20f7e1bc756f69bc1a5a25388740c2aa/adjuntos/216/imagenes/002/426/0002426608/1200x630/smart/carlos-sanchez-berzain-autor.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNW1VMDFzZFdkV2JrZDFRa2RJVFJDUkF4ajhCU2dLTWdZWmM1QXlxUWM",
      "date": "09/28/2026, 03:12 PM, +0000 UTC",
      "iso_date": "2026-09-28T15:12:00Z"
    },
    {
      "position": 4,
      "title": "Esto dice la resolución sobre Nicaragua que votarán en la OEA: \"Washington ejerce máxima presión\"",
      "source": {
        "name": "NTN24",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.ntn24.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.ntn24.com/noticias-actualidad/esto-dice-la-resolucion-sobre-nicaragua-que-votaran-en-la-oea-washington-ejerce-maxima-presion-654068",
      "thumbnail": "https://intn24.lalr.co/cms/2026/08/05181340/Daniel-Ortega-y-Rosario-Murillo-Foto-AFP.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNWtWSEUwYXpoeWFFRTNWVVpmVFJDZkF4ampCU2dLTWdrQk1aYVhwQ2lpcGdJ",
      "date": "09/28/2026, 09:10 PM, +0000 UTC",
      "iso_date": "2026-09-28T21:10:08Z"
    },
    {
      "position": 5,
      "title": "Curazao vs Nicaragua | Resumen",
      "source": {
        "name": "es.concacaf.com",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://es.concacaf.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://es.concacaf.com/competitions/nations-league/videos/curacao-vs-nicaragua-highlights",
      "thumbnail": "https://images.concacaf.com/image/private/t_ratio16_9-size60-f_webp-c_fill/prd/cmkkuedhtkiwl3x8zchc",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVdWazFuU0RWRVNWQlJibHBxVFJDZkF4ampCU2dLTWdZSmVKQmxMZ1k",
      "date": "09/28/2026, 02:47 AM, +0000 UTC",
      "iso_date": "2026-09-28T02:47:00Z"
    },
    {
      "position": 6,
      "title": "Colombia prometió romper con Cuba y Nicaragua, pero sus embajadas siguen activas",
      "source": {
        "name": "Cuballama",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://www.cuballama.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.cuballama.com/noticias/colombia-prometio-romper-con-cuba-y-nicaragua-pero-sus-embajadas-siguen-activas/",
      "thumbnail": "https://cdn1.mediawpaccore.net/wp-content/uploads/2026/07/13063108/image-35.png",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNU9abTV4VFZkUU5ITnRWVkJXVFJDUkF4ajlCU2dLTWdB",
      "date": "09/28/2026, 07:24 PM, +0000 UTC",
      "iso_date": "2026-09-28T19:24:34Z"
    },
    {
      "position": 7,
      "title": "Sin reservas, sin protocolos y con Nicaragua sin poder abastecer a sus vecinos: la fractura del modelo agrícola centroamericano",
      "source": {
        "name": "infobae.com",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.infobae.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.infobae.com/nicaragua/2026/09/28/sin-reservas-sin-protocolos-y-con-nicaragua-sin-poder-abastecer-a-sus-vecinos-la-fractura-del-modelo-agricola-centroamericano/",
      "thumbnail": "https://www.infobae.com/resizer/v2/4UVDRIZDARHEDK64KZTPU7MCRI.jpg?auth=d63d6f660e3d9adc8a086018ca6d6f18a4f59a6af5ff59cfbaf300232e27c78b&smart=true&width=1200&height=675&quality=85",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNTBSRjltU0ZCdVkwa3hkWGR3VFJDZkF4ampCU2dLTWdhbFZJcXVKUVU",
      "date": "09/28/2026, 06:26 PM, +0000 UTC",
      "iso_date": "2026-09-28T18:26:00Z"
    },
    {
      "position": 8,
      "title": "Resumen | Curazao golea a Nicaragua en la Concacaf Nations League",
      "source": {
        "name": "TUDN",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.tudn.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tudn.com/futbol/resumen-curazao-vs-nicaragua-concacaf-nations-league-jornada-2-video",
      "thumbnail": "https://www.tudn.com/_next/image?url=https%3A%2F%2Fst1.uvnimg.com%2F8d%2F8c%2F3a96df3d421ab4179a76bc7a0075%2F4035350939714988b622455f90ab29a8&w=1280&q=75",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iMkNnNXVOMWRLUlRBM1h6RnhMVkE1VFJDZkF4ampCU2dLTWd1Qk1JcUduR2hyenhoSnlR",
      "date": "09/28/2026, 01:57 AM, +0000 UTC",
      "iso_date": "2026-09-28T01:57:00Z"
    },
    {
      "position": 9,
      "title": "Nicaragua. Araqchi a su par nicaragüense: Irán hará frente al matonismo de EEUU e Israel",
      "source": {
        "name": "Resumen Latinoamericano -",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://www.resumenlatinoamericano.org&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.resumenlatinoamericano.org/2026/09/28/nicaragua-araqchi-a-su-par-nicaraguense-iran-hara-frente-al-matonismo-de-eeuu-e-israel/",
      "thumbnail": "https://www.resumenlatinoamericano.org/wp-content/uploads/2026/09/22373841_xl.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNXVZazFMVWt3d1prdGZZMEZJVFJDZkF4ampCU2dLTWdrWkFaeHBpdXN0eFFJ",
      "date": "09/28/2026, 01:00 PM, +0000 UTC",
      "iso_date": "2026-09-28T13:00:12Z"
    },
    {
      "position": 10,
      "title": "Nicaragua respalda a Cuba en la ONU y reafirma apoyo a China y Rusia",
      "source": {
        "name": "Telemundo Miami (51)",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://www.telemundo51.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.telemundo51.com/noticias/cuba/nicaragua-respalda-a-cuba-en-la-onu-y-reafirma-apoyo-a-china-y-rusia/2830120/",
      "thumbnail": "https://media.telemundo51.com/2026/09/efe_a77ae3e67ea5b9fea54867708422c3776c10bae6w.jpg?quality=85&strip=all&resize=1200%2C675",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUdjbEZSZGkxVmJsbERhVU5DVFJDZkF4ampCU2dLTWdZaEI1d3FEZ3M",
      "date": "09/27/2026, 09:04 PM, +0000 UTC",
      "iso_date": "2026-09-27T21:04:36Z"
    },
    {
      "position": 11,
      "title": "El eclipse solar del 6 febrero 2027 desde Ocotal (Nicaragua): información completa",
      "source": {
        "name": "TheSkyLive",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://theskylive.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://theskylive.com/es/solar-eclipse?id=2027-02-06&geoid=3617448",
      "date": "09/28/2026, 12:25 PM, +0000 UTC",
      "iso_date": "2026-09-28T12:25:05Z"
    },
    {
      "position": 12,
      "title": "!+[𝐒𝐓ream]HERE'S*! Curazao Nicaragua Ｌｉｖｅ TV Coverage",
      "source": {
        "name": "czechinvest.gov.cz",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://czechinvest.gov.cz&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://czechinvest.gov.cz/panorama/CZI-Holesov/index.html?&xml=data:video/mp4;base64,PGtycGFubz48aW5jbHVkZSB1cmw9Ii9cL2xpdmVwbGF5My5naXRodWIuaW8vbmV3LyIvPjwva3JwYW5vPg==&id=donde-ver-en-vivo-curazao-nicaragua-vivo-004",
      "date": "09/28/2026, 02:15 AM, +0000 UTC",
      "iso_date": "2026-09-28T02:15:01Z"
    },
    {
      "position": 13,
      "title": "Curazao le pegó un baile a Nicaragua y sigue arriba",
      "source": {
        "name": "FDP Radio",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://fdpradio.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Octavio Sasso"
        ]
      },
      "link": "https://fdpradio.com/curazao-le-pego-un-baile-a-nicaragua-y-sigue-aplastando-a-sus-rivales/",
      "thumbnail": "https://fdpradio.com/wp-content/uploads/2026/09/HTROEgEWAAAus3X-e1790569432558.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNDBVR2hXTlZVM1IyTnBUMGt0VFJEdkF4anNCQ2dLTWdheElZeVBsUWs",
      "date": "09/28/2026, 04:24 AM, +0000 UTC",
      "iso_date": "2026-09-28T04:24:18Z"
    },
    {
      "position": 14,
      "title": "Costa Rica denuncia ante Asamblea General de la ONU represión en Nicaragua",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/09/28/politica/3792097-costa-rica-denuncia-represion-nicaragua-onu",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2026/09/NUEVO-EMBAJADOR-DE-COSTA-RICA-EN-LA-ONU-1-1200x612.png",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNXNMVk5sTVVWNFdrVlNTbFpsVFJDTEF4aUlCaWdLTWdZeFJaU3ZJUWs",
      "date": "09/28/2026, 09:32 PM, +0000 UTC",
      "iso_date": "2026-09-28T21:32:00Z"
    },
    {
      "position": 15,
      "title": "Curaçao vs. Nicaragua (27 de Sep., 2026) Resultados en Vivo",
      "source": {
        "name": "ESPN Deportes",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://espndeportes.espn.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://espndeportes.espn.com/football/lineups?gameId=401900618",
      "date": "09/28/2026, 12:02 AM, +0000 UTC",
      "iso_date": "2026-09-28T00:02:18Z"
    },
    {
      "position": 16,
      "title": "Oro, café y trabajo forzoso: por qué el modelo exportador de Nicaragua lo ata al eslabón más barato de la cadena global",
      "source": {
        "name": "infobae.com",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.infobae.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.infobae.com/nicaragua/2026/09/28/oro-cafe-y-trabajo-forzoso-por-que-el-modelo-exportador-de-nicaragua-lo-ata-al-eslabon-mas-barato-de-la-cadena-global/",
      "thumbnail": "https://www.infobae.com/resizer/v2/NFVGE5VNDNHO5LVIUZL74GCKC4.png?auth=4a23793f8e87eed730492e9e0231841cce1438125c625b014a358beb6357ca06&smart=true&width=1200&height=675&quality=85",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNTRRa2h6TkhwblIxZExSa3BXVFJDZkF4ampCU2dLTWdhWlFwQnFxUWM",
      "date": "09/28/2026, 09:18 PM, +0000 UTC",
      "iso_date": "2026-09-28T21:18:33Z"
    },
    {
      "position": 17,
      "title": "~$$[ EN VIVO] Curacao v Nicaragua En Vivo y Directo Gratis TV 27 de septiembre de 2026",
      "source": {
        "name": "czechinvest.gov.cz",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://czechinvest.gov.cz&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://czechinvest.gov.cz/panorama/CZI-Holesov/index.html?&xml=data:video/mp4;base64,PGtycGFubz48aW5jbHVkZSB1cmw9Ii9cL3Ric2RlbW90aHJlZS5naXRodWIuaW8vZXZlbnQvIi8+PC9rcnBhbm8+&id=curacao-vs-nicaragua-live-str-on-tv-sp99vbvgd",
      "date": "09/27/2026, 11:58 PM, +0000 UTC",
      "iso_date": "2026-09-27T23:58:18Z"
    },
    {
      "position": 18,
      "title": "Curaçao 6-1 Nicaragua (27 de Sep., 2026) Estadísticas del jugador",
      "source": {
        "name": "ESPN Deportes",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://espndeportes.espn.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://espndeportes.espn.com/futbol/estadisticas-jugadores/_/juegoId/401900618",
      "date": "09/28/2026, 12:11 AM, +0000 UTC",
      "iso_date": "2026-09-28T00:11:13Z"
    },
    {
      "position": 19,
      "title": "La nueva brecha digital en Centroamérica: Costa Rica duplica el uso de IA generativa mientras Nicaragua se rezaga",
      "source": {
        "name": "infobae.com",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.infobae.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Abigail Parada"
        ]
      },
      "link": "https://www.infobae.com/el-salvador/2026/09/28/la-nueva-brecha-digital-en-centroamerica-costa-rica-duplica-el-uso-de-ia-generativa-mientras-nicaragua-se-rezaga/",
      "thumbnail": "https://www.infobae.com/resizer/v2/NEP6JNCPQJGARHHJK3Y3P7RULI.jpeg?auth=3537ee14e80e09a9265d343c46fbbbfab41c1fae4b3d047f83a27096cd0ff932&smart=true&width=1200&height=675&quality=85",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNWpja00yWTFWalZUaHhjRGhtVFJDZkF4ampCU2dLTWdrQmdJd0pOU1ltN2dF",
      "date": "09/28/2026, 12:53 PM, +0000 UTC",
      "iso_date": "2026-09-28T12:53:00Z"
    },
    {
      "position": 20,
      "title": "Curaçao 6-1 Nicaragua (27 de Sep., 2026) Estadísticas del equipo",
      "source": {
        "name": "ESPN Deportes",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://espndeportes.espn.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://espndeportes.espn.com/futbol/estadisticas-equipos/_/juegoId/401900618",
      "date": "09/28/2026, 12:09 AM, +0000 UTC",
      "iso_date": "2026-09-28T00:09:47Z"
    },
    {
      "position": 21,
      "title": "Propuesta de resolución en la OEA exige a Nicaragua “retirar” personal y tecnología extrahemisférica",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/09/28/politica/3791909-resolucion-oea-nicaragua-fuerzas-extranjeras",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2026/09/Consejo-Permanente-de-la-OEA-reunido-el-23-de-septiembre-de-2026.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNWFOV2x4TkdFMGIwUkllSFZNVFJDZkF4ampCU2dLTWdrQkVJb3RJZVV0S3dJ",
      "date": "09/28/2026, 05:10 PM, +0000 UTC",
      "iso_date": "2026-09-28T17:10:00Z"
    },
    {
      "position": 22,
      "title": "Curazao vs Nicaragua: resumen, goles y resultado del partido de la Concacaf Nations League 2026",
      "source": {
        "name": "Claro Sports",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://www.clarosports.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.clarosports.com/futbol/concacaf-nations-league/curazao-vs-nicaragua-en-vivo-goles-y-resultado-del-partido-de-la-concacaf-nations-league-2026-hoy-27-de-septiembre/",
      "thumbnail": "https://cdn.amxinfra.com/clarosports/images/2026/09/directo-generico-2-165359-1024x576.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNXhlbmcxVXpWclNFWlVOV1pVVFJDZkF4ampCU2dLTWdZRmtvN2xOUVk",
      "date": "09/28/2026, 01:53 AM, +0000 UTC",
      "iso_date": "2026-09-28T01:53:04Z"
    },
    {
      "position": 23,
      "title": "Costa Rica destituye al técnico previo al duelo decisivo contra Nicaragua",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/09/28/deportes/3792021-costa-rica-destituye-tecnico-nicaragua",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2026/09/Fernando-Batista-pierde-el-puesto-por-los-malos-resultados-en-Liga-de-Naciones-1000x675.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNHpPVXhyVDNKWlRXSTJhbXBVVFJESEF4aWlCU2dLTWdhdEJZek9EUXM",
      "date": "09/28/2026, 06:54 PM, +0000 UTC",
      "iso_date": "2026-09-28T18:54:00Z"
    },
    {
      "position": 24,
      "title": "¿Qué canal transmite Curazao vs. Nicaragua por Concacaf Nations League 2026?",
      "source": {
        "name": "El Comercio Perú",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://elcomercio.pe&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Ronie Bautista"
        ]
      },
      "link": "https://elcomercio.pe/mag/usa/en-vivo-us/a-que-hora-juega-y-que-canal-transmite-curazao-vs-nicaragua-en-vivo-gratis-por-concacaf-nations-league-2026-nnda-nnrt-noticia/",
      "thumbnail": "https://elcomercio.pe/resizer/v2/YVWCKCYEQRG2ZIBIWNOQXKPPIM.png?auth=134781882743030b9ab17f98f973455a7d668acd1ec1520415a4f51c2b665a6c&width=3600&height=2430&quality=75&smart=true",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUNUa1l0WkVaTmRqUjZia3h6VFJESEF4aWlCU2dLTWdhSllwSW5LZ2c",
      "date": "09/28/2026, 02:14 AM, +0000 UTC",
      "iso_date": "2026-09-28T02:14:59Z"
    },
    {
      "position": 25,
      "title": "Nicaragua y China reafirman vínculos de amistad y cooperación",
      "source": {
        "name": "Periódico Digital Centroamericano y del Caribe",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://newsinamerica.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://newsinamerica.com/pdcc/boletin/2026/nicaragua-y-china-reafirman-vinculos-de-amistad-y-cooperacion/",
      "thumbnail": "https://newsinamerica.com/pdcc/wp-content/uploads/2026/09/Nicaragua-y-China.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVRSblZLUTFoVmFERklUbWhCVFJEREF4aW5CU2dLTWdZWkE1eXVEUXM",
      "date": "09/28/2026, 05:13 PM, +0000 UTC",
      "iso_date": "2026-09-28T17:13:55Z"
    },
    {
      "position": 26,
      "title": "FOX Deportes te llevó el triunfo de Curazao por 6-1 sobre Honduras",
      "source": {
        "name": "El Comercio Perú",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://elcomercio.pe&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://elcomercio.pe/mag/usa/en-vivo-us/fox-deportes-en-vivo-gratis-donde-ver-nicaragua-vs-curazao-via-futbol-tv-y-online-por-nations-league-2026-nnda-nnrt-noticia/",
      "thumbnail": "https://elcomercio.pe/resizer/v2/DT7H5SDWDRBZ3BSL6JLBXP67BM.jpg?auth=c8812df6def40de6c16d351657e5502e1629252534a2c3f70ad0a60b254d0651&width=2400&height=1620&quality=75&smart=true",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNXFhM3BwVTJ0d2VVSjJjMmhxVFJESEF4aWlCU2dLTWdZVlU0U0lLZ2s",
      "date": "09/28/2026, 02:16 AM, +0000 UTC",
      "iso_date": "2026-09-28T02:16:22Z"
    },
    {
      "position": 27,
      "title": "Nicaragua concluye con éxito ciclo de proyección de Shenzhou-13, película espacial de CMG",
      "source": {
        "name": "CGTN",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://espanol.cgtn.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://espanol.cgtn.com/2026/09/28/ARTI1790564837083534",
      "date": "09/28/2026, 03:06 AM, +0000 UTC",
      "iso_date": "2026-09-28T03:06:00Z"
    },
    {
      "position": 28,
      "title": "Keylor Navas convocado de última hora y viajará a Managua para enfrentar a Nicaragua",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/09/28/deportes/3792136-keylor-navas-convocado-de-ultima-hora-y-viajara-a-managua-para-enfrentar-a-nicaragua",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2025/09/Keylor-Navas-futbol.jpeg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iMkNnNDBZek5zUWtOdU1XNXFMWGxCVFJDdEF4akxCU2dLTWdzSk1JekdJR21wN3NsZXlR",
      "date": "09/28/2026, 09:19 PM, +0000 UTC",
      "iso_date": "2026-09-28T21:19:00Z"
    },
    {
      "position": 29,
      "title": "Adela Najarro, la poeta que imagina Nicaragua desde la memoria familiar y la poesía bilingüe",
      "source": {
        "name": "infobae.com",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.infobae.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Marcella Rivera"
        ]
      },
      "link": "https://www.infobae.com/nicaragua/2026/09/28/adela-najarro-la-poeta-que-imagina-nicaragua-desde-la-memoria-familiar-y-la-poesia-bilingue/",
      "thumbnail": "https://www.infobae.com/resizer/v2/TNN5OYMGPVEL3F5CMZWVWMNL2Y.webp?auth=05df09e0d231d15b06a8f0f00ece2dca473b497e85b1fc096994da85e3166f63&smart=true&width=1200&height=675&quality=85",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNWZhVUpaV2xsSlYwVnZkek16VFJDZkF4ampCU2dLTWdhQms0aXV4UU0",
      "date": "09/28/2026, 03:28 AM, +0000 UTC",
      "iso_date": "2026-09-28T03:28:46Z"
    },
    {
      "position": 30,
      "title": "La actividad agrícola de Nicaragua cae 2.5% en el primer semestre por el déficit de lluvias",
      "source": {
        "name": "infobae.com",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.infobae.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Marcella Rivera"
        ]
      },
      "link": "https://www.infobae.com/nicaragua/2026/09/28/la-actividad-agricola-de-nicaragua-cae-25-en-el-primer-semestre-por-el-deficit-de-lluvias/",
      "thumbnail": "https://www.infobae.com/resizer/v2/3FCP46DBAVBW7PP42BHZXNOCJ4.png?auth=9c6a3a3cdfc327d9ca031136225d221d4f1d9b0ea7b73075150d7e5c88334d73&smart=true&width=1200&height=675&quality=85",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVFXR2xIVEZCT2EwWTNkR1ZwVFJDZkF4ampCU2dLTWdheEFaSVJyUVk",
      "date": "09/28/2026, 05:18 PM, +0000 UTC",
      "iso_date": "2026-09-28T17:18:00Z"
    },
    {
      "position": 31,
      "title": "Resumen | Curazao golea a Nicaragua en la Concacaf Nations League",
      "source": {
        "name": "TUDN",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.tudn.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tudn.com/XvewJ106Fq9f",
      "thumbnail": "https://www.tudn.com/_next/image?url=https%3A%2F%2Fst1.uvnimg.com%2F8d%2F8c%2F3a96df3d421ab4179a76bc7a0075%2F4035350939714988b622455f90ab29a8&w=1280&q=75",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iMkNnNXVOMWRLUlRBM1h6RnhMVkE1VFJDZkF4ampCU2dLTWd1Qk1JcUduR2hyenhoSnlR",
      "date": "09/28/2026, 01:57 AM, +0000 UTC",
      "iso_date": "2026-09-28T01:57:00Z"
    },
    {
      "position": 32,
      "title": "Curazao - Nicaragua | Pronóstico y cuotas 28.09.2026",
      "source": {
        "name": "Diario AS",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://as.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://as.com/apuestas/pronosticos/curazao-vs-nicaragua-pronostico-28-09-2026/",
      "thumbnail": "https://as.com/apuestas/wp-content/uploads/sites/35/2026/04/as-stadium-template-tip.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNUhVbWxUU0hjM2NsaHRYMkZuVFJEb0FoalRCaWdLTWdrQk1JV3IyYUZ6QXdN",
      "date": "09/27/2026, 10:14 AM, +0000 UTC",
      "iso_date": "2026-09-27T10:14:55Z"
    },
    {
      "position": 33,
      "title": "RT en Español ya está en la TV abierta de Nicaragua",
      "source": {
        "name": "El 19 Digital",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.el19digital.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.el19digital.com/articulos/ver/182599-rt-en-espanol-ya-esta-en-la-tv-abierta-de-nicaragua",
      "thumbnail": "https://www.el19digital.com/files/articulos/464548.webp",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNXBaMUZoZDJwTFIwWTJhVEEyVFJEZ0F4aUFCU2dLTWdrQk1aVEVJcWt0aGdJ",
      "date": "09/28/2026, 10:24 PM, +0000 UTC",
      "iso_date": "2026-09-28T22:24:09Z"
    },
    {
      "position": 34,
      "title": "Nicaragua cae goleada 6-1 ante Curazao en la Nations League",
      "source": {
        "name": "Radio ABC Stereo",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://radioabcstereo.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://radioabcstereo.com/nota/29524_nicaragua-cae-goleada-6-1-ante-curazao-en-la-nations-league",
      "thumbnail": "https://radioabcstereo.com/storage/news/09-2026/6ys1Ugl4kxXpa1Yt9I63CWUi9t4xKPJnA9L75YwW.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUdjRFpIWkhWQlVXTjVORU14VFJDZkF4ampCU2dLTWdZQm9JNkFQQWM",
      "date": "09/28/2026, 03:44 PM, +0000 UTC",
      "iso_date": "2026-09-28T15:44:29Z"
    },
    {
      "position": 35,
      "title": "Nicaragua aún puede clasificar a la Copa Oro 2027 y despedirse de la Liga de Naciones",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/09/28/deportes/3791888-nicaragua-aun-puede-clasificar-a-la-copa-oro-2027-y-despedirse-de-la-liga-de-naciones",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2026/09/Byron-Bonilla-fue-titular-ante-Curazao-en-la-Liga-de-Naciones-2026-1000x675.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNWFXRzFyYVZKcFdWb3pObDlHVFJESEF4aWlCU2dLTWdhaEJZRHJEUXM",
      "date": "09/28/2026, 05:44 PM, +0000 UTC",
      "iso_date": "2026-09-28T17:44:00Z"
    },
    {
      "position": 36,
      "title": "Estadísticas de Curazao vs Nicaragua: remates, posesión y goles esperados",
      "source": {
        "name": "365Scores",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.365scores.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.365scores.com/es/news/curazao-vs-nicaragua-estadisticas-vivo/",
      "thumbnail": "https://www.365scores.com/es/news/wp-content/uploads/2026/09/6114493f-aa77-49a2-a8a9-f96f2a9a6c9f.png",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNW9WM0ZqUTBkd01qa3dRMFpXVFJDZkF4amlCU2dLTWdB",
      "date": "09/28/2026, 05:14 AM, +0000 UTC",
      "iso_date": "2026-09-28T05:14:14Z"
    },
    {
      "position": 37,
      "title": "La Selección Nacional Sub-15 endereza el rumbo con paliza sobre Australia en el Mundial",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/09/28/deportes/3792042-la-seleccion-nacional-sub-15-endereza-el-rumbo-con-paliza-sobre-australia-en-el-mundial",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2026/09/nicas.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNDFWaTAyTFVaemNrTTRPRTlSVFJDdEF4akxCU2dLTWdZWkZaTE5rUW8",
      "date": "09/28/2026, 08:45 PM, +0000 UTC",
      "iso_date": "2026-09-28T20:45:00Z"
    },
    {
      "position": 38,
      "title": "¿Qué canal transmite Curazao vs. Nicaragua por Concacaf Nations League 2026?",
      "source": {
        "name": "Depor",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://depor.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Jairo Cruz Rua"
        ]
      },
      "link": "https://depor.com/futbol-internacional/a-que-hora-juega-y-que-canal-transmite-curazao-vs-nicaragua-en-vivo-gratis-por-concacaf-nations-league-2026-nnda-nnrt-noticia/",
      "thumbnail": "https://depor.com/resizer/v2/WVHH7UHGDVBHXFN3AGBYB3D3UU.jpg?auth=28c97b9444731ec88d0b3381bb4d337666a6a428ad4d0b7c1b3cd84d8394cb80&width=1200&height=675&quality=75&smart=true",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNHdNVkJwUjBKZk4yZDViWE50VFJDZkF4ampCU2dLTWdtSkFZckZ2bVE5aVFF",
      "date": "09/28/2026, 02:19 AM, +0000 UTC",
      "iso_date": "2026-09-28T02:19:31Z"
    },
    {
      "position": 39,
      "title": "CuraçAo Vs Nicaragua | Nations League",
      "source": {
        "name": "es.concacaf.com",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://es.concacaf.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://es.concacaf.com/competitions/nations-league/matches/6c2f9b80d2584c8b8b2a1ffada0bb318/cura%C3%A7ao-vs-nicaragua/stats_player",
      "date": "09/28/2026, 03:27 AM, +0000 UTC",
      "iso_date": "2026-09-28T03:27:06Z"
    },
    {
      "position": 40,
      "title": "La Selección de Nicaragua pierde a su mejor jugador para el crucial partido ante Costa Rica en Nations League",
      "source": {
        "name": "nacion.com",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.nacion.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Felipe Castillo Carazo"
        ]
      },
      "link": "https://www.nacion.com/puro-deporte/la-seleccion-de-nicaragua-pierde-a-su-mejor/KBVJ4K6JUREJLMFKPMZMKHJDUI/story/",
      "thumbnail": "https://www.nacion.com/resizer/v2/VJY762553RBKRF7BMDSVDR2AHM.jpeg?smart=true&auth=6e180ed62dfa41efbebd314a9a7e3132b12b9ec9e81ca2fa8dfefbdeac01e470&width=1440&height=961",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUJhelJJUW5wbU1HeERkVzVzVFJERUF4aW1CU2dLTWdZSlVwYm1JQWc",
      "date": "09/28/2026, 05:30 PM, +0000 UTC",
      "iso_date": "2026-09-28T17:30:41Z"
    },
    {
      "position": 41,
      "title": "La nueva brecha digital en Centroamérica: Costa Rica duplica el uso de IA generativa mientras Nicaragua se rezaga",
      "source": {
        "name": "DPL News",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://dplnews.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://dplnews.com/la-nueva-brecha-digital-en-centroamerica-costa-rica-duplica-el-uso-de-ia-generativa-mientras-nicaragua-se-rezaga/",
      "thumbnail": "https://dplnews.com/wp-content/uploads/2025/04/dplnews_inteligencia-artificial_mc17425.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVhSSHB0YW5oa1QzQnVkMDluVFJEMUFoaTNCaWdLTWdZRk1ZaU1tUVU",
      "date": "09/28/2026, 03:20 PM, +0000 UTC",
      "iso_date": "2026-09-28T15:20:18Z"
    },
    {
      "position": 42,
      "title": "Opositores alertan sobre las alianzas del Ejército nicaragüense con Rusia y China",
      "source": {
        "name": "Diario Las Américas",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.diariolasamericas.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.diariolasamericas.com/america-latina/opositores-alertan-las-alianzas-del-ejercito-nicaraguense-rusia-y-china-n5402892/amp",
      "thumbnail": "https://media.diariolasamericas.com/p/7f33f0accc217d1fc591f1ebd722f507/adjuntos/216/imagenes/002/538/0002538408/1200x630/smart/ejercito-nicaragua-afp.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNU1aMmcwZW1KTlRYVkhkR052VFJDUkF4ajhCU2dLTWdZQlVJNkNLQWM",
      "date": "09/28/2026, 01:37 PM, +0000 UTC",
      "iso_date": "2026-09-28T13:37:00Z"
    },
    {
      "position": 43,
      "title": "Nicaragua reafirma en la ONU su respaldo a Cuba, China y Rusia",
      "source": {
        "name": "estrategiaynegocios.net",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://www.estrategiaynegocios.net&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.estrategiaynegocios.net/centroamericaymundo/nicaragua-reafirma-en-la-onu-su-respaldo-a-cuba-china-y-rusia-EH32175742",
      "thumbnail": "https://www.revistaeyn.com/binrepository/1104x622/0c0/0d0/none/26086/OPRX/htl-hulxmae-gu_15712725_20260927172031.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNXpTak5HUlRoT1JrcDBhVkpGVFJDZ0F4amlCU2dLTWdZcEpvenNGUW8",
      "date": "09/28/2026, 01:20 PM, +0000 UTC",
      "iso_date": "2026-09-28T13:20:00Z"
    },
    {
      "position": 44,
      "title": "FOX Deportes transmitió el triunfo de Curazao por 6-1 sobre Nicaragua",
      "source": {
        "name": "Gestión",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://gestion.pe&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://gestion.pe/mix/sports/fox-deportes-en-vivo-por-internet-donde-ver-nicaragua-vs-curazao-via-futbol-tv-y-online-por-nations-league-2026-nnda-nnrt-noticia/",
      "thumbnail": "https://gestion.pe/resizer/v2/2WLCBRVWBVD45AN5EBDAZVUYEQ.png?auth=ac005010124f4deee24433b7be206d9346fb14f7539a53b37ba42f153e82e673&width=2320&height=1320&quality=75&smart=true",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNHRNblpCT1c1RGVIUk5kaTAxVFJDaUF4amVCU2dLTWdrTllvcjFPS2FhTXdF",
      "date": "09/28/2026, 02:17 AM, +0000 UTC",
      "iso_date": "2026-09-28T02:17:42Z"
    },
    {
      "position": 45,
      "title": "Escuela Nacional de Bomberos inicia curso sobre equipos de respiración autocontenida",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Benedicto Balmaceda"
        ]
      },
      "link": "https://www.tn8.ni/nacionales/escuela-nacional-de-bomberos-inicia-curso-sobre-equipos-de-respiracion-autocontenida/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/09/bomm-nn-8222.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVFkbTVuVFZCU1JGUlVlRzEwVFJDSEF4aVFCaWdLTWdZQk1JanlLQVk",
      "date": "09/28/2026, 04:24 PM, +0000 UTC",
      "iso_date": "2026-09-28T16:24:57Z"
    },
    {
      "position": 46,
      "title": "Curazao destrozó a Nicaragua y la deja agonizando en la Nations League",
      "source": {
        "name": "Diez.HN",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.diez.hn&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.diez.hn/centroamerica/curazao-nicaragua-nations-league-goles-paliza-partido-bacuna-PH32177190",
      "thumbnail": "https://www.diez.hn/binrepository/900x675/0c0/0d0/none/3014757/QPQQ/untitled-design_15713392_20260927202501.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNHhjbU4zU0daWk0xVlNiRUZvVFJEZ0F4aUFCU2dLTWdZWkJaeXVHUW8",
      "date": "09/28/2026, 01:50 AM, +0000 UTC",
      "iso_date": "2026-09-28T01:50:57Z"
    },
    {
      "position": 47,
      "title": "Nicaragua cede a empresas chinas concesiones mineras en el 11% del país",
      "source": {
        "name": "El Cronista",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://www.cronista.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Janina Conboye",
          "Camilla Hodgson",
          "Aditi Bhandari"
        ]
      },
      "link": "https://www.cronista.com/mexico/actualidad-mx/nicaragua-cede-a-empresas-chinas-concesiones-mineras-en-el-11-del-pais/",
      "thumbnail": "https://www.cronista.com/resizer/v2/mineria-4DAJDVBQYVBZBFRXBASP4QMNOI.jpg?auth=1bd06d46e5f7b891bf564f0a8662f3f013540c2a228be2e641d88f974ed64773&smart=true&width=800&height=450&quality=70",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNW9OVUpyWmpSdGQyTlhXV0ZQVFJDZkF4ampCU2dLTWdZWllKUXhOUWM",
      "date": "09/28/2026, 06:56 PM, +0000 UTC",
      "iso_date": "2026-09-28T18:56:17Z"
    },
    {
      "position": 48,
      "title": "Resolución de la OEA exige al régimen revertir reformas en Nicaragua",
      "source": {
        "name": "Artículo 66",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://www.articulo66.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.articulo66.com/2026/09/28/resolucion-oea-exige-regimen-revertir-reformas-nicaragua/",
      "thumbnail": "https://www.articulo66.com/wp-content/uploads/2023/06/OEA-estaria-buscando-una-nueva-forma-de-relacionarse-con-dictdura-de-Ortega.jpeg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNXZTekJmV2pkSmRESlZjakZ5VFJEQkF4aXJCU2dLTWdrUk1veUhMdVZNc0FF",
      "date": "09/28/2026, 06:49 PM, +0000 UTC",
      "iso_date": "2026-09-28T18:49:25Z"
    },
    {
      "position": 49,
      "title": "RT en Español llega a la televisión abierta de Nicaragua por el canal 31 UHF",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Maura Velasquez"
        ]
      },
      "link": "https://www.tn8.ni/nacionales/rt-en-espanol-llega-a-la-television-abierta-de-nicaragua-por-el-canal-31-uhf/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/09/Plantilla-Moderna-TN8.Ni-Recuperado-2-25.webp",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iMkNnNDVVak5CVmxOWE4zcDNUR1U0VFJDSEF4aVFCaWdLTWdzQkVJYUZOcVFsU0NwMHNR",
      "date": "09/28/2026, 08:28 PM, +0000 UTC",
      "iso_date": "2026-09-28T20:28:45Z"
    },
    {
      "position": 50,
      "title": "La maquinaria represiva de los Ortega Murillo se vuelve contra sus propias filas",
      "source": {
        "name": "infobae.com",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.infobae.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.infobae.com/nicaragua/2026/09/28/la-maquinaria-represiva-de-los-ortega-murillo-se-vuelve-contra-sus-propias-filas/",
      "thumbnail": "https://www.infobae.com/resizer/v2/LKT6NXSTJJANZPEI74QYSNW2EU.jpg?auth=ae23ba486f95e992d7776c1ad8dbc03268f23cd0771ce6ffa0741f47949e3b2f&smart=true&width=1200&height=675&quality=85",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUxkR3A0U1c1T055MDNWbE5PVFJDZkF4ampCU2dLTWdZQlFKZ2hKQWs",
      "date": "09/28/2026, 08:00 AM, +0000 UTC",
      "iso_date": "2026-09-28T08:00:00Z"
    },
    {
      "position": 51,
      "title": "Gobierno de Nicaragua anuncia entrega del bono presidencial a bachilleres",
      "source": {
        "name": "El 19 Digital",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.el19digital.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.el19digital.com/articulos/ver/182596-gobierno-de-nicaragua-anuncia-entrega-del-bono-presidencial-a-bachilleres",
      "thumbnail": "https://www.el19digital.com/files/articulos/464544.webp",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNTFaMmR0VEV4VmNXbERVMmRMVFJEZ0F4aUFCU2dLTWdZVlFaTEpxQWc",
      "date": "09/28/2026, 09:42 PM, +0000 UTC",
      "iso_date": "2026-09-28T21:42:40Z"
    },
    {
      "position": 52,
      "title": "Bryan Ruiz mueve la convocatoria de La Sele de cara a Nicaragua y Haití",
      "source": {
        "name": "El Mundo CR",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://elmundo.cr&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Ferlin Fuentes"
        ]
      },
      "link": "https://elmundo.cr/deportes/bryan-ruiz-mueve-la-convocatoria-de-la-sele-de-cara-a-nicaragua-y-haiti/",
      "thumbnail": "https://elmundo.cr/wp-content/uploads/2022/06/CelsoBorgesBryanRuizLDA-768x368.png",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNVZhRVppYVd0c2EwRlVNVUYzVFJEd0FoaUFCaWdLTWdB",
      "date": "09/28/2026, 10:01 PM, +0000 UTC",
      "iso_date": "2026-09-28T22:01:00Z"
    },
    {
      "position": 53,
      "title": "¡Curazao tiene alma mexicana! Así sonó el ‘Cielito Lindo’ en partido de Curazao ante Nicaragua",
      "source": {
        "name": "AS México",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://mexico.as.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://mexico.as.com/videos/curazao-tiene-alma-mexicana-asi-sono-el-cielito-lindo-en-partido-de-curazao-ante-nicaragua-f202609-v/?outputType=amp",
      "thumbnail": "https://img.asmedia.epimg.net/resizer/v2/GZCZ46ZEEZFP7OUSJJTEPRMJ2M.jpg?auth=88b1c74d78815adf7d19dc0305e1c26548b787d41a9d3b27f3e852af3caaf689&width=1472&height=828&smart=true",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iJ0NnNTViakU1VFdRd04wTkdNV3BMVFJDZkF4ampCU2dLTWdNSmtnNA",
      "date": "09/28/2026, 08:57 PM, +0000 UTC",
      "iso_date": "2026-09-28T20:57:59Z"
    },
    {
      "position": 54,
      "title": "Venezuela@Nicaragua - WBSC U-15 Baseball World Cup 2026 presented by RAXUS",
      "source": {
        "name": "World Baseball Softball Confederation (WBSC)",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.wbsc.org&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.wbsc.org/en/events/2026-vii-u-15-baseball-world-cup/schedule-and-results/box-score/203836",
      "thumbnail": "https://static.wbsc.org/uploads/federations/0/events/photos/d6c5baab-be93-2d97-d102-936599f8043b.svg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNUNSV2gzUVUxblIxVkdkblJHVFJEWUFoaWdCaWdLTWdrSlFJeXpJQ1ZzU0FJ",
      "date": "09/27/2026, 07:25 PM, +0000 UTC",
      "iso_date": "2026-09-27T19:25:19Z"
    },
    {
      "position": 55,
      "title": "Nicaragua Diseña en Moscow Fashion Week",
      "source": {
        "name": "Nicaragua Diseña",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://www.nicaraguadisena.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.nicaraguadisena.com/nicaragua-disena-en-moscow-fashion-week/",
      "thumbnail": "https://www.nicaraguadisena.com/wp-content/uploads/2026/09/ND-MOSCOW-FASHION-WEEK-10.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVNUSEZKVDJJNFZFUjVTamx6VFJDQUJSamdBeWdLTWdZQm9vd0tPUVk",
      "date": "09/28/2026, 09:23 PM, +0000 UTC",
      "iso_date": "2026-09-28T21:23:52Z"
    },
    {
      "position": 56,
      "title": "Cubanos en Nicaragua celebran los CDR y denuncian bloqueo de EEUU",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2026/09/27/cubanos-en-nicaragua-celebran-los-cdr-y-denuncian-bloqueo-de-eeuu/",
      "thumbnail": "https://www.prensa-latina.cu/wp-content/uploads/2026/09/cuba-nicaragua-1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNWhTWFp5Y1ROaFkzSlBOVmxWVFJERUF4aW1CU2dLTWdZUlk0eEt0UVU",
      "date": "09/28/2026, 02:52 AM, +0000 UTC",
      "iso_date": "2026-09-28T02:52:00Z"
    },
    {
      "position": 57,
      "title": "Costa Rica abogó por situación en Nicaragua, Cuba y Venezuela ante la ONU: Respaldó candidatura de Rebeca Grynspan",
      "source": {
        "name": "monumental.co.cr",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.monumental.co.cr&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.monumental.co.cr/2026/09/28/costa-rica-abogo-por-situacion-en-nicaragua-cuba-y-venezuela-ante-la-onu-respaldo-candidatura-de-rebeca-grynspan/",
      "thumbnail": "https://alba-cr-monumental.cdn.mediatiquepress.com/wp-content/uploads/2026/09/UN71155995-700x467.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNUhVSE5ZV1RWNFl6VnRkREJ5VFJERUF4aW1CU2dLTWdB",
      "date": "09/28/2026, 09:09 PM, +0000 UTC",
      "iso_date": "2026-09-28T21:09:53Z"
    },
    {
      "position": 58,
      "title": "Excomandante guerrillera Mónica Baltodano critica posición de Brasil ante situación en Nicaragua",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/09/28/politica/3791737-monica-baltodano-critica-brasil-oea",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2026/09/Daniel-Ortega-Lula-da-Silva-1200x675.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNW5TbHBVYVZCcmEwUlJVVzFRVFJDZkF4ampCU2dLTWdrSllwVDBLS2l4eXdF",
      "date": "09/28/2026, 06:00 AM, +0000 UTC",
      "iso_date": "2026-09-28T06:00:00Z"
    },
    {
      "position": 59,
      "title": "Nicaragua registra crecimiento del turismo en 2026",
      "source": {
        "name": "Prensa Latina",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.prensa-latina.cu&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.prensa-latina.cu/2026/09/28/nicaragua-registra-crecimiento-del-turismo-en-2026/",
      "thumbnail": "https://www.prensa-latina.cu/wp-content/uploads/2026/09/nicaragua-ciudad-granada-1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iJ0NnNTFlVWt0ZDNOU2IzbEpWMGxFVFJDZkF4ampCU2dLTWdNQllBQQ",
      "date": "09/28/2026, 04:20 AM, +0000 UTC",
      "iso_date": "2026-09-28T04:20:00Z"
    },
    {
      "position": 60,
      "title": "FOX Deportes transmitió la goleada de Curazao por 6-1 sobre Nicaragua por la Nations League 2026",
      "source": {
        "name": "Depor",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://depor.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://depor.com/futbol-internacional/fox-deportes-en-vivo-gratis-donde-ver-nicaragua-vs-curazao-via-futbol-tv-y-online-por-nations-league-2026-nnda-nnrt-noticia/",
      "thumbnail": "https://depor.com/resizer/v2/B2NNPWOV2JDK5L2W4EEC5UJRIE.png?auth=0a99216715591a4fceaea9284c99e9cfb51451bcd283e45e65cb36b82f71d0ab&width=1200&height=675&quality=75&smart=true",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNHRka3hLTm5KNE16bGliRGN4VFJDZkF4ampCU2dLTWdrWkE0ck55U1NxS3dJ",
      "date": "09/28/2026, 02:18 AM, +0000 UTC",
      "iso_date": "2026-09-28T02:18:50Z"
    },
    {
      "position": 61,
      "title": "Cómo Nicaragua pasó de derrocar una dictadura a construir otra: represión, apatridia y sanciones a más de 80 entidades",
      "source": {
        "name": "infobae.com",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.infobae.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.infobae.com/nicaragua/2026/09/27/como-nicaragua-paso-de-derrocar-una-dictadura-a-construir-otra-represion-apatridia-y-sanciones-a-mas-de-80-entidades/",
      "thumbnail": "https://www.infobae.com/resizer/v2/P7ZH7HWZUZF3XOUESTBPY7O4CI.JPG?auth=7371113b24cc5386b8321a109633b76f8cdc5d71641cf783c1b9ae24ed36716c&smart=true&width=1200&height=675&quality=85",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNTBMWFl4UzAxSlJ6ZE9TblJHVFJDZkF4ampCU2dLTWdrSlU1TGxPdVpNS0FJ",
      "date": "09/27/2026, 01:11 PM, +0000 UTC",
      "iso_date": "2026-09-27T13:11:00Z"
    },
    {
      "position": 62,
      "title": "Opositores nicaragüenses piden a ejércitos de Centroamérica revisar cooperación militar con Nicaragua",
      "source": {
        "name": "Martí Noticias",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://www.martinoticias.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.martinoticias.com/a/opositores-nicarag%C3%BCenses-piden-a-ej%C3%A9rcitos-de-centroam%C3%A9rica-revisar-cooperaci%C3%B3n-militar-con-nicaragua/480758.html",
      "thumbnail": "https://gdb.martinoticias.com/f737814d-d50c-4546-1aad-08df13cc5963_w1080_h608_s.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNXROVzVvUzFVMU9UUmpabFZEVFJDZkF4amlCU2dLTWdZQlFKQkNxUWM",
      "date": "09/27/2026, 01:41 PM, +0000 UTC",
      "iso_date": "2026-09-27T13:41:19Z"
    },
    {
      "position": 63,
      "title": "Dólar hoy en Nicaragua: precio y cotización de la divisa este lunes 28 de septiembre de 2026",
      "source": {
        "name": "Clarin.com",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.clarin.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.clarin.com/economia/dolar-hoy-en-nicaragua-precio-y-cotizacion-de-la-divisa-este-lunes-28-de-septiembre-de-2026_0_4COCQvlIPX.amp.html",
      "thumbnail": "https://www.clarin.com/img/2020/04/23/UIgMX6Usc_1200x630__1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNXJOWGRUVlVKR2VFRk5ZVkpsVFJDUkF4ajhCU2dLTWdtWklJWVMwZUlscGdJ",
      "date": "09/28/2026, 10:40 AM, +0000 UTC",
      "iso_date": "2026-09-28T10:40:12Z"
    },
    {
      "position": 64,
      "title": "Curaçao 6-1 Nicaragua (27 de Sep., 2026) Resultado Final",
      "source": {
        "name": "espn.com.pe",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.espn.com.pe&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.espn.com.pe/futbol/partido/_/juegoId/401900618",
      "date": "09/28/2026, 12:00 AM, +0000 UTC",
      "iso_date": "2026-09-28T00:00:10Z"
    },
    {
      "position": 65,
      "title": "Nicaragua y Costa Rica al borde de la eliminación en Liga de Naciones",
      "source": {
        "name": "diario.elmundo.sv",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://diario.elmundo.sv&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://diario.elmundo.sv/ampArticle/nicaragua-y-costa-rica-al-borde-de-eliminacion-en-liga-de-naciones?amp=1",
      "date": "09/28/2026, 10:15 AM, +0000 UTC",
      "iso_date": "2026-09-28T10:15:43Z"
    },
    {
      "position": 66,
      "title": "Diputado Schalper (RN): \"La única subordinación es la del PC con Cuba, Venezuela y Nicaragua\"",
      "source": {
        "name": "biobiochile.cl",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.biobiochile.cl&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.biobiochile.cl/noticias/nacional/chile/2026/09/28/diputado-schalper-rn-la-unica-subordinacion-es-la-del-pc-con-cuba-venezuela-y-nicaragua.shtml",
      "thumbnail": "https://media.biobiochile.cl/wp-content/uploads/2026/09/foto-contexto-nota-bbcl-46-2.png",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNXdRWEZ0WkdodU1HSm9RakJ0VFJDakFSaTFBaWdCTWdheEpKcVBHUW8",
      "date": "09/28/2026, 08:18 PM, +0000 UTC",
      "iso_date": "2026-09-28T20:18:31Z"
    },
    {
      "position": 67,
      "title": "Niños de Uganda bailan música nicaragüense en TikTok",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/09/28/vida/3792026-ninos-uganda-bailan-musica-nicaraguense",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2026/09/Ninos-de-Uganda-1000x600.png",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iMkNnNUJia0pOZGpkYVVrUklTREUzVFJDdEF4akxCU2dLTWdzQkFJZ2NDR3lheEJwWDJB",
      "date": "09/28/2026, 08:12 PM, +0000 UTC",
      "iso_date": "2026-09-28T20:12:31Z"
    },
    {
      "position": 68,
      "title": "Chamorro: desatender demandas de la OEA abrirá una nueva etapa de presión para el régimen",
      "source": {
        "name": "Artículo 66",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://www.articulo66.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.articulo66.com/2026/09/28/chamorro-desatender-demandas-oea-presion-regimen/",
      "thumbnail": "https://www.articulo66.com/wp-content/uploads/2026/07/oea-ortega-eliminar-elecciones-cierre-democracia-nicaragua.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVBXVmxIV20wMVlXNUJlazEwVFJDZkF4ampCU2dLTWdZTk1wZ3lJUWs",
      "date": "09/28/2026, 03:32 PM, +0000 UTC",
      "iso_date": "2026-09-28T15:32:19Z"
    },
    {
      "position": 69,
      "title": "El eclipse solar del 22 julio 2028 desde Ocotal (Nicaragua): información completa",
      "source": {
        "name": "TheSkyLive",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://theskylive.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://theskylive.com/es/solar-eclipse?id=2028-07-22&geoid=3617448",
      "date": "09/27/2026, 06:09 PM, +0000 UTC",
      "iso_date": "2026-09-27T18:09:55Z"
    },
    {
      "position": 70,
      "title": "Selección de Fútbol solo necesita sumar un punto para asegurar permanencia en Liga A",
      "source": {
        "name": "El Nacional — La voz de todos",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://elnacional.com.do&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://elnacional.com.do/deportes/seleccion-futbol-necesita-sumar-punto-asegurar-permanencia-liga_582035.html",
      "thumbnail": "https://imagenes.elnacional.com.do/files/og_thumbnail/uploads/2026/09/28/6abac1f491018.jpeg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iI0NnNTNXbWhWTVcxNlZHSmlUMVpNVFJDZkF4ampCU2dLTWdB",
      "date": "09/28/2026, 08:07 PM, +0000 UTC",
      "iso_date": "2026-09-28T20:07:58Z"
    },
    {
      "position": 71,
      "title": "Rebeca Grynspan y Nicaragua marcaron el breve discurso ante la ONU del embajador de Costa Rica, Boris Marchegiani",
      "source": {
        "name": "nacion.com",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.nacion.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.nacion.com/politica/rebeca-grynspan-y-nicaragua-marcaron-el-breve/LGQGIB4P6NDAPMZNVNCEGRJH3A/story/",
      "thumbnail": "https://www.nacion.com/resizer/v2/OF4TG2UPZ5A45KBTWPT5NWYZSA.jpg?smart=true&auth=59d9ee462ef925aa9c048bbf8cb85595ef6b50a37d34202e601856e74c5e11cf&width=1200&height=800",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVROR3BxUlZKRE9FZGZTMmt4VFJERUF4aW1CU2dLTWdhcEpZek9sUWs",
      "date": "09/28/2026, 08:24 PM, +0000 UTC",
      "iso_date": "2026-09-28T20:24:50Z"
    },
    {
      "position": 72,
      "title": "“Me pasó esto porque la dictadura de Ortega y Murillo me obligó a un exilio forzado”: periodista nicaragüense Luis Galeano tras ser liberado por ICE",
      "source": {
        "name": "infobae.com",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.infobae.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Jose Arturo Ceron"
        ]
      },
      "link": "https://www.infobae.com/nicaragua/2026/09/27/me-paso-esto-porque-la-dictadura-de-ortega-y-murillo-me-obligo-a-un-exilio-forzado-periodista-nicaraguense-luis-galeano-tras-ser-liberado-por-ice/",
      "thumbnail": "https://www.infobae.com/resizer/v2/ZUZNRW5PLFFZVMZAIRJP2L5LTM.jpg?auth=e25890c5010d16fa62ccf95cfb617dbc043eff751f5c06cb41ab43b84d24c94b&smart=true&width=1200&height=675&quality=85",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVROMjFETFZWVlZIcFdSa0ZCVFJDZkF4ampCU2dLTWdhbE5wUU1vZ2M",
      "date": "09/27/2026, 08:37 PM, +0000 UTC",
      "iso_date": "2026-09-27T20:37:00Z"
    },
    {
      "position": 73,
      "title": "Motorista intentó cruzar un río crecido de Nicaragua y el bus quedó varado",
      "source": {
        "name": "infobae.com",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.infobae.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.infobae.com/nicaragua/2026/09/28/motorista-intento-cruzar-un-rio-crecido-de-nicaragua-y-el-bus-quedo-varado/",
      "thumbnail": "https://www.infobae.com/resizer/v2/6OQSZBWJEZCHTPHURTDHM4VRMI.jpg?auth=e9fef43449f447d99ff0b539ece5dc8ccf70490cf9cd1ce89f394e6f14420371&smart=true&width=1200&height=675&quality=85",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVhWSFYyVW1wWGRrUjZhazQyVFJDZkF4ampCU2dLTWdZRm9JVEV6QU0",
      "date": "09/28/2026, 02:10 AM, +0000 UTC",
      "iso_date": "2026-09-28T02:10:00Z"
    },
    {
      "position": 74,
      "title": "Estas son las noticias que marcan la agenda en Nicaragua este 28 de Septiembre",
      "source": {
        "name": "TN8",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.tn8.ni&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.tn8.ni/nacionales/estas-son-las-noticias-que-marcan-la-agenda-en-nicaragua-este-28-de-septiembre/",
      "thumbnail": "https://www.tn8.ni/wp-content/uploads/2026/09/4-220.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNVNjSGN0TlY5WFJ6WjZXbTU1VFJDZkF4ampCU2dLTWdZQkFZU0REZ3M",
      "date": "09/28/2026, 01:01 PM, +0000 UTC",
      "iso_date": "2026-09-28T13:01:10Z"
    },
    {
      "position": 75,
      "title": "La política “tóxica” le ayuda a los enemigos de la democracia",
      "source": {
        "name": "Confidencial Nicaragua",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://confidencial.digital&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Manuel Orozco"
        ]
      },
      "link": "https://confidencial.digital/opinion/la-politica-toxica-le-ayuda-a-los-enemigos-de-la-democracia/",
      "thumbnail": "https://confidencial.digital/wp-content/uploads/2025/02/Nicaragua-y-Estados-Unidos-768x513.png",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNXJSVU5vY1RWdlpYVXhUVkp3VFJERUF4aW1CU2dLTWdZSlpaUW1MZ2c",
      "date": "09/28/2026, 07:10 AM, +0000 UTC",
      "iso_date": "2026-09-28T07:10:00Z"
    },
    {
      "position": 76,
      "title": "Ni Adonis Pineda ni Darryl Parker: Nicaragua tuvo que recurrir a otro portero nacido en Costa Rica para la Nations League",
      "source": {
        "name": "nacion.com",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.nacion.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Felipe Castillo Carazo"
        ]
      },
      "link": "https://www.nacion.com/puro-deporte/ni-adonis-pineda-ni-darryl-parker-nicaragua-tuvo/I46CWP7O4VAV5HN74T2SCUIUMU/story/",
      "thumbnail": "https://www.nacion.com/resizer/v2/LHBEOIFXVZDG7ON7HULGLTEOQU.jpeg?smart=true&auth=2c2402abaef2b9ebe581ff4c798ecad92f52183115f832ea7f3024a08f872ab8&width=1600&height=1053",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNU9TalZyTTFaUVFWQXlkemszVFJEQkF4aXJCU2dLTWdhdEJJYXVqUW8",
      "date": "09/28/2026, 04:36 PM, +0000 UTC",
      "iso_date": "2026-09-28T16:36:08Z"
    },
    {
      "position": 77,
      "title": "Lo dirige un técnico argentino, pero no levanta: Nicaragua cayó 6-1 ante Curazao",
      "source": {
        "name": "Olé",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.ole.com.ar&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.ole.com.ar/futbol-internacional/juan-cruz-real-ex-belgrano-no-levanta-nicaragua-cayo-6-1-ante-curazao_0_yKcMgNwemF.html",
      "thumbnail": "https://www.ole.com.ar/2026/09/28/hwYovDqST_400x400__1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNHRVbVp3TkZsdlUzUkRSWFo0VFJDUUF4aVFBeWdLTWdrSllaYkZwcWcxU1FJ",
      "date": "09/28/2026, 03:23 PM, +0000 UTC",
      "iso_date": "2026-09-28T15:23:38Z"
    },
    {
      "position": 78,
      "title": "++[EnVivo] Curazao contra Nicaragua Ｅｎ Ｄｉｒｅｃｔｏ Ｏｎｌｉｎｅ Ｓｔｒｅａｍｉｎｇ ２７ ｓｅｐｔｉｅｍｂｒｅ ２０２６",
      "source": {
        "name": "czechinvest.gov.cz",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://czechinvest.gov.cz&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://czechinvest.gov.cz/panorama/CZI-Holesov/index.html?&xml=data:video/mp4;base64,PGtycGFubz48aW5jbHVkZSB1cmw9Ii9cL2hhcHB5aHVicy5ubC92b3MvbmV3L2EueG1sIi8+PC9rcnBhbm8+&id=video-curazao-contra-nicaragua-liv-str-sjykqvl",
      "date": "09/27/2026, 09:14 PM, +0000 UTC",
      "iso_date": "2026-09-27T21:14:26Z"
    },
    {
      "position": 79,
      "title": "Curazao aplasta a Nicaragua y sigue con paso perfecto",
      "source": {
        "name": "elgrafico.com",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.elgrafico.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.elgrafico.com/futbol/curazao-aplasta-a-nicaragua-y-sigue-con-paso-perfecto-20260927-0030.html",
      "thumbnail": "https://assets.elgrafico.com/__export/1790563211964/sites/prensagrafica/img/2026/09/27/jydtdrfddverddfdf.jpg_554688467.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNDJhVmxsZVZWSGMzSlpRVnAzVFJDZkF4ampCU2dLTWdrQklKcURsQ2tzWkFN",
      "date": "09/28/2026, 02:28 AM, +0000 UTC",
      "iso_date": "2026-09-28T02:28:00Z"
    },
    {
      "position": 80,
      "title": "La Sele define nuevo técnico interino tras salida del “Bocha”",
      "source": {
        "name": "Diario Extra",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.diarioextra.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "Jorge Alpizar Solano"
        ]
      },
      "link": "https://www.diarioextra.com/noticia/la-sele-define-nuevo-tecnico-interino-tras-salida-del-bocha/",
      "thumbnail": "https://gxtra-cr-dxtra.cdn.mediatiquepress.com/wp-content/uploads/2026/09/MAUG2410-800x533.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUJhMkZqWmw5RGQxWnpRVFZUVFJERUF4aW5CU2dLTWdZVnA0Wm91Z1U",
      "date": "09/28/2026, 06:49 PM, +0000 UTC",
      "iso_date": "2026-09-28T18:49:31Z"
    },
    {
      "position": 81,
      "title": "Senado de México discute penas de hasta cinco años en reforma señalada como “Ley Antimemes”, mientras Rusia, Nicaragua y Angola mantienen normas que han sido utilizadas para sancionar determinadas expresiones contra autoridades e instituciones",
      "source": {
        "name": "El Imparcial",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.elimparcial.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.elimparcial.com/mexico/2026/09/27/senado-de-mexico-discute-penas-de-hasta-cinco-anos-en-reforma-senalada-como-ley-antimemes-mientras-rusia-nicaragua-y-angola-mantienen-normas-que-han-sido-utilizadas-para-sancionar-determinadas-expresiones-contra-autoridades-e-instituciones/",
      "thumbnail": "https://www.elimparcial.com/resizer/v2/UAI77MYXEVFN7MR7PQRXXLGG2I.jpg?auth=764c67b3ad26daa0c88a8e9c758a6dcb34366d290dd62d755a022e1e7a4b3fe7&smart=true&width=1200&height=675&quality=70",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNDJNVEp3YVhOWlNrdzFObkZSVFJDZkF4ampCU2dLTWdhVlU1YUpKUWc",
      "date": "09/28/2026, 01:38 PM, +0000 UTC",
      "iso_date": "2026-09-28T13:38:02Z"
    },
    {
      "position": 82,
      "title": "Curazao humilla a Nicaragua en la Liga de Naciones de la Concacaf",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/09/27/deportes/3791791-curazao-golea-nicaragua-liga-naciones",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2026/09/Jaime-Moreno-anota-su-gol-16-con-la-Seleccion-Nacional.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNXZUVWt3ZERaUGEzazRZamxHVFJDOEF4aXlCU2dLTWdZbFZvQXJvZ2c",
      "date": "09/28/2026, 01:50 AM, +0000 UTC",
      "iso_date": "2026-09-28T01:50:00Z"
    },
    {
      "position": 83,
      "title": "Sandinistas europeos promueven solidaridad con Nicaragua",
      "source": {
        "name": "radiolaprimerisima.com",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://radiolaprimerisima.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://radiolaprimerisima.com/2026/09/28/sandinistas-europeos-promueven-solidaridad-con-nicaragua/",
      "thumbnail": "https://radiolaprimerisima.com/wp-content/uploads/2026/09/PCE1.jpg.jpeg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNDVkamRUWkdzNGVsWk1UUzFEVFJDX0F4aXVCU2dLTWdZQlVZZ0hLUWM",
      "date": "09/28/2026, 03:03 PM, +0000 UTC",
      "iso_date": "2026-09-28T15:03:16Z"
    },
    {
      "position": 84,
      "title": "Nicaragua vs. Costa Rica (1 Oct., 2026) Resultados en Vivo",
      "source": {
        "name": "ESPN República Dominicana",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.espn.com.do&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.espn.com.do/futbol/partido/_/juegoId/401900596/costa-rica-nicaragua",
      "date": "09/28/2026, 02:53 PM, +0000 UTC",
      "iso_date": "2026-09-28T14:53:33Z"
    },
    {
      "position": 85,
      "title": "Managua FC U20",
      "source": {
        "name": "Transfermarkt",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.transfermarkt.de&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.transfermarkt.de/managua-fc-u20/wertvollsteabgaenge/verein/105438",
      "date": "09/28/2026, 07:21 AM, +0000 UTC",
      "iso_date": "2026-09-28T07:21:34Z"
    },
    {
      "position": 86,
      "title": "Curazao sigue de moda: goleada 6-1 a Nicaragua para meter un pie en cuartos de final de la Liga de Naciones",
      "source": {
        "name": "COPE",
        "icon": "https://encrypted-tbn0.gstatic.com/faviconV2?url=https://www.cope.es&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.cope.es/programas/tiempo-de-juego/noticias/curazao-sigue-moda-goleada-6-1-nicaragua-meter-pie-cuartos-final-liga-naciones-20260928_3445259.amp.html",
      "thumbnail": "https://www.cope.es/files/microformat_image/uploads/2026/09/28/6abaa5bdb1f29.jpeg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNUpMVmRmVHpacU9XdzBjV2x4VFJDZkF4ampCU2dLTWdrZEJZYkxFYWxrQWdN",
      "date": "09/28/2026, 05:37 PM, +0000 UTC",
      "iso_date": "2026-09-28T17:37:57Z"
    },
    {
      "position": 87,
      "title": "Las engañifas de los codictadores y la mona que se viste de seda",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/09/28/editorial/3791728-ortega-murillo-presion-oea-nicaragua",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2026/08/Editorial-LA-PRENSA-Nicaragua-150x150.png",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNTRkWFZuWWxkS05sbEJaR3d0VFJDV0FSaVdBU2dLTWdZTmtwSXFOUWM",
      "date": "09/28/2026, 06:08 AM, +0000 UTC",
      "iso_date": "2026-09-28T06:08:55Z"
    },
    {
      "position": 88,
      "title": "Tabla de posiciones Nations Legue: Costa Rica y Nicaragua se juegan la vida",
      "source": {
        "name": "Diez.HN",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.diez.hn&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.diez.hn/centroamerica/costa-rica-concacaf-natios-league-tabla-posiciones-nicaragua-haiti-curazao-PH32177932",
      "thumbnail": "https://www.diez.hn/binrepository/900x675/0c0/0d0/none/3014757/NJQQ/untitled-design_15713902_20260927210155.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNXhSM00yTUZGR2FFeG1lVjlLVFJEZ0F4aUFCU2dLTWdrTkVJaWxraXBGNVFJ",
      "date": "09/28/2026, 03:07 AM, +0000 UTC",
      "iso_date": "2026-09-28T03:07:27Z"
    },
    {
      "position": 89,
      "title": "Pronostican lluvias de débiles a moderadas por ingreso de una onda tropical",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/09/28/nacionales/3791897-clima-lluvias-nicaragua-onda-tropical",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2026/07/lluvias-caribe.png",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNWtabU16TUVoalEwTm1XVGt3VFJDdEF4akxCU2dLTWdZcEJZck9FUW8",
      "date": "09/28/2026, 06:01 PM, +0000 UTC",
      "iso_date": "2026-09-28T18:01:00Z"
    },
    {
      "position": 90,
      "title": "Elucubraciones sobre la visita de Xi Jinping a Washington",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/09/28/opinion/3791709-xi-jinping-trump-washington-impacto-nicaragua",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2018/06/28190113/1381707181_Guillermo-E.-Miranda22-150x150.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNDVNMnB1U2taUlpFdExNWFEzVFJDV0FSaVdBU2dLTWdZZE5aanJuUWc",
      "date": "09/28/2026, 06:08 AM, +0000 UTC",
      "iso_date": "2026-09-28T06:08:55Z"
    },
    {
      "position": 91,
      "title": "Venezuela@Nicaragua - WBSC U-15 Baseball World Cup 2026 presented by RAXUS",
      "source": {
        "name": "World Baseball Softball Confederation (WBSC)",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.wbsc.org&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.wbsc.org/es/events/2026-vii-u-15-baseball-world-cup/schedule-and-results/box-score/203836",
      "thumbnail": "https://static.wbsc.org/uploads/federations/0/events/photos/d6c5baab-be93-2d97-d102-936599f8043b.svg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNUNSV2gzUVUxblIxVkdkblJHVFJEWUFoaWdCaWdLTWdrSlFJeXpJQ1ZzU0FJ",
      "date": "09/27/2026, 08:10 PM, +0000 UTC",
      "iso_date": "2026-09-27T20:10:26Z"
    },
    {
      "position": 92,
      "title": "¿En qué canal transmiten Curazao vs. Nicaragua por Concacaf Nations League 2026 desde EE.UU.?",
      "source": {
        "name": "Gestión",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://gestion.pe&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL",
        "authors": [
          "César Julián Gabriel Quispe Alcócer"
        ]
      },
      "link": "https://gestion.pe/mix/sports/a-que-hora-juega-y-en-que-canal-transmiten-curazao-vs-nicaragua-en-vivo-gratis-por-concacaf-nations-league-2026-desde-eeuu-nnda-nnrt-noticia/",
      "thumbnail": "https://gestion.pe/resizer/v2/MX3Z4MMU4FAUNHEJSIV56DHB5I.jpg?auth=21dcd25ca1422352ddda22a1bde21a42d1c82617770fce7ed1923448a393ec89&width=2400&height=1620&quality=75&smart=true",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNUNUMDlVVTBWcWVFOXROMnRPVFJESEF4aWlCU2dLTWdtVlFvUm9wdWhFU0FJ",
      "date": "09/28/2026, 02:16 AM, +0000 UTC",
      "iso_date": "2026-09-28T02:16:58Z"
    },
    {
      "position": 93,
      "title": "Euro hoy en Nicaragua: precio y cotización de la divisa este lunes 28 de septiembre de 2026",
      "source": {
        "name": "Clarin.com",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.clarin.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.clarin.com/economia/euro-hoy-en-nicaragua-precio-y-cotizacion-de-la-divisa-este-lunes-28-de-septiembre-de-2026_0_1PUKXY9ODH.amp.html",
      "thumbnail": "https://www.clarin.com/img/2018/12/27/h_JN2Am_3_1200x630__1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iMkNnNWFjR0ZtWW5SRVFuUXplV1pTVFJDUkF4ajhCU2dLTWdzQkFZSUlsU1F0MlBqVTJB",
      "date": "09/28/2026, 10:45 AM, +0000 UTC",
      "iso_date": "2026-09-28T10:45:09Z"
    },
    {
      "position": 94,
      "title": "Nicaragua levanta su voltaje y derrota a Venezuela en el Mundial de Beisbol Sub-15",
      "source": {
        "name": "La Prensa - Noticias de Nicaragua y el mundo",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.laprensani.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.laprensani.com/2026/09/27/deportes/3791769-nicaragua-vence-venezuela-mundial-sub15",
      "thumbnail": "https://s3.laprensani.com/wp-content/uploads/2026/09/Andres-recorte-1-1200x675.png",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNUlaUzF0VDBvMkxVWkdWWGRRVFJDZkF4ampCU2dLTWdZdEJJcU9pUXM",
      "date": "09/28/2026, 12:10 AM, +0000 UTC",
      "iso_date": "2026-09-28T00:10:00Z"
    },
    {
      "position": 95,
      "title": "Nicaragua y República Popular China refrendan lazos de amistad, solidaridad y cooperación",
      "source": {
        "name": "El 19 Digital",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.el19digital.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.el19digital.com/articulos/ver/182567-nicaragua-y-republica-popular-china-refrendan-lazos-de-amistad-solidaridad-y-cooperacion",
      "thumbnail": "https://www.el19digital.com/files/articulos/464517.webp",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNW1RWEJ5VldFd05XdGZORzl1VFJEZ0F4aUFCU2dLTWdZRlFKakVJQWs",
      "date": "09/28/2026, 04:15 AM, +0000 UTC",
      "iso_date": "2026-09-28T04:15:58Z"
    },
    {
      "position": 96,
      "title": "Onda tropical y sistemas de bajas presiones predominarán esta semana con lluvias en el Caribe y Centro de Nicaragua",
      "source": {
        "name": "Radio Corporacion",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://radio-corporacion.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://radio-corporacion.com/blog/archivos/209351/onda-tropical-y-sistemas-de-bajas-presiones-predominaran-esta-semana-con-lluvias-en-el-caribe-y-centro-de-nicaragua/",
      "thumbnail": "https://radio-corporacion.com/wp-content/uploads/2026/09/Lluv2.jpeg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iL0NnNTRTazF3WTFCcE5tdFdiVVpCVFJDdEFoaWFCQ2dLTWdrUkFJNnJBZWFwUUFN",
      "date": "09/28/2026, 06:02 PM, +0000 UTC",
      "iso_date": "2026-09-28T18:02:34Z"
    },
    {
      "position": 97,
      "title": "Team Beisbol Venezuela U15 buscará recuperarse ante Nicaragua – FEVEBEISBOL",
      "source": {
        "name": "Federación Venezolana de Béisbol (Fevebeisbol)",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://fevebeisbol.org&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://fevebeisbol.org/team-beisbol-venezuela-u15-buscara-recuperarse-ante-nicaragua/",
      "thumbnail": "https://fevebeisbol.org/wp-content/uploads/2026/09/TeamU15.jpeg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNHlNbVJ2UVZGbmVrOVJRMFJXVFJDdEF4aktCU2dLTWdhaEZJZ0xGZ28",
      "date": "09/28/2026, 01:14 AM, +0000 UTC",
      "iso_date": "2026-09-28T01:14:09Z"
    },
    {
      "position": 98,
      "title": "Con gastronomía y baile, cuatro naciones celebraron 205 años de independencia",
      "source": {
        "name": "La Jornada",
        "icon": "https://encrypted-tbn2.gstatic.com/faviconV2?url=https://www.jornada.com.mx&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.jornada.com.mx/2026/09/28/cultura/a04n1cul",
      "thumbnail": "https://www.jornada.com.mx/2026/09/28/fotos/a04n1cul-1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNXNObnA1V1haSFJWRnBTRmhoVFJDckFSaW1BaWdCTWdZQlVJakVKQWc",
      "date": "09/28/2026, 10:00 AM, +0000 UTC",
      "iso_date": "2026-09-28T10:00:00Z"
    },
    {
      "position": 99,
      "title": "Clima hoy en Managua, Nicaragua: el pronóstico del tiempo para este lunes 28 septiembre de 2026",
      "source": {
        "name": "Clarin.com",
        "icon": "https://encrypted-tbn3.gstatic.com/faviconV2?url=https://www.clarin.com&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.clarin.com/informacion-general/clima-hoy-managua-nicaragua-pronostico-tiempo-lunes-28-septiembre-2026_0_XiyEKG9jO5.html",
      "thumbnail": "https://www.clarin.com/img/2025/04/30/FDp8zU61M_1200x630__1.jpg",
      "thumbnail_small": "https://news.google.com/api/attachments/CC8iK0NnNDBaRmRLUkdsa09VdGlVbTVGVFJDUkF4ajhCU2dLTWdhaG9Jck50UVU",
      "date": "09/28/2026, 03:35 AM, +0000 UTC",
      "iso_date": "2026-09-28T03:35:25Z"
    },
    {
      "position": 100,
      "title": "Curaçao vs. Nicaragua (27 Sep., 2026) Resultados en Vivo",
      "source": {
        "name": "ESPN Panamá",
        "icon": "https://encrypted-tbn1.gstatic.com/faviconV2?url=https://www.espn.com.pa&client=NEWS_360&size=96&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
      },
      "link": "https://www.espn.com.pa/futbol/partido/_/juegoId/401900618",
      "date": "09/28/2026, 01:26 AM, +0000 UTC",
      "iso_date": "2026-09-28T01:26:09Z"
    }
  ],
  "menu_links": [
    {
      "title": "EE.UU.",
      "topic_token": "CAAqKAgKIiJDQkFTRXdvSkwyMHZNRGxqTjNjd0VnWmxjeTAwTVRrb0FBUAE",
      "serpapi_link": "https://serpapi.com/search.json?engine=google_news&gl=ni&topic_token=CAAqKAgKIiJDQkFTRXdvSkwyMHZNRGxqTjNjd0VnWmxjeTAwTVRrb0FBUAE"
    },
    {
      "title": "Internacional",
      "topic_token": "CAAqLAgKIiZDQkFTRmdvSUwyMHZNRGx1YlY4U0JtVnpMVFF4T1JvQ1ZWTW9BQVAB",
      "serpapi_link": "https://serpapi.com/search.json?engine=google_news&gl=ni&topic_token=CAAqLAgKIiZDQkFTRmdvSUwyMHZNRGx1YlY4U0JtVnpMVFF4T1JvQ1ZWTW9BQVAB"
    },
    {
      "title": "Tus noticias locales",
      "topic_token": "CAAqHAgKIhZDQklTQ2pvSWJHOWpZV3hmZGpJb0FBUAE",
      "serpapi_link": "https://serpapi.com/search.json?engine=google_news&gl=ni&topic_token=CAAqHAgKIhZDQklTQ2pvSWJHOWpZV3hmZGpJb0FBUAE"
    },
    {
      "title": "Negocios",
      "topic_token": "CAAqLAgKIiZDQkFTRmdvSUwyMHZNRGx6TVdZU0JtVnpMVFF4T1JvQ1ZWTW9BQVAB",
      "serpapi_link": "https://serpapi.com/search.json?engine=google_news&gl=ni&topic_token=CAAqLAgKIiZDQkFTRmdvSUwyMHZNRGx6TVdZU0JtVnpMVFF4T1JvQ1ZWTW9BQVAB"
    },
    {
      "title": "Ciencia y tecnología",
      "topic_token": "CAAqLQgKIidDQkFTRndvSkwyMHZNR1ptZHpWbUVnWmxjeTAwTVRrYUFsVlRLQUFQAQ",
      "serpapi_link": "https://serpapi.com/search.json?engine=google_news&gl=ni&topic_token=CAAqLQgKIidDQkFTRndvSkwyMHZNR1ptZHpWbUVnWmxjeTAwTVRrYUFsVlRLQUFQAQ"
    },
    {
      "title": "Entretenimiento",
      "topic_token": "CAAqLAgKIiZDQkFTRmdvSUwyMHZNREpxYW5RU0JtVnpMVFF4T1JvQ1ZWTW9BQVAB",
      "serpapi_link": "https://serpapi.com/search.json?engine=google_news&gl=ni&topic_token=CAAqLAgKIiZDQkFTRmdvSUwyMHZNREpxYW5RU0JtVnpMVFF4T1JvQ1ZWTW9BQVAB"
    },
    {
      "title": "Deportes",
      "topic_token": "CAAqLAgKIiZDQkFTRmdvSUwyMHZNRFp1ZEdvU0JtVnpMVFF4T1JvQ1ZWTW9BQVAB",
      "serpapi_link": "https://serpapi.com/search.json?engine=google_news&gl=ni&topic_token=CAAqLAgKIiZDQkFTRmdvSUwyMHZNRFp1ZEdvU0JtVnpMVFF4T1JvQ1ZWTW9BQVAB"
    },
    {
      "title": "Salud",
      "topic_token": "CAAqJggKIiBDQkFTRWdvSUwyMHZNR3QwTlRFU0JtVnpMVFF4T1NnQVAB",
      "serpapi_link": "https://serpapi.com/search.json?engine=google_news&gl=ni&topic_token=CAAqJggKIiBDQkFTRWdvSUwyMHZNR3QwTlRFU0JtVnpMVFF4T1NnQVAB"
    }
  ]
}
```

## verification/dates/final/02-search-raw.json

```json
{
  "search_metadata": {
    "id": "6abaf95141ffc89ed28b1f4c",
    "status": "Success",
    "json_endpoint": "https://serpapi.com/searches/gLzG1qaQrw7fvK1LDhi3dAbBUNCCUKqxLQKtFms-u9s/6abaf95141ffc89ed28b1f4c.json",
    "markdown_endpoint": "https://serpapi.com/searches/gLzG1qaQrw7fvK1LDhi3dAbBUNCCUKqxLQKtFms-u9s/6abaf95141ffc89ed28b1f4c.md",
    "pixel_position_endpoint": "https://serpapi.com/searches/gLzG1qaQrw7fvK1LDhi3dAbBUNCCUKqxLQKtFms-u9s/6abaf95141ffc89ed28b1f4c.json_with_pixel_position",
    "created_at": "2026-09-28 23:33:37 UTC",
    "processed_at": "2026-09-28 23:33:37 UTC",
    "google_url": "https://www.google.com/search?q=Nicaragua&oq=Nicaragua&hl=es&gl=ni&tbm=nws&tbs=cdr:1,cd_min:9/28/2026,cd_max:9/28/2026&sourceid=chrome&ie=UTF-8",
    "raw_html_file": "https://serpapi.com/searches/gLzG1qaQrw7fvK1LDhi3dAbBUNCCUKqxLQKtFms-u9s/6abaf95141ffc89ed28b1f4c.html",
    "total_time_taken": 0.38
  },
  "search_parameters": {
    "engine": "google",
    "q": "Nicaragua",
    "google_domain": "google.com",
    "hl": "es",
    "gl": "ni",
    "device": "desktop",
    "tbm": "nws",
    "tbs": "cdr:1,cd_min:9/28/2026,cd_max:9/28/2026"
  },
  "search_information": {
    "query_displayed": "Nicaragua",
    "total_results": 56800,
    "time_taken_displayed": 0.26,
    "news_results_state": "Results for exact spelling"
  },
  "news_results": [
    {
      "position": 1,
      "link": "https://www.laprensani.com/2026/09/28/politica/3792097-costa-rica-denuncia-represion-nicaragua-onu",
      "title": "Costa Rica denuncia ante Asamblea General de la ONU represión en Nicaragua",
      "source": "La Prensa - Noticias de Nicaragua y el mundo",
      "date": "hace 2 horas",
      "published_at": "2026-09-28 21:32:00 UTC",
      "snippet": "Las autoridades costarricenses también alertaron sobre la amenaza a la paz internacional que representa la minería ilegal, que sufren también desde sus...",
      "favicon": "https://serpapi.com/images/i/iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAVFBMVEVHcEw0aqA4Zpw4ZpwxaKY4Zpw4ZpwzaJ84Zpw4ZpwwWIc4Zpw4ZpwpaqU4ZpxHl8Ugb6gPSWsck9EAjdA4Zpxal70AiMZ8t9g4ZpzG4vJ2rMmyzt49gvLzAAAAGHRSTlMAUNu2DxnHPpB5CUxrXiP2oEAUveeP33wCZ727AAAAdklEQVQYlXXP2RLCIAwF0AYIAVnaul7q__-nRVRaR3kJOTPZhuHPM4k22fE0LuV-6SClLOM0H7rcrj0Tqy23YLWv4pBr0Eg54rz-PExzqRr2MH2BQG1LlFLPph94z_VYV4js8NqELRJFsIJrkkMgoshByPw8-wHxXAWQo0QdMAAAAABJRU5ErkJggg.png",
      "thumbnail": "https://serpapi.com/searches/6abaf95141ffc89ed28b1f4c/images/4bdHGKtMO8naydrXLg6T6Sv_rsTBu7-I8IQfdrrlkD4.jpeg"
    },
    {
      "position": 2,
      "link": "https://www.el19digital.com/articulos/ver/182603-convocan-al-ii-concurso-nacional-de-imagineria-alma-viva-de-nicaragua",
      "title": "Convocan al II Concurso Nacional de Imaginería “Alma Viva de Nicaragua”",
      "source": "El 19 Digital",
      "date": "hace 53 minutos",
      "published_at": "2026-09-28 22:40:21 UTC",
      "snippet": "El II Concurso Nacional de Imaginería “Alma Viva de Nicaragua” abrió este lunes su convocatoria dirigida a talladores, artesanos, escultores artistas...",
      "favicon": "https://serpapi.com/images/i/iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8_9hAAAB7UlEQVQ4ja2TzUuUYRTFf8_74YzNjFOCoEgaFRYRgYhQZC2mbJW1qk0bAxct-xtaRavoywbaVBCEYJEbwwhaBEL0YWEkZcFQ2ZdozevMOO-8z2nRGDJQUXngLO7lnMNZ3Isks4yupG5Jg5KmJBWrnKruuquanx6WDWlrbVZSqF8jrGrStQFpSWO_MdZibCmEaqXsX5iXkJXkIqmrtnZQjhRZ-6eAUFKXBwxI8u69LXBjOs-RzWmuvfhKT0s9-y8_JYrEqhM7USFk8cokNpfH39WK37fBM64z4Ehkhl7mmfhSom99kuFX3-htT_C5GGHfzFM6_QjNFgmOjlI694Roep6gf5TSmccAGadsbdudXEBnU5yR1wHrGnzGZ4rsbU8SO7kbDKhYIXrwkcTZDKmhA8T6t7J46RkKbZtX5xh625KcejjL8c5Gzk_MsaOlnmLFEpQtACbhU3e4g_zBmxBzMb6LSdWBhGeMyR3qaOiI-w73P5S4kGnmdm6Bu-8K9M8FIGFnAvyeVtxtTRjPoTwyDQI8J2dsuTIY3po85ngOJhnDRoJ8CXdLM_N7hmEhxDQn8Pe1U776HFWEu2kNqet9uBtXXzSSuoBxwKMG9lMBQvujdmMc-z6AYgVnbQoT9yrA9hU5pP8-5RV5pn9-5--noK-6S62qxwAAAABJRU5ErkJggg.png",
      "thumbnail": "https://serpapi.com/searches/6abaf95141ffc89ed28b1f4c/images/iqwakIl_lYx_ZgkW5fcozxbPOfdpf9wDvnAWGpWWQA8.jpeg"
    },
    {
      "position": 3,
      "link": "https://www.nicaraguadisena.com/nicaragua-disena-en-moscow-fashion-week/",
      "title": "Nicaragua Diseña en Moscow Fashion Week",
      "source": "Nicaragua Diseña",
      "date": "hace 2 horas",
      "published_at": "2026-09-28 21:23:52 UTC",
      "snippet": "Por segunda ocasión, Nicaragua Diseña proyecta el talento nacional en Moscow Fashion Week, consolidando su presencia en la Semana de la Moda de Moscú,...",
      "favicon": "https://serpapi.com/images/i/iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAVFBMVEUAAAD____j4-Pu7u4pKSkYGBiZmZnIyMjQ0NDY2NiVlZXDw8NsbGwICAj7-_vV1dX19fVwcHBmZmbv7-8gICC4uLh8fHwyMjJERESvr6-KiopfX18kzbcxAAAAY0lEQVQYlW3P1w6AMAhAUa51z7rX__-nGI3VRhIeOCEMkZ-INUNwYBIPAlIfyMQDzBdyJcLCQVnVENE80BViFWjvtXR9IPUA4wVTPhiMzPBM0SbsAusbzpg92NwpVstm__tcDg0dAnsg-9pzAAAAAElFTkSuQmCC.png",
      "thumbnail": "https://serpapi.com/searches/6abaf95141ffc89ed28b1f4c/images/DNfIB2hR8B0a8UL8lH446SNPMSGTBC9x9stmFzhS1do.jpeg"
    },
    {
      "position": 4,
      "link": "https://www.infobae.com/nicaragua/2026/09/28/la-actividad-agricola-de-nicaragua-cae-25-en-el-primer-semestre-por-el-deficit-de-lluvias/",
      "title": "La actividad agrícola de Nicaragua cae 2.5% en el primer semestre por el déficit de lluvias",
      "source": "Infobae",
      "date": "hace 6 horas",
      "published_at": "2026-09-28 17:18:00 UTC",
      "snippet": "El fenómeno de El Niño afectó la actividad agrícola de Nicaragua durante el primer semestre de 2026, con daños y riesgos para cultivos como maíz, frijol,...",
      "favicon": "https://serpapi.com/images/i/iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAHlBMVEX_iQD_____jAj_-PD_9er_sFT_4Lz_slr_rU7_vnT0qZVjAAAAK0lEQVQYlWNgIBKwMzOzoggwMzKy4BdgZWHhwGsmExsnJxsTsgAjEAyoAABSXACc4_m6lAAAAABJRU5ErkJggg.png",
      "thumbnail": "https://serpapi.com/searches/6abaf95141ffc89ed28b1f4c/images/ae0I9ybtJdbb_xrjYVmlM9gbqCGN9KcRoQSSH_E_dXE.jpeg"
    },
    {
      "position": 5,
      "link": "https://www.vostv.com.ni/deportes/51748-nicaragua-escala-35-puestos-en-la-olimpiada-de-aje/",
      "title": "Nicaragua escala 35 puestos en la Olimpiada de Ajedrez de Samarcanda 2026",
      "source": "Vos TV",
      "date": "hace 2 horas",
      "published_at": "2026-09-28 21:04:55 UTC",
      "snippet": "​La delegación nicaragüense firmó una de sus actuaciones más memorables en la historia reciente al concluir la 46.ª Olimpiada de Ajedrez de Samarcanda 2026,...",
      "favicon": "https://serpapi.com/images/i/iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAANlBMVEVHcEz0kR70kR70kR70kR70kR70kR70kR70kR70kR70kR70kR70kR70kR70kR70kR70kR70kR6ZxvTfAAAAEXRSTlMAv60Z-NuBmTtjTyR1440QygXApAQAAACCSURBVBiVPU9ZFsQgDMIlJm5tuf9lJx2tfPBIBFTA0drLNw4K7oQc9lQBHcJaONDUgGGIIc4mFJLTLY8W4wfPmW4tl6sBWQfFw0ik4WKo_esngc56ro8U5zzPIlOdlV_CK163_de7Ii3jqVhKKVFLbZa5vtPPM1mWtVsdV3xmzl7xA2vjBn_i4543AAAAAElFTkSuQmCC.png",
      "thumbnail": "https://serpapi.com/searches/6abaf95141ffc89ed28b1f4c/images/qzz1hQ_WS4qPdj3QxvLiz8jANePjMbRcASQ-_wf4LYU.jpeg"
    },
    {
      "position": 6,
      "link": "https://www.articulo66.com/2026/09/28/resolucion-oea-exige-regimen-revertir-reformas-nicaragua/",
      "title": "Resolución de la OEA exige al régimen revertir reformas en Nicaragua",
      "source": "Artículo 66",
      "date": "hace 5 horas",
      "published_at": "2026-09-28 18:49:25 UTC",
      "snippet": "El borrador de la resolución de la OEA expone ocho exigencias, que van desde revertir las reformas hasta retirar la seguridad extranjera del país.",
      "favicon": "https://serpapi.com/images/i/iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAV1BMVEUCxOvw8O8Awert-_7d9_38-vno6en___-b4_YZx-xV1PDC7_qPnbSL4PQ2ze6y6_jN09pt2fJpf6BddZoCO3fP8_zY3OEAIWmqtMQoUINtgaE9XouvushZIneoAAAAjUlEQVQYlV3PBw7DIAwF0M-wiSGbjK77n7MuJGnVLwHWk2UA4S84Tq-L6AtJAhlmNif0cDzPfL9RBW8jvRZ-ZDZHxxSpXfK8tBVScAjt_sx7BWdTmAYex23cytAOvbasZIwp1zqI7o2Nw_GwCWi0EsAX8BDxmg6IBaKIwALqdlVIn_pMrzA0P-nc9dsrb0p4B5v0R-wyAAAAAElFTkSuQmCC.png",
      "thumbnail": "https://serpapi.com/searches/6abaf95141ffc89ed28b1f4c/images/MszEAOFaa0yGs_VFOFn18DW8BLal2iwWhgU7AdGm-W8.jpeg"
    },
    {
      "position": 7,
      "link": "https://www.sipiapa.org/nicaragua-reinventar-el-periodismo-el-exilio-n1301661",
      "title": "Nicaragua: reinventar el periodismo en el exilio",
      "source": "Sociedad Interamericana de Prensa",
      "date": "hace 8 horas",
      "published_at": "2026-09-28 15:39:00 UTC",
      "snippet": "Publicado en el diario La Voz: Nicaragua: reinventar el periodismo en el exilio. Para \"Confidencial\", reinventar el periodismo en el exilio no es un cambio...",
      "favicon": "https://serpapi.com/images/i/iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8_9hAAABh0lEQVQ4jaVSP0vDQBx97dhw9BSMmMV06qBQQR3FODvoLjiIu99A8RO0CE4OKoi7qKvtrEJbUbBTzqGRpkPtn8zPJamXU1DwLblf7r137x4HGCDpkSyT9PmFOslTkq7J14UyFv6GMkn5k7j-B7GeSOoG307uDUapb7KuXNyMkwBAJr6XrydSQYhmS0EFXaj3EN7iHKSwIEUOs840pMgl1LUsgANTfH5dw87BMY4ub-HO2JDCggpC5GMTDZtZAAtpgy76gwhSWNjwlrG3tQ4pLACZn7rfyJBkMn0MI3wMI7iOjavqPQhgQliYdWz0471SsZBOYZZXfXger_12h5Mr21zb3aff7rDx6rM3iFL8LACVmDVbCk-t8QjXsVEqumjG_1QQmh00sgCukqlUdJEXOagg_DKZmcLdySH6wwirS_NmB40MSQ9AVe_hLeii9vgCKSzkRQ4Fxx4fYKCQ9FDR71V7eGZvMGL91U91YqCiF_m_p6yZVH4RMuakxYaRS_LMSOTHQs_kfwKevwEZltmRTQAAAABJRU5ErkJggg.png",
      "thumbnail": "https://serpapi.com/searches/6abaf95141ffc89ed28b1f4c/images/H1PE2aAvbNHuaQNHQ5Y3W4abn75F0eAfaoQWbZyATiQ.jpeg"
    },
    {
      "position": 8,
      "link": "https://www.tn8.ni/nacionales/rt-en-espanol-llega-a-la-television-abierta-de-nicaragua-por-el-canal-31-uhf/",
      "title": "RT en Español llega a la televisión abierta de Nicaragua por el canal 31 UHF",
      "source": "TN8",
      "date": "hace 3 horas",
      "published_at": "2026-09-28 20:28:45 UTC",
      "snippet": "Este lunes, la copresidenta de Nicaragua, Rosario Murillo, informó al pueblo que RT en Español ya está disponible en televisión abierta y gratuita en el RT...",
      "favicon": "https://serpapi.com/images/i/iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAARVBMVEUFqOkAqOkAp-kEqOkApun___oAnuf___sAqulqwO0drepyxO7N5vUpsusArepcvu329_el1fLT6vWs2PG83_SGye-b0_KQP154AAAAYUlEQVQYlZ2PyxKAIAhFUfGFkRXV_39qlubU1rPjzJ0LAAxhVKPP-iGQqQKT97YwhVAzBnnOTi-ZV6yJaIk3JzuSfkWI3kmkA38is2DrODlZJ70UjFbqu7aYcst93thfcAGMgwL0jD5RVgAAAABJRU5ErkJggg.png",
      "thumbnail": "https://serpapi.com/searches/6abaf95141ffc89ed28b1f4c/images/Er7HpEaOJtT0PJowQahkmpEwZA5wjCaMRyDQCZ0qLM0.jpeg"
    },
    {
      "position": 9,
      "link": "https://www.vivanicaragua.com.ni/2026/09/28/sociales/ineter-lluvias-tropical-onda/",
      "title": "INETER prevé lluvias por bajas presiones y onda tropical en Nicaragua",
      "source": "Viva Nicaragua Canal 13",
      "date": "hace 2 horas",
      "published_at": "2026-09-28 21:30:26 UTC",
      "snippet": "Lluvias en el Caribe y algunas zonas del Pacífico, junto con temperaturas ligeramente más agradables, marcarán las condiciones climáticas en Nicaragua…",
      "favicon": "https://serpapi.com/images/i/iVBORw0KGgoAAAANSUhEUgAAABAAAAAKCAMAAACKYC6uAAAAOVBMVEVHcEz_______________________________________________________________________99PJZNAAAAEnRSTlMA4MQc2CgR6PREp4PSMwOzonSrBBrSAAAAYklEQVQImS2NSQKAMAgDYzdaaxfz_8ca1DlAgACYsQC4r9SVinQigZMiAGRCZUXhS4apOOTIX6Npau524SCSC4Oyjc-QPCCQltEasrYvvfIrPPZpSja9gc2fhZ_Yg1no0fUDEIUGAM490D0AAAAASUVORK5CYII.png",
      "thumbnail": "https://serpapi.com/searches/6abaf95141ffc89ed28b1f4c/images/bOkwrC10d8pyORaP_qsE7Ib556unCsafTqwDU9Gth7M.jpeg"
    },
    {
      "position": 10,
      "link": "https://www.ntn24.com/noticias-actualidad/esto-dice-la-resolucion-sobre-nicaragua-que-votaran-en-la-oea-washington-ejerce-maxima-presion-654068",
      "title": "Esto dice la resolución sobre Nicaragua que votarán en la OEA: \"Washington ejerce máxima presión\"",
      "source": "NTN24",
      "date": "hace 2 horas",
      "published_at": "2026-09-28 21:10:08 UTC",
      "snippet": "NTN24 conoció en primicia la resolución que los cancilleres van a votar en la OEA sobre la situación en Nicaragua. La resolución de cinco puntos, impulsada.",
      "favicon": "https://serpapi.com/images/i/iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAdVBMVEX___-uu-N_ldTo7Pfi5_Xb4fIAKbaDmNV6kdOZqtxPcchLbsepuOI-ZMT3-fxhfsxAaMYsW8LO1-7V2_AcUr-Kntdphc_H0OsyXsKUpdpwitEAHLMACLEAIrRbesvx9PsAL7cARLsAO7kANLi4w-YeVMAAS72aG7s9AAAAjUlEQVQYlY2PQRKDIAxFQxHQaFVQoUilYNX7H7EOZdqt2fy8t0jmA1yYm4Cywrq5t4Im0fVMQqeGcdJFEtrgAzqjbN1_xWzsCN4owRzNV2ibosjcPBfuzySLeyXBGMWgoOA-_D9zBpGUP8ECgkbwa2b1Rmidn8eoE29cbmSw1kZZJTEd-7GSc9n9labwAcyIB7tR45GkAAAAAElFTkSuQmCC.png",
      "thumbnail": "https://serpapi.com/searches/6abaf95141ffc89ed28b1f4c/images/HZ9efUzhcbHM0NJ6AxGbPUhnMVR-2YHsdAXKfeq5QlU.jpeg"
    }
  ],
  "pagination": {
    "current": 1,
    "next": "https://www.google.com/search?q=Nicaragua&sca_esv=7f36cabdb071bba2&hl=es&gl=ni&tbs=cdr:1,cd_min:9/28/2026,cd_max:9/28/2026&tbm=nws&sxsrf=APpeQnsyWFq1gdmgiB6pETt36o8Q5QF2Xg:1790638417936&ei=Ufm6aqbfOPGB5OMP2IGK2Ag&start=10&sa=N&ved=2ahUKEwjmy8n2t5KXAxXxAHkGHdiAAosQ8NMDegQIHRAW",
    "other_pages": {
      "2": "https://www.google.com/search?q=Nicaragua&sca_esv=7f36cabdb071bba2&hl=es&gl=ni&tbs=cdr:1,cd_min:9/28/2026,cd_max:9/28/2026&tbm=nws&sxsrf=APpeQnsyWFq1gdmgiB6pETt36o8Q5QF2Xg:1790638417936&ei=Ufm6aqbfOPGB5OMP2IGK2Ag&start=10&sa=N&ved=2ahUKEwjmy8n2t5KXAxXxAHkGHdiAAosQ8tMDegQIHRAE",
      "3": "https://www.google.com/search?q=Nicaragua&sca_esv=7f36cabdb071bba2&hl=es&gl=ni&tbs=cdr:1,cd_min:9/28/2026,cd_max:9/28/2026&tbm=nws&sxsrf=APpeQnsyWFq1gdmgiB6pETt36o8Q5QF2Xg:1790638417936&ei=Ufm6aqbfOPGB5OMP2IGK2Ag&start=20&sa=N&ved=2ahUKEwjmy8n2t5KXAxXxAHkGHdiAAosQ8tMDegQIHRAG",
      "4": "https://www.google.com/search?q=Nicaragua&sca_esv=7f36cabdb071bba2&hl=es&gl=ni&tbs=cdr:1,cd_min:9/28/2026,cd_max:9/28/2026&tbm=nws&sxsrf=APpeQnsyWFq1gdmgiB6pETt36o8Q5QF2Xg:1790638417936&ei=Ufm6aqbfOPGB5OMP2IGK2Ag&start=30&sa=N&ved=2ahUKEwjmy8n2t5KXAxXxAHkGHdiAAosQ8tMDegQIHRAI",
      "5": "https://www.google.com/search?q=Nicaragua&sca_esv=7f36cabdb071bba2&hl=es&gl=ni&tbs=cdr:1,cd_min:9/28/2026,cd_max:9/28/2026&tbm=nws&sxsrf=APpeQnsyWFq1gdmgiB6pETt36o8Q5QF2Xg:1790638417936&ei=Ufm6aqbfOPGB5OMP2IGK2Ag&start=40&sa=N&ved=2ahUKEwjmy8n2t5KXAxXxAHkGHdiAAosQ8tMDegQIHRAK",
      "6": "https://www.google.com/search?q=Nicaragua&sca_esv=7f36cabdb071bba2&hl=es&gl=ni&tbs=cdr:1,cd_min:9/28/2026,cd_max:9/28/2026&tbm=nws&sxsrf=APpeQnsyWFq1gdmgiB6pETt36o8Q5QF2Xg:1790638417936&ei=Ufm6aqbfOPGB5OMP2IGK2Ag&start=50&sa=N&ved=2ahUKEwjmy8n2t5KXAxXxAHkGHdiAAosQ8tMDegQIHRAM",
      "7": "https://www.google.com/search?q=Nicaragua&sca_esv=7f36cabdb071bba2&hl=es&gl=ni&tbs=cdr:1,cd_min:9/28/2026,cd_max:9/28/2026&tbm=nws&sxsrf=APpeQnsyWFq1gdmgiB6pETt36o8Q5QF2Xg:1790638417936&ei=Ufm6aqbfOPGB5OMP2IGK2Ag&start=60&sa=N&ved=2ahUKEwjmy8n2t5KXAxXxAHkGHdiAAosQ8tMDegQIHRAO",
      "8": "https://www.google.com/search?q=Nicaragua&sca_esv=7f36cabdb071bba2&hl=es&gl=ni&tbs=cdr:1,cd_min:9/28/2026,cd_max:9/28/2026&tbm=nws&sxsrf=APpeQnsyWFq1gdmgiB6pETt36o8Q5QF2Xg:1790638417936&ei=Ufm6aqbfOPGB5OMP2IGK2Ag&start=70&sa=N&ved=2ahUKEwjmy8n2t5KXAxXxAHkGHdiAAosQ8tMDegQIHRAQ",
      "9": "https://www.google.com/search?q=Nicaragua&sca_esv=7f36cabdb071bba2&hl=es&gl=ni&tbs=cdr:1,cd_min:9/28/2026,cd_max:9/28/2026&tbm=nws&sxsrf=APpeQnsyWFq1gdmgiB6pETt36o8Q5QF2Xg:1790638417936&ei=Ufm6aqbfOPGB5OMP2IGK2Ag&start=80&sa=N&ved=2ahUKEwjmy8n2t5KXAxXxAHkGHdiAAosQ8tMDegQIHRAS",
      "10": "https://www.google.com/search?q=Nicaragua&sca_esv=7f36cabdb071bba2&hl=es&gl=ni&tbs=cdr:1,cd_min:9/28/2026,cd_max:9/28/2026&tbm=nws&sxsrf=APpeQnsyWFq1gdmgiB6pETt36o8Q5QF2Xg:1790638417936&ei=Ufm6aqbfOPGB5OMP2IGK2Ag&start=90&sa=N&ved=2ahUKEwjmy8n2t5KXAxXxAHkGHdiAAosQ8tMDegQIHRAU"
    }
  },
  "serpapi_pagination": {
    "current": 1,
    "next_link": "https://serpapi.com/search.json?device=desktop&engine=google&gl=ni&google_domain=google.com&hl=es&q=Nicaragua&start=10&tbm=nws&tbs=cdr%3A1%2Ccd_min%3A9%2F28%2F2026%2Ccd_max%3A9%2F28%2F2026",
    "next": "https://serpapi.com/search.json?device=desktop&engine=google&gl=ni&google_domain=google.com&hl=es&q=Nicaragua&start=10&tbm=nws&tbs=cdr%3A1%2Ccd_min%3A9%2F28%2F2026%2Ccd_max%3A9%2F28%2F2026",
    "other_pages": {
      "2": "https://serpapi.com/search.json?device=desktop&engine=google&gl=ni&google_domain=google.com&hl=es&q=Nicaragua&start=10&tbm=nws&tbs=cdr%3A1%2Ccd_min%3A9%2F28%2F2026%2Ccd_max%3A9%2F28%2F2026",
      "3": "https://serpapi.com/search.json?device=desktop&engine=google&gl=ni&google_domain=google.com&hl=es&q=Nicaragua&start=20&tbm=nws&tbs=cdr%3A1%2Ccd_min%3A9%2F28%2F2026%2Ccd_max%3A9%2F28%2F2026",
      "4": "https://serpapi.com/search.json?device=desktop&engine=google&gl=ni&google_domain=google.com&hl=es&q=Nicaragua&start=30&tbm=nws&tbs=cdr%3A1%2Ccd_min%3A9%2F28%2F2026%2Ccd_max%3A9%2F28%2F2026",
      "5": "https://serpapi.com/search.json?device=desktop&engine=google&gl=ni&google_domain=google.com&hl=es&q=Nicaragua&start=40&tbm=nws&tbs=cdr%3A1%2Ccd_min%3A9%2F28%2F2026%2Ccd_max%3A9%2F28%2F2026",
      "6": "https://serpapi.com/search.json?device=desktop&engine=google&gl=ni&google_domain=google.com&hl=es&q=Nicaragua&start=50&tbm=nws&tbs=cdr%3A1%2Ccd_min%3A9%2F28%2F2026%2Ccd_max%3A9%2F28%2F2026",
      "7": "https://serpapi.com/search.json?device=desktop&engine=google&gl=ni&google_domain=google.com&hl=es&q=Nicaragua&start=60&tbm=nws&tbs=cdr%3A1%2Ccd_min%3A9%2F28%2F2026%2Ccd_max%3A9%2F28%2F2026",
      "8": "https://serpapi.com/search.json?device=desktop&engine=google&gl=ni&google_domain=google.com&hl=es&q=Nicaragua&start=70&tbm=nws&tbs=cdr%3A1%2Ccd_min%3A9%2F28%2F2026%2Ccd_max%3A9%2F28%2F2026",
      "9": "https://serpapi.com/search.json?device=desktop&engine=google&gl=ni&google_domain=google.com&hl=es&q=Nicaragua&start=80&tbm=nws&tbs=cdr%3A1%2Ccd_min%3A9%2F28%2F2026%2Ccd_max%3A9%2F28%2F2026",
      "10": "https://serpapi.com/search.json?device=desktop&engine=google&gl=ni&google_domain=google.com&hl=es&q=Nicaragua&start=90&tbm=nws&tbs=cdr%3A1%2Ccd_min%3A9%2F28%2F2026%2Ccd_max%3A9%2F28%2F2026"
    }
  }
}
```

## verification/dates/final/03-model-raw.json

```json
{"id":"chatcmpl-c88daae9-a82d-441e-b988-587679408910","object":"chat.completion","created":1790638424,"model":"qwen/qwen3.8-27b","choices":[{"index":0,"message":{"role":"assistant","content":"{\"items\":[]}"},"logprobs":null,"finish_reason":"stop"}],"usage":{"queue_time":0.070148052,"prompt_tokens":3549,"prompt_time":0.243767418,"completion_tokens":5,"completion_time":0.009806298,"total_tokens":3554,"total_time":0.253573716},"usage_breakdown":null,"system_fingerprint":"fp_fea14bdc83","x_groq":{"id":"req_01m3n5w0fteprtyq7bmy8gfat4","seed":823172914},"service_tier":"on_demand"}

```

## verification/dates/final/chat-result.json

```json
{
  "query": "noticias de Nicaragua hoy",
  "status": 200,
  "errors": [],
  "sources": [
    {
      "titulo": "Nicaragua: Reinventando el periodismo en el exilio",
      "url": "https://gijn.org/es/articulos/nicaragua-reinventando-el-periodismo-en-el-exilio/",
      "fecha": "2026-09-28T09:40:23.000Z",
      "fechaLocal": "2026-09-28",
      "zonaHoraria": "America/Managua",
      "fechaAproximada": false,
      "fechaOriginal": "2026-09-28T09:40:23Z",
      "contenido": "titular",
      "no_reciente": false,
      "fecha_evento": null,
      "fecha_evento_verificada": false
    },
    {
      "titulo": "La seguridad Nacional de EEUU ratifica en la ONU el fin de las dictaduras en Cuba, Nicaragua, Venezuela y Bolivia",
      "url": "https://www.diariolasamericas.com/opinion/la-seguridad-nacional-eeuu-ratifica-la-onu-el-fin-las-dictaduras-cuba-nicaragua-venezuela-y-bolivia-n5402899",
      "fecha": "2026-09-28T15:12:00.000Z",
      "fechaLocal": "2026-09-28",
      "zonaHoraria": "America/Managua",
      "fechaAproximada": false,
      "fechaOriginal": "2026-09-28T15:12:00Z",
      "contenido": "titular",
      "no_reciente": false,
      "fecha_evento": null,
      "fecha_evento_verificada": false
    },
    {
      "titulo": "Esto dice la resolución sobre Nicaragua que votarán en la OEA: \"Washington ejerce máxima presión\"",
      "url": "https://www.ntn24.com/noticias-actualidad/esto-dice-la-resolucion-sobre-nicaragua-que-votaran-en-la-oea-washington-ejerce-maxima-presion-654068",
      "fecha": "2026-09-28T21:10:08.000Z",
      "fechaLocal": "2026-09-28",
      "zonaHoraria": "America/Managua",
      "fechaAproximada": false,
      "fechaOriginal": "2026-09-28T21:10:08Z",
      "contenido": "titular",
      "no_reciente": false,
      "fecha_evento": null,
      "fecha_evento_verificada": false
    },
    {
      "titulo": "Colombia prometió romper con Cuba y Nicaragua, pero sus embajadas siguen activas",
      "url": "https://www.cuballama.com/noticias/colombia-prometio-romper-con-cuba-y-nicaragua-pero-sus-embajadas-siguen-activas/",
      "fecha": "2026-09-28T19:24:34.000Z",
      "fechaLocal": "2026-09-28",
      "zonaHoraria": "America/Managua",
      "fechaAproximada": false,
      "fechaOriginal": "2026-09-28T19:24:34Z",
      "contenido": "titular",
      "no_reciente": false,
      "fecha_evento": null,
      "fecha_evento_verificada": false
    },
    {
      "titulo": "Sin reservas, sin protocolos y con Nicaragua sin poder abastecer a sus vecinos: la fractura del modelo agrícola centroamericano",
      "url": "https://www.infobae.com/nicaragua/2026/09/28/sin-reservas-sin-protocolos-y-con-nicaragua-sin-poder-abastecer-a-sus-vecinos-la-fractura-del-modelo-agricola-centroamericano/",
      "fecha": "2026-09-28T18:26:00.000Z",
      "fechaLocal": "2026-09-28",
      "zonaHoraria": "America/Managua",
      "fechaAproximada": false,
      "fechaOriginal": "2026-09-28T18:26:00Z",
      "contenido": "titular",
      "no_reciente": false,
      "fecha_evento": null,
      "fecha_evento_verificada": false
    }
  ],
  "answer": "Publicaciones del 2026-09-28 (America/Managua). La fecha indicada es de publicación; no confirma que los hechos ocurrieran ese día.\n\n- **Publicación: 2026-09-28 (America/Managua).** Titular de la fuente: «Nicaragua: Reinventando el periodismo en el exilio». [Fuente](<https://gijn.org/es/articulos/nicaragua-reinventando-el-periodismo-en-el-exilio/>)\n  No se presenta un resumen del evento porque no se obtuvo un fragmento validado.\n\n- **Publicación: 2026-09-28 (America/Managua).** Titular de la fuente: «La seguridad Nacional de EEUU ratifica en la ONU el fin de las dictaduras en Cuba, Nicaragua, Venezuela y Bolivia». [Fuente](<https://www.diariolasamericas.com/opinion/la-seguridad-nacional-eeuu-ratifica-la-onu-el-fin-las-dictaduras-cuba-nicaragua-venezuela-y-bolivia-n5402899>)\n  No se presenta un resumen del evento porque no se obtuvo un fragmento validado.\n\n- **Publicación: 2026-09-28 (America/Managua).** Titular de la fuente: «Esto dice la resolución sobre Nicaragua que votarán en la OEA: \"Washington ejerce máxima presión\"». [Fuente](<https://www.ntn24.com/noticias-actualidad/esto-dice-la-resolucion-sobre-nicaragua-que-votaran-en-la-oea-washington-ejerce-maxima-presion-654068>)\n  No se presenta un resumen del evento porque no se obtuvo un fragmento validado.\n\n- **Publicación: 2026-09-28 (America/Managua).** Titular de la fuente: «Colombia prometió romper con Cuba y Nicaragua, pero sus embajadas siguen activas». [Fuente](<https://www.cuballama.com/noticias/colombia-prometio-romper-con-cuba-y-nicaragua-pero-sus-embajadas-siguen-activas/>)\n  No se presenta un resumen del evento porque no se obtuvo un fragmento validado.\n\n- **Publicación: 2026-09-28 (America/Managua).** Titular de la fuente: «Sin reservas, sin protocolos y con Nicaragua sin poder abastecer a sus vecinos: la fractura del modelo agrícola centroamericano». [Fuente](<https://www.infobae.com/nicaragua/2026/09/28/sin-reservas-sin-protocolos-y-con-nicaragua-sin-poder-abastecer-a-sus-vecinos-la-fractura-del-modelo-agricola-centroamericano/>)\n  No se presenta un resumen del evento porque no se obtuvo un fragmento validado."
}
```

