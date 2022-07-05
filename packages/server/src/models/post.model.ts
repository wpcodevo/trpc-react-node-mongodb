import { getModelForClass, modelOptions, prop } from '@typegoose/typegoose';
import type { Ref } from '@typegoose/typegoose';
import { User } from './user.model';

@modelOptions({
  schemaOptions: {
    // Add createdAt and updatedAt fields
    timestamps: true,
  },
})

// Export the Post class to be used as TypeScript type
export class Post {
  @prop({ unique: true, required: true })
  title: string;

  @prop({ required: true })
  content: string;

  @prop({ required: true })
  category: string;

  @prop({ required: true })
  image: string;

  @prop({ ref: () => User })
  user: Ref<User>;
}

// Create the post model from the Post class
const postModel = getModelForClass<typeof Post>(Post);
export default postModel;
