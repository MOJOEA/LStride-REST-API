import { OAuth2Client } from "google-auth-library";

import { prisma } from "../../lib/prisma";
import { hashPassword, comparePassword } from "../../utils/password";
import { generateAccessToken } from "../../utils/jwt";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
);

export const register = async (
  name: string,
  gender: string,
  email: string,
  password: string,
) => {
  const existingUser = await prisma.user.findUnique({
    where: {email,},
});

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      gender,
      email,
      password: hashedPassword,
    },
  });

  const accessToken = generateAccessToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      gender: user.gender,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
    },
    accessToken,
  };
};

export const login = async (
  email: string,
  password: string,
) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (!user.password) {
    throw new Error("ACCOUNT_USES_GOOGLE");
  }

  const isPasswordValid = await comparePassword(
    password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new Error("INVALID_CREDENTIALS");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("ACCOUNT_NOT_ACTIVE");
  }

  const accessToken = generateAccessToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
    },
    accessToken,
  };
};

export const loginWithGoogle = async (idToken: string) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID_NOT_CONFIGURED");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: clientId, // ปลอดภัย 100% สำหรับ TypeScript
  });

  const payload = ticket.getPayload();

  if (!payload) {
    throw new Error("INVALID_GOOGLE_TOKEN");
  }

  const googleId = payload.sub;
  const email = payload.email;

  if (!googleId || !email) {
    throw new Error("GOOGLE_ACCOUNT_DATA_MISSING");
  }

  if (!payload.email_verified) {
    throw new Error("GOOGLE_EMAIL_NOT_VERIFIED");
  }

  // 2. คิวรีตรวจสอบข้อมูล Account เก่า
  const existingAccount = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "GOOGLE",
        providerAccountId: googleId,
      },
    },
    include: {
      user: true,
    },
  });

  if (existingAccount) {
    if (existingAccount.user.status !== "ACTIVE") {
      throw new Error("ACCOUNT_NOT_ACTIVE");
    }

    const accessToken = generateAccessToken(existingAccount.user.id);

    return {
      user: {
        id: existingAccount.user.id,
        name: existingAccount.user.name,
        email: existingAccount.user.email,
        profileImage: existingAccount.user.profileImage,
        role: existingAccount.user.role,
      },
      accessToken,
    };
  }

  // 3. ตรวจสอบกรณีสมัครใช้งานซ้ำซ้อนด้วยอีเมลปกติ
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("EMAIL_ALREADY_REGISTERED");
  }

  // 4. ขั้นตอนการสร้าง User และผูก Account ตัวใหม่พร้อมกัน
  const user = await prisma.user.create({
    data: {
      name: payload.name ?? "Google User",
      email,
      profileImage: payload.picture ?? null,
      accounts: {
        create: {
          type: "oauth",
          provider: "GOOGLE",
          providerAccountId: googleId,
        },
      },
    },
  });

  const accessToken = generateAccessToken(user.id);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      role: user.role,
    },
    accessToken,
  };
};