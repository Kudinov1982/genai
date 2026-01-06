import { Post, CategoryType, Attachment } from './types';
import { INITIAL_POSTS } from './constants';

/**
 * Fetches posts from a Google Sheet published as CSV.
 * Returns INITIAL_POSTS if no URL is provided or fetch fails.
 */
export async function fetchPostsFromGoogleSheets(csvUrl: string): Promise<Post[]> {
  if (!csvUrl) {
      console.log('No Google Sheet URL provided. Using initial mock data.');
      return [];
  }

  try {
    const response = await fetch(csvUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const text = await response.text();
    return parseCSVToPosts(text);
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    return [];
  }
}

/**
 * Simple CSV Parser.
 * Assumes headers: id, title, author, category, modelName, prompt, inputContent, outputContent, createdAt, attachmentUrl, attachmentType
 */
function parseCSVToPosts(csvText: string): Post[] {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentCell = '';
    let insideQuotes = false;

    // Robust CSV parsing handling quotes and newlines
    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i];
        const nextChar = csvText[i + 1];

        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                currentCell += '"';
                i++; // Skip escape quote
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            currentRow.push(currentCell);
            currentCell = '';
        } else if ((char === '\r' || char === '\n') && !insideQuotes) {
            if (char === '\r' && nextChar === '\n') i++;
            if (currentRow.length > 0 || currentCell) {
                currentRow.push(currentCell);
                rows.push(currentRow);
            }
            currentRow = [];
            currentCell = '';
        } else {
            currentCell += char;
        }
    }
    if (currentRow.length > 0 || currentCell) {
        currentRow.push(currentCell);
        rows.push(currentRow);
    }

    // Map rows to Post objects
    // Skip header row
    const dataRows = rows.slice(1);
    
    return dataRows.map((row, index) => {
        // Safe access helper
        const get = (idx: number) => row[idx] ? row[idx].trim() : '';

        // Determine category enum (fallback to Transcription)
        const catStr = get(3);
        let category = CategoryType.TRANSCRIPTION;
        if (Object.values(CategoryType).includes(catStr as CategoryType)) {
            category = catStr as CategoryType;
        }

        // Handle Attachment Column (Index 9 & 10)
        const attachmentUrl = get(9);
        const attachmentType = get(10) as 'image' | 'audio' | 'document';
        const inputAttachments: Attachment[] = [];
        
        if (attachmentUrl) {
            inputAttachments.push({
                id: `att-${index}`,
                type: attachmentType || 'document',
                url: attachmentUrl,
                name: 'Attachment',
            });
        }

        return {
            id: get(0) || `sheet-${index}`,
            title: get(1) || 'Без названия',
            author: get(2) || 'Аноним',
            category: category,
            modelName: get(4) || 'Unknown Model',
            prompt: get(5),
            inputContent: get(6),
            outputContent: get(7),
            createdAt: get(8) || new Date().toISOString(),
            reviews: [], 
            inputAttachments: inputAttachments, 
            outputAttachments: []
        };
    }).filter(post => post.title && post.inputContent); // Filter out empty/invalid rows
}
