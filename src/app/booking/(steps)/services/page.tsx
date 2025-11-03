//src/app/booking/(steps)/services/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import PremiumProgressBar from "@/components/PremiumProgressBar";
import { Sparkles, Star, Zap, Award } from "lucide-react";

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
  { id: "services", label: "Услуга", icon: "✨" },
  { id: "master", label: "Мастер", icon: "👤" },
  { id: "calendar", label: "Дата", icon: "📅" },
  { id: "client", label: "Данные", icon: "📝" },
  { id: "verify", label: "Проверка", icon: "✓" },
  { id: "payment", label: "Оплата", icon: "💳" },
];

// Иконки для категорий — без any
const categoryIcons: Record<string, string> = {
  Маникюр: "💅",
  Стрижка: "✂️",
  Все: "✨",
};

export default function ServicesPage() {
  const router = useRouter();
  const [groups, setGroups] = useState<GroupDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Все");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/booking/services", {
          method: "POST",
        });

        if (!response.ok) throw new Error("Ошибка загрузки услуг");

        const data: ApiResponse = await response.json();
        setGroups(data.groups);
        setError(null);
      } catch (err) {
        console.error("Error fetching services:", err);
        setError("Не удалось загрузить услуги");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const allServices = groups.flatMap((g) => g.services);
  const categories = ["Все", ...groups.map((g) => g.title)];

  const filteredGroups =
    selectedCategory === "Все"
      ? groups
      : groups.filter((g) => g.title === selectedCategory);

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const totalPrice = allServices
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + (s.priceCents || 0), 0);

  const totalDuration = allServices
    .filter((s) => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + s.durationMin, 0);

  const handleContinue = () => {
    const params = new URLSearchParams();
    selectedServices.forEach((id) => params.append("s", id));
    router.push(`/booking/master?${params.toString()}`);
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("ru-RU");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950">
        <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />

        <div className="flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="w-24 h-24 relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 opacity-20 blur-xl animate-pulse"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-amber-500 animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto w-12 h-12 text-amber-500 animate-pulse" />
            </div>
            <p className="text-white/60 text-center mt-8 font-medium">
              Загрузка премиум услуг...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 flex items-center justify-center">
        <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-4">{error}</h2>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-amber-500/50"
          >
            Попробовать снова
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-black to-gray-950 relative overflow-hidden">
      <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />

      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-amber-500/20 via-transparent to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-yellow-500/20 via-transparent to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="relative pt-32 pb-32 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-block mb-6"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 shadow-xl">
                  <Star className="w-5 h-5" />
                  <span>Premium Selection</span>
                  <Star className="w-5 h-5" />
                </div>
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-8xl font-black mb-6 leading-tight"
            >
              <span className="inline-block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent animate-gradient bg-300%">
                Выберите
              </span>
              <br />
              <span className="inline-block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent animate-gradient bg-300%">
                услугу
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-gray-400 max-w-2xl mx-auto font-light"
            >
              Создайте свой уникальный образ с нашими эксклюзивными премиум
              услугами
            </motion.p>
          </motion.div>

          {/* Categories Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-4 justify-center mb-16"
          >
            {categories.map((category, index) => {
              const isActive = selectedCategory === category;
              return (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    group relative px-8 py-4 rounded-2xl font-bold transition-all duration-300
                    ${
                      isActive ? "text-black" : "text-gray-400 hover:text-white"
                    }
                  `}
                >
                  {/* Glassmorphism background */}
                  <div
                    className={`
                    absolute inset-0 rounded-2xl transition-all duration-300
                    ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500 to-yellow-500 shadow-2xl shadow-amber-500/50"
                        : "bg-white/5 backdrop-blur-sm border border-white/10 group-hover:bg-white/10"
                    }
                  `}
                  ></div>

                  <span className="relative flex items-center gap-2">
                    <span className="text-2xl">
                      {categoryIcons[category] || "✨"}
                    </span>
                    {category}
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                      }}
                    />
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Services Grid */}
          {filteredGroups.map((group, groupIndex) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: groupIndex * 0.1 + 0.7 }}
              className="mb-20"
            >
              {/* Group Title */}
              <div className="flex items-center gap-4 mb-8">
                <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                  {group.title}
                </h2>
                <div className="h-1 flex-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {group.services.map((service, index) => {
                    const isSelected = selectedServices.includes(service.id);
                    const isHovered = hoveredCard === service.id;
                    const price = service.priceCents
                      ? formatPrice(service.priceCents)
                      : "По запросу";

                    return (
                      <motion.div
                        key={service.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{
                          delay: index * 0.05,
                          type: "spring",
                          stiffness: 300,
                          damping: 25,
                        }}
                        whileHover={{ y: -8, scale: 1.02 }}
                        onHoverStart={() => setHoveredCard(service.id)}
                        onHoverEnd={() => setHoveredCard(null)}
                        onClick={() => toggleService(service.id)}
                        className="group relative cursor-pointer"
                      >
                        {/* Glow Effect */}
                        <div
                          className={`
                          absolute -inset-4 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl
                          ${
                            isSelected
                              ? "bg-gradient-to-r from-amber-500/50 to-yellow-500/50"
                              : "bg-gradient-to-r from-amber-500/20 to-yellow-500/20"
                          }
                        `}
                        ></div>

                        {/* Card */}
                        <div
                          className={`
                          relative rounded-3xl overflow-hidden transition-all duration-500
                          ${
                            isSelected
                              ? "bg-gradient-to-br from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-2 border-amber-500/50"
                              : "bg-white/5 backdrop-blur-xl border border-white/10"
                          }
                        `}
                        >
                          {/* Animated Background Pattern */}
                          <div className="absolute inset-0 opacity-30">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent"></div>
                            <motion.div
                              animate={{
                                backgroundPosition: ["0% 0%", "100% 100%"],
                              }}
                              transition={{
                                duration: 20,
                                repeat: Infinity,
                                repeatType: "reverse",
                              }}
                              className="absolute inset-0"
                              style={{
                                backgroundImage:
                                  "radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.1) 0%, transparent 50%)",
                                backgroundSize: "200% 200%",
                              }}
                            />
                          </div>

                          {/* Content */}
                          <div className="relative p-8">
                            {/* Top Section */}
                            <div className="flex items-start justify-between mb-6">
                              {/* Checkbox */}
                              <motion.div
                                initial={false}
                                animate={{
                                  scale: isSelected ? 1.1 : 1,
                                  rotate: isSelected ? 360 : 0,
                                }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className={`
                                  w-8 h-8 rounded-full border-2 flex items-center justify-center
                                  ${
                                    isSelected
                                      ? "bg-gradient-to-br from-amber-500 to-yellow-500 border-amber-500 shadow-lg shadow-amber-500/50"
                                      : "border-white/30 backdrop-blur-sm"
                                  }
                                `}
                              >
                                {isSelected && (
                                  <motion.svg
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="w-5 h-5 text-black"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </motion.svg>
                                )}
                              </motion.div>

                              {/* Badge */}
                              <motion.div
                                animate={{
                                  rotate: [0, 5, -5, 0],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatDelay: 3,
                                }}
                                className="relative"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur-md opacity-50"></div>
                                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-xl">
                                  <Sparkles className="w-7 h-7 text-black" />
                                </div>
                              </motion.div>
                            </div>

                            {/* Title */}
                            <h3
                              className={`
                              text-2xl font-bold mb-3 transition-all duration-300
                              ${
                                isSelected || isHovered
                                  ? "text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-400"
                                  : "text-white"
                              }
                            `}
                            >
                              {service.title}
                            </h3>

                            {/* Description */}
                            {service.description && (
                              <p className="text-gray-400 text-sm mb-6 line-clamp-2 font-light">
                                {service.description}
                              </p>
                            )}

                            {/* Bottom Section */}
                            <div className="flex items-end justify-between">
                              {/* Price & Duration */}
                              <div>
                                <div className="flex items-baseline gap-2 mb-1">
                                  <span className="text-4xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                                    {price}
                                  </span>
                                  <span className="text-2xl font-bold text-amber-400">
                                    €
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                  <Zap className="w-4 h-4" />
                                  <span>{service.durationMin} минут</span>
                                </div>
                              </div>

                              {/* Hover Icon */}
                              <motion.div
                                animate={{
                                  scale: isHovered ? 1 : 0.8,
                                  opacity: isHovered ? 1 : 0.5,
                                }}
                                className={`
                                  w-16 h-16 rounded-2xl flex items-center justify-center
                                  ${
                                    isSelected
                                      ? "bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg shadow-amber-500/50"
                                      : "bg-white/5"
                                  }
                                `}
                              >
                                <Award
                                  className={`w-8 h-8 ${
                                    isSelected ? "text-black" : "text-amber-500"
                                  }`}
                                />
                              </motion.div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Floating Footer */}
      <AnimatePresence>
        {selectedServices.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-6"
          >
            <div className="container mx-auto max-w-7xl">
              <div className="relative">
                {/* Glow */}
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-3xl blur-xl opacity-50"></div>

                {/* Content */}
                <div className="relative bg-black/90 backdrop-blur-2xl border border-amber-500/50 rounded-3xl p-8">
                  <div className="flex items-center justify-between flex-wrap gap-6">
                    <div>
                      <div className="text-sm text-gray-400 mb-2 font-medium">
                        Выбрано услуг:{" "}
                        <span className="text-amber-400 font-bold">
                          {selectedServices.length}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-4">
                        <span className="text-5xl font-black bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                          {formatPrice(totalPrice)}
                        </span>
                        <span className="text-3xl font-bold text-amber-400">
                          €
                        </span>
                        <span className="text-xl text-gray-500 ml-2">
                          • {totalDuration} мин
                        </span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleContinue}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl blur-lg group-hover:blur-xl transition-all"></div>
                      <div className="relative bg-gradient-to-r from-amber-500 to-yellow-500 text-black px-12 py-5 rounded-2xl font-bold text-lg flex items-center gap-3 shadow-2xl">
                        <span>Продолжить</span>
                        <motion.svg
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-6 h-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </motion.svg>
                      </div>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .bg-300\% {
          background-size: 300% 300%;
        }
      `}</style>
    </div>
  );
}

//----------работал но хочу лучше дизайн ниже 03/11----------
// //src/app/booking/(steps)/services/page.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { useRouter } from 'next/navigation';
// import PremiumProgressBar from '@/components/PremiumProgressBar';

// interface ServiceDto {
//   id: string;
//   title: string;
//   description: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string;
// }

// interface GroupDto {
//   id: string;
//   title: string;
//   services: ServiceDto[];
// }

// interface PromotionDto {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// }

// interface ApiResponse {
//   groups: GroupDto[];
//   promotions: PromotionDto[];
// }

// const BOOKING_STEPS = [
//   { id: 'services', label: 'Услуга', icon: '✨' },
//   { id: 'master', label: 'Мастер', icon: '👤' },
//   { id: 'calendar', label: 'Дата', icon: '📅' },
//   { id: 'client', label: 'Данные', icon: '📝' },
//   { id: 'verify', label: 'Проверка', icon: '✓' },
//   { id: 'payment', label: 'Оплата', icon: '💳' },
// ];

// export default function ServicesPage() {
//   const router = useRouter();
//   const [groups, setGroups] = useState<GroupDto[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>('Все');
//   const [selectedServices, setSelectedServices] = useState<string[]>([]);

//   useEffect(() => {
//     const fetchServices = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch('/api/booking/services', {
//           method: 'POST',
//         });

//         if (!response.ok) {
//           throw new Error('Ошибка загрузки услуг');
//         }

//         const data: ApiResponse = await response.json();
//         setGroups(data.groups);
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching services:', err);
//         setError('Не удалось загрузить услуги');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchServices();
//   }, []);

//   const allServices = groups.flatMap(g => g.services);
//   const categories = ['Все', ...groups.map(g => g.title)];

//   const filteredGroups = selectedCategory === 'Все'
//     ? groups
//     : groups.filter(g => g.title === selectedCategory);

//   const toggleService = (serviceId: string) => {
//     setSelectedServices(prev =>
//       prev.includes(serviceId)
//         ? prev.filter(id => id !== serviceId)
//         : [...prev, serviceId]
//     );
//   };

//   const totalPrice = allServices
//     .filter(s => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + (s.priceCents || 0), 0);

//   const totalDuration = allServices
//     .filter(s => selectedServices.includes(s.id))
//     .reduce((sum, s) => sum + s.durationMin, 0);

//   const handleContinue = () => {
//     const params = new URLSearchParams();
//     selectedServices.forEach(id => params.append('s', id));
//     router.push(`/booking/master?${params.toString()}`);
//   };

//   const formatPrice = (cents: number) => {
//     return (cents / 100).toLocaleString('ru-RU');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         <div className="pt-32">
//           <div className="animate-pulse text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
//             Загрузка услуг...
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-black text-white flex items-center justify-center">
//         <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />
//         <div className="pt-32 text-center">
//           <div className="text-2xl text-red-400 mb-4">❌ {error}</div>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-6 py-3 bg-yellow-400 text-black rounded-full font-medium"
//           >
//             Попробовать снова
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black text-white">
//       <PremiumProgressBar currentStep={0} steps={BOOKING_STEPS} />

//       {/* Фоновые эффекты */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] animate-pulse"></div>
//         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
//       </div>

//       <div className="relative pt-32 pb-20 px-4">
//         <div className="container mx-auto max-w-7xl">
//           {/* Заголовок */}
//           <motion.div
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="text-center mb-12"
//           >
//             <h1 className="text-5xl md:text-6xl font-bold mb-4">
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600">
//                 Выберите услугу
//               </span>
//             </h1>
//             <p className="text-xl text-white/60">
//               Создайте свой идеальный образ с нашими премиум услугами
//             </p>
//           </motion.div>

//           {/* Категории */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="flex flex-wrap gap-3 justify-center mb-12"
//           >
//             {categories.map((category) => (
//               <button
//                 key={category}
//                 onClick={() => setSelectedCategory(category)}
//                 className={`
//                   px-6 py-3 rounded-full font-medium transition-all duration-300
//                   ${selectedCategory === category
//                     ? 'bg-gradient-to-r from-yellow-400 to-amber-600 text-black shadow-[0_0_20px_rgba(255,215,0,0.4)]'
//                     : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
//                   }
//                 `}
//               >
//                 {category}
//               </button>
//             ))}
//           </motion.div>

//           {/* Группы услуг */}
//           {filteredGroups.map((group, groupIndex) => (
//             <div key={group.id} className="mb-12">
//               <motion.h2
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: groupIndex * 0.1 }}
//                 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600"
//               >
//                 {group.title}
//               </motion.h2>

