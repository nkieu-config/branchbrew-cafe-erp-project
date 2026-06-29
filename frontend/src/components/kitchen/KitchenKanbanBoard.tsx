"use client";

import { ReactNode } from "react";
import { CheckCircle2, Clock, Lock, PackageOpen, PlayCircle } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { ProductionOrder, Ingredient } from "@/types/api";
import { formatDate } from "@/lib/intl-date";
import { formatBaht } from "@/lib/money";
import { hubAccentIconClass } from "@/lib/theme/hub-accent";
import { kanbanCardClassName, kanbanCompletedCardClassName, kanbanColumnClassName, kanbanColumnHeaderClassName, kanbanMetaChipClassName, kanbanOrderBadgeClassName, kitchenKanbanBoardClassName, productionColumnTone } from "@/lib/theme/hub-kitchen";
import { metricValueClassName } from "@/lib/theme/metric";
import { text } from "@/lib/theme/surface";
import { typeHeadingClassName, typeMicroClassName, typeUiLabelClassName } from "@/lib/theme/typography";
import { StatusTone } from "@/lib/theme/status";
import { cn } from "@/lib/utils";

export type ProductionOrderWithTarget = ProductionOrder & { targetIngredient: Ingredient };

function KanbanColumn({
  id,
  title,
  icon,
  tone,
  emptyHint,
  children,
}: {
  id: string;
  title: string;
  icon: ReactNode;
  tone: StatusTone;
  emptyHint: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const isEmpty = !children || (Array.isArray(children) && children.length === 0);

  return (
    <div ref={setNodeRef} className={kanbanColumnClassName(isOver)} role="region" aria-label={title}>
      <div className={kanbanColumnHeaderClassName(tone)}>
        <div className="flex items-center gap-2">
          {icon}
          <span>{title}</span>
        </div>
      </div>
      <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[280px] sm:min-h-[400px] lg:min-h-[500px]">
        {isEmpty ? (
          <p className={cn("text-sm text-center py-8 px-2", text.muted)}>{emptyHint}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function KanbanCard({ order, isOverlay = false }: { order: ProductionOrderWithTarget; isOverlay?: boolean }) {
  const isCompleted = order.status === "COMPLETED";
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    data: { order },
    disabled: isCompleted,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        kanbanCardClassName(isOverlay),
        isCompleted && kanbanCompletedCardClassName(),
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={kanbanOrderBadgeClassName()}>{order.orderNumber}</span>
        {isCompleted ? (
          <span className={typeUiLabelClassName(cn(typeMicroClassName("uppercase"), text.muted))}>
            <Lock className="w-3 h-3" aria-hidden />
            Locked
          </span>
        ) : null}
      </div>
      <div className={typeHeadingClassName("flex items-center gap-2 mb-1")}>
        <PackageOpen className={hubAccentIconClass("kitchen", "w-4 h-4 shrink-0")} />
        <span className="truncate">{order.targetIngredient?.name}</span>
      </div>
      <div className={typeHeadingClassName(cn("text-sm", text.secondary))}>
        {order.quantityToProduce}{" "}
        <span className={typeHeadingClassName(cn("text-xs", text.muted))}>{order.targetIngredient?.unit}</span>
      </div>
      {order.plannedStartDate && (
        <div className={kanbanMetaChipClassName()}>
          <Clock className="w-3 h-3" />
          {formatDate(order.plannedStartDate)}
        </div>
      )}
      {isCompleted && order.actualCost != null && (
        <div className={typeUiLabelClassName(cn("mt-2 text-xs tabular-nums", metricValueClassName("emerald")))}>
          Actual cost {formatBaht(order.actualCost)}
        </div>
      )}
    </div>
  );
}

type KitchenKanbanBoardProps = {
  plannedOrders: ProductionOrderWithTarget[];
  inProgressOrders: ProductionOrderWithTarget[];
  completedOrders: ProductionOrderWithTarget[];
  activeOrder: ProductionOrderWithTarget | null;
  onDragStart: (event: DragStartEvent) => void;
  onDragEnd: (event: DragEndEvent) => void;
};

export function KitchenKanbanBoard({
  plannedOrders,
  inProgressOrders,
  completedOrders,
  activeOrder,
  onDragStart,
  onDragEnd,
}: KitchenKanbanBoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <div className={kitchenKanbanBoardClassName()}>
        <KanbanColumn
          id="PLANNED"
          title="Planned"
          icon={<Clock className="w-5 h-5" />}
          tone={productionColumnTone("PLANNED")}
          emptyHint="No planned orders — create one to start production."
        >
          {plannedOrders.map((o) => (
            <KanbanCard key={o.id} order={o} />
          ))}
        </KanbanColumn>

        <KanbanColumn
          id="IN_PROGRESS"
          title="In Progress"
          icon={<PlayCircle className="w-5 h-5" />}
          tone={productionColumnTone("IN_PROGRESS")}
          emptyHint="Drag a planned order here when production starts."
        >
          {inProgressOrders.map((o) => (
            <KanbanCard key={o.id} order={o} />
          ))}
        </KanbanColumn>

        <KanbanColumn
          id="COMPLETED"
          title="Completed"
          icon={<CheckCircle2 className="w-5 h-5" />}
          tone={productionColumnTone("COMPLETED")}
          emptyHint="Completed batches appear here with actual cost."
        >
          {completedOrders.map((o) => (
            <KanbanCard key={o.id} order={o} />
          ))}
        </KanbanColumn>
      </div>
      <DragOverlay>{activeOrder ? <KanbanCard order={activeOrder} isOverlay /> : null}</DragOverlay>
    </DndContext>
  );
}
