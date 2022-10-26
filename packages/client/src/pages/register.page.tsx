import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { object, string, TypeOf } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import FormInput from "../components/FormInput";
import { LoadingButton } from "../components/LoadingButton";
import { toast } from "react-toastify";
import { trpc } from "../trpc";
import FileUpLoader from "../components/FileUpload";

const registerSchema = object({
  name: string().min(1, "Full name is required").max(100),
  email: string()
    .min(1, "Email address is required")
    .email("Email Address is invalid"),
  photo: string().min(1, "Photo is required").url("Photo URL is invalid"),
  password: string()
    .min(1, "Password is required")
    .min(8, "Password must be more than 8 characters")
    .max(32, "Password must be less than 32 characters"),
  passwordConfirm: string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "Passwords do not match",
});

export type RegisterInput = TypeOf<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();

  const { isLoading, mutate: SignUpUser } = trpc.registerUser.useMutation({
    onSuccess: (data) => {
      toast.success("Registration successful");
      navigate("/login");
    },
    onError: (error) => {
      toast.error(error.message, {
        type: "error",
        position: "top-right",
      });
    },
  });

  const methods = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitSuccessful },
  } = methods;

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitSuccessful]);

  const onSubmitHandler: SubmitHandler<RegisterInput> = (values) => {
    // 👇 Execute the Mutation
    SignUpUser(values);
  };

  return (
    <section className="py-8 bg-ct-blue-600 min-h-screen grid place-items-center">
      <div className="w-full">
        <h1 className="text-4xl xl:text-6xl text-center font-[600] text-ct-yellow-600 mb-4">
          Welcome to CodevoWeb!
        </h1>
        <h2 className="text-lg text-center mb-4 text-ct-dark-200">
          Sign Up To Get Started!
        </h2>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmitHandler)}
            className="max-w-md w-full mx-auto overflow-hidden shadow-lg bg-ct-dark-200 rounded-2xl p-8 space-y-5"
          >
            <FormInput label="Full Name" name="name" />
            <FormInput label="Email" name="email" type="email" />
            <FormInput label="Password" name="password" type="password" />
            <FormInput
              label="Confirm Password"
              name="passwordConfirm"
              type="password"
            />
            <FileUpLoader name="photo" />
            <span className="block">
              Already have an account?{" "}
              <Link to="/login" className="text-ct-blue-600">
                Login Here
              </Link>
            </span>
            <LoadingButton loading={isLoading} textColor="text-ct-blue-600">
              Sign Up
            </LoadingButton>
          </form>
        </FormProvider>
      </div>
    </section>
  );
};

export default RegisterPage;