//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 <AnimatePresence mode="popLayout">
//                   {group.services.map((service, index) => {
//                     const isSelected = selectedServices.includes(service.id);
//                     const price = service.priceCents ? formatPrice(service.priceCents) : 'По запросу';

//                     return (
//                       <motion.div
//                         key={service.id}
//                         layout
//                         initial={{ opacity: 0, scale: 0.9 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         exit={{ opacity: 0, scale: 0.9 }}
//                         transition={{ delay: index * 0.05 }}
//                         onClick={() => toggleService(service.id)}
//                         className={`
//                           group relative cursor-pointer rounded-3xl overflow-hidden
//                           transition-all duration-500
//                           ${isSelected
//                             ? 'bg-gradient-to-br from-yellow-400/20 to-amber-600/20 border-2 border-yellow-400 shadow-[0_0_30px_rgba(255,215,0,0.3)]'
//                             : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
//                           }
//                         `}
//                       >
//                         {/* Чекбокс */}
//                         <div className="absolute top-4 left-4 z-10">
//                           <div className={`
//                             w-6 h-6 rounded-full border-2 flex items-center justify-center
//                             transition-all duration-300
//                             ${isSelected
//                               ? 'bg-gradient-to-br from-yellow-400 to-amber-600 border-yellow-400'
//                               : 'border-white/30 bg-white/5'
//                             }
//                           `}>
//                             {isSelected && (
//                               <motion.svg
//                                 initial={{ scale: 0 }}
//                                 animate={{ scale: 1 }}
//                                 className="w-4 h-4 text-black"
//                                 fill="none"
//                                 viewBox="0 0 24 24"
//                                 stroke="currentColor"
//                               >
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                               </motion.svg>
//                             )}
//                           </div>
//                         </div>

