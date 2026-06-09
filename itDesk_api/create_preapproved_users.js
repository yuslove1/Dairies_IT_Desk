const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

// ============================================================================
// Add the office emails you want to pre-approve here.
// You can run this script whenever you need to add more people.
// ============================================================================
const USERS_TO_CREATE = [
  {
    email: "itusers@uacfoodsng.com",
    name: "IT User",
    role: "staff", // options: "staff", "manager", "admin"
  },
  {
    email: "Odairo@uacfoodsng.com",
    name: "Oluwasegun Dairo",
    role: "admin",
  },
  // Add more users here...
];

// The default password that will be assigned to these accounts.
// They can log in immediately with this and change it later.
const DEFAULT_PASSWORD = "Password123!";

async function createUsers() {
  console.log("Starting to create pre-approved users...");
  
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const user of USERS_TO_CREATE) {
    try {
      // Check if user already exists
      const existing = await prisma.user.findUnique({ where: { email: user.email } });
      
      if (existing) {
        console.log(`[SKIP] User ${user.email} already exists.`);
        continue;
      }

      // Create the user as ALREADY VERIFIED
      await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          role: user.role,
          passwordHash: passwordHash,
          isVerified: true, // This skips the OTP entirely!
        },
      });

      console.log(`[SUCCESS] Created ${user.email} with role ${user.role}`);
    } catch (error) {
      console.error(`[ERROR] Failed to create ${user.email}:`, error.message);
    }
  }

  console.log("\nFinished. Tell these users they can log in using:");
  console.log(`Password: ${DEFAULT_PASSWORD}`);
}

createUsers()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
