import { Field, ObjectType, InputType } from "type-graphql";

@InputType()
export class SelectorConfigInput {
  @Field()
  selector!: string;

  @Field()
  selectorType!: "css" | "xpath";

  @Field(() => [String])
  attributes!: string[];

  @Field()
  name!: string;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
export class ScrapingResult {
  @Field()
  success!: boolean;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => [[String]])
  results!: string[][];
}

@ObjectType()
export class ScrapingResponse {
  @Field(() => ScrapingResult)
  data!: ScrapingResult;
} 
