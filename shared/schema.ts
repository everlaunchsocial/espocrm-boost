import { pgTable, text, serial, uuid, timestamp, boolean, numeric, integer, date, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { sql } from "drizzle-orm";

// ============================================
// CRM TABLES
// ============================================

export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  website: text("website"),
  industry: text("industry"),
  phone: text("phone"),
  email: text("email"),
  companyEmail: text("company_email"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  country: text("country"),
  type: text("type").notNull().default("prospect"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  cellPhone: text("cell_phone"),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "set null" }),
  title: text("title"),
  secondaryContactName: text("secondary_contact_name"),
  secondaryContactEmail: text("secondary_contact_email"),
  secondaryContactPhone: text("secondary_contact_phone"),
  status: text("status").notNull().default("lead"),
  affiliateId: uuid("affiliate_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  title: text("title"),
  source: text("source").notNull().default("other"),
  status: text("status").notNull().default("new"),
  affiliateId: uuid("affiliate_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const deals = pgTable("deals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  accountId: uuid("account_id").references(() => accounts.id, { onDelete: "set null" }),
  contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  amount: numeric("amount").notNull().default("0"),
  stage: text("stage").notNull().default("prospecting"),
  probability: integer("probability").notNull().default(0),
  expectedCloseDate: date("expected_close_date"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("not-started"),
  priority: text("priority").notNull().default("medium"),
  dueDate: date("due_date"),
  assignedTo: text("assigned_to"),
  relatedToType: text("related_to_type"),
  relatedToId: uuid("related_to_id"),
  relatedToName: text("related_to_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  subject: text("subject").notNull(),
  description: text("description"),
  relatedToType: text("related_to_type"),
  relatedToId: uuid("related_to_id"),
  relatedToName: text("related_to_name"),
  isSystemGenerated: boolean("is_system_generated").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const notes = pgTable("notes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  relatedToType: text("related_to_type").notNull(),
  relatedToId: uuid("related_to_id").notNull(),
  relatedToName: text("related_to_name").notNull(),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// EMAIL TABLES
// ============================================

export const senderAddresses = pgTable("sender_addresses", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull(),
  name: text("name").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const emails = pgTable("emails", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contactId: text("contact_id").notNull(),
  senderAddress: text("sender_address").notNull(),
  senderName: text("sender_name"),
  toEmail: text("to_email").notNull(),
  toName: text("to_name"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").notNull().default("pending"),
  trackingId: uuid("tracking_id").default(sql`gen_random_uuid()`).notNull(),
  openedAt: timestamp("opened_at", { withTimezone: true }),
  openCount: integer("open_count").notNull().default(0),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// DEMO SYSTEM TABLES
// ============================================

export const demos = pgTable("demos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  repId: uuid("rep_id"),
  leadId: uuid("lead_id").references(() => leads.id),
  contactId: uuid("contact_id").references(() => contacts.id),
  affiliateId: uuid("affiliate_id"),
  businessName: text("business_name").notNull(),
  websiteUrl: text("website_url"),
  screenshotUrl: text("screenshot_url"),
  aiPrompt: text("ai_prompt"),
  aiPersonaName: text("ai_persona_name").default("AI Assistant"),
  avatarUrl: text("avatar_url"),
  chatPrimaryColor: text("chat_primary_color").default("#6366f1"),
  chatTitle: text("chat_title").default("Chat with us"),
  voiceProvider: text("voice_provider").notNull().default("openai"),
  elevenlabsAgentId: text("elevenlabs_agent_id"),
  vapiAssistantId: text("vapi_assistant_id"),
  passcode: text("passcode"),
  status: text("status").notNull().default("draft"),
  emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
  firstViewedAt: timestamp("first_viewed_at", { withTimezone: true }),
  lastViewedAt: timestamp("last_viewed_at", { withTimezone: true }),
  viewCount: integer("view_count").notNull().default(0),
  chatInteractionCount: integer("chat_interaction_count").notNull().default(0),
  voiceInteractionCount: integer("voice_interaction_count").notNull().default(0),
  convertedAt: timestamp("converted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const calendarBookings = pgTable("calendar_bookings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  demoId: uuid("demo_id").references(() => demos.id, { onDelete: "cascade" }),
  prospectName: text("prospect_name").notNull(),
  prospectEmail: text("prospect_email").notNull(),
  prospectPhone: text("prospect_phone"),
  bookingDate: date("booking_date").notNull(),
  bookingTime: text("booking_time").notNull(),
  notes: text("notes"),
  status: text("status").notNull().default("confirmed"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// ESTIMATES & INVOICES TABLES
// ============================================

export const estimates = pgTable("estimates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  estimateNumber: text("estimate_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address"),
  customerCity: text("customer_city"),
  customerState: text("customer_state"),
  customerZip: text("customer_zip"),
  jobTitle: text("job_title").notNull(),
  jobDescription: text("job_description"),
  subtotal: numeric("subtotal").notNull().default("0"),
  taxRate: numeric("tax_rate").default("0"),
  taxAmount: numeric("tax_amount").default("0"),
  totalAmount: numeric("total_amount").notNull().default("0"),
  depositRequired: boolean("deposit_required").default(false),
  depositAmount: numeric("deposit_amount").default("0"),
  depositType: text("deposit_type").default("fixed"),
  status: text("status").notNull().default("draft"),
  validUntil: date("valid_until"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  viewedAt: timestamp("viewed_at", { withTimezone: true }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  declinedAt: timestamp("declined_at", { withTimezone: true }),
  signatureData: text("signature_data"),
  signerName: text("signer_name"),
  signerIp: text("signer_ip"),
  beforePhotoUrl: text("before_photo_url"),
  duringPhotoUrl: text("during_photo_url"),
  afterPhotoUrl: text("after_photo_url"),
  notes: text("notes"),
  termsAndConditions: text("terms_and_conditions"),
  invoiceGenerated: boolean("invoice_generated").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const estimateItems = pgTable("estimate_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  estimateId: uuid("estimate_id").notNull().references(() => estimates.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: numeric("quantity").notNull().default("1"),
  unitPrice: numeric("unit_price").notNull().default("0"),
  lineTotal: numeric("line_total").notNull().default("0"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  contactId: uuid("contact_id").references(() => contacts.id, { onDelete: "set null" }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  estimateId: uuid("estimate_id").references(() => estimates.id, { onDelete: "set null" }),
  invoiceNumber: text("invoice_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  customerAddress: text("customer_address"),
  customerCity: text("customer_city"),
  customerState: text("customer_state"),
  customerZip: text("customer_zip"),
  jobTitle: text("job_title").notNull(),
  jobDescription: text("job_description"),
  subtotal: numeric("subtotal").notNull().default("0"),
  taxRate: numeric("tax_rate").default("0"),
  taxAmount: numeric("tax_amount").default("0"),
  totalAmount: numeric("total_amount").notNull().default("0"),
  amountPaid: numeric("amount_paid").default("0"),
  status: text("status").notNull().default("draft"),
  dueDate: date("due_date"),
  paidDate: date("paid_date"),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  viewedAt: timestamp("viewed_at", { withTimezone: true }),
  beforePhotoUrl: text("before_photo_url"),
  duringPhotoUrl: text("during_photo_url"),
  afterPhotoUrl: text("after_photo_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: uuid("invoice_id").notNull().references(() => invoices.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: numeric("quantity").notNull().default("1"),
  unitPrice: numeric("unit_price").notNull().default("0"),
  lineTotal: numeric("line_total").notNull().default("0"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// AFFILIATE & MLM TABLES
// ============================================

export const commissionPlans = pgTable("commission_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  level1Rate: numeric("level1_rate").notNull().default("0.30"),
  level2Rate: numeric("level2_rate").notNull().default("0.15"),
  level3Rate: numeric("level3_rate").notNull().default("0.05"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const affiliatePlans = pgTable("affiliate_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  monthlyPrice: numeric("monthly_price").notNull(),
  demoCreditsPerMonth: integer("demo_credits_per_month"),
  stripePriceId: text("stripe_price_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const affiliates = pgTable("affiliates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  commissionPlanId: uuid("commission_plan_id").references(() => commissionPlans.id),
  affiliatePlanId: uuid("affiliate_plan_id").references(() => affiliatePlans.id),
  username: text("username").notNull().unique(),
  parentAffiliateId: uuid("parent_affiliate_id"),
  demoCreditsBalance: integer("demo_credits_balance"),
  demoCreditsResetAt: timestamp("demo_credits_reset_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const genealogy = pgTable("genealogy", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: uuid("affiliate_id").notNull().references(() => affiliates.id, { onDelete: "cascade" }),
  uplineLevel1: uuid("upline_level1").references(() => affiliates.id),
  uplineLevel2: uuid("upline_level2").references(() => affiliates.id),
  uplineLevel3: uuid("upline_level3").references(() => affiliates.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const affiliateCommissions = pgTable("affiliate_commissions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: uuid("affiliate_id").notNull().references(() => affiliates.id, { onDelete: "cascade" }),
  customerId: uuid("customer_id").notNull(),
  amount: numeric("amount").notNull().default("0"),
  commissionLevel: integer("commission_level").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

export const affiliatePlanHistory = pgTable("affiliate_plan_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: uuid("affiliate_id").notNull().references(() => affiliates.id, { onDelete: "cascade" }),
  oldPlanId: uuid("old_plan_id"),
  newPlanId: uuid("new_plan_id"),
  oldPlanCode: text("old_plan_code"),
  newPlanCode: text("new_plan_code"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  initiatedBy: text("initiated_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const affiliateCreditPurchases = pgTable("affiliate_credit_purchases", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: uuid("affiliate_id").notNull().references(() => affiliates.id, { onDelete: "cascade" }),
  creditsAmount: integer("credits_amount").notNull(),
  pricePaid: numeric("price_paid").notNull(),
  stripePaymentId: text("stripe_payment_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const affiliateBillingHistory = pgTable("affiliate_billing_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: uuid("affiliate_id").notNull().references(() => affiliates.id, { onDelete: "cascade" }),
  eventType: text("event_type").notNull(),
  amount: numeric("amount"),
  stripeEventId: text("stripe_event_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// CUSTOMER BILLING TABLES
// ============================================

export const customerPlans = pgTable("customer_plans", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  setupFee: numeric("setup_fee").notNull(),
  monthlyPrice: numeric("monthly_price").notNull(),
  minutesIncluded: integer("minutes_included").notNull(),
  overageRate: numeric("overage_rate").notNull(),
  stripePriceId: text("stripe_price_id"),
  stripeSetupPriceId: text("stripe_setup_price_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const customerProfiles = pgTable("customer_profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull(),
  affiliateId: uuid("affiliate_id").references(() => affiliates.id),
  customerPlanId: uuid("customer_plan_id").references(() => customerPlans.id),
  planName: text("plan_name"),
  businessName: text("business_name"),
  businessType: text("business_type"),
  websiteUrl: text("website_url"),
  minutesIncluded: integer("minutes_included").notNull().default(0),
  minutesUsed: integer("minutes_used").notNull().default(0),
  overageRate: numeric("overage_rate").notNull().default("0"),
  billingCycleStart: date("billing_cycle_start"),
  billingCycleEnd: date("billing_cycle_end"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const billingSubscriptions = pgTable("billing_subscriptions", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").references(() => customerProfiles.id, { onDelete: "cascade" }),
  affiliateId: uuid("affiliate_id").references(() => affiliates.id),
  subscriptionType: text("subscription_type"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  planId: text("plan_id"),
  status: text("status").notNull().default("inactive"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const billingUsage = pgTable("billing_usage", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").notNull().references(() => customerProfiles.id, { onDelete: "cascade" }),
  usageType: text("usage_type").notNull(),
  amount: numeric("amount").notNull().default("0"),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const usageLogs = pgTable("usage_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").notNull().references(() => customerProfiles.id, { onDelete: "cascade" }),
  interactionType: text("interaction_type").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const payouts = pgTable("payouts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: uuid("affiliate_id").notNull().references(() => affiliates.id, { onDelete: "cascade" }),
  amount: numeric("amount").notNull().default("0"),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  paidAt: timestamp("paid_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// VOICE/CHAT SETTINGS TABLES
// ============================================

export const voiceSettings = pgTable("voice_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").notNull().unique().references(() => customerProfiles.id, { onDelete: "cascade" }),
  voiceGender: text("voice_gender").default("female"),
  voiceSpeed: numeric("voice_speed").default("1.0"),
  voicePitch: numeric("voice_pitch").default("1.0"),
  voiceStyle: text("voice_style").default("friendly"),
  greetingText: text("greeting_text"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatSettings = pgTable("chat_settings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").notNull().unique().references(() => customerProfiles.id, { onDelete: "cascade" }),
  tone: text("tone").default("professional"),
  instructions: text("instructions"),
  greetingText: text("greeting_text"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const twilioNumbers = pgTable("twilio_numbers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").notNull().references(() => customerProfiles.id, { onDelete: "cascade" }),
  twilioNumber: text("twilio_number").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const vapiAccounts = pgTable("vapi_accounts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  apiKey: text("api_key").notNull(),
  numbersProvisioned: integer("numbers_provisioned").notNull().default(0),
  maxNumbers: integer("max_numbers").notNull().default(10),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customerPhoneNumbers = pgTable("customer_phone_numbers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").notNull().unique().references(() => customerProfiles.id, { onDelete: "cascade" }),
  vapiAccountId: uuid("vapi_account_id").notNull().references(() => vapiAccounts.id),
  phoneNumber: text("phone_number").notNull(),
  vapiPhoneId: text("vapi_phone_id"),
  vapiAssistantId: text("vapi_assistant_id"),
  areaCode: text("area_code"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// MEDIA & KNOWLEDGE TABLES
// ============================================

export const callLogs = pgTable("call_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id"),
  demoId: uuid("demo_id").references(() => demos.id),
  callSid: text("call_sid"),
  callType: text("call_type"),
  direction: text("direction"),
  fromNumber: text("from_number"),
  toNumber: text("to_number"),
  duration: integer("duration"),
  status: text("status"),
  transcription: text("transcription"),
  recordingUrl: text("recording_url"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const mediaLibrary = pgTable("media_library", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  size: integer("size"),
  mimeType: text("mime_type"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const customerKnowledgeSources = pgTable("customer_knowledge_sources", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").notNull().references(() => customerProfiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  content: text("content"),
  url: text("url"),
  metadata: jsonb("metadata"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const calendarIntegrations = pgTable("calendar_integrations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: uuid("customer_id").notNull().references(() => customerProfiles.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  calendarId: text("calendar_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// USER PROFILE TABLES
// ============================================

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: uuid("user_id").notNull().unique(),
  globalRole: text("global_role").default("user"),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// ANALYTICS TABLES
// ============================================

export const signupEvents = pgTable("signup_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email"),
  username: text("username"),
  plan: text("plan"),
  referrer: text("referrer"),
  eventName: text("event_name").notNull(),
  step: text("step"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ============================================
// INSERT SCHEMAS & TYPES
// ============================================

export const insertAccountSchema = createInsertSchema(accounts);
export const insertContactSchema = createInsertSchema(contacts);
export const insertLeadSchema = createInsertSchema(leads);
export const insertDealSchema = createInsertSchema(deals);
export const insertTaskSchema = createInsertSchema(tasks);
export const insertActivitySchema = createInsertSchema(activities);
export const insertNoteSchema = createInsertSchema(notes);
export const insertDemoSchema = createInsertSchema(demos);
export const insertEstimateSchema = createInsertSchema(estimates);
export const insertInvoiceSchema = createInsertSchema(invoices);
export const insertCalendarBookingSchema = createInsertSchema(calendarBookings);
export const insertAffiliateSchema = createInsertSchema(affiliates);
export const insertCustomerProfileSchema = createInsertSchema(customerProfiles);

// Types - using Drizzle's built-in inference
export type InsertAccount = typeof accounts.$inferInsert;
export type Account = typeof accounts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertDeal = typeof deals.$inferInsert;
export type Deal = typeof deals.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type InsertNote = typeof notes.$inferInsert;
export type Note = typeof notes.$inferSelect;
export type InsertDemo = typeof demos.$inferInsert;
export type Demo = typeof demos.$inferSelect;
export type InsertEstimate = typeof estimates.$inferInsert;
export type Estimate = typeof estimates.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;
export type Invoice = typeof invoices.$inferSelect;
export type InsertCalendarBooking = typeof calendarBookings.$inferInsert;
export type CalendarBooking = typeof calendarBookings.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;
export type Affiliate = typeof affiliates.$inferSelect;
export type InsertCustomerProfile = typeof customerProfiles.$inferInsert;
export type CustomerProfile = typeof customerProfiles.$inferSelect;
export type AffiliatePlan = typeof affiliatePlans.$inferSelect;
export type CustomerPlan = typeof customerPlans.$inferSelect;
export type CommissionPlan = typeof commissionPlans.$inferSelect;
export type BillingSubscription = typeof billingSubscriptions.$inferSelect;
export type Email = typeof emails.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type VapiAccount = typeof vapiAccounts.$inferSelect;
export type InsertVapiAccount = typeof vapiAccounts.$inferInsert;
export type CustomerPhoneNumber = typeof customerPhoneNumbers.$inferSelect;
export type InsertCustomerPhoneNumber = typeof customerPhoneNumbers.$inferInsert;
export type VoiceSettings = typeof voiceSettings.$inferSelect;
export type ChatSettings = typeof chatSettings.$inferSelect;
