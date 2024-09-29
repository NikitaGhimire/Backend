const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
require("dotenv").config();
const deleteAllUsers = async () => {
  try {
    // Delete all users
    const deleteUsers = await prisma.user.deleteMany();
    console.log(`${deleteUsers.count} users deleted.`);
  } catch (error) {
    console.error("Error deleting users:", error);
  } finally {
    await prisma.$disconnect(); // Close the Prisma connection
  }
};

deleteAllUsers();
