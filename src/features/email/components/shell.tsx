import {
    Body,
    Container,
    Head,
    Html,
    Preview,
    pixelBasedPreset,
    Tailwind,
} from '@react-email/components'
import { BrandFooter } from './brand-footer'
import { BrandHeader } from './brand-header'

export function Shell({
    preview,
    children,
}: {
    preview: string
    children: React.ReactNode
}) {
    return (
        <Html>
            <Head />
            <Preview>{preview}</Preview>
            <Tailwind
                config={{
                    presets: [pixelBasedPreset],
                    theme: {
                        extend: {
                            colors: {
                                brand: '#1447e6',
                                headerBg: '#111827',
                                text: '#111827',
                                muted: '#374151',
                                background: '#f9fafb',
                            },
                        },
                    },
                }}
            >
                <Body className="bg-background my-auto mx-auto font-sans px-2">
                    <Container className="border border-solid border-[#e5e7eb] rounded-xl my-[40px] mx-auto bg-white overflow-hidden">
                        <BrandHeader />
                        {children}
                        <BrandFooter />
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    )
}