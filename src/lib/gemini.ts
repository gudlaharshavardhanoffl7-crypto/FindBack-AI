import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
export const isGeminiConfigured = Boolean(apiKey && apiKey !== 'your-gemini-api-key');

const genAI = isGeminiConfigured ? new GoogleGenerativeAI(apiKey) : null;

export interface ExtractedItemFeatures {
  category: string;
  colors: string[];
  materials: string[];
  distinguishingMarks: string[];
  keywords: string[];
  synthesizedDescription: string;
}

/**
 * Deterministic fallback embedding generator producing 768-dimensional normalized vectors.
 * Ensures the vector matching engine runs smoothly even before Gemini API key is configured.
 */
export function generateDeterministicEmbedding(text: string): number[] {
  const DIMENSIONS = 768;
  const vector = new Array(DIMENSIONS).fill(0);
  const normalized = text.toLowerCase().trim();

  // Simple n-gram and character feature distribution
  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    const pos1 = (charCode * 31 + i * 17) % DIMENSIONS;
    const pos2 = (charCode * 59 + i * 23) % DIMENSIONS;
    vector[pos1] += 0.5 * Math.sin(charCode + i);
    vector[pos2] += 0.5 * Math.cos(charCode * 2 + i);
  }

  // Token frequency projection
  const tokens = normalized.split(/\s+/);
  for (let t = 0; t < tokens.length; t++) {
    const word = tokens[t];
    let hash = 0;
    for (let c = 0; c < word.length; c++) {
      hash = (hash << 5) - hash + word.charCodeAt(c);
      hash |= 0;
    }
    const idx = Math.abs(hash) % DIMENSIONS;
    vector[idx] += 1.0;
  }

  // Normalize vector to unit length (L2 norm)
  let sumSq = 0;
  for (let i = 0; i < DIMENSIONS; i++) {
    sumSq += vector[i] * vector[i];
  }
  const magnitude = Math.sqrt(sumSq) || 1;
  return vector.map((val) => val / magnitude);
}

/**
 * Calculates cosine similarity between two numeric vectors
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Multimodal processing: Analyzes image and description to extract fine-grained visual features
 * and produce a high-dimensional 768-D vector embedding.
 */
export async function generateMultimodalEmbedding(
  description: string,
  imageBase64?: string,
  mimeType: string = 'image/jpeg'
): Promise<{ embedding: number[]; features: ExtractedItemFeatures }> {
  // If Gemini API is configured, use Gemini models
  if (genAI && isGeminiConfigured) {
    try {
      const visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Analyze this physical lost or found item. Given the user's description and optional image:
Description: "${description}"

Extract and return a JSON object with:
1. "category": Primary category (e.g. Keys, Eyewear, Wallets, Electronics, Jewelry, Bags, Documents).
2. "colors": Array of dominant visual colors.
3. "materials": Array of materials (e.g. brass, titanium, leather, matte aluminum).
4. "distinguishingMarks": Array of specific serial numbers, scratches, engravings, brands, or unique tags.
5. "keywords": Array of 8 key descriptive search tokens.
6. "synthesizedDescription": A concise 2-sentence technical summary highlighting all identification anchors.

Return ONLY valid raw JSON without markdown code fences.`;

      const contents: any[] = [prompt];
      if (imageBase64) {
        // Strip data:image/...;base64, prefix if present
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
        contents.push({
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType || 'image/jpeg',
          },
        });
      }

      const visionResult = await visionModel.generateContent(contents);
      const textResponse = visionResult.response.text().trim();
      let parsedFeatures: ExtractedItemFeatures;
      try {
        const cleaned = textResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        parsedFeatures = JSON.parse(cleaned);
      } catch {
        parsedFeatures = {
          category: 'General',
          colors: [],
          materials: [],
          distinguishingMarks: [],
          keywords: description.split(' ').slice(0, 8),
          synthesizedDescription: description,
        };
      }

      // Generate embedding using text-embedding-004
      const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const embeddingText = `${parsedFeatures.category}. ${parsedFeatures.synthesizedDescription}. Colors: ${parsedFeatures.colors.join(', ')}. Materials: ${parsedFeatures.materials.join(', ')}. Marks: ${parsedFeatures.distinguishingMarks.join(', ')}. Raw: ${description}`;
      const embedResult = await embeddingModel.embedContent(embeddingText);

      return {
        embedding: embedResult.embedding.values,
        features: parsedFeatures,
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to deterministic vector projection:', err);
    }
  }

  // Graceful deterministic fallback
  const fallbackVector = generateDeterministicEmbedding(description);
  const sampleKeywords = description
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3)
    .slice(0, 8);

  return {
    embedding: fallbackVector,
    features: {
      category: 'Physical Item',
      colors: ['Neutral'],
      materials: ['Composite'],
      distinguishingMarks: ['Identification marks indexed'],
      keywords: sampleKeywords,
      synthesizedDescription: description,
    },
  };
}
