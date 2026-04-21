import { z } from "zod";

export const invitationTemplateIds = ["soft-rose", "clean-garden", "classic-letter"] as const;
export type InvitationTemplateId = (typeof invitationTemplateIds)[number];

export const invitationGalleryDisplayModes = ["animated", "slide", "full"] as const;
export type InvitationGalleryDisplayMode = (typeof invitationGalleryDisplayModes)[number];

export const invitationFontPresets = ["serif", "modern", "romantic"] as const;
export type InvitationFontPreset = (typeof invitationFontPresets)[number];

export const invitationSectionIds = [
  "intro",
  "gallery",
  "location",
  "gift",
  "rsvp",
  "guestbook"
] as const;
export type InvitationSectionId = (typeof invitationSectionIds)[number];

export const invitationTemplates: Array<{
  id: InvitationTemplateId;
  name: string;
  description: string;
  accentClass: string;
}> = [
  {
    id: "soft-rose",
    name: "Soft Rose",
    description: "은은한 로즈 톤과 여백이 중심이 되는 부드러운 분위기",
    accentClass: "bg-[#f6e8e6]"
  },
  {
    id: "clean-garden",
    name: "Clean Garden",
    description: "그린 포인트와 정돈된 흐름이 돋보이는 산뜻한 분위기",
    accentClass: "bg-[#e8f0e5]"
  },
  {
    id: "classic-letter",
    name: "Classic Letter",
    description: "차분한 종이 질감과 편지 같은 리듬의 클래식한 분위기",
    accentClass: "bg-[#f0e6d8]"
  }
];

export const invitationGalleryItemSchema = z.object({
  id: z.string(),
  src: z.string(),
  fileName: z.string(),
  alt: z.string().optional()
});

export const bankAccountSchema = z.object({
  id: z.string(),
  label: z.string(),
  bankName: z.string(),
  accountNumber: z.string(),
  holderName: z.string()
});

export const invitationCopySchema = z.object({
  heroEyebrow: z.string().default("Wedding Invitation"),
  heroDescription: z
    .string()
    .default("두 사람이 같은 방향을 바라보며 새로운 계절을 시작합니다."),
  galleryTitle: z.string().default("우리의 순간"),
  galleryDescription: z.string().default("함께 지나온 장면을 천천히 둘러보세요."),
  locationTitle: z.string().default("오시는 길"),
  locationDescription: z.string().default("예식장 안내와 교통 정보를 확인해 주세요."),
  giftTitle: z.string().default("마음 전하실 곳"),
  giftDescription: z
    .string()
    .default("축하의 마음을 전하고 싶으신 분들을 위해 준비했습니다."),
  rsvpTitle: z.string().default("참석 여부"),
  rsvpDescription: z.string().default("편하게 참석 여부를 남겨 주세요."),
  guestbookTitle: z.string().default("축하 메시지"),
  guestbookDescription: z.string().default("두 사람에게 따뜻한 말을 남겨 주세요."),
  mapButtonLabel: z.string().default("길찾기 열기"),
  saveImageLabel: z.string().default("사진 저장")
});

export const invitationVenueGuideSchema = z.object({
  hall: z.string().default(""),
  floor: z.string().default(""),
  parking: z.string().default(""),
  meal: z.string().default(""),
  extra: z.string().default("")
});

export const invitationGalleryOptionsSchema = z.object({
  displayMode: z.enum(invitationGalleryDisplayModes).default("slide"),
  enableZoom: z.boolean().default(true),
  showSaveButton: z.boolean().default(false)
});

export const invitationDesignSchema = z.object({
  fontPreset: z.enum(invitationFontPresets).default("serif")
});

export const invitationPlaceSearchSchema = z.object({
  query: z.string().default(""),
  placeName: z.string().default(""),
  roadAddress: z.string().default(""),
  phone: z.string().default(""),
  placeUrl: z.string().default("")
});

