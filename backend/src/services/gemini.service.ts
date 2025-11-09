import { GoogleGenerativeAI } from "@google/generative-ai";
import { AppError } from "../middleware/errorHandler";

interface ExtractedParty {
  name: string;
  role: string;
  confidence: number;
  sourceText: string;
}

interface ExtractedDate {
  type: string;
  date: string;
  confidence: number;
  sourceText: string;
}

interface ExtractedAmount {
  value: number;
  currency: string;
  description: string;
  confidence: number;
  sourceText: string;
}

interface ExtractedClause {
  type: string;
  title: string;
  content: string;
  confidence: number;
  sourceText: string;
  page?: number;
}

export interface GeminiExtractionResult {
  parties: ExtractedParty[];
  dates: ExtractedDate[];
  amounts: ExtractedAmount[];
  clauses: ExtractedClause[];
  summary: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private isInitialized = false;

  private initialize() {
    if (this.isInitialized) return;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      // Using gemini-2.0-flash-exp - 2025 experimental free tier model
      // This is the latest available model for free tier in 2025
      this.model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.1, // Low temperature for more consistent/accurate results
          topK: 32,
          topP: 1,
          maxOutputTokens: 8192,
        },
      });
      console.log("✅ Gemini 2.0 Flash Experimental API initialized (Free Tier)");
    } else {
      console.warn("⚠️ GEMINI_API_KEY not set. AI extraction will not work.");
    }

    this.isInitialized = true;
  }

  async extractContractFields(
    contractText: string
  ): Promise<GeminiExtractionResult> {
    this.initialize(); // Lazy initialization

    if (!this.model) {
      throw new AppError("Gemini API not configured", 500);
    }

    try {
      const prompt = this.buildExtractionPrompt(contractText);

      console.log("🤖 Sending request to Gemini API...");
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log("✅ Received response from Gemini");

      // Parse JSON response
      const parsedResult = this.parseGeminiResponse(text);

      return parsedResult;
    } catch (error: any) {
      console.error("❌ Gemini extraction failed:", error);
      throw new AppError(`AI extraction failed: ${error.message}`, 500);
    }
  }

  private buildExtractionPrompt(contractText: string): string {
    return `You are a legal contract analysis AI. Analyze the following contract and extract key information in JSON format.

Contract Text:
"""
${contractText.substring(0, 8000)}
"""

Extract the following information with confidence scores (0-1):

1. **Parties**: All parties involved (name, role like "Provider", "Client", etc.)
2. **Dates**: Important dates (effective date, termination date, renewal date, notice periods)
3. **Amounts**: Financial values (payment amounts, penalties, fees)
4. **Clauses**: Key contract clauses (termination, liability, confidentiality, payment terms, etc.)

For each extracted item:
- Include a confidence score (0.0 to 1.0)
- Include the exact source text from the contract
- For amounts, specify currency and description

Return ONLY a valid JSON object with this structure (no markdown, no explanation):
{
  "parties": [
    {
      "name": "Company Name",
      "role": "Service Provider",
      "confidence": 0.95,
      "sourceText": "excerpt from contract"
    }
  ],
  "dates": [
    {
      "type": "Effective Date",
      "date": "2024-01-01",
      "confidence": 0.9,
      "sourceText": "excerpt from contract"
    }
  ],
  "amounts": [
    {
      "value": 50000,
      "currency": "USD",
      "description": "Annual fee",
      "confidence": 0.85,
      "sourceText": "excerpt from contract"
    }
  ],
  "clauses": [
    {
      "type": "Termination",
      "title": "Termination Clause",
      "content": "Summary of the clause",
      "confidence": 0.8,
      "sourceText": "excerpt from contract",
      "page": 3
    }
  ],
  "summary": "Brief 2-3 sentence summary of the contract"
}`;
  }

  private parseGeminiResponse(text: string): GeminiExtractionResult {
    try {
      // Remove markdown code blocks if present
      let jsonText = text.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```\n?/g, "");
      }

      const parsed = JSON.parse(jsonText);

      // Validate and provide defaults
      return {
        parties: Array.isArray(parsed.parties) ? parsed.parties : [],
        dates: Array.isArray(parsed.dates) ? parsed.dates : [],
        amounts: Array.isArray(parsed.amounts) ? parsed.amounts : [],
        clauses: Array.isArray(parsed.clauses) ? parsed.clauses : [],
        summary: parsed.summary || "No summary available",
      };
    } catch (error: any) {
      console.error("❌ Failed to parse Gemini response:", error);
      console.log("Raw response:", text);

      // Return empty structure if parsing fails
      return {
        parties: [],
        dates: [],
        amounts: [],
        clauses: [],
        summary: "Failed to parse AI response",
      };
    }
  }

  // Analyze contract for risks
  async analyzeRisks(contractText: string): Promise<any> {
    this.initialize(); // Lazy initialization

    if (!this.model) {
      throw new AppError("Gemini API not configured", 500);
    }

    try {
      const prompt = `Analyze the following contract for potential risks and red flags:

Contract Text:
"""
${contractText.substring(0, 8000)}
"""

Identify:
1. High-risk clauses (unlimited liability, auto-renewal, one-sided terms)
2. Missing important clauses
3. Ambiguous or unclear terms
4. Compliance issues (GDPR, data protection, etc.)

Return ONLY a valid JSON object:
{
  "riskScore": 0-100,
  "risks": [
    {
      "type": "Unlimited Liability",
      "severity": "high",
      "description": "Description of the risk",
      "recommendation": "What to do about it",
      "sourceText": "excerpt from contract"
    }
  ],
  "missingClauses": ["Force Majeure", "Confidentiality"],
  "complianceIssues": []
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse response
      let jsonText = text.trim();
      if (jsonText.startsWith("```json")) {
        jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (jsonText.startsWith("```")) {
        jsonText = jsonText.replace(/```\n?/g, "");
      }

      return JSON.parse(jsonText);
    } catch (error: any) {
      console.error("❌ Risk analysis failed:", error);
      throw new AppError(`Risk analysis failed: ${error.message}`, 500);
    }
  }

  /**
   * Chat with context-aware responses
   */
  async chat(prompt: string): Promise<string> {
    this.initialize();

    if (!this.genAI) {
      throw new AppError("Gemini API key not configured", 500);
    }

    try {
      // Use the same model as extraction for consistency
      const model = this.genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
        generationConfig: {
          temperature: 0.3, // Slightly higher for more natural conversation
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        },
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return text;
    } catch (error: any) {
      console.error("❌ Gemini chat failed:", error);
      throw new AppError(`Chat failed: ${error.message}`, 500);
    }
  }

  /**
   * Extract text from PDF using Gemini's vision/multimodal capabilities
   * This works for scanned PDFs and images (Layer 3 fallback)
   */
  async extractTextFromPDF(base64Content: string): Promise<string> {
    this.initialize();

    if (!this.genAI) {
      throw new AppError("Gemini API not configured", 500);
    }

    try {
      console.log("🤖 Using Gemini Vision for PDF text extraction...");
      
      // Use gemini-flash-lite-latest for cost-effective PDF extraction
      // This is the most cost-friendly model that supports multimodal (PDF/images)
      const model = this.genAI.getGenerativeModel({
        model: "gemini-flash-lite-latest",
      });

      const result = await model.generateContent([
        {
          inlineData: {
            mimeType: "application/pdf",
            data: base64Content,
          },
        },
        {
          text: `Extract ALL text content from this PDF document. 
        
Instructions:
- Return ONLY the extracted text, no commentary
- Preserve the document structure (paragraphs, sections)
- Include all visible text content
- If you see tables, preserve their structure
- Do not add any additional formatting or explanations

Return the raw text content:`
        }
      ]);

      const response = await result.response;
      const text = response.text();

      console.log(`✅ Gemini Vision extracted ${text.length} characters`);
      return text;
      
    } catch (error: any) {
      console.error("❌ Gemini Vision extraction failed:", error);
      throw new AppError(`Gemini Vision failed: ${error.message}`, 500);
    }
  }
}

export default new GeminiService();
