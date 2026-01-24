//  src/app/admin/services/[id]/gallery/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join } from "path";
import { randomBytes } from "crypto";

// Путь для сохранения файлов
const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), "public", "uploads");

// Генерация уникального имени файла
function generateFileName(originalName: string): string {
  const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
  const hash = randomBytes(8).toString("hex");
  return `${hash}.${ext}`;
}

// Сохранение файла
async function saveFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  const fileName = generateFileName(file.name);
  const filePath = join(UPLOAD_DIR, fileName);
  
  // Создаём директорию если не существует
  await mkdir(UPLOAD_DIR, { recursive: true });
  
  await writeFile(filePath, buffer);
  
  return `/uploads/${fileName}`;
}

// Удаление файла
async function deleteFile(url: string): Promise<void> {
  if (!url.startsWith("/uploads/")) return;
  
  const fileName = url.replace("/uploads/", "");
  const filePath = join(UPLOAD_DIR, fileName);
  
  try {
    await unlink(filePath);
  } catch {
    // Файл может не существовать, игнорируем
  }
}

// Загрузка фото в галерею
export async function uploadGalleryImage(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const serviceId = formData.get("serviceId") as string;
    const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

    if (!file || !serviceId) {
      return { success: false, error: "Не указан файл или услуга" };
    }

    // Проверяем тип файла
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Можно загружать только изображения" };
    }

    // Проверяем размер (макс 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return { success: false, error: "Максимальный размер файла 10MB" };
    }

    // Сохраняем файл
    const imageUrl = await saveFile(file);

    // Создаём запись в БД
    const galleryItem = await prisma.serviceGallery.create({
      data: {
        serviceId,
        image: imageUrl,
        sortOrder,
      },
    });

    revalidatePath("/admin/services");
    revalidatePath("/services");

    return { 
      success: true, 
      item: {
        id: galleryItem.id,
        image: galleryItem.image,
        caption: galleryItem.caption,
        sortOrder: galleryItem.sortOrder,
      }
    };
  } catch (error) {
    console.error("Error uploading gallery image:", error);
    return { success: false, error: "Ошибка загрузки" };
  }
}

// Удаление фото из галереи
export async function deleteGalleryImage(imageId: string) {
  try {
    const image = await prisma.serviceGallery.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      return { success: false, error: "Фото не найдено" };
    }

    // Удаляем файл
    await deleteFile(image.image);

    // Удаляем запись из БД
    await prisma.serviceGallery.delete({
      where: { id: imageId },
    });

    revalidatePath("/admin/services");
    revalidatePath("/services");

    return { success: true };
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    return { success: false, error: "Ошибка удаления" };
  }
}

// Обновление порядка фото
export async function updateGalleryOrder(items: { id: string; sortOrder: number }[]) {
  try {
    await Promise.all(
      items.map((item) =>
        prisma.serviceGallery.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    revalidatePath("/admin/services");
    revalidatePath("/services");

    return { success: true };
  } catch (error) {
    console.error("Error updating gallery order:", error);
    return { success: false, error: "Ошибка сохранения порядка" };
  }
}

// Обновление обложки услуги
export async function updateServiceCover(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    const serviceId = formData.get("serviceId") as string;

    if (!file || !serviceId) {
      return { success: false, error: "Не указан файл или услуга" };
    }

    // Проверяем тип файла
    if (!file.type.startsWith("image/")) {
      return { success: false, error: "Можно загружать только изображения" };
    }

    // Получаем текущую обложку
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { cover: true },
    });

    // Удаляем старую обложку если есть
    if (service?.cover) {
      await deleteFile(service.cover);
    }

    // Сохраняем новый файл
    const imageUrl = await saveFile(file);

    // Обновляем запись в БД
    await prisma.service.update({
      where: { id: serviceId },
      data: { cover: imageUrl },
    });

    revalidatePath("/admin/services");
    revalidatePath("/services");

    return { success: true, cover: imageUrl };
  } catch (error) {
    console.error("Error updating service cover:", error);
    return { success: false, error: "Ошибка загрузки" };
  }
}

// Удаление обложки услуги
export async function deleteServiceCover(serviceId: string) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { cover: true },
    });

    if (service?.cover) {
      await deleteFile(service.cover);
    }

    await prisma.service.update({
      where: { id: serviceId },
      data: { cover: null },
    });

    revalidatePath("/admin/services");
    revalidatePath("/services");

    return { success: true };
  } catch (error) {
    console.error("Error deleting service cover:", error);
    return { success: false, error: "Ошибка удаления" };
  }
}




// "use server";

// import { revalidatePath } from "next/cache";
// import { prisma } from "@/lib/db";
// import { writeFile, mkdir, unlink } from "fs/promises";
// import { join } from "path";
// import { randomBytes } from "crypto";

// // Путь для сохранения файлов
// const UPLOAD_DIR = process.env.UPLOAD_DIR || join(process.cwd(), "public", "uploads");

// // Генерация уникального имени файла
// function generateFileName(originalName: string): string {
//   const ext = originalName.split(".").pop()?.toLowerCase() || "jpg";
//   const hash = randomBytes(8).toString("hex");
//   return `${hash}.${ext}`;
// }

// // Сохранение файла
// async function saveFile(file: File): Promise<string> {
//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);
  
