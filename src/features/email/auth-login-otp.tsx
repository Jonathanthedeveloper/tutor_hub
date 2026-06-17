import {
    Heading,
    Section,
    Text,
} from "@react-email/components";
import { Shell } from "./components/shell";

interface AuthLoginOtpProps {
    code?: string;
}

export function AuthLoginOtp({ code = "123456" }: AuthLoginOtpProps) {
    return (
        <Shell preview={`Your Whales Hub two-factor authentication code is ${code}`}>
            <Section className="px-8 py-6">
                <Heading className="text-text text-[24px] font-normal text-center p-0 my-[20px] mx-0">
                    Two-Factor Verification Code
                </Heading>

                <Text className="text-text text-[14px] leading-[24px]">
                    A sign-in request was made for your Whales Hub account. Enter the following verification code to complete your login. This code is valid for 3 minutes.
                </Text>

                <Section className="bg-[#f3f4f6] rounded-lg my-6 py-4 text-center">
                    <Text className="text-brand text-[36px] font-bold tracking-[8px] my-0 mx-auto w-fit">
                        {code}
                    </Text>
                </Section>

                <Text className="text-muted text-[12px] leading-[20px] mt-4">
                    If you did not attempt to sign in to your account, please ignore this email or contact support if you suspect unauthorized access.
                </Text>
            </Section>
        </Shell>
    );
}

export default AuthLoginOtp;
