import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import AsyncStateCard from '../components/feedback/AsyncStateCard';
import PageFeedHeader from '../components/layout/PageFeedHeader';
import extractPaginatedContent from '../queries/extractPaginatedContent';
import { DEFAULT_PAGE_SIZE, DEFAULT_STALE_TIME_MS } from '../queries/queryDefaults';
import api, { endpoints } from '../requests';

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
      size: DEFAULT_PAGE_SIZE,
      sort: 'id,desc',
    },
  });

  return extractPaginatedContent(data);
};

const News = () => {
  const { data = [], error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  const featuredNews = useMemo(() => data[0] ?? null, [data]);
  const newsList = useMemo(() => data.slice(1), [data]);

  return (
    <section className="font-display">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <PageFeedHeader
          kicker="Newsroom"
          title="Latest Updates"
          description={
            <>
              Live data from backend endpoint <code>/api/news</code>.
            </>
          }
          isRefreshing={isFetching}
          onRefresh={() => refetch()}
        />

        {isLoading && (
          <AsyncStateCard message="Loading news from backend..." />
        )}

        {error && !isLoading && (
          <AsyncStateCard tone="danger" message={`Could not load news. ${error.message}`} />
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
          <AsyncStateCard
            message={
              <>
                No news available yet. Create one with a POST to <code>/api/news</code>.
              </>
            }
          />
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
