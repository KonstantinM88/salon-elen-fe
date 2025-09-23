export default function HomePage() {
  return (
    <section className="container mx-auto py-14">
      <h1 className="text-4xl font-bold tracking-tight">
        Salon Elen — красота и уход в Halle
      </h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
        Парикмахерские услуги, уход за кожей, маникюр и макияж.
      </p>

      <div className="mt-8 flex gap-3">
        <a href="/booking" className="btn">Записаться</a>
        <a href="/services" className="link">Смотреть услуги</a>
      </div>
    </section>
  );
}
