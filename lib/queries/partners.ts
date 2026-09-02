import {unstable_cache} from "next/cache";
import {getDb} from "../db";
import type {Partner} from "@/lib/types";
import {localizedField, nullableField} from "./row-mapper";

// 单行记录的原始形态 / Raw row shape.
type PartnerRow = Record<string, unknown>;

// 将数据库行映射回 Partner（把 _zh/_en 列重新组合为 { zh, en } 结构）。
// Map a DB row back to a Partner, re-grouping the _zh/_en columns into { zh, en }.
function rowToPartner(row: PartnerRow): Partner {
  return {
    name: localizedField(row, "name"),
    logo: nullableField(row, "logo"),
    url: nullableField(row, "url"),
  };
}

async function fetchPartners(): Promise<Partner[]> {
  const db = getDb();
  const result = await db.execute("SELECT * FROM partners ORDER BY ord ASC");
  return result.rows.map((row) => rowToPartner(row as PartnerRow));
}

/** 从 libSQL 读取合作伙伴（按 ord 升序，缓存 60s）/ Fetch partners ordered by display order (cached 60s). */
export const getPartners = unstable_cache(fetchPartners, ["partners"], {revalidate: 60});