//   const fileName = generateFileName(file.name);
//   const filePath = join(UPLOAD_DIR, fileName);
  
//   // Создаём директорию если не существует
//   await mkdir(UPLOAD_DIR, { recursive: true });
  
//   await writeFile(filePath, buffer);
  
//   return `/uploads/${fileName}`;
// }

// // Удаление файла
// async function deleteFile(url: string): Promise<void> {
//   if (!url.startsWith("/uploads/")) return;
  
//   const fileName = url.replace("/uploads/", "");
//   const filePath = join(UPLOAD_DIR, fileName);
  
//   try {
//     await unlink(filePath);
//   } catch {
//     // Файл может не существовать, игнорируем
//   }
// }

// // Загрузка фото в галерею
// export async function uploadGalleryImage(formData: FormData) {
//   try {
//     const file = formData.get("file") as File;
//     const serviceId = formData.get("serviceId") as string;
//     const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

//     if (!file || !serviceId) {
//       return { success: false, error: "Не указан файл или услуга" };
//     }

//     // Проверяем тип файла
//     if (!file.type.startsWith("image/")) {
//       return { success: false, error: "Можно загружать только изображения" };
//     }

//     // Проверяем размер (макс 10MB)
//     if (file.size > 10 * 1024 * 1024) {
//       return { success: false, error: "Максимальный размер файла 10MB" };
//     }

//     // Сохраняем файл
//     const imageUrl = await saveFile(file);

//     // Создаём запись в БД
//     const galleryItem = await prisma.serviceGallery.create({
//       data: {
//         serviceId,
//         image: imageUrl,
//         sortOrder,
//       },
//     });

//     revalidatePath("/admin/services");
//     revalidatePath("/services");

//     return { 
//       success: true, 
//       item: {
//         id: galleryItem.id,
//         image: galleryItem.image,
//         caption: galleryItem.caption,
//         sortOrder: galleryItem.sortOrder,
//       }
//     };
//   } catch (error) {
//     console.error("Error uploading gallery image:", error);
//     return { success: false, error: "Ошибка загрузки" };
//   }
// }

// // Удаление фото из галереи
// export async function deleteGalleryImage(imageId: string) {
//   try {
//     const image = await prisma.serviceGallery.findUnique({
//       where: { id: imageId },
//     });

//     if (!image) {
//       return { success: false, error: "Фото не найдено" };
//     }

//     // Удаляем файл
//     await deleteFile(image.image);

//     // Удаляем запись из БД
//     await prisma.serviceGallery.delete({
//       where: { id: imageId },
//     });

//     revalidatePath("/admin/services");
//     revalidatePath("/services");

//     return { success: true };
//   } catch (error) {
//     console.error("Error deleting gallery image:", error);
//     return { success: false, error: "Ошибка удаления" };
//   }
// }

// // Обновление порядка фото
// export async function updateGalleryOrder(items: { id: string; sortOrder: number }[]) {
//   try {
//     await Promise.all(
//       items.map((item) =>
//         prisma.serviceGallery.update({
//           where: { id: item.id },
//           data: { sortOrder: item.sortOrder },
//         })
//       )
//     );

//     revalidatePath("/admin/services");
//     revalidatePath("/services");

//     return { success: true };
//   } catch (error) {
//     console.error("Error updating gallery order:", error);
//     return { success: false, error: "Ошибка сохранения порядка" };
//   }
// }

// // Обновление обложки услуги
// export async function updateServiceCover(formData: FormData) {
//   try {
//     const file = formData.get("file") as File;
//     const serviceId = formData.get("serviceId") as string;

//     if (!file || !serviceId) {
//       return { success: false, error: "Не указан файл или услуга" };
//     }

//     // Проверяем тип файла
//     if (!file.type.startsWith("image/")) {
//       return { success: false, error: "Можно загружать только изображения" };
//     }

//     // Получаем текущую обложку
//     const service = await prisma.service.findUnique({
//       where: { id: serviceId },
//       select: { cover: true },
//     });

//     // Удаляем старую обложку если есть
//     if (service?.cover) {
//       await deleteFile(service.cover);
//     }

//     // Сохраняем новый файл
//     const imageUrl = await saveFile(file);

//     // Обновляем запись в БД
//     await prisma.service.update({
//       where: { id: serviceId },
//       data: { cover: imageUrl },
//     });

//     revalidatePath("/admin/services");
//     revalidatePath("/services");

//     return { success: true, cover: imageUrl };
//   } catch (error) {
//     console.error("Error updating service cover:", error);
//     return { success: false, error: "Ошибка загрузки" };
//   }
// }

// // Удаление обложки услуги
// export async function deleteServiceCover(serviceId: string) {
//   try {
//     const service = await prisma.service.findUnique({
//       where: { id: serviceId },
//       select: { cover: true },
//     });

//     if (service?.cover) {
//       await deleteFile(service.cover);
//     }

//     await prisma.service.update({
//       where: { id: serviceId },
//       data: { cover: null },
//     });

//     revalidatePath("/admin/services");
//     revalidatePath("/services");

//     return { success: true };
//   } catch (error) {
//     console.error("Error deleting service cover:", error);
//     return { success: false, error: "Ошибка удаления" };
//   }
// }