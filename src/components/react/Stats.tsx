import CountUp from '@/components/reactbits/CountUp';

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

export default function Stats({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <div key={stat.label} className="card flex flex-col justify-between gap-3 p-5">
          <dt className="order-2 text-sm text-muted">{stat.label}</dt>
          <dd className="order-1 font-mono text-4xl font-bold tracking-tight text-fg">
            <CountUp to={stat.value} duration={1.6} />
            <span className="text-accent">{stat.suffix}</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}
