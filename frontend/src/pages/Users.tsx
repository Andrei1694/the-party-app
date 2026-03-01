import { useQuery } from '@tanstack/react-query';
import AsyncStateCard from '../components/feedback/AsyncStateCard';
import api, { endpoints } from '../requests';

const fetchUsers = async () => {
  const { data } = await api.get(endpoints.users);
  return data;
};

const Users = () => {
  const { data, error, isLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

  if (isLoading) {
    return (
      <section className="font-display">
        <div className="mx-auto w-full max-w-4xl">
          <AsyncStateCard message={<span className="font-medium">Loading users...</span>} className="bg-cusens-surface" />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="font-display">
        <div className="mx-auto w-full max-w-4xl">
          <AsyncStateCard tone="danger" message={<span className="font-medium">An error occurred: {error.message}</span>} />
        </div>
      </section>
    );
  }

  return (
    <section className="font-display">
      <div className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-cusens-border bg-cusens-surface shadow-sm">
        <div className="border-b border-cusens-border px-6 py-5">
          <h2 className="text-xl font-bold text-cusens-text-primary">Users</h2>
          <p className="text-sm text-cusens-text-secondary">Registered community members</p>
        </div>

        <ul className="divide-y divide-cusens-border">
          {data.content.map((user) => (
            <li key={user.id} className="px-6 py-4">
              <p className="text-sm font-semibold text-cusens-text-primary">
                {user.username} <span className="text-cusens-text-secondary">({user.email})</span>
              </p>
              {user.userProfile && (
                <p className="mt-1 text-sm text-cusens-text-secondary">
                  Phone: {user.userProfile.telefon}, CNP: {user.userProfile.cnp}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default Users;
