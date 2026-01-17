'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Save, LogOut, Camera, User, Mail, Phone, Calendar, FileText } from 'lucide-react';
import Image from 'next/image';

interface MasterProfileProps {
  master: {
    id: string;
    name: string;
    email: string;
    phone: string;
    birthDate: string;
    about: string;
    avatar?: string;
  };
}

export default function MasterProfile({ master }: MasterProfileProps) {
  const [formData, setFormData] = useState(master);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(master.avatar || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Максимальный размер файла 5 МБ');
        return;
      }
      
      if (!file.type.match(/^image\/(jpg|jpeg|png|webp)$/)) {
        alert('Допустимые форматы: JPG, PNG, WEBP');
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleSave = async () => {
    setIsLoading(true);
    // Здесь будет логика сохранения
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const handleSaveAndExit = async () => {
    await handleSave();
    // Логика выхода
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
            Профиль мастера
          </h1>
          <p className="text-slate-400">
            Управление профилем и персональными данными
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {/* Left Column - Avatar Section */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-500" />
                Аватар
              </h2>

              {/* Avatar Preview */}
              <div className="relative mb-6">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-amber-500/20">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <User className="w-20 h-20 text-slate-600" />
                    </div>
                  )}
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Remove button */}
                {previewUrl && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRemoveAvatar}
                    className="absolute -top-2 -right-2 w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </motion.button>
                )}
              </div>

              {/* Upload Button */}
              <label className="relative block cursor-pointer group">
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-amber-500/50">
                  <Upload className="w-5 h-5 text-white" />
                  <span className="font-medium text-white">Выберите файл</span>
                </div>
              </label>

              {/* File Info */}
              <div className="mt-4 text-sm text-slate-400 space-y-1">
                <p>Допустимые форматы: <span className="text-amber-500">JPG, PNG, WEBP</span></p>
                <p>Максимум <span className="text-amber-500">5 МБ</span></p>
              </div>

              {/* Metadata */}
              <div className="mt-6 pt-6 border-t border-slate-700/50 space-y-2 text-sm">
                <p className="text-slate-400">
                  Создан: <span className="text-white">25.11.2025, 22:44</span>
                </p>
                <p className="text-slate-400">
                  Обновлен: <span className="text-white">01.12.2025, 20:59</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 border border-slate-700/50 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-500" />
                Личные данные
              </h2>

              <div className="space-y-6">
                {/* Name Field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Имя
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                      placeholder="Введите имя"
                    />
                  </div>
                </div>

                {/* Email and Phone Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Email Field */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      E-mail
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                        placeholder="example@mail.com"
                      />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Телефон
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none"
                        placeholder="+7 (999) 999-99-99"
                      />
                    </div>
                  </div>
                </div>

                {/* Birth Date Field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Дата рождения
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none [color-scheme:dark]"
                    />
                  </div>
                </div>

                {/* About Field */}
                <div className="relative">
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    О себе
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <textarea
                      value={formData.about}
                      onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                      rows={4}
                      className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all outline-none resize-none"
                      placeholder="Расскажите о себе..."
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-slate-600 disabled:to-slate-700 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-emerald-500/50 disabled:cursor-not-allowed"
                  >
                    <Save className="w-5 h-5 text-white" />
                    <span className="font-medium text-white">
                      {isLoading ? 'Сохранение...' : 'Сохранить'}
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSaveAndExit}
                    disabled={isLoading}
                    className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:from-slate-600 disabled:to-slate-700 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-amber-500/50 disabled:cursor-not-allowed"
                  >
                    <LogOut className="w-5 h-5 text-white" />
                    <span className="font-medium text-white">
                      {isLoading ? 'Сохранение...' : 'Сохранить и выйти'}
                    </span>
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}