import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

// 类型安全的导航 API，自动处理 [lang] 前缀。
// Type-safe navigation API that automatically handles the [lang] prefix.
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