//                         <div className="p-6 pt-12">
//                           <h3 className="text-xl font-bold mb-2 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-amber-600 transition-all duration-300">
//                             {service.title}
//                           </h3>

//                           {service.description && (
//                             <p className="text-white/60 text-sm mb-4 line-clamp-2">
//                               {service.description}
//                             </p>
//                           )}

//                           <div className="flex items-center justify-between">
//                             <div>
//                               <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
//                                 {price} €
//                               </div>
//                               <div className="text-sm text-white/40">
//                                 {service.durationMin} мин
//                               </div>
//                             </div>

//                             <div className={`
//                               w-12 h-12 rounded-full flex items-center justify-center
//                               transition-all duration-300
//                               ${isSelected
//                                 ? 'bg-gradient-to-br from-yellow-400 to-amber-600 shadow-[0_0_15px_rgba(255,215,0,0.4)]'
//                                 : 'bg-white/5'
//                               }
//                             `}>
//                               <span className="text-2xl">✨</span>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/0 to-amber-600/0 group-hover:from-yellow-400/5 group-hover:to-amber-600/5 transition-all duration-500 pointer-events-none"></div>
//                       </motion.div>
//                     );
//                   })}
//                 </AnimatePresence>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Фиксированная нижняя панель */}
//       <AnimatePresence>
//         {selectedServices.length > 0 && (
//           <motion.div
//             initial={{ y: 100, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             exit={{ y: 100, opacity: 0 }}
//             className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-t border-white/10 p-6"
//           >
//             <div className="container mx-auto max-w-7xl flex items-center justify-between flex-wrap gap-4">
//               <div>
//                 <div className="text-sm text-white/60 mb-1">
//                   Выбрано услуг: {selectedServices.length}
//                 </div>
//                 <div className="flex items-baseline gap-3">
//                   <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">
//                     {formatPrice(totalPrice)} €
//                   </div>
//                   <div className="text-white/60">
//                     {totalDuration} мин
//                   </div>
//                 </div>
//               </div>

