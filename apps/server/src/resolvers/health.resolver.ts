import { Query, Resolver } from 'type-graphql';

@Resolver()
export class HealthResolver {
  @Query(() => String)
  health(): string {
    return 'OK';
  }
} 
