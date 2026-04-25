// scripts/migrate-services-i18n.ts
/**
 * Скрипт миграции существующих услуг на мультиязычную систему
 * 
 * ВАЖНО: Запускать ДО изменения схемы Prisma!
 * 
 * Что делает:
 * 1. Читает все существующие услуги (name, description)
 * 2. Создаёт переводы на дефолтном языке (немецкий)
 * 3. Сохраняет в новую таблицу service_translations
 * 
 * Запуск:
 * npx tsx scripts/migrate-services-i18n.ts
 * 
 * или
 * 
 * npm install -g tsx
 * tsx scripts/migrate-services-i18n.ts
 */

import { prisma } from '../src/lib/prisma';

// Дефолтный язык для существующих данных
const DEFAULT_LOCALE = 'de'; // Немецкий

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function migrateServices() {
  log('\n🚀 Начало миграции услуг на i18n систему...\n', colors.bright);
  log('═'.repeat(60), colors.cyan);

  try {
    // 1. Получаем все услуги с текущими данными
    log('\n📊 Получение существующих услуг...', colors.blue);

    const services = await prisma.service.findMany({
      select: {
        id: true,
        name: true, // @map("title")
        description: true,
        slug: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    log(`   Найдено услуг: ${colors.bright}${services.length}${colors.reset}`, colors.green);

    if (services.length === 0) {
      log('\n⚠️  Нет услуг для миграции', colors.yellow);
      return;
    }

    log('\n═'.repeat(60), colors.cyan);

    // 2. Для каждой услуги создаём перевод
    let created = 0;
    let skipped = 0;
    let errors = 0;

    log('\n📝 Создание переводов...\n', colors.blue);

    for (const service of services) {
      try {
        // Проверяем, не создан ли уже перевод
        const existingTranslation = await prisma.serviceTranslation.findUnique({
          where: {
            serviceId_locale: {
              serviceId: service.id,
              locale: DEFAULT_LOCALE,
            },
          },
        });

        if (existingTranslation) {
          log(`   ⏭️  Пропущено: "${service.name}" (перевод уже существует)`, colors.yellow);
          skipped++;
          continue;
        }

        // Создаём перевод на дефолтном языке
        await prisma.serviceTranslation.create({
          data: {
            serviceId: service.id,
            locale: DEFAULT_LOCALE,
            name: service.name,
            description: service.description,
          },
        });

        log(`   ✅ Создано: "${colors.bright}${service.name}${colors.reset}" [${DEFAULT_LOCALE.toUpperCase()}]`, colors.green);
        created++;
      } catch (error) {
        log(`   ❌ Ошибка для "${service.name}": ${error}`, colors.red);
        errors++;
      }
    }

    // 3. Итоговая статистика
    log('\n═'.repeat(60), colors.cyan);
    log('\n📈 Статистика миграции:', colors.bright);
    log(`   Всего услуг:        ${services.length}`, colors.cyan);
    log(`   Создано переводов:  ${colors.green}${created}${colors.reset}`);
    log(`   Пропущено:          ${colors.yellow}${skipped}${colors.reset}`);
    log(`   Ошибок:             ${errors > 0 ? colors.red : colors.green}${errors}${colors.reset}`);

    // 4. Проверяем результат
    log('\n🔍 Проверка результата...', colors.blue);

    const translationsCount = await prisma.serviceTranslation.count();
    log(`   Всего переводов в БД: ${colors.bright}${translationsCount}${colors.reset}`, colors.green);

    // 5. Показываем пример
    const sampleService = await prisma.service.findFirst({
      include: {
        translations: true,
      },
    });

    if (sampleService) {
      log('\n📄 Пример услуги с переводом:', colors.blue);
      log(`   ID: ${sampleService.id}`, colors.cyan);
      log(`   Slug: ${sampleService.slug}`, colors.cyan);
      log(`   Переводы:`, colors.cyan);
      sampleService.translations.forEach(t => {
        log(`     - [${t.locale.toUpperCase()}] ${t.name}`, colors.green);
      });
    }

    log('\n═'.repeat(60), colors.cyan);
    log('\n✅ Миграция завершена успешно!\n', colors.bright + colors.green);

    // 6. Следующие шаги
    log('📝 Следующие шаги:', colors.bright);
    log('   1. Откройте prisma/schema.prisma', colors.cyan);
    log('   2. Удалите поля name и description из модели Service', colors.cyan);
    log('   3. Запустите: npx prisma migrate dev --name add_service_translations', colors.cyan);
    log('   4. Запустите: npx prisma generate', colors.cyan);
    log('   5. Заполните переводы на другие языки через админку', colors.cyan);
    log('');

    // 7. Предупреждение
    log('⚠️  ВАЖНО:', colors.yellow + colors.bright);
    log('   После изменения схемы Prisma, старые поля name и description', colors.yellow);
    log('   будут удалены из таблицы, но данные останутся в переводах!', colors.yellow);
    log('');
  } catch (error) {
    log('\n❌ Ошибка миграции:', colors.red + colors.bright);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// ============ ЗАПУСК ============

// Проверяем, что таблица переводов существует
async function checkTranslationTable() {
  try {
    await prisma.$queryRaw`SELECT 1 FROM service_translations LIMIT 1`;
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  log('\n🔍 Проверка окружения...', colors.blue);

  // Проверяем подключение к БД
  try {
    await prisma.$connect();
    log('   ✅ Подключение к БД успешно', colors.green);
  } catch (error) {
    log('   ❌ Ошибка подключения к БД', colors.red);
    console.error(error);
    process.exit(1);
  }

  // Проверяем, что таблица переводов существует
  const tableExists = await checkTranslationTable();

  if (!tableExists) {
    log('\n❌ Таблица service_translations не существует!', colors.red + colors.bright);
    log('', colors.reset);
    log('   Необходимо сначала добавить модель ServiceTranslation в schema.prisma', colors.yellow);
    log('   и создать миграцию:', colors.yellow);
    log('', colors.reset);
    log('   1. Добавьте модель ServiceTranslation в prisma/schema.prisma', colors.cyan);
    log('   2. Запустите: npx prisma migrate dev --name add_service_translations_table', colors.cyan);
    log('   3. Затем запустите этот скрипт снова', colors.cyan);
    log('');
    process.exit(1);
  }

  log('   ✅ Таблица service_translations существует', colors.green);

  // Запускаем миграцию
  await migrateServices();
}

// Запуск с обработкой ошибок
main()
  .then(() => {
    log('👋 Готово!\n', colors.bright + colors.green);
    process.exit(0);
  })
  .catch(error => {
    log('\n❌ Критическая ошибка:', colors.red + colors.bright);
    console.error(error);
    process.exit(1);
  });
