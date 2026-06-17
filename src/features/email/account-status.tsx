import {
    Heading,
    Section,
    Text,
} from "@react-email/components";
import { Shell } from "./components/shell";

interface AccountStatusProps {
    firstName?: string;
    action?: "banned" | "unbanned" | "role_change";
    reason?: string;
}

export function AccountStatus({
    firstName = "User",
    action = "banned",
    reason,
}: AccountStatusProps) {
    const isBanned = action === "banned"
    const isUnbanned = action === "unbanned"
    const isRoleChange = action === "role_change"

    const title = isBanned
        ? "Account Suspended"
        : isUnbanned
            ? "Account Reactivated"
            : "Account Role Updated"

    const preview = isBanned
        ? "Your account has been suspended"
        : isUnbanned
            ? "Your account has been reactivated"
            : "Your account role has been updated"

    return (
        <Shell preview={preview}>
            <Section className="px-8 py-6">
                <Heading className="text-text text-[20px] font-bold text-center p-0 my-[20px] mx-0">
                    {title}
                </Heading>

                <Text className="text-text text-[14px] leading-[24px]">
                    Hi {firstName},
                </Text>

                {isBanned && (
                    <Text className="text-text text-[14px] leading-[24px]">
                        Your account has been suspended. You will no longer be able to log in or access any trading features.
                        {reason && (
                            <><br /><strong>Reason:</strong> {reason}</>
                        )}
                    </Text>
                )}

                {isUnbanned && (
                    <Text className="text-text text-[14px] leading-[24px]">
                        Your account has been reactivated. You can now log in and resume trading.
                    </Text>
                )}

                {isRoleChange && (
                    <Text className="text-text text-[14px] leading-[24px]">
                        Your account role has been updated. This may affect the features and permissions available to you.
                    </Text>
                )}

                <Text className="text-muted text-[12px] leading-[20px] mt-6">
                    If you believe this was a mistake, please contact our support team.
                </Text>
            </Section>
        </Shell>
    );
}

export default AccountStatus;