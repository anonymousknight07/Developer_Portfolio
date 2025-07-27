import { type SchemaTypeDefinition } from "sanity";
import { blogType } from "./blogType";
import { musicType } from "./musicType";
import { blockContentType } from "./blockContentType";
import { categoryType } from "./categoryType";
import { authorType } from "./authorType";
import { postType } from "./postType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blogType,
    musicType,
    blockContentType,
    categoryType,
    authorType,
    postType,
  ],
};
