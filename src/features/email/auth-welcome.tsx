import {
    Button,
    Heading,
    Section,
    Text,
} from "@react-email/components";
import { Shell } from "./components/shell";
import { getEmailBaseUrl } from "./components/utils";

interface AuthWelcomeProps {
    firstName?: string;
}

export function AuthWelcome({ firstName = "Trader" }: AuthWelcomeProps) {
    const baseUrl = getEmailBaseUrl();

    return (
        <Shell preview="Welcome to Whales Hub! Your trading journey starts here.">
            <Section className="px-8 py-6">
                <Heading className="text-text text-[24px] font-normal text-center p-0 my-[20px] mx-0">
                    Welcome to <strong>Whales Hub</strong>!
                </Heading>

                <Text className="text-text text-[14px] leading-[24px]">
                    Hi {firstName},
                </Text>
                <Text className="text-text text-[14px] leading-[24px]">
                    We're excited to have you on board. Whether you're managing trading accounts, tracking positions, or executing trades, Whales Hub gives you the tools to trade with confidence.
                </Text>

                <Section className="text-center mt-[32px] mb-[32px]">
                    <Button
                        className="bg-brand rounded-lg text-white text-[14px] font-bold no-underline text-center px-6 py-3"
                        href={`${baseUrl}/app`}
                    >
                        Go to Dashboard
                    </Button>
                </Section>

                <Text className="text-text text-[14px] leading-[24px]">
                    If you have any questions, our support team is always here to help.
                </Text>
            </Section>
        </Shell>
    );
}

export default AuthWelcome;