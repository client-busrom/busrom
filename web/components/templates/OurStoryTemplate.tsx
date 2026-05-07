"use client";

import React from "react";
import { StoryHeroSection } from "@/components/story/StoryHeroSection";
import { StoryWhoWeAreSection } from "@/components/story/StoryWhoWeAreSection";
import { StoryBrandPositionSection } from "@/components/story/StoryBrandPositionSection";
import { StoryBrandStorySection } from "@/components/story/StoryBrandStorySection";
import { StoryBrandHighlightsSection } from "@/components/story/StoryBrandHighlightsSection";
import { StoryBrandStrengthsSection } from "@/components/story/StoryBrandStrengthsSection";
import { StoryBrandMilestonesSection } from "@/components/story/StoryBrandMilestonesSection";
import { StoryBrandSustainabilitySection } from "@/components/story/StoryBrandSustainabilitySection";
import { StoryBrandProspectSection } from "@/components/story/StoryBrandProspectSection";
import { StoryContactFormSection } from "@/components/story/StoryContactFormSection";
import { StoryApplicationsSection } from "@/components/story/StoryApplicationsSection";
import { StoryQuoteSection } from "@/components/story/StoryQuoteSection";
import type { OurStoryData } from "@/lib/parsers/our-story-parser";

interface OurStoryTemplateProps {
  locale: string;
  data: OurStoryData;
  applications: any[];
}

export function OurStoryTemplate({
  locale,
  data,
  applications,
}: OurStoryTemplateProps) {
  // Combine extracted data with resolved applications for the applications section
  const applicationsDataWithItems = {
    ...data.applications,
    items: {
      slides: applications,
      autoplay: true,
      interval: 5,
    },
  };

  return (
    <div className="min-h-screen bg-[#f6f4ed]" data-header-theme="dark">
      <StoryHeroSection data={data.hero} />
      <StoryWhoWeAreSection data={data.whoWeAre} />
      <StoryBrandPositionSection data={data.brandPosition} />
      <StoryBrandStorySection data={data.brandStory} />
      <StoryBrandHighlightsSection data={data.brandHighlights} />
      <StoryBrandStrengthsSection data={data.brandStrengths} />
      <StoryBrandMilestonesSection data={data.brandTravel} />
      <StoryBrandSustainabilitySection data={data.sustainability} />
      <StoryBrandProspectSection data={data.prospect} />
      <StoryContactFormSection data={data.contactForm} />
      <StoryApplicationsSection data={applicationsDataWithItems} />
      <StoryQuoteSection data={data.quote} />
    </div>
  );
}
