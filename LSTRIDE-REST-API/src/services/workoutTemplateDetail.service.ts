import { prisma } from "../lib/prisma";

interface CreateDetailInput {
  exerciseId: string;
  sets: number;
  reps: number;
  weight?: number;
}

interface UpdateDetailInput {
  exerciseId?: string;
  sets?: number;
  reps?: number;
  weight?: number | null;
}

interface BulkUpdateInput {
  updates?: Array<{
    id: string;
    exerciseId?: string;
    sets?: number;
    reps?: number;
    weight?: number | null;
  }>;

  deletes?: string[];

  adds?: CreateDetailInput[];
}


const exerciseSelect = {
  id: true,
  name: true,
  level: true,
  category: true,
  primaryMuscles: true,
  images: true,
};

const creatorSelect = {
  id: true,
  name: true,
  profileImage: true,
};

const templateSelect = {
  id: true,
  name: true,
  description: true,
  visibility: true,
  createdAt: true,
  updatedAt: true,
  creator: {
    select: creatorSelect,
  },
};

/**
 * GET
 * /api/workout-template-details/:templateId?limit=20&start=0
 *
 * ไม่ตรวจ visibility
 */
export const getWorkoutTemplateDetails = async (
  templateId: string,
  limit: number,
  start: number
) => {
  // เปลี่ยนจาก .create เป็น .findUnique เพื่อดึงข้อมูลเทมเพลตตาม templateId
  const [template, data, total] = await Promise.all([
    prisma.workoutTemplate.findUnique({
      where: {
        id: templateId,
      },
      select: templateSelect,
    }),

    prisma.workoutTemplateDetail.findMany({
      where: {
        templateId,
      },

      orderBy: {
        id: "asc",
      },

      skip: start,
      take: limit,

      include: {
        exercise: {
          select: exerciseSelect,
        },
      },
    }),

    prisma.workoutTemplateDetail.count({
      where: {
        templateId,
      },
    }),
  ]);

  // เช็กเผื่อไว้ในกรณีที่ไม่พบเทมเพลตนี้ในระบบ
  if (!template) {
    throw new Error("Workout template not found");
  }

  return {
    template, // เพิ่มข้อมูลเทมเพลตกลับออกไปด้วย (ถ้าฝั่ง controller ต้องการใช้งาน)
    data,
    pagination: {
      limit,
      start,
      count: data.length,
      total,
      hasMore: start + data.length < total,
    },
  };
};


/**
 * POST
 * /api/workout-template-details/:templateId
 *
 * เพิ่มท่าออกกำลังกายเข้า template
 * ไม่อนุญาตให้มี exercise เดิมซ้ำใน template เดียวกัน
 */
export const createWorkoutTemplateDetail = async (
  templateId: string,
  data: CreateDetailInput
) => {
  const template = await prisma.workoutTemplate.findUnique({
    where: {
      id: templateId,
    },
  });

  if (!template) {
    throw new Error("Workout template not found");
  }

  const exercise = await prisma.exercise.findUnique({
    where: {
      id: data.exerciseId,
    },
  });

  if (!exercise) {
    throw new Error("Exercise not found");
  }

  // ตรวจว่าท่านี้มีอยู่ใน template แล้วหรือยัง
  const existingDetail =
    await prisma.workoutTemplateDetail.findFirst({
      where: {
        templateId,
        exerciseId: data.exerciseId,
      },
    });

  if (existingDetail) {
    throw new Error(
      "This exercise already exists in this workout template"
    );
  }

  return prisma.workoutTemplateDetail.create({
    // @ts-ignore
    data: {
      templateId,
      exerciseId: data.exerciseId,
      sets: data.sets,
      reps: data.reps,
      weight: data.weight,
    },

    include: {
      exercise: {
        select: exerciseSelect,
      },
    },
  });
};

/**
 * PATCH
 * /api/workout-template-details/:detailId
 *
 * แก้ไข detail
 */
export const updateWorkoutTemplateDetail = async (
  detailId: string,
  data: UpdateDetailInput
) => {
  const detail = await prisma.workoutTemplateDetail.findUnique({
    where: {
      id: detailId,
    },
  });

  if (!detail) {
    throw new Error("Workout template detail not found");
  }

  // ถ้ามีการเปลี่ยน exercise
  if (data.exerciseId) {
    const exercise = await prisma.exercise.findUnique({
      where: {
        id: data.exerciseId,
      },
    });

    if (!exercise) {
      throw new Error("Exercise not found");
    }

    // ตรวจว่าท่าใหม่ซ้ำกับ detail อื่นใน template เดียวกันหรือไม่
    const existingDetail =
      await prisma.workoutTemplateDetail.findFirst({
        where: {
          templateId: detail.templateId,
          exerciseId: data.exerciseId,

          // ไม่ตรวจตัวเอง
          NOT: {
            id: detailId,
          },
        },
      });

    if (existingDetail) {
      throw new Error(
        "This exercise already exists in this workout template"
      );
    }
  }

  return prisma.workoutTemplateDetail.update({
    where: {
      id: detailId,
    },

    data,

    include: {
      exercise: {
        select: exerciseSelect,
      },
    },
  });
};

