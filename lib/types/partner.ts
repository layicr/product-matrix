// 合作伙伴模型（名称双语言，logo/url 可选）。
// Partner model (bilingual name; logo/url optional).
export interface Partner {
  name: {zh: string; en: string};
  logo: string | null;
  url: string | null;
}
