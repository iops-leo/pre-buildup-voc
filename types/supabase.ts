/**
 * Supabase Database Types
 *
 * 테이블 생성 SQL:
 *
 * ```sql
 * -- Enable realtime
 * alter publication supabase_realtime add table raid_rooms;
 *
 * -- Create raid_rooms table
 * create table raid_rooms (
 *   id uuid default gen_random_uuid() primary key,
 *   code text unique not null,
 *   host_id text not null,
 *   monster_id text not null,
 *   phase text not null default 'waiting',
 *   monster_hp integer not null,
 *   monster_max_hp integer not null,
 *   combo integer default 0,
 *   start_time bigint,
 *   players jsonb not null default '[]'::jsonb,
 *   damage_log jsonb not null default '[]'::jsonb,
 *   created_at timestamp with time zone default timezone('utc'::text, now()) not null,
 *   updated_at timestamp with time zone default timezone('utc'::text, now()) not null
 * );
 *
 * -- Create index for faster lookups
 * create index raid_rooms_code_idx on raid_rooms(code);
 *
 * -- Enable RLS
 * alter table raid_rooms enable row level security;
 *
 * -- Allow all operations for now (you can restrict later)
 * create policy "Allow all operations" on raid_rooms
 *   for all using (true) with check (true);
 *
 * -- Auto-update updated_at
 * create or replace function update_updated_at_column()
 * returns trigger as $$
 * begin
 *   new.updated_at = now();
 *   return new;
 * end;
 * $$ language plpgsql;
 *
 * create trigger update_raid_rooms_updated_at
 *   before update on raid_rooms
 *   for each row execute function update_updated_at_column();
 *
 * -- Auto-delete old rooms (optional, run periodically)
 * -- delete from raid_rooms where created_at < now() - interval '24 hours';
 * ```
 */

export type RoomPhase = 'waiting' | 'battle' | 'result';

export interface PlayerConfig {
  subject: string;
  category: string;
  difficulty: string;
}

export interface RaidPlayer {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  config: PlayerConfig | null;
  damageDealt: number;
  correctAnswers: number;
  totalAnswers: number;
}

export interface DamageEvent {
  playerId: string;
  damage: number;
  timestamp: number;
}

export interface RaidRoomRow {
  id: string;
  code: string;
  host_id: string;
  monster_id: string;
  phase: RoomPhase;
  monster_hp: number;
  monster_max_hp: number;
  combo: number;
  start_time: number | null;
  players: RaidPlayer[];
  damage_log: DamageEvent[];
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      raid_rooms: {
        Row: RaidRoomRow;
        Insert: Omit<RaidRoomRow, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<RaidRoomRow, 'id' | 'created_at'>>;
      };
    };
  };
}
