'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import PremiumProgressBar from '@/components/PremiumProgressBar';

// Типы из API
interface ServiceDto {
  id: string;
  title: string;
  description: string | null;
  durationMin: number;
  priceCents: number | null;
  parentId: string;
}

interface GroupDto {
  id: string;
  title: string;
  services: ServiceDto[];
}

interface PromotionDto {
  id: string;
  title: string;
  percent: number;
  isGlobal: boolean;
}

interface ApiResponse {
  groups: GroupDto[];
  promotions: PromotionDto[];
}

const BOOKING_STEPS = [
  { id: 'services', label: 'Услуга', icon: '✨' },
  { id: 'master', label: 'Мастер', icon: '👤' },
  { id: 'calendar', label: 'Дата', icon: '📅' },
  { id: 'client', label: 'Данные', icon: '📝' },
  { id: 'verify', label: 'Проверка', icon: '✓' },
  { id: 'payment', label: 'Оплата', icon: '💳' },
];

export default function ServicesPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Все');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // Загрузка услуг из API
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/booking/services', {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Ошибка загрузки услуг');
        }

        const data: ApiResponse = await response.json();
        setGroups(data.groups);
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Не удалось загрузить услуги');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Все услуги в плоском виде
  const allServices = groups.flatMap(g => g.services);

  // Категории
  const categories = ['Все', ...groups.map(g => g.title)];

  // Фильтрация услуг по категории
  const filteredGroups = selectedCategory === 'Все'
    ? groups
    : groups.filter(g => g.title === selectedCategory);

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // Подсчёт итогов
  const totalPrice = allServices
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + (s.priceCents || 0), 0);

  const totalDuration = allServices
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.durationMin, 0);

  const handleContinue = () => {
    // Сохраняем выбранные услуги в sessionStorage
    sessionStorage.setItem('selectedServices', JSON.stringify(selectedServices));
    router.push('/booking/master');
  };

  // Форматирование цены
  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString('ru-RU');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
        <div className="pt-32">
          <div className="animate-pulse text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
            Загрузка услуг...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
        <div className="pt-32 text-center">
          <div className="text-2xl text-red-400 mb-4">❌ {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-yellow-400 text-black rounded-full font-medium"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Progress Bar */}
      <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />

      {/* Фоновые эффекты */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Основной контент */}
      <div className="relative pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">

          {/* Заголовок */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600">
                Выберите услугу
              </span>
            </h1>
            <p className="text-xl text-white/60">
              Создайте свой идеальный образ с нашими премиум услугами
            </p>
          </motion.div>

          {/* Категории */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-3 justify-center mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-6 py-3 rounded-full font-medium transition-all duration-300
                  ${selectedCategory === category
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(255,215,0,0.4)]'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Группы услуг */}
          {filteredGroups.map((group, groupIndex) => (
            <div key={group.id} className="mb-12">
              {/* Название группы */}
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: groupIndex * 0.1 }}
                className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600"
              >
                {group.title}
              </motion.h2>

              {/* Сетка услуг */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {group.services.map((service, index) => {
                    const isSelected = selectedServices.includes(service.id);
                    const price = service.priceCents ? formatPrice(service.priceCents) : 'По запросу';

                    return (
                      <motion.div
                        key={service.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => toggleService(service.id)}
                        className={`
                          group relative cursor-pointer rounded-3xl overflow-hidden
                          transition-all duration-500
                          ${isSelected
                            ? 'bg-gradient-to-br from-yellow-400/20 to-amber-600/20 border-2 border-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.3)]'
                            : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                          }
                        `}
                      >
                        {/* Чекбокс */}
                        <div className="absolute top-4 left-4 z-10">
                          <div className={`
                            w-6 h-6 rounded-full border-2 flex items-center justify-center
                            transition-all duration-300
                            ${isSelected
                              ? 'bg-gradient-to-br from-yellow-400 to-amber-600 border-yellow-400'
                              : 'border-white/30 bg-white/5'
                            }
                          `}>
                            {isSelected && (
                              <motion.svg
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-4 h-4 text-black"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </motion.svg>
                            )}
                          </div>
                        </div>

                        {/* Контент карточки */}
                        <div className="p-6 pt-12">
                          <h3 className="text-xl font-bold mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-amber-600 transition-all duration-300">
                            {service.title}
                          </h3>

                          {service.description && (
                            <p className="text-white/60 text-sm mb-4 line-clamp-2">
                              {service.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
                                {price} €
                              </div>
                              <div className="text-sm text-white/40">
                                {service.durationMin} мин
                              </div>
                            </div>

                            {/* Иконка */}
                            <div className={`
                              w-12 h-12 rounded-full flex items-center justify-center
                              transition-all duration-300
                              ${isSelected
                                ? 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_15px_rgba(255,215,0,0.4)]'
                                : 'bg-white/5'
                              }
                            `}>
                              <span className="text-2xl">✨</span>
                            </div>
                          </div>
                        </div>

                        {/* Эффект свечения при hover */}
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-amber-600/0 group-hover:from-yellow-400/5 group-hover:to-amber-600/5 transition-all duration-500 pointer-events-none"></div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          ))}

          {/* Если нет услуг */}
          {groups.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <div className="text-2xl text-white/60">Услуги не найдены</div>
            </div>
          )}
        </div>
      </div>

      {/* Фиксированная нижняя панель */}
      <AnimatePresence>
        {selectedServices.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/10 p-6"
          >
            <div className="container mx-auto max-w-7xl flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-sm text-white/60 mb-1">
                  Выбрано услуг: {selectedServices.length}
                </div>
                <div className="flex items-baseline gap-3">
                  <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
                    {formatPrice(totalPrice)} €
                  </div>
                  <div className="text-white/60">
                    {totalDuration} мин
                  </div>
                </div>
              </div>

              <button
                onClick={handleContinue}
                className="
                  px-8 py-4 rounded-full font-bold text-lg
                  bg-gradient-to-r from-yellow-400 to-amber-600
                  text-black shadow-[0_0_30px_rgba(255,215,0,0.5)]
                  hover:shadow-[0_0_40px_rgba(255,215,0,0.7)]
                  hover:scale-105
                  transition-all duration-300
                  flex items-center gap-2
                "
              >
                Продолжить
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
