import { test } from 'node:test';
import assert from 'node:assert/strict';

interface TestPracticeLocation {
  id: string;
  name: string;
  addressLine: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  facilities: string[];
  isPrimary: boolean;
  isActive: boolean;
}

function ensurePrimaryLocation(locations: TestPracticeLocation[]): TestPracticeLocation[] {
  if (locations.length === 0) return [];
  const hasPrimary = locations.some((l) => l.isPrimary);
  if (hasPrimary) return locations;
  return locations.map((loc, idx) => ({
    ...loc,
    isPrimary: idx === 0,
  }));
}

function sanitizeConsultationFees(feeStr: string): number {
  const parsed = parseInt(feeStr.replace(/\D/g, ''), 10);
  return Number.isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

test('ensurePrimaryLocation ensures at least one primary location exists', () => {
  const list: TestPracticeLocation[] = [
    {
      id: 'loc_1',
      name: 'South Bombay Clinic',
      addressLine: '123 Colaba Causeway',
      locality: 'Colaba',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400005',
      facilities: [],
      isPrimary: false,
      isActive: true,
    },
    {
      id: 'loc_2',
      name: 'Bandra OPD Clinic',
      addressLine: '456 Linking Road',
      locality: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      facilities: [],
      isPrimary: false,
      isActive: true,
    },
  ];

  const result = ensurePrimaryLocation(list);
  assert.equal(result[0].isPrimary, true);
  assert.equal(result[1].isPrimary, false);
});

test('sanitizeConsultationFees handles numeric strings and invalid inputs', () => {
  assert.equal(sanitizeConsultationFees('500'), 500);
  assert.equal(sanitizeConsultationFees('₹ 750/-'), 750);
  assert.equal(sanitizeConsultationFees('invalid'), 0);
  assert.equal(sanitizeConsultationFees('0'), 0);
});
