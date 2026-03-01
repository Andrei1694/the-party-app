import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AsyncStateCard from '../components/feedback/AsyncStateCard';
import PageFeedHeader from '../components/layout/PageFeedHeader';
import { DEFAULT_PAGE_SIZE, DEFAULT_STALE_TIME_MS } from '../queries/queryDefaults';
import api, { endpoints } from '../requests';
import {
  extractJoinedEventIds,
  extractPaginatedContent,
  formatDateTime,
  mapBackendEvent,
} from '../util';

const statusClassByLabel = {
  Upcoming: 'bg-cusens-primary/10 text-cusens-primary',
  Open: 'bg-green-100 text-green-700',
  Closed: 'bg-gray-200 text-gray-700',
};

const fetchEvents = async () => {
  const { data } = await api.get(endpoints.events, {
    params: {
      page: 0,
      size: DEFAULT_PAGE_SIZE,
      sort: 'startTime,asc',
    },
  });

  return extractPaginatedContent(data).map(mapBackendEvent);
};

const fetchJoinedEventIds = async () => {
  const { data } = await api.get(endpoints.eventsJoined);
  return extractJoinedEventIds(data);
};

const Events = () => {
  const queryClient = useQueryClient();
  const [joinError, setJoinError] = useState('');

  const { data: events = [], error, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  const {
    data: joinedEventIds = [],
    isFetching: isFetchingJoined,
    isLoading: isLoadingJoined,
    refetch: refetchJoined,
  } = useQuery({
    queryKey: ['events', 'joined'],
    queryFn: fetchJoinedEventIds,
    staleTime: DEFAULT_STALE_TIME_MS,
  });

  const joinedEventIdSet = useMemo(() => new Set(joinedEventIds), [joinedEventIds]);
  const eventsWithFormattedStart = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        formattedStartsAt: formatDateTime(event.startsAt),
      })),
    [events],
  );

  const joinEventMutation = useMutation({
    mutationFn: async (eventId) => {
      await api.post(endpoints.eventJoin(eventId));
      return eventId;
    },
    onMutate: () => {
      setJoinError('');
    },
    onSuccess: (eventId) => {
      queryClient.setQueryData(['events', 'joined'], (previousIds = []) => {
        if (previousIds.includes(eventId)) {
          return previousIds;
        }
        return [...previousIds, eventId];
      });
    },
    onError: (mutationError, eventId) => {
      if (mutationError?.response?.status === 409) {
        queryClient.setQueryData(['events', 'joined'], (previousIds = []) => {
          if (previousIds.includes(eventId)) {
            return previousIds;
          }
          return [...previousIds, eventId];
        });
        return;
      }

      const message = mutationError?.response?.data?.message || 'Could not join this event right now.';
      setJoinError(message);
    },
  });

  const isRefreshing = isFetching || isFetchingJoined;

  return (
    <section className="font-display">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <PageFeedHeader
          kicker="Community"
          title="Events"
          description={
            <>
              Upcoming opportunities to participate in local initiatives. Live data from backend endpoint{' '}
              <code>/api/events</code>.
            </>
          }
          isRefreshing={isRefreshing}
          onRefresh={() => {
            setJoinError('');
            return Promise.all([refetch(), refetchJoined()]);
          }}
        />

        {joinError && (
          <AsyncStateCard tone="danger" message={joinError} className="p-4" />
        )}

        {isLoading && (
          <AsyncStateCard message="Loading events from backend..." />
        )}

        {error && !isLoading && (
          <AsyncStateCard tone="danger" message={`Could not load events. ${error.message}`} />
        )}

        {!isLoading && !error && events.length === 0 && (
          <AsyncStateCard message="No events are available right now." />
        )}

        {!isLoading && !error && eventsWithFormattedStart.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {eventsWithFormattedStart.map((event) => {
              const isJoined = joinedEventIdSet.has(event.id);
              const isClosed = event.status === 'Closed';
              const isJoiningCurrent = joinEventMutation.isPending && joinEventMutation.variables === event.id;
              const canJoin = !isClosed && !isJoined;

              return (
                <article key={event.id} className="rounded-2xl border border-cusens-border bg-white p-5 shadow-sm">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-cusens-text-secondary">
                      Event #{event.id}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        statusClassByLabel[event.status] || statusClassByLabel.Closed
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-cusens-text-primary">{event.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cusens-text-secondary">{event.description}</p>

                  <div className="mt-4 space-y-2 text-sm text-cusens-text-secondary">
                    <p className="flex items-center gap-2">
                      <span className="material-icons text-[18px] text-cusens-primary">schedule</span>
                      <span>{event.formattedStartsAt}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="material-icons text-[18px] text-cusens-primary">place</span>
                      <span>{event.location}</span>
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div className="inline-flex rounded-full bg-cusens-bg px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cusens-text-secondary">
                      {event.category}
                    </div>

                    <button
                      type="button"
                      onClick={() => joinEventMutation.mutate(event.id)}
                      disabled={!canJoin || isJoiningCurrent || isLoadingJoined}
                      className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-semibold transition ${
                        isJoined
                          ? 'cursor-default border border-green-200 bg-green-50 text-green-700'
                          : isClosed
                            ? 'cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-500'
                            : 'border border-cusens-primary bg-cusens-primary text-cusens-text-primary hover:bg-cusens-primary-hover'
                      }`}
                    >
                      {isJoiningCurrent ? 'Joining...' : isJoined ? 'Joined' : isClosed ? 'Closed' : 'Join'}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default Events;
