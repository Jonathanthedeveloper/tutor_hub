import {
    Heading,
    Section,
    Text
} from "@react-email/components";
import { Shell } from "./components/shell";

interface AuthPasswordChangedProps {
    firstName?: string;
}

export function AuthPasswordChanged({ firstName = "Trader" }: AuthPasswordChangedProps) {
    return (
        <Shell preview="Your Whales Hub password was successfully changed">
            <Section className="px-8 py-6">
                <Heading className="text-text text-[20px] font-bold text-center p-0 my-[20px] mx-0">
                    Password Updated Successfully
                </Heading>

                <Text className="text-text text-[14px] leading-[24px]">
                    Hi {firstName},
                </Text>
                <Text className="text-text text-[14px] leading-[24px]">
                    The password for your Whales Hub account has been successfully changed.
                </Text>

                <Text className="text-text text-[14px] leading-[24px] mt-4 font-semibold">
                    If you did not make this change, please contact our support team immediately to secure your account.
                </Text>
            </Section>
        </Shell>
    );
}

export default AuthPasswordChanged;