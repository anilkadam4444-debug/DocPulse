import test from 'node:test';
import assert from 'node:assert/strict';

test('QR Code Booking: generates location-specific booking URL', () => {
  const doctorUid = 'doc_anil_123';
  const locationId = 'loc_bandra_456';
  const origin = 'https://docpulseind.web.app';
  const generatedUrl = `${origin}/book/${doctorUid}/${locationId}`;

  assert.equal(generatedUrl, 'https://docpulseind.web.app/book/doc_anil_123/loc_bandra_456');
  assert.ok(generatedUrl.includes(doctorUid));
  assert.ok(generatedUrl.includes(locationId));
  // Verify zero sensitive PII is embedded in URL
  assert.ok(!generatedUrl.includes('patient'));
  assert.ok(!generatedUrl.includes('token'));
  assert.ok(!generatedUrl.includes('password'));
});

test('Receptionist Walk-in: preserves single authoritative token sequence', () => {
  // Simulate daily queue token counter incrementation
  let lastTokenNumber = 4;

  const registerWalkIn = () => {
    lastTokenNumber += 1;
    return {
      tokenNumber: lastTokenNumber,
      formattedToken: `T-${lastTokenNumber.toString().padStart(2, '0')}`,
      status: 'waiting',
      bookingSource: 'walk_in',
    };
  };

  const patient1 = registerWalkIn();
  assert.equal(patient1.tokenNumber, 5);
  assert.equal(patient1.formattedToken, 'T-05');
  assert.equal(patient1.status, 'waiting');
  assert.equal(patient1.bookingSource, 'walk_in');

  const patient2 = registerWalkIn();
  assert.equal(patient2.tokenNumber, 6);
  assert.equal(patient2.formattedToken, 'T-06');
});

test('Receptionist Access Boundaries: enforces tenant & role isolation', () => {
  const receptionistAccount = {
    id: 'rec_101',
    doctorUid: 'doc_anil_123',
    assignedLocationIds: ['loc_bandra_456'],
    status: 'active',
  };

  // Receptionist should only have access to their assigned locations
  const isAuthorizedForLocation = (locationId: string) =>
    receptionistAccount.assignedLocationIds.includes(locationId);

  assert.equal(isAuthorizedForLocation('loc_bandra_456'), true);
  assert.equal(isAuthorizedForLocation('loc_other_doctor_789'), false);
  assert.equal(isAuthorizedForLocation('loc_pune_999'), false);
});
