import mongoose, { Document, Schema } from "mongoose";

export interface ISourceCitation {
  text: string;
  page?: number;
  clauseType?: string;
  relevanceScore?: number;
}

export interface IChatMessage extends Document {
  contractId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  question: string;
  answer: string;
  sources: ISourceCitation[];
  conversationId?: string; // Group related messages
  processingTime?: number; // In milliseconds
  createdAt: Date;
  updatedAt: Date;
}

const SourceCitationSchema = new Schema({
  text: {
    type: String,
    required: true,
  },
  page: {
    type: Number,
  },
  clauseType: {
    type: String,
  },
  relevanceScore: {
    type: Number,
  },
}, { _id: false });

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    contractId: {
      type: Schema.Types.ObjectId,
      ref: "Contract",
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
    },
    sources: [SourceCitationSchema],
    conversationId: {
      type: String,
      index: true,
    },
    processingTime: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Index for finding chat history
ChatMessageSchema.index({ contractId: 1, createdAt: -1 });
ChatMessageSchema.index({ conversationId: 1, createdAt: 1 });

export default mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);

