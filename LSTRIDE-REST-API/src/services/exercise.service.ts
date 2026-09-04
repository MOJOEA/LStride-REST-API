import {prisma} from "../lib/prisma";

interface ExerciseQuery {
  name?: string;
  equipment?: string;
  level?: string;
  category?: string;
  muscle?: string;
  limit?: number;
}

export const getExercises = async ({
  name,
  equipment,
  level,
  category,
  muscle,
  limit = 50,
}: ExerciseQuery) => {
  return prisma.exercise.findMany({
    where: {
      ...(name && {
        name: {
          contains: name,
          mode: "insensitive",
        },
      }),

      ...(equipment && {
        equipment: {
          equals: equipment,
          mode: "insensitive",
        },
      }),

      ...(level && {
        level: {
          equals: level,
          mode: "insensitive",
        },
      }),

      ...(category && {
        category: {
          equals: category,
          mode: "insensitive",
        },
      }),

      ...(muscle && {
        OR: [
          {
            // @ts-ignore
            primaryMuscles: {
              has: muscle,
            },
          },
          {
            secondaryMuscles: {
              has: muscle,
            },
          },
        ],
      }),
    },

    select: {
      id: true,
      name: true,
      // @ts-ignore
      primaryMuscles: true,
      level: true,
      category: true,
      images: true,
    },

    take: Math.min(limit, 100),

    orderBy: {
      name: "asc",
    },
  });
};

export const getExerciseById = async (id: string) => {
  return prisma.exercise.findUnique({
    where: {
      id,
    },
  });
};