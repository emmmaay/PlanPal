import { Crown, Trophy, Medal, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  id: string;
  username: string;
  avatar?: string;
  points: number;
  badges: number;
  rank: number;
  contributions: number;
}

interface LeaderboardCardProps {
  title?: string;
  entries: LeaderboardEntry[];
  maxEntries?: number;
}

export function LeaderboardCard({ 
  title = "Top Contributors", 
  entries, 
  maxEntries = 10 
}: LeaderboardCardProps) {
  const displayEntries = entries.slice(0, maxEntries);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Trophy className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Medal className="h-4 w-4 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/30 border-yellow-200 dark:border-yellow-800";
      case 2:
        return "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950/30 dark:to-gray-900/30 border-gray-200 dark:border-gray-800";
      case 3:
        return "bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30 border-amber-200 dark:border-amber-800";
      default:
        return "bg-card hover:bg-muted/50";
    }
  };

  return (
    <Card data-testid="card-leaderboard">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {displayEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Trophy className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No contributors yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayEntries.map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  getRankStyles(entry.rank)
                )}
                data-testid={`leaderboard-entry-${entry.id}`}
              >
                <div className="flex-shrink-0 w-8 flex items-center justify-center">
                  {getRankIcon(entry.rank)}
                </div>
                
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.avatar} alt={entry.username} />
                  <AvatarFallback className="text-xs">
                    {entry.username.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" data-testid={`text-username-${entry.id}`}>
                    {entry.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {entry.contributions} contributions
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {entry.badges > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {entry.badges} {entry.badges === 1 ? 'badge' : 'badges'}
                    </Badge>
                  )}
                  <div className="text-right">
                    <p className="font-bold text-primary" data-testid={`text-points-${entry.id}`}>
                      {entry.points.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
