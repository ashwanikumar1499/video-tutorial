import TutorialForm from "@/components/TutorialForm";

export default function Home() {
  return (
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground text-center">
            Video Tutorial Generator
          </h1>
          <p className="text-lg sm:text-xl text-muted text-center">
            Transform any YouTube video into a comprehensive written tutorial.
          </p>
        </div>
        <div className="surface-primary p-6 sm:p-8">
          <TutorialForm />
        </div>
      </div>
    </main>
  );
}
