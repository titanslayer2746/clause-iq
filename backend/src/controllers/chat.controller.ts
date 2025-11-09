import { Response } from "express";
import { Contract } from "../models";
import ChatMessage from "../models/ChatMessage";
import { AuthRequest } from "../types";
import { AppError, asyncHandler } from "../middleware/errorHandler";
import { sendSuccess } from "../utils/response";
import geminiService from "../services/gemini.service";
import ragService from "../services/rag.service";

// Ask question about a contract
export const askQuestion = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;
    const { question, conversationId } = req.body;

    if (!question || question.trim().length === 0) {
      throw new AppError("Question is required", 400);
    }

    // Verify contract
    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    }).populate("extractedDataId");

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const extractedData: any = contract.extractedDataId;

    if (!extractedData) {
      throw new AppError(
        "No extracted data found for this contract. Please upload the contract again.",
        400
      );
    }

    if (!extractedData.rawText || extractedData.rawText.trim().length === 0) {
      throw new AppError(
        "No text content available. Text extraction may have failed during upload.",
        400
      );
    }

    const startTime = Date.now();

    // Retrieve relevant context using RAG
    const relevantContexts = ragService.retrieveRelevantContext(
      question,
      extractedData,
      3
    );

    // If no relevant contexts found, still try to answer from raw text
    let answer: string;
    let sources: any[] = [];

    if (relevantContexts.length === 0) {
      // Check if AI analysis has been run
      const hasAIAnalysis =
        extractedData.parties && extractedData.parties.length > 0;

      if (!hasAIAnalysis) {
        answer =
          "I couldn't find relevant information in this contract to answer your question. Please run AI Analysis first to extract structured data from the contract, which will help me provide better answers.";
      } else {
        answer =
          "I couldn't find relevant information in this contract to answer your question. The contract may not contain information about this topic.";
      }

      const processingTime = Date.now() - startTime;

      const chatMessage = await ChatMessage.create({
        contractId: contract._id,
        organizationId: user.organizationId,
        userId: user._id,
        question,
        answer,
        sources: [],
        conversationId: conversationId || undefined,
        processingTime,
      });

      const populatedMessage = await ChatMessage.findById(chatMessage._id)
        .populate("userId", "email")
        .populate("contractId", "title");

      return sendSuccess(
        res,
        {
          chatMessage: populatedMessage,
          answer,
          sources: [],
          processingTime,
        },
        "No relevant information found"
      );
    } else {
      // Build prompt with context
      const prompt = ragService.buildContextPrompt(relevantContexts, question);

      // Get answer from Gemini
      answer = await geminiService.chat(prompt);
      sources = relevantContexts;
    }

    const processingTime = Date.now() - startTime;

    // Save chat message
    const chatMessage = await ChatMessage.create({
      contractId: contract._id,
      organizationId: user.organizationId,
      userId: user._id,
      question,
      answer,
      sources,
      conversationId: conversationId || undefined,
      processingTime,
    });

    const populatedMessage = await ChatMessage.findById(chatMessage._id)
      .populate("userId", "email")
      .populate("contractId", "title");

    sendSuccess(
      res,
      {
        chatMessage: populatedMessage,
        answer,
        sources,
        processingTime,
      },
      "Answer generated successfully"
    );
  }
);

// Get chat history for a contract
export const getChatHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;
    const { limit = 50, conversationId } = req.query;

    // Verify contract
    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    });

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const filter: any = { contractId };
    if (conversationId) {
      filter.conversationId = conversationId;
    }

    const messages = await ChatMessage.find(filter)
      .populate("userId", "email")
      .sort({ createdAt: 1 })
      .limit(Number(limit));

    sendSuccess(res, { messages, total: messages.length });
  }
);

// Delete chat message
export const deleteChatMessage = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { messageId } = req.params;

    const message = await ChatMessage.findOne({
      _id: messageId,
      organizationId: user.organizationId,
    });

    if (!message) {
      throw new AppError("Chat message not found", 404);
    }

    await message.deleteOne();

    sendSuccess(res, null, "Chat message deleted");
  }
);

// Clear chat history for a contract
export const clearChatHistory = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;
    const { contractId } = req.params;

    // Verify contract
    const contract = await Contract.findOne({
      _id: contractId,
      organizationId: user.organizationId,
    });

    if (!contract) {
      throw new AppError("Contract not found", 404);
    }

    const result = await ChatMessage.deleteMany({ contractId });

    sendSuccess(
      res,
      { deletedCount: result.deletedCount },
      "Chat history cleared"
    );
  }
);
