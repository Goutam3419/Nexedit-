import { useEffect, useRef, useState } from "react";
import Konva from "konva";
import { Stage, Layer, Rect, Circle, Text, Image as KonvaImage, Group } from "react-konva";
import { useEditorStore, type CanvasObject } from "@/store/editorStore";
import useImage from "@/hooks/useImage";
import { stageRef } from "@/modules/editor/stageRef";

// Step 4 — Editor Advanced. Yeh hook kisi bhi Konva node par
// grayscale/blur/brightness filters lagata hai (Konva ko cache() chahiye filters ke liye).
function useKonvaFilters(nodeRef: React.RefObject<any>, obj: CanvasObject) {
  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const hasFilters = obj.grayscale || obj.blurRadius > 0 || obj.brightness !== 0;
    if (hasFilters) {
      const filters = [];
      if (obj.grayscale) filters.push(Konva.Filters.Grayscale);
      if (obj.blurRadius > 0) filters.push(Konva.Filters.Blur);
      if (obj.brightness !== 0) filters.push(Konva.Filters.Brighten);
      node.cache();
      node.filters(filters);
      node.blurRadius(obj.blurRadius);
      node.brightness(obj.brightness);
    } else {
      node.clearCache();
      node.filters([]);
    }
    node.getLayer()?.batchDraw();
  }, [obj.grayscale, obj.blurRadius, obj.brightness]);
}

// Step 4 — simple mask: circle-clip wrapper. maskShape "none" pe seedha render karta hai.
function MaskWrapper({ obj, children }: { obj: CanvasObject; children: React.ReactNode }) {
  if (obj.maskShape !== "circle") return <>{children}</>;
  const size = obj.width ?? (obj.radius ?? 60) * 2;
  return (
    <Group
      clipFunc={(ctx: any) => {
        const r = size / 2;
        ctx.arc(obj.x + r, obj.y + r, r, 0, Math.PI * 2, false);
      }}
    >
      {children}
    </Group>
  );
}

function ImageObject({
  obj,
  isSelected,
  onClick,
  onDragEnd,
}: {
  obj: CanvasObject;
  isSelected: boolean;
  onClick: (e: any) => void;
  onDragEnd: (e: any) => void;
}) {
  const [img] = useImage(obj.src);
  const nodeRef = useRef<any>(null);
  useKonvaFilters(nodeRef, obj);

  return (
    <MaskWrapper obj={obj}>
      <KonvaImage
        ref={nodeRef}
        image={img}
        x={obj.x}
        y={obj.y}
        width={obj.width}
        height={obj.height}
        crop={obj.crop}
        opacity={obj.opacity}
        rotation={obj.rotation}
        globalCompositeOperation={obj.blendMode}
        draggable={!obj.locked}
        stroke={isSelected ? "#4F7CFF" : undefined}
        strokeWidth={isSelected ? 2 : 0}
        onClick={onClick}
        onDragEnd={onDragEnd}
      />
    </MaskWrapper>
  );
}

