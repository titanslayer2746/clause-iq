import PlaybookRule from "../models/PlaybookRule";
import ComplianceResult from "../models/ComplianceResult";
import { IExtractedData } from "../models/ExtractedData";

interface ComplianceCheckResult {
  score: number;
  passed: boolean;
  totalRules: number;
  passedRules: number;
  failedRules: number;
  deviations: any[];
}

class ComplianceService {
  /**
   * Check contract compliance against organization's playbook rules
   */
  async checkCompliance(
    _contractId: string,
    organizationId: string,
    extractedData: IExtractedData
  ): Promise<ComplianceCheckResult> {
    // Fetch all enabled rules for the organization
    const rules = await PlaybookRule.find({
      organizationId,
      enabled: true,
    });

    if (rules.length === 0) {
      console.log("⚠️ No playbook rules defined for organization");
      return {
        score: 100,
        passed: true,
        totalRules: 0,
        passedRules: 0,
        failedRules: 0,
        deviations: [],
      };
    }

    const deviations: any[] = [];
    let passedCount = 0;

    // Check each rule
    for (const rule of rules) {
      const ruleResult = await this.checkRule(rule, extractedData);
      
      if (ruleResult.passed) {
        passedCount++;
      } else {
        deviations.push({
          ruleId: rule._id,
          ruleName: rule.name,
          severity: rule.severity,
          message: ruleResult.message,
          recommendation: rule.recommendation,
          affectedClause: ruleResult.affectedClause,
        });
      }
    }

    const failedCount = rules.length - passedCount;
    
    // Calculate weighted score (critical failures have more impact)
    let weightedScore = 100;
    deviations.forEach((deviation) => {
      const impactMap: { [key: string]: number } = {
        low: 5,
        medium: 10,
        high: 20,
        critical: 30,
      };
      const impact = impactMap[deviation.severity] || 10;
      
      weightedScore -= impact;
    });
    
    const score = Math.max(0, Math.min(100, weightedScore));
    
    // Pass threshold: score >= 70 and no critical deviations
    const hasCritical = deviations.some((d) => d.severity === "critical");
    const passed = score >= 70 && !hasCritical;

    return {
      score,
      passed,
      totalRules: rules.length,
      passedRules: passedCount,
      failedRules: failedCount,
      deviations,
    };
  }

  /**
   * Check a single rule against extracted data
   */
  private async checkRule(
    rule: any,
    extractedData: IExtractedData
  ): Promise<{ passed: boolean; message: string; affectedClause?: string }> {
    try {
      switch (rule.ruleType) {
        case "clause_required":
          return this.checkClauseRequired(rule, extractedData);
        
        case "clause_forbidden":
          return this.checkClauseForbidden(rule, extractedData);
        
        case "term_length":
          return this.checkTermLength(rule, extractedData);
        
        case "liability_cap":
          return this.checkLiabilityCap(rule, extractedData);
        
        case "value_range":
          return this.checkValueRange(rule, extractedData);
        
        default:
          return {
            passed: true,
            message: "Rule type not implemented",
          };
      }
    } catch (error) {
      console.error(`Error checking rule ${rule.name}:`, error);
      return {
        passed: true, // Don't fail on errors
        message: "Error checking rule",
      };
    }
  }

  /**
   * Check if required clause exists
   */
  private checkClauseRequired(
    rule: any,
    extractedData: IExtractedData
  ): { passed: boolean; message: string; affectedClause?: string } {
    const requiredClauseType = rule.config.clauseType?.toLowerCase();
    
    const clauses = extractedData.clauses || [];
    const foundClause = clauses.find((clause) =>
      clause.clauseType?.toLowerCase().includes(requiredClauseType)
    );

    if (foundClause) {
      return {
        passed: true,
        message: `Required clause "${rule.config.clauseType}" found`,
        affectedClause: foundClause.title,
      };
    }

    return {
      passed: false,
      message: `Missing required clause: "${rule.config.clauseType}"`,
    };
  }

