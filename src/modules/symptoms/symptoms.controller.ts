import { Controller, Post, Body } from '@nestjs/common';
import { SymptomsService } from './symptoms.service';
import { AnalyzeSymptomsDto } from './dto/analyze-symptoms.dto';

@Controller('symptoms')
export class SymptomsController {
  constructor(private readonly symptomsService: SymptomsService) {}

  @Post('analyze')
  analyze(@Body() analyzeSymptomsDto: AnalyzeSymptomsDto) {
    return this.symptomsService.analyze(analyzeSymptomsDto.symptoms);
  }
}