// Volume 04 — Infinite Canvas. Ab multi-select, lock, visibility, aur
// Step 4 ke opacity/rotation/blend/filters/mask/crop sab support karta hai.
export default function Canvas() {
  const objects = useEditorStore((s) => s.objects);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const selectObject = useEditorStore((s) => s.selectObject);
  const updateObject = useEditorStore((s) => s.updateObject);
  const clearSelection = useEditorStore((s) => s.clearSelection);
  const designWidth = useEditorStore((s) => s.designWidth);
  const designHeight = useEditorStore((s) => s.designHeight);

  // Step 10 — Magic Eraser drawing mode
  const eraseMode = useEditorStore((s) => s.eraseMode);
  const setEraseRect = useEditorStore((s) => s.setEraseRect);
  const [drawingRect, setDrawingRect] = useState<{ x: number; y: number; width: number; height: number } | null>(
    null
  );
  const drawStart = useRef<{ x: number; y: number } | null>(null);

  function handleStageMouseDown(e: any) {
    if (eraseMode) {
      const pos = e.target.getStage().getPointerPosition();
      drawStart.current = pos;
      setDrawingRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
      return;
    }
    if (e.target === e.target.getStage()) clearSelection();
  }

  function handleStageMouseMove(e: any) {
    if (!eraseMode || !drawStart.current) return;
    const pos = e.target.getStage().getPointerPosition();
    setDrawingRect({
      x: Math.min(drawStart.current.x, pos.x),
      y: Math.min(drawStart.current.y, pos.y),
      width: Math.abs(pos.x - drawStart.current.x),
      height: Math.abs(pos.y - drawStart.current.y),
    });
  }

  function handleStageMouseUp() {
    if (!eraseMode) return;
    drawStart.current = null;
    if (drawingRect && drawingRect.width > 4 && drawingRect.height > 4) {
      setEraseRect(drawingRect);
    }
  }

  return (
    <Stage
      ref={(node) => {
        stageRef.current = node;
      }}
      width={window.innerWidth - 280 - 80 - 260}
      height={window.innerHeight - 56}
      className="bg-[#1A1E26]"
      onMouseDown={handleStageMouseDown}
      onMouseMove={handleStageMouseMove}
      onMouseUp={handleStageMouseUp}
    >
      <Layer>
        {/* Design page bounds — Magic Resize isi width/height ko target karta hai */}
        <Rect
          x={0}
          y={0}
          width={designWidth}
          height={designHeight}
          stroke="#3D63E0"
          strokeWidth={1}
          dash={[6, 4]}
          listening={false}
        />

        {objects.map((obj) => {
          if (!obj.visible) return null;
          const isSelected = selectedIds.includes(obj.id);
          const handleClick = (e: any) => selectObject(obj.id, e.evt.shiftKey);
          const handleDragEnd = (e: any) =>
            updateObject(obj.id, { x: e.target.x(), y: e.target.y() });

          if (obj.type === "rect") {
            return (
              <MaskWrapper key={obj.id} obj={obj}>
                <Rect
                  x={obj.x}
                  y={obj.y}
                  width={obj.width}
                  height={obj.height}
                  fill={obj.fill}
                  opacity={obj.opacity}
                  rotation={obj.rotation}
                  globalCompositeOperation={obj.blendMode}
                  draggable={!obj.locked}
                  stroke={isSelected ? "#4F7CFF" : undefined}
                  strokeWidth={isSelected ? 2 : 0}
                  onClick={handleClick}
                  onDragEnd={handleDragEnd}
                />
              </MaskWrapper>
            );
          }
          if (obj.type === "circle") {
            return (
              <Circle
                key={obj.id}
                x={obj.x}
                y={obj.y}
                radius={obj.radius}
                fill={obj.fill}
                opacity={obj.opacity}
                rotation={obj.rotation}
                globalCompositeOperation={obj.blendMode}
                draggable={!obj.locked}
                stroke={isSelected ? "#4F7CFF" : undefined}
                strokeWidth={isSelected ? 2 : 0}
                onClick={handleClick}
                onDragEnd={handleDragEnd}
              />
            );
          }
          if (obj.type === "text") {
            return (
              <Text
                key={obj.id}
                x={obj.x}
                y={obj.y}
                text={obj.text}
                fontSize={obj.fontSize}
                fill={obj.fill}
                opacity={obj.opacity}
                rotation={obj.rotation}
                globalCompositeOperation={obj.blendMode}
                draggable={!obj.locked}
                onClick={handleClick}
                onDragEnd={handleDragEnd}
              />
            );
          }
          if (obj.type === "image") {
            return (
              <ImageObject
                key={obj.id}
                obj={obj}
                isSelected={isSelected}
                onClick={handleClick}
                onDragEnd={handleDragEnd}
              />
            );
          }
          return null;
        })}

        {/* Step 10 — Magic Eraser: user jo area drag karke banata hai woh yahan dikhta hai */}
        {eraseMode && drawingRect && (
          <Rect
            x={drawingRect.x}
            y={drawingRect.y}
            width={drawingRect.width}
            height={drawingRect.height}
            stroke="#FF3D3D"
            strokeWidth={2}
            dash={[4, 4]}
            fill="rgba(255,61,61,0.15)"
            listening={false}
          />
        )}
      </Layer>
    </Stage>
  );
}
