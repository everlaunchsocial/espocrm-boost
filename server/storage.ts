import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  accounts, contacts, leads, deals, tasks, activities, notes, demos,
  estimates, estimateItems, invoices, invoiceItems, calendarBookings,
  affiliates, affiliatePlans, customerPlans, customerProfiles, billingSubscriptions,
  emails, senderAddresses, profiles, commissionPlans, genealogy, affiliateCommissions,
  billingUsage, usageLogs, payouts, voiceSettings, chatSettings, twilioNumbers,
  vapiAccounts, customerPhoneNumbers, callLogs, mediaLibrary, signupEvents,
  type Account, type Contact, type Lead, type Deal, type Task, type Activity,
  type Note, type Demo, type Estimate, type Invoice, type CalendarBooking,
  type Affiliate, type AffiliatePlan, type CustomerPlan, type CustomerProfile,
  type BillingSubscription, type Email, type Profile,
  type InsertAccount, type InsertContact, type InsertLead, type InsertDeal,
  type InsertTask, type InsertActivity, type InsertNote, type InsertDemo,
  type InsertEstimate, type InsertInvoice, type InsertCalendarBooking,
  type InsertAffiliate, type InsertCustomerProfile
} from "@shared/schema";

export interface IStorage {
  // Accounts
  getAccounts(): Promise<Account[]>;
  getAccount(id: string): Promise<Account | undefined>;
  createAccount(data: InsertAccount): Promise<Account>;
  updateAccount(id: string, data: Partial<InsertAccount>): Promise<Account | undefined>;
  deleteAccount(id: string): Promise<boolean>;

  // Contacts
  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(data: InsertContact): Promise<Contact>;
  updateContact(id: string, data: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<boolean>;

  // Leads
  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(data: InsertLead): Promise<Lead>;
  updateLead(id: string, data: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;

  // Demos
  getDemos(): Promise<Demo[]>;
  getDemo(id: string): Promise<Demo | undefined>;
  getDemoByPasscode(passcode: string): Promise<Demo | undefined>;
  createDemo(data: InsertDemo): Promise<Demo>;
  updateDemo(id: string, data: Partial<InsertDemo>): Promise<Demo | undefined>;
  deleteDemo(id: string): Promise<boolean>;

  // Calendar Bookings
  createCalendarBooking(data: InsertCalendarBooking): Promise<CalendarBooking>;
  getCalendarBookingsByDemo(demoId: string): Promise<CalendarBooking[]>;

  // Affiliates
  getAffiliate(id: string): Promise<Affiliate | undefined>;
  getAffiliateByUserId(userId: string): Promise<Affiliate | undefined>;
  getAffiliateByUsername(username: string): Promise<Affiliate | undefined>;
  createAffiliate(data: InsertAffiliate): Promise<Affiliate>;
  updateAffiliate(id: string, data: Partial<InsertAffiliate>): Promise<Affiliate | undefined>;

  // Plans
  getAffiliatePlans(): Promise<AffiliatePlan[]>;
  getAffiliatePlanByCode(code: string): Promise<AffiliatePlan | undefined>;
  getCustomerPlans(): Promise<CustomerPlan[]>;
  getCustomerPlanByCode(code: string): Promise<CustomerPlan | undefined>;

  // Profiles
  getProfile(userId: string): Promise<Profile | undefined>;
  upsertProfile(userId: string, data: Partial<Profile>): Promise<Profile>;
}

export class DatabaseStorage implements IStorage {
  // Accounts
  async getAccounts(): Promise<Account[]> {
    return await db.select().from(accounts).orderBy(desc(accounts.createdAt));
  }

  async getAccount(id: string): Promise<Account | undefined> {
    const [account] = await db.select().from(accounts).where(eq(accounts.id, id));
    return account;
  }

  async createAccount(data: InsertAccount): Promise<Account> {
    const [account] = await db.insert(accounts).values(data).returning();
    return account;
  }

  async updateAccount(id: string, data: Partial<InsertAccount>): Promise<Account | undefined> {
    const [account] = await db.update(accounts).set({ ...data, updatedAt: new Date() }).where(eq(accounts.id, id)).returning();
    return account;
  }

  async deleteAccount(id: string): Promise<boolean> {
    const result = await db.delete(accounts).where(eq(accounts.id, id));
    return true;
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return await db.select().from(contacts).orderBy(desc(contacts.createdAt));
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, id));
    return contact;
  }

