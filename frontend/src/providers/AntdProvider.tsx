"use client"

import { ConfigProvider, theme } from 'antd';
import { useTheme } from 'next-themes';
import React from 'react';

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <ConfigProvider
      theme={{
        algorithm: resolvedTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          fontFamily: 'inherit',
          colorPrimary: '#10b981', // Tailwind Emerald 500
          colorBgContainer: resolvedTheme === 'dark' ? '#0f172a' : '#ffffff',
          borderRadius: 12,
          controlHeight: 40,
        },
        components: {
          Button: {
            controlHeight: 40,
            borderRadius: 12,
          },
          Input: {
            controlHeight: 40,
            borderRadius: 12,
          },
          Select: {
            controlHeight: 40,
            borderRadius: 12,
          },
          InputNumber: {
            controlHeight: 40,
            borderRadius: 12,
          },
          DatePicker: {
            controlHeight: 40,
            borderRadius: 12,
          }
        }
      }}
    >
      {children}
    </ConfigProvider>
  );
}