//               <button
//                 onClick={handleContinue}
//                 className="
//                   px-8 py-4 rounded-full font-bold text-lg
//                   bg-gradient-to-r from-yellow-400 to-amber-600
//                   text-black shadow-[0_0_30px_rgba(255,215,0,0.5)]
//                   hover:shadow-[0_0_40px_rgba(255,215,0,0.7)]
//                   hover:scale-105
//                   transition-all duration-300
//                   flex items-center gap-2
//                 "
//               >
//                 Продолжить
//                 <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                 </svg>
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }

//----------работал но старый дизайн ниже 03/11----------
// //src/app/booking/(steps)/services/page.tsx
// 'use client';

// import * as React from 'react';
// import { JSX } from 'react';
// import { useRouter } from 'next/navigation';
// import { ShoppingBag, ChevronRight, AlertTriangle } from 'lucide-react';

// type Service = {
//   id: string;
//   title: string;
//   description?: string | null;
//   durationMin: number;
//   priceCents: number | null;
//   parentId: string | null;
// };

// type Group = {
//   id: string;
//   title: string;
//   services: Service[];
// };

// type Promotion = {
//   id: string;
//   title: string;
//   percent: number;
//   isGlobal: boolean;
// };

// type Payload = {
//   groups: Group[];
//   promotions: Promotion[];
// };

