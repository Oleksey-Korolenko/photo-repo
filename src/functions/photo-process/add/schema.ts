export default {
  type: 'object',
  properties: {
    base64Image: {
      type: 'string',
    },
  },
  required: ['base64Image'],
} as const;
