import { IsOptional, IsString, IsNumber, IsEnum } from 'class-validator';

export enum SearchType {
  ALL = 'all',
  HOSPITALS = 'hospitals',
  DOCTORS = 'doctors',
  SYMPTOMS = 'symptoms',
}

export enum SortBy {
  RELEVANCE = 'relevance',
  RATING = 'rating',
  FEE = 'fee',
  POPULARITY = 'popularity',
}

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @IsEnum(SearchType)
  type?: SearchType = SearchType.ALL;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsNumber()
  minFee?: number;

  @IsOptional()
  @IsNumber()
  maxFee?: number;

  @IsOptional()
  @IsNumber()
  minRating?: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  radius?: number = 10;

  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.RELEVANCE;
}
