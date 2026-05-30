import Image from 'next/image';

export default function HomePage() {
  return (
    <>
          {/* Hero */}
      <section className="relative w-full h-screen flex items-center justify-center">
        <Image
          src="/images/hero/homepage.jpeg"
          alt="ére"
          width={1000}
          height={800}
          priority
          className="object-cover"
        />
      </section>
    </>
  );
}
