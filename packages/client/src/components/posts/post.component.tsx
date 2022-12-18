import React, { FC, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { twMerge } from "tailwind-merge";
import { IPost } from "../../lib/types";
import { toast } from "react-toastify";
import useStore from "../../store";
import PostModal from "../modals/post.modal";
import UpdatePost from "./update.post";
import { trpc } from "../../trpc";
import { useQueryClient } from "@tanstack/react-query";

type PostItemProps = {
  post: IPost;
};

const PostItem: FC<PostItemProps> = ({ post }) => {
  const [openMenu, setOpenMenu] = useState(false);
  const [openPostModal, setOpenPostModal] = useState(false);
  const store = useStore();
  const queryClient = useQueryClient();
  const { isLoading, mutate: deletePost } = trpc.deletePost.useMutation({
    onSuccess(data) {
      store.setPageLoading(false);
      queryClient.refetchQueries([["getPosts"]]);
      toast("Post deleted successfully", {
        type: "success",
        position: "top-right",
      });
    },
    onError(error: any) {
      store.setPageLoading(false);
      toast(error.message, {
        type: "error",
        position: "top-right",
      });
    },
  });

  useEffect(() => {
    if (isLoading) {
      store.setPageLoading(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const toggleMenu = () => {
    setOpenMenu(!openMenu);
  };

  const onDeleteHandler = (id: string) => {
    toggleMenu();
    if (window.confirm("Are you sure")) {
      deletePost({ postId: id });
    }
  };
  return (
    <>
      <div
        className="rounded-md shadow-md bg-white"
        onClick={() => toggleMenu()}
      >
        <div className="mx-2 mt-2 overflow-hidden rounded-md">
          <img
            src={post.image}
            alt={post.title}
            className="object-fill w-full h-full"
          />
        </div>
        <div className="p-4">
          <h5 className="font-semibold text-xl text-[#4d4d4d] mb-4">
            {post.title.length > 25
              ? post.title.substring(0, 25) + "..."
              : post.title}
          </h5>
          <div className="flex items-center mt-4">
            <p className="p-1 rounded-sm mr-4 bg-[#dad8d8]">{post.category}</p>
            <p className="text-[#ffa238]">
              {format(parseISO(post.createdAt), "PPP")}
            </p>
          </div>
        </div>
        <div className="flex justify-between items-center px-4 pb-4">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full overflow-hidden">
              <img
                src={post.user.photo}
                alt={post.user.name}
                className="object-cover w-full h-full"
              />
            </div>
            <p className="ml-4 text-sm font-semibold">{post.user.name}</p>
          </div>
          <div className="relative">
            <div
              className="text-3xl text-[#4d4d4d] cursor-pointer p-3"
              onClick={toggleMenu}
            >
              <i className="bx bx-dots-horizontal-rounded"></i>
            </div>
            <ul
              className={twMerge(
                `absolute bottom-5 -right-1 z-50 py-2 rounded-sm bg-white shadow-lg transition ease-out duration-300 invisible`,
                `${openMenu ? "visible" : "invisible"}`
              )}
            >
              <li
                className="w-24 h-7 py-3 px-2 hover:bg-[#f5f5f5] flex items-center gap-2 cursor-pointer transition ease-in duration-300"
                onClick={() => {
                  setOpenPostModal(true);
                  toggleMenu();
                }}
              >
                <i className="bx bx-edit-alt"></i> <span>Edit</span>
              </li>
              <li
                className="w-24 h-7 py-3 px-2 hover:bg-[#f5f5f5] flex items-center gap-2 cursor-pointer transition ease-in duration-300"
                onClick={() => onDeleteHandler(post._id)}
              >
                <i className="bx bx-trash"></i> <span>Delete</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <PostModal
        openPostModal={openPostModal}
        setOpenPostModal={setOpenPostModal}
      >
        <UpdatePost post={post} setOpenPostModal={setOpenPostModal} />
      </PostModal>
    </>
  );
};

export default PostItem;
