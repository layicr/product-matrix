import {unstable_cache} from "next/cache";
import {getDb} from "../db";
import type {TeamMember} from "@/lib/types";
import {localizedField} from "./row-mapper";

// 单行记录的原始形态 / Raw row shape.
type TeamRow = Record<string, unknown>;

// 将数据库行映射回 TeamMember（把 _zh/_en 列重新组合为 { zh, en } 结构）。
// Map a DB row back to a TeamMember, re-grouping the _zh/_en columns into { zh, en }.
function rowToTeam(row: TeamRow): TeamMember {
  return {
    name: localizedField(row, "name"),
    role: localizedField(row, "role"),
    avatar: localizedField(row, "avatar"),
    bg: String(row.bg),
  };
}

async function fetchTeam(): Promise<TeamMember[]> {
  const db = getDb();
  const result = await db.execute("SELECT * FROM team ORDER BY ord ASC");
  return result.rows.map((row) => rowToTeam(row as TeamRow));
}

/** 从 libSQL 读取核心团队（按 ord 升序，缓存 60s）/ Fetch the core team ordered by display order (cached 60s). */
export const getTeam = unstable_cache(fetchTeam, ["team"], {revalidate: 60});
