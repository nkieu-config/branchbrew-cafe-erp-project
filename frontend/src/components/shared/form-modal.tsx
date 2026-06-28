import React from 'react';
import { Modal } from 'antd';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormModalProps {
  title: string;
  icon?: LucideIcon;
  /** Optional icon color class (defaults to indigo metric). */
  iconClassName?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number | string;
  destroyOnHidden?: boolean;
  forceRender?: boolean;
}

export function FormModal({
  title,
  icon: Icon,
  iconClassName = "text-[var(--metric-indigo)]",
  isOpen,
  onClose,
  children,
  width = 800,
  destroyOnHidden = false,
  forceRender = true,
}: FormModalProps) {
  return (
    <Modal
      title={
        <div className="text-lg font-bold flex items-center gap-2 mb-2">
          {Icon && <Icon className={cn("w-5 h-5", iconClassName)} />}
          {title}
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={width}
      forceRender={forceRender}
      destroyOnHidden={destroyOnHidden}
      className="dark:[&_.ant-modal-content]:bg-[var(--table-container-bg)] [&_.ant-modal-content]:rounded-2xl"
    >
      <div className="mt-4">
        {children}
      </div>
    </Modal>
  );
}
