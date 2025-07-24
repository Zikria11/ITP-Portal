import {
  users,
  students,
  admins,
  attendance,
  highlights,
  schedule,
  type User,
  type UpsertUser,
  type Student,
  type InsertStudent,
  type Admin,
  type InsertAdmin,
  type Attendance,
  type InsertAttendance,
  type Highlight,
  type InsertHighlight,
  type Schedule,
  type InsertSchedule,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Student operations
  getStudents(): Promise<Student[]>;
  getStudentById(id: number): Promise<Student | undefined>;
  getStudentByUserId(userId: string): Promise<Student | undefined>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudentStatus(id: number, status: string): Promise<Student>;
  deleteStudent(id: number): Promise<void>;
  getPendingStudents(): Promise<Student[]>;

  // Admin operations
  getAdmins(): Promise<Admin[]>;
  getAdminById(id: number): Promise<Admin | undefined>;
  getAdminByUserId(userId: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  deleteAdmin(id: number): Promise<void>;

  // Attendance operations
  getAttendanceByDate(date: string): Promise<(Attendance & { student: Student })[]>;
  getStudentAttendance(studentId: number): Promise<Attendance[]>;
  markAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, status: string): Promise<Attendance>;

  // Highlights operations
  getHighlights(): Promise<Highlight[]>;
  getHighlightById(id: number): Promise<Highlight | undefined>;
  createHighlight(highlight: InsertHighlight): Promise<Highlight>;
  updateHighlight(id: number, data: Partial<InsertHighlight>): Promise<Highlight>;
  deleteHighlight(id: number): Promise<void>;

  // Schedule operations
  getSchedules(): Promise<Schedule[]>;
  getSchedulesByDate(date: string): Promise<Schedule[]>;
  getScheduleById(id: number): Promise<Schedule | undefined>;
  createSchedule(scheduleItem: InsertSchedule): Promise<Schedule>;
  updateSchedule(id: number, data: Partial<InsertSchedule>): Promise<Schedule>;
  deleteSchedule(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Student operations
  async getStudents(): Promise<Student[]> {
    return await db.select().from(students).orderBy(asc(students.name));
  }

  async getStudentById(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentByUserId(userId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.userId, userId));
    return student;
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(student).returning();
    return newStudent;
  }

  async updateStudentStatus(id: number, status: string): Promise<Student> {
    const [student] = await db
      .update(students)
      .set({ status, updatedAt: new Date() })
      .where(eq(students.id, id))
      .returning();
    return student;
  }

  async deleteStudent(id: number): Promise<void> {
    await db.delete(students).where(eq(students.id, id));
  }

  async getPendingStudents(): Promise<Student[]> {
    return await db
      .select()
      .from(students)
      .where(eq(students.status, "pending"))
      .orderBy(asc(students.createdAt));
  }

  // Admin operations
  async getAdmins(): Promise<Admin[]> {
    return await db.select().from(admins).orderBy(asc(admins.name));
  }

  async getAdminById(id: number): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.id, id));
    return admin;
  }

  async getAdminByUserId(userId: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.userId, userId));
    return admin;
  }

  async createAdmin(admin: InsertAdmin): Promise<Admin> {
    const [newAdmin] = await db.insert(admins).values(admin).returning();
    return newAdmin;
  }

  async deleteAdmin(id: number): Promise<void> {
    await db.delete(admins).where(eq(admins.id, id));
  }

  // Attendance operations
  async getAttendanceByDate(date: string): Promise<(Attendance & { student: Student })[]> {
    return await db
      .select({
        id: attendance.id,
        studentId: attendance.studentId,
        date: attendance.date,
        status: attendance.status,
        markedBy: attendance.markedBy,
        createdAt: attendance.createdAt,
        student: students,
      })
      .from(attendance)
      .innerJoin(students, eq(attendance.studentId, students.id))
      .where(eq(attendance.date, date))
      .orderBy(asc(students.name));
  }

  async getStudentAttendance(studentId: number): Promise<Attendance[]> {
    return await db
      .select()
      .from(attendance)
      .where(eq(attendance.studentId, studentId))
      .orderBy(desc(attendance.date));
  }

  async markAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    // Check if attendance already exists for this student and date
    const [existing] = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.studentId, attendanceData.studentId),
          eq(attendance.date, attendanceData.date)
        )
      );

    if (existing) {
      // Update existing attendance
      const [updated] = await db
        .update(attendance)
        .set({ status: attendanceData.status, markedBy: attendanceData.markedBy })
        .where(eq(attendance.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new attendance record
      const [newAttendance] = await db.insert(attendance).values(attendanceData).returning();
      return newAttendance;
    }
  }

  async updateAttendance(id: number, status: string): Promise<Attendance> {
    const [updated] = await db
      .update(attendance)
      .set({ status })
      .where(eq(attendance.id, id))
      .returning();
    return updated;
  }

  // Highlights operations
  async getHighlights(): Promise<Highlight[]> {
    return await db.select().from(highlights).orderBy(desc(highlights.date));
  }

  async getHighlightById(id: number): Promise<Highlight | undefined> {
    const [highlight] = await db.select().from(highlights).where(eq(highlights.id, id));
    return highlight;
  }

  async createHighlight(highlight: InsertHighlight): Promise<Highlight> {
    const [newHighlight] = await db.insert(highlights).values(highlight).returning();
    return newHighlight;
  }

  async updateHighlight(id: number, data: Partial<InsertHighlight>): Promise<Highlight> {
    const [updated] = await db
      .update(highlights)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(highlights.id, id))
      .returning();
    return updated;
  }

  async deleteHighlight(id: number): Promise<void> {
    await db.delete(highlights).where(eq(highlights.id, id));
  }

  // Schedule operations
  async getSchedules(): Promise<Schedule[]> {
    return await db.select().from(schedule).orderBy(asc(schedule.date), asc(schedule.time));
  }

  async getSchedulesByDate(date: string): Promise<Schedule[]> {
    return await db
      .select()
      .from(schedule)
      .where(eq(schedule.date, date))
      .orderBy(asc(schedule.time));
  }

  async getScheduleById(id: number): Promise<Schedule | undefined> {
    const [scheduleItem] = await db.select().from(schedule).where(eq(schedule.id, id));
    return scheduleItem;
  }

  async createSchedule(scheduleItem: InsertSchedule): Promise<Schedule> {
    const [newSchedule] = await db.insert(schedule).values(scheduleItem).returning();
    return newSchedule;
  }

  async updateSchedule(id: number, data: Partial<InsertSchedule>): Promise<Schedule> {
    const [updated] = await db
      .update(schedule)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(schedule.id, id))
      .returning();
    return updated;
  }

  async deleteSchedule(id: number): Promise<void> {
    await db.delete(schedule).where(eq(schedule.id, id));
  }
}

export const storage = new DatabaseStorage();
