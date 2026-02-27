import { useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from '@tanstack/react-router';
import api, { endpoints } from '../requests';

const getErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.response?.data?.detail ||
  (typeof error?.response?.data === 'string' ? error.response.data : null) ||
  error?.message ||
  'Unexpected error while loading article.';

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
    staleTime: 30_000,
  });

  if (!isValidNewsId) {
    return (
      <section className="font-display">
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-700">Invalid article id: {newsId}</p>
          <Link to="/news" className="mt-4 inline-flex text-sm font-semibold text-cusens-primary hover:underline">
            Back to News
          </Link>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="font-display">
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-cusens-border bg-white p-6 text-sm text-cusens-text-secondary shadow-sm">
          Loading article...
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
            {notFound ? `Article #${newsId} was not found.` : `Could not load article. ${getErrorMessage(error)}`}
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
        <div className="mx-auto w-full max-w-4xl rounded-3xl border border-cusens-border bg-white p-6 text-sm text-cusens-text-secondary shadow-sm">
          This article is currently unavailable.
        </div>
      </section>
    );
  }

  return (
    <section className="font-display">
      <div className="mx-auto w-full max-w-4xl space-y-5">
        <header className="rounded-3xl border border-cusens-border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cusens-primary">Newsroom</p>
              <h2 className="mt-2 text-2xl font-bold text-cusens-text-primary sm:text-3xl">{article.title}</h2>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-cusens-text-secondary">
                Article #{article.id}
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
        </header>

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
