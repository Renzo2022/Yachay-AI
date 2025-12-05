const SEMANTIC_URL = 'https://api.semanticscholar.org/graph/v1/paper/search';
const PUBMED_ESEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';
const PUBMED_ESUMMARY = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';

function getSemanticKey() {
  const key = import.meta.env.VITE_SEMANTIC_SCHOLAR_API_KEY;
  if (!key) {
    throw new Error('Falta VITE_SEMANTIC_SCHOLAR_API_KEY en el entorno.');
  }
  return key;
}

function getPubMedKey() {
  const key = import.meta.env.VITE_PUBMED_API_KEY;
  if (!key) {
    throw new Error('Falta VITE_PUBMED_API_KEY en el entorno.');
  }
  return key;
}

export async function searchSemanticScholar(query) {
  const apiKey = getSemanticKey();
  const url = new URL(SEMANTIC_URL);
  url.searchParams.set('query', query);
  url.searchParams.set('limit', '10');
  url.searchParams.set('fields', 'title,authors,year,abstract,venue,openAccessPdf,externalIds,url');

  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Semantic Scholar error: ${text}`);
  }

  const data = await response.json();
  return (data?.data ?? []).map((item) => ({
    id: item.paperId,
    title: item.title,
    authors: item.authors?.map((author) => author.name).join(', ') ?? 'Autor desconocido',
    year: item.year,
    abstract: item.abstract,
    venue: item.venue,
    url: item.openAccessPdf?.url ?? item.url ?? null,
    openAccess: Boolean(item.openAccessPdf?.url),
    source: 'Semantic',
  }));
}

export async function searchPubMed(query) {
  const apiKey = getPubMedKey();
  const searchUrl = new URL(PUBMED_ESEARCH);
  searchUrl.searchParams.set('db', 'pubmed');
  searchUrl.searchParams.set('retmode', 'json');
  searchUrl.searchParams.set('retmax', '10');
  searchUrl.searchParams.set('api_key', apiKey);
  searchUrl.searchParams.set('term', query);

  const searchResponse = await fetch(searchUrl.toString());
  if (!searchResponse.ok) {
    const text = await searchResponse.text();
    throw new Error(`PubMed esearch error: ${text}`);
  }
  const searchData = await searchResponse.json();
  const ids = searchData?.esearchresult?.idlist ?? [];
  if (ids.length === 0) return [];

  const summaryUrl = new URL(PUBMED_ESUMMARY);
  summaryUrl.searchParams.set('db', 'pubmed');
  summaryUrl.searchParams.set('retmode', 'json');
  summaryUrl.searchParams.set('api_key', apiKey);
  summaryUrl.searchParams.set('id', ids.join(','));

  const summaryResponse = await fetch(summaryUrl.toString());
  if (!summaryResponse.ok) {
    const text = await summaryResponse.text();
    throw new Error(`PubMed esummary error: ${text}`);
  }

  const summaryData = await summaryResponse.json();
  const result = summaryData?.result ?? {};

  return ids
    .map((id) => {
      const item = result[id];
      if (!item) return null;
      return {
        id: id,
        title: item.title,
        authors: item.authors?.map((author) => author.name).join(', ') ?? 'Autor desconocido',
        year: item.pubdate?.slice(0, 4),
        abstract: item.summary ?? item.ellocationid ?? '',
        venue: item.fulljournalname,
        url: item.elocationid ? `https://pubmed.ncbi.nlm.nih.gov/${id}/` : null,
        openAccess: false,
        source: 'PubMed',
      };
    })
    .filter(Boolean);
}

export async function searchAllSources(query) {
  const tasks = [
    { source: 'Semantic', fn: () => searchSemanticScholar(query) },
    { source: 'PubMed', fn: () => searchPubMed(query) },
  ];

  const results = await Promise.allSettled(tasks.map((task) => task.fn()));

  const combined = [];
  const warnings = [];

  results.forEach((result, index) => {
    const source = tasks[index].source;
    if (result.status === 'fulfilled') {
      combined.push(...result.value);
    } else {
      warnings.push(`No se pudo obtener resultados de ${source}: ${result.reason?.message ?? 'Error desconocido'}`);
    }
  });

  return { items: combined, warnings };
}
