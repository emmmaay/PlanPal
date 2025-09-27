import { LeaderboardCard } from '../LeaderboardCard';
import { ThemeProvider } from '../ThemeProvider';

export default function LeaderboardCardExample() {
  const sampleEntries = [
    {
      id: "1",
      username: "alice_coder",
      points: 2850,
      badges: 12,
      rank: 1,
      contributions: 45,
    },
    {
      id: "2",
      username: "bob_dev",
      points: 2340,
      badges: 8,
      rank: 2,
      contributions: 38,
    },
    {
      id: "3",
      username: "charlie_prog",
      points: 2100,
      badges: 6,
      rank: 3,
      contributions: 32,
    },
    {
      id: "4",
      username: "diana_script",
      points: 1890,
      badges: 5,
      rank: 4,
      contributions: 28,
    },
  ];

  return (
    <ThemeProvider>
      <div className="p-8 bg-background min-h-screen">
        <div className="max-w-lg">
          <LeaderboardCard entries={sampleEntries} />
        </div>
      </div>
    </ThemeProvider>
  );
}
