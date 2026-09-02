import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// 合并 className 的工具：clsx 处理条件类名，tailwind-merge 解决冲突。
// Merge class names: clsx for conditional classes, tailwind-merge to resolve conflicts.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