// function formatPriceEUR(cents: number): string {
//   return new Intl.NumberFormat('de-DE', {
//     style: 'currency',
//     currency: 'EUR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(cents / 100);
// }

// function formatMinutes(min: number): string {
//   return `${min} мин`;
// }

// function applyBestDiscount(cents: number, promotions: Promotion[]): number {
//   const best = promotions
//     .filter(p => p.isGlobal && p.percent > 0)
//     .reduce<number>((acc, p) => Math.max(acc, p.percent), 0);
//   if (!best) return cents;
//   const discounted = Math.round(cents * (100 - best) / 100);
//   return Math.max(0, discounted);
// }

// export default function ServicesPage(): JSX.Element {
//   const router = useRouter();
//   const [groups, setGroups] = React.useState<Group[]>([]);
//   const [promotions, setPromotions] = React.useState<Promotion[]>([]);
//   const [selected, setSelected] = React.useState<Set<string>>(new Set());
//   const [loading, setLoading] = React.useState<boolean>(true);
//   const [error, setError] = React.useState<string | null>(null);
//   const [masterWarning, setMasterWarning] = React.useState<string | null>(null);

//   React.useEffect(() => {
//     let cancelled = false;

//     async function load(): Promise<void> {
//       setLoading(true);
//       setError(null);
//       try {
//         const res = await fetch('/api/booking/services', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//         });
//         if (!res.ok) throw new Error(`Failed to load services: ${res.status}`);
//         const data: Payload = await res.json();
//         if (!cancelled) {
//           setGroups(data.groups ?? []);
//           setPromotions(data.promotions ?? []);
//         }
//       } catch (e: unknown) {
//         const msg = e instanceof Error ? e.message : 'Failed to load services';
//         if (!cancelled) setError(msg);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     void load();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   const toggleService = (id: string): void => {
//     setSelected(prev => {
//       const next = new Set(prev);
//       if (next.has(id)) next.delete(id);
//       else next.add(id);
//       return next;
//     });
//   };

