export function newUser() {
  const id = `${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  return {
    username: `ch_assessment_${id}`,
    password: 'TestPass123!',
  };
}

export const orderData = {
  name: 'Assessment Tester',
  country: 'United Kingdom',
  city: 'Cardiff',
  card: '4111111111111111',
  month: '09',
  year: '2026',
};
