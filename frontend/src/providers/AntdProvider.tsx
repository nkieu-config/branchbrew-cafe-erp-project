"use client"

import { ConfigProvider } from 'antd';
import { useTheme } from 'next-themes';
import React from 'react';
import { getAntdThemeConfig } from '@/lib/theme';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <ConfigProvider theme={getAntdThemeConfig(resolvedTheme)}>
      {children}
    </ConfigProvider>
  );
}
