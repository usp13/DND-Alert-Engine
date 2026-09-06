import { ShippingLineRule } from '../types';

export const shippingLineRules: ShippingLineRule[] = [
  {
    name: "Maersk",
    prefix: "MSKU",
    demurrageFree: 7,
    detentionFree: 7,
    model: "Split",
    calendarBasis: "Calendar Days",
    slabs: {
      "20ft": [
        { from: 1, to: 7, rate: 3500, label: "Day 8–14" },
        { from: 8, to: 14, rate: 7000, label: "Day 15–21" },
        { from: 15, to: 999, rate: 14000, label: "Day 22+" }
      ],
      "40ft": [
        { from: 1, to: 7, rate: 7000, label: "Day 8–14" },
        { from: 8, to: 14, rate: 14000, label: "Day 15–21" },
        { from: 15, to: 999, rate: 28000, label: "Day 22+" }
      ]
    }
  },
  {
    name: "MSC",
    prefix: "MSCU",
    demurrageFree: 5,
    detentionFree: 7,
    model: "Split",
    calendarBasis: "Calendar Days",
    slabs: {
      "20ft": [
        { from: 1, to: 7, rate: 3000, label: "Day 6–12" },
        { from: 8, to: 14, rate: 6000, label: "Day 13–19" },
        { from: 15, to: 999, rate: 12000, label: "Day 20+" }
      ],
      "40ft": [
        { from: 1, to: 7, rate: 6000, label: "Day 6–12" },
        { from: 8, to: 14, rate: 12000, label: "Day 13–19" },
        { from: 15, to: 999, rate: 24000, label: "Day 20+" }
      ]
    }
  },
  {
    name: "CMA CGM",
    prefix: "CMAU",
    demurrageFree: 10,
    detentionFree: 0,
    model: "Merged",
    calendarBasis: "Calendar Days",
    slabs: {
      "20ft": [
        { from: 1, to: 7, rate: 3000, label: "Day 11–17" },
        { from: 8, to: 14, rate: 6000, label: "Day 18–24" },
        { from: 15, to: 999, rate: 10000, label: "Day 25+" }
      ],
      "40ft": [
        { from: 1, to: 7, rate: 6000, label: "Day 11–17" },
        { from: 8, to: 14, rate: 12000, label: "Day 18–24" },
        { from: 15, to: 999, rate: 20000, label: "Day 25+" }
      ]
    }
  },
  {
    name: "Hapag-Lloyd",
    prefix: "HLBU",
    demurrageFree: 7,
    detentionFree: 7,
    model: "Split",
    calendarBasis: "Calendar Days",
    slabs: {
      "20ft": [
        { from: 1, to: 7, rate: 3500, label: "Day 8–14" },
        { from: 8, to: 14, rate: 7000, label: "Day 15–21" },
        { from: 15, to: 999, rate: 10500, label: "Day 22+" }
      ],
      "40ft": [
        { from: 1, to: 7, rate: 7000, label: "Day 8–14" },
        { from: 8, to: 14, rate: 14000, label: "Day 15–21" },
        { from: 15, to: 999, rate: 21000, label: "Day 22+" }
      ]
    }
  },
  {
    name: "ONE",
    prefix: "ONEY",
    demurrageFree: 7,
    detentionFree: 7,
    model: "Split",
    calendarBasis: "Calendar Days",
    slabs: {
      "20ft": [
        { from: 1, to: 7, rate: 3000, label: "Day 8–14" },
        { from: 8, to: 14, rate: 6000, label: "Day 15–21" },
        { from: 15, to: 999, rate: 9000, label: "Day 22+" }
      ],
      "40ft": [
        { from: 1, to: 7, rate: 6000, label: "Day 8–14" },
        { from: 8, to: 14, rate: 12000, label: "Day 15–21" },
        { from: 15, to: 999, rate: 18000, label: "Day 22+" }
      ]
    }
  },
  {
    name: "Evergreen",
    prefix: "EISU",
    demurrageFree: 7,
    detentionFree: 7,
    model: "Split",
    calendarBasis: "Calendar Days",
    slabs: {
      "20ft": [
        { from: 1, to: 7, rate: 2500, label: "Day 8–14" },
        { from: 8, to: 14, rate: 5000, label: "Day 15–21" },
        { from: 15, to: 999, rate: 10000, label: "Day 22+" }
      ],
      "40ft": [
        { from: 1, to: 7, rate: 5000, label: "Day 8–14" },
        { from: 8, to: 14, rate: 10000, label: "Day 15–21" },
        { from: 15, to: 999, rate: 20000, label: "Day 22+" }
      ]
    }
  },
  {
    name: "COSCO",
    prefix: "COSU",
    demurrageFree: 7,
    detentionFree: 7,
    model: "Split",
    calendarBasis: "Calendar Days",
    slabs: {
      "20ft": [
        { from: 1, to: 7, rate: 3000, label: "Day 8–14" },
        { from: 8, to: 14, rate: 6000, label: "Day 15–21" },
        { from: 15, to: 999, rate: 9000, label: "Day 22+" }
      ],
      "40ft": [
        { from: 1, to: 7, rate: 6000, label: "Day 8–14" },
        { from: 8, to: 14, rate: 12000, label: "Day 15–21" },
        { from: 15, to: 999, rate: 18000, label: "Day 22+" }
      ]
    }
  },
  {
    name: "Yang Ming",
    prefix: "YMLU",
    demurrageFree: 7,
    detentionFree: 7,
    model: "Split",
    calendarBasis: "Calendar Days",
    slabs: {
      "20ft": [
        { from: 1, to: 7, rate: 2500, label: "Day 8–14" },
        { from: 8, to: 14, rate: 5000, label: "Day 15–21" },
        { from: 15, to: 999, rate: 8000, label: "Day 22+" }
      ],
      "40ft": [
        { from: 1, to: 7, rate: 5000, label: "Day 8–14" },
        { from: 8, to: 14, rate: 10000, label: "Day 15–21" },
        { from: 15, to: 999, rate: 16000, label: "Day 22+" }
      ]
    }
  },
  {
    name: "HMM",
    prefix: "HMMU",
    demurrageFree: 5,
    detentionFree: 5,
    model: "Split",
    calendarBasis: "Calendar Days",
    slabs: {
      "20ft": [
        { from: 1, to: 7, rate: 3000, label: "Day 6–12" },
        { from: 8, to: 14, rate: 6000, label: "Day 13–19" },
        { from: 15, to: 999, rate: 12000, label: "Day 20+" }
      ],
      "40ft": [
        { from: 1, to: 7, rate: 6000, label: "Day 6–12" },
        { from: 8, to: 14, rate: 12000, label: "Day 13–19" },
        { from: 15, to: 999, rate: 24000, label: "Day 20+" }
      ]
    }
  },
  {
    name: "ZIM",
    prefix: "ZIMU",
    demurrageFree: 7,
    detentionFree: 7,
    model: "Split",
    calendarBasis: "Calendar Days",
    slabs: {
      "20ft": [
        { from: 1, to: 7, rate: 3000, label: "Day 8–14" },
        { from: 8, to: 14, rate: 6000, label: "Day 15–21" },
        { from: 15, to: 999, rate: 9000, label: "Day 22+" }
      ],
      "40ft": [
        { from: 1, to: 7, rate: 6000, label: "Day 8–14" },
        { from: 8, to: 14, rate: 12000, label: "Day 15–21" },
        { from: 15, to: 999, rate: 18000, label: "Day 22+" }
      ]
    }
  }
];
