export interface JwtPayload {
  telegram_id: number;
  sub: number;
  roles: string[];
}
