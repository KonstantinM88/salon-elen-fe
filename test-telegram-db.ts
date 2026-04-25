import { prisma } from "./src/lib/prisma";

async function testTelegramVerification() {
  try {
    console.log('🧪 Тестируем TelegramVerification...\n');

    // 1. Создать верификацию
    const verification = await prisma.telegramVerification.create({
      data: {
        phone: '+4917789951064',
        code: '123456',
        sessionId: crypto.randomUUID(),
        serviceId: 'test-service-id',
        masterId: 'test-master-id',
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 3600000).toISOString(),
        expiresAt: new Date(Date.now() + 600000), // 10 минут
      },
    });

    console.log('✅ Запись создана:');
    console.log('   ID:', verification.id);
    console.log('   Phone:', verification.phone);
    console.log('   Code:', verification.code);
    console.log('   SessionId:', verification.sessionId);
    console.log('   Verified:', verification.verified);
    console.log('   ExpiresAt:', verification.expiresAt);

    // 2. Найти по sessionId
    const found = await prisma.telegramVerification.findUnique({
      where: { sessionId: verification.sessionId },
    });

    console.log('\n✅ Запись найдена по sessionId:', found?.id);

    // 3. Обновить (пометить как verified)
    const updated = await prisma.telegramVerification.update({
      where: { id: verification.id },
      data: {
        verified: true,
        telegramUserId: BigInt(123456789),
        email: 'test@example.com',
      },
    });

    console.log('\n✅ Запись обновлена:');
    console.log('   Verified:', updated.verified);
    console.log('   TelegramUserId:', updated.telegramUserId?.toString());
    console.log('   Email:', updated.email);

    // 4. Найти по телефону
    const foundByPhone = await prisma.telegramVerification.findMany({
      where: { phone: '+4917789951064' },
    });

    console.log('\n✅ Найдено записей по телефону:', foundByPhone.length);

    // 5. Удалить тестовую запись
    await prisma.telegramVerification.delete({
      where: { id: verification.id },
    });

    console.log('\n✅ Тестовая запись удалена');

    console.log('\n🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!\n');
  } catch (error) {
    console.error('\n❌ Ошибка:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testTelegramVerification();