export const invitationConfigSchema = z.object({
  templateId: z.enum(invitationTemplateIds).default("soft-rose"),
  sectionOrder: z.array(z.enum(invitationSectionIds)).default(invitationSectionIds.slice()),
  copy: invitationCopySchema.default(() => invitationCopySchema.parse({})),
  galleryOptions: invitationGalleryOptionsSchema.default(() =>
    invitationGalleryOptionsSchema.parse({})
  ),
  venueGuide: invitationVenueGuideSchema.default(() => invitationVenueGuideSchema.parse({})),
  design: invitationDesignSchema.default(() => invitationDesignSchema.parse({})),
  placeSearch: invitationPlaceSearchSchema.default(() => invitationPlaceSearchSchema.parse({})),
  bankAccounts: z.array(bankAccountSchema).default([])
});

export type InvitationGalleryItem = z.infer<typeof invitationGalleryItemSchema>;
export type BankAccount = z.infer<typeof bankAccountSchema>;
export type InvitationCopy = z.infer<typeof invitationCopySchema>;
export type InvitationVenueGuide = z.infer<typeof invitationVenueGuideSchema>;
export type InvitationGalleryOptions = z.infer<typeof invitationGalleryOptionsSchema>;
export type InvitationDesign = z.infer<typeof invitationDesignSchema>;
export type InvitationPlaceSearch = z.infer<typeof invitationPlaceSearchSchema>;
export type InvitationConfig = z.infer<typeof invitationConfigSchema>;

export function getDefaultSectionOrder(templateId: InvitationTemplateId): InvitationSectionId[] {
  switch (templateId) {
    case "clean-garden":
      return ["intro", "location", "gallery", "rsvp", "gift", "guestbook"];
    case "classic-letter":
      return ["intro", "gallery", "gift", "location", "guestbook", "rsvp"];
    default:
      return ["intro", "gallery", "location", "gift", "rsvp", "guestbook"];
  }
}

export function getDefaultFontPreset(templateId: InvitationTemplateId): InvitationFontPreset {
  switch (templateId) {
    case "clean-garden":
      return "modern";
    case "classic-letter":
      return "romantic";
    default:
      return "serif";
  }
}

export function createDefaultInvitationConfig(
  templateId: InvitationTemplateId = "soft-rose"
): InvitationConfig {
  return {
    templateId,
    sectionOrder: getDefaultSectionOrder(templateId),
    copy: invitationCopySchema.parse({}),
    galleryOptions: invitationGalleryOptionsSchema.parse({}),
    venueGuide: invitationVenueGuideSchema.parse({}),
    design: {
      fontPreset: getDefaultFontPreset(templateId)
    },
    placeSearch: invitationPlaceSearchSchema.parse({}),
    bankAccounts: []
  };
}

export function normalizeSectionOrder(
  sectionOrder: InvitationSectionId[] | undefined,
  templateId: InvitationTemplateId
) {
  const preferred = sectionOrder?.length ? sectionOrder : getDefaultSectionOrder(templateId);
  const merged = [...preferred, ...getDefaultSectionOrder(templateId), ...invitationSectionIds];

  return merged.filter(
    (sectionId, index) =>
      invitationSectionIds.includes(sectionId) && merged.indexOf(sectionId) === index
  ) as InvitationSectionId[];
}

export function parseInvitationConfig(value: unknown): InvitationConfig {
  const parsed = invitationConfigSchema.catch(createDefaultInvitationConfig()).parse(value);

  return {
    ...createDefaultInvitationConfig(parsed.templateId),
    ...parsed,
    design: {
      fontPreset: parsed.design?.fontPreset ?? getDefaultFontPreset(parsed.templateId)
    },
    sectionOrder: normalizeSectionOrder(parsed.sectionOrder, parsed.templateId)
  };
}

export function parseInvitationGallery(value: unknown): InvitationGalleryItem[] {
  return z.array(invitationGalleryItemSchema).catch([]).parse(value);
}
