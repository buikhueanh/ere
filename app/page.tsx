import Image from 'next/image';

export default function HomePage() {
  return (
    <>
          {/* Hero */}
      <section className="flex justify-center w-full mt-5">
        <Image
          src="/images/hero/homepage.jpeg"
          alt="ére"
          width={1000}
          height={500}
          priority
          className="w-[300px] md:w-[600px] lg:w-[1000px] object-contain"
        />
      </section>
    </>
  );
}
