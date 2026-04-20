import { z } from "zod";

export const invitationTemplateIds = ["soft-rose", "clean-garden", "classic-letter"] as const;

export type InvitationTemplateId = (typeof invitationTemplateIds)[number];

export const invitationTemplates: Array<{
  id: InvitationTemplateId;
  name: string;
  description: string;
}> = [
  {
    id: "soft-rose",
    name: "Soft Rose",
    description: "은은한 로즈 톤의 감성적인 청첩장"
  },
  {
    id: "clean-garden",
    name: "Clean Garden",
    description: "싱그러운 그린 포인트의 깔끔한 청첩장"
  },
  {
    id: "classic-letter",
    name: "Classic Letter",
    description: "편지지처럼 단정한 클래식 청첩장"
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

export const invitationConfigSchema = z.object({
  templateId: z.enum(invitationTemplateIds).default("soft-rose"),
  bankAccounts: z.array(bankAccountSchema).default([])
});

export type InvitationGalleryItem = z.infer<typeof invitationGalleryItemSchema>;
export type BankAccount = z.infer<typeof bankAccountSchema>;
export type InvitationConfig = z.infer<typeof invitationConfigSchema>;

export function parseInvitationConfig(value: unknown): InvitationConfig {
  return invitationConfigSchema.catch({
    templateId: "soft-rose",
    bankAccounts: []
  }).parse(value);
}

export function parseInvitationGallery(value: unknown): InvitationGalleryItem[] {
  return z.array(invitationGalleryItemSchema).catch([]).parse(value);
}
