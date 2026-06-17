import { Section, Text } from "@react-email/components";

export function BrandHeader() {
    return (
        <Section className="bg-headerBg px-[20px] py-[40px]">
            <Text className="text-white text-[24px] font-bold p-0 m-0">
                Whales Hub
            </Text>
        </Section>
    );
}