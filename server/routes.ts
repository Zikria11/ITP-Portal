import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import {
  insertStudentSchema,
  insertAdminSchema,
  insertAttendanceSchema,
  insertHighlightSchema,
  insertScheduleSchema,
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Check if user is admin or student
      const admin = await storage.getAdminByUserId(userId);
      const student = await storage.getStudentByUserId(userId);
      
      res.json({
        ...user,
        role: admin ? 'admin' : (student ? 'student' : 'pending'),
        profile: admin || student,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Student registration (public route)
  app.post("/api/students/register", async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.json(student);
    } catch (error) {
      console.error("Error registering student:", error);
      res.status(400).json({ message: "Failed to register student" });
    }
  });

  // Admin-only middleware
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      const userId = req.user.claims.sub;
      const admin = await storage.getAdminByUserId(userId);
      if (!admin) {
        return res.status(403).json({ message: "Admin access required" });
      }
      req.admin = admin;
      next();
    } catch (error) {
      res.status(403).json({ message: "Admin access required" });
    }
  };

  // Students endpoints (admin only)
  app.get("/api/students", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const students = await storage.getStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/pending", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const pendingStudents = await storage.getPendingStudents();
      res.json(pendingStudents);
    } catch (error) {
      console.error("Error fetching pending students:", error);
      res.status(500).json({ message: "Failed to fetch pending students" });
    }
  });

  app.post("/api/students", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertStudentSchema.parse(req.body);
      const student = await storage.createStudent(validatedData);
      res.json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(400).json({ message: "Failed to create student" });
    }
  });

  app.patch("/api/students/:id/status", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const student = await storage.updateStudentStatus(id, status);
      res.json(student);
    } catch (error) {
      console.error("Error updating student status:", error);
      res.status(400).json({ message: "Failed to update student status" });
    }
  });

  app.patch("/api/students/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const student = await storage.updateStudent(id, updateData);
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(400).json({ message: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStudent(id);
      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(400).json({ message: "Failed to delete student" });
    }
  });

  // Admins endpoints (admin only)
  app.get("/api/admins", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const admins = await storage.getAdmins();
      res.json(admins);
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  app.post("/api/admins", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const validatedData = insertAdminSchema.parse(req.body);
      const admin = await storage.createAdmin(validatedData);
      res.json(admin);
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(400).json({ message: "Failed to create admin" });
    }
  });

  app.delete("/api/admins/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAdmin(id);
      res.json({ message: "Admin deleted successfully" });
    } catch (error) {
      console.error("Error deleting admin:", error);
      res.status(400).json({ message: "Failed to delete admin" });
    }
  });

  // Attendance endpoints (admin only)
  app.get("/api/attendance", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { date } = req.query;
      if (!date) {
        return res.status(400).json({ message: "Date parameter required" });
      }
      const attendance = await storage.getAttendanceByDate(date as string);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertAttendanceSchema.parse({
        ...req.body,
        markedBy: userId,
      });
      const attendance = await storage.markAttendance(validatedData);
      res.json(attendance);
    } catch (error) {
      console.error("Error marking attendance:", error);
      res.status(400).json({ message: "Failed to mark attendance" });
    }
  });

  // Highlights endpoints (admin only)
  app.get("/api/highlights", isAuthenticated, async (req, res) => {
    try {
      const highlights = await storage.getHighlights();
      res.json(highlights);
    } catch (error) {
      console.error("Error fetching highlights:", error);
      res.status(500).json({ message: "Failed to fetch highlights" });
    }
  });

  app.post("/api/highlights", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertHighlightSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const highlight = await storage.createHighlight(validatedData);
      res.json(highlight);
    } catch (error) {
      console.error("Error creating highlight:", error);
      res.status(400).json({ message: "Failed to create highlight" });
    }
  });

  app.patch("/api/highlights/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const highlight = await storage.updateHighlight(id, req.body);
      res.json(highlight);
    } catch (error) {
      console.error("Error updating highlight:", error);
      res.status(400).json({ message: "Failed to update highlight" });
    }
  });

  app.delete("/api/highlights/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteHighlight(id);
      res.json({ message: "Highlight deleted successfully" });
    } catch (error) {
      console.error("Error deleting highlight:", error);
      res.status(400).json({ message: "Failed to delete highlight" });
    }
  });

  // Schedule endpoints
  app.get("/api/schedule", isAuthenticated, async (req, res) => {
    try {
      const { date } = req.query;
      const schedules = date 
        ? await storage.getSchedulesByDate(date as string)
        : await storage.getSchedules();
      res.json(schedules);
    } catch (error) {
      console.error("Error fetching schedule:", error);
      res.status(500).json({ message: "Failed to fetch schedule" });
    }
  });

  app.post("/api/schedule", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertScheduleSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      const schedule = await storage.createSchedule(validatedData);
      res.json(schedule);
    } catch (error) {
      console.error("Error creating schedule:", error);
      res.status(400).json({ message: "Failed to create schedule" });
    }
  });

  app.patch("/api/schedule/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const schedule = await storage.updateSchedule(id, req.body);
      res.json(schedule);
    } catch (error) {
      console.error("Error updating schedule:", error);
      res.status(400).json({ message: "Failed to update schedule" });
    }
  });

  app.delete("/api/schedule/:id", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteSchedule(id);
      res.json({ message: "Schedule deleted successfully" });
    } catch (error) {
      console.error("Error deleting schedule:", error);
      res.status(400).json({ message: "Failed to delete schedule" });
    }
  });

  // Dashboard stats endpoint
  app.get("/api/dashboard/stats", isAuthenticated, isAdmin, async (req, res) => {
    try {
      const students = await storage.getStudents();
      const pendingStudents = await storage.getPendingStudents();
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = await storage.getAttendanceByDate(today);
      const todaySchedule = await storage.getSchedulesByDate(today);
      
      const presentToday = todayAttendance.filter(a => a.status === 'present').length;
      
      res.json({
        totalStudents: students.length,
        presentToday,
        pendingApprovals: pendingStudents.length,
        upcomingEvents: todaySchedule.length,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
