import { isOverdue, withOverdueFlag, computeSummary } from "../utils/loanCalculations";

// These are plain unit tests against pure functions — no DB, no server,
// no mocking required. That's deliberate: the overdue/summary math is the
// one piece of business logic in this app worth pinning down with tests.

describe("isOverdue", () => {
  const now = new Date("2026-10-23T00:00:00Z");

  it("is true for an unpaid loan past its due date", () => {
    const loan = { repaid: false, dueDate: new Date("2026-10-01"), amount: 500 };
    expect(isOverdue(loan, now)).toBe(true);
  });

  it("is false for an unpaid loan due in the future", () => {
    const loan = { repaid: false, dueDate: new Date("2026-12-01"), amount: 500 };
    expect(isOverdue(loan, now)).toBe(false);
  });

  it("is false for a repaid loan even if past due", () => {
    const loan = { repaid: true, dueDate: new Date("2026-10-01"), amount: 500 };
    expect(isOverdue(loan, now)).toBe(false);
  });
});

describe("withOverdueFlag", () => {
  it("attaches overdue without mutating the original object", () => {
    const loan = { repaid: false, dueDate: new Date("2020-01-01"), amount: 100 };
    const result = withOverdueFlag(loan, new Date("2026-01-01"));
    expect(result.overdue).toBe(true);
    expect((loan as any).overdue).toBeUndefined();
  });
});

describe("computeSummary", () => {
  const now = new Date("2026-10-23T00:00:00Z");

  it("sums lent, repaid, and overdue amounts correctly", () => {
    const loans = [
      { repaid: true, dueDate: new Date("2026-09-01"), amount: 1000 }, // repaid
      { repaid: false, dueDate: new Date("2026-09-01"), amount: 300 }, // overdue
      { repaid: false, dueDate: new Date("2026-12-01"), amount: 200 }, // not yet due
    ];
    expect(computeSummary(loans, now)).toEqual({
      totalLent: 1500,
      totalRepaid: 1000,
      overdueAmount: 300,
    });
  });

  it("returns zeros for an empty list", () => {
    expect(computeSummary([], now)).toEqual({
      totalLent: 0,
      totalRepaid: 0,
      overdueAmount: 0,
    });
  });
});
