import React, { FC, useEffect } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { object, string, TypeOf } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FileUpLoader from "../FileUpload";
import { LoadingButton } from "../LoadingButton";
import TextInput from "../TextInput";
import { toast } from "react-toastify";
import useStore from "../../store";
import { IPost } from "../../lib/types";
import { trpc } from "../../trpc";
import { useQueryClient } from "@tanstack/react-query";

type IUpdatePostProps = {
  post: IPost;
  setOpenPostModal: (openPostModal: boolean) => void;
};

const updatePostSchema = object({
  title: string().min(1, "Title is required"),
  category: string().min(1, "Category is required"),
  content: string().min(1, "Content is required"),
  image: string().min(1, "Image is required"),
});

type UpdatePostInput = TypeOf<typeof updatePostSchema>;

const UpdatePost: FC<IUpdatePostProps> = ({ post, setOpenPostModal }) => {
  const queryClient = useQueryClient();
  const store = useStore();
  const { isLoading, mutate: updatePost } = trpc.updatePost.useMutation({
    onSuccess(data) {
      store.setPageLoading(false);
      setOpenPostModal(false);
      queryClient.refetchQueries([["getPosts"]]);
      toast("Post updated successfully", {
        type: "success",
        position: "top-right",
      });
    },
    onError(error: any) {
      store.setPageLoading(false);
      setOpenPostModal(false);
      toast(error.message, {
        type: "error",
        position: "top-right",
      });
    },
  });
  const methods = useForm<UpdatePostInput>({
    resolver: zodResolver(updatePostSchema),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (isLoading) {
      store.setPageLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  useEffect(() => {
    if (post) {
      methods.reset(post);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmitHandler: SubmitHandler<UpdatePostInput> = async (data) => {
    updatePost({ body: data, params: { postId: post._id } });
  };
  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Update Post</h2>
      <FormProvider {...methods}>
        <form className="w-full" onSubmit={handleSubmit(onSubmitHandler)}>
          <TextInput name="title" label="Title" />
          <TextInput name="category" label="Category" />
          <div className="mb-2">
            <label className="block text-gray-700 text-lg mb-2" htmlFor="title">
              Content
            </label>
            <textarea
              className={twMerge(
                `appearance-none border border-ct-dark-200 rounded w-full py-3 px-3 text-gray-700 mb-2 leading-tight focus:outline-none`,
                `${errors.content && "border-red-500"}`
              )}
              rows={4}
              {...register("content")}
            />
            <p
              className={twMerge(
                `text-red-500 text-xs italic mb-2 invisible`,
                `${errors.content && "visible"}`
              )}
            >
              {errors.content ? errors.content.message : ""}
            </p>
          </div>
          <FileUpLoader name="image" />
          <LoadingButton loading={isLoading} textColor="text-ct-blue-600">
            Update Post
          </LoadingButton>
        </form>
      </FormProvider>
    </section>
  );
};

export default UpdatePost;
