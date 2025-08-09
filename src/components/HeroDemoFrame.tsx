import React from "react";

const HeroDemoFrame: React.FC = () => {
  const src = "/will-creator?demo=1&embed=1";
  return (
    <div className="relative aspect-[16/10] rounded-xl border bg-card shadow overflow-hidden">
      <iframe
        src={src}
        title="Will & Trust Creator live demo"
        className="absolute inset-0 w-full h-full"
        loading="lazy"
      />
    </div>
  );
};

export default HeroDemoFrame;
