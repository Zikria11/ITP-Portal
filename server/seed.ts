import { db } from "./db";
import { users, admins } from "@shared/schema";

async function seedDatabase() {
  console.log("Seeding database...");

  // Create a dummy admin user
  const adminUserId = "admin-001";
  
  try {
    // Insert or update the admin user
    await db
      .insert(users)
      .values({
        id: adminUserId,
        email: "admin@vis.gov.pk",
        firstName: "VIS",
        lastName: "Administrator",
        profileImageUrl: null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: "admin@vis.gov.pk",
          firstName: "VIS",
          lastName: "Administrator",
          updatedAt: new Date(),
        },
      });

    // Insert or update the admin record
    await db
      .insert(admins)
      .values({
        userId: adminUserId,
        name: "VIS Administrator",
        email: "admin@vis.gov.pk",
        role: "admin",
      })
      .onConflictDoUpdate({
        target: admins.email,
        set: {
          userId: adminUserId,
          name: "VIS Administrator",
          role: "admin",
          updatedAt: new Date(),
        },
      });

    console.log("✅ Admin account created successfully!");
    console.log("Email: admin@vis.gov.pk");
    console.log("This account can now access all admin features.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

seedDatabase().then(() => process.exit(0));