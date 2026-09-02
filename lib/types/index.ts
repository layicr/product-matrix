// 领域模型统一出口 / Barrel: re-export all domain types from one entry point.
// 保持 `@/lib/types` 这一导入路径不变，下游文件无需改动。
// Keeps the `@/lib/types` import path stable so no downstream file needs to change.
export type {ProductStatus, ProductColor, Product} from "./product";
export type {TeamMember} from "./team";
export type {Partner} from "./partner";
