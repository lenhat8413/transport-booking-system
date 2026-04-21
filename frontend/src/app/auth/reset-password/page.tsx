"use client";

import { useState } from "react";
import {
	Eye,
	EyeOff,
	ArrowLeft,
	CheckCircle,
	AlertCircle,
	Loader2,
  CornerDownLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import config from "@/config";

export default function ResetPasswordPage() {
	const router = useRouter();
	const [contact, setContact] = useState("");
	const [otp, setOtp] = useState("");
	const [new_password, setNewPassword] = useState("");
	const [confirm_password, setConfirmPassword] = useState("");
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [loading, setLoading] = useState(false);
	const [toast, setToast] = useState<{
		message: string;
		type: "success" | "error";
	} | null>(null);
	const [errors, setErrors] = useState<{
		contact?: boolean;
		otp?: boolean;
		new?: boolean;
		confirm?: boolean;
	}>({});

	const validateFormat = (value: string) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
		return emailRegex.test(value) || phoneRegex.test(value);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrors({});
		let hasError = false;
		let errorMessage = "";

		const contactValue = contact.trim();

		if (!contactValue) {
			setErrors((prev) => ({ ...prev, contact: true }));
			errorMessage = "Vui lòng nhập email hoặc số điện thoại.";
			hasError = true;
		} else if (!validateFormat(contactValue)) {
			setErrors((prev) => ({ ...prev, contact: true }));
			errorMessage =
				"Dữ liệu không hợp lệ. Vui lòng nhập đúng định dạng email hoặc số điện thoại.";
			hasError = true;
		}

		if (!otp || otp.length < 6) {
			setErrors((prev) => ({ ...prev, otp: true }));
			errorMessage = "Mã xác thực không hợp lệ.";
			hasError = true;
		}

		if (!new_password || new_password.length < 6) {
			setErrors((prev) => ({ ...prev, new: true }));
			if (!hasError) errorMessage = "Mật khẩu mới phải có ít nhất 6 ký tự.";
			hasError = true;
		}

		if (!confirm_password) {
			setErrors((prev) => ({ ...prev, confirm: true }));
			if (!hasError) errorMessage = "Vui lòng xác nhận mật khẩu.";
			hasError = true;
		} else if (new_password !== confirm_password) {
			setErrors({ new: true, confirm: true });
			errorMessage = "Mật khẩu xác nhận không khớp.";
			hasError = true;
		}

		if (hasError) {
			showToast(errorMessage, "error");
			return;
		}

		setLoading(true);

		try {
			const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue);
			const payload = isEmail 
				? { email: contactValue, otp, new_password, confirm_password } 
				: { phone: contactValue, otp, new_password, confirm_password };

			const response = await axios.post(
				`${config.apiBaseUrl}/auth/reset-password`,
				payload
			);

			if (response.status === 200) {
				showToast(
					"Đổi mật khẩu thành công! Bạn có thể đăng nhập ngay bây giờ.",
					"success",
				);
				setContact("");
				setOtp("");
				setNewPassword("");
				setConfirmPassword("");

				setTimeout(() => {
					router.push("/auth/login");
				}, 1500);
			}
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			if (error.response?.status === 400 || error.response?.status === 404) {
				showToast(error.response?.data?.message || "Thông tin không hợp lệ. Vui lòng kiểm tra lại.", "error");
			} else {
				showToast(error.response?.data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại sau.", "error");
			}
		} finally {
			setLoading(false);
		}
	};

	const showToast = (message: string, type: "success" | "error") => {
		setToast({ message, type });
		setTimeout(() => setToast(null), 5000);
	};

	return (
		<div className="flex min-h-screen w-full overflow-hidden bg-white text-[#202124] font-sans">
			{/* Left Side: Form */}
			<div className="flex-1 flex justify-center items-center p-6 md:p-10 relative z-10 bg-white">
				<div className="w-full max-w-[420px] opacity-0 animate-[fadeUp_0.7s_cubic-bezier(0.16,1,0.3,1)_forwards]">
					<div className="mb-8">
						<svg
							width="40"
							height="40"
							viewBox="0 0 40 40"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<rect width="40" height="40" rx="10" fill="url(#paint0_linear)" />
							<path d="M14 20L20 12L26 20H14Z" fill="white" />
							<path d="M14 28L20 20L26 28H14Z" fill="white" fillOpacity="0.8" />
							<defs>
								<linearGradient
									id="paint0_linear"
									x1="0"
									y1="0"
									x2="40"
									y2="40"
									gradientUnits="userSpaceOnUse"
								>
									<stop stopColor="#1A73E8" />
									<stop offset="1" stopColor="#1557B0" />
								</linearGradient>
							</defs>
						</svg>
					</div>

					<h1 className="text-[2.25rem] md:text-[2rem] font-bold mb-3 tracking-tight text-[#202124]">
						Đặt lại mật khẩu
					</h1>
					<p className="text-[#5F6368] text-[1.05rem] mb-10 leading-[1.6]">
						Vui lòng tạo một mật khẩu mới an toàn cho tài khoản của bạn.
					</p>

					<form
						onSubmit={handleSubmit}
						className="flex flex-col gap-5"
						noValidate
					>
						<div className="flex flex-col gap-2">
							<label
								htmlFor="contact"
								className="text-[0.9rem] font-semibold text-[#202124]"
							>
								Email hoặc số điện thoại
							</label>
							<div className="relative w-full">
								<input
									type="text"
									id="contact"
									name="contact"
									placeholder="Nhập email hoặc số điện thoại..."
									value={contact}
									onChange={(e) => {
										setContact(e.target.value);
										setErrors((prev) => ({ ...prev, contact: false }));
										setToast(null);
									}}
									disabled={loading}
									autoComplete="off"
									className={`w-full px-5 py-4 border-[1.5px] rounded-xl text-base outline-none transition-all duration-250
                    ${
											errors.contact
												? "border-[#C5221F] bg-[#FFF8F7] focus:shadow-[0_0_0_4px_rgba(197,34,31,0.15)] animate-[shake_0.4s_ease-in-out]"
												: "border-[#DADCE0] bg-[#FAFAFA] hover:border-[#BDBDBD] focus:border-[#1A73E8] focus:bg-white focus:shadow-[0_0_0_4px_rgba(26,115,232,0.15)] placeholder:text-[#9AA0A6]"
										}
                  `}
								/>
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<label
								htmlFor="otp"
								className="text-[0.9rem] font-semibold text-[#202124]"
							>
								Mã xác thực (OTP)
							</label>
							<div className="relative w-full">
								<input
									type="text"
									id="otp"
									name="otp"
									placeholder="Nhập mã OTP (6 chữ số)..."
									value={otp}
									onChange={(e) => {
										setOtp(e.target.value);
										setErrors((prev) => ({ ...prev, otp: false }));
										setToast(null);
									}}
									required
									className={`w-full px-5 py-4 border-[1.5px] rounded-xl text-base outline-none transition-all duration-250
                    ${
											errors.otp
												? "border-[#C5221F] bg-[#FFF8F7] focus:shadow-[0_0_0_4px_rgba(197,34,31,0.15)] animate-[shake_0.4s_ease-in-out]"
												: "border-[#DADCE0] bg-[#FAFAFA] hover:border-[#BDBDBD] focus:border-[#1A73E8] focus:bg-white focus:shadow-[0_0_0_4px_rgba(26,115,232,0.15)] placeholder:text-[#9AA0A6]"
										}
                  `}
								/>
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<label
								htmlFor="newPassword"
								className="text-[0.9rem] font-semibold text-[#202124]"
							>
								Mật khẩu mới
							</label>
							<div className="relative w-full">
								<input
									type={showNewPassword ? "text" : "password"}
									id="newPassword"
									name="newPassword"
									placeholder="Nhập mật khẩu mới..."
									value={new_password}
									onChange={(e) => {
										setNewPassword(e.target.value);
										setErrors((prev) => ({ ...prev, new: false }));
										setToast(null);
									}}
									required
									className={`w-full px-5 py-4 border-[1.5px] rounded-xl text-base outline-none transition-all duration-250 pr-12
                    ${
											errors.new
												? "border-[#C5221F] bg-[#FFF8F7] focus:shadow-[0_0_0_4px_rgba(197,34,31,0.15)] animate-[shake_0.4s_ease-in-out]"
												: "border-[#DADCE0] bg-[#FAFAFA] hover:border-[#BDBDBD] focus:border-[#1A73E8] focus:bg-white focus:shadow-[0_0_0_4px_rgba(26,115,232,0.15)] placeholder:text-[#9AA0A6]"
										}
                  `}
								/>
								<button
									type="button"
									onClick={() => setShowNewPassword(!showNewPassword)}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5F6368] hover:text-[#1A73E8] p-1 flex items-center justify-center transition-colors outline-none"
									aria-label="Hiện mật khẩu"
								>
									{showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
								</button>
							</div>
						</div>

						<div className="flex flex-col gap-2">
							<label
								htmlFor="confirmPassword"
								className="text-[0.9rem] font-semibold text-[#202124]"
							>
								Xác nhận mật khẩu mới
							</label>
							<div className="relative w-full">
								<input
									type={showConfirmPassword ? "text" : "password"}
									id="confirmPassword"
									name="confirmPassword"
									placeholder="Nhập lại mật khẩu mới..."
									value={confirm_password}
									onChange={(e) => {
										setConfirmPassword(e.target.value);
										setErrors((prev) => ({ ...prev, confirm: false }));
										setToast(null);
									}}
									required
									className={`w-full px-5 py-4 border-[1.5px] rounded-xl text-base outline-none transition-all duration-250 pr-12
                    ${
											errors.confirm
												? "border-[#C5221F] bg-[#FFF8F7] focus:shadow-[0_0_0_4px_rgba(197,34,31,0.15)] animate-[shake_0.4s_ease-in-out]"
												: "border-[#DADCE0] bg-[#FAFAFA] hover:border-[#BDBDBD] focus:border-[#1A73E8] focus:bg-white focus:shadow-[0_0_0_4px_rgba(26,115,232,0.15)] placeholder:text-[#9AA0A6]"
										}
                  `}
								/>
								<button
									type="button"
									onClick={() => setShowConfirmPassword(!showConfirmPassword)}
									className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5F6368] hover:text-[#1A73E8] p-1 flex items-center justify-center transition-colors outline-none"
									aria-label="Hiện mật khẩu"
								>
									{showConfirmPassword ? (
										<EyeOff size={20} />
									) : (
										<Eye size={20} />
									)}
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="mt-4 flex justify-center items-center relative overflow-hidden bg-gradient-to-br from-[#1A73E8] to-[#0d59bf] text-white border-none py-4 px-6 rounded-full text-[1.05rem] font-semibold cursor-pointer transition-transform shadow hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(26,115,232,0.3)] active:translate-y-0 active:shadow-[0_4px_10px_rgba(26,115,232,0.2)] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
						>
							{!loading ? (
								<span>Xác nhận đổi mật khẩu</span>
							) : (
								<Loader2 className="animate-spin text-white/70" size={22} />
							)}
						</button>

						{/* Notification Area */}
						<div className="flex flex-col gap-3 min-h-[48px] mt-2">
							{toast && (
								<div
									className={`p-4 rounded-xl text-[0.95rem] font-medium flex items-start gap-3 shadow-[0_4px_12px_rgba(0,0,0,0.05)] origin-top animate-[slideIn_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]
                    ${
											toast.type === "success"
												? "bg-[#E6F4EA] text-[#137333] border border-[#9CE0A9]"
												: "bg-[#FCE8E6] text-[#C5221F] border border-[#F6A39E]"
										}
                  `}
								>
									{toast.type === "success" ? (
										<CheckCircle size={20} className="shrink-0 mt-0.5" />
									) : (
										<AlertCircle size={20} className="shrink-0 mt-0.5" />
									)}
									<span>{toast.message}</span>
								</div>
							)}
						</div>
					</form>

					<div className="flex justify-center mt-10">
						<Link
							href="/auth/login"
							className="inline-flex items-center gap-2 text-[#1A73E8] hover:text-[#1557B0] hover:bg-[#1A73E8]/5 font-semibold text-[0.95rem] transition-colors py-2 px-4 rounded-lg group"
						>
							<ArrowLeft
								size={20}
								className="transition-transform group-hover:-translate-x-1"
							/>
							Quay lại đăng nhập
						</Link>
					</div>
				</div>
			</div>

			{/* Right Side: Image Montage */}
			<div className="hidden md:block flex-[1.2] bg-[#F8F9FA] relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 w-full h-full" />
				<div className="absolute inset-0 animate-[scaleIn_20s_linear_infinite_alternate]">
					<Image
						src="/travel_illustration.png"
						alt="Travel and Monuments Illustration"
						fill
						className="object-cover"
						priority
					/>
				</div>
				<div className="absolute bottom-12 left-12 right-12 z-20 text-white opacity-0 animate-[fadeUp_1s_ease_0.5s_forwards]">
					<h2 className="text-[2.5rem] font-bold mb-3 leading-[1.2] drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
						Khám phá thế giới cùng chúng tôi
					</h2>
					<p className="text-[1.15rem] opacity-90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)]">
						Khôi phục quyền truy cập và tiếp tục hành trình của bạn.
					</p>
				</div>
			</div>

			<style
				dangerouslySetInnerHTML={{
					__html: `
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes scaleIn {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
      `,
				}}
			/>
		</div>
	);
}
