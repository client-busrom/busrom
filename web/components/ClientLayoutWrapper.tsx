"use client";

import { SWRConfig } from 'swr';
import type { PreloaderConfigData } from "@/lib/api/preloader-config";

// 定义 SWR 全局 fetcher
const fetcher = (resource: string) => fetch(resource).then(res => {
  if (!res.ok) throw new Error('An error occurred while fetching the data.');
  return res.json();
});

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
  preloaderConfig: PreloaderConfigData;
}

// 临时禁用 Preloader 以测试页面本身的性能
export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  return (
    <SWRConfig value={{ fetcher }}>
      {children}
    </SWRConfig>
  );
}
