import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { trim } from '../../common/utils.js';

const normalizeEmail = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class SignupDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(100)
  name!: string;

  @Transform(normalizeEmail)
  @IsEmail({}, { message: 'Enter a valid email address' })
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72, { message: 'Password must be at most 72 characters' })
  password!: string;
}

export { normalizeEmail };