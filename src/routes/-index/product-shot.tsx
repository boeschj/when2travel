import { TripLengthCard } from "./desk-objects";
import { LivePlanDemo } from "./live-plan-demo";

export function ProductShot() {
  return (
    <section className="mx-auto max-w-[1180px] px-4 pt-24 sm:pt-28">
      <div className="relative rounded-[40px] border border-[#223a1c] bg-[#172713] p-3 sm:p-8 lg:p-16">
        <TripLengthCard className="absolute -top-8 -right-6 z-10 hidden rotate-6 lg:block" />
        <LivePlanDemo />
      </div>
    </section>
  );
}
