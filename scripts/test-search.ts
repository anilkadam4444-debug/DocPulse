import { searchPublicDoctors } from '../src/features/doctor-search/searchService.ts';

async function testSearch() {
  console.log('Testing search filters:');

  const testCases = [
    { name: 'All Cities', filters: { city: '' } },
    { name: 'City: Mumbai', filters: { city: 'Mumbai' } },
    { name: 'City: mumbai (lowercase)', filters: { city: 'mumbai' } },
    { name: 'Spec: Orthopedic', filters: { city: 'Mumbai', specialization: 'Orthopedic' } },
    { name: 'Query: Anil', filters: { city: '', query: 'Anil' } },
    { name: 'Query: Moraya', filters: { city: '', query: 'Moraya' } },
    { name: 'Non-matching city: Delhi', filters: { city: 'Delhi' } },
  ];

  for (const tc of testCases) {
    const res = await searchPublicDoctors(tc.filters);
    console.log(`- ${tc.name}: Found ${res.doctors.length} doctors ${res.error ? `(Error: ${res.error})` : ''}`);
    if (res.doctors.length > 0) {
      console.log(`   Sample: ${res.doctors[0].fullName} (${res.doctors[0].specialization}, ${res.doctors[0].city})`);
    }
  }

  process.exit(0);
}

testSearch().catch((err) => {
  console.error(err);
  process.exit(1);
});
