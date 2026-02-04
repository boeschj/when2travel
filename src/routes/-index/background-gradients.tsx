export function BackgroundGradients() {
  return (
    <div
      className="bg-grid-pattern pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    >
      <div className="bg-primary/5 absolute top-[-10%] left-[-10%] hidden h-[40%] w-[40%] rounded-full blur-[120px] md:block" />
      <div className="bg-primary/10 absolute right-[-10%] bottom-[-10%] hidden h-[30%] w-[30%] rounded-full blur-[100px] md:block" />
      <div className="bg-primary/3 absolute top-1/4 left-1/2 hidden h-[40%] w-[60%] -translate-x-1/2 rounded-full blur-[150px] md:block" />
    </div>
  );
}
