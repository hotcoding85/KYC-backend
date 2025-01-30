import { IsString, MinLength, Matches, IsEmail } from 'class-validator';

export class ChangeEmailDto {
    @IsString()
    @MinLength(8, { message: 'Old password must be at least 8 characters long' })
    readonly old_password: string;

    @IsEmail({}, { message: 'New email must be a valid email address' })
    readonly new_email: string;
}