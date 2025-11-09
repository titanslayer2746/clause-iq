import { Response } from "express";
import { AuthRequest } from "../types";
import { asyncHandler } from "../middleware/errorHandler";
import reportService from "../services/report.service";

// Export contracts as CSV
export const exportContractsCSV = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    const csv = await reportService.generateContractsCSV(
      user.organizationId.toString()
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="contracts-${Date.now()}.csv"`
    );
    res.send(csv);
  }
);

// Export tasks as CSV
export const exportTasksCSV = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    const csv = await reportService.generateTasksCSV(
      user.organizationId.toString()
    );

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="tasks-${Date.now()}.csv"`
    );
    res.send(csv);
  }
);

// Generate status report PDF
export const generateStatusReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    const pdf = await reportService.generateStatusReportPDF(
      user.organizationId.toString()
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="status-report-${Date.now()}.pdf"`
    );
    res.send(pdf);
  }
);

// Generate risk report PDF
export const generateRiskReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    const pdf = await reportService.generateRiskReportPDF(
      user.organizationId.toString()
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="risk-report-${Date.now()}.pdf"`
    );
    res.send(pdf);
  }
);

// Generate compliance report PDF
export const generateComplianceReport = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const user = req.user!;

    const pdf = await reportService.generateComplianceReportPDF(
      user.organizationId.toString()
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="compliance-report-${Date.now()}.pdf"`
    );
    res.send(pdf);
  }
);

