import Toast from "@/components/RoyToast";

export default function toast(message = "", type = "warning", duration = 3000) {
  Toast({
    status: type,
    message: message,
    duration: duration,
  });
}
