export function getField(section, slug, fallback = "") {
  return section?.fields?.find((field) => field.slug === slug)?.value || fallback;
}

export function fieldSummary(section) {
  return (
    section?.fields
      ?.filter((field) => field.value)
      .slice(0, 2)
      .map((field) => field.value)
      .join(" · ") || "No content yet"
  );
}

