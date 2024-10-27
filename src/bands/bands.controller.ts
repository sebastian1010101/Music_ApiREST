import { Controller, Post } from '@nestjs/common';
import { CreateBandDto } from './dto/create-band.dto';
import { BandServices } from './bands.service';

@Controller('bands')
export class BandsController {
  constructor(private readonly bandService: BandServices) {}

  @Post()
  public create(body: CreateBandDto) {
    return this.bandService.create(body);
  }
}
