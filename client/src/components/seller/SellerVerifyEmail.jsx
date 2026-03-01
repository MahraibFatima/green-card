import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

function SellerVerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { axios, API_URL } = useAppContext();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState("loading");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get("token");

        if (!token) {
          setVerificationStatus("error");
          toast.error("Verification token is missing");
          return;
        }

        const response = await axios.get(`${API_URL}/auth/verify-email`, {
          params: { token },
        });

        if (response.data.message) {
          setVerificationStatus("success");
          toast.success(response.data.message);
          setTimeout(() => {
            navigate("/seller");
          }, 2000);
        }
      } catch (error) {
        setVerificationStatus("error");
        const errorMessage =
          error.response?.data?.message || "Email verification failed";
        toast.error(errorMessage);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate, axios, API_URL]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        {isVerifying && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Verifying your email...</p>
          </>
        )}

        {!isVerifying && verificationStatus === "success" && (
          <>
            <div className="text-green-500 text-6xl mb-4">✓</div>
            <p className="text-gray-700 text-lg font-semibold">
              Email verified successfully!
            </p>
            <p className="text-gray-600 mt-2">
              Redirecting to seller login...
            </p>
          </>
        )}

        {!isVerifying && verificationStatus === "error" && (
          <>
            <div className="text-red-500 text-6xl mb-4">✕</div>
            <p className="text-gray-700 text-lg font-semibold">
              Verification failed
            </p>
            <p className="text-gray-600 mt-2">
              The verification link may be invalid or expired.
            </p>
            <button
              onClick={() => navigate("/seller")}
              className="mt-6 bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default SellerVerifyEmail;
