import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api, { endpoints } from '../requests';

const PAGE_SIZE = 20;
const DEFAULT_CATEGORY = 'Community';

const statusClassByLabel = {
  Upcoming: 'bg-cusens-primary/10 text-cusens-primary',
  Open: 'bg-green-100 text-green-700',
  Closed: 'bg-gray-200 text-gray-700',
};

const formatDateTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date not available';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const extractEventItems = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.content)) {
    return payload.content;
  }

  return [];
};

const getEventStatus = (startTime, endTime) => {
  const now = Date.now();
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();

  if (Number.isNaN(start) && Number.isNaN(end)) {
    return 'Closed';
  }

  if (!Number.isNaN(start) && now < start) {
    return 'Upcoming';
  }

  if (!Number.isNaN(start) && Number.isNaN(end)) {
    return 'Open';
  }

  if (!Number.isNaN(start) && !Number.isNaN(end) && now >= start && now <= end) {
    return 'Open';
  }

  if (Number.isNaN(start) && !Number.isNaN(end) && now <= end) {
    return 'Open';
  }

  return 'Closed';
};

const mapBackendEvent = (event) => ({
  id: event.id,
  title: event.name || 'Untitled event',
  description: event.description || 'No description available.',
  startsAt: event.startTime,
  endsAt: event.endTime,
  location: event.location || 'Location not specified',
  category: DEFAULT_CATEGORY,
  status: getEventStatus(event.startTime, event.endTime),
});

const fetchEvents = async () => {
  const { data } = await api.get(endpoints.events, {
    params: {
      page: 0,
      size: PAGE_SIZE,
      sort: 'startTime,asc',
    },
  });

  return extractEventItems(data).map(mapBackendEvent);
};

const extractJoinedEventIds = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
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
    staleTime: 30_000,
  });

  const {
    data: joinedEventIds = [],
    isFetching: isFetchingJoined,
    isLoading: isLoadingJoined,
    refetch: refetchJoined,
  } = useQuery({
    queryKey: ['events', 'joined'],
    queryFn: fetchJoinedEventIds,
    staleTime: 30_000,
  });

  const joinedEventIdSet = useMemo(() => new Set(joinedEventIds), [joinedEventIds]);

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
        <header className="overflow-hidden rounded-3xl border border-cusens-border bg-white shadow-sm">
          <div className="bg-gradient-to-r from-cusens-primary/10 via-cusens-primary/5 to-transparent px-6 py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cusens-primary">Community</p>
                <h2 className="mt-2 text-2xl font-bold text-cusens-text-primary sm:text-3xl">Events</h2>
                <p className="mt-2 max-w-3xl text-sm text-cusens-text-secondary">
                  Upcoming opportunities to participate in local initiatives. Live data from backend endpoint{' '}
                  <code>/api/events</code>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setJoinError('');
                  void Promise.all([refetch(), refetchJoined()]);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-cusens-border bg-white px-3 py-2 text-sm font-semibold text-cusens-text-primary hover:bg-cusens-bg"
                disabled={isRefreshing}
              >
                <span className="material-icons text-[18px]">refresh</span>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </header>

        {joinError && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{joinError}</div>
        )}

        {isLoading && (
          <div className="rounded-3xl border border-cusens-border bg-white p-6 text-sm text-cusens-text-secondary shadow-sm">
            Loading events from backend...
          </div>
        )}

        {error && !isLoading && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
            Could not load events. {error.message}
          </div>
        )}

        {!isLoading && !error && events.length === 0 && (
          <div className="rounded-3xl border border-cusens-border bg-white p-6 text-sm text-cusens-text-secondary shadow-sm">
            No events are available right now.
          </div>
        )}

        {!isLoading && !error && events.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => {
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
                      <span>{formatDateTime(event.startsAt)}</span>
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
