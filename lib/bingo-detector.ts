export interface CompletedLine {
  type: 'row' | 'column' | 'diagonal';
  index: number; // 0-based index for row/column, 0 = main, 1 = anti-diagonal
}

export interface BingoStatus {
  isBlackout: boolean;
  hasX: boolean;
  completedLines: CompletedLine[];
  lineCount: number;
}

/**
 * Detects completed lines and bingo states for any arbitrary N×N grid size.
 */
export function detectBingo(markedPositions: number[], gridSize: number): BingoStatus {
  const markedSet = new Set(markedPositions);
  const completedLines: CompletedLine[] = [];
  
  // 1. Check Rows
  for (let r = 0; r < gridSize; r++) {
    let rowComplete = true;
    for (let c = 0; c < gridSize; c++) {
      if (!markedSet.has(r * gridSize + c)) {
        rowComplete = false;
        break;
      }
    }
    if (rowComplete) {
      completedLines.push({ type: 'row', index: r });
    }
  }

  // 2. Check Columns
  for (let c = 0; c < gridSize; c++) {
    let colComplete = true;
    for (let r = 0; r < gridSize; r++) {
      if (!markedSet.has(r * gridSize + c)) {
        colComplete = false;
        break;
      }
    }
    if (colComplete) {
      completedLines.push({ type: 'column', index: c });
    }
  }

  // 3. Check Main Diagonal (Top-Left to Bottom-Right)
  let mainDiagComplete = true;
  for (let i = 0; i < gridSize; i++) {
    if (!markedSet.has(i * gridSize + i)) {
      mainDiagComplete = false;
      break;
    }
  }
  if (mainDiagComplete) {
    completedLines.push({ type: 'diagonal', index: 0 });
  }

  // 4. Check Anti Diagonal (Top-Right to Bottom-Left)
  let antiDiagComplete = true;
  for (let i = 0; i < gridSize; i++) {
    if (!markedSet.has(i * gridSize + (gridSize - 1 - i))) {
      antiDiagComplete = false;
      break;
    }
  }
  if (antiDiagComplete) {
    completedLines.push({ type: 'diagonal', index: 1 });
  }

  // 5. Special States
  const totalCells = gridSize * gridSize;
  const isBlackout = markedSet.size >= totalCells;
  
  const hasX = mainDiagComplete && antiDiagComplete;

  return {
    isBlackout,
    hasX,
    completedLines,
    lineCount: completedLines.length
  };
}
