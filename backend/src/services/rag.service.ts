import { IExtractedData } from "../models/ExtractedData";

interface RetrievedContext {
  text: string;
  page?: number;
  clauseType?: string;
  relevanceScore: number;
}

class RAGService {
  /**
   * Retrieve relevant context from contract for answering questions
   * Simple implementation using keyword matching
   * Can be enhanced with vector embeddings for better results
   */
  retrieveRelevantContext(
    query: string,
    extractedData: IExtractedData,
    maxChunks: number = 3
  ): RetrievedContext[] {
    const queryLower = query.toLowerCase();
    const contexts: RetrievedContext[] = [];

    // Extract keywords from query
    const keywords = this.extractKeywords(queryLower);

    // Search in clauses
    if (extractedData.clauses && Array.isArray(extractedData.clauses)) {
      extractedData.clauses.forEach((clause) => {
        const clauseText = `${clause.title || ""} ${
          clause.content || ""
        }`.toLowerCase();
        const relevanceScore = this.calculateRelevance(
          clauseText,
          keywords,
          queryLower
        );

        if (relevanceScore > 0) {
          contexts.push({
            text: clause.content || clause.title,
            page: clause.sourceSpan?.page,
            clauseType: clause.clauseType,
            relevanceScore,
          });
        }
      });
    }

    // Search in raw text if not enough clauses found
    if (contexts.length < maxChunks && extractedData.rawText) {
      const chunks = this.chunkText(extractedData.rawText, 500);
      chunks.forEach((chunk) => {
        const chunkLower = chunk.toLowerCase();
        const relevanceScore = this.calculateRelevance(
          chunkLower,
          keywords,
          queryLower
        );

        if (relevanceScore > 0) {
          contexts.push({
            text: chunk,
            relevanceScore,
          });
        }
      });
    }

    // Sort by relevance and return top chunks
    return contexts
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxChunks);
  }

  /**
   * Extract important keywords from query
   */
  private extractKeywords(query: string): string[] {
    // Remove common stop words
    const stopWords = [
      "what",
      "is",
      "the",
      "a",
      "an",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "and",
      "or",
      "but",
      "not",
      "with",
      "from",
      "by",
      "about",
      "can",
      "could",
      "should",
      "would",
      "will",
      "does",
      "do",
      "did",
      "has",
      "have",
      "had",
      "are",
      "was",
      "were",
      "been",
      "being",
      "this",
      "that",
      "these",
      "those",
      "how",
      "why",
      "when",
      "where",
    ];

    return query
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.includes(word))
      .map((word) => word.replace(/[^\w]/g, ""));
  }

  /**
   * Calculate relevance score for a text chunk
   */
  private calculateRelevance(
    text: string,
    keywords: string[],
    originalQuery: string
  ): number {
    let score = 0;

    // Check for exact phrase match (highest weight)
    if (text.includes(originalQuery)) {
      score += 10;
    }

    // Check for keyword matches
    keywords.forEach((keyword) => {
      if (text.includes(keyword)) {
        score += 2;
      }
    });

    // Bonus for multiple keyword matches (context relevance)
    const matchedKeywords = keywords.filter((k) => text.includes(k)).length;
    if (matchedKeywords > 1) {
      score += matchedKeywords;
    }

    return score;
  }

  /**
   * Split text into chunks
   */
  private chunkText(text: string, chunkSize: number): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += chunkSize) {
      chunks.push(words.slice(i, i + chunkSize).join(" "));
    }

    return chunks;
  }

  /**
   * Build context prompt for LLM
   */
  buildContextPrompt(contexts: RetrievedContext[], question: string): string {
    const contextText = contexts
      .map((ctx, idx) => {
        let snippet = `[Context ${idx + 1}`;
        if (ctx.clauseType) snippet += ` - ${ctx.clauseType}`;
        if (ctx.page) snippet += ` (Page ${ctx.page})`;
        snippet += `]\n${ctx.text}`;
        return snippet;
      })
      .join("\n\n");

    return `You are analyzing a legal contract. Answer the user's question based ONLY on the provided context from the contract. If the answer is not in the context, say "I don't have enough information in this contract to answer that question."

Context from contract:
${contextText}

Question: ${question}

Instructions:
- Answer concisely and accurately
- Quote specific phrases from the context when relevant
- If referencing a specific section, mention which Context number
- If the answer is not in the provided context, be honest about it

Answer:`;
  }
}

export default new RAGService();
