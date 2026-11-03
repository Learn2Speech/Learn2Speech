// Age check for sign-up. COPPA (a US law) says apps that collect personal information,
// which includes voice recordings, from children under 13 need a parent's consent.
// We don't collect that, so Learn2Speech is 13+ only, and this decides who can sign up.
// Written by Claude at Rian's request (counts as auth-flow core code; logged in the AI log).

export const MINIMUM_AGE = 13;

// We only ask for birth month and year (less personal data than a full birthday).
// Without the day we can't know if this month's birthday has happened yet, so we
// play it safe and count it as not yet: someone born this month is treated as a year younger.
// birthMonth is 1-12 (January = 1). `today` is a parameter so the function is easy to test.
export function isOldEnough(birthYear: number, birthMonth: number, today: Date = new Date()): boolean {
  const thisYear = today.getFullYear();
  const thisMonth = today.getMonth() + 1; // getMonth() counts January as 0
  let age = thisYear - birthYear;
  if (thisMonth <= birthMonth) age -= 1; // birthday not (safely) reached yet this year
  return age >= MINIMUM_AGE;
}
