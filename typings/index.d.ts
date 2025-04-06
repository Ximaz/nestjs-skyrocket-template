import { FastifyRequest } from 'fastify';
import { DecryptedToken } from 'src/jwt/entity/token';

export type Page = { pageNumber: number; pageSize: number };

export type AuthenticatedRequest = FastifyRequest & { user: DecryptedToken };
