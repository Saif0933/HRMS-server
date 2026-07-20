import { LetterRepository } from "../repo/letter.repo.ts";

export class LetterService {
  static async getIssuedLetters() {
    return LetterRepository.findIssuedLetters();
  }

  static async issueLetter(data: {
    templateType: string;
    recipientName: string;
    recipientRole: string;
    joiningDate?: string | null;
    salaryCtc?: string | null;
    warningReason?: string | null;
  }) {
    return LetterRepository.createIssuedLetter(data);
  }
}
