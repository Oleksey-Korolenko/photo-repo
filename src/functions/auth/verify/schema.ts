export default {
  type: 'object',
  properties: {
    email: { type: 'string' },
    code: { type: 'string' },
    password: { type: 'string' },
  },
  required: ['email', 'code', 'password'],
} as const;
