//El archivo este no es obligatorio tenerlo, pero lo hice para poner las variables globales asi no renegamos

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
});
