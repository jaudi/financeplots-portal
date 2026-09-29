import type { Metadata } from "next";
import AudienceHub from "@/components/AudienceHub";
import { audienceMetadata } from "@/lib/audience-metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return audienceMetadata("personal", locale);
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <AudienceHub audience="personal" locale={locale} />;
}