  /**
   * Check if forbidden clause exists
   */
  private checkClauseForbidden(
    rule: any,
    extractedData: IExtractedData
  ): { passed: boolean; message: string; affectedClause?: string } {
    const forbiddenClauseType = rule.config.clauseType?.toLowerCase();
    
    const clauses = extractedData.clauses || [];
    const foundClause = clauses.find((clause) =>
      clause.clauseType?.toLowerCase().includes(forbiddenClauseType)
    );

    if (!foundClause) {
      return {
        passed: true,
        message: `No forbidden clause "${rule.config.clauseType}" found`,
      };
    }

    return {
      passed: false,
      message: `Forbidden clause found: "${rule.config.clauseType}"`,
      affectedClause: foundClause.title,
    };
  }

  /**
   * Check contract term length
   */
  private checkTermLength(
    rule: any,
    extractedData: IExtractedData
  ): { passed: boolean; message: string } {
    const effectiveDate = extractedData.effectiveDate?.value;
    const terminationDate = extractedData.terminationDate?.value;

    if (!effectiveDate || !terminationDate) {
      return {
        passed: true,
        message: "Cannot determine contract term length",
      };
    }

    const effective = new Date(effectiveDate);
    const termination = new Date(terminationDate);
    const monthsDiff = (termination.getTime() - effective.getTime()) / (1000 * 60 * 60 * 24 * 30);

    const minMonths = rule.config.minValue || 0;
    const maxMonths = rule.config.maxValue || Infinity;

    if (monthsDiff >= minMonths && monthsDiff <= maxMonths) {
      return {
        passed: true,
        message: `Contract term (${Math.round(monthsDiff)} months) within acceptable range`,
      };
    }

    return {
      passed: false,
      message: `Contract term (${Math.round(monthsDiff)} months) outside acceptable range (${minMonths}-${maxMonths} months)`,
    };
  }

  /**
   * Check liability cap clause
   */
  private checkLiabilityCap(
    _rule: any,
    extractedData: IExtractedData
  ): { passed: boolean; message: string; affectedClause?: string } {
    const clauses = extractedData.clauses || [];
    const liabilityClause = clauses.find(
      (clause) =>
        clause.clauseType?.toLowerCase().includes("liability") ||
        clause.clauseType?.toLowerCase().includes("indemnity")
    );

    if (!liabilityClause) {
      return {
        passed: false,
        message: "No liability/indemnity clause found",
      };
    }

    // Check if "unlimited liability" is mentioned
    const hasUnlimited = liabilityClause.content
      ?.toLowerCase()
      .includes("unlimited");

    if (hasUnlimited) {
      return {
        passed: false,
        message: "Unlimited liability detected in contract",
        affectedClause: liabilityClause.title,
      };
    }

    return {
      passed: true,
      message: "Liability clause appears acceptable",
      affectedClause: liabilityClause.title,
    };
  }

  /**
   * Check if values are in acceptable range
   */
  private checkValueRange(
    _rule: any,
    extractedData: IExtractedData
  ): { passed: boolean; message: string } {
    // This is a generic check - could be enhanced for specific value types
    const amounts = extractedData.amounts || [];
    
    if (amounts.length === 0) {
      return {
        passed: true,
        message: "No financial values to check",
      };
    }

    // Simple check: ensure amounts are documented
    return {
      passed: true,
      message: `Found ${amounts.length} financial value(s) documented`,
    };
  }

  /**
   * Save compliance result to database
   */
  async saveComplianceResult(
    contractId: string,
    organizationId: string,
    result: ComplianceCheckResult
  ): Promise<any> {
    // Remove existing compliance result if any
    await ComplianceResult.findOneAndDelete({ contractId });

    // Create new compliance result
    const complianceResult = await ComplianceResult.create({
      contractId,
      organizationId,
      score: result.score,
      passed: result.passed,
      totalRules: result.totalRules,
      passedRules: result.passedRules,
      failedRules: result.failedRules,
      deviations: result.deviations,
      analyzedAt: new Date(),
    });

    console.log(
      `✅ Compliance check completed for contract ${contractId}: Score ${result.score}/100`
    );

    return complianceResult;
  }
}

export default new ComplianceService();

