// ENUMS E TIPOS LITERAIS

export type Position = 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA';

export type Condition = 'APTO' | 'MAL_CONDICIONADO' | 'DOENTE';

export type TransactionType = 'COMPRA' | 'VENDA';

export type ContractStatus = 'ATIVO' | 'ENCERRADO' | 'RESCINDIDO';

export type Formation = '3-1' | '2-2' | '2-1-1' | '1-2-1';

export type MatchResult = 'MANDANTE' | 'VISITANTE' | 'EMPATE';

export type ClubSortOption = 'name' | 'net_worth_asc' | 'net_worth_desc';

// 1. JOGADORES (PLAYER)

export interface Player {
  id: number;
  name: string;
  position: Position;
  agility: number;
  age: number;
  condition: Condition;
  base_value: number;
  market_value: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
  overall: number;
  club_id: number | null;
  contract?: Contract; // Presente quando o jogador pertence a um clube
}

export interface CreatePlayerDTO {
  name: string;
  position: Position;
  agility: number;
  age: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
}

export interface UpdatePlayerDTO {
  name: string;
  position: Position;
  agility: number;
  age: number;
}

export interface UpdateConditionDTO {
  condition: Condition;
}

export interface PlayerQueryParams {
  search?: string;
  position?: Position;
  condition?: Condition;
  free?: boolean;
  club_id?: number;
  min_age?: number;
  max_age?: number;
  min_value?: number;
  max_value?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

// 2. CONTRATOS (CONTRACT)

export interface Contract {
  purchase_value: number;
  loyalty_until: string;
  remaining_days: number;
  penalty_rate: number;
  status?: ContractStatus;
}

// 3. CLUBES (CLUB)

export interface Club {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
}

export interface ClubWithSquad extends Club {
  players: Player[];
}

export interface CreateClubDTO {
  name: string;
  acronym: string;
}

// 4. MERCADO & TRANSAÇÕES (MARKET & TRANSACTIONS)

export interface BuyPlayerDTO {
  club_id: number;
  loyalty_until: string;
}

export interface BuyTransactionResponse {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: 'COMPRA';
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
  contract: {
    purchase_value: number;
    loyalty_until: string;
    status: ContractStatus;
  };
  club_cash: number;
}

export interface SellTransactionResponse {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: 'VENDA';
  value: number;
  fee: number;
  penalty: number;
  profit: number;
  cash_change: number;
  created_at: string;
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: ContractStatus;
  club_cash: number;
}

export interface Transaction {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: TransactionType;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
}

export interface TransactionSummary {
  total_spent: number;
  total_received: number;
  total_fees: number;
  total_penalties: number;
  total_profit: number;
}

export interface TransactionHistoryResponse {
  data: Transaction[];
  summary: TransactionSummary;
}

export interface TransactionQueryParams {
  type?: string; // Ex: "COMPRA", "VENDA" ou "COMPRA,VENDA"
  player_id?: number;
}

// 5. ESCALAÇÃO (LINEUP)

export interface Lineup {
  club_id: number;
  formation: Formation | null;
  complete: boolean;
  players: Player[];
}

export interface UpdateLineupDTO {
  formation: Formation;
  player_ids: number[];
}

// 6. LIGA, PARTIDAS & DUELOS (LEAGUE & MATCHES)

export interface CreateMatchDTO {
  home_club_id: number;
  away_club_id: number;
}

export interface MatchClubSummary {
  club_id: number;
  club_name: string;
  formation: Formation;
  goals: number;
}

export interface DuelPlayer {
  player_id: number;
  player_name: string;
  position: Position;
  condition: Condition;
  attribute: string; // 'shooting' | 'passing' | 'dribbling' | 'defending'
  value: number;
}

export interface Duel {
  order: number; // 1 a 6
  attacking_club_id: number;
  attacker: DuelPlayer;
  defender: DuelPlayer;
  goal: boolean;
}

export interface Match {
  id: number;
  played_at: string;
  home: MatchClubSummary;
  away: MatchClubSummary;
  result: MatchResult;
  duels?: Duel[]; // Presente na consulta detalhada GET /matches/{id}
}

export interface Standing {
  position: number;
  club_id: number;
  club_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}
