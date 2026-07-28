import { LetterRepository } from "../repo/letter.repo.ts";

export class LetterService {
  static async getIssuedLetters(organizationId?: string) {
    return LetterRepository.findIssuedLetters(organizationId);
  }

  static async issueLetter(
    data: {
      templateType: string;
      recipientName: string;
      recipientRole: string;
      joiningDate?: string | null;
      salaryCtc?: string | null;
      warningReason?: string | null;
    },
    organizationId?: string
  ) {
    return LetterRepository.createIssuedLetter({
      ...data,
      organizationId: organizationId || null,
    });
  }
}
