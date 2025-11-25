import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useModerationStats } from '../../api/queries';
import styles from './Stats.module.css';

const Stats = () => {
  const { data, isLoading } = useModerationStats();

  if (isLoading) return <div className={styles.container}>Загрузка статистики...</div>;
  if (!data) return null;
  
  const pieData = [
    { name: 'Одобрено', value: data.decisions?.approved },
    { name: 'Отклонено', value: data.decisions?.rejected },
    { name: 'На доработку', value: data.decisions?.requestChanges },
  ];
  const COLORS = ['#28a745', '#dc3545', '#ffc107'];

  return (
    <div className={styles.container}>
      <h1>Статистика модерации</h1>
      
      <div className={styles.summaryGrid}>
        <div className={styles.statCard}>
            <div className={styles.statValue}>{data.summary.totalReviewed}</div>
            <div className={styles.statLabel}>Всего проверено</div>
        </div>
        <div className={styles.statCard}>
            <div className={styles.statValue}>{data.summary.approvedPercentage}%</div>
            <div className={styles.statLabel}>Доля одобрений</div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        <div className={styles.chartContainer}>
            <h3>Активность (7 дней)</h3>
            <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data.activity}>
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="approved" fill="#28a745" name="Одобрено" />
                    <Bar dataKey="rejected" fill="#dc3545" name="Отклонено" />
                </BarChart>
            </ResponsiveContainer>
        </div>

        <div className={styles.chartContainer}>
            <h3>Решения</h3>
            <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                    <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                    >
                        {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Stats;
