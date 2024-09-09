import {authMiddleware} from "@clerk/nextjs/server";

export default authMiddleware({
    publicRoutes: [
        '/',
        '/api/clerk-webhook',
        '/api/drive-activity/notification',
        '/api/payment/success',
        '/api/ai/superagent/getoutput',
        '/api/ai/FLUX-image',
        '/api/ai/fal/flux-dev',
        '/api/ai/fal/flux-general',
        '/api/ai/fal/flux-lora',
        '/api/ai/fal/image-to-image',
        '/api/ai/fal/stable-video',
        '/api/ai/fal/train-flux',
        '/api/ai/replicate/consistent-character',
        '/api/ai/replicate/dreamshaper',
        '/api/ai/replicate/fluxDevlora',
        '/api/ai/openai'
    ],
    ignoredRoutes: [
        '/api/auth/callback/discord',
        '/api/auth/callback/notion',
        '/api/auth/callback/slack',
        '/api/flow',
        '/api/cron/wait',
    ],
})

export const config = {
    matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}

// https://www.googleapis.com/auth/userinfo.email
// https://www.googleapis.com/auth/userinfo.profile
// https://www.googleapis.com/auth/drive.activity.readonly
// https://www.googleapis.com/auth/drive.metadata
// https://www.googleapis.com/auth/drive.readonly