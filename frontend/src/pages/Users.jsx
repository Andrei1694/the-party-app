import { useQuery } from '@tanstack/react-query';
import api, { endpoints } from '../requests';

const fetchUsers = async () => {
  const { data } = await api.get(endpoints.users);
  return data;
};

const Users = () => {
  const { data, error, isLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;

  return (
    <div>
      <h1>Users Page</h1>
      <ul>
        {data.content.map((user) => (
          <li key={user.id}>
            {user.username} ({user.email})
            {user.userProfile && (
                <span> - Phone: {user.userProfile.telefon}, CNP: {user.userProfile.cnp}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Users;
