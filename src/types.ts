export interface UserGame {
  id: string;
  name: string;
  coverUrl: string;
  launchUrl: string;
  appScheme?: string;
}

export interface GameGoal {
  gameId: string;
  goal: string;
}