import {
    Heading,
    Section,
    Text,
} from "@react-email/components";
import { format } from "date-fns";
import { Shell } from "./components/shell";

interface AuthLoginNotificationProps {
    firstName?: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    timestamp?: Date | null;
}

export function AuthLoginNotification({
    firstName = "Trader",
    ipAddress = "Unknown IP",
    userAgent = "Unknown Device",
    timestamp,
}: AuthLoginNotificationProps) {
    const formattedDate = timestamp
        ? format(new Date(timestamp), "PPpp")
        : format(new Date(), "PPpp");

    const browserDevice = userAgent
        ? userAgent.split("(")[0].trim()
        : "Unknown Device";

    return (
        <Shell preview="New sign-in detected on your Whales Hub account">
            <Section className="px-8 py-6">
                <Heading className="text-text text-[20px] font-bold text-center p-0 my-[20px] mx-0">
                    New Sign-in Detected
                </Heading>

                <Text className="text-text text-[14px] leading-[24px]">
                    Hi {firstName},
                </Text>
                <Text className="text-text text-[14px] leading-[24px]">
                    We detected a successful sign-in to your Whales Hub account. Below are the details of the session:
                </Text>

                <Section className="bg-[#f9fafb] border border-solid border-[#e5e7eb] rounded-lg p-4 my-6">
                    <Text className="text-text text-[13px] my-1">
                        <strong>Device/Browser:</strong> {browserDevice}
                    </Text>
                    <Text className="text-text text-[13px] my-1">
                        <strong>IP Address:</strong> {ipAddress || "Unknown IP"}
                    </Text>
                    <Text className="text-text text-[13px] my-1">
                        <strong>Date & Time:</strong> {formattedDate}
                    </Text>
                </Section>

                <Text className="text-text text-[14px] leading-[24px] mt-4 font-semibold text-destructive">
                    If you did not make this login, please contact our support team immediately and secure your password.
                </Text>
            </Section>
        </Shell>
    );
}

export default AuthLoginNotification;
