// 关于我们页面（团队 / 联系 / 反馈），服务端从 libSQL 读取团队数据。
// About page (team / contact / feedback); team data is fetched from libSQL on the server.
import {Globe} from "lucide-react";
import type {ReactNode} from "react";
import {getTranslations} from "next-intl/server";
import Navbar from "@/components/navbar";
import {siteConfig} from "@/lib/site-config";
import {getTeam} from "@/lib/queries/team";
import {getPartners} from "@/lib/queries/partners";
import {getActiveProductCount} from "@/lib/queries/products";
import FloatingActions from "@/components/floating-actions";
import {buildAboutStats} from "@/lib/about-stats";
import {safeQuery} from "@/lib/safe-query";
import type {Metadata} from "next";
import {isLocale, type Locale} from "@/i18n/routing";
import {localeAlternates} from "@/lib/seo";

// lucide-react 1.x 移除了品牌图标 Github，这里用内联 SVG 组件保留原视觉。
function Github({className}: {className?: string}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

type ContactIcon = "github" | "twitter" | "globe";

interface Contact {
  icon: ContactIcon;
  labelKey: string;
  value: string;
  url: string;
  bg: string;
  rotate: string;
}

const contacts: Contact[] = [
  {
    icon: "github",
    labelKey: "about.contact1Label",
    value: siteConfig.github.replace("https://", ""),
    url: siteConfig.github,
    bg: "bg-sticky-yellow",
    rotate: "-rotate-0.5",
  },
  {
    icon: "twitter",
    labelKey: "about.contact2Label",
    value: siteConfig.twitter.replace("https://", ""),
    url: siteConfig.twitter,
    bg: "bg-sticky-blue",
    rotate: "rotate-0.5",
  },
  {
    icon: "globe",
    labelKey: "about.contact3Label",
    value: siteConfig.website.replace("https://", ""),
    url: siteConfig.website,
    bg: "bg-sticky-pink",
    rotate: "-rotate-[0.3deg]",
  },
];

const iconMap: Record<ContactIcon, ReactNode> = {
  github: <Github className="w-5 h-5" />,
  twitter: <span className="font-caveat text-lg font-bold leading-none">𝕏</span>,
  globe: <Globe className="w-5 h-5" />,
};

// 按语言生成 metadata（canonical 需带语言前缀，否则会继承布局的 /{lang}）。
// Per-locale metadata (canonical must carry the locale prefix, else it inherits /{lang}).
export async function generateMetadata({
  params,
}: {
  params: Promise<{lang: string}>;
}): Promise<Metadata> {
  const {lang} = await params;
  // 用 isLocale 收窄，与其他页面保持一致 / Narrow with isLocale, consistent with other pages.
  const locale = isLocale(lang) ? lang : "zh";
  const t = await getTranslations({locale, namespace: "about"});

  return {
    // 标题按语言本地化，此前硬编码为英文 "About"。
    // Title is localized; previously hardcoded to English "About".
    title: t("title"),
    // 补 description：此前缺失，导致搜索结果摘录为空。
    // Add the missing description — search snippets were empty without it.
    description: siteConfig.aboutSub[locale],
    alternates: localeAlternates(locale, "/about"),
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{lang: string}>;
}) {
  const {lang} = await params;
  const locale: Locale = isLocale(lang) ? lang : "zh";
  const t = await getTranslations({locale});
  // 三处查询均加兜底：任一失败只影响对应区块，不会整页 500。
  // All three queries are guarded: a failure only degrades its own section.
  const team = await safeQuery("getTeam", getTeam, []);
  const partners = await safeQuery("getPartners", getPartners, []);
  const productCount = await safeQuery(
    "getActiveProductCount",
    getActiveProductCount,
    0,
  );

  // 统计项构建抽为纯函数（便于单测），合作伙伴为 0 时隐藏该项。
  // Stat building is a pure function (easy to unit test); the partners stat is hidden at 0.
  const stats = buildAboutStats(productCount, partners.length);

  return (
    <main className="min-h-screen notebook-bg">
      <Navbar />

      {/* Hero / 首屏标题区 / Hero section */}
      <section className="text-center px-6 md:px-10 py-12 md:py-14 relative">
        <h1 className="font-hand text-5xl md:text-7xl lg:text-8xl inline-block -rotate-2 relative">
          {t("about.title")}
        </h1>
        <p className="font-script text-base md:text-xl lg:text-2xl max-w-2xl mx-auto mt-6 text-ink-light leading-relaxed rotate-0.5">
          {siteConfig.aboutSub[locale]}
        </p>
      </section>

      {/* 数据统计 / Stats —— 1 项（无合作伙伴）时单列窄版居中，2 项时两列 */}
      <div className={`grid mx-auto px-6 md:px-8 ${stats.length === 1 ? "grid-cols-1 max-w-xs" : "grid-cols-2 max-w-md"}`}>
        {stats.map((stat, i) => (
          <div
            key={i}
            className="text-center py-6 px-4 border-2 border-dashed border-black/15"
          >
            <div className="font-caveat text-4xl md:text-5xl font-bold leading-none">
              {stat.num}
            </div>
            <div className="font-script text-sm md:text-base text-ink-light mt-1.5">
              {t(stat.labelKey)}
            </div>
          </div>
        ))}
      </div>

      {/* 合作伙伴 / Partners —— 无合作伙伴时隐藏整块 */}
      {partners.length > 0 && (
      <section className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-14">
        <h2 className="font-hand text-2xl md:text-3xl text-center mb-8 -rotate-0.5">
          {t("about.partnersTitle")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {partners.map((p, i) => {
            const card = (
              <div
                className={`text-center p-6 border-2 border-dashed border-ink bg-white/40 ${
                  i % 2 === 0 ? "-rotate-1" : "rotate-1"
                }`}
              >
                <div className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-3 border-[2.5px] border-ink rounded-full flex items-center justify-center font-hand text-2xl overflow-hidden bg-white/60">
                  {p.logo ? (
                    <img src={p.logo} alt={p.name[locale]} className="w-full h-full object-cover" />
                  ) : (
                    p.name[locale].slice(0, 1)
                  )}
                </div>
                <div className="font-hand text-lg">{p.name[locale]}</div>
              </div>
            );
            return p.url ? (
              <a
                key={i}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:rotate-0 hover:scale-[1.03] hover:bg-white/80 transition-all duration-200 cursor-pointer block"
              >
                {card}
              </a>
            ) : (
              <div key={i}>{card}</div>
            );
          })}
        </div>
      </section>
      )}

      {/* 核心团队 / Core team */}
      <section className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-14">
        <h2 className="font-hand text-2xl md:text-3xl text-center mb-8 -rotate-0.5">
          {t("about.teamTitle")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {team.map((member, i) => (
            <div
              key={i}
              className={`text-center p-6 border-2 border-dashed border-ink bg-white/40 ${
                i % 2 === 0 ? "-rotate-1" : "rotate-1"
              }`}
            >
              <div
                className={`w-16 h-16 border-[2.5px] border-ink rounded-full mx-auto mb-3 flex items-center justify-center font-hand text-2xl ${member.bg}`}
              >
                {member.avatar[locale]}
              </div>
              <h3 className="font-hand text-lg mb-1">{member.name[locale]}</h3>
              <div className="font-caveat text-sm text-ink-light">
                {member.role[locale]}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 联系我们 / Contact us */}
      <section className="max-w-4xl mx-auto px-6 md:px-10 py-12 md:py-14">
        <h2 className="font-hand text-2xl md:text-3xl text-center mb-8 -rotate-0.5">
          {t("about.contactTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {contacts.map((c, i) => (
            <a
              key={i}
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-start gap-3.5 p-5 border-2 border-ink bg-white/50 ${c.rotate} hover:rotate-0 hover:scale-[1.03] hover:bg-white/80 transition-all duration-200 cursor-pointer`}
            >
              <div
                className={`w-10 h-10 border-2 border-ink flex items-center justify-center flex-shrink-0 ${c.bg}`}
              >
                {iconMap[c.icon]}
              </div>
              <div>
                <h3 className="font-caveat text-sm font-semibold text-ink-light mb-0.5">
                  {t(c.labelKey)}
                </h3>
                <p className="font-hand text-base md:text-lg underline-offset-2 hover:underline">
                  {c.value}
                </p>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* 页脚 / Footer */}
      <footer className="px-6 md:px-10 py-7 text-center border-t-2 border-dashed border-black/15">
        <p className="font-caveat text-sm text-ink-light/60 mt-2">©{siteConfig.author}</p>
      </footer>

      <FloatingActions />
    </main>
  );
}
