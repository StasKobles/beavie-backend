import { IsNumber, IsString, IsNotEmpty } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsNotEmpty()
  upgrade_id: number;
}
