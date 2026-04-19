import 'fastify';
import type { Student } from '@prisma/client';

declare module 'fastify' {
  interface FastifyRequest {
    /** Set by user route auth preHandler for student-only APIs */
    student?: Student;
  }
}
