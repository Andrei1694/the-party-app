import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import AsyncStateCard from '../components/feedback/AsyncStateCard';
import PageFeedHeader from '../components/layout/PageFeedHeader';
import { DEFAULT_STALE_TIME_MS } from '../queries/queryDefaults';
import api, { endpoints } from '../requests';
import { getApiErrorMessage } from '../util';

const fetchNewsById = async (newsId) => {
  const { data } = await api.get(endpoints.newsById(newsId));
  return data;
};

const NewsArticle = () => {
  const { newsId } = useParams({ from: '/news/$newsId' });
  const queryClient = useQueryClient();

  const normalizedNewsId = useMemo(() => Number(newsId), [newsId]);
  const isValidNewsId = useMemo(
    () => Number.isInteger(normalizedNewsId) && normalizedNewsId > 0,
    [normalizedNewsId],
  );

  const cachedNews = useMemo(() => {
    const cachedList = queryClient.getQueryData(['news']);
    if (!Array.isArray(cachedList)) {
      return undefined;
    }

    return cachedList.find((item) => String(item?.id) === newsId);
  }, [newsId, queryClient]);

  const {
    data: article,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['news', newsId],
    queryFn: () => fetchNewsById(newsId),
    enabled: isValidNewsId,
    initialData: cachedNews,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  if (!isValidNewsId) {
    return (
      <section className="font-display">
        <div className="mx-auto w-full max-w-4xl">
          <AsyncStateCard tone="danger" message={`Invalid article id: ${newsId}`}>
            <Link to="/news" className="inline-flex items-center text-sm font-semibold text-cusens-primary hover:underline">
              Back to News
            </Link>
          </AsyncStateCard>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="font-display">
        <div className="mx-auto w-full max-w-4xl">
          <AsyncStateCard message="Loading article..." />
        </div>
      </section>
    );
  }

  if (error && !article) {
    const notFound = error?.response?.status === 404;

    return (
      <section className="font-display">
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-700">
            {notFound
              ? `Article #${newsId} was not found.`
              : `Could not load article. ${getApiErrorMessage(error, 'Unexpected error while loading article.')}`}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex items-center rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              Try again
            </button>
            <Link to="/news" className="inline-flex items-center text-sm font-semibold text-cusens-primary hover:underline">
              Back to News
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!article) {
    return (
      <section className="font-display">
        <div className="mx-auto w-full max-w-4xl">
          <AsyncStateCard message="This article is currently unavailable." />
        </div>
      </section>
    );
  }

  return (
    <section className="font-display">
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <PageFeedHeader
          kicker="Newsroom"
          title={article.title}
          isRefreshing={isFetching}
          onRefresh={() => refetch()}
          className="overflow-visible"
          bodyClassName="px-6 py-6"
        >
          <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-cusens-text-secondary">Article #{article.id}</p>
        </PageFeedHeader>

        <article className="rounded-3xl border border-cusens-border bg-white p-6 shadow-sm">
          <p className="whitespace-pre-line text-sm leading-relaxed text-cusens-text-secondary">{article.content}</p>
        </article>

        <Link to="/news" className="inline-flex items-center text-sm font-semibold text-cusens-primary hover:underline">
          <span className="material-icons mr-1 text-[18px]">arrow_back</span>
          Back to News
        </Link>
      </div>
    </section>
  );
};

export default NewsArticle;
