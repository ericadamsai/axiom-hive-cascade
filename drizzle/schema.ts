import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  json,
  boolean,
  index,
  uniqueIndex,
  foreignKey
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with AxiomHive-specific fields for strategic leverage system.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "strategist", "analyst"]).default("user").notNull(),
  brand: varchar("brand", { length: 128 }).default("AxiomHive").notNull(),
  custodialIdentity: varchar("custodialIdentity", { length: 256 }),
  verificationStatus: mysqlEnum("verificationStatus", ["unverified", "pending", "verified", "trusted"]).default("unverified").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, (table) => ({
  emailIdx: index("email_idx").on(table.email),
  brandIdx: index("brand_idx").on(table.brand),
}));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Strategic Analysis Projects - Top-level container for analyses
 */
export const strategicProjects = mysqlTable("strategic_projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  brand: varchar("brand", { length: 128 }).default("AxiomHive").notNull(),
  status: mysqlEnum("status", ["active", "archived", "completed", "paused"]).default("active").notNull(),
  targetType: mysqlEnum("targetType", ["competitor", "market", "technology", "threat", "opportunity"]).notNull(),
  targetName: varchar("targetName", { length: 256 }).notNull(),
  confidenceLevel: decimal("confidenceLevel", { precision: 3, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
  brandIdx: index("brand_idx").on(table.brand),
  fk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
}));

export type StrategicProject = typeof strategicProjects.$inferSelect;
export type InsertStrategicProject = typeof strategicProjects.$inferInsert;

/**
 * Targeted Adversarial Nodes (T-Vector) - Individual targets for analysis
 */
export const targetedAdversarialNodes = mysqlTable("targeted_adversarial_nodes", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  nodeType: varchar("nodeType", { length: 128 }).notNull(),
  nodeIdentifier: varchar("nodeIdentifier", { length: 256 }).notNull(),
  description: text("description"),
  threatLevel: mysqlEnum("threatLevel", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  opportunityScore: decimal("opportunityScore", { precision: 3, scale: 2 }).default("0.00"),
  selfDefeatProbability: decimal("selfDefeatProbability", { precision: 3, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  projectIdIdx: index("project_id_idx").on(table.projectId),
  threatLevelIdx: index("threat_level_idx").on(table.threatLevel),
  fk: foreignKey({ columns: [table.projectId], foreignColumns: [strategicProjects.id] }).onDelete("cascade"),
}));

export type TargetedAdversarialNode = typeof targetedAdversarialNodes.$inferSelect;
export type InsertTargetedAdversarialNode = typeof targetedAdversarialNodes.$inferInsert;

/**
 * Strategic Analyses - Individual analysis runs with GCR loop results
 */
export const strategicAnalyses = mysqlTable("strategic_analyses", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  nodeId: int("nodeId").notNull(),
  analysisType: mysqlEnum("analysisType", ["gcr_loop", "verification", "synthesis", "validation"]).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  lambdaScore: decimal("lambdaScore", { precision: 3, scale: 2 }).default("0.00"),
  e8Metric: decimal("e8Metric", { precision: 5, scale: 4 }).default("0.0000"),
  recursionDepth: int("recursionDepth").default(0),
  correctionVectorNull: boolean("correctionVectorNull").default(false),
  generatorOutput: text("generatorOutput"),
  criticOutput: text("criticOutput"),
  synthesisResult: text("synthesisResult"),
  confidenceScore: decimal("confidenceScore", { precision: 3, scale: 2 }).default("0.00"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  projectIdIdx: index("project_id_idx").on(table.projectId),
  nodeIdIdx: index("node_id_idx").on(table.nodeId),
  statusIdx: index("status_idx").on(table.status),
  lambdaScoreIdx: index("lambda_score_idx").on(table.lambdaScore),
  projectFk: foreignKey({ columns: [table.projectId], foreignColumns: [strategicProjects.id] }).onDelete("cascade"),
  nodeFk: foreignKey({ columns: [table.nodeId], foreignColumns: [targetedAdversarialNodes.id] }).onDelete("cascade"),
}));

export type StrategicAnalysis = typeof strategicAnalyses.$inferSelect;
export type InsertStrategicAnalysis = typeof strategicAnalyses.$inferInsert;

/**
 * Evidence & Sources - Verified sources for strategic intelligence
 */
export const evidenceSources = mysqlTable("evidence_sources", {
  id: int("id").autoincrement().primaryKey(),
  analysisId: int("analysisId").notNull(),
  sourceUrl: varchar("sourceUrl", { length: 512 }).notNull(),
  sourceTitle: varchar("sourceTitle", { length: 512 }),
  sourceType: mysqlEnum("sourceType", ["article", "report", "data", "research", "news", "social_media", "other"]).notNull(),
  verificationStatus: mysqlEnum("verificationStatus", ["unverified", "pending", "verified", "disputed"]).default("unverified").notNull(),
  confidenceScore: decimal("confidenceScore", { precision: 3, scale: 2 }).default("0.00"),
  keyInsight: text("keyInsight"),
  evidenceSnippet: text("evidenceSnippet"),
  publicationDate: timestamp("publicationDate"),
  retrievalDate: timestamp("retrievalDate").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  analysisIdIdx: index("analysis_id_idx").on(table.analysisId),
  verificationStatusIdx: index("verification_status_idx").on(table.verificationStatus),
  fk: foreignKey({ columns: [table.analysisId], foreignColumns: [strategicAnalyses.id] }).onDelete("cascade"),
}));

