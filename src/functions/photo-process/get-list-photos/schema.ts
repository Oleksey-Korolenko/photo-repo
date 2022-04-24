export default {
  type: 'object',
  properties: {
    limit: {
      type: 'number',
    },
    startAfter: {
      type: 'string',
    },
  },
  required: ['limit'],
} as const;
