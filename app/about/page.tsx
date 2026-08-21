export const metadata = { title: "About" };

export default function AboutPage() {
  return (
    <main className="px-6 mx-auto py-24 max-w-lg">
      <div className="flex flex-col justify-center items-start">
        <div className="py-6 text-xs">
          <h1 className="font-handwriting italic lowercase text-xl mb-2">
            About us
          </h1>
          <p>
            ère curates clothing and objects from emerging brands around the
            world, introducing <br className="hidden md:inline" /> their stories and creativity to the united states.
            in the world of ère, you belong, always.
          </p>
          <br />
          <br />
          <div className="flex flex-col gap-1">
            <p>for general inquiries:</p>
            <p>
              <a
                href="mailto:contact@ere-world.com"
                className="hover:text-foreground/70 transition-colors"
              >
                contact@ere-world.com
              </a>
            </p>
          </div>
          <br />
          <br />
          <div className="flex flex-col gap-1">
            <p>follow us:</p>
            <a
              href="https://www.instagram.com/ereworld.us/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground/70 transition-colors"
            >
              @ereworld.us
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
