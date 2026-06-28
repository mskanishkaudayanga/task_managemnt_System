import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { apiClient } from "../../lib/api-client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { useToast } from "../../components/ui/toast";
import { UserPlus } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["USER", "ADMIN"]),
});

type RegisterFields = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "USER",
    },
  });

  const onSubmit = async (data: RegisterFields) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post("/auth/register", data) as any;
      if (response && response.success) {
        success("Registration successful!", "Your account has been created. Please sign in.");
        navigate("/login");
      }
    } catch (err: any) {
      error("Registration failed", err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fc] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md animate-fade-in"
      >
        <div className="text-center mb-6">
          <div className="inline-flex bg-[#a6c2fa] text-[#0f172a] h-12 w-12 rounded-2xl items-center justify-center font-bold text-xl shadow-subtle mb-3">
            TL
          </div>
          <h2 className="text-2xl font-bold text-[#0f172a]">Create an account</h2>
          <p className="text-sm text-[#64748b] mt-1">Get started with task management today</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-elevation p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#0f172a] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <Input
                type="text"
                placeholder="John Doe"
                {...register("name")}
                className={errors.name ? "border-red-300 focus:ring-red-200" : ""}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#0f172a] uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <Input
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className={errors.email ? "border-red-300 focus:ring-red-200" : ""}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-[#0f172a] uppercase tracking-wider mb-1.5">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className={errors.password ? "border-red-300 focus:ring-red-200" : ""}
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Role Select */}
            <div>
              <label className="block text-xs font-semibold text-[#0f172a] uppercase tracking-wider mb-1.5">
                Workspace Role
              </label>
              <Select {...register("role")}>
                <option value="USER">Standard User (Work on assigned tasks)</option>
                <option value="ADMIN">Administrator (Create and assign tasks)</option>
              </Select>
              {errors.role && (
                <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {isSubmitting ? "Creating account..." : "Register"}
            </Button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-6 pt-4 border-t border-slate-100">
            <span className="text-xs text-[#64748b]">Already have an account? </span>
            <Link
              to="/login"
              className="text-xs font-semibold text-[#64748b] hover:text-[#0f172a] hover:underline"
            >
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
