import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User as PrismaUser } from '@prisma/client';

export default class User implements Partial<PrismaUser> {
  @ApiProperty({ description: "The user's ID. It is a UUID.", type: String })
  readonly id: PrismaUser['id'];

  @ApiProperty({ description: "The user's firstname.", type: String })
  readonly firstname: PrismaUser['firstname'];

  @ApiProperty({ description: "The user's lastname.", type: String })
  readonly lastname: PrismaUser['lastname'];

  @ApiProperty({ description: "The user's email address.", type: String })
  readonly email: PrismaUser['email'];
}

export class UserIndex implements Partial<PrismaUser> {
  @ApiProperty({ description: "The user's ID. It is a UUID.", type: String })
  readonly id: PrismaUser['id'];

  @ApiProperty({ description: "The user's firstname.", type: String })
  readonly firstname: PrismaUser['firstname'];

  @ApiProperty({ description: "The user's lastname.", type: String })
  readonly lastname: PrismaUser['lastname'];
}

export class UserRetrieve implements Partial<PrismaUser> {
  @ApiProperty({ description: "The user's ID. It is a UUID.", type: String })
  readonly id: PrismaUser['id'];

  @ApiProperty({ description: "The user's firstname.", type: String })
  readonly firstname: PrismaUser['firstname'];

  @ApiProperty({ description: "The user's lastname.", type: String })
  readonly lastname: PrismaUser['lastname'];

  @ApiPropertyOptional({
    description:
      "The user's email address. This is only returned if the authenticated user ID matches the one being requested.",
    type: String,
  })
  readonly email?: PrismaUser['email'];
}