//   // Проверка совместимости мастеров
//   React.useEffect(() => {
//     if (selected.size === 0) {
//       setMasterWarning(null);
//       return;
//     }

//     let cancelled = false;

//     async function checkMasterCompatibility(): Promise<void> {
//       try {
//         const serviceIdsParam = Array.from(selected).join(',');
//         const res = await fetch(`/api/masters?serviceIds=${encodeURIComponent(serviceIdsParam)}`, {
//           method: 'GET',
//           cache: 'no-store',
//         });

//         if (!res.ok) throw new Error('Failed to check masters');

//         const data = await res.json();
//         const masters = Array.isArray(data.masters) ? data.masters : [];

//         if (!cancelled) {
//           if (masters.length === 0) {
//             setMasterWarning(
//               'Эти услуги выполняются разными мастерами. Пожалуйста, оформите отдельные записи для несовместимых услуг.'
//             );
//           } else {
//             setMasterWarning(null);
//           }
//         }
//       } catch (e) {
//         console.error('Master compatibility check failed:', e);
//         if (!cancelled) setMasterWarning(null);
//       }
//     }

//     void checkMasterCompatibility();

//     return () => {
//       cancelled = true;
//     };
//   }, [selected]);

//   const flatServices: Service[] = React.useMemo(
//     () => groups.flatMap(g => g.services),
//     [groups],
//   );

//   const byId: Record<string, Service> = React.useMemo(() => {
//     const acc: Record<string, Service> = {};
//     for (const s of flatServices) acc[s.id] = s;
//     return acc;
//   }, [flatServices]);

//   const selectedServices: Service[] = React.useMemo(
//     () => Array.from(selected).map(id => byId[id]).filter(Boolean),
//     [selected, byId],
//   );

//   const totalDurationMin = React.useMemo(
//     () => selectedServices.reduce((sum, s) => sum + (s.durationMin || 0), 0),
//     [selectedServices],
//   );

//   const totalPriceCents = React.useMemo(
//     () =>
//       selectedServices.reduce((sum, s) => {
//         const base = s.priceCents ?? 0;
//         return sum + applyBestDiscount(base, promotions);
//       }, 0),
//     [selectedServices, promotions],
//   );

//   // КРИТИЧЕСКИЙ ФИКС: правильная генерация URL с множественными параметрами
//   const getMasterUrl = React.useCallback((): string => {
//     const params = new URLSearchParams();
//     Array.from(selected).forEach(id => {
//       params.append('s', id);
//     });
//     return `/booking/master?${params.toString()}`;
//   }, [selected]);

//   const handleProceed = (e: React.MouseEvent): void => {
//     e.preventDefault();
//     const url = getMasterUrl();
//     console.log('Navigating to:', url);
//     router.push(url);
//   };

//   const canProceed = selected.size > 0 && !masterWarning;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 pb-32">
//       <div className="max-w-4xl mx-auto px-4 py-8">
//         <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 md:p-8">
//             <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
//               <ShoppingBag className="w-8 h-8" />
//               Онлайн запись
//             </h1>
//             <p className="text-blue-100 mt-2">Шаг 1: Выбор услуг</p>
//           </div>