  async createContact(data: InsertContact): Promise<Contact> {
    const [contact] = await db.insert(contacts).values(data).returning();
    return contact;
  }

  async updateContact(id: string, data: Partial<InsertContact>): Promise<Contact | undefined> {
    const [contact] = await db.update(contacts).set({ ...data, updatedAt: new Date() }).where(eq(contacts.id, id)).returning();
    return contact;
  }

  async deleteContact(id: string): Promise<boolean> {
    await db.delete(contacts).where(eq(contacts.id, id));
    return true;
  }

  // Leads
  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async createLead(data: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(data).returning();
    return lead;
  }

  async updateLead(id: string, data: Partial<InsertLead>): Promise<Lead | undefined> {
    const [lead] = await db.update(leads).set({ ...data, updatedAt: new Date() }).where(eq(leads.id, id)).returning();
    return lead;
  }

  async deleteLead(id: string): Promise<boolean> {
    await db.delete(leads).where(eq(leads.id, id));
    return true;
  }

  // Demos
  async getDemos(): Promise<Demo[]> {
    return await db.select().from(demos).orderBy(desc(demos.createdAt));
  }

  async getDemo(id: string): Promise<Demo | undefined> {
    const [demo] = await db.select().from(demos).where(eq(demos.id, id));
    return demo;
  }

  async getDemoByPasscode(passcode: string): Promise<Demo | undefined> {
    const [demo] = await db.select().from(demos).where(eq(demos.passcode, passcode));
    return demo;
  }

  async createDemo(data: InsertDemo): Promise<Demo> {
    const [demo] = await db.insert(demos).values(data).returning();
    return demo;
  }

  async updateDemo(id: string, data: Partial<InsertDemo>): Promise<Demo | undefined> {
    const [demo] = await db.update(demos).set({ ...data, updatedAt: new Date() }).where(eq(demos.id, id)).returning();
    return demo;
  }

  async deleteDemo(id: string): Promise<boolean> {
    await db.delete(demos).where(eq(demos.id, id));
    return true;
  }

  // Calendar Bookings
  async createCalendarBooking(data: InsertCalendarBooking): Promise<CalendarBooking> {
    const [booking] = await db.insert(calendarBookings).values(data).returning();
    return booking;
  }

  async getCalendarBookingsByDemo(demoId: string): Promise<CalendarBooking[]> {
    return await db.select().from(calendarBookings).where(eq(calendarBookings.demoId, demoId));
  }

  // Affiliates
  async getAffiliate(id: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, id));
    return affiliate;
  }

  async getAffiliateByUserId(userId: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.userId, userId));
    return affiliate;
  }

  async getAffiliateByUsername(username: string): Promise<Affiliate | undefined> {
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.username, username));
    return affiliate;
  }

  async createAffiliate(data: InsertAffiliate): Promise<Affiliate> {
    const [affiliate] = await db.insert(affiliates).values(data).returning();
    return affiliate;
  }

  async updateAffiliate(id: string, data: Partial<InsertAffiliate>): Promise<Affiliate | undefined> {
    const [affiliate] = await db.update(affiliates).set(data).where(eq(affiliates.id, id)).returning();
    return affiliate;
  }

  // Plans
  async getAffiliatePlans(): Promise<AffiliatePlan[]> {
    return await db.select().from(affiliatePlans).where(eq(affiliatePlans.isActive, true));
  }

  async getAffiliatePlanByCode(code: string): Promise<AffiliatePlan | undefined> {
    const [plan] = await db.select().from(affiliatePlans).where(eq(affiliatePlans.code, code));
    return plan;
  }

  async getCustomerPlans(): Promise<CustomerPlan[]> {
    return await db.select().from(customerPlans).where(eq(customerPlans.isActive, true));
  }

  async getCustomerPlanByCode(code: string): Promise<CustomerPlan | undefined> {
    const [plan] = await db.select().from(customerPlans).where(eq(customerPlans.code, code));
    return plan;
  }

  // Profiles
  async getProfile(userId: string): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
    return profile;
  }

  async upsertProfile(userId: string, data: Partial<Profile>): Promise<Profile> {
    const existing = await this.getProfile(userId);
    if (existing) {
      const [updated] = await db.update(profiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(profiles.userId, userId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(profiles)
        .values({ userId, ...data })
        .returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
