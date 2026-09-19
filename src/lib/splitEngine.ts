import { toPaise, toRupees } from '../utils/currency';
import { SplitStrategy } from '../types/upi';

export interface SplitResult {
  amountsPaise: number[];
  amountsRupees: number[];
  totalPaise: number;
  totalRupees: number;
  isValid: boolean;
  error?: string;
}

/**
 * Generates natural randomized split amounts strictly under maxPaise.
 * Guarantees SUM(parts) === totalPaise exactly down to the last rupee/paise.
 */
function generateRandomVariedPaise(
  totalPaise: number,
  maxPaise: number,
  isWholeRupees: boolean
): number[] {
  const numParts = Math.max(1, Math.ceil(totalPaise / maxPaise));
  if (numParts <= 1) {
    return [totalPaise];
  }

  // Start with a balanced baseline
  let parts: number[] = [];
  if (isWholeRupees && totalPaise % 100 === 0) {
    const totalRupees = Math.round(totalPaise / 100);
    const baseRupees = Math.floor(totalRupees / numParts);
    const remainderRupees = totalRupees % numParts;
    for (let i = 0; i < numParts; i++) {
      parts.push(toPaise(i < remainderRupees ? baseRupees + 1 : baseRupees));
    }
  } else {
    const basePaise = Math.floor(totalPaise / numParts);
    const remainderPaise = totalPaise % numParts;
    for (let i = 0; i < numParts; i++) {
      parts.push(i < remainderPaise ? basePaise + 1 : basePaise);
    }
  }

  const stepPaise = isWholeRupees ? 100 : 1;
  const minPartPaise = Math.max(
    stepPaise,
    toPaise(Math.min(100, Math.floor(totalPaise / (numParts * 200)) * 100))
  );

  // Perform multiple randomized exchanges between pairs
  // e.g. takes ₹178 from one, adds to another so it becomes 1928, 1802, etc.
  const iterations = Math.min(120, numParts * 30);
  for (let iter = 0; iter < iterations; iter++) {
    const i = Math.floor(Math.random() * numParts);
    let j = Math.floor(Math.random() * numParts);
    while (j === i) {
      j = Math.floor(Math.random() * numParts);
    }

    const roomI = maxPaise - parts[i];
    const roomJ = parts[j] - minPartPaise;
    const maxTransfer = Math.min(roomI, roomJ);

    if (maxTransfer >= stepPaise) {
      const maxSteps = Math.floor(maxTransfer / stepPaise);
      if (maxSteps > 0) {
        // Pick random step count biased to create natural uneven amounts (e.g. 1928, 1802)
        const randomSteps = Math.floor(Math.random() * Math.min(maxSteps, 250)) + 1;
        const transfer = randomSteps * stepPaise;
        parts[i] += transfer;
        parts[j] -= transfer;
      }
    }
  }

  // Shuffle order randomly
  for (let i = parts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }

  return parts;
}

/**
 * Split Engine using integer paise internally to guarantee 100% precision.
 * Every algorithm enforces SUM(parts) === total without any rounding drift.
 */
