// test-overlap.js
// Тест логики пересечения временных интервалов
// Запуск: node test-overlap.js

console.log('🧪 Тест логики пересечения интервалов\n');
console.log('═'.repeat(70));

// Функция проверки пересечения (из вашего кода)
function checkOverlap(existingStart, existingEnd, newStart, newEnd) {
  // Логика из Prisma запроса:
  // startAt < newEnd AND endAt > newStart
  const startBefore = existingStart < newEnd;
  const endAfter = existingEnd > newStart;
  
  return startBefore && endAfter;
}

// Тестовые случаи
const tests = [
  {
    name: 'Полное совпадение',
    existing: ['2025-11-03T15:00:00Z', '2025-11-03T16:45:00Z'],
    new: ['2025-11-03T15:00:00Z', '2025-11-03T16:45:00Z'],
    shouldOverlap: true,
  },
  {
    name: 'Новая запись внутри существующей',
    existing: ['2025-11-03T14:00:00Z', '2025-11-03T18:00:00Z'],
    new: ['2025-11-03T15:00:00Z', '2025-11-03T16:00:00Z'],
    shouldOverlap: true,
  },
  {
    name: 'Новая запись перекрывает начало',
    existing: ['2025-11-03T15:00:00Z', '2025-11-03T17:00:00Z'],
    new: ['2025-11-03T14:00:00Z', '2025-11-03T16:00:00Z'],
    shouldOverlap: true,
  },
  {
    name: 'Новая запись перекрывает конец',
    existing: ['2025-11-03T15:00:00Z', '2025-11-03T17:00:00Z'],
    new: ['2025-11-03T16:00:00Z', '2025-11-03T18:00:00Z'],
    shouldOverlap: true,
  },
  {
    name: 'Новая запись полностью охватывает',
    existing: ['2025-11-03T15:00:00Z', '2025-11-03T16:00:00Z'],
    new: ['2025-11-03T14:00:00Z', '2025-11-03T18:00:00Z'],
    shouldOverlap: true,
  },
  {
    name: 'Новая запись до существующей (примыкает)',
    existing: ['2025-11-03T15:00:00Z', '2025-11-03T17:00:00Z'],
    new: ['2025-11-03T13:00:00Z', '2025-11-03T15:00:00Z'],
    shouldOverlap: false, // Граница - не пересечение
  },
  {
    name: 'Новая запись после существующей (примыкает)',
    existing: ['2025-11-03T15:00:00Z', '2025-11-03T17:00:00Z'],
    new: ['2025-11-03T17:00:00Z', '2025-11-03T19:00:00Z'],
    shouldOverlap: false, // Граница - не пересечение
  },
  {
    name: 'Новая запись до существующей (с зазором)',
    existing: ['2025-11-03T15:00:00Z', '2025-11-03T17:00:00Z'],
    new: ['2025-11-03T13:00:00Z', '2025-11-03T14:00:00Z'],
    shouldOverlap: false,
  },
  {
    name: 'Новая запись после существующей (с зазором)',
    existing: ['2025-11-03T15:00:00Z', '2025-11-03T17:00:00Z'],
    new: ['2025-11-03T18:00:00Z', '2025-11-03T20:00:00Z'],
    shouldOverlap: false,
  },
];

let passed = 0;
let failed = 0;

tests.forEach((test, idx) => {
  const existingStart = new Date(test.existing[0]);
  const existingEnd = new Date(test.existing[1]);
  const newStart = new Date(test.new[0]);
  const newEnd = new Date(test.new[1]);
  
  const result = checkOverlap(existingStart, existingEnd, newStart, newEnd);
  const success = result === test.shouldOverlap;
  
  console.log(`\nТест ${idx + 1}: ${test.name}`);
  console.log('-'.repeat(70));
  console.log(`Существующая: ${test.existing[0]} → ${test.existing[1]}`);
  console.log(`Новая:        ${test.new[0]} → ${test.new[1]}`);
  console.log(`Ожидается: ${test.shouldOverlap ? 'ПЕРЕСЕЧЕНИЕ' : 'НЕТ ПЕРЕСЕЧЕНИЯ'}`);
  console.log(`Результат: ${result ? 'ПЕРЕСЕЧЕНИЕ' : 'НЕТ ПЕРЕСЕЧЕНИЯ'}`);
  console.log(`${success ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (success) {
    passed++;
  } else {
    failed++;
  }
});

console.log('\n' + '═'.repeat(70));
console.log(`\n📊 РЕЗУЛЬТАТЫ: ${passed}/${tests.length} тестов пройдено`);
if (failed > 0) {
  console.log(`❌ Провалено: ${failed}`);
} else {
  console.log('✅ Все тесты пройдены!');
}

console.log('\n' + '═'.repeat(70));
console.log('\n💡 ВЫВОДЫ:');
console.log('Логика пересечения: startAt < newEnd AND endAt > newStart');
console.log('Это стандартная формула пересечения интервалов.');
console.log('\nЕсли тесты пройдены, проблема НЕ в логике пересечения.');
console.log('Проблема может быть в:');
console.log('1. Временных зонах (UTC vs Local)');
console.log('2. Миллисекундах в датах');
console.log('3. Кэшировании данных на фронтенде');
console.log('4. Race condition при параллельных запросах');