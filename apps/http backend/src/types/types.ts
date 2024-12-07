import {z} from "zod"

export const signupSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8),
    username:z.string().min(4)
})

export const signinSchema = z.object({
    email:z.string().email(),
    password:z.string().min(8)
})

export const sessionSchema = z.object({
    title:z.string().min(4),
    description:z.string().min(4),
    startTime:z.string().datetime(),
})