"use client";

// 这个组件可能不需要 data prop，或者需要其他 props
// type Props = {
//   data: HomeContent["sphere3d"];
// };

export default function Sphere3D(/*{ data }: Props*/) {
  return (
    <section className="py-16 h-[500px] bg-brand-main flex items-center justify-center" data-header-theme="light">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold text-brand-text-black">3D Sphere Placeholder</h2>
        {/* 在这里实现你的 3D 球体 */}
      </div>
    </section>
  );
}