import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/decorators/get-user.decorator';
import { AuthTokenGuard } from 'src/decorators/auth-token.guard';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post()
  async createInvoice(
    @GetUser('telegram_id') userId: number,
    @Body() createInvoiceDto: CreateInvoiceDto,
  ) {
    return this.invoiceService.createInvoiceLink(userId, createInvoiceDto);
  }
  @Public()
  @Post('confirm')
  @UseGuards(AuthTokenGuard)
  async handleSuccessfulPayment(@Body() body: any) {
    const { userId, amount, externalId, description } = body;

    if (!externalId) {
      throw new BadRequestException('Missing required field: externalId');
    }

    // Вызываем сервис для подтверждения инвойса
    await this.invoiceService.confirmInvoice({
      userId,
      amount,
      externalId,
      description,
    });

    return { status: 'success', message: 'Cooldown reset successfully' };
  }
}
