import type { ReactNode } from "react";

type PublicPageIntroProps = {
  aside?: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
};

/** Short page header: one headline and one plain sentence. */
export function PublicPageIntro({ aside, description, title }: PublicPageIntroProps) {
  return (
    <section className="bg-brand-deep text-white">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-6 md:py-16 lg:px-8">
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-white/85">{description}</p>
        {aside ? <div className="mt-6 max-w-2xl text-base leading-7 text-white/85">{aside}</div> : null}
      </div>
    </section>
  );
}
