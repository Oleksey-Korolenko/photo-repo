export default {
  type: 'object',
  properties: {
    email: { type: 'string' },
    code: { type: 'string' },
  },
  required: ['email', 'code'],
} as const;
