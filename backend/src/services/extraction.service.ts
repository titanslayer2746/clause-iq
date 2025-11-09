import fs from "fs";
import pdf from "pdf-parse";
import mammoth from "mammoth";
import Tesseract from "tesseract.js";
import { AppError } from "../middleware/errorHandler";
import geminiService from "./gemini.service";

// Dynamic import for pdfjs-dist (ESM module)
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf");

interface ExtractionResult {
  rawText: string;
  pageCount: number;
  qualityFlag: "low" | "medium" | "high";
  extractionMethod: "native" | "pdfjs" | "ocr" | "docx";
  confidence?: number; // 0-1 scale
}

class ExtractionService {
  // ========================================
  // LAYER 1: Fast native PDF parsing
  // ========================================
  private async tryNativePDFParse(dataBuffer: Buffer): Promise<ExtractionResult | null> {
    try {
      console.log("🔍 Layer 1: Attempting native PDF parsing (pdf-parse)...");
      const data = await pdf(dataBuffer);
      
      if (data.text && data.text.trim().length > 50) {
        const textDensity = data.text.length / (data.numpages || 1);
        
        console.log(`✅ Layer 1 SUCCESS: ${data.text.length} chars, ${data.numpages} pages`);
        return {
          rawText: data.text,
          pageCount: data.numpages || 1,
          qualityFlag: textDensity > 500 ? "high" : textDensity > 100 ? "medium" : "low",
          extractionMethod: "native",
          confidence: 0.95
        };
      }
      
      console.log("⚠️ Layer 1: Insufficient text extracted");
      return null; // Not enough text extracted
    } catch (error: any) {
      console.log(`⚠️ Layer 1 FAILED: ${error.message}`);
      return null;
    }
  }

