import {
  getModelForClass,
  modelOptions,
  prop,
  Ref,
} from '@typegoose/typegoose';
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

  @prop({ default: 'default-post.png' })
  image: string;

  @prop({ ref: () => User })
  user: Ref<User>;
}

// Create the post model from the Post class
const postModel = getModelForClass<typeof Post>(Post);
export default postModel;
