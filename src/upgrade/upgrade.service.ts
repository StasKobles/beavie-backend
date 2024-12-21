import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Upgrade } from './upgrade.entity';
import { UpgradeTranslation } from './upgrade_translations.entity';
import { Locale } from 'src/user/user.entity';

interface UpgradeWithTranslations extends Upgrade {
  name: string;
  description: string;
}

@Injectable()
export class UpgradeService {
  constructor(
    @InjectRepository(Upgrade)
    private readonly upgradeRepository: Repository<Upgrade>,
    @InjectRepository(UpgradeTranslation)
    private readonly translationRepository: Repository<UpgradeTranslation>,
  ) {}

  async findAll(locale: Locale): Promise<UpgradeWithTranslations[]> {
    const upgrades = await this.upgradeRepository.find();

    const translatedUpgrades = await Promise.all(
      upgrades.map(async (upgrade) => {
        const translation = await this.translationRepository.findOne({
          where: { upgrade: { upgrade_id: upgrade.upgrade_id }, locale },
        });

        return {
          ...upgrade,
          name: translation ? translation.name : 'Default Name',
          description: translation
            ? translation.description
            : 'Default Description',
        };
      }),
    );

    return translatedUpgrades;
  }
}
