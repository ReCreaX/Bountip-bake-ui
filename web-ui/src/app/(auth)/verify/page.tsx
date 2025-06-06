"use client";
import AssetsFiles from "@/assets";
import LoadingScreen from "@/components/Loaders/LoadingScreen";
import SuccessModal from "@/components/Modals/Auth/SuccessModal";
import AuthService from "@/services/authServices";
import { useModalStore } from "@/stores/useUIStore";
import { getCookie } from "@/utils/cookiesUtils";
import { Mail } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const VerifyPage = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const { setShowSignUpSuccessModal, showsignUpSuccessModal } = useModalStore();
  const router = useRouter();
  const authService = new AuthService();

  const user = getCookie<{ email: string; name: string }>("regUserEmail");

  const firstName = user?.name?.split(" ")[0];

  useEffect(() => {
    if (!user || !firstName) {
      router.push(`/auth?signup`);
    }
  }, [user, firstName, router]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  if (!user || !firstName) {
    return null;
  }

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("Text").slice(0, otp.length);
    if (/^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split("");
      setOtp(newOtp);
      const nextIndex =
        newOtp.length >= otp.length ? otp.length - 1 : newOtp.length;
      inputsRef.current[nextIndex]?.focus();
    }
  };
  const handleVerifyEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isOtpComplete) return;

    const otpCode = otp.join("");
    const data = {
      email: user.email,
      otp: otpCode,
    };
    const response = await authService.verifyEmail(data);
    console.log(response);
    if (response.error) {
      toast.error("Invalid OTP", {
        duration: 4000,
        position: "bottom-right",
      });
    }
    if (response.status) {
      setShowSignUpSuccessModal(true);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  return (
    <main>
      <header className="flex items-center justify-center shadow-xl py-2">
        <Image src={AssetsFiles.LogoTwo} alt="Bountip logo" />
      </header>
      <section className="flex items-center justify-center">
        <form
          onSubmit={handleVerifyEmail}
          className="flex flex-col justify-between items-center w-1/2 h-[75vh]"
        >
          <div className="flex flex-col items-center justify-center w-full flex-grow gap-4">
            <Image
              src={AssetsFiles.EmailImage}
              alt="Email verification big pics"
            />

            <h3 className="text-2xl font-bold">
              Please verify your email{" "}
              <span className="text-[#15BA5C]">Address</span>
            </h3>
            <div className="w-full">
              <h4 className="font-medium text-[19px]">Dear {firstName}</h4>
              <p className="font-normal text-base text-gray-800 leading-relaxed">
                Thank you for taking the time to register with Bountip, you are
                almost ready to get started, we have sent a 4-digit code to{" "}
                <span className="text-[#15BA5C] break-all">{user.email}</span>.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 p-4 w-full">
              <div className="flex gap-3 w-full">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e.target.value, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    ref={(el) => {
                      inputsRef.current[index] = el;
                    }}
                    className="w-full h-19 text-center text-xl border rounded-lg focus:outline-none focus:border-[#15BA5C] border-gray-300"
                  />
                ))}
              </div>
            </div>
          </div>
          <button
            disabled={!isOtpComplete}
            className={`flex items-center justify-center gap-4 bg-[#15BA5C] text-white font-bold text-xl py-3.5 rounded-[10px] hover:bg-[#13a551] w-full ${
              !isOtpComplete ? "opacity-50 cursor-not-allowed" : ""
            }`}
            type="submit"
          >
            <Mail />
            <span>Verify Email</span>
          </button>
        </form>
      </section>
      {showsignUpSuccessModal && <SuccessModal />}
    </main>
  );
};

export default VerifyPage;