export function calculateSplit(
  totalRupees: number,
  strategy: SplitStrategy,
  options: {
    maxAmountRupees?: number;
    equalPartsCount?: number;
    customAmountsRupees?: number[];
    randomSeed?: number;
  }
): SplitResult {
  const totalPaise = toPaise(totalRupees);

  if (totalPaise <= 0) {
    return {
      amountsPaise: [],
      amountsRupees: [],
      totalPaise: 0,
      totalRupees: 0,
      isValid: false,
      error: 'Total amount must be greater than ₹0',
    };
  }

  let amountsPaise: number[] = [];

  switch (strategy) {
    case 'random': {
      const maxPaise = toPaise(options.maxAmountRupees || 1999);
      if (maxPaise <= 0) {
        return {
          amountsPaise: [],
          amountsRupees: [],
          totalPaise,
          totalRupees,
          isValid: false,
          error: 'Maximum amount per payment must be greater than ₹0',
        };
      }

      const isWholeRupees = totalPaise % 100 === 0;
      amountsPaise = generateRandomVariedPaise(totalPaise, maxPaise, isWholeRupees);
      break;
    }

    case 'max_amount': {
      const maxPaise = toPaise(options.maxAmountRupees || 1999);
      if (maxPaise <= 0) {
        return {
          amountsPaise: [],
          amountsRupees: [],
          totalPaise,
          totalRupees,
          isValid: false,
          error: 'Maximum amount per payment must be greater than ₹0',
        };
      }

      let remaining = totalPaise;
      while (remaining > maxPaise) {
        amountsPaise.push(maxPaise);
        remaining -= maxPaise;
      }
      if (remaining > 0) {
        amountsPaise.push(remaining);
      }
      break;
    }

    case 'balanced': {
      const maxPaise = toPaise(options.maxAmountRupees || 1999);
      if (maxPaise <= 0) {
        return {
          amountsPaise: [],
          amountsRupees: [],
          totalPaise,
          totalRupees,
          isValid: false,
          error: 'Maximum amount per payment must be greater than ₹0',
        };
      }

      // Determine required number of parts
      const numParts = Math.max(1, Math.ceil(totalPaise / maxPaise));
      
      const isWholeRupees = totalPaise % 100 === 0;
      if (isWholeRupees && totalRupees >= numParts) {
        const baseRupees = Math.floor(totalRupees / numParts);
        const remainderRupees = totalRupees % numParts;
        for (let i = 0; i < numParts; i++) {
          const partRupees = i < remainderRupees ? baseRupees + 1 : baseRupees;
          amountsPaise.push(toPaise(partRupees));
        }
      } else {
        const basePaise = Math.floor(totalPaise / numParts);
        const remainderPaise = totalPaise % numParts;
        for (let i = 0; i < numParts; i++) {
          const partPaise = i < remainderPaise ? basePaise + 1 : basePaise;
          amountsPaise.push(partPaise);
        }
      }
      break;
    }

    case 'equal': {
      const numParts = Math.max(1, Math.floor(options.equalPartsCount || 2));
      if (numParts < 1) {
        return {
          amountsPaise: [],
          amountsRupees: [],
          totalPaise,
          totalRupees,
          isValid: false,
          error: 'Number of split payments must be at least 1',
        };
      }

      const isWholeRupees = totalPaise % 100 === 0;
      if (isWholeRupees && totalRupees >= numParts) {
        const baseRupees = Math.floor(totalRupees / numParts);
        const remainderRupees = totalRupees % numParts;
        for (let i = 0; i < numParts; i++) {
          const partRupees = i < remainderRupees ? baseRupees + 1 : baseRupees;
          amountsPaise.push(toPaise(partRupees));
        }
      } else {
        const basePaise = Math.floor(totalPaise / numParts);
        const remainderPaise = totalPaise % numParts;
        for (let i = 0; i < numParts; i++) {
          const partPaise = i < remainderPaise ? basePaise + 1 : basePaise;
          amountsPaise.push(partPaise);
        }
      }
      break;
    }

    case 'custom': {
      const customRupees = options.customAmountsRupees || [];
      if (customRupees.length === 0) {
        return {
          amountsPaise: [],
          amountsRupees: [],
          totalPaise,
          totalRupees,
          isValid: false,
          error: 'Please specify at least one payment amount.',
        };
      }

      amountsPaise = customRupees.map((r) => toPaise(r));
      const sumPaise = amountsPaise.reduce((acc, curr) => acc + curr, 0);

      if (sumPaise !== totalPaise) {
        const diffRupees = toRupees(Math.abs(sumPaise - totalPaise));
        const direction = sumPaise < totalPaise ? 'short' : 'over';
        return {
          amountsPaise,
          amountsRupees: amountsPaise.map((p) => toRupees(p)),
          totalPaise,
          totalRupees,
          isValid: false,
          error: `The sum of custom payments (₹${toRupees(sumPaise)}) is ₹${diffRupees} ${direction} of the total (₹${totalRupees}).`,
        };
      }
      break;
    }
  }

  // Strict Invariant Check (Section 38: SUM(splitAmounts) === originalAmount)
  const calculatedSumPaise = amountsPaise.reduce((sum, p) => sum + p, 0);
  if (calculatedSumPaise !== totalPaise) {
    return {
      amountsPaise: [],
      amountsRupees: [],
      totalPaise,
      totalRupees,
      isValid: false,
      error: `Unable to generate split. Mathematical invariant failed: sum (₹${toRupees(calculatedSumPaise)}) !== total (₹${totalRupees}). Please review amounts.`,
    };
  }

  const amountsRupees = amountsPaise.map((p) => toRupees(p));

  return {
    amountsPaise,
    amountsRupees,
    totalPaise,
    totalRupees,
    isValid: true,
  };
}
