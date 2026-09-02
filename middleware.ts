import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

// next-intl 中间件：根据 URL、cookie、Accept-Language 检测语言并重定向。
// next-intl middleware: detect the locale from URL / cookie / Accept-Language and redirect.
export default createMiddleware(routing);

export const config = {
  // 匹配所有路径，排除 api、_next、静态资源 / Match all paths except api, _next and static files.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
