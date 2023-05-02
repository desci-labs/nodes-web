interface Stat {
  name: string;
  stat: string;
}

interface AdminStatsProps {
  stats: Stat[];
  title: string;
  loading: boolean;
}

const AdminStats = ({ stats, title, loading }: AdminStatsProps) => (
  <div className="w-full">
    <h3 className="text-base font-semibold leading-6 text-gray-100">{title}</h3>
    <dl className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-5">
      {stats.map((item: Stat) => (
        <div
          key={item.name}
          className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
        >
          <dt className="truncate text-sm font-medium text-gray-500">
            {item.name}
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
            {loading ? "-" : item.stat}
          </dd>
        </div>
      ))}
    </dl>
  </div>
);

export default AdminStats;
