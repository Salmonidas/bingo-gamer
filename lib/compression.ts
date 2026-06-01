/**
 * Compresses and decompresses BingoCard configurations for sharing via URL hash.
 * Uses native CompressionStream (GZIP) and a dynamic prefix dictionary for image URLs.
 */

interface CompressedCard {
  t: string;               // Title
  e: string | null;        // Event Name
  c: string;               // Theme Color (hex)
  s: number;               // Grid Size
  f: boolean;              // Free Space
  d?: string[];            // Prefix dictionary for URLs (optional)
  x: any[];                // Compact cell data: string, or [string, imageUrlIndex/string]
}

// Check if a string is a base64/data URL to skip it
function isBase64(str: string): boolean {
  return str.startsWith('data:');
}

export async function compressCard(card: any, cellImages: Record<number, string>): Promise<string> {
  const totalCells = card.grid_size * card.grid_size;
  const compactCells: any[] = [];

  // Build prefix dictionary for external image URLs to save space
  const imageUrls: string[] = [];
  for (let i = 0; i < totalCells; i++) {
    const img = cellImages[i];
    if (img && !isBase64(img)) {
      imageUrls.push(img);
    }
  }

  // Find common URL prefixes (e.g., protocols + domains + paths)
  const prefixes: string[] = [];
  if (imageUrls.length > 1) {
    const prefixCounts: Record<string, number> = {};
    for (const url of imageUrls) {
      try {
        const u = new URL(url);
        const pathParts = u.pathname.split('/');
        const hostPrefix = `${u.protocol}//${u.host}`;
        prefixCounts[hostPrefix] = (prefixCounts[hostPrefix] || 0) + 1;
        
        if (pathParts.length > 2) {
          const pathPrefix = `${hostPrefix}/${pathParts[1]}/`;
          prefixCounts[pathPrefix] = (prefixCounts[pathPrefix] || 0) + 1;
        }
      } catch (e) {
        // Skip prefix extraction for invalid URLs
      }
    }

    // Keep prefixes that appear at least twice, sorted by length descending
    const candidates = Object.entries(prefixCounts)
      .filter(([_, count]) => count >= 2)
      .sort((a, b) => b[0].length - a[0].length);

    for (const [prefix] of candidates) {
      if (prefixes.length < 10) { // Limit to 10 prefixes to avoid dictionary overhead
        prefixes.push(prefix);
      }
    }
  }

  // Helper to apply dictionary compression to a single URL
  const compressUrl = (url: string): string => {
    for (let idx = 0; idx < prefixes.length; idx++) {
      const prefix = prefixes[idx];
      if (url.startsWith(prefix)) {
        return `@${idx}${url.slice(prefix.length)}`;
      }
    }
    return url;
  };

  // Populate compact cells array
  for (let i = 0; i < totalCells; i++) {
    const cell = card.cells?.find((c: any) => c.position === i);
    const text = cell ? cell.content : '';
    const img = cellImages[i];

    if (img && !isBase64(img)) {
      const compImg = compressUrl(img);
      if (text === '') {
        compactCells.push([compImg]); // Just image URL as a single-element array
      } else {
        compactCells.push([text, compImg]); // Both text and image URL
      }
    } else {
      compactCells.push(text); // Just text (string)
    }
  }

  const payload: CompressedCard = {
    t: card.title,
    e: card.event_name || null,
    c: card.theme_color,
    s: card.grid_size,
    f: card.free_space,
    x: compactCells
  };

  if (prefixes.length > 0) {
    payload.d = prefixes;
  }

  // Compress using native CompressionStream
  const jsonStr = JSON.stringify(payload);
  const byteArray = new TextEncoder().encode(jsonStr);
  
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  writer.write(byteArray);
  writer.close();
  
  const buffer = await new Response(cs.readable).arrayBuffer();
  
  // Convert ArrayBuffer to Base64URL-safe string
  const uint8 = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < uint8.byteLength; i++) {
    binary += String.fromCharCode(uint8[i]);
  }
  
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function decompressCard(base64url: string): Promise<any> {
  // Convert Base64URL back to standard Base64
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }

  const binary = atob(base64);
  const byteArray = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    byteArray[i] = binary.charCodeAt(i);
  }

  // Decompress using native DecompressionStream
  const ds = new DecompressionStream('gzip');
  const writer = ds.writable.getWriter();
  writer.write(byteArray);
  writer.close();

  const buffer = await new Response(ds.readable).arrayBuffer();
  const jsonStr = new TextDecoder().decode(buffer);
  const payload: CompressedCard = JSON.parse(jsonStr);

  // Helper to expand URL from dictionary
  const prefixes = payload.d || [];
  const expandUrl = (url: string): string => {
    if (url.startsWith('@')) {
      const match = url.match(/^@(\d+)(.*)$/);
      if (match) {
        const idx = parseInt(match[1], 10);
        const rest = match[2];
        if (idx < prefixes.length) {
          return prefixes[idx] + rest;
        }
      }
    }
    return url;
  };

  // Reconstruct card structure
  const totalCells = payload.s * payload.s;
  const cells: any[] = [];
  const cellImages: Record<number, string> = {};

  for (let i = 0; i < totalCells; i++) {
    const rawCell = payload.x[i];
    let content = '';
    let isFree = false;

    // Determine if it's the free space cell
    const midPoint = Math.floor(totalCells / 2);
    if (payload.f && i === midPoint) {
      isFree = true;
    }

    if (typeof rawCell === 'string') {
      content = rawCell;
    } else if (Array.isArray(rawCell)) {
      if (rawCell.length === 1) {
        content = '';
        cellImages[i] = expandUrl(rawCell[0]);
      } else {
        content = rawCell[0];
        cellImages[i] = expandUrl(rawCell[1]);
      }
    }

    cells.push({
      position: i,
      content: content || (isFree ? '★ FREE SPACE ★' : ''),
      is_free: isFree,
      is_marked: isFree
    });
  }

  return {
    card: {
      title: payload.t,
      event_name: payload.e,
      theme_color: payload.c,
      grid_size: payload.s,
      free_space: payload.f,
      cells: cells
    },
    cellImages: cellImages
  };
}
