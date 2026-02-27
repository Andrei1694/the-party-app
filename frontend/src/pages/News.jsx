import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import api, { endpoints } from '../requests';

const PAGE_SIZE = 20;

const extractNewsItems = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  return [];
};

const getExcerpt = (text, maxLength = 220) => {
  const normalized = (text || '').trim();
  if (normalized.length <= maxLength) {
    return normalized || 'No content available.';
  }

  return `${normalized.slice(0, maxLength).trimEnd()}...`;
};

const fetchNews = async () => {
  const { data } = await api.get(endpoints.news, {
    params: {
      page: 0,
      size: PAGE_SIZE,
      sort: 'id,desc',
    },
  });

  return extractNewsItems(data);
};

const News = () => {
  const { data = [], error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
    staleTime: 30_000,
  });

  const featuredNews = useMemo(() => data[0] ?? null, [data]);
  const newsList = useMemo(() => data.slice(1), [data]);

  return (
    <section className="font-display">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <header className="overflow-hidden rounded-3xl border border-cusens-border bg-white shadow-sm">
          <div className="bg-gradient-to-r from-cusens-primary/10 via-cusens-primary/5 to-transparent px-6 py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cusens-primary">Newsroom</p>
                <h2 className="mt-2 text-2xl font-bold text-cusens-text-primary sm:text-3xl">Latest Updates</h2>
                <p className="mt-2 max-w-3xl text-sm text-cusens-text-secondary">
                  Live data from backend endpoint <code>/api/news</code>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 rounded-xl border border-cusens-border bg-white px-3 py-2 text-sm font-semibold text-cusens-text-primary hover:bg-cusens-bg"
                disabled={isFetching}
              >
                <span className="material-icons text-[18px]">refresh</span>
                {isFetching ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </header>

        {isLoading && (
          <div className="rounded-3xl border border-cusens-border bg-white p-6 text-sm text-cusens-text-secondary shadow-sm">
            Loading news from backend...
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Could not load news. {error.message}
          </div>
        )}

        {!isLoading && !error && featuredNews && (
          <Link
            to="/news/$newsId"
            params={{ newsId: String(featuredNews.id) }}
            className="group block rounded-3xl border border-cusens-border bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <article>
              <div className="mb-3 inline-flex rounded-full bg-cusens-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cusens-primary">
                Featured
              </div>
              <h3 className="text-xl font-bold text-cusens-text-primary sm:text-2xl group-hover:text-cusens-primary">
                {featuredNews.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-cusens-text-secondary">{getExcerpt(featuredNews.content)}</p>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold uppercase tracking-wide text-cusens-text-secondary">
                <span>Article #{featuredNews.id}</span>
                <span>Backend Feed</span>
              </div>
              <p className="mt-4 text-sm font-semibold text-cusens-primary">Read full article</p>
            </article>
          </Link>
        )}

        {!isLoading && !error && data.length === 0 && (
          <div className="rounded-3xl border border-cusens-border bg-white p-6 text-sm text-cusens-text-secondary shadow-sm">
            No news available yet. Create one with a POST to <code>/api/news</code>.
          </div>
        )}

        {!isLoading && !error && newsList.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {newsList.map((item) => (
              <Link
                key={item.id}
                to="/news/$newsId"
                params={{ newsId: String(item.id) }}
                className="group block rounded-2xl border border-cusens-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <article>
                  <div className="mb-3 flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-cusens-text-secondary">
                    <span>Article #{item.id}</span>
                    <span>Backend Feed</span>
                  </div>
                  <h4 className="text-lg font-bold text-cusens-text-primary group-hover:text-cusens-primary">{item.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-cusens-text-secondary">{getExcerpt(item.content)}</p>
                  <p className="mt-4 text-sm font-semibold text-cusens-primary">Read full article</p>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default News;
