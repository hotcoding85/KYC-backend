import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
    @IsString()
    @MinLength(8, { message: 'Old password must be at least 8 characters long' })
    readonly old_password: string;

    @IsString()
    @MinLength(8, { message: 'New password must be at least 8 characters long' })
    @Matches(/(?:(?=.*\d)(?=.*[A-Z])(?=.*\W).*)/, {
        message: 'New password must contain at least one uppercase letter, one number, and one special character',
    })
    readonly new_password: string;
}