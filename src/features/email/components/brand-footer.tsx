import { Section, Text } from '@react-email/components'

export function BrandFooter() {
    return (
        <Section className="bg-[#f3f4f6] px-6 py-8 mt-8 border-t border-[#e5e7eb]">
            <Text className="text-[#6b7280] text-[12px] leading-5 text-center mt-0 mb-4">
                &copy; {new Date().getFullYear()} Whales Hub. All rights reserved.
            </Text>

            <Text className="text-[#6b7280] text-[12px] leading-5 text-center mt-0 mb-0">
                You are receiving this email because you signed up for Whales Hub.
            </Text>
        </Section>
    )
}