/**
 * DELETE
 * /api/workout-template-details/:detailId
 */
export const deleteWorkoutTemplateDetail = async (
  detailId: string
) => {
  const detail = await prisma.workoutTemplateDetail.findUnique({
    where: {
      id: detailId,
    },
  });

  if (!detail) {
    throw new Error("Workout template detail not found");
  }

  await prisma.workoutTemplateDetail.delete({
    where: {
      id: detailId,
    },
  });

  return {
    message: "Workout template detail deleted successfully",
  };
};

/**
 * BULK
 * PATCH /api/workout-template-details/:templateId/bulk
 *
 * UPDATE + DELETE + ADD
 *
 * ทำทั้งหมดใน transaction เดียว
 */
export const bulkUpdateWorkoutTemplateDetails = async (
  templateId: string,
  data: BulkUpdateInput
) => {
  return prisma.$transaction(async (tx) => {
    const template = await tx.workoutTemplate.findUnique({
      where: {
        id: templateId,
      },
    });

    if (!template) {
      throw new Error("Workout template not found");
    }

    /**
     * UPDATE
     */
    if (data.updates?.length) {
      for (const item of data.updates) {
        const detail =
          await tx.workoutTemplateDetail.findFirst({
            where: {
              id: item.id,
              templateId,
            },
          });

        if (!detail) {
          throw new Error(
            `Workout template detail not found: ${item.id}`
          );
        }

        /**
         * ถ้ามีการเปลี่ยน exercise
         */
        if (item.exerciseId) {
          const exercise = await tx.exercise.findUnique({
            where: {
              id: item.exerciseId,
            },
          });

          if (!exercise) {
            throw new Error(
              `Exercise not found: ${item.exerciseId}`
            );
          }

          /**
           * ตรวจว่า exercise ใหม่ซ้ำกับ detail อื่น
           * ใน template เดียวกันหรือไม่
           */
          const existingDetail =
            await tx.workoutTemplateDetail.findFirst({
              where: {
                templateId,
                exerciseId: item.exerciseId,

                NOT: {
                  id: item.id,
                },
              },
            });

          if (existingDetail) {
            continue;
            }
        }

        const { id, ...updateData } = item;

        await tx.workoutTemplateDetail.update({
          where: {
            id,
          },

          data: updateData,
        });
      }
    }

    /**
     * DELETE
     */
    if (data.deletes?.length) {
      for (const detailId of data.deletes) {
        const detail =
          await tx.workoutTemplateDetail.findFirst({
            where: {
              id: detailId,
              templateId,
            },
          });

        if (!detail) {
          throw new Error(
            `Workout template detail not found: ${detailId}`
          );
        }

        await tx.workoutTemplateDetail.delete({
          where: {
            id: detailId,
          },
        });
      }
    }

    /**
     * ADD
     */
    if (data.adds?.length) {
      for (const item of data.adds) {
        /**
         * ตรวจว่า exercise มีอยู่จริง
         */
        const exercise = await tx.exercise.findUnique({
          where: {
            id: item.exerciseId,
          },
        });

        if (!exercise) {
          throw new Error(
            `Exercise not found: ${item.exerciseId}`
          );
        }

        /**
         * ตรวจว่า exercise นี้มีอยู่ใน template แล้วหรือยัง
         */
        const existingDetail =
          await tx.workoutTemplateDetail.findFirst({
            where: {
              templateId,
              exerciseId: item.exerciseId,
            },
          });

        if (existingDetail) {
          throw new Error(
            `Exercise already exists in workout template: ${item.exerciseId}`
          );
        }

        /**
         * เพิ่ม detail
         */
        await tx.workoutTemplateDetail.create({
        // @ts-ignore
          data: {
            templateId,
            exerciseId: item.exerciseId,
            sets: item.sets,
            reps: item.reps,
            weight: item.weight,
          },
        });
      }
    }

    /**
     * คืนข้อมูลล่าสุด
     */
    return tx.workoutTemplateDetail.findMany({
      where: {
        templateId,
      },

      orderBy: {
        id: "asc",
      },

      include: {
        exercise: {
          select: exerciseSelect,
        },
      },
    });
  });
};