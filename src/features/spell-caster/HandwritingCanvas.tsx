import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';

const INK_COLOR = '#1a1a2e';
const BASELINE_Y = 0.72;
const MIN_WIDTH = 4;
const MAX_WIDTH = 8;

export interface HandwritingCanvasRef {
  getDataUrl: () => string;
  clear: () => void;
}

interface HandwritingCanvasProps {
  width: number;
  height: number;
  className?: string;
  /** When true, draw a light dotted grid (e.g. for model/diagram steps). Otherwise single baseline. */
  showGrid?: boolean;
}

function drawBaseline(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const baselineY = h * BASELINE_Y;
  ctx.strokeStyle = 'rgba(26, 26, 46, 0.35)';
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(0, baselineY);
  ctx.lineTo(w, baselineY);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const spacing = 24;
  ctx.strokeStyle = 'rgba(26, 26, 46, 0.12)';
  ctx.lineWidth = 1;
  ctx.setLineDash([2, 4]);
  for (let x = 0; x <= w; x += spacing) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y <= h; y += spacing) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

export const HandwritingCanvas = forwardRef<HandwritingCanvasRef, HandwritingCanvasProps>(
  function HandwritingCanvas({ width, height, showGrid = false }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const lastPoint = useRef<{ x: number; y: number } | null>(null);
    const showGridRef = useRef(showGrid);
    showGridRef.current = showGrid;

    const dpr = Math.min(2, typeof window !== 'undefined' ? window.devicePixelRatio : 2);
    const canvasWidth = Math.round(width * dpr);
    const canvasHeight = Math.round(height * dpr);

    const getPoint = useCallback(
      (e: React.PointerEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        const scaleX = rect.width / canvas.width;
        const scaleY = rect.height / canvas.height;
        return {
          x: (e.clientX - rect.left) / scaleX,
          y: (e.clientY - rect.top) / scaleY,
          pressure: e.pressure ?? 0.5,
        };
      },
      []
    );

    const draw = useCallback(
      (from: { x: number; y: number }, to: { x: number; y: number }, pressure: number) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const lineWidth = MIN_WIDTH + (MAX_WIDTH - MIN_WIDTH) * Math.min(1, pressure + 0.3);
        ctx.strokeStyle = INK_COLOR;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      },
      []
    );

    const clear = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      if (showGridRef.current) drawGrid(ctx, canvas.width, canvas.height);
      else drawBaseline(ctx, canvas.width, canvas.height);
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        getDataUrl: () => canvasRef.current?.toDataURL('image/png') ?? '',
        clear,
      }),
      [clear]
    );

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      if (showGrid) drawGrid(ctx, canvasWidth, canvasHeight);
      else drawBaseline(ctx, canvasWidth, canvasHeight);
    }, [canvasWidth, canvasHeight, showGrid]);

    const handlePointerDown = useCallback(
      (e: React.PointerEvent) => {
        e.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.setPointerCapture(e.pointerId);
        const pt = getPoint(e);
        if (!pt) return;
        isDrawing.current = true;
        lastPoint.current = { x: pt.x, y: pt.y };
      },
      [getPoint]
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent) => {
        if (!isDrawing.current || !lastPoint.current) return;
        const pt = getPoint(e);
        if (!pt) return;
        draw(lastPoint.current, { x: pt.x, y: pt.y }, pt.pressure);
        lastPoint.current = { x: pt.x, y: pt.y };
      },
      [getPoint, draw]
    );

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
      canvasRef.current?.releasePointerCapture(e.pointerId);
      isDrawing.current = false;
      lastPoint.current = null;
    }, []);

    const handlePointerCancel = useCallback(() => {
      isDrawing.current = false;
      lastPoint.current = null;
    }, []);

    return (
      <div className="relative rounded-2xl overflow-hidden bg-white border-2 border-slate-500 shadow-inner">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          style={{ width, height, touchAction: 'none', display: 'block' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerCancel}
          className="cursor-crosshair"
          aria-label={showGrid ? 'Drawing area for your model or diagram' : 'Writing area: draw with your stylus or finger'}
        />
      </div>
    );
  }
);
