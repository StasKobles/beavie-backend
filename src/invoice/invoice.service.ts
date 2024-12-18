import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { Invoice } from './invoice.entity';
import { User } from 'src/user/user.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { UserUpgrade } from 'src/user/entities/user-upgrade.entity';

@Injectable()
export class InvoiceService {
  private readonly telegramApiUrl = `https://api.telegram.org/bot${process.env.BOT_TOKEN}`;

  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserUpgrade)
    private readonly userUpgradeRepository: Repository<UserUpgrade>,
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
  ) {}

  async createInvoiceLink(
    userId: number,
    createInvoiceDto: CreateInvoiceDto,
  ): Promise<{ link: string }> {
    const user = await this.userRepository.findOne({
      where: { telegram_id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    // Получаем информацию об апгрейде
    const userUpgrade = await this.userUpgradeRepository.findOne({
      where: {
        user: { telegram_id: userId },
        upgrade: { upgrade_id: createInvoiceDto.upgrade_id },
      },
    });
    if (!userUpgrade) throw new NotFoundException('Upgrade not found');

    const now = new Date();
    const maxTime = 7200; // 2 часа
    const minCost = 1;
    const maxCost = 150;

    let amount = minCost;
    if (userUpgrade.cooldown_ends_at && userUpgrade.cooldown_ends_at > now) {
      const timeLeft = Math.floor(
        (userUpgrade.cooldown_ends_at.getTime() - now.getTime()) / 1000,
      );
      const ratio = Math.min(timeLeft / maxTime, 1);
      amount = Math.ceil(minCost + (maxCost - minCost) * ratio);
    }

    const payload = `upgrade_skip_${createInvoiceDto.description}_${userId}_${createInvoiceDto.upgrade_id}`;
    const endpoint =
      process.env.BOT_ENV === 'development'
        ? `${this.telegramApiUrl}/test/createInvoiceLink`
        : `${this.telegramApiUrl}/createInvoiceLink`;

    try {
      const response = await firstValueFrom(
        this.httpService.post(endpoint, {
          title: 'Пропуск прокачки',
          description: createInvoiceDto.description,
          payload,
          provider_token: '',
          currency: 'XTR',
          prices: [{ label: 'Пропуск прокачки', amount }],
        }),
      );

      if (!response.data.ok) {
        throw new InternalServerErrorException(
          `Telegram API Error: ${response.data.description}`,
        );
      }

      const invoiceLink = response.data.result;
      return { link: invoiceLink };
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to create invoice link: ${error.message}`,
      );
    }
  }

  async confirmInvoice({
    userId,
    amount,
    externalId,
    description,
  }: {
    userId: number;
    amount: number;
    externalId: string;
    description: string;
  }): Promise<void> {
    const [, , upgradeId] = description.split('_'); // Ожидаем формат payload с upgrade_id
    const upgrade_id = parseInt(upgradeId, 10);

    const userUpgrade = await this.userUpgradeRepository.findOne({
      where: { user: { telegram_id: userId }, upgrade: { upgrade_id } },
      relations: ['user', 'upgrade'],
    });

    if (!userUpgrade) {
      throw new NotFoundException('Upgrade not found for this user');
    }

    // Обновляем статус инвойса и сбрасываем кулдаун
    userUpgrade.cooldown_ends_at = null;

    await this.userUpgradeRepository.save(userUpgrade);

    // Записываем подтверждение в БД (если нужно)
    const invoice = this.invoiceRepository.create({
      amount,
      currency: 'XTR',
      externalId,
      description,
      user: { telegram_id: userId },
      status: 'paid',
    });
    await this.invoiceRepository.save(invoice);
  }
}
