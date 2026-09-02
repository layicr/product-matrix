// 测试工具：用指定语言与翻译包裹组件，模拟 next-intl Provider 上下文。
// Test helper: render a component wrapped in NextIntlClientProvider for the given locale.
import {createElement, type ReactElement} from "react";
import {render, type RenderResult} from "@testing-library/react";
import {NextIntlClientProvider} from "next-intl";
import en from "@/messages/en.json";
import zh from "@/messages/zh.json";

type Messages = Record<string, unknown>;

const messagesMap: Record<string, Messages> = {zh, en};

/** 用指定语言与翻译包裹组件渲染，模拟 next-intl Provider 上下文 / Render a component wrapped in NextIntlClientProvider for the given locale. */
export function renderWithIntl(
  ui: ReactElement,
  {locale = "zh", messages}: {locale?: "zh" | "en"; messages?: Messages} = {},
): RenderResult {
  const msgs = messages ?? messagesMap[locale];
  return render(
    createElement(
      NextIntlClientProvider,
      {locale, messages: msgs},
      ui,
    ),
  );
}
