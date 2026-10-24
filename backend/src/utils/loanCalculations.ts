// Pure functions, no Prisma/Express imports here on purpose — that's what
// makes them trivial to unit test without a real database (see
// src/__tests__/loanCalculations.test.ts).

export interface LoanLike {
  repaid: boolean;
  dueDate: Date;
  amount: number;
}

export function isOverdue(loan: LoanLike, now: Date = new Date()): boolean {
  return !loan.repaid && loan.dueDate.getTime() < now.getTime();
}

export function withOverdueFlag<T extends LoanLike>(loan: T, now: Date = new Date()) {
  return { ...loan, overdue: isOverdue(loan, now) };
}

export interface Summary {
  totalLent: number;
  totalRepaid: number;
  overdueAmount: number;
}

export function computeSummary(loans: LoanLike[], now: Date = new Date()): Summary {
  let totalLent = 0;
  let totalRepaid = 0;
  let overdueAmount = 0;

  for (const loan of loans) {
    totalLent += loan.amount;
    if (loan.repaid) {
      totalRepaid += loan.amount;
    } else if (isOverdue(loan, now)) {
      overdueAmount += loan.amount;
    }
  }

  return { totalLent, totalRepaid, overdueAmount };
}
