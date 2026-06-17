import {
    Heading,
    Section,
    Text,
} from "@react-email/components";
import { Shell } from "./components/shell";

interface AuthVerificationOtpProps {
    code?: string;
}

export function AuthVerificationOtp({ code = "123456" }: AuthVerificationOtpProps) {
    return (
        <Shell preview={`Your Whales Hub verification code is ${code}`}>
            <Section className="px-8 py-6">
                <Heading className="text-text text-[24px] font-normal text-center p-0 my-[20px] mx-0">
                    Confirm your email
                </Heading>

                <Text className="text-text text-[14px] leading-[24px]">
                    Enter the following verification code to verify your identity. This code expires in 10 minutes.
                </Text>

                <Section className="bg-[#f3f4f6] rounded-lg my-6 py-4 text-center">
                    <Text className="text-brand text-[36px] font-bold tracking-[8px] my-0 mx-auto w-fit">
                        {code}
                    </Text>
                </Section>

                <Text className="text-muted text-[12px] leading-[20px] mt-4">
                    If you didn't request this email, there's nothing to worry about — you can safely ignore it.
                </Text>
            </Section>
        </Shell>
    );
}

export default AuthVerificationOtp;