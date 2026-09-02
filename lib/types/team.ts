// 团队成员模型（双语言字段以 { zh, en } 形式存储）。
// Team member model (bilingual fields stored as { zh, en }).
export interface TeamMember {
  name: {zh: string; en: string};
  role: {zh: string; en: string};
  avatar: {zh: string; en: string};
  bg: string;
}
