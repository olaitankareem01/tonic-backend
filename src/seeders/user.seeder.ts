import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { User } from 'src/models/entities/user.entity';
import { AppModule } from 'src/app.module';


dotenv.config();

export async function seedUser() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userModel = app.get<Model<User>>(getModelToken(User.name));

  const userData = {
    email: 'admin@example.com',
    password: 'admin1234!',
  };

  try {

    const existingUser = await userModel.findOne({ email: userData.email });
    if (existingUser) {
      console.log('User already exists, skipping seeding.');
      return;
    }


    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = new userModel({
      email: userData.email,
      password: hashedPassword,
    });

    await newUser.save();
    console.log('User seeded successfully:', userData.email);
  } catch (error) {
    console.error('Error seeding user:', error);
  } finally {
    await app.close();
  }
}

seedUser();