export type EvidenceSource = typeof evidenceSources.$inferSelect;
export type InsertEvidenceSource = typeof evidenceSources.$inferInsert;

/**
 * Audit Trail - Comprehensive logging for all actions and decisions
 */
export const auditTrail = mysqlTable("audit_trail", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  analysisId: int("analysisId"),
  action: varchar("action", { length: 256 }).notNull(),
  actionType: mysqlEnum("actionType", ["create", "read", "update", "delete", "verify", "synthesize", "export"]).notNull(),
  resourceType: varchar("resourceType", { length: 128 }).notNull(),
  resourceId: int("resourceId"),
  details: text("details"),
  resultStatus: mysqlEnum("resultStatus", ["success", "partial", "failed"]).default("success").notNull(),
  cryptographicHash: varchar("cryptographicHash", { length: 256 }),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("user_id_idx").on(table.userId),
  projectIdIdx: index("project_id_idx").on(table.projectId),
  analysisIdIdx: index("analysis_id_idx").on(table.analysisId),
  actionTypeIdx: index("action_type_idx").on(table.actionType),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
  userFk: foreignKey({ columns: [table.userId], foreignColumns: [users.id] }).onDelete("cascade"),
  projectFk: foreignKey({ columns: [table.projectId], foreignColumns: [strategicProjects.id] }).onDelete("set null"),
  analysisFk: foreignKey({ columns: [table.analysisId], foreignColumns: [strategicAnalyses.id] }).onDelete("set null"),
}));

export type AuditTrailEntry = typeof auditTrail.$inferSelect;
export type InsertAuditTrailEntry = typeof auditTrail.$inferInsert;

/**
 * Branding Configuration - Recursive branding for AxiomHive and DevDollzAi
 */
export const brandingConfig = mysqlTable("branding_config", {
  id: int("id").autoincrement().primaryKey(),
  brand: varchar("brand", { length: 128 }).notNull().unique(),
  displayName: varchar("displayName", { length: 256 }).notNull(),
  description: text("description"),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#000000"),
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#FFFFFF"),
  accentColor: varchar("accentColor", { length: 7 }).default("#0066CC"),
  logoUrl: varchar("logoUrl", { length: 512 }),
  tagline: varchar("tagline", { length: 256 }),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  brandIdx: uniqueIndex("brand_idx").on(table.brand),
}));

export type BrandingConfig = typeof brandingConfig.$inferSelect;
export type InsertBrandingConfig = typeof brandingConfig.$inferInsert;

/**
 * Strategic Insights - Synthesized results and recommendations
 */
export const strategicInsights = mysqlTable("strategic_insights", {
  id: int("id").autoincrement().primaryKey(),
  analysisId: int("analysisId").notNull(),
  insightType: mysqlEnum("insightType", ["threat", "opportunity", "weakness", "strength", "recommendation"]).notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description").notNull(),
  impactScore: decimal("impactScore", { precision: 3, scale: 2 }).default("0.00"),
  actionability: mysqlEnum("actionability", ["immediate", "short_term", "medium_term", "long_term", "strategic"]).default("strategic").notNull(),
  recommendedActions: text("recommendedActions"),
  relatedNodes: json("relatedNodes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  analysisIdIdx: index("analysis_id_idx").on(table.analysisId),
  insightTypeIdx: index("insight_type_idx").on(table.insightType),
  fk: foreignKey({ columns: [table.analysisId], foreignColumns: [strategicAnalyses.id] }).onDelete("cascade"),
}));

export type StrategicInsight = typeof strategicInsights.$inferSelect;
export type InsertStrategicInsight = typeof strategicInsights.$inferInsert;

/**
 * Verification Records - Lambda and E8 metric verification
 */
export const verificationRecords = mysqlTable("verification_records", {
  id: int("id").autoincrement().primaryKey(),
  analysisId: int("analysisId").notNull(),
  verificationMethod: varchar("verificationMethod", { length: 256 }).notNull(),
  lambdaTarget: decimal("lambdaTarget", { precision: 3, scale: 2 }).default("1.00"),
  lambdaAchieved: decimal("lambdaAchieved", { precision: 3, scale: 2 }).default("0.00"),
  e8Target: decimal("e8Target", { precision: 5, scale: 4 }).default("0.0000"),
  e8Achieved: decimal("e8Achieved", { precision: 5, scale: 4 }).default("0.0000"),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "passed", "failed", "partial"]).default("pending").notNull(),
  verificationDetails: text("verificationDetails"),
  cryptographicProof: varchar("cryptographicProof", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
}, (table) => ({
  analysisIdIdx: index("analysis_id_idx").on(table.analysisId),
  verificationStatusIdx: index("verification_status_idx").on(table.verificationStatus),
  fk: foreignKey({ columns: [table.analysisId], foreignColumns: [strategicAnalyses.id] }).onDelete("cascade"),
}));

export type VerificationRecord = typeof verificationRecords.$inferSelect;
export type InsertVerificationRecord = typeof verificationRecords.$inferInsert;