  // ========================================
  // LAYER 2: Advanced PDF.js parsing
  // ========================================
  private async tryPDFjsParse(dataBuffer: Buffer): Promise<ExtractionResult | null> {
    try {
      console.log("🔍 Layer 2: Attempting PDF.js parsing (Mozilla)...");
      
      // Convert Buffer to Uint8Array for pdfjs
      const uint8Array = new Uint8Array(dataBuffer);
      
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useSystemFonts: true,
        standardFontDataUrl: "node_modules/pdfjs-dist/standard_fonts/",
      });
      
      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;
      let fullText = "";
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n\n";
      }
      
      if (fullText.trim().length > 50) {
        const textDensity = fullText.length / numPages;
        
        console.log(`✅ Layer 2 SUCCESS: ${fullText.length} chars, ${numPages} pages`);
        return {
          rawText: fullText,
          pageCount: numPages,
          qualityFlag: textDensity > 500 ? "high" : textDensity > 100 ? "medium" : "low",
          extractionMethod: "pdfjs",
          confidence: 0.90
        };
      }
      
      console.log("⚠️ Layer 2: Insufficient text extracted");
      return null;
    } catch (error: any) {
      console.log(`⚠️ Layer 2 FAILED: ${error.message}`);
      return null;
    }
  }

  // ========================================
  // LAYER 3: Gemini Vision OCR (for scanned PDFs)
  // ========================================
  private async tryGeminiVisionOCR(filePath: string): Promise<ExtractionResult | null> {
    try {
      console.log("🔍 Layer 3: Attempting Gemini Vision OCR (AI-powered)...");
      
      // Read file as base64
      const fileBuffer = fs.readFileSync(filePath);
      const base64Content = fileBuffer.toString('base64');
      
      // Use Gemini's multimodal capability to extract text from PDF
      const extractedText = await geminiService.extractTextFromPDF(base64Content);
      
      if (extractedText && extractedText.trim().length > 50) {
        console.log(`✅ Layer 3 SUCCESS: ${extractedText.length} chars extracted via AI`);
        return {
          rawText: extractedText,
          pageCount: 1, // Gemini doesn't provide page count
          qualityFlag: "medium", // OCR is typically medium quality
          extractionMethod: "ocr",
          confidence: 0.80
        };
      }
      
      console.log("⚠️ Layer 3: Insufficient text extracted");
      return null;
    } catch (error: any) {
      console.log(`⚠️ Layer 3 FAILED: ${error.message}`);
      return null;
    }
  }

  // ========================================
  // MAIN EXTRACTION METHOD - 3-Layer Strategy
  // ========================================
  async extractFromPDF(filePath: string): Promise<ExtractionResult> {
    try {
      console.log("\n=== Starting 3-Layer PDF Extraction ===");
      const dataBuffer = fs.readFileSync(filePath);
      
      // Try Layer 1: Native parsing (fastest - ~100ms)
      let result = await this.tryNativePDFParse(dataBuffer);
      if (result) {
        console.log("=== Extraction completed with Layer 1 (native) ===\n");
        return result;
      }
      
      // Try Layer 2: PDF.js (more robust - ~500ms)
      result = await this.tryPDFjsParse(dataBuffer);
      if (result) {
        console.log("=== Extraction completed with Layer 2 (PDF.js) ===\n");
        return result;
      }
      
      // Try Layer 3: Gemini Vision OCR (last resort - ~2-5s)
      result = await this.tryGeminiVisionOCR(filePath);
      if (result) {
        console.log("=== Extraction completed with Layer 3 (Gemini Vision) ===\n");
        return result;
      }
      
      // All methods failed
      console.error("❌ All 3 layers failed to extract text from PDF");
      throw new AppError(
        "Unable to extract text from PDF after trying all methods. The file may be corrupted, password-protected, or use an unsupported format.",
        422
      );
      
    } catch (error: any) {
      console.error("❌ PDF extraction failed completely:", error);
      throw new AppError(`PDF extraction failed: ${error.message}`, 500);
    }
  }

  // Extract text from DOCX
  async extractFromDOCX(filePath: string): Promise<ExtractionResult> {
    try {
      const result = await mammoth.extractRawText({ path: filePath });
      const rawText = result.value;

      // Estimate page count (rough estimation: 500 chars per page)
      const pageCount = Math.max(1, Math.ceil(rawText.length / 500));

      // Determine quality
      let qualityFlag: "low" | "medium" | "high";
      if (rawText.length < 100) {
        qualityFlag = "low";
      } else if (rawText.length < 1000) {
        qualityFlag = "medium";
      } else {
        qualityFlag = "high";
      }

      return {
        rawText,
        pageCount,
        qualityFlag,
        extractionMethod: "docx",
      };
    } catch (error: any) {
      console.error("❌ DOCX extraction failed:", error);
      throw new AppError("Failed to extract text from DOCX", 500);
    }
  }

  // Extract text using OCR (for scanned PDFs)
  async extractWithOCR(
    filePath: string,
    pageCount: number
  ): Promise<ExtractionResult> {
    try {
      console.log("🔍 Starting OCR process...");

      const {
        data: { text },
      } = await Tesseract.recognize(filePath, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const rawText = text;

      // OCR quality is typically lower
      let qualityFlag: "low" | "medium" | "high";
      if (rawText.length < 100) {
        qualityFlag = "low";
      } else if (rawText.length < 1000) {
        qualityFlag = "low";
      } else {
        qualityFlag = "medium";
      }

      console.log("✅ OCR completed successfully");

      return {
        rawText,
        pageCount,
        qualityFlag,
        extractionMethod: "ocr",
      };
    } catch (error: any) {
      console.error("❌ OCR extraction failed:", error);
      throw new AppError("Failed to extract text using OCR", 500);
    }
  }

  // Main extraction method that determines file type
  async extractText(
    filePath: string,
    fileType: string
  ): Promise<ExtractionResult> {
    if (fileType === "application/pdf") {
      return await this.extractFromPDF(filePath);
    } else if (
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword"
    ) {
      return await this.extractFromDOCX(filePath);
    } else {
      throw new AppError("Unsupported file type for text extraction", 400);
    }
  }

  // Validate extracted text quality
  validateQuality(text: string): {
    hasText: boolean;
    wordCount: number;
    charCount: number;
  } {
    const hasText = text.trim().length > 0;
    const wordCount = text
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    const charCount = text.length;

    return {
      hasText,
      wordCount,
      charCount,
    };
  }
}

export default new ExtractionService();