//           <div className="p-6 md:p-8">
//             {loading && (
//               <div className="text-center py-12">
//                 <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
//                 <p className="mt-4 text-gray-600">Загрузка услуг…</p>
//               </div>
//             )}

//             {error && (
//               <div className="rounded-lg border border-red-200 bg-red-50 p-6">
//                 <p className="text-red-700 font-semibold">Ошибка: {error}</p>
//               </div>
//             )}

//             {masterWarning && (
//               <div className="mb-6 rounded-lg border-2 border-amber-400 bg-amber-50 p-4">
//                 <div className="flex items-start gap-3">
//                   <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
//                   <p className="text-amber-800 font-medium">
//                     {masterWarning}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {!loading && !error && groups.map(group => (
//               <div key={group.id} className="mb-8 last:mb-0">
//                 <h2 className="text-xl font-bold text-gray-800 mb-4 px-2 border-l-4 border-blue-500 pl-3">
//                   {group.title}
//                 </h2>
//                 <div className="space-y-3">
//                   {group.services.map(svc => {
//                     const checked = selected.has(svc.id);
//                     const base = svc.priceCents ?? 0;
//                     const withDiscount = applyBestDiscount(base, promotions);
//                     const hasDiscount = withDiscount !== base;

//                     return (
//                       <label
//                         key={svc.id}
//                         className={`
//                           group flex items-start gap-4 p-5 rounded-xl cursor-pointer transition-all duration-200
//                           ${checked
//                             ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-400 shadow-lg ring-2 ring-blue-200'
//                             : 'bg-white border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
//                           }
//                         `}
//                       >
//                         <input
//                           type="checkbox"
//                           className="mt-1 w-6 h-6 text-blue-600 rounded-md focus:ring-2 focus:ring-blue-500 cursor-pointer"
//                           checked={checked}
//                           onChange={() => toggleService(svc.id)}
//                         />
//                         <div className="flex-1 min-w-0">
//                           <div className="flex items-start justify-between gap-4">
//                             <div className="flex-1">
//                               <h3 className={`text-lg font-semibold transition-colors ${
//                                 checked ? 'text-blue-700' : 'text-gray-800 group-hover:text-blue-600'
//                               }`}>
//                                 {svc.title}
//                               </h3>
//                               {svc.description && (
//                                 <p className="text-sm text-gray-600 mt-2 leading-relaxed">
//                                   {svc.description}
//                                 </p>
//                               )}
//                               <div className="flex items-center gap-3 mt-3">
//                                 <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
//                                   ⏱️ {formatMinutes(svc.durationMin)}
//                                 </span>
//                               </div>
//                             </div>
//                             <div className="text-right flex-shrink-0">
//                               {hasDiscount ? (
//                                 <div>
//                                   <div className="text-base text-gray-400 line-through">
//                                     {formatPriceEUR(base)}
//                                   </div>
//                                   <div className="text-xl font-bold text-green-600">
//                                     {formatPriceEUR(withDiscount)}
//                                   </div>
//                                   <div className="text-xs text-green-600 font-medium">
//                                     Скидка!
//                                   </div>
//                                 </div>
//                               ) : (
//                                 <div className="text-xl font-bold text-gray-800">
//                                   {formatPriceEUR(base)}
//                                 </div>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       </label>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Floating footer */}
//       {selected.size > 0 && (
//         <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
//           <div className="max-w-4xl mx-auto px-4 py-5">
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
//               <div className="flex-1 text-center sm:text-left">
//                 <div className="text-sm text-gray-600 mb-1">
//                   Выбрано услуг: <span className="font-bold text-blue-600">{selected.size}</span>
//                 </div>
//                 <div className="flex items-baseline justify-center sm:justify-start gap-4">
//                   <span className="text-3xl font-bold text-gray-800">
//                     {formatPriceEUR(totalPriceCents)}
//                   </span>
//                   <span className="text-base text-gray-600">
//                     • {formatMinutes(totalDurationMin)}
//                   </span>
//                 </div>
//               </div>

//               <button
//                 onClick={handleProceed}
//                 disabled={!canProceed}
//                 className={`
//                   flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all transform
//                   ${canProceed
//                     ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95'
//                     : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
//                   }
//                 `}
//               >
//                 Выбрать мастера
//                 <ChevronRight className="w-6 h-6" />
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
