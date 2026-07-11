export type Suggestion = {
  title: string;
  type: 'implementation';
};

const keywordMap: Record<string, string[]> = {
  website: ['Design UI', 'Setup Frontend', 'Setup Backend', 'Database Schema', 'Testing', 'Deployment'],
  mobile: ['UI/UX Design', 'Setup React Native', 'API Integration', 'Testing on Device', 'Release Preparation'],
  auth: ['JWT Setup', 'Login Endpoint', 'Register Endpoint', 'Password Hashing', 'Middleware'],
  database: ['Design Schema', 'Prisma Setup', 'Migrations', 'Seed Data'],
  testing: ['Jest Setup', 'Unit Tests', 'Integration Tests', 'E2E Testing'],
  payment: ['Stripe Integration', 'Webhook Handling', 'Checkout UI', 'Payment Database Models'],
  api: ['Define Endpoints', 'Express Setup', 'Input Validation', 'Error Handling'],
};

export const generateSuggestions = (title: string, description: string = ''): Suggestion[] => {
  const content = `${title} ${description}`.toLowerCase();
  const words = content.split(/\W+/);
  const suggestions = new Set<string>();

  words.forEach(word => {
    const list = keywordMap[word];
    if (list) {
      list.forEach(s => suggestions.add(s));
    }
  });

  // If no match is found, add some generic tasks to always provide a suggestion if asked
  if (suggestions.size === 0) {
    ['Define Scope', 'Initial Research', 'Implementation', 'Testing'].forEach(s => suggestions.add(s));
  }

  return Array.from(suggestions)
    .slice(0, 6)
    .map(s => ({ title: s, type: 'implementation' }));
};
