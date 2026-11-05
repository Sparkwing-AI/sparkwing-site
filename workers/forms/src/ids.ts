/** One row, updated in place. SQLite serialises the increment, so two saves cannot take the same number. */
export const allocateSql = 'UPDATE lead_numbers SET last_assigned = last_assigned + 1 WHERE id = 1 RETURNING last_assigned';

export function formatLeadId(n: number): string {
  if (!Number.isInteger(n) || n < 1) throw new Error('bad lead number');
  return `L-${String(n).padStart(4, '0')}`;
}

export async function allocateLeadId(db: D1Database): Promise<string> {
  const row = await db.prepare(allocateSql).first<{ last_assigned: number }>();
  if (!row) throw new Error('lead numbers are not ready');
  return formatLeadId(row.last_assigned);
}
