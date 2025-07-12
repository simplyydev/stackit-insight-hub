// User ranking system for StackIt

export interface UserRank {
  level: string;
  title: string;
  color: string;
  minScore: number;
}

export const USER_RANKS: UserRank[] = [
  { level: 'bronze', title: 'Newcomer', color: 'text-amber-600', minScore: 0 },
  { level: 'bronze-plus', title: 'Contributor', color: 'text-amber-700', minScore: 50 },
  { level: 'silver', title: 'Helper', color: 'text-slate-500', minScore: 150 },
  { level: 'silver-plus', title: 'Knowledgeable', color: 'text-slate-600', minScore: 300 },
  { level: 'gold', title: 'Expert', color: 'text-yellow-500', minScore: 500 },
  { level: 'gold-plus', title: 'Mentor', color: 'text-yellow-600', minScore: 750 },
  { level: 'platinum', title: 'Master', color: 'text-blue-500', minScore: 1000 },
  { level: 'diamond', title: 'Legend', color: 'text-purple-500', minScore: 1500 },
];

export function calculateUserScore(profile: {
  questions_asked?: number;
  answers_given?: number;
  total_votes?: number;
  accepted_answers?: number;
}): number {
  const questionsScore = (profile.questions_asked || 0) * 5;
  const answersScore = (profile.answers_given || 0) * 10;
  const votesScore = (profile.total_votes || 0) * 2;
  const acceptedScore = (profile.accepted_answers || 0) * 25;
  
  return questionsScore + answersScore + votesScore + acceptedScore;
}

export function getUserRank(score: number): UserRank {
  // Find the highest rank the user qualifies for
  for (let i = USER_RANKS.length - 1; i >= 0; i--) {
    if (score >= USER_RANKS[i].minScore) {
      return USER_RANKS[i];
    }
  }
  return USER_RANKS[0]; // Default to lowest rank
}

export function getNextRank(currentScore: number): { rank: UserRank; pointsNeeded: number } | null {
  const currentRank = getUserRank(currentScore);
  const currentIndex = USER_RANKS.findIndex(r => r.level === currentRank.level);
  
  if (currentIndex === USER_RANKS.length - 1) {
    return null; // Already at highest rank
  }
  
  const nextRank = USER_RANKS[currentIndex + 1];
  const pointsNeeded = nextRank.minScore - currentScore;
  
  return { rank: nextRank, pointsNeeded };
}