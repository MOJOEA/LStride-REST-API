import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const CSV_PATH = path.join(
  process.cwd(),
  "data",
  "exercises.csv"
);

const EXERCISES_DIR = path.join(
  process.cwd(),
  "uploads",
  "exercises"
);

/**
 * รองรับข้อมูลประมาณ:
 *
 * ["quadriceps", "glutes"]
 * หรือ
 * quadriceps
 * หรือ
 * quadriceps,glutes
 */
function parseArray(value: string | undefined): string[] {
  if (!value || !value.trim()) {
    return [];
  }

  const text = value.trim();

  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }

    return [String(parsed)];
  } catch {
    return text
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

/**
 * instructions บาง dataset เป็น JSON array
 * บาง dataset อาจเป็นข้อความธรรมดา
 */
function parseInstructions(value: string | undefined): string[] {
  if (!value || !value.trim()) {
    return [];
  }

  const text = value.trim();

  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed.map(String);
    }

    return [String(parsed)];
  } catch {
    return [text];
  }
}

/**
 * หาไฟล์รูปจาก:
 *
 * uploads/exercises/{exerciseId}/
 *
 * แล้วแปลงเป็น:
 *
 * /uploads/exercises/{exerciseId}/0.jpg
 * /uploads/exercises/{exerciseId}/1.jpg
 */
function getExerciseImages(exerciseId: string): string[] {
  const exerciseDir = path.join(
    EXERCISES_DIR,
    exerciseId
  );

  if (!fs.existsSync(exerciseDir)) {
    return [];
  }

  const files = fs
    .readdirSync(exerciseDir)
    .filter((file) =>
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    )
    .sort((a, b) => {
      const aNumber = parseInt(
        path.parse(a).name,
        10
      );

      const bNumber = parseInt(
        path.parse(b).name,
        10
      );

      if (
        !Number.isNaN(aNumber) &&
        !Number.isNaN(bNumber)
      ) {
        return aNumber - bNumber;
      }

      return a.localeCompare(b);
    });

  return files.map(
    (file) =>
      `/uploads/exercises/${exerciseId}/${file}`
  );
}

async function main() {
  console.log("Reading CSV...");

  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(
      `CSV file not found: ${CSV_PATH}`
    );
  }

  const csv = fs.readFileSync(
    CSV_PATH,
    "utf-8"
  );

  const records = parse(csv, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    relax_column_count: true,
  });

  console.log(
    `Found ${records.length} exercises`
  );

  let success = 0;

  for (const row of records) {
    const id = String(row.id ?? "").trim();

    if (!id) {
      console.warn(
        "Skipping exercise without id"
      );
      continue;
    }

    const images = getExerciseImages(id);

    await prisma.exercise.upsert({
      where: {
        id,
      },

      update: {
        name: String(row.name ?? "").trim(),

        force:
          row.force?.trim() || null,

        level:
          String(row.level ?? "").trim(),

        mechanic:
          row.mechanic?.trim() || null,

        equipment:
          row.equipment?.trim() || null,

        primaryMuscles:
          parseArray(row.primaryMuscles),

        secondaryMuscles:
          parseArray(row.secondaryMuscles),

        instructions:
          parseInstructions(row.instructions),

        category:
          String(row.category ?? "").trim(),

        images,
      },

      create: {
        id,

        name:
          String(row.name ?? "").trim(),

        force:
          row.force?.trim() || null,

        level:
          String(row.level ?? "").trim(),

        mechanic:
          row.mechanic?.trim() || null,

        equipment:
          row.equipment?.trim() || null,

        primaryMuscles:
          parseArray(row.primaryMuscles),

        secondaryMuscles:
          parseArray(row.secondaryMuscles),

        instructions:
          parseInstructions(row.instructions),

        category:
          String(row.category ?? "").trim(),

        images,
      },
    });

    success++;

    console.log(
      `✓ ${id} (${images.length} images)`
    );
  }

  console.log(
    `\nImported ${success}/${records.length} exercises`
  );
}

main()
  .catch((error) => {
    console.error(
      "\nSeed failed:",
      error
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });