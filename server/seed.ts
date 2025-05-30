import { db } from './db';
import { users } from '@shared/schema';
import { hashPassword } from './auth';

/**
 * Seeds the database with initial data
 */
export async function seedDatabase() {
  try {
    // Check if admin user already exists
    const adminUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.username, 'admin')
    });

    if (!adminUser) {
      console.log('Creating admin user...');
      // Create admin user
      await db.insert(users).values({
        username: 'admin',
        email: 'admin@intellaone.com',
        password: await hashPassword('password123'),
        fullName: 'Admin User',
        role: 'admin',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        jobTitle: 'Administrator'
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user already exists');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}