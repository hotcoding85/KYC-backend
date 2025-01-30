import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsDate,
  IsString,
  ValidateNested,
  IsNotEmpty,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  IsArray,
} from 'class-validator';
import {
  FEE_SCHEME_ACTIVITY,
  FEE_SCHEME_FEE_TYPE,
  FEE_SCHEME_GAS_PRICE_TYPE,
  FEE_SCHEME_CRITERIA_TYPE,
  FEE_SCHEME_CRITERIA_COMPARASION,
} from 'src/lib/enums';

function IsValidFee(validationOptions?: ValidationOptions) {
  return function (object: CreateFeeSchemeDto, propertyName: string) {
    registerDecorator({
      name: 'isValidFee',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: number, args: ValidationArguments) {
          const obj = args.object as CreateFeeSchemeDto;
          if (obj.feeType === FEE_SCHEME_FEE_TYPE.PERCENT) {
            return value >= 0 && value <= 100;
          } else {
            return value > 0;
          }
        },
        defaultMessage(args: ValidationArguments) {
          const obj = args.object as CreateFeeSchemeDto;
          if (obj.feeType === FEE_SCHEME_FEE_TYPE.PERCENT) {
            return 'Fee must be between 0 and 100 when fee type is Percentage';
          } else {
            return 'Fee must be greater than 0 when fee type is not Percentage';
          }
        },
      },
    });
  };
}

function IsValidGasPrice(validationOptions?: ValidationOptions) {
  return function (object: CreateFeeSchemeDto, propertyName: string) {
    registerDecorator({
      name: 'isValidGasPrice',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: number, args: ValidationArguments) {
          const obj = args.object as CreateFeeSchemeDto;
          if (obj.gasPriceType === FEE_SCHEME_GAS_PRICE_TYPE.PERCENT) {
            return value >= 0 && value <= 100;
          } else {
            return value > 0;
          }
        },
        defaultMessage(args: ValidationArguments) {
          const obj = args.object as CreateFeeSchemeDto;
          if (obj.gasPriceType === FEE_SCHEME_GAS_PRICE_TYPE.PERCENT) {
            return 'Gas price must be between 0 and 100 when gas price type is Percentage';
          } else {
            return 'Gas price must be greater than 0 when gas price type is not Percentage';
          }
        },
      },
    });
  };
}

class CriteriaDto {
  @IsEnum(FEE_SCHEME_CRITERIA_TYPE)
  criteria: FEE_SCHEME_CRITERIA_TYPE;

  @IsEnum(FEE_SCHEME_CRITERIA_COMPARASION)
  comparasion: FEE_SCHEME_CRITERIA_COMPARASION;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateFeeSchemeDto {
  @IsEnum(FEE_SCHEME_ACTIVITY)
  activity: FEE_SCHEME_ACTIVITY;

  @IsEnum(FEE_SCHEME_FEE_TYPE)
  feeType: FEE_SCHEME_FEE_TYPE;

  @IsNumber()
  @IsValidFee()
  fee: number;

  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @IsEnum(FEE_SCHEME_GAS_PRICE_TYPE)
  gasPriceType: FEE_SCHEME_GAS_PRICE_TYPE;

  @IsNumber()
  @IsValidGasPrice()
  gasPrice: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CriteriaDto)
  criteria: CriteriaDto[];

  @IsString()
  @IsNotEmpty()
  rules: string;

  @IsString()
  networkId: string;
}
