'use client';

import React from 'react';
import BingoCell from '@/components/ui/BingoCell';

interface CellData {
  id: string;
  position: number;
  content: string;
  is_free: boolean;
  is_marked: boolean;
}

interface BingoGridProps {
  cells: CellData[];
  gridSize: number;
  themeColor: string;
  markedPositions: number[];
  onCellToggle: (position: number) => void;
  isEditingMode?: boolean;
  onCellEdit?: (position: number, newContent: string) => void;
  cellImages?: Record<number, string>;
  onCellDoubleClick?: (position: number) => void;
}

export default function BingoGrid({
  cells,
  gridSize,
  themeColor,
  markedPositions,
  onCellToggle,
  isEditingMode = false,
  onCellEdit,
  cellImages = {},
  onCellDoubleClick
}: BingoGridProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
      gap: gridSize > 12 ? '3px' : gridSize > 8 ? '5px' : gridSize > 5 ? '8px' : '12px',
      width: '100%',
      maxWidth: gridSize > 12 ? '850px' : gridSize > 8 ? '750px' : '650px',
      margin: '0 auto',
      background: 'rgba(0, 0, 0, 0.2)',
      padding: gridSize > 12 ? '8px' : gridSize > 8 ? '12px' : '16px',
      borderRadius: '24px',
      border: '1px solid var(--border-light)',
      boxShadow: 'inset 0 4px 30px rgba(0,0,0,0.2)'
    }}>
      {cells.map((cell) => {
        const isMarked = markedPositions.includes(cell.position);
        return (
          <BingoCell
            key={cell.id || cell.position}
            content={cell.content}
            isMarked={isMarked}
            isFree={cell.is_free}
            themeColor={themeColor}
            onClick={() => onCellToggle(cell.position)}
            isEditingMode={isEditingMode}
            onEdit={(newContent) => onCellEdit && onCellEdit(cell.position, newContent)}
            gridSize={gridSize}
            bgImageUrl={cellImages[cell.position] || null}
            onDoubleClick={() => onCellDoubleClick && onCellDoubleClick(cell.position)}
          />
        );
      })}
    </div>
  );
}
